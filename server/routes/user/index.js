import express from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import productRoutes from './productRoutes.js';
import categoryRoutes from './categoryRoutes.js';
import cartRoutes from './cartRoutes.js';
import orderRoutes from './orderRoutes.js';
import paymentRoutes from './paymentRoutes.js';
import wishlistRoutes from './wishlistRoutes.js';
import bannerRoutes from './bannerRoutes.js';
import reviewRoutes from './reviewRoutes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/payment', paymentRoutes);
router.use('/payments', paymentRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/banners', bannerRoutes);
router.use('/reviews', reviewRoutes);

export {
  authRoutes,
  userRoutes,
  productRoutes,
  categoryRoutes,
  cartRoutes,
  orderRoutes,
  paymentRoutes,
  wishlistRoutes,
  bannerRoutes,
  reviewRoutes
};

export default router;
