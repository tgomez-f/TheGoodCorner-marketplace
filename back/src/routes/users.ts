import { factorStatus, setupFactor, changeFactor } from '../controllers/twoFactorController.js';
import { Router } from 'express';
import userController from '../controllers/usersController.js';
import { uploadMiddleware } from '../services/middlewareMulter.js';
import { AuthenticateToken } from '../services/middlewareAuthenticateToken.js';

const userRouter = Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, username, password]
 *             properties:
 *               email:
 *                 type: string
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created
 *       400:
 *         description: Invalid input
 */
userRouter.post(`/auth/register`, userController.createUser);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               code:
 *                 type: string
 *                 description: Required if 2FA is enabled
 *     responses:
 *       200:
 *         description: Returns access token
 *       401:
 *         description: Invalid credentials
 */
userRouter.post(`/auth/login`, userController.login);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout
 *     responses:
 *       200:
 *         description: Logged out
 */
userRouter.post(`/auth/logout`, userController.logout);

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Refresh access token using httpOnly cookie
 *     responses:
 *       200:
 *         description: New access token
 *       401:
 *         description: Invalid or expired refresh token
 */
userRouter.post(`/auth/refresh`, userController.refresh);

/**
 * @openapi
 * /auth/2fa:
 *   get:
 *     tags: [2FA]
 *     summary: Get 2FA status
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 2FA status
 *       401:
 *         description: Unauthorized
 */
userRouter.get('/auth/2fa', AuthenticateToken, factorStatus);

/**
 * @openapi
 * /auth/2fa/setup:
 *   post:
 *     tags: [2FA]
 *     summary: Setup 2FA (generates TOTP secret)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: QR code / secret returned
 *       401:
 *         description: Unauthorized
 */
userRouter.post('/auth/2fa/setup', AuthenticateToken, setupFactor);

/**
 * @openapi
 * /auth/2fa/enable:
 *   post:
 *     tags: [2FA]
 *     summary: Enable 2FA with TOTP code
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code]
 *             properties:
 *               code:
 *                 type: string
 *     responses:
 *       200:
 *         description: 2FA enabled
 *       401:
 *         description: Unauthorized
 */
userRouter.post('/auth/2fa/enable', AuthenticateToken, changeFactor('enable'));

/**
 * @openapi
 * /auth/2fa/disable:
 *   post:
 *     tags: [2FA]
 *     summary: Disable 2FA
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code]
 *             properties:
 *               code:
 *                 type: string
 *     responses:
 *       200:
 *         description: 2FA disabled
 *       401:
 *         description: Unauthorized
 */
userRouter.post('/auth/2fa/disable', AuthenticateToken, changeFactor('disable'));

/**
 * @openapi
 * /user/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get a user by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User found
 *       404:
 *         description: User not found
 *   put:
 *     tags: [Users]
 *     summary: Update a user (with optional avatar upload)
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
 *               email:
 *                 type: string
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 *               bio:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *                 description: 10 digits, leave empty to remove
 *               location:
 *                 type: string
 *                 description: JSON stringified object with country, region, city, street, house_number, additionnal_infos
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: User updated
 *       401:
 *         description: Unauthorized
 *   delete:
 *     tags: [Users]
 *     summary: Delete a user
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
 *         description: User deleted
 *       401:
 *         description: Unauthorized
 */
userRouter.get(`/user/:id`, userController.getUser);
userRouter.put(`/user/:id`, AuthenticateToken, uploadMiddleware.single('image'), userController.updateUser);
userRouter.delete(`/user/:id`, AuthenticateToken, userController.removeUser);

/**
 * @openapi
 * /user:
 *   get:
 *     tags: [Users]
 *     summary: Get all users
 *     responses:
 *       200:
 *         description: List of users
 */
userRouter.get(`/user`, userController.getAllUser);

export default userRouter;

