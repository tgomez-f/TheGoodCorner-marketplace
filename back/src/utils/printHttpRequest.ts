import { Request, Response, NextFunction } from 'express';

export const printRequest = ((req: Request, _res: Response, next: NextFunction) => {
	const timestamp = new Date().toISOString();
	console.log(`[${timestamp}] ${req.method} ${req.url}`);
	
	// Affiche le body s'il y en a un (POST/PUT)
	if (Object.keys(req.body || {}).length > 0) {
	  console.log('Body:', JSON.stringify(req.body, null, 2));
	}
	next(); // Passer la main au middleware/routeur suivant
});