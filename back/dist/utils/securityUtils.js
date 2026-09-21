import crypto from 'crypto';
export const hashIt = (password) => {
    return crypto.createHash('sha256').update(password).digest('hex');
};
export const comparePassword = (password, hashedPassword) => {
    return hashIt(password) === hashedPassword;
};
