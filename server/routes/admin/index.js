import express from 'express';
import adminRoutes from './adminRoutes.js';
import inventoryRoutes from './inventoryRoutes.js';
import reportRoutes from './reportRoutes.js';

const router = express.Router();

router.use('/', adminRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/reports', reportRoutes);

export { adminRoutes, inventoryRoutes, reportRoutes };
export default router;
