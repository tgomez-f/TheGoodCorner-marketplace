import { Router } from 'express';
import controller from '../controllers/generalController.js';
const generalRouter = Router();
/**
 * ensemble de get routes
 * @param 'path' string
 * @param 'express Request and response' express Object
 */
generalRouter.get('/', controller.getHomePage);
generalRouter.get('/login', controller.getLoginPage);
generalRouter.get('/products', controller.getProductsPage);
generalRouter.get('/paiement', controller.getPaiementPage);
generalRouter.get('/messages', controller.getMessagesPage);
generalRouter.get('/profil', controller.getProfilPage);
export default generalRouter;
