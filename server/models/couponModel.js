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
    }
  }
);

export const Coupon = mongoose.models.Coupon || mongoose.model('Coupon', couponSchema);

export const CouponModel = {
  findByCode: async (code) => {
    if (!code) return null;
    return Coupon.findOne({ code: code.toUpperCase().trim() });
  },

  validateAndCalculate: async (code, subtotal) => {
    if (!code) {
      throw new Error('Please enter a coupon code.');
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase().trim() });

    if (!coupon) {
      throw new Error(`Promotional code "${code.toUpperCase()}" is invalid.`);
    }

    if (!coupon.isActive) {
      throw new Error(`Promotional code "${coupon.code}" is no longer active.`);
    }

    if (coupon.expiryDate && new Date() > new Date(coupon.expiryDate)) {
      throw new Error(`Promotional code "${coupon.code}" has expired.`);
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      throw new Error(`Promotional code "${coupon.code}" usage limit reached.`);
    }

    if (subtotal < coupon.minOrderAmount) {
      throw new Error(
        `Code "${coupon.code}" requires a minimum order amount of Rs ${coupon.minOrderAmount}. Current subtotal: Rs ${subtotal}`
      );
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

  seedDefaultCoupons: async () => {
    const count = await Coupon.countDocuments();
    if (count === 0) {
      const defaultCoupons = [
        {
          code: 'ROVE10',
          description: '10% off on your luxury fragrance purchase',
          discountType: 'percentage',
          discountValue: 10,
          minOrderAmount: 1999,
          maxDiscountAmount: 1500,
          isActive: true
        },
        {
          code: 'AMBER20',
          description: '20% off on orders above Rs 4,000',
          discountType: 'percentage',
          discountValue: 20,
          minOrderAmount: 4000,
          maxDiscountAmount: 2500,
          isActive: true
        },
        {
          code: 'LUXURY500',
          description: 'Flat Rs 500 off on orders above Rs 3,000',
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
