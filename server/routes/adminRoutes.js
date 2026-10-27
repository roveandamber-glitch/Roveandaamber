import express from 'express';
import {
  getAdminDashboardStats,
  getAdminUsers,
  getAdminProducts,
  createAdminProduct,
  updateAdminProduct,
  updateProductStock,
  deleteAdminProduct,
  getAdminBanners,
  createAdminBanner,
  updateAdminBanner,
  toggleBannerStatus,
  deleteAdminBanner,
  getAdminOrders,
  getAdminOrderById,
  updateOrderStatus,
  getAdminGiftOrders,
  updateGiftFulfillment,
  getAdminReviews,
  moderateReview,
  deleteAdminReview,
  getReviewStats
} from '../controllers/adminController.js';
import { protect, adminOnly } from '../middlewares/authMiddleware.js';
import { upload } from '../middlewares/uploadMiddleware.js';
import {
  validateProductInput,
  validateProductStockUpdate,
  validateBannerInput,
  validateOrderStatusUpdate,
  validateGiftFulfillmentUpdate,
  validateReviewModeration
} from '../validators/adminValidator.js';

const router = express.Router();

// Apply security gate to all admin routes: must be authenticated and have admin role
router.use(protect, adminOnly);

/* --------------------------------------------------------------------------
   DASHBOARD OVERVIEW & USERS
   -------------------------------------------------------------------------- */
router.get('/stats', getAdminDashboardStats);
router.get('/users', getAdminUsers);

/* --------------------------------------------------------------------------
   9.1 PRODUCT MANAGEMENT
   -------------------------------------------------------------------------- */
router.get('/products', getAdminProducts);
router.post('/products', upload.any(), validateProductInput, createAdminProduct);
router.put('/products/:id', upload.any(), validateProductInput, updateAdminProduct);
router.patch('/products/:id/stock', validateProductStockUpdate, updateProductStock);
router.delete('/products/:id', deleteAdminProduct);

/* --------------------------------------------------------------------------
   9.2 BANNER MANAGEMENT
   -------------------------------------------------------------------------- */
router.get('/banners', getAdminBanners);
router.post('/banners', upload.any(), validateBannerInput, createAdminBanner);
router.put('/banners/:id', upload.any(), validateBannerInput, updateAdminBanner);
router.patch('/banners/:id/toggle', toggleBannerStatus);
router.delete('/banners/:id', deleteAdminBanner);

/* --------------------------------------------------------------------------
   9.3 ORDER MANAGEMENT
   -------------------------------------------------------------------------- */
router.get('/orders', getAdminOrders);
router.get('/orders/:id', getAdminOrderById);
router.put('/orders/:id/status', validateOrderStatusUpdate, updateOrderStatus);

/* --------------------------------------------------------------------------
   9.4 GIFT ORDER MANAGEMENT
   -------------------------------------------------------------------------- */
router.get('/gifts', getAdminGiftOrders);
router.put('/gifts/:id/fulfillment', validateGiftFulfillmentUpdate, updateGiftFulfillment);

/* --------------------------------------------------------------------------
   9.5 REVIEW MANAGEMENT
   -------------------------------------------------------------------------- */
router.get('/reviews', getAdminReviews);
router.get('/reviews/stats', getReviewStats);
router.put('/reviews/:id/moderate', validateReviewModeration, moderateReview);
router.delete('/reviews/:id', deleteAdminReview);

/* --------------------------------------------------------------------------
   10. INVENTORY AND STOCK MANAGEMENT
   -------------------------------------------------------------------------- */
import inventoryRoutes from './inventoryRoutes.js';
router.use('/inventory', inventoryRoutes);

/* --------------------------------------------------------------------------
   11. MONTHLY SALES REPORTS AND ANALYTICS
   -------------------------------------------------------------------------- */
import reportRoutes from './reportRoutes.js';
router.use('/reports', reportRoutes);

export default router;
