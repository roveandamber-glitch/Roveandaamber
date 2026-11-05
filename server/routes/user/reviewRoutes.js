import express from 'express';
import {
  getPublicReviews,
  getProductReviews,
  createProductReview,
  deleteUserReview
} from '../../controllers/user/reviewController.js';
import { optionalAuth, protect } from '../../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * Public: Get approved reviews (testimonial list or product reviews if query ?productId=...)
 */
router.get('/', getPublicReviews);

/**
 * Public: Get reviews specifically for a product
 */
router.get('/product/:productId', getProductReviews);

/**
 * Customer / Guest: Submit a review for a product
 */
router.post('/product/:productId', optionalAuth, createProductReview);
router.post('/', optionalAuth, createProductReview);

/**
 * Authenticated Customer: Delete their own review
 */
router.delete('/:id', protect, deleteUserReview);

export default router;
