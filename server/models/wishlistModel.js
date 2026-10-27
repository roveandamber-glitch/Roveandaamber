import mongoose from 'mongoose';
import { ProductModel, Product } from './productModel.js';
import { formatProduct } from '../controllers/user/productController.js';

const wishlistItemSchema = new mongoose.Schema(
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
    addedAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: true }
);

const wishlistSchema = new mongoose.Schema(
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
    items: [wishlistItemSchema]
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

export const Wishlist = mongoose.models.Wishlist || mongoose.model('Wishlist', wishlistSchema);

const findOrCreateWishlistDoc = async ({ userId, guestId }) => {
  let query = null;
  if (userId && mongoose.Types.ObjectId.isValid(userId)) {
    query = { user_id: userId };
  } else if (guestId) {
    query = { guestId };
  } else {
    query = { guestId: `guest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}` };
  }

  let doc = await Wishlist.findOne(query).populate({
    path: 'items.productId',
    populate: { path: 'category_id' }
  });

  if (!doc) {
    doc = await Wishlist.create({
      user_id: userId && mongoose.Types.ObjectId.isValid(userId) ? userId : null,
      guestId: !userId ? (guestId || query.guestId) : null,
      items: []
    });
  }

  return doc;
};

export const WishlistModel = {
  getWishlist: async ({ userId, guestId }) => {
    const doc = await findOrCreateWishlistDoc({ userId, guestId });

    // Format wishlist items with full product details
    const formattedItems = [];
    for (const item of doc.items) {
      if (!item.productId) continue;
      const formattedProd = formatProduct(item.productId);
      if (formattedProd) {
        formattedItems.push({
          itemId: item._id ? item._id.toString() : '',
          productId: formattedProd.id,
          name: formattedProd.name,
          slug: formattedProd.slug,
          price: formattedProd.price,
          originalPrice: formattedProd.originalPrice,
          image: formattedProd.image,
          images: formattedProd.images,
          category: formattedProd.category,
          fragranceFamily: formattedProd.fragranceFamily,
          gender: formattedProd.gender,
          size: item.size || '50ml',
          sizes: formattedProd.sizes,
          stock: formattedProd.stock,
          status: formattedProd.status,
          addedAt: item.addedAt
        });
      }
    }

    return {
      id: doc._id.toString(),
      guestId: doc.guestId,
      count: formattedItems.length,
      items: formattedItems
    };
  },

  addItem: async ({ userId, guestId, productId, size = '50ml' }) => {
    let resolvedProductId = productId;
    if (!mongoose.Types.ObjectId.isValid(resolvedProductId)) {
      const prod = await ProductModel.findById(productId);
      if (!prod) throw new Error('Perfume product not found');
      resolvedProductId = prod._id || prod.id;
    }

    const doc = await findOrCreateWishlistDoc({ userId, guestId });

    const exists = doc.items.some(
      i => i.productId && (String(i.productId._id || i.productId) === String(resolvedProductId))
    );

    if (!exists) {
      doc.items.push({
        productId: resolvedProductId,
        size: size || '50ml',
        addedAt: new Date()
      });
      await doc.save();
    }

    return WishlistModel.getWishlist({ userId, guestId: doc.guestId });
  },

  removeItem: async ({ userId, guestId, productId }) => {
    const doc = await findOrCreateWishlistDoc({ userId, guestId });
    const targetId = String(productId);

    doc.items = doc.items.filter(item => {
      if (!item.productId) return false;
      const idStr = String(item.productId._id || item.productId);
      const itemIdStr = String(item._id);
      return idStr !== targetId && itemIdStr !== targetId;
    });

    await doc.save();
    return WishlistModel.getWishlist({ userId, guestId: doc.guestId });
  },

  moveToCart: async ({ userId, guestId, productId, size, quantity = 1 }) => {
    const product = await ProductModel.findById(productId);
    if (!product) {
      throw new Error('Perfume not found.');
    }

    const selectedSize = size || '50ml';

    // Verify stock
    if (product.stock <= 0) {
      throw new Error(`"${product.name}" is currently out of stock.`);
    }

    // Remove from wishlist
    await WishlistModel.removeItem({ userId, guestId, productId: product._id || product.id });

    // Format ready-to-use cart item matching the luxury cart schema
    const cartItem = {
      id: product._id.toString(),
      productId: product._id.toString(),
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: product.image,
      size: selectedSize.toUpperCase(),
      quantity: Math.min(product.stock, parseInt(quantity, 10) || 1),
      maxStock: product.stock
    };

    return {
      message: `"${product.name}" moved to cart successfully.`,
      cartItem
    };
  },

  clearWishlist: async ({ userId, guestId }) => {
    const doc = await findOrCreateWishlistDoc({ userId, guestId });
    doc.items = [];
    await doc.save();
    return { count: 0, items: [] };
  }
};

export default WishlistModel;
