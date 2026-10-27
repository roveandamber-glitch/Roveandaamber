import express from 'express';
import {
  getMonthlySalesReport,
  getDailySalesReport,
  getCustomRangeSalesReport,
  getCustomerPurchaseAnalytics,
  downloadSalesReportPDF,
  downloadSalesReportCSV
} from '../controllers/reportController.js';
import { protect, adminOnly } from '../middlewares/authMiddleware.js';
import {
  validateMonthlyReportParams,
  validateDailyReportParams,
  validateDateRangeParams,
  validateExportFormat
} from '../validators/reportValidator.js';

const router = express.Router();

// Apply administrative role security gate to all reporting routes
router.use(protect, adminOnly);

/* --------------------------------------------------------------------------
   11.1 MONTHLY SALES REPORTS & EXPORTS
   -------------------------------------------------------------------------- */
router.get('/monthly', validateMonthlyReportParams, getMonthlySalesReport);
router.get('/export/pdf', validateExportFormat, downloadSalesReportPDF);
router.get('/export/csv', validateExportFormat, downloadSalesReportCSV);

/* --------------------------------------------------------------------------
   11.2 ADDITIONAL REPORTING OPTIONS (DAILY & CUSTOM)
   -------------------------------------------------------------------------- */
router.get('/daily', validateDailyReportParams, getDailySalesReport);
router.get('/custom', validateDateRangeParams, getCustomRangeSalesReport);

/* --------------------------------------------------------------------------
   11.3 CUSTOMER PURCHASE ANALYTICS
   -------------------------------------------------------------------------- */
router.get('/analytics', getCustomerPurchaseAnalytics);

export default router;
