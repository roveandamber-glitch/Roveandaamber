import api from './api';

const authService = {
  login: async (credentials) => (await api.post('/auth/login', credentials)).data,
  register: async (userData) => (await api.post('/auth/register', userData)).data,
  getProfile: async () => (await api.get('/auth/me')).data,
  updateProfile: async (profileData) => (await api.put('/auth/profile', profileData)).data,
  changePassword: async (passwordData) => (await api.put('/auth/change-password', passwordData)).data,
};

export default authService;
