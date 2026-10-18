import api from './api';

const adminService = {
  getDashboardStats: async () => (await api.get('/admin/stats')).data,
  getAllUsers: async () => (await api.get('/admin/users')).data,
};

export default adminService;
