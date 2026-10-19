import express from 'express';
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  moveToCart,
  clearWishlist
} from '../controllers/wishlistController.js';
import { optionalAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All wishlist routes support both authenticated users and guests via optionalAuth
router.use(optionalAuth);

// 2.5: Wishlist and Save for Later Endpoints
router.get('/', getWishlist);
router.post('/', addToWishlist);
router.delete('/', clearWishlist);
router.post('/move-to-cart', moveToCart);
router.delete('/:productId', removeFromWishlist);

export default router;
