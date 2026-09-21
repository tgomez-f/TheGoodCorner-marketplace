export const buildUser = ({ body }) => {
    const { email, username, password } = body;
    if (!email || !password || !username)
        throw new Error('Email, password, and username are required.');
    return {
        email: email.toLocaleLowerCase(),
        username,
        password,
    };
};
