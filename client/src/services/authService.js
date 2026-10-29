import api from './api';

const authService = {
  // Authentication API calls
  login: async (credentials) => (await api.post('/auth/login', credentials)).data,
  register: async (userData) => (await api.post('/auth/register', userData)).data,
  sendOtp: async (data) => (await api.post('/auth/send-otp', data)).data,
  resendOtp: async (data) => (await api.post('/auth/resend-otp', data)).data,
  verifyOtp: async (data) => (await api.post('/auth/verify-otp', data)).data,
  getProfile: async () => (await api.get('/auth/me')).data,
  updateProfile: async (profileData) => (await api.put('/auth/profile', profileData)).data,
  changePassword: async (passwordData) => (await api.put('/auth/change-password', passwordData)).data,

  // Session & Local Storage Management
  saveSession: (user, token) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);

    if (user?.role === 'admin') {
      localStorage.setItem('adminToken', token);
      localStorage.setItem('adminKey', token);
      localStorage.removeItem('userToken');
    } else {
      localStorage.setItem('userToken', token);
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminKey');
    }

    window.dispatchEvent(new Event('authChange'));
  },

  clearSession: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('userToken');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminKey');
    window.dispatchEvent(new Event('authChange'));
  },

  getUser: () => {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  getToken: () => {
    if (typeof window === 'undefined') return null;
    return (
      localStorage.getItem('adminToken') ||
      localStorage.getItem('userToken') ||
      localStorage.getItem('token') ||
      localStorage.getItem('adminKey') ||
      null
    );
  },

  isAuthenticated: () => {
    return Boolean(authService.getToken() && authService.getUser());
  },

  isAdmin: () => {
    const user = authService.getUser();
    return Boolean(authService.getToken() && user && user.role === 'admin');
  }
};

export default authService;
