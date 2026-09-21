import { Router } from 'express';
import controller from '../controllers/controllers.js';
const router = Router();
/**
 * ensemble de get routes
 * @param 'path' string
 * @param 'express Request and response' express Object
 */
router.get('/', controller.getHomePage);
router.get('/login', controller.getLoginPage);
router.get('/paiement', controller.getPaiementPage);
router.get('/messages', controller.getMessagesPage);
router.get('/profil', controller.getProfilPage);
export default router;
