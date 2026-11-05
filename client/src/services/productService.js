import api from './api';

const productService = {
  getAllProducts: async (params) => (await api.get('/products', { params })).data,
  getProductById: async (id) => (await api.get(`/products/${id}`)).data,
  createProduct: async (data) => (await api.post('/products', data)).data,
  updateProduct: async (id, data) => (await api.put(`/products/${id}`, data)).data,
  deleteProduct: async (id) => (await api.delete(`/products/${id}`)).data,
  getPublicReviews: async () => {
    try {
      const res = await api.get('/reviews');
      return res.data;
    } catch (err) {
      return { success: false, data: [] };
    }
  },
  getProductReviews: async (productId, params = {}) => {
    try {
      const res = await api.get(`/reviews/product/${productId}`, { params });
      return res.data;
    } catch (err) {
      return { success: false, data: [], stats: null, message: err?.response?.data?.message || err.message };
    }
  },
  submitReview: async (reviewData) => {
    const res = await api.post('/reviews', reviewData);
    return res.data;
  },
  deleteReview: async (reviewId) => {
    const res = await api.delete(`/reviews/${reviewId}`);
    return res.data;
  }
};

export default productService;
