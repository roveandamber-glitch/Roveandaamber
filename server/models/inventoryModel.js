import mongoose from 'mongoose';
import { Product } from './productModel.js';

const inventoryLogSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product reference is required'],
      index: true
    },
    productName: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true
    },
    sku: {
      type: String,
      trim: true,
      default: ''
    },
    changeType: {
      type: String,
      enum: [
        'Restock',
        'Order Placed',
        'Order Cancelled',
        'Return Received',
        'Manual Adjustment',
        'Damage / Expiry',
        'Stock Reconciliation'
      ],
      required: [true, 'Change type is required'],
      index: true
    },
    quantityChange: {
      type: Number,
      required: [true, 'Quantity change is required']
    },
    previousStock: {
      type: Number,
      required: [true, 'Previous stock level is required']
    },
    newStock: {
      type: Number,
      required: [true, 'New stock level is required']
    },
    size: {
      type: String,
      default: 'All',
      trim: true
    },
    referenceId: {
      type: String,
      default: '',
      trim: true,
      index: true
    },
    reason: {
      type: String,
      default: '',
      trim: true
    },
    performedBy: {
      type: String,
      default: 'System',
      trim: true
    },
    batchNumber: {
      type: String,
      default: '',
      trim: true
    },
    costPerUnit: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        return ret;
      }
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        return ret;
      }
    }
  }
);

inventoryLogSchema.virtual('id').get(function () {
  return this._id ? this._id.toString() : null;
});

export const InventoryLog = mongoose.models.InventoryLog || mongoose.model('InventoryLog', inventoryLogSchema);

export const InventoryModel = {
  /**
   * Record a new inventory movement
   */
  recordMovement: async ({
    productId,
    productName,
    sku = '',
    changeType,
    quantityChange,
    previousStock,
    newStock,
    size = 'All',
    referenceId = '',
    reason = '',
    performedBy = 'System',
    batchNumber = '',
    costPerUnit = 0
  }) => {
    return InventoryLog.create({
      productId,
      productName,
      sku,
      changeType,
      quantityChange,
      previousStock,
      newStock,
      size,
      referenceId,
      reason,
      performedBy,
      batchNumber,
      costPerUnit
    });
  },

  /**
   * Find inventory movement history with filtering & pagination
   */
  findHistory: async ({
    productId,
    changeType,
    startDate,
    endDate,
    search,
    page = 1,
    limit = 20
  } = {}) => {
    const query = {};

    if (productId && mongoose.Types.ObjectId.isValid(productId)) {
      query.productId = productId;
    }

    if (changeType) {
      query.changeType = changeType;
    }

    if (search) {
      query.$or = [
        { productName: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { referenceId: { $regex: search, $options: 'i' } },
        { reason: { $regex: search, $options: 'i' } }
      ];
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const [logs, total] = await Promise.all([
      InventoryLog.find(query)
        .populate('productId', 'name slug image categoryName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      InventoryLog.countDocuments(query)
    ]);

    return {
      logs: logs.map(l => ({
        ...l,
        _id: l._id.toString(),
        id: l._id.toString()
      })),
      pagination: {
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum),
        limit: limitNum
      }
    };
  },

  /**
   * Seed realistic initial inventory movements for demonstration and audit trails
   */
  seedDefaultInventoryHistory: async () => {
    const count = await InventoryLog.countDocuments();
    if (count === 0) {
      const products = await Product.find().limit(5);
      if (!products || products.length === 0) return;

      const movements = [];

      for (const p of products) {
        const currentStock = p.stock || 15;
        const initialStock = currentStock + 10;
        const sku = `RA-${p.name.slice(0, 3).toUpperCase()}-100`;

        // 1. Initial atelier batch intake
        movements.push({
          productId: p._id,
          productName: p.name,
          sku: sku,
          changeType: 'Restock',
          quantityChange: initialStock,
          previousStock: 0,
          newStock: initialStock,
          size: 'All',
          referenceId: 'BATCH-2026-AUTUMN-01',
          reason: 'Initial atelier master batch bottling intake',
          performedBy: 'Master Perfumer Atelier',
          batchNumber: 'LOT-2026-A1',
          costPerUnit: Math.round(p.price * 0.45)
        });

        // 2. Order sales deductions
        movements.push({
          productId: p._id,
          productName: p.name,
          sku: sku,
          changeType: 'Order Placed',
          quantityChange: -10,
          previousStock: initialStock,
          newStock: currentStock,
          size: '50ml',
          referenceId: '#ORD-1001',
          reason: 'Customer online order fulfillment',
          performedBy: 'E-Commerce Checkout System'
        });
      }

      await InventoryLog.insertMany(movements);
      console.log('✨ Seeded initial inventory movement logs and audit records');
    }
  }
};

export default InventoryLog;
