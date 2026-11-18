import ENV from '../config/env';

const API_BASE_URL = ENV.API_BASE_URL;

let currentAdminToken = null;

export function setAdminAuthToken(token) {
  currentAdminToken = token;
}

export function getAdminAuthToken() {
  return currentAdminToken;
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const authHeaders = currentAdminToken ? { Authorization: `Bearer ${currentAdminToken}` } : {};

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...authHeaders,
        ...(options.headers || {}),
      },
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || data.message || `HTTP ${response.status}`);
    }
    return data;
  } catch (error) {
    console.error(`[Admin API Error] ${endpoint}:`, error.message);
    throw error;
  }
}

export const adminApi = {
  // Orders Operations
  getOrders: (params = {}) => {
    const q = new URLSearchParams();
    if (params.limit) q.append('limit', String(params.limit));
    if (params.offset !== undefined) q.append('offset', String(params.offset));
    if (params.page) q.append('page', String(params.page));
    if (params.status && params.status.toUpperCase() !== 'ALL') q.append('status', params.status);
    if (params.shopkeeperId) q.append('shopkeeperId', String(params.shopkeeperId));
    const qs = q.toString();
    return request('/orders' + (qs ? `?${qs}` : ''));
  },
  updateOrderStatus: (id, status) => request(`/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  updateOrderDetails: (id, payload) => request(`/orders/${id}/status`, { method: 'PUT', body: JSON.stringify(payload) }),

  // Inventory & SKU Catalog Operations
  getProducts: (category = '', search = '') => {
    const params = new URLSearchParams();
    if (category && category.trim().toUpperCase() !== 'ALL') params.append('category', category.trim());
    if (search && search.trim()) params.append('search', search.trim());
    const q = params.toString();
    return request('/products' + (q ? `?${q}` : ''));
  },
  createProduct: (productData) => request('/products', { method: 'POST', body: JSON.stringify(productData) }),
  updateProduct: (id, productData) => request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(productData) }),
  deleteProduct: (id) => request(`/products/${id}`, { method: 'DELETE' }),

  // Taxonomy & Categories Operations
  getCategories: () => request('/categories'),
  createCategory: (data) => request('/categories', { method: 'POST', body: JSON.stringify(data) }),
  updateCategory: (id, data) => request(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCategory: (id) => request(`/categories/${id}`, { method: 'DELETE' }),

  // Hero Media & Banners Operations
  getBanners: () => request('/banners'),
  createBanner: (data) => request('/banners', { method: 'POST', body: JSON.stringify(data) }),
  deleteBanner: (id) => request(`/banners/${id}`, { method: 'DELETE' }),

  // B2B Retail Partners & Accounts Operations
  getBuyers: () => request('/shopkeepers'),
  createShopkeeper: (data) => request('/shopkeepers', { method: 'POST', body: JSON.stringify(data) }),

  // Service Desk & Support Ticket Operations
  getTickets: () => request('/tickets'),
  replyTicket: (id, replyMessage) => request(`/tickets/${id}/reply`, { method: 'POST', body: JSON.stringify({ message: replyMessage }) }),

  // Company Management
  getCompanyDetails: () => request('/company'),
  updateCompanyDetails: (data) => request('/company', { method: 'PUT', body: JSON.stringify(data) }),

  // Admin Notification Device Tokens
  registerDeviceToken: (payload) => request('/admin/device-token', { method: 'POST', body: JSON.stringify(payload) }),
  unregisterDeviceToken: (payload) => request('/admin/device-token', {
    method: 'DELETE',
    body: JSON.stringify(typeof payload === 'string' ? { token: payload } : payload),
  }),

  // Admin Authentication & Access Control
  loginAdmin: (payload) => request('/admin/login', { method: 'POST', body: JSON.stringify(payload) }),
  loginAdminGoogle: (payload) => request('/admin/google', { method: 'POST', body: JSON.stringify(payload) }),
  getAdminUsers: () => request('/admin/users'),
  createAdminUser: (payload) => request('/admin/users', { method: 'POST', body: JSON.stringify(payload) }),
  updateAdminUser: (id, payload) => request(`/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteAdminUser: (id) => request(`/admin/users/${id}`, { method: 'DELETE' }),

  // Delivery Zones & Pincode Management
  getDeliveryZones: () => request('/zones'),
  addOrUpdateZone: (data) => request('/zones', { method: 'POST', body: JSON.stringify(data) }),
  deleteZone: (pincode) => request(`/zones/${pincode}`, { method: 'DELETE' }),
  checkPincodeServiceability: (pincode) => request(`/zones/check?pincode=${pincode}`),
  getPincodeInfo: (pincode) => request(`/zones/pincode/${pincode}`),
};

