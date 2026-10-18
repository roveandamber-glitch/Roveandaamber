import axios from 'axios';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
export const BASE_URL = API_URL.replace('/api', '');

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = 
      localStorage.getItem('adminToken') || 
      localStorage.getItem('userToken') || 
      localStorage.getItem('adminKey') || 
      localStorage.getItem('token');
      
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;
