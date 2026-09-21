import { PrismaClient } from '@prisma/client';
import prisma from "./db.js";
import 'dotenv/config';
const prismaInstance = new PrismaClient();
/**
 *  find the user by checking inside the prisma database for its email, if occurence found returns said user
 * @param email
 * @returns said user promise
 */
export const findUserByEmail = async (email) => {
    return (await prisma.user.findUnique({ where: { email } }));
};
/**
 * add a user's data to the prisma database using a data object (prisma.UsersCreateInput)
 * @param data
 * @returns user promise
 */
export const createDbUser = async (data) => {
    return (await prisma.user.create({ data }));
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
    console.log(`refresh token added to db` + token);
};
