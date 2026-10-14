const API_BASE_URL = 'https://rs-gamma-olive.vercel.app/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
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
  getOrders: () => request('/orders'),
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
};
