const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const res = await fetch(url, config);
    const data = await res.json().catch(() => null);

    if (!res.ok) {
      // Backend error handler returns { success: false, message: '...' } or { errors: [...] }
      let message = 'An unexpected error occurred';
      if (data) {
        if (data.message) {
          message = data.message;
        } else if (data.errors && Array.isArray(data.errors)) {
          message = data.errors.map(e => e.msg || e.message).join(', ');
        }
      }
      const err = new Error(message);
      err.status = res.status;
      err.data = data;
      throw err;
    }

    return data;
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error(`Cannot connect to backend server at ${BASE_URL}. Please ensure the Node server is running on port 3001.`);
    }
    throw err;
  }
}

export const api = {
  // Health
  checkHealth: () => request('/health'),

  // Products
  getProducts: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const qs = query.toString();
    return request(`/products${qs ? `?${qs}` : ''}`);
  },

  getProduct: (id) => request(`/products/${id}`),

  getLowStockProducts: () => request('/products/low-stock'),

  createProduct: (productData) =>
    request('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    }),

  updateProduct: (id, productData) =>
    request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    }),

  deleteProduct: (id) =>
    request(`/products/${id}`, {
      method: 'DELETE',
    }),

  // Categories
  getCategories: () => request('/categories'),

  getCategory: (id) => request(`/categories/${id}`),

  createCategory: (categoryData) =>
    request('/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    }),

  updateCategory: (id, categoryData) =>
    request(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    }),

  deleteCategory: (id) =>
    request(`/categories/${id}`, {
      method: 'DELETE',
    }),

  // Stock
  getInventorySummary: () => request('/stock/summary'),

  getStockMovements: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const qs = query.toString();
    return request(`/stock/movements${qs ? `?${qs}` : ''}`);
  },

  adjustStock: (adjustmentData) =>
    request('/stock/adjust', {
      method: 'POST',
      body: JSON.stringify(adjustmentData),
    }),
};

