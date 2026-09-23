// Backend bilan aloqa
import { getInitData } from './telegram';

const BASE = '/api/client';

async function request(path, options = {}) {
  const res = await fetch(BASE + path, {
    ...options,
    headers: {
      'x-init-data': getInitData(),
      ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    let message = 'Xatolik yuz berdi';
    try {
      const data = await res.json();
      message = data.error || message;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }
  return res.json();
}

export const api = {
  auth: (language) => request('/auth', { method: 'POST', body: JSON.stringify({ language }) }),

  catalog: (params = {}) => {
    const q = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== '' && v !== null)
    ).toString();
    return request('/catalog' + (q ? '?' + q : ''));
  },

  product: (id) => request('/products/' + id),
  stories: () => request('/stories'),
  bestsellers: () => request('/bestsellers'),
  settings: () => request('/settings'),

  createOrder: (payload) => request('/orders', { method: 'POST', body: JSON.stringify(payload) }),
  myOrders: () => request('/orders'),

  uploadReceipt: (orderId, file) => {
    const fd = new FormData();
    fd.append('receipt', file);
    return request(`/orders/${orderId}/receipt`, { method: 'POST', body: fd });
  },

  addresses: () => request('/addresses'),
  setLanguage: (language) => request('/language', { method: 'POST', body: JSON.stringify({ language }) }),
};

export default api;
