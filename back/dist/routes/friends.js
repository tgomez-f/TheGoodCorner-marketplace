import { Router } from 'express';
import { AuthenticateToken } from '../services/middlewareAuthenticateToken.js';
import friendController from '../controllers/friendController.js';
const friendRouter = Router();
// Envoyer une demande d'amitié
friendRouter.post('/friend-requests', AuthenticateToken, friendController.sendFriendRequest);
// Récupérer toutes les demandes
friendRouter.get('/friend-requests', AuthenticateToken, friendController.getFriendRequests);
// Accepter une demande
friendRouter.patch('/friend-requests/:id/accept', AuthenticateToken, friendController.acceptFriendRequest);
// Rejeter une demande
friendRouter.patch('/friend-requests/:id/reject', AuthenticateToken, friendController.rejectFriendRequest);
// Supprimer une amitié / annuler demande
friendRouter.delete('/friend-requests/:id', AuthenticateToken, friendController.deleteFriendRequest);
// Récupérer tous les amis (statut ACCEPTED)
friendRouter.get('/friends', AuthenticateToken, friendController.getFriends);
export default friendRouter;
