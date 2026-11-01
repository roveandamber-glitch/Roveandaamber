import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Coupon code is required'],
      unique: true,
      uppercase: true,
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: true,
      default: 'percentage'
    },
    discountValue: {
      type: Number,
      required: [true, 'Discount value is required'],
      min: [0, 'Discount must be positive']
    },
    minOrderAmount: {
      type: Number,
      default: 0,
      min: [0, 'Minimum order amount cannot be negative']
    },
    maxDiscountAmount: {
      type: Number,
      default: null // Cap for percentage discounts
    },
    expiryDate: {
      type: Date,
      default: null
    },
    isActive: {
      type: Boolean,
      default: true
    },
    usageLimit: {
      type: Number,
      default: null
    },
    usedCount: {
      type: Number,
      default: 0
    },
    // Track each customer who has redeemed this coupon for single-use enforcement
    usedBy: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        email: { type: String, lowercase: true, trim: true },
        orderId: { type: String },
        usedAt: { type: Date, default: Date.now }
      }
    ]
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        return ret;
      }
    }
  }
);

export const Coupon = mongoose.models.Coupon || mongoose.model('Coupon', couponSchema);

export const CouponModel = {
  findByCode: async (code) => {
    if (!code) return null;
    return Coupon.findOne({ code: code.toUpperCase().trim() });
  },

  validateAndCalculate: async (code, subtotal, { userId = null, email = null } = {}) => {
    if (!code) {
      throw new Error('Please enter a coupon code.');
    }

    const cleanCode = code.toUpperCase().trim();
    const coupon = await Coupon.findOne({ code: cleanCode });

    if (!coupon) {
      throw new Error(`Promotional code "${cleanCode}" is invalid.`);
    }

    if (!coupon.isActive) {
      throw new Error(`Promotional code "${coupon.code}" is currently deactivated.`);
    }

    if (coupon.expiryDate) {
      const expDate = new Date(coupon.expiryDate);
      // Give leeway until end of the expiry day
      expDate.setHours(23, 59, 59, 999);
      if (new Date() > expDate) {
        throw new Error(`Promotional code "${coupon.code}" has expired.`);
      }
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      throw new Error(`Promotional code "${coupon.code}" has reached its maximum total usage limit.`);
    }

    if (subtotal < coupon.minOrderAmount) {
      throw new Error(
        `Code "${coupon.code}" requires a minimum spend of ₹${coupon.minOrderAmount}. Current subtotal: ₹${subtotal}`
      );
    }

    // Single-use per customer rule: User cannot use same coupon multiple times across orders
    if (userId || email) {
      const normalizedEmail = email ? email.trim().toLowerCase() : null;

      // 1. Check coupon.usedBy array
      const alreadyInUsedBy = coupon.usedBy && coupon.usedBy.some(u => {
        const matchUser = userId && u.userId && u.userId.toString() === userId.toString();
        const matchEmail = normalizedEmail && u.email && u.email.toLowerCase() === normalizedEmail;
        return matchUser || matchEmail;
      });

      // 2. Cross-check completed or non-cancelled orders in Order collection
      let alreadyInOrders = false;
      try {
        const Order = mongoose.models.Order;
        if (Order) {
          const orConditions = [];
          if (userId) orConditions.push({ user_id: userId });
          if (normalizedEmail) orConditions.push({ email: normalizedEmail });

          if (orConditions.length > 0) {
            const pastOrder = await Order.findOne({
              $or: orConditions,
              couponCode: new RegExp(`^${cleanCode}$`, 'i'),
              status: { $ne: 'Cancelled' }
            });
            if (pastOrder) {
              alreadyInOrders = true;
            }
          }
        }
      } catch (err) {
        console.warn('Past order lookup warning for coupon verification:', err.message);
      }

      if (alreadyInUsedBy || alreadyInOrders) {
        throw new Error(
          `You have already redeemed coupon "${coupon.code}". Each customer is limited to one use per promotional coupon.`
        );
      }
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = (subtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
        discount = coupon.maxDiscountAmount;
      }
    } else if (coupon.discountType === 'fixed') {
      discount = Math.min(coupon.discountValue, subtotal);
    }

    return {
      isValid: true,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount: Math.round(discount),
      description: coupon.description
    };
  },

  recordUsage: async (code, { userId = null, email = null, orderId = null } = {}) => {
    if (!code) return null;
    const cleanCode = code.toUpperCase().trim();
    const coupon = await Coupon.findOne({ code: cleanCode });
    if (!coupon) return null;

    coupon.usedCount = (coupon.usedCount || 0) + 1;
    if (!coupon.usedBy) coupon.usedBy = [];

    const normalizedEmail = email ? email.trim().toLowerCase() : null;
    coupon.usedBy.push({
      userId: userId || null,
      email: normalizedEmail,
      orderId: orderId || null,
      usedAt: new Date()
    });

    await coupon.save();
    return coupon;
  },

  seedDefaultCoupons: async () => {
    const count = await Coupon.countDocuments();
    if (count === 0) {
      const defaultCoupons = [
        {
          code: 'ROVE10',
          description: '10% privilege on your luxury fragrance purchase',
          discountType: 'percentage',
          discountValue: 10,
          minOrderAmount: 1999,
          maxDiscountAmount: 1500,
          isActive: true
        },
        {
          code: 'AMBER20',
          description: '20% off on orders above ₹4,000',
          discountType: 'percentage',
          discountValue: 20,
          minOrderAmount: 4000,
          maxDiscountAmount: 2500,
          isActive: true
        },
        {
          code: 'LUXURY500',
          description: 'Flat ₹500 privilege on orders above ₹3,000',
          discountType: 'fixed',
          discountValue: 500,
          minOrderAmount: 3000,
          isActive: true
        },
        {
          code: 'FIRSTORDER',
          description: 'Welcome gift: 15% off on your first order',
          discountType: 'percentage',
          discountValue: 15,
          minOrderAmount: 2499,
          maxDiscountAmount: 2000,
          isActive: true
        }
      ];

      for (const c of defaultCoupons) {
        await Coupon.create(c);
      }
      console.log('✨ Seeded default promotional luxury coupons');
    }
  }
};

export default CouponModel;
