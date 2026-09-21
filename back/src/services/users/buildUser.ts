import { Prisma } from '@prisma/client';
import { UserCrInput } from '../../interfaces/interfaces.js';


export const buildUser = ({ body }: UserCrInput): Prisma.UserCreateInput => {
	const { email, username, password } = body;

	if (!email || !password || !username)
		throw new Error('Email, password, and username are required.');

	return {
		email: email.toLocaleLowerCase(),
		username,
		password,
	};
};
