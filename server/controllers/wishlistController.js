import { WishlistModel } from '../models/wishlistModel.js';

// Helper to extract userId or guestId from request
const getIdentity = (req) => {
  const userId = req.user ? (req.user.id || req.user._id) : null;
  const guestId = req.headers['x-guest-id'] || req.query.guestId || (req.body ? req.body.guestId : null);
  return { userId, guestId };
};

// 1. View and manage saved products
export const getWishlist = async (req, res) => {
  try {
    const { userId, guestId } = getIdentity(req);
    const wishlist = await WishlistModel.getWishlist({ userId, guestId });

    return res.json({
      success: true,
      data: wishlist
    });
  } catch (error) {
    console.error('Get wishlist error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch wishlist.' });
  }
};

// 2. Save favourite perfumes for future purchases
export const addToWishlist = async (req, res) => {
  try {
    const { productId, size } = req.body;
    if (!productId) {
      return res.status(400).json({ success: false, message: 'productId is required.' });
    }

    const { userId, guestId } = getIdentity(req);
    const wishlist = await WishlistModel.addItem({
      userId,
      guestId,
      productId,
      size: size || '50ml'
    });

    return res.json({
      success: true,
      message: 'Perfume saved to your wishlist.',
      data: wishlist
    });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    return res.status(400).json({ success: false, message: error.message || 'Failed to add to wishlist.' });
  }
};

// 3. Remove products from the wishlist
export const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    if (!productId) {
      return res.status(400).json({ success: false, message: 'productId is required.' });
    }

    const { userId, guestId } = getIdentity(req);
    const wishlist = await WishlistModel.removeItem({
      userId,
      guestId,
      productId
    });

    return res.json({
      success: true,
      message: 'Product removed from wishlist.',
      data: wishlist
    });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    return res.status(500).json({ success: false, message: 'Failed to remove from wishlist.' });
  }
};

// 4. Move saved products directly to the shopping cart
export const moveToCart = async (req, res) => {
  try {
    const { productId, size, quantity } = req.body;
    if (!productId) {
      return res.status(400).json({ success: false, message: 'productId is required.' });
    }

    const { userId, guestId } = getIdentity(req);
    const result = await WishlistModel.moveToCart({
      userId,
      guestId,
      productId,
      size: size || '50ml',
      quantity: quantity || 1
    });

    return res.json({
      success: true,
      message: result.message,
      data: {
        cartItem: result.cartItem
      }
    });
  } catch (error) {
    console.error('Move to cart error:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to move product to cart.'
    });
  }
};

// 5. Clear wishlist
export const clearWishlist = async (req, res) => {
  try {
    const { userId, guestId } = getIdentity(req);
    const result = await WishlistModel.clearWishlist({ userId, guestId });

    return res.json({
      success: true,
      message: 'Wishlist cleared.',
      data: result
    });
  } catch (error) {
    console.error('Clear wishlist error:', error);
    return res.status(500).json({ success: false, message: 'Failed to clear wishlist.' });
  }
};
