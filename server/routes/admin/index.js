import express from 'express';
import adminRoutes from './adminRoutes.js';
import inventoryRoutes from './inventoryRoutes.js';
import reportRoutes from './reportRoutes.js';
import couponRoutes from './couponRoutes.js';
import rewardRoutes from './rewardRoutes.js';

const router = express.Router();

router.use('/', adminRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/reports', reportRoutes);
router.use('/coupons', couponRoutes);
router.use('/rewards', rewardRoutes);

export { adminRoutes, inventoryRoutes, reportRoutes, couponRoutes, rewardRoutes };
export default router;
