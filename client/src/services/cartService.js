// ROVE & AMBER Luxury Fragrance Cart State Manager
const CART_STORAGE_KEY = 'rove_amber_cart';
const LEGACY_CART_KEY = 'zyra_cart';

export const cartService = {
  getCart: () => {
    if (typeof window === 'undefined') return [];
    try {
      let data = localStorage.getItem(CART_STORAGE_KEY);
      if (!data) {
        data = localStorage.getItem(LEGACY_CART_KEY);
      }
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error reading cart from localStorage', e);
      return [];
    }
  },

  saveCart: (cart) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
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
    localStorage.removeItem(CART_STORAGE_KEY);
    localStorage.removeItem(LEGACY_CART_KEY);
    window.dispatchEvent(new Event('cartChange'));
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
