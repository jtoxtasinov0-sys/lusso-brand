// Admin Panel API yo'llari
import { Router } from 'express';
import { adminAuth } from '../middlewares/auth.middleware.js';
import { uploadImage } from '../middlewares/upload.middleware.js';
import { wrapAll } from '../middlewares/async.middleware.js';
import { loginLimiter } from '../middlewares/ratelimit.middleware.js';
import * as adminController from '../controllers/adminController.js';

const admin = wrapAll(adminController);
const router = Router();

// Kirish (himoyasiz)
router.post('/login', loginLimiter, admin.login);

// Qolgan hammasi token bilan
router.use(adminAuth);

router.get('/stats', admin.stats);

// Buyurtmalar
router.get('/orders', admin.listOrders);
router.get('/orders/:id', admin.getOrder);
router.patch('/orders/:id', admin.updateOrder);

// Mahsulotlar
router.get('/products', admin.listProducts);
router.post('/products', admin.createProduct);
router.put('/products/:id', admin.updateProduct);
router.delete('/products/:id', admin.deleteProduct);

// Kategoriyalar
router.get('/categories', admin.listCategories);
router.post('/categories', admin.createCategory);
router.put('/categories/:id', admin.updateCategory);
router.delete('/categories/:id', admin.deleteCategory);

// Storylar
router.get('/stories', admin.listStories);
router.post('/stories', admin.createStory);
router.delete('/stories/:id', admin.deleteStory);

// Mijozlar va rassilka
router.get('/users', admin.listUsers);
router.post('/broadcast', admin.broadcast);
router.get('/broadcast', admin.broadcastHistory);

// Sozlamalar
router.get('/settings', admin.getSettings);
router.put('/settings', admin.updateSettings);

// Rasm yuklash
router.post('/upload', uploadImage.single('image'), admin.upload);

export default router;
