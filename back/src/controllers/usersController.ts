import { consumeFactor } from '../services/twoFactor.js';
import { Request, Response } from "express";
import { PrismaClient, Prisma } from '@prisma/client';
import { comparePassword, hashIt } from "../utils/securityUtils.js";
import { findUserByEmail, findUserByUsername, createDbUser, saveRefreshToken, findReturnUser, findReturnAllUser } from "../services/users/utilsUsers.js";
import { generateTokens, verifyRefreshToken } from '../utils/jsonWebTokens.js';
import { buildUser } from "../services/users/buildUser.js";
import { userUpdate, ValidationError } from "../services/users/updateUser.js";
import { AuthenticatedRequest } from "../interfaces/interfaces.js";

const prisma = new PrismaClient; // get the prisma client instance
const REFRESH_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: true,
    sameSite: 'strict' as const,
    path: '/',
};

const BASIC_COOKIE = {
    ...REFRESH_COOKIE_OPTIONS,
    maxAge: 0,
};

const userController = 
{
	createUser: async (req: Request, res: Response) =>
	{
		try {
			const allowedDomains: string[] = [ 'gmail.com', 'hotmail.com', 'yahoo.com', 'laposte.net'];
			const domain:string = req.body.email.split('@')[1];
			if (!domain || !allowedDomains.includes(domain.toLowerCase()))
				return res.status(400).json({ status: 'ERROR', message: 'Invalid email suffix extension'});

			const newUser = buildUser(req);

			const existingUser = await findUserByEmail(newUser.email);
			if (existingUser)
				return res.status(400).json({ status: 'ERROR', message: 'Email already exists' });
			const existingUsername = await findUserByUsername(newUser.username);
			if (existingUsername)
				return (res.status(400).json({ status: 'ERROR', message: 'Username already taken' }));
			
			newUser.password = hashIt(newUser.password);
			const savedUser = await createDbUser(newUser);

			const {accessToken, refreshToken} = generateTokens(savedUser.id, savedUser.email);
			const hashedRefreshToken = hashIt(refreshToken);
			await saveRefreshToken(savedUser.id, hashedRefreshToken);
			res.cookie('refreshToken', refreshToken, { // set the refreshToken cookie to refreshToken value and pass some options such as expiry date
				...REFRESH_COOKIE_OPTIONS,
				maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
			});
			const { password, ...sanitizedUser } = savedUser;
			console.log(`User created`);
			return res.status(201).json({status: 'OK', message: 'User created !', accessToken, data: sanitizedUser});
		}
		catch (error: any) {
			console.error(error);
			if (error.message && error.message.includes('required'))
				return res.status(400).json({ status: 'ERROR', message: error.message });
			return res.status(500).json({ status: 'ERROR', message: 'Internal server error' })
		}
	},
	login: async (req:Request, res:Response) =>
	{
		try{
			const reqPassword = req.body.password;
			const email = req.body.email;
			if (!reqPassword || !email)
				return (res.status(400).json({ status: 'ERROR', message: 'Email and Password filling are mandatory'}));

			const existingUser = await findUserByEmail(email);
			if (!existingUser)
				return (res.status(400).json({ status: 'ERROR', message: 'User doesn\'t exist on our website'}));
			
			const passMatch = comparePassword(reqPassword, existingUser.password);
			if (!passMatch)
				return (res.status(400).json({ status: 'ERROR', message: 'Invalid credential'}));
			
            const factor = await prisma.twoFactor.findUnique({ where: { userId: existingUser.id } });
            if (factor?.enabled) {
                if (!req.body.code) return res.set('Cache-Control', 'no-store').status(200).json({ requiresTwoFactor: true });
                const result = await consumeFactor(existingUser.id, req.body.code, 'login');
                if (!result.ok) return res.status(result.limited ? 429 : 400).json({ message: result.limited ? 'Too much retries' : 'invalid code !' });
            }
			const {accessToken, refreshToken} = generateTokens(existingUser.id, existingUser.email);
			const hashedRefreshToken = hashIt(refreshToken);
			await saveRefreshToken(existingUser.id, hashedRefreshToken);

			res.cookie('refreshToken', refreshToken, { //set the value of `refresh token` inside cookie to var refresh token + add some options
				...REFRESH_COOKIE_OPTIONS,
				maxAge: 7 * 24 * 60 * 60 * 1000,
			});
			console.log(`User logged in`);
			const {password, ...sanitizedUser } = existingUser;
			return res.status(200).json({status: 'OK', message: 'User logged in !', accessToken, data: sanitizedUser});
		}
		catch (error){
			console.error(error);
			return res.status(500).json({ status: 'ERROR', message: 'Internal server error'});
		}
	},
	logout: async (req:Request, res:Response) =>
	{
		try{
			const refreshToken = req.cookies?.refreshToken; // get the resfreshToken from the cookies if present
			if (refreshToken) {
			const hashedToken = hashIt(refreshToken); // hash it to delete it in database (matching data)
			await prisma.refreshToken.deleteMany({where: { hashedToken }}); // delete it
			}
			console.log(`User logged out`);
			res.clearCookie('refreshToken', REFRESH_COOKIE_OPTIONS); // reset the refreshToken cookie to BASIC_COOKIE value
			return (res.status(200).json({ status: 'OK', message: 'User logged out successfully' }));
		}

		catch (error){
			console.error(error);
			return (res.status(500).json({ status: 'ERROR', message: 'Internal server error' + error }));
		}
	},
	refresh: async (req:Request, res:Response) =>
	{
		try{
			const refreshToken = req.cookies?.refreshToken; // get the resfreshToken from the cookies if present
			if (!refreshToken) {
				return (res.status(401).json({ status: 'ERROR', message: 'Refresh token missing' }));
			}

			const decodedPayload = verifyRefreshToken(refreshToken);
			const hashedToken = hashIt(refreshToken); // hash it to find it in database (matching data)
			const storedToken = await prisma.refreshToken.findUnique({ // get the actual stored token inside the database
			  where: { hashedToken },
			});
			if (!storedToken || storedToken.expiresAt < new Date()) {
				res.clearCookie('refreshToken', BASIC_COOKIE); // clear the invalid token
				return (res.status(401).json({ status: 'ERROR', message: 'Invalid or expired access token... Please refresh the page' }));
			}

			const { accessToken } = generateTokens(decodedPayload.id, decodedPayload.email); // generate new tokens for the old token's id and email (user)
			const userObject = await prisma.user.findUnique({
				where: {id: decodedPayload.id},
				include: {product: true, location: true, receivedReviews: {include: {reviewAuthor: { select: { id: true, username: true, name: true, avatar: true } }}}, authoredReviews: true}
			});
			if (!userObject)
				throw new Error ("user not found");
			const { password, ...sanitizedUser } = userObject;
			console.log(`User refreshed`);
			return res.status(200).json({status: 'OK', message: 'Token refreshed successfully',  accessToken, data: sanitizedUser});
		}
		catch (error){
			console.error(error);
			res.clearCookie('refreshToken', REFRESH_COOKIE_OPTIONS); // clear the token 
			return (res.status(401).json({ status: 'ERROR', message: 'Invalid or expired access token... Please refresh the page' }));
		}
	},
	getUser: async (req:Request<{ id:string}>, res:Response) => 
	{
		try {
			const user = await findReturnUser(req.params.id);
			if ('error' in user)
				return(res.status(user.status).json({message: user.error}));
			console.log(`Found User ${user.id}`);
			return (res.status(200).json({ status: 'OK', data: user }));
		}
		catch (error)
		{
			console.error(error);
			return (res.status(500).json({ status: 'ERROR', message: 'Internal server error'}));
		}
	},
	getAllUser: async (_req:Request, res:Response) => 
	{
		try {
			const allUser = await findReturnAllUser();
			console.log('fetch user ended successfully');
			return (res.status(200).json({ status: 'OK', data: allUser }));
		}
		catch(error){
			console.log('an error ocurred inside getAllUsers');
			return (res.status(500).json({ status: 'ERROR', message: 'Internal server error'}));
		}
	},
	removeUser: async (req:AuthenticatedRequest<{ id:string }>, res:Response) =>
	{
		try {
			const userId = req.user!.id;
			const dbUser = await findReturnUser(req.params.id);
			if ('error' in dbUser)
				return(res.status(dbUser.status).json({message: dbUser.error}));
			if (userId !== dbUser.id)
				return res.status(401).json({ status: 'ERROR', message: 'Forbidden: You can\'t delete someone else than yourself !' });
			const deletedUser = await prisma.user.delete({
				where: {id: dbUser.id},
			});
			console.log(`User deleted ${deletedUser.id}`);
			return (res.status(200).json({ status: 'OK'}));
			}
		catch (error) {
			console.log(error);
			res.status(500).json({status: 'ERROR', message: 'Internal server error'});
		}
	},
	updateUser: async (req:AuthenticatedRequest<{ id:string }>, res:Response) =>
	{
		try {
			const userId = req.user!.id;
			const paramId = parseInt(req.params.id, 10);
			if (isNaN(paramId))
				return (res.status(400).json({ status: 'ERROR', message: 'Invalid user ID' }));
			if (userId !== paramId)
				return res.status(401).json({ status: 'ERROR', message: 'Forbidden: You can\'t update someone else than yourself !' });
			const dbUser = await findReturnUser(req.params.id);
			if ('error' in dbUser)
				return(res.status(dbUser.status).json({message: dbUser.error}));
			const updateData = userUpdate({
				body: req.body,
				file: req.file,
			});
			if (updateData.password && typeof updateData.password === 'string')
				updateData.password = hashIt(updateData.password);
			const updatedUser = await prisma.user.update({
				where: { id: dbUser.id },
				data: updateData, include: { product:true, location: true}
			});
			const { password, ...sanitizedUser } = updatedUser;
			console.log(`User updated ! ${sanitizedUser.id}`);
				return (res.status(200).json({ status: 'OK', data: sanitizedUser }));
			} catch (error) {
				console.log(error);

			if (error instanceof ValidationError)
				return res.status(400).json({ status: 'ERROR', message: error.message });

			if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
				const target = (error.meta?.target as string[] | undefined) || [];
				const field = target.includes('email') ? 'email' : target.includes('username') ? "username" : 'value';
				return res.status(409).json({ status: 'ERROR', message: `This ${field} is already used by some other account.` });
			}

			res.status(500).json({ status: 'ERROR', message: 'Internal server error' });
			}
	}
}
export default userController;