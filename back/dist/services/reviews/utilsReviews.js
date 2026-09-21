import prisma from '../db.js';
import { findReturnUser } from '../users/utilsUsers.js';
export const findReturnUserReviews = async (id) => {
    const user = await findReturnUser(id);
    if ('error' in user)
        return (user);
    const reviews = await prisma.review.findMany({
        where: { reviewedUserId: Number(id), deletedAt: null },
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            reviewRating: true,
            reviews: true,
            createdAt: true,
            reviewAuthor: {
                select: {
                    id: true,
                    username: true,
                    avatar: true,
                }
            }
        }
    });
    console.log('reviews returned');
    return ({ status: 200, data: reviews });
};
