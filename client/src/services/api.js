import axios from 'axios';

// Resolve API URL strictly from environment variable NEXT_PUBLIC_API_URL
const resolveApiUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    const clean = envUrl.trim().replace(/\/+$/, '');
    // Automatically ensure /api endpoint path is present
    return clean.endsWith('/api') ? clean : `${clean}/api`;
  }
  return 'http://localhost:5000/api';
};

export const API_URL = resolveApiUrl();
export const BASE_URL = API_URL.replace(/\/api$/, '');

let inMemoryGuestId = null;

const getGuestSessionId = () => {
  if (typeof window === 'undefined') return null;
  if (inMemoryGuestId) return inMemoryGuestId;
  try {
    let sid = sessionStorage.getItem('guest_session_id');
    if (!sid) {
      sid = 'guest_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);
      sessionStorage.setItem('guest_session_id', sid);
    }
    inMemoryGuestId = sid;
    return sid;
  } catch (e) {
    inMemoryGuestId = 'guest_' + Math.random().toString(36).substring(2, 11);
    return inMemoryGuestId;
  }
};

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const inAdminPage = window.location.pathname.startsWith('/admin') || window.location.hostname.startsWith('admin.');
    const isAdminEndpoint = config.url && (config.url.startsWith('/admin') || config.url.includes('admin'));

    // When inside the admin portal or calling an admin endpoint, strictly prioritize adminToken:
    let token = null;
    if (inAdminPage || isAdminEndpoint) {
      token = localStorage.getItem('adminToken') || localStorage.getItem('adminKey');
      if (!token) {
        try {
          const adminUserObj = JSON.parse(localStorage.getItem('adminUser') || '{}');
          if (adminUserObj?.role === 'admin') {
            token = localStorage.getItem('token') || localStorage.getItem('userToken');
          }
        } catch (e) {}
      }
    } else {
      // Storefront customer requests should only use customer userToken
      token = localStorage.getItem('userToken');
      if (!token) {
        const legacyToken = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        if (legacyToken && userStr) {
          try {
            const u = JSON.parse(userStr);
            if (u?.role !== 'admin') {
              token = legacyToken;
            }
          } catch (e) {}
        }
      }
    }

    // Ultimate fallback strictly respects page boundary
    if (!token && (inAdminPage || isAdminEndpoint)) {
      token = localStorage.getItem('adminToken') || localStorage.getItem('adminKey');
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      if (inAdminPage || isAdminEndpoint) {
        config.headers['x-admin-key'] = token;
      }
    } else {
      const guestId = getGuestSessionId();
      if (guestId) {
        config.headers['x-guest-id'] = guestId;
      }
    }
  }
  return config;
});

// Response interceptor to handle admin authorization failures
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== 'undefined') {
      const isAuthError = error.response?.status === 401 || error.response?.status === 403;
      const inAdminPage = (window.location.pathname.startsWith('/admin') || window.location.hostname.startsWith('admin.')) 
        && window.location.pathname !== '/admin/login' 
        && window.location.pathname !== '/login';

      if (isAuthError && inAdminPage) {
        console.warn('Admin authorization expired or invalid. Redirecting to admin authentication portal.');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminKey');
        localStorage.removeItem('adminUser');
        const loginPath = window.location.hostname.startsWith('admin.') ? '/login?reason=unauthorized' : '/admin/login?reason=unauthorized';
        window.location.href = loginPath;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
