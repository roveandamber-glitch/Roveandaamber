import express from 'express';
import {
  getInventoryOverview,
  getProductInventoryDetails,
  adjustProductStock,
  batchRestock,
  getLowStockAlerts,
  configureStockThresholds,
  getLowStockNotifications,
  getInventoryHistory,
  reconcileStock,
  exportInventoryReport
} from '../../controllers/admin/inventoryController.js';
import { protect, adminOnly } from '../../middlewares/authMiddleware.js';
import {
  validateStockAdjustment,
  validateThresholdUpdate,
  validateStockReconciliation,
  validateBatchRestock
} from '../../validators/inventoryValidator.js';

const router = express.Router();

// Apply admin security protection to all inventory endpoints
router.use(protect, adminOnly);

/* --------------------------------------------------------------------------
   10.1 INVENTORY MANAGEMENT
   -------------------------------------------------------------------------- */
router.get('/', getInventoryOverview);
router.get('/product/:id', getProductInventoryDetails);
router.post('/adjust', validateStockAdjustment, adjustProductStock);
router.post('/batch-restock', validateBatchRestock, batchRestock);

/* --------------------------------------------------------------------------
   10.2 LOW-STOCK ALERTS
   -------------------------------------------------------------------------- */
router.get('/alerts', getLowStockAlerts);
router.put('/thresholds/:id', validateThresholdUpdate, configureStockThresholds);
router.get('/notifications', getLowStockNotifications);

/* --------------------------------------------------------------------------
   10.3 INVENTORY HISTORY & RECONCILIATION
   -------------------------------------------------------------------------- */
router.get('/history', getInventoryHistory);
router.post('/reconcile/:id', validateStockReconciliation, reconcileStock);
router.get('/export', exportInventoryReport);

export default router;
