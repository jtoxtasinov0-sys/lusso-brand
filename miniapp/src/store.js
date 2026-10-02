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

// Telegram ilovasidan saytga o'tilganda savat havolaning "#cart=..." qismida
// keladi. Brauzerda sahifa ochilganda uni savatga yozib, havolani tozalaymiz.
const CART_HASH = '#cart=';

export function cartLink(items) {
  const slim = items.map(({ productId, variantId, name, variant, price, image, qty }) => ({
    productId,
    variantId,
    name,
    variant,
    price,
    image,
    qty,
  }));
  return (
    window.location.origin + window.location.pathname + CART_HASH + encodeURIComponent(JSON.stringify(slim))
  );
}

export function importCartFromUrl() {
  if (!window.location.hash.startsWith(CART_HASH)) return false;
  let items = [];
  try {
    items = JSON.parse(decodeURIComponent(window.location.hash.slice(CART_HASH.length)));
  } catch {
    /* buzilgan havola */
  }
  history.replaceState(null, '', window.location.pathname + window.location.search);
  if (!Array.isArray(items)) return false;
  const valid = items.filter((i) => i && Number(i.productId) && Number(i.qty) > 0);
  if (!valid.length) return false;
  useCart.setState({ items: valid });
  return true;
}

export { keyOf };

// Sevimlilar (♡) — faqat shu telefonda saqlanadi
export const useFav = create(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) =>
        set({ ids: get().ids.includes(id) ? get().ids.filter((x) => x !== id) : [id, ...get().ids] }),
    }),
    { name: 'lusso-fav' }
  )
);
