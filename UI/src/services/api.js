import axios from 'axios';
import ENV from '../config/env';

const API_BASE_URL = ENV?.API_BASE_URL;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request Interceptor: Automatically inject Auth token if available
apiClient.interceptors.request.use(
  (config) => {
    // If token exists in memory/store, attach Authorization header automatically
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Return response data directly & format clean errors
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const errorMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Network Error';
    return Promise.reject(new Error(errorMsg));
  }
);

// Clean API Endpoint Methods using single Axios instance
export const api = {
  // Auth APIs (Universal OTP 12345 verified by backend)
  requestOtp: (mobile, name) => apiClient.post('/auth/request-otp', { mobile, name }),
  verifyOtp: (mobile, otp) => apiClient.post('/auth/verify-otp', { mobile, otp }),

  // Categories API
  getCategories: () => apiClient.get('/categories'),

  // Products API
  getProducts: (category = '', search = '') => {
    const params = {};
    if (category && category.trim().toUpperCase() !== 'ALL') {
      params.category = category.trim();
    }
    if (search && search.trim()) {
      params.search = search.trim();
    }
    return apiClient.get('/products', { params });
  },
  getProductsByCategory: (categoryId = '') => {
    const cat = String(categoryId || '').trim();
    if (!cat || cat.toUpperCase() === 'ALL') {
      return apiClient.get('/products');
    }
    return apiClient.get('/products', { params: { category: cat } });
  },
  createProduct: (productData) => apiClient.post('/products', productData),
  updateProduct: (id, productData) => apiClient.put(`/products/${id}`, productData),
  deleteProduct: (id) => apiClient.delete(`/products/${id}`),

  // Banners API
  getBanners: () => apiClient.get('/banners'),

  // Orders Procurement API
  getOrders: () => apiClient.get('/orders'),
  createOrder: (orderData) => apiClient.post('/orders', orderData),
  updateOrderStatus: (id, status) => apiClient.patch(`/orders/${id}/status`, { status }),

  // B2B Net 30 Credit Ledger Invoices API
  getLedgers: () => apiClient.get('/ledgers'),

  // Support Tickets API
  getTickets: () => apiClient.get('/tickets'),
  createTicket: (ticketData) => apiClient.post('/tickets', ticketData),

  // Shopkeeper Buyer Profile API
  getShopkeepers: () => apiClient.get('/shopkeepers'),
  createShopkeeper: (data) => apiClient.post('/shopkeepers', data),

  // Cart API
  getCart: (shopkeeperId) => apiClient.get('/cart', { params: { shopkeeperId } }),
  syncCart: (shopkeeperId, items) => apiClient.post('/cart/sync', { shopkeeperId, items }),
  clearCartBackend: (shopkeeperId) => apiClient.post('/cart/clear', { shopkeeperId }),
};
