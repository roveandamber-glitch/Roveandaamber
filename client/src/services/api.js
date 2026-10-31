import axios from 'axios';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
export const BASE_URL = API_URL.replace('/api', '');

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const isAdminUrl = config.url && (config.url.startsWith('/admin') || config.url.includes('admin'));
    const token = isAdminUrl
      ? (localStorage.getItem('adminToken') || localStorage.getItem('adminKey') || localStorage.getItem('token'))
      : (localStorage.getItem('userToken') || localStorage.getItem('token') || localStorage.getItem('adminToken'));
      
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;
