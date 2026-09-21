import { Response } from "express";
import { PrismaClient} from '@prisma/client';
import { AuthenticatedRequest } from "../interfaces/interfaces.js";

const prisma = new PrismaClient; // get the prisma client instance

const reviewController = 
{
	createReview: async (req:AuthenticatedRequest<{ id:string }>, res:Response) => {
		try {
			const userId = req.user!.id;
			const reviewedId = parseInt(req.params.id, 10);
			const { reviews, reviewRating } = req.body;
			
			if (isNaN(reviewedId))
				return res.status(400).json({ message: 'Invalid review identifier.' });
			if (!reviewRating || reviewRating < 1 || reviewRating > 5)
				return (res.status(400).json({ message: 'Review mark must sit in between 1 and 5' }));
			if (!reviews)
				return (res.status(400).json({ message: 'Review cannot be empty' }));
			if (userId === reviewedId)
				return (res.status(400).json({error: 'You cannot register a review for your own account'}));
			const createdReview = await prisma.$transaction(async (tx) => {
				const newReview = await tx.review.create({
					data:{
						reviewRating: reviewRating,
						reviews: reviews,
						authorId:userId, 
						reviewedUserId: reviewedId,
					},
					include: {
						reviewAuthor: {
							select:{
								id:true,
								username: true,
								name:true,
								avatar:true
							}
						}
					}
				})
				const aggregated = await tx.review.aggregate({
					where: { reviewedUserId: reviewedId, deletedAt: null},
					_avg: { reviewRating: true },
					_count: { id: true }
				})
				const updatedAverage = aggregated._avg.reviewRating? parseFloat(aggregated._avg.reviewRating.toFixed(1)): 0;
				await tx.user.update({
				where: { id: reviewedId},
				data: {
				  sellerRating: updatedAverage,
				  sellerReviewCount: aggregated._count.id
				}
				});
				return (newReview);
			});
			console.log (`review creation successfull`);
			const io = req.app.get('io');
			const notifContent = {
				authorUsername: createdReview.reviewAuthor.username,
				reviewedUserId: reviewedId,
				reviewId: createdReview.id,
				rating: createdReview.reviewRating,
				review: createdReview,
			};
			const notif = await prisma.notification.create({
				data: {
					userId: reviewedId,
					type: 'REVIEW',
					content: notifContent,
				},
			});
			if (io) {
				io.to(`user_${reviewedId}`).emit('new_review', { ...notifContent, notifId: notif.id });
			}
			return (res.status(201).json({message: 'Review creation successfull', data:{createdReview}}));
		}
		catch (error:any){
			console.log(` an error ocurred inside the review create function` + error);
			if (error.code === 'P2002')
				return res.status(409).json({ error: "You already reviewed this user" });
			res.status(500).json({status: 'ERROR', message: 'internal server error', error: "Unknown error"});
		}
	},
	updateReview: async (req:AuthenticatedRequest<{ id:string, reviewId: string }>, res:Response) => {
		try {
			const userId = req.user!.id;
			const reviewedId = parseInt(req.params.reviewId, 10);
			const { reviews, reviewRating } = req.body;
			
			if (isNaN(reviewedId))
				return res.status(400).json({ message: 'Invalid review identifier.' });
			if (!reviewRating || reviewRating < 1 || reviewRating > 5)
				return (res.status(400).json({ message: 'Review mark must sit in between 1 and 5' }));
			if (!reviews)
				return (res.status(400).json({ message: 'Review cannot be empty' }));
			const oldReview = await prisma.review.findFirst({
				where: {id: reviewedId, deletedAt: null},
			})
			if (!oldReview)
				return (res.status(400).json({error: 'Old review is nowhere to be found'}));
			if (oldReview.authorId !== userId)
				return (res.status(400).json({error: 'You cannot change someone else\'s review'}));
			const updatedReview = await prisma.$transaction(async (tx) => {
				const newReview = await tx.review.update({
					where: {id: reviewedId},
					data:{
						reviewRating: reviewRating,
						reviews: reviews,
						modifiedAt: new Date()
					},
					include: {
						reviewAuthor: {
							select:{
								id:true,
								username: true,
								name:true,
								avatar:true
							}
						}
					}
				})
				const aggregated = await tx.review.aggregate({
					where: { reviewedUserId: oldReview.reviewedUserId, deletedAt: null },
					_avg: { reviewRating: true },
					_count: { id:true }
				});
				const updatedAverage = aggregated._avg.reviewRating? parseFloat(aggregated._avg.reviewRating.toFixed(1)): 0;
				await tx.user.update({
					where: { id: oldReview.reviewedUserId },
					data: {
					  sellerRating: updatedAverage,
					  sellerReviewCount: aggregated._count.id
					}
				});
				return (newReview);
			})
			console.log (`review update successfull`);
			const io = req.app.get('io');
			if (io) {
				io.to(`user_${oldReview.reviewedUserId}`).emit('review_updated', { review: updatedReview, reviewedUserId: oldReview.reviewedUserId });
			}
			return (res.status(200).json({message: 'Successfully updated review', data:{updatedReview}}));
		}
		catch (error:any){
			console.log(` an error ocurred inside the review create function` + error);
			res.status(500).json({status: 'ERROR', message: 'internal server error', error: "Unknown error"});
		}
	},
	deleteReview: async (req:AuthenticatedRequest<{ id:string, reviewId: string }>, res:Response) => {
		try {
			const userId = req.user!.id;
			const reviewedId = parseInt(req.params.reviewId, 10);
			
			if (isNaN(reviewedId))
				return res.status(400).json({ message: 'Invalid review identifier.' });
			const oldReview = await prisma.review.findFirst({
				where: {id: reviewedId, deletedAt: null},
			})
			if (!oldReview)
				return (res.status(400).json({error: 'Old review is nowhere to be found'}));
			if (oldReview.authorId !== userId)
				return (res.status(400).json({error: 'You cannot delete someone else\'s review'}));
			await prisma.$transaction(async (tx) => {
				await tx.review.delete({
					where: {id: reviewedId},
				})
				const aggregated = await tx.review.aggregate({
					where: { reviewedUserId: oldReview.reviewedUserId, deletedAt: null },
					_avg: { reviewRating: true },
					_count: { id:true}
				});
				const updatedAverage = aggregated._avg.reviewRating? parseFloat(aggregated._avg.reviewRating.toFixed(1)): 0;
				await tx.user.update({
					where: { id: oldReview.reviewedUserId },
					data: {
					  sellerRating: updatedAverage,
					  sellerReviewCount: aggregated._count.id
					}
				});
			})
			console.log (`review delete successfull`);
			await prisma.notification.deleteMany({
				where: {
					userId: oldReview.reviewedUserId,
					type: 'REVIEW',
					content: { path: ['reviewId'], equals: reviewedId },
				},
			});
			const io = req.app.get('io');
			if (io) {
				io.to(`user_${oldReview.reviewedUserId}`).emit('review_deleted', {
					reviewId: reviewedId,
				});
			}
			return (res.status(201).json({message:'Sucessfully deleted review'}));
		}
		catch (error:any){
			console.log(` an error ocurred inside the review create function` + error);
			res.status(500).json({status: 'ERROR', message: 'internal server error', error: "Unknown error"});
		}
	}
}

export default reviewController;