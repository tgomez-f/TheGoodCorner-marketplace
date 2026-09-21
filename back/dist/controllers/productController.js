import prisma from "../services/db.js";
import { buildProduct } from "../services/products/buildProduct.js";
import { productUpdate } from "../services/products/updateProduct.js";
import { findReturnProduct } from "../services/products/utilsProducts.js";
// request has already been processed by multer before arriving here since its a middleware, req.file has been filtered already
/**
 * create a product inside the prisma database by taking the request and sending the json object
 * @param request
 * @returns promise containing the json object
 */
const ProductController = {
    createProduct: async (req, res) => {
        try {
            const userId = req.user?.id;
            if (!userId)
                return res.status(401).json({ status: 'ERROR', message: 'Unauthorized' });
            const newProduct = await prisma.product.create({
                data: buildProduct({ body: req.body, file: req.file, userId }),
                include: {
                    category: true,
                    author: {
                        select: {
                            id: true,
                            username: true,
                            name: true,
                            email: true,
                            avatar: true,
                            bio: true,
                            sellerRating: true,
                            sellerReviewCount: true,
                        }
                    },
                }
            });
            console.log(`User created an object`);
            const io = req.app.get('io');
            if (io)
                io.emit('new_product', newProduct);
            return (res.status(201).json({ status: 'OK', data: newProduct }));
        }
        catch (error) {
            console.error(error);
            if (error instanceof Error)
                return res.status(400).json({ status: 'ERROR', message: error.message });
            return (res.status(500).json({ status: 'ERROR', message: 'Internal server error' }));
        }
    },
    updateProduct: async (req, res) => {
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ status: 'ERROR', message: 'Unauthorized' });
        const product = await findReturnProduct(req.params.id);
        if ('error' in product)
            return (res.status(product.status).json({ message: product.error }));
        if (userId !== product.userId)
            return res.status(403).json({ status: 'ERROR', message: 'Forbidden: You do not own this product' });
        const productId = parseInt(req.params.id, 10);
        const updatedProduct = await prisma.product.update({
            where: { id: productId },
            data: productUpdate({
                body: req.body,
                file: req.file,
            }),
        });
        console.log(`User updated product ID ${updatedProduct.id}`);
        return (res.status(200).json({ status: 'OK', data: product }));
    },
    deleteProduct: async (req, res) => {
        try {
            const userId = req.user?.id;
            if (!userId)
                return res.status(401).json({ status: 'ERROR', message: 'Unauthorized' });
            const product = await findReturnProduct(req.params.id);
            if ('error' in product) {
                return (res.status(product.status).json({ message: product.error }));
            }
            if (userId !== product.userId)
                return res.status(403).json({ status: 'ERROR', message: 'Forbidden: You do not own this product' });
            const productId = parseInt(req.params.id, 10);
            const deletedProduct = await prisma.product.delete({
                where: { id: productId },
            });
            console.log(`User deleted product ID ${deletedProduct.id}`);
            return (res.status(200).json({ status: 'OK' }));
        }
        catch (error) {
            console.log(error);
            res.status(500).json({ status: 'ERROR', message: 'Internal server error' });
        }
    },
};
export default ProductController;
