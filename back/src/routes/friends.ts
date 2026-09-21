import { Router } from 'express';
import { AuthenticateToken } from '../services/middlewareAuthenticateToken.js';
import friendController from '../controllers/friendController.js';

const friendRouter = Router();

/**
 * @openapi
 * /friend-requests:
 *   post:
 *     tags: [Friends]
 *     summary: Send a friend request
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [receiverId]
 *             properties:
 *               receiverId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Friend request sent
 *       401:
 *         description: Unauthorized
 *   get:
 *     tags: [Friends]
 *     summary: Get all friend requests
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [received, sent]
 *         description: Filter by direction (omit for all)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, ACCEPTED, REJECTED]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: List of friend requests
 *       401:
 *         description: Unauthorized
 */
friendRouter.post('/friend-requests', AuthenticateToken, friendController.sendFriendRequest);
friendRouter.get('/friend-requests', AuthenticateToken, friendController.getFriendRequests);

/**
 * @openapi
 * /friend-requests/{id}/accept:
 *   patch:
 *     tags: [Friends]
 *     summary: Accept a friend request
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
 *         description: Friend request accepted
 *       401:
 *         description: Unauthorized
 */
friendRouter.patch('/friend-requests/:id/accept', AuthenticateToken, friendController.acceptFriendRequest);

/**
 * @openapi
 * /friend-requests/{id}/reject:
 *   patch:
 *     tags: [Friends]
 *     summary: Reject a friend request
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
 *         description: Friend request rejected
 *       401:
 *         description: Unauthorized
 */
friendRouter.patch('/friend-requests/:id/reject', AuthenticateToken, friendController.rejectFriendRequest);

/**
 * @openapi
 * /friend-requests/{id}:
 *   delete:
 *     tags: [Friends]
 *     summary: Cancel or delete a friend request
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
 *         description: Friend request deleted
 *       401:
 *         description: Unauthorized
 */
friendRouter.delete('/friend-requests/:id', AuthenticateToken, friendController.deleteFriendRequest);

/**
 * @openapi
 * /friends:
 *   get:
 *     tags: [Friends]
 *     summary: Get all accepted friends
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of friends
 *       401:
 *         description: Unauthorized
 */
friendRouter.get('/friends', AuthenticateToken, friendController.getFriends);

export default friendRouter;
