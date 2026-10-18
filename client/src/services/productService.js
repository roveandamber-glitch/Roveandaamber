import api from './api';

const productService = {
  getAllProducts: async (params) => (await api.get('/products', { params })).data,
  getProductById: async (id) => (await api.get(`/products/${id}`)).data,
  createProduct: async (data) => (await api.post('/products', data)).data,
  updateProduct: async (id, data) => (await api.put(`/products/${id}`, data)).data,
  deleteProduct: async (id) => (await api.delete(`/products/${id}`)).data,
};

export default productService;
