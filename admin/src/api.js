// Admin panel — backend bilan aloqa
const BASE = '/api/admin';

export function getToken() {
  return localStorage.getItem('lusso-admin-token') || '';
}

export function setToken(token) {
  if (token) localStorage.setItem('lusso-admin-token', token);
  else localStorage.removeItem('lusso-admin-token');
}

async function request(path, options = {}) {
  const res = await fetch(BASE + path, {
    ...options,
    headers: {
      Authorization: 'Bearer ' + getToken(),
      ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...(options.headers || {}),
    },
  });

  if (res.status === 401) {
    setToken('');
    window.location.reload();
    throw new Error('Sessiya tugadi');
  }

  if (!res.ok) {
    let message = 'Xatolik';
    try {
      message = (await res.json()).error || message;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }
  return res.json();
}

export const api = {
  login: (password) => request('/login', { method: 'POST', body: JSON.stringify({ password }) }),

  stats: () => request('/stats'),

  orders: (status) => request('/orders' + (status && status !== 'all' ? `?status=${status}` : '')),
  updateOrder: (id, data) => request(`/orders/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  products: () => request('/products'),
  createProduct: (data) => request('/products', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id, data) => request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProduct: (id) => request(`/products/${id}`, { method: 'DELETE' }),

  categories: () => request('/categories'),
  createCategory: (data) => request('/categories', { method: 'POST', body: JSON.stringify(data) }),
  deleteCategory: (id) => request(`/categories/${id}`, { method: 'DELETE' }),

  stories: () => request('/stories'),
  createStory: (data) => request('/stories', { method: 'POST', body: JSON.stringify(data) }),
  deleteStory: (id) => request(`/stories/${id}`, { method: 'DELETE' }),

  users: (search) => request('/users' + (search ? `?search=${encodeURIComponent(search)}` : '')),

  broadcast: (data) => request('/broadcast', { method: 'POST', body: JSON.stringify(data) }),
  broadcastHistory: () => request('/broadcast'),

  settings: () => request('/settings'),
  updateSettings: (data) => request('/settings', { method: 'PUT', body: JSON.stringify(data) }),

  upload: (file) => {
    const fd = new FormData();
    fd.append('image', file);
    return request('/upload', { method: 'POST', body: fd });
  },
};

export default api;
