import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Inject token into request headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  updatePassword: async (password) => {
    const response = await api.put('/auth/password', { password });
    return response.data;
  },
};

// Admin endpoints
export const adminService = {
  getDashboardStats: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },
  createUser: async (userData) => {
    const response = await api.post('/admin/users', userData);
    return response.data;
  },
  getUsers: async (params) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },
  getStores: async (params) => {
    const response = await api.get('/admin/stores', { params });
    return response.data;
  },
  getUserDetails: async (id) => {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  },
};

// Stores and Ratings endpoints
export const storeService = {
  getStoresForUser: async (params) => {
    const response = await api.get('/stores/list', { params });
    return response.data;
  },
  submitRating: async (storeId, rating) => {
    const response = await api.post('/stores/rate', { storeId, rating });
    return response.data;
  },
  getStoreDashboard: async () => {
    const response = await api.get('/stores/dashboard');
    return response.data;
  },
};

export default api;
