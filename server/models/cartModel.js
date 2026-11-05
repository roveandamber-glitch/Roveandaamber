import mongoose from 'mongoose';
import './categoryModel.js';
import { ProductModel, Product } from './productModel.js';
import { CouponModel } from './couponModel.js';
import { formatProduct } from '../controllers/user/productController.js';

const cartItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    size: {
      type: String,
      default: '50ml'
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
      min: [1, 'Quantity must be at least 1']
    },
    hasSample: {
      type: Boolean,
      default: false
    }
  },
  { _id: true }
);

const cartSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },
    guestId: {
      type: String,
      default: null,
      index: true
    },
    items: [cartItemSchema],
    appliedCoupon: {
      code: { type: String, default: null },
      discountType: { type: String, default: null },
      discountValue: { type: Number, default: 0 },
      discountAmount: { type: Number, default: 0 }
    },
    rewardPointsUsed: {
      type: Number,
      default: 0
    },
    rewardDiscountAmount: {
      type: Number,
      default: 0
    },
    isGift: {
      type: Boolean,
      default: false
    },
    occasion: {
      type: String,
      default: ''
    },
    giftMessage: {
      type: String,
      default: ''
    },
    giftWrap: {
      type: Boolean,
      default: false
    },
    giftRecipient: {
      name: { type: String, default: '' },
      phone: { type: String, default: '' },
      address: { type: String, default: '' },
      city: { type: String, default: '' },
      postalCode: { type: String, default: '' },
      email: { type: String, default: '' }
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

export const Cart = mongoose.models.Cart || mongoose.model('Cart', cartSchema);

// Find or create cart by userId or guestId
const findOrCreateCart = async ({ userId, guestId }) => {
  let query = null;
  if (userId && mongoose.Types.ObjectId.isValid(userId)) {
    query = { user_id: userId };
  } else if (guestId) {
    query = { guestId };
  } else {
    query = { guestId: `guest_cart_${Date.now()}_${Math.random().toString(36).substring(2, 9)}` };
  }

  let cart = await Cart.findOne(query).populate({
    path: 'items.productId',
    populate: { path: 'category_id' }
  });

  if (!cart) {
    cart = await Cart.create({
      user_id: userId && mongoose.Types.ObjectId.isValid(userId) ? userId : null,
      guestId: !userId ? (guestId || query.guestId) : null,
      items: []
    });
  } else if (cart.items && cart.items.some(item => !item || !item.productId)) {
    // Sanitize any corrupt orphan items
    cart.items = cart.items.filter(item => item && item.productId);
    await Cart.updateOne({ _id: cart._id }, { $set: { items: cart.items } });
  }

  return cart;
};

// Calculate and format live cart summary
const calculateCartSummary = async (cartDoc) => {
  let subtotal = 0;
  let totalQuantity = 0;
  const verifiedItems = [];

  for (const item of cartDoc.items) {
    if (!item.productId) continue;
    const formatted = formatProduct(item.productId);
    if (!formatted) continue;

    // Check size-specific availability
    let availableStock = formatted.stock || 0;
    if (formatted.sizes_stock && formatted.sizes_stock[item.size] !== undefined) {
      availableStock = formatted.sizes_stock[item.size];
    }

    const samplePrice = formatted.samplePrice !== undefined && formatted.samplePrice !== null 
      ? Number(formatted.samplePrice) 
      : 199;
    const basePrice = Number(formatted.price) || 0;

    const sizeStr = (item.size || '').toLowerCase();
    const isSampleOnly = sizeStr === '2ml' || sizeStr === '2ml sample' || sizeStr === 'sample';
    const isCombo = sizeStr.includes('+') || sizeStr.includes('combo') || item.hasSample === true;

    let price = basePrice;
    if (isSampleOnly) {
      price = samplePrice;
    } else if (isCombo) {
      price = basePrice + samplePrice;
    }

    const qty = Math.min(item.quantity, Math.max(availableStock, 1));
    const itemTotal = price * qty;
    subtotal += itemTotal;
    totalQuantity += qty;

    verifiedItems.push({
      itemId: item._id.toString(),
      productId: formatted.id,
      name: formatted.name,
      slug: formatted.slug,
      price: price,
      originalPrice: isCombo ? (formatted.originalPrice ? formatted.originalPrice + samplePrice : price) : (isSampleOnly ? samplePrice : formatted.originalPrice),
      image: formatted.image,
      size: item.size || '50ml',
      hasSample: Boolean(isCombo || item.hasSample),
      isSampleOnly: Boolean(isSampleOnly),
      isCombo: Boolean(isCombo),
      quantity: qty,
      maxStock: availableStock,
      inStock: availableStock > 0,
      itemTotal: itemTotal
    });
  }

  // Recalculate coupon if applied
  let discountAmount = 0;
  let couponInfo = null;

  if (cartDoc.appliedCoupon && cartDoc.appliedCoupon.code && subtotal > 0) {
    try {
      const couponResult = await CouponModel.validateAndCalculate(
        cartDoc.appliedCoupon.code, 
        subtotal, 
        { userId: cartDoc.userId }
      );
      discountAmount = couponResult.discountAmount;
      couponInfo = {
        code: couponResult.code,
        discountType: couponResult.discountType,
        discountValue: couponResult.discountValue,
        discountAmount: discountAmount,
        description: couponResult.description
      };
    } catch (e) {
      // Coupon became invalid due to subtotal change
      cartDoc.appliedCoupon = { code: null, discountAmount: 0 };
      await cartDoc.save();
    }
  }

  // Reward points calculation
  let rewardDiscountAmount = 0;
  let availableRewardPoints = 0;
  let rewardRate = 100;
  let pointsPerHundred = 10;

  try {
    const { RewardRule } = await import('./rewardModel.js');
    const rules = await RewardRule.getRules();
    rewardRate = rules.redemptionRate || 100;
    pointsPerHundred = rules.pointsPerHundred || 10;

    const resolvedUserId = cartDoc.user_id || cartDoc.userId;
    if (resolvedUserId) {
      const { User } = await import('./userModel.js');
      const user = await User.findById(resolvedUserId).select('rewardPoints');
      if (user) {
        availableRewardPoints = user.rewardPoints || 0;
      }
    }

    if (cartDoc.rewardPointsUsed > 0 && subtotal > 0) {
      const pointsToUse = Math.min(cartDoc.rewardPointsUsed, availableRewardPoints);
      const pointVal = rewardRate / 100;
      const calculatedRewardDiscount = Math.floor(pointsToUse * pointVal);
      const maxRewardDiscount = Math.max(0, subtotal - discountAmount);
      rewardDiscountAmount = Math.min(calculatedRewardDiscount, maxRewardDiscount);
      cartDoc.rewardDiscountAmount = rewardDiscountAmount;
    } else {
      cartDoc.rewardPointsUsed = 0;
      cartDoc.rewardDiscountAmount = 0;
    }
  } catch (rwErr) {
    console.warn('Reward calculation warning:', rwErr.message);
  }

  // Gift wrap charge: Rs 150 if gift wrap is requested
  const giftWrapFee = cartDoc.giftWrap ? 150 : 0;

  // Free shipping above Rs 1999, else standard flat Rs 150
  const shippingFee = (subtotal - discountAmount - rewardDiscountAmount >= 1999 || subtotal === 0) ? 0 : 150;

  const finalTotal = Math.max(0, subtotal - discountAmount - rewardDiscountAmount + giftWrapFee + shippingFee);

  return {
    id: cartDoc._id.toString(),
    guestId: cartDoc.guestId,
    items: verifiedItems,
    itemCount: verifiedItems.length,
    totalQuantity,
    subtotal,
    discountAmount,
    coupon: couponInfo,
    rewardPointsUsed: cartDoc.rewardPointsUsed || 0,
    rewardDiscountAmount,
    availableRewardPoints,
    rewardRate,
    pointsPerHundred,
    giftWrapFee,
    shippingFee,
    total: finalTotal,
    isGift: !!cartDoc.isGift,
    occasion: cartDoc.occasion || '',
    giftMessage: cartDoc.giftMessage || '',
    giftWrap: !!cartDoc.giftWrap,
    giftRecipient: cartDoc.giftRecipient || {}
  };
};

export const CartModel = {
  getCart: async ({ userId, guestId }) => {
    const cart = await findOrCreateCart({ userId, guestId });
    return calculateCartSummary(cart);
  },

  addItem: async ({ userId, guestId, productId, name, size = '50ml', quantity = 1, hasSample = false }) => {
    let product = await ProductModel.findById(productId, name);
    if (!product && name) {
      product = await ProductModel.findById(null, name);
    }
    if (!product) {
      throw new Error('Perfume product not found.');
    }

    const cart = await findOrCreateCart({ userId, guestId });
    const targetSize = size || '50ml';
    const isCombo = targetSize.toLowerCase().includes('+') || hasSample === true;
    const addQty = Math.max(1, parseInt(quantity, 10) || 1);

    // Verify stock
    if (product.stock <= 0) {
      throw new Error(`"${product.name}" is currently out of stock.`);
    }

    const existingIndex = cart.items.findIndex(
      i => String(i.productId?._id || i.productId) === String(product._id || product.id) && i.size === targetSize
    );

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += addQty;
      if (isCombo) {
        cart.items[existingIndex].hasSample = true;
      }
    } else {
      cart.items.push({
        productId: product._id || product.id,
        size: targetSize,
        quantity: addQty,
        hasSample: isCombo
      });
    }

    await cart.save();
    const populated = await Cart.findById(cart._id).populate({
      path: 'items.productId',
      populate: { path: 'category_id' }
    });
    return calculateCartSummary(populated);
  },

  upgradeToCombo: async ({ userId, guestId, itemId, productId }) => {
    const cart = await findOrCreateCart({ userId, guestId });
    const item = cart.items.find(i => 
      (itemId && String(i._id) === String(itemId)) || 
      (productId && String(i.productId?._id || i.productId) === String(productId))
    );
    if (!item) {
      throw new Error('Item not found in cart.');
    }
    const currentSize = item.size || '50ml';
    if (!currentSize.toLowerCase().includes('+')) {
      item.size = `${currentSize.replace(/ sample/gi, '').trim()} + 2ML COMBO`;
      item.hasSample = true;
    }
    await cart.save();
    const populated = await Cart.findById(cart._id).populate({
      path: 'items.productId',
      populate: { path: 'category_id' }
    });
    return calculateCartSummary(populated);
  },

  updateQuantity: async ({ userId, guestId, itemId, quantity }) => {
    const cart = await findOrCreateCart({ userId, guestId });
    const newQty = parseInt(quantity, 10);

    const item = cart.items.find(i => String(i._id) === String(itemId));
    if (!item) {
      throw new Error('Item not found in cart.');
    }

    if (newQty <= 0) {
      cart.items = cart.items.filter(i => String(i._id) !== String(itemId));
    } else {
      // Validate against product stock
      const product = await ProductModel.findById(item.productId);
      if (product && product.stock < newQty) {
        throw new Error(`Only ${product.stock} units available for "${product.name}".`);
      }
      item.quantity = newQty;
    }

    await cart.save();
    const populated = await Cart.findById(cart._id).populate({
      path: 'items.productId',
      populate: { path: 'category_id' }
    });
    return calculateCartSummary(populated);
  },

  removeItem: async ({ userId, guestId, itemId }) => {
    const cart = await findOrCreateCart({ userId, guestId });
    cart.items = cart.items.filter(i => String(i._id) !== String(itemId));
    await cart.save();
    const populated = await Cart.findById(cart._id).populate({
      path: 'items.productId',
      populate: { path: 'category_id' }
    });
    return calculateCartSummary(populated);
  },

  applyCoupon: async ({ userId, guestId, couponCode, userEmail = null }) => {
    const cart = await findOrCreateCart({ userId, guestId });
    const currentSummary = await calculateCartSummary(cart);

    if (currentSummary.subtotal <= 0) {
      throw new Error('Your cart is empty. Add products before applying a coupon.');
    }

    let resolvedEmail = userEmail;
    if (!resolvedEmail && userId) {
      try {
        const User = mongoose.models.User;
        if (User) {
          const userDoc = await User.findById(userId);
          if (userDoc) resolvedEmail = userDoc.email;
        }
      } catch (err) {}
    }

    const couponResult = await CouponModel.validateAndCalculate(
      couponCode, 
      currentSummary.subtotal,
      { userId, email: resolvedEmail }
    );

    cart.appliedCoupon = {
      code: couponResult.code,
      discountType: couponResult.discountType,
      discountValue: couponResult.discountValue,
      discountAmount: couponResult.discountAmount
    };

    await cart.save();
    const populated = await Cart.findById(cart._id).populate({
      path: 'items.productId',
      populate: { path: 'category_id' }
    });
    return calculateCartSummary(populated);
  },

  removeCoupon: async ({ userId, guestId }) => {
    const cart = await findOrCreateCart({ userId, guestId });
    cart.appliedCoupon = { code: null, discountAmount: 0 };
    await cart.save();
    const populated = await Cart.findById(cart._id).populate({
      path: 'items.productId',
      populate: { path: 'category_id' }
    });
    return calculateCartSummary(populated);
  },

  applyRewardPoints: async ({ userId, guestId, points }) => {
    const cart = await findOrCreateCart({ userId, guestId });
    const currentSummary = await calculateCartSummary(cart);

    if (currentSummary.subtotal <= 0) {
      throw new Error('Your bag is empty. Add fragrances before redeeming points.');
    }

    const { User } = await import('./userModel.js');
    const resolvedUserId = userId || cart.user_id;
    if (!resolvedUserId) {
      throw new Error('Customer sign-in required to redeem loyalty points.');
    }

    const user = await User.findById(resolvedUserId);
    if (!user) {
      throw new Error('Customer account not found.');
    }

    const patronPoints = user.rewardPoints || 0;
    const requestedPoints = Math.max(1, parseInt(points, 10) || 0);

    if (requestedPoints > patronPoints) {
      throw new Error(`Insufficient points balance. You have ${patronPoints} points available.`);
    }

    await Cart.updateOne(
      { _id: cart._id },
      { $set: { rewardPointsUsed: requestedPoints } }
    );

    const populated = await Cart.findById(cart._id).populate({
      path: 'items.productId',
      populate: { path: 'category_id' }
    });
    return calculateCartSummary(populated);
  },

  removeRewardPoints: async ({ userId, guestId }) => {
    let query = null;
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      query = { user_id: userId };
    } else if (guestId) {
      query = { guestId };
    }

    if (query) {
      await Cart.updateOne(query, {
        $set: {
          rewardPointsUsed: 0,
          rewardDiscountAmount: 0
        }
      });
    }

    const cart = await findOrCreateCart({ userId, guestId });
    return calculateCartSummary(cart);
  },

  updateGiftOptions: async ({ userId, guestId, isGift, occasion, giftMessage, giftWrap, giftRecipient }) => {
    const cart = await findOrCreateCart({ userId, guestId });

    if (isGift !== undefined) cart.isGift = !!isGift;
    if (occasion !== undefined) cart.occasion = occasion;
    if (giftMessage !== undefined) cart.giftMessage = giftMessage;
    if (giftWrap !== undefined) cart.giftWrap = !!giftWrap;
    if (giftRecipient !== undefined) cart.giftRecipient = giftRecipient;

    await cart.save();
    const populated = await Cart.findById(cart._id).populate({
      path: 'items.productId',
      populate: { path: 'category_id' }
    });
    return calculateCartSummary(populated);
  },

  clearCart: async ({ userId, guestId }) => {
    const cart = await findOrCreateCart({ userId, guestId });
    cart.items = [];
    cart.appliedCoupon = { code: null, discountAmount: 0 };
    await cart.save();
    return {
      items: [],
      itemCount: 0,
      totalQuantity: 0,
      subtotal: 0,
      discountAmount: 0,
      total: 0
    };
  }
};

export default CartModel;
