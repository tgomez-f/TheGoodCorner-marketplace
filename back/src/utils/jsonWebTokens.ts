import jwt from 'jsonwebtoken'
import 'dotenv/config';
import { userTokenPayload } from '../interfaces/interfaces.js';

// take the screts from .env to store them in thoses variables
const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET || 'access_secret_pass'
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET || 'refresh_secret_pass'

export const generateTokens = (userID : number, email: string) =>{
	try{
		const accessToken = jwt.sign({id:userID, email}, ACCESS_SECRET,{
			expiresIn: '15m',
		});

		const refreshToken = jwt.sign({id:userID, email}, REFRESH_SECRET,{
			expiresIn: '7d',
		});
		return { accessToken, refreshToken };
	}
	catch (error){
		console.error('Failed to sign JWT:', error);
		throw error;
	}
}

export const verifyAcessToken = (token:string): userTokenPayload =>{
	return (jwt.verify(token, ACCESS_SECRET) as userTokenPayload);
}

export const verifyRefreshToken = (token:string): userTokenPayload =>{
	return (jwt.verify(token, REFRESH_SECRET) as userTokenPayload);
}