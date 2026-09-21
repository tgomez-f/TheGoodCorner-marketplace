import { Response, NextFunction } from "express";
import { verifyAcessToken } from "../utils/jsonWebTokens.js";
import { AuthenticatedRequest } from "../interfaces/interfaces.js";

export const AuthenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
	const authHeaders = req.headers.authorization; //extratc authorization header
	const token = authHeaders && authHeaders.split(' ')[1];
	if (!token)
		return (res.status(401).json({status: 'ERROR', message: 'Access token missing'}));
	try {
		const decodedPayload = verifyAcessToken(token);
		req.user = decodedPayload;
		next();
	}
	catch (error)
	{
		console.log(` error occured in middlewareAuthentificate` + error);
		return (res.status(401).json({status: 'ERROR', message: 'invalid or expired access token... Please refresh the page'}));
	}
}