import express from 'express';
import {
  createOrder,
  getOrderConfirmation,
  getMyOrders,
  getOrderById,
  getDeliveryTracking,
  trackGuestOrder,
  updateDeliveryTracking,
  getInvoiceData,
  downloadInvoicePDF,
  getAllInvoices,
  updateOrderStatus,
  getAllOrders,
  resendOrderConfirmationEmail,
  resendPaymentConfirmationEmail,
  sendOrderInvoiceEmail,
  sendOrderTrackingEmail,
  sendCustomTransactionalEmail,
  getEmailServiceStatus
} from '../../controllers/user/orderController.js';
import { protect, optionalAuth, adminOnly } from '../../middlewares/authMiddleware.js';
import { validateCreateOrder } from '../../validators/orderValidator.js';

const router = express.Router();

// ==========================================
// 7. Automated Email Notifications & Telemetry
// ==========================================
// Check email configuration & telemetry status
router.get('/email/status', getEmailServiceStatus);

// Resend order confirmation email (Protected for order owner or verified guest)
router.post('/:id/email/confirmation', optionalAuth, resendOrderConfirmationEmail);

// Resend payment receipt email (Protected for order owner or verified guest)
router.post('/:id/email/payment', optionalAuth, resendPaymentConfirmationEmail);

// Send PDF tax invoice via email (Protected for order owner or admin, supports custom recipient)
router.post('/:id/email/invoice', optionalAuth, sendOrderInvoiceEmail);

// Send shipping & delivery progress email (Protected for order owner or admin)
router.post('/:id/email/tracking', optionalAuth, sendOrderTrackingEmail);

// Send custom transactional notification (Admin Only)
router.post('/:id/email/transactional', protect, adminOnly, sendCustomTransactionalEmail);

// ==========================================
// 4.1 Order Confirmation & History
// ==========================================
// Place Order (Supports authenticated user or guest with payload validation)
router.post('/', optionalAuth, validateCreateOrder, createOrder);

// Display order confirmation right after checkout (Supports owner auth or contact verification)
router.get('/confirmation/:id', optionalAuth, getOrderConfirmation);

// Customer personal order history (Strictly Protected: requires JWT login)
router.get('/my', protect, getMyOrders);

// ==========================================
// 4.2 Delivery Tracking
// ==========================================
// Guest tracking (Secure lookup via orderId + email/phone verification)
router.post('/track-guest', trackGuestOrder);

// Real-time delivery progress & courier tracking (Protected for order owner or verified guest)
router.get('/:id/track', optionalAuth, getDeliveryTracking);

// ==========================================
// 4.3 Invoices (JSON View & PDF Downloads)
// ==========================================
// Retrieve structured invoice JSON details (Protected for order owner or admin)
router.get('/:id/invoice', optionalAuth, getInvoiceData);

// Download official PDF invoice (Protected for order owner or admin, supports JWT in header or ?token=)
router.get('/:id/invoice/download', optionalAuth, downloadInvoicePDF);

// ==========================================
// Admin-Only Routes (Order Management, Courier Sync & Invoices)
// ==========================================
// View all generated invoices across the business
router.get('/admin/invoices/all', protect, adminOnly, getAllInvoices);

// Synchronize delivery updates and courier tracking with order management
router.put('/:id/tracking', protect, adminOnly, updateDeliveryTracking);
router.patch('/:id/tracking', protect, adminOnly, updateDeliveryTracking);

// Update order status (Processing, Shipped, Delivered, Cancelled)
router.put('/:id/status', protect, adminOnly, updateOrderStatus);
router.patch('/:id/status', protect, adminOnly, updateOrderStatus);

// View all orders across the business
router.get('/all', protect, adminOnly, getAllOrders);
router.get('/', protect, adminOnly, getAllOrders);

// Get specific order details (Protected: requester must be owner or admin)
router.get('/:id', protect, getOrderById);

export default router;
