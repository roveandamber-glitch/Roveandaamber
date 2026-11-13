"use client";
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
  forgotPassword: async (data) => (await api.post('/auth/forgot-password', data)).data,
  resetPassword: async (data) => (await api.post('/auth/reset-password', data)).data,
  googleAuth: async (payload) => (await api.post('/auth/google', payload)).data,

  // Session & Local Storage Management
  saveSession: (user, token) => {
    if (typeof window !== 'undefined') {
      if (user?.role === 'admin') {
        localStorage.setItem('adminUser', JSON.stringify(user));
        localStorage.setItem('adminToken', token);
        localStorage.setItem('adminKey', token);
        // Clear any admin user that leaked into customer storage
        try {
          const curUser = localStorage.getItem('user');
          if (curUser && JSON.parse(curUser)?.role === 'admin') {
            localStorage.removeItem('user');
            localStorage.removeItem('userToken');
          }
        } catch (e) {}
      } else {
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('userToken', token);
        localStorage.setItem('token', token);
      }
      window.dispatchEvent(new Event('authChange'));
    }
  },

  saveAdminSession: (user, token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('adminUser', JSON.stringify(user));
      localStorage.setItem('adminToken', token);
      localStorage.setItem('adminKey', token);
      // Clean up customer session if it contains admin data
      try {
        const curUser = localStorage.getItem('user');
        if (curUser && JSON.parse(curUser)?.role === 'admin') {
          localStorage.removeItem('user');
          localStorage.removeItem('userToken');
        }
      } catch (e) {}
      window.dispatchEvent(new Event('authChange'));
    }
  },

  clearSession: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('user');
    localStorage.removeItem('userToken');
    localStorage.removeItem('token');
    localStorage.removeItem('rove_amber_wishlist');
    window.dispatchEvent(new Event('authChange'));
    window.dispatchEvent(new Event('wishlistChange'));
  },

  clearAdminSession: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminKey');
    window.dispatchEvent(new Event('authChange'));
  },

  getUser: () => {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      const parsed = JSON.parse(userStr);
      // Customer user should never be admin
      if (parsed?.role === 'admin') return null;
      return parsed;
    } catch {
      return null;
    }
  },

  getAdminUser: () => {
    if (typeof window === 'undefined') return null;
    const adminStr = localStorage.getItem('adminUser') || localStorage.getItem('user');
    if (!adminStr) return null;
    try {
      const parsed = JSON.parse(adminStr);
      return parsed?.role === 'admin' ? parsed : null;
    } catch {
      return null;
    }
  },

  getToken: () => {
    if (typeof window === 'undefined') return null;
    const user = authService.getUser();
    if (!user) return null;
    return (
      localStorage.getItem('userToken') ||
      localStorage.getItem('token') ||
      null
    );
  },

  getAdminToken: () => {
    if (typeof window === 'undefined') return null;
    return (
      localStorage.getItem('adminToken') ||
      localStorage.getItem('adminKey') ||
      null
    );
  },

  isAuthenticated: () => {
    return Boolean(authService.getToken() && authService.getUser());
  },

  isAdmin: () => {
    const adminUser = authService.getAdminUser();
    const adminToken = authService.getAdminToken();
    return Boolean(adminToken && adminUser && adminUser.role === 'admin');
  }
};

export default authService;
