import axios from 'axios';
import { message } from 'antd';

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
        } catch (e) {
          /* ignore */
        }
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
          } catch (e) {
            /* ignore */
          }
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

// Flight lock to ensure single toast & single redirect on batch 401s
let isAuthRedirecting = false;

// Response interceptor to handle authentication and authorization failures (401 / 403)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== 'undefined') {
      const status = error.response?.status;
      const isAuthError = status === 401 || status === 403;

      if (isAuthError) {
        const pathname = window.location.pathname;
        const hostname = window.location.hostname;
        const inAdminPage = (pathname.startsWith('/admin') || hostname.startsWith('admin.')) 
          && pathname !== '/admin/login' 
          && pathname !== '/login';

        if (inAdminPage) {
          // --- 1. ADMIN AUTHORIZATION EXPIRY ---
          console.warn('Admin authorization expired or invalid. Purging admin credentials.');
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminKey');
          localStorage.removeItem('adminUser');
          window.dispatchEvent(new Event('authChange'));

          if (!isAuthRedirecting && pathname !== '/admin/login' && pathname !== '/login') {
            isAuthRedirecting = true;
            try {
              message.destroy();
              message.warning({
                content: 'Admin session expired. Redirecting to admin sign in...',
                key: 'auth_expired_notice',
                duration: 2.5
              });
            } catch (e) {}

            const loginPath = hostname.startsWith('admin.') 
              ? `/login?reason=expired&redirect=${encodeURIComponent(pathname + window.location.search)}`
              : `/admin/login?reason=expired&redirect=${encodeURIComponent(pathname + window.location.search)}`;

            setTimeout(() => {
              window.location.href = loginPath;
            }, 400);
          }
        } else {
          // --- 2. STOREFRONT CUSTOMER AUTHORIZATION EXPIRY ---
          console.warn('Customer session expired or invalid. Purging tokens.');
          localStorage.removeItem('userToken');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.dispatchEvent(new Event('authChange'));

          if (!isAuthRedirecting) {
            isAuthRedirecting = true;
            try {
              message.destroy();
              message.warning({
                content: 'Your session has expired. Redirecting to sign in...',
                key: 'auth_expired_notice',
                duration: 2.5
              });
            } catch (e) {}

            const isProtectedCustomerRoute = 
              pathname.startsWith('/cart') ||
              pathname.startsWith('/checkout') ||
              pathname.startsWith('/profile') ||
              pathname.startsWith('/orders') ||
              pathname.startsWith('/account');

            if (isProtectedCustomerRoute && pathname !== '/login' && pathname !== '/register') {
              const redirectUrl = `/login?reason=expired&redirect=${encodeURIComponent(pathname + window.location.search)}`;
              setTimeout(() => {
                window.location.href = redirectUrl;
              }, 400);
            } else {
              setTimeout(() => {
                isAuthRedirecting = false;
              }, 2000);
            }
          }
        }

        // Attach flag so downstream callers can optionally suppress redundant individual toasts
        error.isHandledAuth = true;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
