import mongoose from 'mongoose';

/**
 * Validates stock adjustment inputs (Restock, Damage/Expiry, Manual Adjustment)
 */
export const validateStockAdjustment = (req, res, next) => {
  const { quantityChange, changeType, size } = req.body;

  if (quantityChange === undefined || isNaN(Number(quantityChange)) || Number(quantityChange) === 0) {
    return res.status(400).json({
      success: false,
      message: 'A non-zero numeric quantityChange is required (positive to add, negative to reduce).'
    });
  }

  const validChangeTypes = [
    'Restock',
    'Manual Adjustment',
    'Damage / Expiry',
    'Stock Reconciliation',
    'Order Placed',
    'Order Cancelled',
    'Return Received'
  ];

  if (changeType && !validChangeTypes.includes(changeType)) {
    return res.status(400).json({
      success: false,
      message: `Invalid changeType. Allowed: ${validChangeTypes.join(', ')}`
    });
  }

  if (size && typeof size !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Product size must be a string (e.g. "50ml", "100ml", or "All").'
    });
  }

  next();
};

/**
 * Validates stock threshold configuration inputs
 */
export const validateThresholdUpdate = (req, res, next) => {
  const { lowStockThreshold, reorderQuantity, sku } = req.body;

  if (lowStockThreshold === undefined && reorderQuantity === undefined && !sku) {
    return res.status(400).json({
      success: false,
      message: 'Provide at least lowStockThreshold, reorderQuantity, or sku to update.'
    });
  }

  if (lowStockThreshold !== undefined) {
    if (isNaN(Number(lowStockThreshold)) || Number(lowStockThreshold) < 0 || !Number.isInteger(Number(lowStockThreshold))) {
      return res.status(400).json({
        success: false,
        message: 'lowStockThreshold must be a non-negative integer.'
      });
    }
  }

  if (reorderQuantity !== undefined) {
    if (isNaN(Number(reorderQuantity)) || Number(reorderQuantity) <= 0 || !Number.isInteger(Number(reorderQuantity))) {
      return res.status(400).json({
        success: false,
        message: 'reorderQuantity must be a positive integer.'
      });
    }
  }

  next();
};

/**
 * Validates physical stock reconciliation inputs
 */
export const validateStockReconciliation = (req, res, next) => {
  const { physicalCount, reason } = req.body;

  if (physicalCount === undefined || isNaN(Number(physicalCount)) || Number(physicalCount) < 0 || !Number.isInteger(Number(physicalCount))) {
    return res.status(400).json({
      success: false,
      message: 'A valid non-negative integer physicalCount is required for stock reconciliation.'
    });
  }

  if (!reason || typeof reason !== 'string' || reason.trim().length < 5) {
    return res.status(400).json({
      success: false,
      message: 'A reconciliation reason of at least 5 characters is required for audit compliance.'
    });
  }

  next();
};

/**
 * Validates batch restock payload
 */
export const validateBatchRestock = (req, res, next) => {
  const { items, batchNumber } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'items array is required containing at least one product restock entry.'
    });
  }

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (!item.productId || (!mongoose.Types.ObjectId.isValid(item.productId) && typeof item.productId !== 'string')) {
      return res.status(400).json({
        success: false,
        message: `Item at index ${i} is missing a valid productId.`
      });
    }

    if (item.quantity === undefined || isNaN(Number(item.quantity)) || Number(item.quantity) <= 0) {
      return res.status(400).json({
        success: false,
        message: `Item at index ${i} must have a positive integer quantity.`
      });
    }
  }

  next();
};
