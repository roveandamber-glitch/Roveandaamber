import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  createPaymentOrder,
  verifyPayment,
  handlePaymentFailure,
  getPaymentStatus,
  handleRazorpayWebhook
} from '../../controllers/user/paymentController.js';
import { protect, optionalAuth } from '../../middlewares/authMiddleware.js';

const router = express.Router();

// Webhook endpoint (must accept raw payloads directly from Razorpay without auth token)
router.post('/webhook', handleRazorpayWebhook);

// Payment Specific Rate Limiter (Fraud prevention & anti-spam for client actions)
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Payment requests limit reached. Please wait a few moments before trying again.'
  }
});

router.use(paymentLimiter);

// 3.2: Razorpay Payment Integration Endpoints (Strictly Protected for Authenticated Customer Accounts)
router.post('/create-order', protect, createPaymentOrder);
router.post('/verify', protect, verifyPayment);
router.post('/failure', protect, handlePaymentFailure);
router.get('/status', optionalAuth, getPaymentStatus);
router.get('/status/:orderId', optionalAuth, getPaymentStatus);

export default router;
