import api from './api';
import {
  MOCK_ADMIN_STATS,
  MOCK_RECENT_ORDERS,
  MOCK_TOP_PRODUCTS,
  MOCK_LOW_STOCK,
  MOCK_CUSTOMERS,
  MOCK_CATEGORIES,
  MOCK_REWARDS_DATA,
  MOCK_COUPONS,
  MOCK_REVIEWS,
  MOCK_GIFTS_DATA,
  MOCK_SALES_CHART
} from '@/data/adminMockData';

/**
 * ROVE & AMBER — Administrative API Service
 * Connects directly to backend /api/admin endpoints when server is online.
 * Seamlessly provides luxury mock data fallback with clear indicators when backend is offline.
 */

export let isBackendConnected = false;

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
  getDashboardStats: async () => {
    try {
      const response = await api.get('/admin/stats');
      if (response?.data?.success) {
        isBackendConnected = true;
        return {
          ...response.data,
          isMock: false
        };
      }
    } catch (err) {
      console.warn('Backend API /api/admin/stats unreachable, using luxury mock fallback.');
    }
    return {
      success: true,
      isMock: true,
      data: {
        stats: {
          totalOrders: MOCK_ADMIN_STATS.totalOrders,
          totalRevenue: MOCK_ADMIN_STATS.totalRevenue,
          totalCustomers: MOCK_ADMIN_STATS.totalCustomers,
          totalProducts: MOCK_ADMIN_STATS.totalProducts,
          ordersDelta: MOCK_ADMIN_STATS.ordersDelta,
          revenueDelta: MOCK_ADMIN_STATS.revenueDelta,
          customersDelta: MOCK_ADMIN_STATS.customersDelta,
          productsDelta: MOCK_ADMIN_STATS.productsDelta,
          ordersByStatus: MOCK_ADMIN_STATS.ordersByStatus
        },
        recentOrders: MOCK_RECENT_ORDERS,
        topProducts: MOCK_TOP_PRODUCTS,
        lowStock: MOCK_LOW_STOCK,
        latestCustomers: MOCK_CUSTOMERS.slice(0, 4),
        salesChart: MOCK_SALES_CHART,
        rewards: MOCK_ADMIN_STATS.rewards
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
        return { ...response.data, isMock: false };
      }
    } catch (err) {
      console.warn('Backend API /api/admin/users unreachable, using mock fallback.');
    }
    return {
      success: true,
      isMock: true,
      data: MOCK_CUSTOMERS
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
          pagination: rawData?.pagination,
          isMock: false
        };
      }
    } catch (err) {
      console.warn('Backend API /api/admin/products unreachable, using mock fallback.');
    }
    return {
      success: true,
      isMock: true,
      data: MOCK_TOP_PRODUCTS
    };
  },

  createProduct: async (formData) => {
    try {
      const response = await api.post('/admin/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return { ...response.data, isMock: false };
    } catch (err) {
      console.warn('Backend API createProduct failed, mock success returned.');
      return {
        success: true,
        isMock: true,
        message: 'Product created successfully in preview mode (Backend offline).'
      };
    }
  },

  updateProduct: async (id, formData) => {
    try {
      const response = await api.put(`/admin/products/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return { ...response.data, isMock: false };
    } catch (err) {
      return {
        success: true,
        isMock: true,
        message: 'Product updated successfully in preview mode.'
      };
    }
  },

  updateStock: async (id, stockData) => {
    try {
      const response = await api.patch(`/admin/products/${id}/stock`, stockData);
      return { ...response.data, isMock: false };
    } catch (err) {
      return {
        success: true,
        isMock: true,
        message: 'Stock updated in preview mode.'
      };
    }
  },

  deleteProduct: async (id) => {
    try {
      const response = await api.delete(`/admin/products/${id}`);
      return { ...response.data, isMock: false };
    } catch (err) {
      return {
        success: true,
        isMock: true,
        message: 'Product deleted in preview mode.'
      };
    }
  },

  /* --------------------------------------------------------------------------
     4. ORDER MANAGEMENT
     -------------------------------------------------------------------------- */
  getOrders: async (params = {}) => {
    try {
      const response = await api.get('/admin/orders', { params });
      if (response?.data?.success) {
        return { ...response.data, isMock: false };
      }
    } catch (err) {
      console.warn('Backend API /api/admin/orders unreachable, using mock fallback.');
    }
    return {
      success: true,
      isMock: true,
      data: MOCK_RECENT_ORDERS
    };
  },

  getOrderById: async (id) => {
    try {
      const response = await api.get(`/admin/orders/${id}`);
      if (response?.data?.success) {
        return { ...response.data, isMock: false };
      }
    } catch (err) {
      console.warn('Backend API /api/admin/orders/:id unreachable.');
    }
    const found = MOCK_RECENT_ORDERS.find(o => o.id === id || o.orderNumber === id);
    return {
      success: true,
      isMock: true,
      data: found || MOCK_RECENT_ORDERS[0]
    };
  },

  updateOrderStatus: async (id, statusData) => {
    try {
      const response = await api.put(`/admin/orders/${id}/status`, statusData);
      return { ...response.data, isMock: false };
    } catch (err) {
      return {
        success: true,
        isMock: true,
        message: 'Order status updated in preview mode.'
      };
    }
  },

  /* --------------------------------------------------------------------------
     5. INVENTORY & STOCK
     -------------------------------------------------------------------------- */
  getInventory: async () => {
    try {
      const response = await api.get('/admin/inventory');
      if (response?.data?.success) {
        return { ...response.data, isMock: false };
      }
    } catch (err) {
      console.warn('Backend API /api/admin/inventory unreachable.');
    }
    return {
      success: true,
      isMock: true,
      data: {
        products: MOCK_TOP_PRODUCTS.concat(MOCK_LOW_STOCK),
        lowStockAlerts: MOCK_LOW_STOCK
      }
    };
  },

  adjustStock: async (data) => {
    try {
      const response = await api.post('/admin/inventory/adjust', data);
      return { ...response.data, isMock: false };
    } catch (err) {
      return {
        success: true,
        isMock: true,
        message: 'Stock adjusted successfully (Preview mode).'
      };
    }
  },

  /* --------------------------------------------------------------------------
     6. CATEGORIES
     -------------------------------------------------------------------------- */
  getCategories: async () => {
    try {
      const response = await api.get('/categories');
      if (response?.data?.success) {
        return { ...response.data, isMock: false };
      }
    } catch (err) {
      console.warn('Backend API /api/categories unreachable.');
    }
    return {
      success: true,
      isMock: true,
      data: MOCK_CATEGORIES
    };
  },

  createCategory: async (data) => {
    try {
      const isForm = typeof FormData !== 'undefined' && data instanceof FormData;
      const config = isForm ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
      const response = await api.post('/categories', data, config);
      return { ...response.data, isMock: false };
    } catch (err) {
      console.error('Create category error:', err);
      throw err;
    }
  },

  updateCategory: async (id, data) => {
    try {
      const isForm = typeof FormData !== 'undefined' && data instanceof FormData;
      const config = isForm ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
      const response = await api.put(`/categories/${id}`, data, config);
      return { ...response.data, isMock: false };
    } catch (err) {
      console.error('Update category error:', err);
      throw err;
    }
  },

  deleteCategory: async (id) => {
    try {
      const response = await api.delete(`/categories/${id}`);
      return { ...response.data, isMock: false };
    } catch (err) {
      console.error('Delete category error:', err);
      throw err;
    }
  },

  toggleCategoryStatus: async (id, status) => {
    try {
      const response = await api.patch(`/categories/${id}/status`, { status });
      return { ...response.data, isMock: false };
    } catch (err) {
      console.error('Toggle category status error:', err);
      throw err;
    }
  },

  uploadCategoryImage: async (file) => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      const response = await api.post('/categories/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return { ...response.data, isMock: false };
    } catch (err) {
      console.error('Upload category image error:', err);
      throw err;
    }
  },

  /* --------------------------------------------------------------------------
     7. REWARDS & LOYALTY
     -------------------------------------------------------------------------- */
  getRewards: async () => {
    // Backend rewards integration point: GET /api/admin/rewards
    return {
      success: true,
      isMock: true,
      data: MOCK_REWARDS_DATA
    };
  },

  updateRewardRules: async (rules) => {
    // Backend rewards integration point: PUT /api/admin/rewards/rules
    return {
      success: true,
      isMock: true,
      message: 'Reward rules updated (Awaiting backend integration point).'
    };
  },

  /* --------------------------------------------------------------------------
     8. COUPONS & DISCOUNTS
     -------------------------------------------------------------------------- */
  getCoupons: async () => {
    try {
      const response = await api.get('/admin/coupons');
      if (response?.data?.success) {
        return { ...response.data, isMock: false };
      }
    } catch (err) {
      // Backend coupon fallback
    }
    return {
      success: true,
      isMock: true,
      data: MOCK_COUPONS
    };
  },

  createCoupon: async (couponData) => {
    try {
      const response = await api.post('/admin/coupons', couponData);
      return { ...response.data, isMock: false };
    } catch (err) {
      return {
        success: true,
        isMock: true,
        message: 'Coupon created successfully (Preview mode).'
      };
    }
  },

  /* --------------------------------------------------------------------------
     9. REVIEWS & RATINGS
     -------------------------------------------------------------------------- */
  getReviews: async () => {
    try {
      const response = await api.get('/admin/reviews');
      if (response?.data?.success) {
        return { ...response.data, isMock: false };
      }
    } catch (err) {
      // Fallback
    }
    return {
      success: true,
      isMock: true,
      data: MOCK_REVIEWS
    };
  },

  moderateReview: async (id, statusData) => {
    try {
      const response = await api.put(`/admin/reviews/${id}/moderate`, statusData);
      return { ...response.data, isMock: false };
    } catch (err) {
      return {
        success: true,
        isMock: true,
        message: 'Review moderated successfully.'
      };
    }
  },

  /* --------------------------------------------------------------------------
     10. GIFTS MANAGEMENT
     -------------------------------------------------------------------------- */
  getGifts: async () => {
    try {
      const response = await api.get('/admin/gifts');
      if (response?.data?.success) {
        return { ...response.data, isMock: false };
      }
    } catch (err) {}
    return {
      success: true,
      isMock: true,
      data: MOCK_GIFTS_DATA
    };
  },

  /* --------------------------------------------------------------------------
     11. REPORTS & ANALYTICS
     -------------------------------------------------------------------------- */
  getReports: async (range = '30d') => {
    try {
      const response = await api.get('/admin/reports/monthly', { params: { range } });
      if (response?.data?.success) {
        return { ...response.data, isMock: false };
      }
    } catch (err) {}
    return {
      success: true,
      isMock: true,
      data: {
        totalRevenue: MOCK_ADMIN_STATS.totalRevenue,
        totalOrders: MOCK_ADMIN_STATS.totalOrders,
        aov: Math.round(MOCK_ADMIN_STATS.totalRevenue / MOCK_ADMIN_STATS.totalOrders),
        chart: MOCK_SALES_CHART,
        topProducts: MOCK_TOP_PRODUCTS
      }
    };
  }
};

export default adminService;
