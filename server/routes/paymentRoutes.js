import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  createPaymentOrder,
  verifyPayment,
  handlePaymentFailure,
  getPaymentStatus
} from '../controllers/paymentController.js';
import { optionalAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Payment Specific Rate Limiter (Fraud prevention & anti-spam)
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
router.use(optionalAuth);

// 3.2: Razorpay Payment Integration Endpoints
router.post('/create-order', createPaymentOrder);
router.post('/verify', verifyPayment);
router.post('/failure', handlePaymentFailure);
router.get('/status', getPaymentStatus);
router.get('/status/:orderId', getPaymentStatus);

export default router;
