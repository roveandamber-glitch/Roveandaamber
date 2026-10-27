import express from 'express';
import {
  getAccountOverview,
  getAccountOrders,
  getAccountOrderDetails,
  getSavedAddresses,
  addSavedAddress,
  updateSavedAddress,
  deleteSavedAddress,
  setDefaultAddress,
  getAccountWishlist,
  checkOrderEligibility,
  cancelOrder,
  requestOrderReturn
} from '../controllers/userController.js';
import {
  getDeliveryTracking,
  getInvoiceData,
  downloadInvoicePDF
} from '../controllers/orderController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { validateAddress, validateOrderAction } from '../validators/userValidator.js';

const router = express.Router();

// Strict Security: All account management endpoints require valid customer JWT authentication
router.use(protect);

// ==========================================
// 8.1 Customer Account Overview
// ==========================================
router.get('/account', getAccountOverview);
router.get('/overview', getAccountOverview);

// ==========================================
// 8.2 Current & Previous Orders, Tracking, Invoices
// ==========================================
router.get('/orders', getAccountOrders);
router.get('/orders/:id', getAccountOrderDetails);
router.get('/orders/:id/track', getDeliveryTracking);
router.get('/orders/:id/invoice', getInvoiceData);
router.get('/orders/:id/invoice/download', downloadInvoicePDF);

// ==========================================
// 8.3 Cancellation & Return Options
// ==========================================
router.get('/orders/:id/eligibility', checkOrderEligibility);
router.post('/orders/:id/cancel', validateOrderAction, cancelOrder);
router.post('/orders/:id/return', validateOrderAction, requestOrderReturn);

// ==========================================
// 8.4 Saved Delivery Addresses
// ==========================================
router.get('/addresses', getSavedAddresses);
router.post('/addresses', validateAddress, addSavedAddress);
router.put('/addresses/:addressId', validateAddress, updateSavedAddress);
router.delete('/addresses/:addressId', deleteSavedAddress);
router.patch('/addresses/:addressId/default', setDefaultAddress);

// ==========================================
// 8.5 Account Wishlist Access
// ==========================================
router.get('/wishlist', getAccountWishlist);

export default router;
