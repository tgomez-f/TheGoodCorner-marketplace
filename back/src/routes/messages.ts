import { Router } from 'express';
import messageController from '../controllers/messageController.js';
import { AuthenticateToken } from '../services/middlewareAuthenticateToken.js';

const messageRouter = Router();

/**
 * @openapi
 * /message:
 *   get:
 *     tags: [Messages]
 *     summary: Get all conversations
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of conversations
 *       401:
 *         description: Unauthorized
 */
messageRouter.get('/message', AuthenticateToken, messageController.fetchAllConversations);

/**
 * @openapi
 * /message/{recipientId}:
 *   post:
 *     tags: [Messages]
 *     summary: Send a message
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: recipientId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content]
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Message sent
 *       401:
 *         description: Unauthorized
 *   get:
 *     tags: [Messages]
 *     summary: Get conversation with a user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: recipientId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Conversation messages
 *       401:
 *         description: Unauthorized
 */
messageRouter.post('/message/:recipientId', AuthenticateToken, messageController.sendMessage);
messageRouter.get('/message/:recipientId', AuthenticateToken, messageController.fetchConversation);

/**
 * @openapi
 * /message/{messageId}:
 *   put:
 *     tags: [Messages]
 *     summary: Update a message
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content]
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Message updated
 *       401:
 *         description: Unauthorized
 *   delete:
 *     tags: [Messages]
 *     summary: Delete a message
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Message deleted
 *       401:
 *         description: Unauthorized
 */
messageRouter.put('/message/:messageId', AuthenticateToken, messageController.updateMessage);
messageRouter.delete('/message/:messageId', AuthenticateToken, messageController.deleteMessage);

export default messageRouter;