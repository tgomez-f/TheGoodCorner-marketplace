import prisma from "../services/db.js";
import { comparePassword } from "../utils/securityUtils.js";
/**
 * generalController object creation with methods
 */
const generalController = {
    getProductsPage: async (_req, res) => {
        try {
            const products = await prisma.product.findMany({
                where: {
                    quantity: {
                        gt: 0
                    }
                },
                include: {
                    category: true, author: {
                        select: {
                            id: true,
                            username: true,
                            name: true,
                            email: true,
                            avatar: true,
                            bio: true,
                            sellerRating: true,
                            sellerReviewCount: true,
                            receivedReviews: {
                                where: { deletedAt: null },
                                select: { reviewRating: true }
                            }
                        }
                    }
                }
            });
            console.log('all product got sucessfully returned');
            return (res.status(200).json({ status: 'OK', data: products }));
        }
        catch (error) {
            console.log(` an error ocurred inside the productPage getter` + error);
            res.status(500).json({ status: 'ERROR', message: 'Internal server error' });
        }
    },
    getSignUpPage: async (req, res) => {
        try {
            if (!req.body.email || !req.body.password) {
                return res.status(400).json({ status: 'ERROR', message: 'Email and password are required' });
            }
            const email = req.body.email;
            const password = req.body.password;
            let user = await prisma.user.findUnique({ where: { email: email } });
            console.log(user);
            if (user && comparePassword(password, user.password)) {
                return res.json({ status: 'OK', user });
            }
            return res.json({ status: 'NOT OK' });
        }
        catch (error) {
            return (res.status(500).json({ status: 'ERROR', message: 'Internal server error' }));
        }
    },
};
export default generalController;
