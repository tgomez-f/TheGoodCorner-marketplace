import * as core from 'express-serve-static-core';
import { Request} from "express";

export interface userTokenPayload{
	id:number;
	email:string;
	username:string;
}

export interface ProductCrInput {
	body: {
		name?: string | undefined;
		price?: string | number | undefined;
		description?: string | undefined;
		quantity?: string | number | undefined;
		category?: string | undefined;
	};
	file?: Express.Multer.File | undefined;
	userId: string | number;
}

export interface ProductUpdate {
	body: {
		name?: string | undefined;
		price?: string | number | undefined;
		quantity?: string | number | undefined;
		CategoryId?: string | number | undefined;
		category?: string | undefined;
		description?: string | undefined;
	};
	file?: Express.Multer.File | undefined;
}

// this is an express Request interface tailored with tokenPayload to add user property and protection to the request
// it is also made generic to be easier to pass around by taking things from express Request interface
export interface AuthenticatedRequest<
	P = core.ParamsDictionary,
	ResBody = any,
	ReqBody = any,
	ReqQuery = core.Query
> extends Request<P, ResBody, ReqBody, ReqQuery> {
	user?: userTokenPayload;
}

export interface UserCrInput {
	body: {
		email: string;
		username: string;
		password: string;
	};
}

export interface Location{
	country: string;
	region: string;
	city: string;
	street: string;
	house_number: number;
	additionnal_infos?: string | null;
}

export interface UserUpdate {
	body: UserCrInput['body'] & {
		name?: string | undefined;
		bio?: string | undefined;
		location?: Location;
		phoneNumber?: string | undefined;
		sellerEliteStatus?: boolean;
		sellerEliteStatusCatchPhrase?: string | undefined;
	};
	file?: Express.Multer.File | undefined;
}