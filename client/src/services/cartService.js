import api from './api';

/**
 * ROVE & AMBER — Luxury Fragrance Cart State Manager
 * 
 * ARCHITECTURAL MANDATE:
 * - Strictly NO cart items stored in localStorage.
 * - All shopping bag data, quantities, pricing, and gift preferences
 *   are persisted directly in the MongoDB Atlas database via the backend Cart API (/api/cart).
 * - localStorage is strictly reserved ONLY for authentication tokens (userToken, adminToken).
 */

// In-memory runtime cart state
let inMemoryCart = [];
let inMemorySummary = null;
let hasInitialFetch = false;
let isFetching = false;

// Format backend item to standard client representation
const formatItem = (item) => {
  if (!item) return null;
  return {
    id: item.itemId || item._id || item.productId,
    itemId: item.itemId || item._id,
    productId: item.productId?._id || item.productId || item.id,
    name: item.name || item.productId?.name || 'Artisanal Perfume Flacon',
    slug: item.slug || item.productId?.slug || '',
    price: Number(item.price || item.productId?.price || 0),
    originalPrice: Number(item.originalPrice || item.productId?.originalPrice || item.price || 0),
    image: item.image || item.productId?.image || '/images/perfumes/signature_collection.jpg',
    size: (item.size || '50ML').toUpperCase(),
    quantity: Math.max(1, parseInt(item.quantity, 10) || 1),
    maxStock: item.maxStock !== undefined ? item.maxStock : (item.productId?.stock ?? 99),
    itemTotal: Number(item.itemTotal || ((item.price || 0) * (item.quantity || 1)))
  };
};

// Purge any deprecated legacy localStorage keys so localStorage stays pristine
const purgeLegacyLocalStorage = () => {
  if (typeof window === 'undefined') return;
  try {
    const keysToRemove = [
      'rove_amber_cart',
      'rove_amber_cart_guest',
      'zyra_cart',
      'cart',
      'rove_amber_gift_options',
      'rove_amber_gift_note'
    ];

    // Scan for any user-scoped legacy cart keys
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k.startsWith('rove_amber_cart') || k.includes('cart_') || k.includes('gift_options'))) {
        keysToRemove.push(k);
      }
    }

    keysToRemove.forEach((k) => {
      try { localStorage.removeItem(k); } catch (e) {}
    });
  } catch (e) {}
};

// Run purge on module load
if (typeof window !== 'undefined') {
  purgeLegacyLocalStorage();
}

export const cartService = {
  /**
   * Fetch authoritative cart state from MongoDB Atlas database
   */
  fetchCart: async () => {
    if (typeof window === 'undefined') return [];
    if (isFetching) return inMemoryCart;
    isFetching = true;

    try {
      const res = await api.get('/cart');
      if (res?.data?.success && res.data.data) {
        const cartData = res.data.data;
        inMemorySummary = cartData;
        const rawItems = cartData.items || [];
        inMemoryCart = rawItems.map(formatItem).filter(Boolean);
        hasInitialFetch = true;

        window.dispatchEvent(new Event('cartChange'));
        return inMemoryCart;
      }
    } catch (err) {
      console.warn('Backend /api/cart fetch notice:', err?.response?.data?.message || err.message);
    } finally {
      isFetching = false;
    }

    return inMemoryCart;
  },

  /**
   * Synchronous accessor for fast React rendering
   * Initiates background database sync if not yet loaded
   */
  getCart: () => {
    if (typeof window !== 'undefined' && !hasInitialFetch && !isFetching) {
      cartService.fetchCart();
    }
    return [...inMemoryCart];
  },

  /**
   * Add a product flacon to the database cart
   */
  addToCart: async (item) => {
    const pId = item.productId || item.id;
    const pSize = item.size || '50ml';
    const pQty = parseInt(item.quantity, 10) || 1;
    const pName = item.name || '';

    // Optimistic UI update in memory
    const existingIdx = inMemoryCart.findIndex(
      (i) => String(i.productId) === String(pId) && i.size.toLowerCase() === pSize.toLowerCase()
    );

    if (existingIdx > -1) {
      inMemoryCart[existingIdx].quantity += pQty;
    } else {
      inMemoryCart.push(formatItem({
        itemId: `temp_${Date.now()}`,
        productId: pId,
        name: pName,
        price: item.price,
        image: item.image,
        size: pSize,
        quantity: pQty,
        maxStock: item.maxStock || 99
      }));
    }
    window.dispatchEvent(new Event('cartChange'));

    // Persist to MongoDB Atlas backend
    try {
      const res = await api.post('/cart/items', {
        productId: pId,
        id: pId,
        name: pName,
        size: pSize,
        quantity: pQty
      });

      if (res?.data?.success && res.data.data) {
        const cartData = res.data.data;
        inMemorySummary = cartData;
        inMemoryCart = (cartData.items || []).map(formatItem).filter(Boolean);
        hasInitialFetch = true;
        window.dispatchEvent(new Event('cartChange'));
        return inMemoryCart;
      }
    } catch (err) {
      console.error('Failed to add item to database cart:', err);
      // Re-sync with actual DB state
      await cartService.fetchCart();
    }

    return inMemoryCart;
  },

  /**
   * Update item quantity in database cart
   */
  updateQuantity: async (productIdOrItemId, size, newQty) => {
    const qty = parseInt(newQty, 10);

    // Locate item
    const targetItem = inMemoryCart.find(
      (i) => (i.itemId === productIdOrItemId || String(i.productId) === String(productIdOrItemId)) &&
             (!size || i.size.toLowerCase() === String(size).toLowerCase())
    );

    if (!targetItem) {
      return inMemoryCart;
    }

    const itemId = targetItem.itemId;

    // Optimistic memory update
    if (qty <= 0) {
      inMemoryCart = inMemoryCart.filter((i) => i.itemId !== itemId);
    } else {
      targetItem.quantity = qty;
    }
    window.dispatchEvent(new Event('cartChange'));

    // Backend database persistence
    try {
      if (qty <= 0) {
        await api.delete(`/cart/items/${itemId}`);
      } else {
        await api.put(`/cart/items/${itemId}`, { quantity: qty });
      }
      await cartService.fetchCart();
    } catch (err) {
      console.error('Failed to update quantity in database cart:', err);
      await cartService.fetchCart();
    }

    return inMemoryCart;
  },

  /**
   * Remove a fragrance item from the database cart
   */
  removeFromCart: async (productIdOrItemId, size) => {
    const targetItem = inMemoryCart.find(
      (i) => (i.itemId === productIdOrItemId || String(i.productId) === String(productIdOrItemId)) &&
             (!size || i.size.toLowerCase() === String(size).toLowerCase())
    );

    if (!targetItem) {
      return inMemoryCart;
    }

    const itemId = targetItem.itemId;

    // Optimistic memory removal
    inMemoryCart = inMemoryCart.filter((i) => i.itemId !== itemId);
    window.dispatchEvent(new Event('cartChange'));

    // Backend database removal
    try {
      await api.delete(`/cart/items/${itemId}`);
      await cartService.fetchCart();
    } catch (err) {
      console.error('Failed to remove item from database cart:', err);
      await cartService.fetchCart();
    }

    return inMemoryCart;
  },

  /**
   * Clear all items from the database cart
   */
  clearCart: async () => {
    inMemoryCart = [];
    inMemorySummary = null;
    purgeLegacyLocalStorage();
    window.dispatchEvent(new Event('cartChange'));

    try {
      await api.delete('/cart');
    } catch (err) {
      console.warn('Backend cart clear notice:', err.message);
    }

    return [];
  },

  /**
   * Total item count
   */
  getCartCount: () => {
    return inMemoryCart.reduce((acc, item) => acc + (parseInt(item.quantity, 10) || 1), 0);
  },

  /**
   * Total cart subtotal in Rupees
   */
  getCartTotal: () => {
    if (inMemorySummary && inMemorySummary.total !== undefined) {
      return inMemorySummary.total;
    }
    return inMemoryCart.reduce(
      (acc, item) => acc + (Number(item.price) || 0) * (parseInt(item.quantity, 10) || 1),
      0
    );
  },

  /**
   * Retrieve active gift options from the database cart
   */
  getGiftOptions: () => {
    if (!inMemorySummary) return null;
    return {
      isGift: Boolean(inMemorySummary.isGift),
      occasion: inMemorySummary.occasion || '',
      giftMessage: inMemorySummary.giftMessage || '',
      giftWrap: Boolean(inMemorySummary.giftWrap),
      giftRecipient: inMemorySummary.giftRecipient || {}
    };
  },

  /**
   * Save gift personalization preferences directly to the database cart
   */
  updateGiftOptions: async (giftData) => {
    try {
      const res = await api.put('/cart/gift-options', {
        isGift: true,
        occasion: giftData.occasion || '',
        giftMessage: giftData.giftMessage || giftData.messageText || '',
        giftWrap: giftData.giftWrap !== undefined ? giftData.giftWrap : true,
        giftRecipient: {
          name: giftData.recipientName || '',
          phone: giftData.recipientPhone || '',
          address: giftData.recipientAddress || '',
          city: giftData.recipientCity || '',
          postalCode: giftData.recipientPostalCode || '',
          email: giftData.recipientEmail || ''
        }
      });

      if (res?.data?.success && res.data.data) {
        inMemorySummary = res.data.data;
        window.dispatchEvent(new Event('cartChange'));
        return inMemorySummary;
      }
    } catch (err) {
      console.error('Failed to update gift options in DB:', err);
    }
    return null;
  },

  /**
   * Authoritative cart summary containing coupon, discounts, and item metrics
   */
  getCartSummary: () => {
    return inMemorySummary;
  },

  /**
   * Apply promotional coupon
   */
  applyCoupon: async (code) => {
    try {
      const res = await api.post('/cart/apply-coupon', { code });
      if (res?.data?.success && res.data.data) {
        inMemorySummary = res.data.data;
        inMemoryCart = (res.data.data.items || []).map(formatItem).filter(Boolean);
        window.dispatchEvent(new Event('cartChange'));
        return res.data;
      }
      return res?.data;
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to apply coupon.';
      throw new Error(errMsg);
    }
  },

  /**
   * Remove promotional coupon
   */
  removeCoupon: async () => {
    try {
      const res = await api.delete('/cart/remove-coupon');
      if (res?.data?.success && res.data.data) {
        inMemorySummary = res.data.data;
        inMemoryCart = (res.data.data.items || []).map(formatItem).filter(Boolean);
        window.dispatchEvent(new Event('cartChange'));
        return res.data;
      }
      return res?.data;
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to remove coupon.';
      throw new Error(errMsg);
    }
  }
};

export default cartService;
