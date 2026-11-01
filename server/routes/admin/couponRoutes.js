import express from 'express';
import {
  getAdminCoupons,
  createAdminCoupon,
  updateAdminCoupon,
  deleteAdminCoupon
} from '../../controllers/admin/couponController.js';
import { protect, adminOnly } from '../../middlewares/authMiddleware.js';

const router = express.Router();

// Apply security gate to all admin coupon routes
router.use(protect, adminOnly);

router.get('/', getAdminCoupons);
router.post('/', createAdminCoupon);
router.put('/:id', updateAdminCoupon);
router.patch('/:id', updateAdminCoupon);
router.delete('/:id', deleteAdminCoupon);

export default router;

