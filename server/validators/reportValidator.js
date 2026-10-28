/**
 * Validates parameters for monthly sales report
 */
export const validateMonthlyReportParams = (req, res, next) => {
  const { month, year } = req.query;

  if (month !== undefined) {
    const m = parseInt(month, 10);
    if (isNaN(m) || m < 1 || m > 12) {
      return res.status(400).json({
        success: false,
        message: 'Month must be an integer between 1 and 12.'
      });
    }
  }

  if (year !== undefined) {
    const y = parseInt(year, 10);
    if (isNaN(y) || y < 2020 || y > 2035) {
      return res.status(400).json({
        success: false,
        message: 'Year must be a valid 4-digit year between 2020 and 2035.'
      });
    }
  }

  next();
};

/**
 * Validates date parameter for daily sales report
 */
export const validateDailyReportParams = (req, res, next) => {
  const { date } = req.query;

  if (date) {
    const d = new Date(date);
    if (isNaN(d.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date parameter. Use YYYY-MM-DD format (e.g. 2026-10-27).'
      });
    }
  }

  next();
};

/**
 * Validates date range parameters for custom reports
 */
export const validateDateRangeParams = (req, res, next) => {
  const { startDate, endDate } = req.query;

  if (startDate) {
    const s = new Date(startDate);
    if (isNaN(s.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid startDate. Use YYYY-MM-DD format.'
      });
    }
  }

  if (endDate) {
    const e = new Date(endDate);
    if (isNaN(e.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid endDate. Use YYYY-MM-DD format.'
      });
    }
  }

  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start > end) {
      return res.status(400).json({
        success: false,
        message: 'startDate cannot be after endDate.'
      });
    }
  }

  next();
};

/**
 * Validates export format (pdf or csv)
 */
export const validateExportFormat = (req, res, next) => {
  const format = (req.query.format || req.params.format || '').toLowerCase();

  if (format && !['pdf', 'csv', 'excel'].includes(format)) {
    return res.status(400).json({
      success: false,
      message: 'Export format must be "pdf", "csv", or "excel".'
    });
  }

  next();
};
