import api from './api';

/**
 * ROVE & AMBER — Administrative API Service
 * Connects directly to backend /api/admin endpoints.
 * 100% Dynamic: Directly queries and manages live data from MongoDB database.
 */

export let isBackendConnected = true;

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
    try {
      const response = await api.get('/admin/stats', { params });
      if (response?.data?.success) {
        isBackendConnected = true;
        return response.data;
      }
    } catch (err) {
      console.error('Error fetching admin dashboard stats:', err);
    }
    return {
      success: true,
      data: {
        stats: {
          totalOrders: 0,
          totalRevenue: 0,
          totalCustomers: 0,
          totalProducts: 0,
          ordersDelta: '+0%',
          revenueDelta: '+0%',
          customersDelta: '+0%',
          productsDelta: '+0%',
          ordersByStatus: {
            Delivered: 0,
            Processing: 0,
            Shipped: 0,
            Pending: 0,
            Cancelled: 0
          }
        },
        recentOrders: [],
        topProducts: [],
        lowStock: [],
        latestCustomers: [],
        salesChart: [],
        rewards: {
          totalMembers: 0,
          pointsIssued: 0,
          rewardsRedeemed: 0,
          tierMembers: 0
        }
      }
    };
  },

  /* --------------------------------------------------------------------------
     2. USERS & CUSTOMERS
     -------------------------------------------------------------------------- */
  getAllUsers: async () => {
    try {
      const response = await api.get('/admin/users');
      if (response?.data?.success) {
        return response.data;
      }
    } catch (err) {
      console.error('Error fetching admin users:', err);
    }
    return {
      success: true,
      data: []
    };
  },

  /* --------------------------------------------------------------------------
     3. PRODUCT MANAGEMENT
     -------------------------------------------------------------------------- */
  getProducts: async (params = {}) => {
    try {
      const response = await api.get('/admin/products', { params });
      if (response?.data?.success) {
        const rawData = response.data.data;
        const productsList = Array.isArray(rawData) ? rawData : (rawData?.products || []);
        return {
          ...response.data,
          data: productsList,
          pagination: rawData?.pagination
        };
      }
    } catch (err) {
      console.error('Error fetching admin products:', err);
    }
    return {
      success: true,
      data: [],
      pagination: { total: 0, page: 1, limit: 12, pages: 1 }
    };
  },

  createProduct: async (formData) => {
    const response = await api.post('/admin/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  updateProduct: async (id, formData) => {
    const response = await api.put(`/admin/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  updateStock: async (id, stockData) => {
    const response = await api.patch(`/admin/products/${id}/stock`, stockData);
    return response.data;
  },

  deleteProduct: async (id) => {
    const response = await api.delete(`/admin/products/${id}`);
    return response.data;
  },

  /* --------------------------------------------------------------------------
     4. ORDER MANAGEMENT
     -------------------------------------------------------------------------- */
  getOrders: async (params = {}) => {
    try {
      const response = await api.get('/admin/orders', { params });
      if (response?.data?.success) {
        const raw = response.data.data;
        const list = Array.isArray(raw) ? raw : (raw?.orders || []);
        return {
          ...response.data,
          data: list,
          pagination: raw?.pagination
        };
      }
    } catch (err) {
      console.error('Error fetching admin orders:', err);
    }
    return {
      success: true,
      data: [],
      pagination: { total: 0, page: 1, limit: 10, pages: 1 }
    };
  },

  getOrderById: async (id) => {
    const response = await api.get(`/admin/orders/${id}`);
    return response.data;
  },

  updateOrderStatus: async (id, statusData) => {
    const response = await api.put(`/admin/orders/${id}/status`, statusData);
    return response.data;
  },

  /* --------------------------------------------------------------------------
     5. INVENTORY & STOCK
     -------------------------------------------------------------------------- */
  getInventory: async () => {
    try {
      const response = await api.get('/admin/inventory');
      if (response?.data?.success) {
        return response.data;
      }
    } catch (err) {
      console.error('Error fetching admin inventory:', err);
    }
    return {
      success: true,
      data: {
        products: [],
        lowStockAlerts: []
      }
    };
  },

  adjustStock: async (data) => {
    const response = await api.post('/admin/inventory/adjust', data);
    return response.data;
  },

  /* --------------------------------------------------------------------------
     6. CATEGORIES
     -------------------------------------------------------------------------- */
  getCategories: async () => {
    try {
      const response = await api.get('/categories');
      if (response?.data?.success) {
        return response.data;
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
    return {
      success: true,
      data: []
    };
  },

  createCategory: async (data) => {
    const isForm = typeof FormData !== 'undefined' && data instanceof FormData;
    const config = isForm ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
    const response = await api.post('/categories', data, config);
    return response.data;
  },

  updateCategory: async (id, data) => {
    const isForm = typeof FormData !== 'undefined' && data instanceof FormData;
    const config = isForm ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
    const response = await api.put(`/categories/${id}`, data, config);
    return response.data;
  },

  deleteCategory: async (id) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },

  toggleCategoryStatus: async (id, status) => {
    const response = await api.patch(`/categories/${id}/status`, { status });
    return response.data;
  },

  uploadCategoryImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await api.post('/categories/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  /* --------------------------------------------------------------------------
     7. REWARDS & LOYALTY
     -------------------------------------------------------------------------- */
  getRewards: async () => {
    try {
      const response = await api.get('/admin/rewards');
      if (response?.data?.success) {
        return response.data;
      }
    } catch (err) {
      // Empty data state when reward endpoint returns empty
    }
    return {
      success: true,
      data: {
        stats: { totalMembers: 0, pointsIssued: 0, rewardsRedeemed: 0, tierMembers: 0 },
        rules: [],
        members: []
      }
    };
  },

  updateRewardRules: async (rules) => {
    const response = await api.put('/admin/rewards/rules', rules);
    return response.data;
  },

  /* --------------------------------------------------------------------------
     8. COUPONS & DISCOUNTS
     -------------------------------------------------------------------------- */
  getCoupons: async () => {
    try {
      const response = await api.get('/admin/coupons');
      if (response?.data?.success) {
        return response.data;
      }
    } catch (err) {
      // Empty state
    }
    return {
      success: true,
      data: []
    };
  },

  createCoupon: async (couponData) => {
    const response = await api.post('/admin/coupons', couponData);
    return response.data;
  },

  /* --------------------------------------------------------------------------
     9. REVIEWS & RATINGS
     -------------------------------------------------------------------------- */
  getReviews: async () => {
    try {
      const response = await api.get('/admin/reviews');
      if (response?.data?.success) {
        const raw = response.data.data;
        const list = Array.isArray(raw)
          ? raw
          : (Array.isArray(raw?.reviews) ? raw.reviews : []);
        const formatted = list.map(r => ({
          ...r,
          id: r.id || r._id,
          customer: r.customer || r.customerName || (typeof r.user === 'object' ? r.user?.name : 'Valued Patron'),
          date: r.date || (r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recently')
        }));
        return { ...response.data, data: formatted };
      }
    } catch (err) {
      console.error('Error fetching admin reviews:', err);
    }
    return {
      success: true,
      data: []
    };
  },

  moderateReview: async (id, statusData) => {
    const response = await api.put(`/admin/reviews/${id}/moderate`, statusData);
    return response.data;
  },

  /* --------------------------------------------------------------------------
     10. GIFTS MANAGEMENT
     -------------------------------------------------------------------------- */
  getGifts: async () => {
    try {
      const response = await api.get('/admin/gifts');
      if (response?.data?.success) {
        return response.data;
      }
    } catch (err) {
      console.error('Error fetching admin gifts:', err);
    }
    return {
      success: true,
      data: []
    };
  },

  updateGiftFulfillment: async (id, data) => {
    const response = await api.put(`/admin/gifts/${id}/fulfillment`, data);
    return response.data;
  },

  /* --------------------------------------------------------------------------
     11. REPORTS & ANALYTICS
     -------------------------------------------------------------------------- */
  getReports: async (range = '30d') => {
    try {
      const response = await api.get('/admin/reports/monthly', { params: { range } });
      if (response?.data?.success) {
        return response.data;
      }
    } catch (err) {
      console.error('Error fetching admin reports:', err);
    }
    return {
      success: true,
      data: {
        totalRevenue: 0,
        totalOrders: 0,
        aov: 0,
        chart: [],
        topProducts: []
      }
    };
  }
};

export default adminService;
