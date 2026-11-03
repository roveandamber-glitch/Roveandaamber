import express from 'express';
import { getRewardsDashboard, updateRewardRules } from '../../controllers/admin/rewardController.js';
import { protect, adminOnly } from '../../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(adminOnly);

router.get('/', getRewardsDashboard);
router.put('/rules', updateRewardRules);

export default router;
