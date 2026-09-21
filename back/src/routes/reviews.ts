import { Router } from 'express';
import reviewController from '../controllers/reviewController.js';
import { AuthenticateToken } from '../services/middlewareAuthenticateToken.js';
import { findReturnUserReviews } from '../services/reviews/utilsReviews.js'

const reviewsRouter = Router({mergeParams: true});

/**
 * @openapi
 * /user/{id}/reviews:
 *   get:
 *     tags: [Reviews]
 *     summary: Get all reviews for a seller
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of reviews
 *       404:
 *         description: User not found
 *   post:
 *     tags: [Reviews]
 *     summary: Create a review for a seller
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [reviewRating, reviews]
 *             properties:
 *               reviewRating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               reviews:
 *                 type: string
 *     responses:
 *       201:
 *         description: Review created
 *       401:
 *         description: Unauthorized
 */
reviewsRouter.get('/user/:id/reviews', findReturnUserReviews);
reviewsRouter.post('/user/:id/reviews', AuthenticateToken, reviewController.createReview);

/**
 * @openapi
 * /user/{id}/reviews/{reviewId}:
 *   put:
 *     tags: [Reviews]
 *     summary: Update a review
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reviewRating:
 *                 type: integer
 *               reviews:
 *                 type: string
 *     responses:
 *       200:
 *         description: Review updated
 *       401:
 *         description: Unauthorized
 *   delete:
 *     tags: [Reviews]
 *     summary: Delete a review
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Review deleted
 *       401:
 *         description: Unauthorized
 */
reviewsRouter.put('/user/:id/reviews/:reviewId', AuthenticateToken, reviewController.updateReview);
reviewsRouter.delete('/user/:id/reviews/:reviewId', AuthenticateToken, reviewController.deleteReview);

export default reviewsRouter;