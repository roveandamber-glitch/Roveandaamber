import { CartModel } from '../../models/cartModel.js';

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
    const { productId, id, name, size, quantity } = req.body;
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
      quantity: parseInt(quantity, 10) || 1
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
    const updatedCart = await CartModel.applyCoupon({
      userId,
      guestId,
      couponCode: code
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
