import axios from 'axios';
import ENV from '../config/env';
import { useAuthStore } from '../store/authStore';

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
    try {
      const session = useAuthStore.getState().session;
      if (session?.token) {
        config.headers.Authorization = `Bearer ${session.token}`;
      }
    } catch (err) {
      console.warn('[API] Could not attach auth token:', err.message);
    }
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
  // Auth APIs (Exclusively Google Sign-In)
  googleLogin: (payload) => apiClient.post('/auth/google', payload),
  updateProfile: (profileData) => apiClient.put('/auth/profile', profileData),
  uploadImage: (image, folder = 'profiles') => apiClient.post('/upload', { image, folder }),
  directLogin: (payload) => apiClient.post('/auth/direct-login', payload),
  requestOtp: (mobile, name) => apiClient.post('/auth/request-otp', { mobile, name }),
  verifyOtp: (mobile, otp, shopName) => apiClient.post('/auth/verify-otp', { mobile, otp, shopName }),

  // Categories API
  getCategories: () => apiClient.get('/categories'),

  // Products API
  getProducts: (category = '', search = '', page = 1, limit = 50) => {
    const params = { page, limit };
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
  getOrders: (shopkeeperId) => {
    const params = shopkeeperId ? { shopkeeperId } : {};
    return apiClient.get('/orders', { params });
  },
  createOrder: (orderData) => apiClient.post('/orders', orderData),
  cancelOrder: (id, reason = '') => apiClient.post(`/orders/${id}/cancel`, { reason }),
  updateOrderStatus: (id, status) => apiClient.patch(`/orders/${id}/status`, { status }),
  getOrderInvoiceUrl: (id) => `${API_BASE_URL}/orders/${id}/invoice`,

  // B2B Net 30 Credit Ledger Invoices API
  getLedgers: () => apiClient.get('/ledgers'),

  // Address APIs
  getAddresses: (shopkeeperId) => apiClient.get('/addresses', { params: { shopkeeperId } }).then(res => res.data || res),
  addAddress: (addressData) => apiClient.post('/addresses', addressData),
  updateAddress: (id, addressData) => apiClient.put(`/addresses/${id}`, addressData),
  deleteAddress: (id) => apiClient.delete(`/addresses/${id}`),

  // Shopkeeper Buyer Profile API
  getShopkeepers: () => apiClient.get('/shopkeepers'),
  createShopkeeper: (data) => apiClient.post('/shopkeepers', data),

  // Cart API
  getCart: (shopkeeperId) => apiClient.get('/cart', { params: { shopkeeperId } }),
  syncCart: (shopkeeperId, items) => apiClient.post('/cart/sync', { shopkeeperId, items }),
  clearCartBackend: (shopkeeperId) => apiClient.post('/cart/clear', { shopkeeperId }),

  // Support Tickets API
  createTicket: (data) => apiClient.post('/tickets', data),
  getTickets: () => apiClient.get('/tickets'),

  // Company API
  getCompanyDetails: () => apiClient.get('/company'),

  // Delivery Zones & Location Serviceability API
  checkServiceability: (pincode) => apiClient.get('/zones/check', { params: { pincode } }),
  getPincodeDetails: (pincode) => apiClient.get(`/zones/pincode/${pincode}`),
  reverseGeocode: (lat, lng) => apiClient.get('/zones/reverse-geocode', { params: { lat, lng } }),
  getAllZones: () => apiClient.get('/zones'),
};
