import { Coupon } from '../../models/couponModel.js';

/**
 * 8.1: Get all promotional coupons (Admin)
 */
export const getAdminCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });

    const formatted = coupons.map(c => ({
      id: c._id.toString(),
      _id: c._id.toString(),
      code: c.code,
      description: c.description || '',
      discountType: c.discountType,
      discountValue: c.discountValue,
      minOrderAmount: c.minOrderAmount || 0,
      usageLimit: c.usageLimit || 100,
      usedCount: c.usedCount || 0,
      expiryDate: c.expiryDate ? c.expiryDate.toISOString().split('T')[0] : '',
      isActive: c.isActive,
      createdAt: c.createdAt
    }));

    return res.json({
      success: true,
      count: formatted.length,
      data: formatted
    });
  } catch (error) {
    console.error('Failed to get admin coupons:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve coupons from database.'
    });
  }
};

/**
 * 8.2: Create new promotional coupon (Admin)
 */
export const createAdminCoupon = async (req, res) => {
  try {
    const {
      code,
      description,
      discountType = 'percentage',
      discountValue,
      minOrderAmount = 0,
      usageLimit = 100,
      expiryDate,
      isActive = true
    } = req.body;

    // 1. Validate Code
    if (!code || !code.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code is required.'
      });
    }

    const cleanCode = code.toUpperCase().trim();

    // 2. Uniqueness Check: Cannot create duplicate coupon code
    const existing = await Coupon.findOne({ code: cleanCode });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Coupon code "${cleanCode}" already exists. Please enter a unique code.`
      });
    }

    // 3. Validate Discount Value
    const numValue = Number(discountValue);
    if (isNaN(numValue) || numValue <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Discount value must be a positive number.'
      });
    }

    if (discountType === 'percentage' && numValue > 100) {
      return res.status(400).json({
        success: false,
        message: 'Percentage discount cannot exceed 100%.'
      });
    }

    // 4. Validate Expiry Date: Cannot select past date
    let parsedExpiry = null;
    if (expiryDate) {
      parsedExpiry = new Date(expiryDate);
      if (isNaN(parsedExpiry.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid expiry date format. Please use YYYY-MM-DD.'
        });
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const testExp = new Date(expiryDate);
      testExp.setHours(0, 0, 0, 0);

      if (testExp < today) {
        return res.status(400).json({
          success: false,
          message: 'Coupon expiry date cannot be in the past.'
        });
      }
    }

    // 5. Create in Database
    const createdCoupon = await Coupon.create({
      code: cleanCode,
      description: (description || '').trim(),
      discountType: discountType === 'fixed' ? 'fixed' : 'percentage',
      discountValue: numValue,
      minOrderAmount: Math.max(0, Number(minOrderAmount) || 0),
      usageLimit: Math.max(1, Number(usageLimit) || 100),
      expiryDate: parsedExpiry,
      isActive: isActive !== undefined ? !!isActive : true,
      usedCount: 0,
      usedBy: []
    });

    return res.status(201).json({
      success: true,
      message: `Coupon "${cleanCode}" created successfully.`,
      data: {
        id: createdCoupon._id.toString(),
        _id: createdCoupon._id.toString(),
        code: createdCoupon.code,
        description: createdCoupon.description,
        discountType: createdCoupon.discountType,
        discountValue: createdCoupon.discountValue,
        minOrderAmount: createdCoupon.minOrderAmount,
        usageLimit: createdCoupon.usageLimit,
        usedCount: createdCoupon.usedCount,
        expiryDate: createdCoupon.expiryDate ? createdCoupon.expiryDate.toISOString().split('T')[0] : '',
        isActive: createdCoupon.isActive,
        createdAt: createdCoupon.createdAt
      }
    });
  } catch (error) {
    console.error('Create coupon error:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A coupon with this code already exists. Please choose a unique code.'
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create promotional coupon.'
    });
  }
};

/**
 * 8.3: Update promotional coupon status/details (Admin)
 */
export const updateAdminCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findById(id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found.'
      });
    }

    const {
      code,
      description,
      discountType,
      discountValue,
      minOrderAmount,
      usageLimit,
      expiryDate,
      isActive
    } = req.body;

    if (code && code.toUpperCase().trim() !== coupon.code) {
      const cleanCode = code.toUpperCase().trim();
      const existing = await Coupon.findOne({ code: cleanCode, _id: { $ne: id } });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: `Coupon code "${cleanCode}" is already in use.`
        });
      }
      coupon.code = cleanCode;
    }

    if (description !== undefined) coupon.description = description;
    if (discountType !== undefined) coupon.discountType = discountType;
    if (discountValue !== undefined) {
      const num = Number(discountValue);
      if (num > 0) coupon.discountValue = num;
    }
    if (minOrderAmount !== undefined) coupon.minOrderAmount = Number(minOrderAmount) || 0;
    if (usageLimit !== undefined) coupon.usageLimit = Number(usageLimit) || 100;
    if (isActive !== undefined) coupon.isActive = !!isActive;

    if (expiryDate !== undefined) {
      if (expiryDate) {
        const testExp = new Date(expiryDate);
        testExp.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (testExp < today) {
          return res.status(400).json({
            success: false,
            message: 'Coupon expiry date cannot be in the past.'
          });
        }
        coupon.expiryDate = new Date(expiryDate);
      } else {
        coupon.expiryDate = null;
      }
    }

    await coupon.save();

    return res.json({
      success: true,
      message: `Coupon "${coupon.code}" updated successfully.`,
      data: {
        id: coupon._id.toString(),
        _id: coupon._id.toString(),
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minOrderAmount: coupon.minOrderAmount,
        usageLimit: coupon.usageLimit,
        usedCount: coupon.usedCount,
        expiryDate: coupon.expiryDate ? coupon.expiryDate.toISOString().split('T')[0] : '',
        isActive: coupon.isActive,
        createdAt: coupon.createdAt
      }
    });
  } catch (error) {
    console.error('Update coupon error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update coupon.'
    });
  }
};

/**
 * 8.4: Delete promotional coupon (Admin)
 */
export const deleteAdminCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Coupon.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found to delete.'
      });
    }

    return res.json({
      success: true,
      message: `Coupon "${deleted.code}" deleted successfully.`
    });
  } catch (error) {
    console.error('Delete coupon error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete coupon.'
    });
  }
};

