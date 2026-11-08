import express from 'express';
import { 
  getRewardsDashboard, 
  updateRewardRules,
  getUserRewardHistory,
  adjustUserPoints,
  toggleUserWallet
} from '../../controllers/admin/rewardController.js';
import { protect, adminOnly } from '../../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(adminOnly);

router.get('/', getRewardsDashboard);
router.put('/rules', updateRewardRules);
router.get('/user/:userId/history', getUserRewardHistory);
router.put('/user/:userId/points', adjustUserPoints);
router.put('/user/:userId/wallet', toggleUserWallet);

export default router;
