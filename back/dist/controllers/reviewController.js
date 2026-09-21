import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient; // get the prisma client instance
const reviewController = {
    createReview: async (req, res) => {
        try {
            const userId = req.user.id;
            const reviewedId = parseInt(req.params.id, 10);
            const { reviews, reviewRating } = req.body;
            if (isNaN(reviewedId))
                return res.status(400).json({ message: 'Identifiant d\'avis invalide.' });
            if (!reviewRating || reviewRating < 1 || reviewRating > 5)
                return (res.status(400).json({ message: 'La note doit être comprise entre 1 et 5.' }));
            if (!reviews)
                return (res.status(400).json({ message: 'La review ne peut pas etre vide' }));
            if (userId === reviewedId)
                return (res.status(400).json({ error: 'Vous ne pouvez pas vous evaluer vous meme' }));
            const createdReview = await prisma.$transaction(async (tx) => {
                const newReview = await tx.review.create({
                    data: {
                        reviewRating: reviewRating,
                        reviews: reviews,
                        authorId: userId,
                        reviewedUserId: reviewedId,
                    },
                    include: {
                        reviewAuthor: {
                            select: {
                                id: true,
                                username: true,
                                name: true,
                                avatar: true
                            }
                        }
                    }
                });
                const aggregated = await tx.review.aggregate({
                    where: { reviewedUserId: reviewedId, deletedAt: null },
                    _avg: { reviewRating: true },
                    _count: { id: true }
                });
                const updatedAverage = aggregated._avg.reviewRating ? parseFloat(aggregated._avg.reviewRating.toFixed(1)) : 0;
                await tx.user.update({
                    where: { id: reviewedId },
                    data: {
                        sellerRating: updatedAverage,
                        sellerReviewCount: aggregated._count.id
                    }
                });
                return (newReview);
            });
            console.log(`review creation successfull`);
            const io = req.app.get('io');
            if (io) {
                io.to(`user_${reviewedId}`).emit('new_review', {
                    authorUsername: createdReview.reviewAuthor.username,
                    reviewedUserId: reviewedId,
                    reviewId: createdReview.id,
                    rating: createdReview.reviewRating,
                    review: createdReview,
                });
            }
            return (res.status(201).json({ message: 'Avis cree avec succes', data: { createdReview } }));
        }
        catch (error) {
            console.log(` an error ocurred inside the review create function` + error);
            if (error.code === 'P2002')
                return res.status(409).json({ error: "Vous avez déjà évalué cet utilisateur." });
            res.status(500).json({ status: 'ERROR', message: 'internal server error', error: "Unknown error" });
        }
    },
    updateReview: async (req, res) => {
        try {
            const userId = req.user.id;
            const reviewedId = parseInt(req.params.reviewId, 10);
            const { reviews, reviewRating } = req.body;
            if (isNaN(reviewedId))
                return res.status(400).json({ message: 'Identifiant d\'avis invalide.' });
            if (!reviewRating || reviewRating < 1 || reviewRating > 5)
                return (res.status(400).json({ message: 'La note doit être comprise entre 1 et 5.' }));
            if (!reviews)
                return (res.status(400).json({ message: 'La review ne peut pas etre vide' }));
            const oldReview = await prisma.review.findFirst({
                where: { id: reviewedId, deletedAt: null },
            });
            if (!oldReview)
                return (res.status(400).json({ error: 'Ancien avis introuvable' }));
            if (oldReview.authorId !== userId)
                return (res.status(400).json({ error: 'Vous ne pouvez pas modifier l\'evaluation de quelqu\'un d\'autre' }));
            const updatedReview = await prisma.$transaction(async (tx) => {
                const newReview = await tx.review.update({
                    where: { id: reviewedId },
                    data: {
                        reviewRating: reviewRating,
                        reviews: reviews,
                        modifiedAt: new Date()
                    },
                    include: {
                        reviewAuthor: {
                            select: {
                                id: true,
                                username: true,
                                name: true,
                                avatar: true
                            }
                        }
                    }
                });
                const aggregated = await tx.review.aggregate({
                    where: { reviewedUserId: oldReview.reviewedUserId, deletedAt: null },
                    _avg: { reviewRating: true },
                    _count: { id: true }
                });
                const updatedAverage = aggregated._avg.reviewRating ? parseFloat(aggregated._avg.reviewRating.toFixed(1)) : 0;
                await tx.user.update({
                    where: { id: oldReview.reviewedUserId },
                    data: {
                        sellerRating: updatedAverage,
                        sellerReviewCount: aggregated._count.id
                    }
                });
                return (newReview);
            });
            console.log(`review update successfull`);
            return (res.status(200).json({ message: 'Avis mis a jour avec succes', data: { updatedReview } }));
        }
        catch (error) {
            console.log(` an error ocurred inside the review create function` + error);
            res.status(500).json({ status: 'ERROR', message: 'internal server error', error: "Unknown error" });
        }
    },
    deleteReview: async (req, res) => {
        try {
            const userId = req.user.id;
            const reviewedId = parseInt(req.params.reviewId, 10);
            if (isNaN(reviewedId))
                return res.status(400).json({ message: 'Identifiant d\'avis invalide.' });
            const oldReview = await prisma.review.findFirst({
                where: { id: reviewedId, deletedAt: null },
            });
            if (!oldReview)
                return (res.status(400).json({ error: 'Ancien avis introuvable' }));
            if (oldReview.authorId !== userId)
                return (res.status(400).json({ error: 'Vous ne pouvez pas supprimer l\'evaluation de quelqu\'un d\'autre' }));
            await prisma.$transaction(async (tx) => {
                await tx.review.delete({
                    where: { id: reviewedId },
                });
                const aggregated = await tx.review.aggregate({
                    where: { reviewedUserId: oldReview.reviewedUserId, deletedAt: null },
                    _avg: { reviewRating: true },
                    _count: { id: true }
                });
                const updatedAverage = aggregated._avg.reviewRating ? parseFloat(aggregated._avg.reviewRating.toFixed(1)) : 0;
                await tx.user.update({
                    where: { id: oldReview.reviewedUserId },
                    data: {
                        sellerRating: updatedAverage,
                        sellerReviewCount: aggregated._count.id
                    }
                });
            });
            console.log(`review delete successfull`);
            return (res.status(201).json({ message: ' Avis supprime avec succes' }));
        }
        catch (error) {
            console.log(` an error ocurred inside the review create function` + error);
            res.status(500).json({ status: 'ERROR', message: 'internal server error', error: "Unknown error" });
        }
    }
};
export default reviewController;
