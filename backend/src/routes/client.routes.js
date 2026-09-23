// Mini App uchun API yo'llari
import { Router } from 'express';
import { telegramAuth } from '../middlewares/auth.middleware.js';
import { uploadImage } from '../middlewares/upload.middleware.js';
import { wrapAll } from '../middlewares/async.middleware.js';
import * as cartController from '../controllers/cartController.js';

const cart = wrapAll(cartController);
const router = Router();

router.use(telegramAuth);

router.post('/auth', cart.auth);
router.post('/language', cart.setLanguage);

router.get('/catalog', cart.getCatalog);
router.get('/products/:id', cart.getProduct);
router.get('/stories', cart.getStories);
router.get('/bestsellers', cart.getBestsellers);
router.get('/settings', cart.getSettings);

router.post('/orders', cart.createOrder);
router.get('/orders', cart.myOrders);
router.post('/orders/:id/receipt', uploadImage.single('receipt'), cart.uploadReceipt);

router.get('/addresses', cart.myAddresses);
router.post('/addresses', cart.addAddress);
router.delete('/addresses/:id', cart.deleteAddress);

export default router;
