import prisma from '../db.js';
/**
 * find a product using its automatically added at creation product ID
 * @param req
 * @param res
 * @returns promise containing the product object
 */
export const getProductById = async (req, res) => {
    try {
        const result = await findReturnProduct(req.params.id);
        if (`error` in result)
            return (res.status(result.status).json({ message: result.error }));
        return (res.status(200).json(result));
    }
    catch (error) {
        console.error(error);
        return (res.status(500).json({ status: 'ERROR', message: 'Internal server error' }));
    }
};
export const findReturnProduct = async (id) => {
    const productId = parseInt(id, 10);
    if (isNaN(productId))
        return { error: "Invalid ID, must be an integer.", status: 400 };
    const product = await prisma.product.findUnique({
        where: { id: productId },
        include: { category: true, author: true },
    });
    if (!product || product.quantity <= 0)
        return { error: "Product not found.", status: 400 };
    console.log(`object found !`);
    return (product);
};
