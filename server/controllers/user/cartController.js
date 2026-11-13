import mongoose from 'mongoose';
import { CartModel } from '../../models/cartModel.js';
import { Coupon } from '../../models/couponModel.js';

// Helper to extract userId or guestId
const getIdentity = (req) => {
  const userId = req.user ? (req.user.id || req.user._id) : null;
  const guestId = req.headers['x-guest-id'] || req.query.guestId || (req.body ? req.body.guestId : null);
  return { userId, guestId };
};

// 1. Retrieve Current Shopping Cart and Order Totals
export const getCart = async (req, res) => {
  try {
    const { userId, guestId } = getIdentity(req);
    const cart = await CartModel.getCart({ userId, guestId });

    return res.json({
      success: true,
      data: cart
    });
  } catch (error) {
    console.error('Get cart error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve shopping cart.' });
  }
};

// 2. Add Product to Shopping Cart
export const addItemToCart = async (req, res) => {
  try {
    const { productId, id, name, size, quantity, hasSample } = req.body;
    const targetId = productId || id;

    if (!targetId && !name) {
      return res.status(400).json({ success: false, message: 'productId or name is required.' });
    }

    const { userId, guestId } = getIdentity(req);
    const updatedCart = await CartModel.addItem({
      userId,
      guestId,
      productId: targetId,
      name,
      size: size || '50ml',
      quantity: parseInt(quantity, 10) || 1,
      hasSample: hasSample === true || Boolean(size && String(size).includes('+'))
    });

    return res.status(201).json({
      success: true,
      message: 'Product added to shopping cart.',
      data: updatedCart
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    return res.status(400).json({ success: false, message: error.message || 'Failed to add product to cart.' });
  }
};

// Upgrade item to 50ml + 2ml combo with 7-Day Return Guarantee
export const upgradeCartItem = async (req, res) => {
  try {
    const { itemId, productId } = req.body;
    const targetItemId = itemId || req.params.itemId;
    const { userId, guestId } = getIdentity(req);
    const updatedCart = await CartModel.upgradeToCombo({
      userId,
      guestId,
      itemId: targetItemId,
      productId
    });
    return res.json({
      success: true,
      message: 'Item upgraded to 50ml + 2ml combo with 7-Day Return Guarantee.',
      data: updatedCart
    });
  } catch (error) {
    console.error('Upgrade cart item error:', error);
    return res.status(400).json({ success: false, message: error.message || 'Failed to upgrade item.' });
  }
};

// 3. Update Product Quantities
export const updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!itemId || quantity === undefined) {
      return res.status(400).json({ success: false, message: 'itemId and quantity are required.' });
    }

    const { userId, guestId } = getIdentity(req);
    const updatedCart = await CartModel.updateQuantity({
      userId,
      guestId,
      itemId,
      quantity: parseInt(quantity, 10)
    });

    return res.json({
      success: true,
      message: 'Cart quantity updated.',
      data: updatedCart
    });
  } catch (error) {
    console.error('Update cart item error:', error);
    return res.status(400).json({ success: false, message: error.message || 'Failed to update quantity.' });
  }
};

// 4. Remove Product from Shopping Cart
export const removeCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    if (!itemId) {
      return res.status(400).json({ success: false, message: 'itemId is required.' });
    }

    const { userId, guestId } = getIdentity(req);
    const updatedCart = await CartModel.removeItem({
      userId,
      guestId,
      itemId
    });

    return res.json({
      success: true,
      message: 'Item removed from shopping cart.',
      data: updatedCart
    });
  } catch (error) {
    console.error('Remove cart item error:', error);
    return res.status(500).json({ success: false, message: 'Failed to remove item from cart.' });
  }
};

// 5. Apply Eligible Promotional Coupon Code
export const applyCoupon = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, message: 'Please enter a coupon code.' });
    }

    const { userId, guestId } = getIdentity(req);
    const userEmail = req.user ? req.user.email : null;
    const updatedCart = await CartModel.applyCoupon({
      userId,
      guestId,
      couponCode: code,
      userEmail
    });

    return res.json({
      success: true,
      message: `Promotional code "${code.toUpperCase()}" applied successfully!`,
      data: updatedCart
    });
  } catch (error) {
    console.error('Apply coupon error:', error);
    return res.status(400).json({ success: false, message: error.message || 'Failed to apply coupon.' });
  }
};

// 5.5: Retrieve Active Available Promotional Coupons
export const getAvailableCoupons = async (req, res) => {
  try {
    const now = new Date();
    const coupons = await Coupon.find({
      isActive: true,
      $or: [
        { expiryDate: null },
        { expiryDate: { $gte: now } }
      ]
    }).sort({ minOrderAmount: 1 }).lean();

    const userId = req.user ? (req.user.id || req.user._id) : null;
    const userEmail = req.user ? (req.user.email || '').trim().toLowerCase() : null;

    // Check user's past redeemed coupon codes from Order collection
    const usedCouponCodes = new Set();
    if (userId || userEmail) {
      try {
        const Order = mongoose.models.Order;
        if (Order) {
          const conditions = [];
          if (userId) conditions.push({ user_id: userId });
          if (userEmail) conditions.push({ email: userEmail });

          const pastOrders = await Order.find({
            $or: conditions,
            couponCode: { $exists: true, $ne: '' },
            status: { $ne: 'Cancelled' }
          }).select('couponCode').lean();

          pastOrders.forEach(o => {
            if (o.couponCode) usedCouponCodes.add(o.couponCode.trim().toUpperCase());
          });
        }
      } catch (orderErr) {
        console.warn('Error reading past order coupons:', orderErr.message);
      }
    }

    const available = coupons.map(c => {
      const codeUpper = (c.code || '').trim().toUpperCase();

      // Check coupon.usedBy
      let usedInCoupon = false;
      if (userId || userEmail) {
        usedInCoupon = Array.isArray(c.usedBy) && c.usedBy.some(u => {
          const matchUser = userId && u.userId && u.userId.toString() === userId.toString();
          const matchEmail = userEmail && u.email && u.email.toLowerCase() === userEmail;
          return matchUser || matchEmail;
        });
      }

      const isUsedByCustomer = usedInCoupon || usedCouponCodes.has(codeUpper);

      return {
        id: c._id.toString(),
        code: c.code,
        description: c.description || '',
        discountType: c.discountType,
        discountValue: c.discountValue,
        minOrderAmount: c.minOrderAmount || 0,
        maxDiscountAmount: c.maxDiscountAmount || null,
        expiryDate: c.expiryDate ? c.expiryDate.toISOString().split('T')[0] : null,
        isAlreadyUsed: Boolean(isUsedByCustomer),
        usedReason: isUsedByCustomer ? 'Already redeemed on a previous order' : null
      };
    });

    return res.json({
      success: true,
      count: available.length,
      data: available
    });
  } catch (error) {
    console.error('Get available coupons error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve available coupons.' });
  }
};

// 6. Remove Applied Promotional Coupon Code
export const removeCoupon = async (req, res) => {
  try {
    const { userId, guestId } = getIdentity(req);
    const updatedCart = await CartModel.removeCoupon({ userId, guestId });

    return res.json({
      success: true,
      message: 'Coupon code removed.',
      data: updatedCart
    });
  } catch (error) {
    console.error('Remove coupon error:', error);
    return res.status(500).json({ success: false, message: 'Failed to remove coupon.' });
  }
};

// 6.5 Apply Patron Privilege Reward Points
export const applyRewardPoints = async (req, res) => {
  try {
    const { points } = req.body;
    const { userId, guestId } = getIdentity(req);

    if (!points || Number(points) <= 0) {
      return res.status(400).json({ success: false, message: 'Please specify the number of points to redeem.' });
    }

    const updatedCart = await CartModel.applyRewardPoints({
      userId,
      guestId,
      points: Number(points)
    });

    return res.json({
      success: true,
      message: `${points} loyalty privilege points applied successfully!`,
      data: updatedCart
    });
  } catch (error) {
    console.error('Apply rewards error:', error);
    return res.status(400).json({ success: false, message: error.message || 'Failed to apply reward points.' });
  }
};

// 6.6 Remove Applied Patron Privilege Reward Points
export const removeRewardPoints = async (req, res) => {
  try {
    const { userId, guestId } = getIdentity(req);
    const updatedCart = await CartModel.removeRewardPoints({ userId, guestId });

    return res.json({
      success: true,
      message: 'Reward points discount removed.',
      data: updatedCart
    });
  } catch (error) {
    console.error('Remove rewards error:', error);
    return res.status(500).json({ success: false, message: 'Failed to remove reward points.' });
  }
};

// 7. Update Gift Packaging & Personalized Message Options
export const updateGiftOptions = async (req, res) => {
  try {
    const { isGift, occasion, giftMessage, giftWrap, giftRecipient } = req.body;
    const { userId, guestId } = getIdentity(req);

    const updatedCart = await CartModel.updateGiftOptions({
      userId,
      guestId,
      isGift,
      occasion,
      giftMessage,
      giftWrap,
      giftRecipient
    });

    return res.json({
      success: true,
      message: 'Gift preferences updated.',
      data: updatedCart
    });
  } catch (error) {
    console.error('Update gift options error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update gift options.' });
  }
};

// 8. Review Final Order Summary Before Payment
export const getCheckoutSummary = async (req, res) => {
  try {
    const { userId, guestId } = getIdentity(req);
    const cart = await CartModel.getCart({ userId, guestId });

    if (cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Your cart is empty. Add fragrances to review your checkout summary.'
      });
    }

    // Check if any items are out of stock
    const outOfStockItems = cart.items.filter(i => !i.inStock);
    if (outOfStockItems.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Some items in your cart are currently out of stock: ${outOfStockItems.map(i => i.name).join(', ')}`,
        outOfStockItems
      });
    }

    return res.json({
      success: true,
      data: {
        orderSummary: {
          items: cart.items,
          itemCount: cart.itemCount,
          subtotal: cart.subtotal,
          discountAmount: cart.discountAmount,
          coupon: cart.coupon,
          giftWrapFee: cart.giftWrapFee,
          shippingFee: cart.shippingFee,
          totalPayable: cart.total,
          currency: 'INR'
        },
        giftDetails: {
          isGift: cart.isGift,
          occasion: cart.occasion,
          giftMessage: cart.giftMessage,
          giftWrap: cart.giftWrap,
          giftRecipient: cart.giftRecipient
        }
      }
    });
  } catch (error) {
    console.error('Checkout summary error:', error);
    return res.status(500).json({ success: false, message: 'Failed to generate checkout summary.' });
  }
};

// 9. Clear Shopping Cart
export const clearCart = async (req, res) => {
  try {
    const { userId, guestId } = getIdentity(req);
    const cleared = await CartModel.clearCart({ userId, guestId });

    return res.json({
      success: true,
      message: 'Shopping cart cleared.',
      data: cleared
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    return res.status(500).json({ success: false, message: 'Failed to clear cart.' });
  }
};
