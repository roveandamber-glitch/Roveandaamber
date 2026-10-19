import express from 'express';
import {
  getCart,
  addItemToCart,
  updateCartItem,
  removeCartItem,
  applyCoupon,
  removeCoupon,
  updateGiftOptions,
  getCheckoutSummary,
  clearCart
} from '../controllers/cartController.js';
import { optionalAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Support both logged-in and guest customers via optionalAuth
router.use(optionalAuth);

// 3.1: Shopping Cart Management
router.get('/', getCart);
router.post('/items', addItemToCart);
router.put('/items/:itemId', updateCartItem);
router.patch('/items/:itemId', updateCartItem);
router.delete('/items/:itemId', removeCartItem);
router.delete('/', clearCart);

// 3.1: Promotional Coupon Codes
router.post('/apply-coupon', applyCoupon);
router.post('/coupon', applyCoupon);
router.delete('/remove-coupon', removeCoupon);
router.delete('/coupon', removeCoupon);

// 3.1: Gift preferences & Checkout Summary
router.put('/gift-options', updateGiftOptions);
router.get('/checkout-summary', getCheckoutSummary);

export default router;
