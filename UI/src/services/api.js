import axios from 'axios';
import ENV from '../config/env';

class ApiService {
  constructor() {
    this.api = axios.create({
      baseURL: ENV.API_BASE_URL,
      timeout: ENV.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => response.data,
      (error) => {
        if (error.response?.status === 401) {
          console.error('Unauthorized access');
        }
        return Promise.reject(error.response?.data || error.message);
      }
    );
  }

  // Auth
  requestToken(mobile, role) {
    return this.api.post('/auth/request-token', { mobile, role });
  }

  verifyToken(mobile, otp) {
    return this.api.post('/auth/verify', { mobile, otp });
  }

  // Products
  getProducts() {
    return this.api.get('/products');
  }

  getProductById(id) {
    return this.api.get(`/products/${id}`);
  }

  createProduct(data) {
    return this.api.post('/products', data);
  }

  updateProduct(id, data) {
    return this.api.put(`/products/${id}`, data);
  }

  deleteProduct(id) {
    return this.api.delete(`/products/${id}`);
  }

  // Orders
  getOrders() {
    return this.api.get('/orders');
  }

  getPendingOrders() {
    return this.api.get('/orders/pending');
  }

  createOrder(data) {
    return this.api.post('/orders', data);
  }

  updateOrderStatus(id, status) {
    return this.api.put(`/orders/${id}`, { status });
  }

  // Shopkeepers
  getShopkeepers() {
    return this.api.get('/shopkeepers');
  }

  getShopkeeperById(id) {
    return this.api.get(`/shopkeepers/${id}`);
  }

  createShopkeeper(data) {
    return this.api.post('/shopkeepers', data);
  }

  updateShopkeeper(id, data) {
    return this.api.put(`/shopkeepers/${id}`, data);
  }
}

export default new ApiService();
