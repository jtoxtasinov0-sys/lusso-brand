// Savat va umumiy holat (zustand)
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const keyOf = (item) => `${item.productId}-${item.variantId || 0}`;

export const useCart = create(
  persist(
    (set, get) => ({
      items: [],

      add: (item) => {
        const items = [...get().items];
        const idx = items.findIndex((i) => keyOf(i) === keyOf(item));
        if (idx >= 0) items[idx] = { ...items[idx], qty: items[idx].qty + (item.qty || 1) };
        else items.push({ ...item, qty: item.qty || 1 });
        set({ items });
      },

      inc: (key) =>
        set({
          items: get().items.map((i) => (keyOf(i) === key ? { ...i, qty: i.qty + 1 } : i)),
        }),

      dec: (key) =>
        set({
          items: get()
            .items.map((i) => (keyOf(i) === key ? { ...i, qty: i.qty - 1 } : i))
            .filter((i) => i.qty > 0),
        }),

      remove: (key) => set({ items: get().items.filter((i) => keyOf(i) !== key) }),

      clear: () => set({ items: [] }),

      count: () => get().items.reduce((s, i) => s + i.qty, 0),
      subtotal: () => get().items.reduce((s, i) => s + i.price * i.qty, 0),
    }),
    { name: 'lusso-cart' }
  )
);

export const useApp = create((set) => ({
  lang: localStorage.getItem('lusso-lang') || 'uz',
  setLang: (lang) => {
    localStorage.setItem('lusso-lang', lang);
    set({ lang });
  },

  user: null,
  setUser: (user) => set({ user }),

  settings: null,
  setSettings: (settings) => set({ settings }),
}));

export { keyOf };
