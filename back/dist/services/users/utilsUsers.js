import { PrismaClient } from '@prisma/client';
import prisma from "../db.js";
import 'dotenv/config';
const prismaInstance = new PrismaClient();
/**
 *  find the user by checking inside the prisma database for its email, if occurence found returns said user
 * @param email
 * @returns said user promise
 */
export const findUserByEmail = async (email) => {
    return (await prisma.user.findUnique({
        where: { email },
        include: { product: true, location: true, receivedReviews: {
                include: { reviewAuthor: true }
            } }
    }));
};
export const findUserByUsername = async (username) => {
    return (await prisma.user.findUnique({
        where: { username },
        include: { product: true, location: true }
    }));
};
/**
 * add a user's data to the prisma database using a data object (prisma.UsersCreateInput)
 * @param data
 * @returns user promise
 */
export const createDbUser = async (data) => {
    return (await prisma.user.create({
        data,
        include: { product: true, location: true, receivedReviews: {
                include: { reviewAuthor: true }
            } }
    }));
};
/**
 * save a refresh token to the database, adding a 7 dats expiry date to it
 * @param userId
 * @param hashedToken
 * @returns promise containing the refreshToken
 */
export const saveRefreshToken = async (userId, hashedToken) => {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // add a 7 days expiration to get date which return day date
    const token = await prismaInstance.refreshToken.create({
        data: {
            userId,
            hashedToken,
            expiresAt,
        }
    });
    console.log(`refresh token added to db`);
};
export const getUserById = async (req, res) => {
    try {
        const result = await findReturnUser(req.params.id);
        if (`error` in result)
            return (res.status(result.status).json({ message: result.error }));
        return (res.status(200).json(result));
    }
    catch (error) {
        console.error(error);
        return (res.status(500).json({ status: 'ERROR', message: 'Internal server error' }));
    }
};
export const findReturnAllUser = async () => {
    try {
        const allUsers = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                username: true,
                authoredReviews: {
                    select: {
                        id: true,
                        reviews: true,
                        reviewAuthor: { select: { id: true, name: true } },
                        reviewedUser: { select: { id: true, name: true } }
                    }
                },
                receivedReviews: {
                    select: {
                        id: true,
                        reviews: true,
                        reviewAuthor: { select: { id: true, name: true } },
                        reviewedUser: { select: { id: true, name: true } }
                    }
                },
                sentMessages: true,
                receivedMessages: true,
                product: {
                    select: {
                        id: true,
                        name: true,
                        category: true,
                        author: { select: { id: true, name: true } }
                    }
                },
                location: true
            }
        });
        console.log("sucessfully fetched all users");
        return (allUsers);
    }
    catch (error) {
        console.log(error);
        throw error;
    }
};
export const findReturnUser = async (id) => {
    const userId = parseInt(id, 10);
    if (isNaN(userId))
        return ({ error: "Invalid userId, must be an integer.", status: 400 });
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            receivedReviews: {
                where: { deletedAt: null }, // filtre les avis soft-deleted côté back plutôt que côté front
                orderBy: { createdAt: 'desc' },
                include: {
                    reviewAuthor: {
                        select: { id: true, username: true, name: true, avatar: true },
                    },
                }
            },
            product: {
                include: { author: {
                        select: {
                            id: true,
                            username: true,
                            avatar: true,
                            sellerRating: true,
                            sellerReviewCount: true,
                        }
                    },
                    category: true }
            },
            payment: true,
            location: true
        }
    });
    if (!user)
        return ({ error: "user not found.", status: 400 });
    console.log(`object found !`);
    const { password, ...userNoPass } = user;
    return (userNoPass);
};
