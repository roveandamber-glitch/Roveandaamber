import express from 'express';
import {
  getCart,
  addItemToCart,
  updateCartItem,
  upgradeCartItem,
  removeCartItem,
  applyCoupon,
  removeCoupon,
  getAvailableCoupons,
  applyRewardPoints,
  removeRewardPoints,
  updateGiftOptions,
  getCheckoutSummary,
  clearCart
} from '../../controllers/user/cartController.js';
import { protect } from '../../middlewares/authMiddleware.js';

const router = express.Router();

// Public: Retrieve active promotional coupons
router.get('/coupons', getAvailableCoupons);
router.get('/available-coupons', getAvailableCoupons);

// Support both logged-in and guest customers via optionalAuth
// Strictly require authenticated customer account for all cart operations (Private Route)
router.use(protect);

// 3.1: Shopping Cart Management
router.get('/', getCart);
router.post('/items', addItemToCart);
router.post('/upgrade', upgradeCartItem);
router.patch('/items/:itemId/upgrade', upgradeCartItem);
router.put('/items/:itemId', updateCartItem);
router.patch('/items/:itemId', updateCartItem);
router.delete('/items/:itemId', removeCartItem);
router.delete('/', clearCart);

// 3.1: Promotional Coupon Codes
router.post('/apply-coupon', applyCoupon);
router.post('/coupon', applyCoupon);
router.delete('/remove-coupon', removeCoupon);
router.delete('/coupon', removeCoupon);

// 3.2: Loyalty Privilege Points
router.post('/apply-rewards', applyRewardPoints);
router.post('/rewards', applyRewardPoints);
router.delete('/remove-rewards', removeRewardPoints);
router.delete('/rewards', removeRewardPoints);

// 3.1: Gift preferences & Checkout Summary
router.put('/gift-options', updateGiftOptions);
router.get('/checkout-summary', getCheckoutSummary);

export default router;
