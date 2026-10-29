import api from './api';

const categoryService = {
  getAllCategories: async () => (await api.get('/categories')).data,
  getCategoryById: async (id) => (await api.get(`/categories/${id}`)).data,
  createCategory: async (data) => {
    const config = (typeof FormData !== 'undefined' && data instanceof FormData)
      ? { headers: { 'Content-Type': 'multipart/form-data' } }
      : {};
    return (await api.post('/categories', data, config)).data;
  },
  updateCategory: async (id, data) => {
    const config = (typeof FormData !== 'undefined' && data instanceof FormData)
      ? { headers: { 'Content-Type': 'multipart/form-data' } }
      : {};
    return (await api.put(`/categories/${id}`, data, config)).data;
  },
  deleteCategory: async (id) => (await api.delete(`/categories/${id}`)).data,
  toggleCategoryStatus: async (id, status) => (await api.patch(`/categories/${id}/status`, { status })).data,
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return (await api.post('/categories/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })).data;
  }
};

export default categoryService;
