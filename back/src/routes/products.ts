import { Router } from 'express';
import { uploadMiddleware } from '../services/middlewareMulter.js';
import { getProductById } from '../services/products/utilsProducts.js';
import productController from '../controllers/productController.js';
import { AuthenticateToken } from '../services/middlewareAuthenticateToken.js';
const productRouter = Router();

/**
 * @openapi
 * /products:
 *   post:
 *     tags: [Products]
 *     summary: Create a product
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [name, price, description, category]
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *                 description: Category name (created if it does not exist)
 *               quantity:
 *                 type: integer
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Product created
 *       401:
 *         description: Unauthorized
 */
productRouter.post('/products', AuthenticateToken , uploadMiddleware.single('image'), productController.createProduct);

/**
 * @openapi
 * /products/{id}:
 *   get:
 *     tags: [Products]
 *     summary: Get a product by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Product found
 *       404:
 *         description: Product not found
 *   put:
 *     tags: [Products]
 *     summary: Update a product
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               quantity:
 *                 type: integer
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Product updated
 *       401:
 *         description: Unauthorized
 *   delete:
 *     tags: [Products]
 *     summary: Delete a product
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Product deleted
 *       401:
 *         description: Unauthorized
 */
productRouter.get('/products/:id', getProductById);
productRouter.put('/products/:id', AuthenticateToken, uploadMiddleware.single('image'), productController.updateProduct);
productRouter.delete('/products/:id', AuthenticateToken, productController.deleteProduct);

export default productRouter;