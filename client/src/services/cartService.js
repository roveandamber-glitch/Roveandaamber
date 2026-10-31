// ROVE & AMBER Luxury Fragrance Cart State Manager
const BASE_CART_KEY = 'rove_amber_cart';

/**
 * Helper to determine active cart key scoped to the logged-in customer.
 * - Logged-in Customer: `rove_amber_cart_<userId>` (completely private, isolated per customer)
 * - Guest Visitor: `rove_amber_cart_guest`
 * This ensures newly created user accounts ALWAYS start with a pristine, empty cart
 * and never inherit leftover items from previous browser sessions or test data.
 */
const getCartKey = () => {
  if (typeof window === 'undefined') return BASE_CART_KEY;
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      const uid = user?.id || user?._id;
      if (uid && user?.role !== 'admin') {
        return `${BASE_CART_KEY}_${uid}`;
      }
    }
  } catch (e) {}
  return `${BASE_CART_KEY}_guest`;
};

export const cartService = {
  getCart: () => {
    if (typeof window === 'undefined') return [];
    try {
      const storageKey = getCartKey();
      const data = localStorage.getItem(storageKey);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error reading cart from localStorage', e);
      return [];
    }
  },

  saveCart: (cart) => {
    if (typeof window === 'undefined') return;
    try {
      const storageKey = getCartKey();
      localStorage.setItem(storageKey, JSON.stringify(cart));
      window.dispatchEvent(new Event('cartChange'));
    } catch (e) {
      console.error('Error saving cart to localStorage', e);
    }
  },

  addToCart: (item) => {
    const cart = cartService.getCart();
    const itemKey = `${item.productId || item.id}_${item.size || '50ML'}`;
    const existingIndex = cart.findIndex((i) => `${i.productId || i.id}_${i.size || '50ML'}` === itemKey);

    const maxStock = item.maxStock !== undefined ? item.maxStock : 99;
    const addQty = parseInt(item.quantity, 10) || 1;

    if (existingIndex > -1) {
      const currentQty = cart[existingIndex].quantity;
      const newQty = Math.min(maxStock, currentQty + addQty);
      cart[existingIndex].quantity = newQty;
      cart[existingIndex].price = item.price;
      cart[existingIndex].name = item.name;
      cart[existingIndex].image = item.image;
    } else {
      cart.push({
        id: item.productId || item.id,
        productId: item.productId || item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        size: (item.size || '50ML').toUpperCase(),
        quantity: Math.min(maxStock, addQty),
        maxStock: maxStock
      });
    }

    cartService.saveCart(cart);
    return cart;
  },

  updateQuantity: (productId, size, newQty) => {
    let cart = cartService.getCart();
    const itemKey = `${productId}_${size}`;
    
    if (newQty <= 0) {
      cart = cart.filter((i) => `${i.productId || i.id}_${i.size || '50ML'}` !== itemKey);
    } else {
      cart = cart.map((item) => {
        if (`${item.productId || item.id}_${item.size || '50ML'}` === itemKey) {
          const clampedQty = item.maxStock ? Math.min(item.maxStock, newQty) : newQty;
          return { ...item, quantity: clampedQty };
        }
        return item;
      });
    }

    cartService.saveCart(cart);
    return cart;
  },

  removeFromCart: (productId, size) => {
    const itemKey = `${productId}_${size}`;
    const cart = cartService.getCart().filter((i) => `${i.productId || i.id}_${i.size || '50ML'}` !== itemKey);
    cartService.saveCart(cart);
    return cart;
  },

  clearCart: () => {
    if (typeof window === 'undefined') return;
    try {
      const currentKey = getCartKey();
      localStorage.removeItem(currentKey);
      // Clean up legacy shared and guest keys
      localStorage.removeItem(BASE_CART_KEY);
      localStorage.removeItem('zyra_cart');
      localStorage.removeItem(`${BASE_CART_KEY}_guest`);
      localStorage.removeItem('rove_amber_gift_options');
      window.dispatchEvent(new Event('cartChange'));
    } catch (e) {
      console.error('Error clearing cart', e);
    }
  },

  getCartCount: () => {
    const cart = cartService.getCart();
    return cart.reduce((acc, item) => acc + (parseInt(item.quantity, 10) || 1), 0);
  },

  getCartTotal: () => {
    const cart = cartService.getCart();
    return cart.reduce((acc, item) => acc + (Number(item.price) || 0) * (parseInt(item.quantity, 10) || 1), 0);
  }
};

export default cartService;
