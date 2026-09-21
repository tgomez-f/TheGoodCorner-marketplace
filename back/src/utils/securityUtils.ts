import crypto from 'crypto';

export const hashIt = (password: string): string => {
	return crypto.createHash('sha256').update(password).digest('hex');
};

export const comparePassword = (password: string, hashedPassword: string): boolean => {
	return hashIt(password) === hashedPassword;
};