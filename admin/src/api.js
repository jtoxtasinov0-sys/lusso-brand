// Admin panel — backend bilan aloqa
// Manzil: odatda shu domenning o'zi (/api/... Vercel orqali backendga o'tadi).
// Kerak bo'lsa .env da VITE_API_URL orqali to'g'ridan-to'g'ri backend ko'rsatiladi.
const ORIGIN = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const BASE = ORIGIN + '/api/admin';

// Render bepul tarifda uxlab qoladi va birinchi so'rov ~50 soniya ketadi
const TIMEOUT_MS = 70000;

export function getToken() {
  return localStorage.getItem('lusso-admin-token') || '';
}

export function setToken(token) {
  if (token) localStorage.setItem('lusso-admin-token', token);
  else localStorage.removeItem('lusso-admin-token');
}

export class ApiError extends Error {
  constructor(message, { status = 0, code = '' } = {}) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

async function request(path, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let res;
  try {
    res = await fetch(BASE + path, {
      ...options,
      signal: controller.signal,
      headers: {
        Authorization: 'Bearer ' + getToken(),
        ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
        ...(options.headers || {}),
      },
    });
  } catch (err) {
    throw new ApiError(
      err.name === 'AbortError'
        ? 'Server javob bermadi. Biroz kutib, qaytadan urining.'
        : "Serverga ulanib bo'lmadi. Internetni tekshiring.",
      { code: 'NETWORK' }
    );
  } finally {
    clearTimeout(timer);
  }

  // Sessiya tugagan bo'lsa — qaytadan kirish. Lekin login so'rovining o'zi
  // 401 qaytarsa (parol noto'g'ri) sahifani yangilamaymiz, xatoni ko'rsatamiz.
  if (res.status === 401 && path !== '/login' && getToken()) {
    setToken('');
    window.location.reload();
    throw new ApiError('Sessiya tugadi', { status: 401 });
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    /* javob JSON emas */
  }

  if (!res.ok) {
    // Render bepul tarifda uxlab qoladi va shu paytda 502/503/504 qaytadi
    const waking = res.status === 502 || res.status === 503 || res.status === 504;
    throw new ApiError(
      waking
        ? "Server uyqudan uyg'onmoqda. Bir daqiqadan keyin qaytadan urining."
        : data?.error || `Xatolik (${res.status})`,
      { status: res.status, code: data?.code || (waking ? 'WAKING' : '') }
    );
  }
  return data;
}

export const api = {
  health: () => request('/health'),

  login: (password) => request('/login', { method: 'POST', body: JSON.stringify({ password }) }),

  // Panel bot ichida ochilganda: parol o'rniga Telegram imzosi yuboriladi
  loginWithTelegram: (initData) =>
    request('/login', { method: 'POST', body: JSON.stringify({ initData }) }),

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
