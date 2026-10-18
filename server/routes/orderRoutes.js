import express from 'express';
import {
  createOrder,
  updateOrderStatus,
  getMyOrders,
  getAllOrders
} from '../controllers/orderController.js';
import { protect, adminOnly } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Order Placement (Protected for logged-in users)
router.post('/', protect, createOrder);

// Authenticated customer view personal orders (Read-only status tracking)
router.get('/my', protect, getMyOrders);

// Admin-only: View all orders across all users
router.get('/all', protect, adminOnly, getAllOrders);
router.get('/', protect, adminOnly, getAllOrders);

// Admin-only: Update order status
router.patch('/:id/status', protect, adminOnly, updateOrderStatus);
router.put('/:id/status', protect, adminOnly, updateOrderStatus);

export default router;
