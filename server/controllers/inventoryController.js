import mongoose from 'mongoose';
import { ProductModel, Product } from '../models/productModel.js';
import { InventoryModel, InventoryLog } from '../models/inventoryModel.js';

/**
 * Helper to parse sizes map safely
 */
const parseSizesMap = (sizesVal, defaultStock = 0) => {
  if (!sizesVal) {
    const s50 = Math.floor(defaultStock * 0.6) || 0;
    const s100 = Math.max(0, defaultStock - s50);
    return { '50ml': s50, '100ml': s100 };
  }

  if (typeof sizesVal === 'object' && !Array.isArray(sizesVal)) {
    return sizesVal;
  }

  try {
    const parsed = JSON.parse(sizesVal);
    if (typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed;
    }
  } catch {}

  const s50 = Math.floor(defaultStock * 0.6) || 0;
  const s100 = Math.max(0, defaultStock - s50);
  return { '50ml': s50, '100ml': s100 };
};

/* ==========================================================================
   10.1 INVENTORY MANAGEMENT
   • Maintain stock quantities for perfume products.
   • Update stock after relevant order and restocking events.
   • View available product quantities.
   • Maintain inventory records for effective stock control.
   ========================================================================== */

/**
 * GET /api/admin/inventory
 * View available product quantities and overall stock health summary
 */
export const getInventoryOverview = async (req, res) => {
  try {
    const { search, category, status, sortBy, page, limit } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { fragranceFamily: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) {
      query.categoryName = { $regex: category, $options: 'i' };
    }

    const allProducts = await Product.find(query).sort({ createdAt: -1 }).lean();

    // Calculate aggregated metrics
    let totalInventoryUnits = 0;
    let totalValuation = 0;
    let inStockCount = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    const formattedProducts = allProducts.map(p => {
      const stock = p.stock !== undefined ? p.stock : 0;
      const threshold = p.lowStockThreshold !== undefined ? p.lowStockThreshold : 5;
      const reorderQty = p.reorderQuantity || 15;
      const sizesMap = parseSizesMap(p.sizes, stock);

      totalInventoryUnits += stock;
      totalValuation += (p.price || 0) * stock;

      let stockStatus = 'In Stock';
      if (stock === 0) {
        stockStatus = 'Out of Stock';
        outOfStockCount++;
      } else if (stock <= threshold) {
        stockStatus = 'Low Stock';
        lowStockCount++;
      } else {
        inStockCount++;
      }

      const defaultSku = p.sku || `RA-${p.name.slice(0, 3).toUpperCase()}-${String(p._id).slice(-4).toUpperCase()}`;

      return {
        id: p._id.toString(),
        _id: p._id.toString(),
        name: p.name,
        slug: p.slug,
        image: p.image || '',
        categoryName: p.categoryName || 'Haute Parfumerie',
        price: p.price,
        sku: defaultSku,
        stock,
        sizes: sizesMap,
        lowStockThreshold: threshold,
        reorderQuantity: reorderQty,
        stockStatus,
        isLowStock: stock <= threshold,
        lastRestockedAt: p.lastRestockedAt || p.updatedAt
      };
    });

    // Filter by stockStatus if requested
    let filtered = formattedProducts;
    if (status) {
      const target = status.toLowerCase().replace('-', ' ');
      filtered = formattedProducts.filter(p => p.stockStatus.toLowerCase() === target);
    }

    // Sort options
    if (sortBy === 'stock_asc') {
      filtered.sort((a, b) => a.stock - b.stock);
    } else if (sortBy === 'stock_desc') {
      filtered.sort((a, b) => b.stock - a.stock);
    } else if (sortBy === 'name') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    // Pagination
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 25;
    const startIndex = (pageNum - 1) * limitNum;
    const paginated = filtered.slice(startIndex, startIndex + limitNum);

    return res.json({
      success: true,
      data: {
        summary: {
          totalProducts: allProducts.length,
          totalInventoryUnits,
          totalValuation,
          inStockCount,
          lowStockCount,
          outOfStockCount,
          averageStockPerProduct: allProducts.length > 0 ? Math.round(totalInventoryUnits / allProducts.length) : 0
        },
        products: paginated,
        pagination: {
          total: filtered.length,
          page: pageNum,
          totalPages: Math.ceil(filtered.length / limitNum),
          limit: limitNum
        }
      }
    });
  } catch (error) {
    console.error('Inventory overview error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve inventory overview.' });
  }
};

/**
 * GET /api/admin/inventory/product/:id
 * View detailed inventory records, size breakdown, and recent stock movements for a perfume
 */
export const getProductInventoryDetails = async (req, res) => {
  try {
    const { id } = req.params;

    let product = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      product = await Product.findById(id).lean();
    }
    if (!product) {
      product = await Product.findOne({ slug: id }).lean();
    }

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found in inventory.' });
    }

    const stock = product.stock || 0;
    const threshold = product.lowStockThreshold !== undefined ? product.lowStockThreshold : 5;
    const sizesMap = parseSizesMap(product.sizes, stock);
    const sku = product.sku || `RA-${product.name.slice(0, 3).toUpperCase()}-${String(product._id).slice(-4).toUpperCase()}`;

    // Recent 15 inventory logs for this product
    const recentLogs = await InventoryLog.find({ productId: product._id })
      .sort({ createdAt: -1 })
      .limit(15)
      .lean();

    return res.json({
      success: true,
      data: {
        product: {
          id: product._id.toString(),
          _id: product._id.toString(),
          name: product.name,
          slug: product.slug,
          sku,
          image: product.image,
          price: product.price,
          categoryName: product.categoryName,
          stock,
          sizes: sizesMap,
          lowStockThreshold: threshold,
          reorderQuantity: product.reorderQuantity || 15,
          status: stock > 0 ? (stock <= threshold ? 'Low Stock' : 'In Stock') : 'Out of Stock',
          lastRestockedAt: product.lastRestockedAt
        },
        recentMovements: recentLogs.map(l => ({
          id: l._id.toString(),
          changeType: l.changeType,
          quantityChange: l.quantityChange,
          previousStock: l.previousStock,
          newStock: l.newStock,
          size: l.size,
          referenceId: l.referenceId,
          reason: l.reason,
          performedBy: l.performedBy,
          createdAt: l.createdAt
        }))
      }
    });
  } catch (error) {
    console.error('Get product inventory details error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve product inventory records.' });
  }
};

/**
 * POST /api/admin/inventory/adjust
 * Update stock quantities (Restocking, Damage/Expiry, or Manual Adjustment) with audit logging
 */
export const adjustProductStock = async (req, res) => {
  try {
    const {
      productId,
      quantityChange,
      changeType = 'Restock',
      size = 'All',
      referenceId,
      reason,
      batchNumber,
      costPerUnit
    } = req.body;

    let product = null;
    if (mongoose.Types.ObjectId.isValid(productId)) {
      product = await Product.findById(productId);
    }
    if (!product) {
      product = await Product.findOne({ slug: productId });
    }

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const qty = parseInt(quantityChange, 10);
    const previousStock = product.stock || 0;
    const newStock = Math.max(0, previousStock + qty);

    let sizesMap = parseSizesMap(product.sizes, previousStock);

    if (size && size !== 'All') {
      const currSizeQty = sizesMap[size] !== undefined ? sizesMap[size] : 0;
      sizesMap[size] = Math.max(0, currSizeQty + qty);
      // Recalculate total stock from size sum
      const totalFromSizes = Object.values(sizesMap).reduce((sum, v) => sum + (parseInt(v, 10) || 0), 0);
      product.stock = totalFromSizes;
    } else {
      product.stock = newStock;
      // Proportionally adjust sizes if 'All'
      const ratio = previousStock > 0 ? newStock / previousStock : 1;
      for (const s of Object.keys(sizesMap)) {
        sizesMap[s] = Math.max(0, Math.round(sizesMap[s] * ratio));
      }
    }

    product.sizes = JSON.stringify(sizesMap);

    if (changeType === 'Restock') {
      product.lastRestockedAt = new Date();
    }

    await product.save();

    const performedBy = req.user ? (req.user.name || req.user.email) : 'Inventory Administrator';
    const sku = product.sku || `RA-${product.name.slice(0, 3).toUpperCase()}-${String(product._id).slice(-4).toUpperCase()}`;

    // Create immutable audit record
    const log = await InventoryModel.recordMovement({
      productId: product._id,
      productName: product.name,
      sku,
      changeType,
      quantityChange: qty,
      previousStock,
      newStock: product.stock,
      size,
      referenceId: referenceId || (changeType === 'Restock' ? `RESTOCK-${Date.now().toString().slice(-6)}` : ''),
      reason: reason || `${changeType} of ${Math.abs(qty)} units by ${performedBy}.`,
      performedBy,
      batchNumber: batchNumber || '',
      costPerUnit: costPerUnit ? Number(costPerUnit) : 0
    });

    return res.json({
      success: true,
      message: `Stock successfully updated. New inventory level: ${product.stock} units.`,
      data: {
        product: {
          id: product._id.toString(),
          name: product.name,
          stock: product.stock,
          sizes: sizesMap,
          status: product.stock > 0 ? (product.stock <= (product.lowStockThreshold || 5) ? 'Low Stock' : 'In Stock') : 'Out of Stock'
        },
        movementRecord: log
      }
    });
  } catch (error) {
    console.error('Adjust product stock error:', error);
    return res.status(500).json({ success: false, message: 'Failed to adjust stock quantities.' });
  }
};

/**
 * POST /api/admin/inventory/batch-restock
 * Restock multiple perfume products in a single shipment intake
 */
export const batchRestock = async (req, res) => {
  try {
    const { items, batchNumber, reason, supplierName } = req.body;

    const restockBatchId = batchNumber || `SHIPMENT-${Date.now().toString().slice(-6)}`;
    const performedBy = req.user ? (req.user.name || req.user.email) : 'Atelier Warehouse Manager';

    const processedLogs = [];
    const updatedProducts = [];

    for (const item of items) {
      let product = null;
      if (mongoose.Types.ObjectId.isValid(item.productId)) {
        product = await Product.findById(item.productId);
      }
      if (!product) {
        product = await Product.findOne({ slug: item.productId });
      }

      if (!product) continue;

      const qty = parseInt(item.quantity, 10);
      const size = item.size || 'All';
      const prevStock = product.stock || 0;
      const newStock = prevStock + qty;

      let sizesMap = parseSizesMap(product.sizes, prevStock);
      if (size !== 'All') {
        sizesMap[size] = (sizesMap[size] || 0) + qty;
        product.stock = Object.values(sizesMap).reduce((s, v) => s + (parseInt(v, 10) || 0), 0);
      } else {
        product.stock = newStock;
        const ratio = prevStock > 0 ? newStock / prevStock : 1;
        for (const s of Object.keys(sizesMap)) {
          sizesMap[s] = Math.round(sizesMap[s] * ratio);
        }
      }

      product.sizes = JSON.stringify(sizesMap);
      product.lastRestockedAt = new Date();
      await product.save();

      const sku = product.sku || `RA-${product.name.slice(0, 3).toUpperCase()}-${String(product._id).slice(-4).toUpperCase()}`;

      const log = await InventoryModel.recordMovement({
        productId: product._id,
        productName: product.name,
        sku,
        changeType: 'Restock',
        quantityChange: qty,
        previousStock: prevStock,
        newStock: product.stock,
        size,
        referenceId: restockBatchId,
        reason: reason || `Batch replenishment intake from ${supplierName || 'Atelier Production'}`,
        performedBy,
        batchNumber: restockBatchId,
        costPerUnit: item.costPerUnit || 0
      });

      processedLogs.push(log);
      updatedProducts.push({
        id: product._id.toString(),
        name: product.name,
        newStock: product.stock
      });
    }

    return res.status(201).json({
      success: true,
      message: `Batch restock complete for ${updatedProducts.length} perfume products.`,
      data: {
        batchNumber: restockBatchId,
        restockedCount: updatedProducts.length,
        products: updatedProducts,
        logs: processedLogs
      }
    });
  } catch (error) {
    console.error('Batch restock error:', error);
    return res.status(500).json({ success: false, message: 'Failed to process batch restock.' });
  }
};

/* ==========================================================================
   10.2 LOW-STOCK ALERTS
   • Configure minimum stock thresholds.
   • Identify products approaching low-stock levels.
   • Display low-stock notifications in the admin dashboard.
   • Help administrators identify products requiring replenishment.
   ========================================================================== */

/**
 * GET /api/admin/inventory/alerts
 * Identify products approaching or below minimum low-stock thresholds
 */
export const getLowStockAlerts = async (req, res) => {
  try {
    const { threshold: thresholdQuery } = req.query;

    const allProducts = await Product.find().lean();

    const lowStockAlerts = [];

    for (const p of allProducts) {
      const stock = p.stock !== undefined ? p.stock : 0;
      const minThreshold = thresholdQuery !== undefined
        ? parseInt(thresholdQuery, 10)
        : (p.lowStockThreshold !== undefined ? p.lowStockThreshold : 5);
      const reorderQty = p.reorderQuantity || 15;

      if (stock <= minThreshold) {
        const deficit = Math.max(0, minThreshold - stock);
        const sizesMap = parseSizesMap(p.sizes, stock);
        const sku = p.sku || `RA-${p.name.slice(0, 3).toUpperCase()}-${String(p._id).slice(-4).toUpperCase()}`;

        lowStockAlerts.push({
          id: p._id.toString(),
          _id: p._id.toString(),
          name: p.name,
          slug: p.slug,
          image: p.image || '',
          categoryName: p.categoryName || 'Haute Parfumerie',
          sku,
          currentStock: stock,
          sizes: sizesMap,
          lowStockThreshold: minThreshold,
          suggestedReorderQuantity: reorderQty,
          deficitUnits: deficit,
          urgency: stock === 0 ? 'Critical Out of Stock' : 'Low Stock Warning',
          estimatedRestockCost: Math.round(reorderQty * (p.price * 0.45)),
          lastRestockedAt: p.lastRestockedAt || p.updatedAt
        });
      }
    }

    // Sort: Critical out-of-stock first, then lowest stock
    lowStockAlerts.sort((a, b) => a.currentStock - b.currentStock);

    return res.json({
      success: true,
      data: {
        totalAlerts: lowStockAlerts.length,
        criticalOutOfStock: lowStockAlerts.filter(a => a.currentStock === 0).length,
        approachingLowStock: lowStockAlerts.filter(a => a.currentStock > 0).length,
        alerts: lowStockAlerts
      }
    });
  } catch (error) {
    console.error('Low stock alerts error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch low-stock alerts.' });
  }
};

/**
 * PUT /api/admin/inventory/thresholds/:id
 * Configure minimum stock thresholds and replenishment targets for a perfume
 */
export const configureStockThresholds = async (req, res) => {
  try {
    const { id } = req.params;
    const { lowStockThreshold, reorderQuantity, sku } = req.body;

    let product = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      product = await Product.findById(id);
    }
    if (!product) {
      product = await Product.findOne({ slug: id });
    }

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    if (lowStockThreshold !== undefined) {
      product.lowStockThreshold = parseInt(lowStockThreshold, 10);
    }
    if (reorderQuantity !== undefined) {
      product.reorderQuantity = parseInt(reorderQuantity, 10);
    }
    if (sku !== undefined) {
      product.sku = sku.trim();
    }

    await product.save();

    return res.json({
      success: true,
      message: `Inventory thresholds updated for ${product.name}.`,
      data: {
        productId: product._id.toString(),
        name: product.name,
        sku: product.sku,
        lowStockThreshold: product.lowStockThreshold,
        reorderQuantity: product.reorderQuantity,
        currentStock: product.stock,
        isCurrentlyLowStock: product.stock <= product.lowStockThreshold
      }
    });
  } catch (error) {
    console.error('Configure thresholds error:', error);
    return res.status(500).json({ success: false, message: 'Failed to configure stock thresholds.' });
  }
};

/**
 * GET /api/admin/inventory/notifications
 * Fast real-time notifications for the admin dashboard header & widget
 */
export const getLowStockNotifications = async (req, res) => {
  try {
    const products = await Product.find().lean();
    const notifications = [];

    for (const p of products) {
      const stock = p.stock || 0;
      const threshold = p.lowStockThreshold !== undefined ? p.lowStockThreshold : 5;

      if (stock <= threshold) {
        notifications.push({
          productId: p._id.toString(),
          productName: p.name,
          currentStock: stock,
          threshold,
          urgency: stock === 0 ? 'critical' : 'warning',
          message: stock === 0
            ? `${p.name} is completely OUT OF STOCK (0 units left). Replenish immediately.`
            : `${p.name} is low on stock (${stock} left, threshold: ${threshold}).`
        });
      }
    }

    return res.json({
      success: true,
      data: {
        count: notifications.length,
        hasCritical: notifications.some(n => n.urgency === 'critical'),
        notifications
      }
    });
  } catch (error) {
    console.error('Inventory notifications error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve notifications.' });
  }
};

/* ==========================================================================
   10.3 INVENTORY HISTORY & RECONCILIATION
   • Maintain records of stock additions and reductions.
   • Track stock changes associated with orders and restocking.
   • Review historical inventory movements.
   • Support stock reconciliation and inventory monitoring.
   ========================================================================== */

/**
 * GET /api/admin/inventory/history
 * Review historical inventory movements (additions, reductions, orders, restocks)
 */
export const getInventoryHistory = async (req, res) => {
  try {
    const { productId, changeType, startDate, endDate, search, page, limit } = req.query;

    const result = await InventoryModel.findHistory({
      productId,
      changeType,
      startDate,
      endDate,
      search,
      page,
      limit
    });

    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get inventory history error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve inventory history.' });
  }
};

/**
 * POST /api/admin/inventory/reconcile/:id
 * Perform physical stock reconciliation audit for a perfume
 */
export const reconcileStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { physicalCount, reason, sizes } = req.body;

    let product = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      product = await Product.findById(id);
    }
    if (!product) {
      product = await Product.findOne({ slug: id });
    }

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const previousStock = product.stock || 0;
    const newStock = parseInt(physicalCount, 10);
    const variance = newStock - previousStock;

    let sizesMap = parseSizesMap(product.sizes, previousStock);
    if (sizes) {
      try {
        sizesMap = typeof sizes === 'string' ? JSON.parse(sizes) : sizes;
      } catch {}
    } else {
      const ratio = previousStock > 0 ? newStock / previousStock : 1;
      for (const s of Object.keys(sizesMap)) {
        sizesMap[s] = Math.max(0, Math.round(sizesMap[s] * ratio));
      }
    }

    product.stock = newStock;
    product.sizes = JSON.stringify(sizesMap);
    await product.save();

    const performedBy = req.user ? (req.user.name || req.user.email) : 'Inventory Auditor';
    const sku = product.sku || `RA-${product.name.slice(0, 3).toUpperCase()}-${String(product._id).slice(-4).toUpperCase()}`;

    // Record formal audit log
    const log = await InventoryModel.recordMovement({
      productId: product._id,
      productName: product.name,
      sku,
      changeType: 'Stock Reconciliation',
      quantityChange: variance,
      previousStock,
      newStock,
      size: 'All',
      referenceId: `AUDIT-${Date.now().toString().slice(-6)}`,
      reason: reason || `Physical stock count audit adjusted by ${variance >= 0 ? '+' : ''}${variance} units.`,
      performedBy
    });

    return res.json({
      success: true,
      message: `Stock reconciled successfully. Inventory adjusted by ${variance >= 0 ? '+' : ''}${variance} units.`,
      data: {
        product: {
          id: product._id.toString(),
          name: product.name,
          previousStock,
          newStock: product.stock,
          variance
        },
        auditRecord: log
      }
    });
  } catch (error) {
    console.error('Reconcile stock error:', error);
    return res.status(500).json({ success: false, message: 'Failed to reconcile stock.' });
  }
};

/**
 * GET /api/admin/inventory/export
 * Export inventory reconciliation and audit sheet data
 */
export const exportInventoryReport = async (req, res) => {
  try {
    const products = await Product.find().sort({ name: 1 }).lean();

    const reportRows = products.map((p, index) => {
      const stock = p.stock || 0;
      const threshold = p.lowStockThreshold !== undefined ? p.lowStockThreshold : 5;
      const reorderQty = p.reorderQuantity || 15;
      const valuation = stock * (p.price || 0);
      const sku = p.sku || `RA-${p.name.slice(0, 3).toUpperCase()}-${String(p._id).slice(-4).toUpperCase()}`;

      return {
        itemNumber: index + 1,
        productId: p._id.toString(),
        sku,
        name: p.name,
        category: p.categoryName || 'Haute Parfumerie',
        unitPrice: p.price,
        currentStock: stock,
        threshold,
        reorderQuantity: reorderQty,
        stockStatus: stock === 0 ? 'Out of Stock' : (stock <= threshold ? 'Low Stock' : 'In Stock'),
        valuation,
        lastRestockedAt: p.lastRestockedAt ? p.lastRestockedAt.toISOString() : ''
      };
    });

    return res.json({
      success: true,
      generatedAt: new Date().toISOString(),
      totalItems: reportRows.length,
      data: reportRows
    });
  } catch (error) {
    console.error('Export inventory report error:', error);
    return res.status(500).json({ success: false, message: 'Failed to generate inventory report.' });
  }
};
