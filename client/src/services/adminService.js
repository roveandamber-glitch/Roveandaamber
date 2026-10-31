import api from './api';

export let isBackendConnected = true;

/**
 * ROVE & AMBER — Administrative API Service
 * All operational metrics, orders, products, and categories are delivered purely
 * and dynamically from live MongoDB Atlas database endpoints.
 */
const adminService = {
  // Check backend health
  checkHealth: async () => {
    try {
      const res = await api.get('/admin/stats');
      isBackendConnected = res?.data?.success === true;
      return isBackendConnected;
    } catch {
      isBackendConnected = false;
      return false;
    }
  },

  /* --------------------------------------------------------------------------
     1. DASHBOARD & OVERVIEW
     -------------------------------------------------------------------------- */
  getDashboardStats: async (params = {}) => {
    const response = await api.get('/admin/stats', { params });
    return response.data;
  },

  /* --------------------------------------------------------------------------
     2. USERS & CUSTOMERS
     -------------------------------------------------------------------------- */
  getAllUsers: async (params = {}) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  /* --------------------------------------------------------------------------
     3. PRODUCTS
     -------------------------------------------------------------------------- */
  getProducts: async (params = {}) => {
    const response = await api.get('/admin/products', { params });
    return response.data;
  },

  createProduct: async (productData) => {
    const config = (typeof FormData !== 'undefined' && productData instanceof FormData)
      ? { headers: { 'Content-Type': 'multipart/form-data' } }
      : {};
    const response = await api.post('/admin/products', productData, config);
    return response.data;
  },

  updateProduct: async (id, productData) => {
    const config = (typeof FormData !== 'undefined' && productData instanceof FormData)
      ? { headers: { 'Content-Type': 'multipart/form-data' } }
      : {};
    const response = await api.put(`/admin/products/${id}`, productData, config);
    return response.data;
  },

  updateStock: async (id, stock) => {
    const response = await api.patch(`/admin/products/${id}/stock`, { stock });
    return response.data;
  },

  deleteProduct: async (id) => {
    const response = await api.delete(`/admin/products/${id}`);
    return response.data;
  },

  /* --------------------------------------------------------------------------
     4. ORDERS & DISPATCH
     -------------------------------------------------------------------------- */
  getOrders: async (params = {}) => {
    const response = await api.get('/admin/orders', { params });
    return response.data;
  },

  getOrderById: async (id) => {
    const response = await api.get(`/admin/orders/${id}`);
    return response.data;
  },

  updateOrderStatus: async (id, payload) => {
    const response = await api.patch(`/admin/orders/${id}/status`, payload);
    return response.data;
  },

  /* --------------------------------------------------------------------------
     5. INVENTORY & STOCK
     -------------------------------------------------------------------------- */
  getInventory: async (params = {}) => {
    const response = await api.get('/admin/inventory', { params });
    return response.data;
  },

  adjustStock: async (id, adjustment, reason) => {
    const response = await api.post(`/admin/inventory/${id}/adjust`, { adjustment, reason });
    return response.data;
  },

  /* --------------------------------------------------------------------------
     6. CATEGORIES
     -------------------------------------------------------------------------- */
  getCategories: async (params = {}) => {
    const response = await api.get('/admin/categories', { params });
    return response.data;
  },

  createCategory: async (categoryData) => {
    const config = (typeof FormData !== 'undefined' && categoryData instanceof FormData)
      ? { headers: { 'Content-Type': 'multipart/form-data' } }
      : {};
    const response = await api.post('/admin/categories', categoryData, config);
    return response.data;
  },

  updateCategory: async (id, categoryData) => {
    const config = (typeof FormData !== 'undefined' && categoryData instanceof FormData)
      ? { headers: { 'Content-Type': 'multipart/form-data' } }
      : {};
    const response = await api.put(`/admin/categories/${id}`, categoryData, config);
    return response.data;
  },

  deleteCategory: async (id) => {
    const response = await api.delete(`/admin/categories/${id}`);
    return response.data;
  },

  toggleCategoryStatus: async (id, status) => {
    const response = await api.patch(`/admin/categories/${id}/status`, { status });
    return response.data;
  },

  uploadCategoryImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await api.post('/admin/categories/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  /* --------------------------------------------------------------------------
     7. REWARDS & MEMBERSHIP
     -------------------------------------------------------------------------- */
  getRewards: async (params = {}) => {
    const response = await api.get('/admin/rewards', { params });
    return response.data;
  },

  updateRewardRules: async (rules) => {
    const response = await api.put('/admin/rewards/rules', rules);
    return response.data;
  },

  /* --------------------------------------------------------------------------
     8. COUPONS & PROMOTIONS
     -------------------------------------------------------------------------- */
  getCoupons: async (params = {}) => {
    const response = await api.get('/admin/coupons', { params });
    return response.data;
  },

  createCoupon: async (couponData) => {
    const response = await api.post('/admin/coupons', couponData);
    return response.data;
  },

  /* --------------------------------------------------------------------------
     9. REVIEWS & MODERATION
     -------------------------------------------------------------------------- */
  getReviews: async (params = {}) => {
    const response = await api.get('/admin/reviews', { params });
    return response.data;
  },

  moderateReview: async (id, status) => {
    const response = await api.patch(`/admin/reviews/${id}/status`, { status });
    return response.data;
  },

  /* --------------------------------------------------------------------------
     10. GIFTING & STUDIO
     -------------------------------------------------------------------------- */
  getGifts: async (params = {}) => {
    const response = await api.get('/admin/gifts', { params });
    return response.data;
  },

  /* --------------------------------------------------------------------------
     11. REPORTS & ANALYTICS
     -------------------------------------------------------------------------- */
  getReports: async (params = {}) => {
    const response = await api.get('/admin/reports', { params });
    return response.data;
  }
};

export default adminService;
