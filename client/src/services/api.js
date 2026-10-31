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
    const isAdminUrl = config.url && (config.url.startsWith('/admin') || config.url.includes('admin'));
    const token = isAdminUrl
      ? (localStorage.getItem('adminToken') || localStorage.getItem('adminKey') || localStorage.getItem('token'))
      : (localStorage.getItem('userToken') || localStorage.getItem('token') || localStorage.getItem('adminToken'));
      
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      const guestId = getGuestSessionId();
      if (guestId) {
        config.headers['x-guest-id'] = guestId;
      }
    }
  }
  return config;
});

export default api;
