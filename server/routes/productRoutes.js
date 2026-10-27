import express from 'express';
import {
  getProducts,
  getProductById,
  getFeaturedProducts,
  getNewArrivals,
  getBestSellers,
  getCollections,
  getGiftSelections,
  getFilterOptions,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/productController.js';
import { protect, adminOnly, optionalAuth } from '../middlewares/authMiddleware.js';
import { upload } from '../middlewares/uploadMiddleware.js';
import { getProductReviews, submitProductReview } from '../controllers/adminController.js';
import { validateReviewSubmission } from '../validators/adminValidator.js';

const router = express.Router();

// 2.1 & 2.2: Product Browsing, Collections & Advanced Filters
router.get('/', getProducts);
router.get('/filter-options', getFilterOptions);
router.get('/featured', getFeaturedProducts);
router.get('/new-arrivals', getNewArrivals);
router.get('/bestsellers', getBestSellers);

// 2.4: Dedicated Gift Shopping – For Him and Her, Birthdays, Anniversaries, Special Occasions
router.get('/gifts', getGiftSelections);
router.get('/collections/:collection', getCollections);

// 2.3: Product Images, Videos & Individual details
router.get('/:id', getProductById);

// 9.5: Product Reviews & Feedback
router.get('/:id/reviews', getProductReviews);
router.post('/:id/reviews', optionalAuth, validateReviewSubmission, submitProductReview);

// Admin-only: Product Management
router.post('/', protect, adminOnly, upload.any(), createProduct);
router.put('/:id', protect, adminOnly, upload.any(), updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);

export default router;
