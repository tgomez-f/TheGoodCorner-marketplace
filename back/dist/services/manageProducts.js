import prisma from './db.js';
/**
 * find a product using its automatically added at creation product ID
 * @param req
 * @param res
 * @returns promise containing the product object
 */
export const getProductById = async (req, res) => {
    try {
        const ProductId = parseInt(req.params.id, 10);
        if (isNaN(ProductId))
            return (res.status(400).json({ message: `Invalid ID, must be an integer.` }));
        const product = await prisma.product.findUnique({
            where: {
                id: ProductId,
            },
        });
        if (!product)
            return (res.status(404).json({ message: `Product ID not found.` }));
        console.log(`object found !`);
        return (res.status(200).json(product));
    }
    catch (error) {
        console.error(error);
        return (res.status(500).json({ status: 'ERROR', message: 'Internal server error' }));
    }
};
