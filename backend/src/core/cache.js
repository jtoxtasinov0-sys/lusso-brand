/**
 * Mijozlar uchun oddiy xotira keshi.
 *
 * Katalog, storylar va sozlamalar kamdan-kam o'zgaradi, lekin ilova har
 * ochilganda ularni so'raydi. Bir necha soniyalik kesh bazaga boradigan
 * so'rovlarni keskin kamaytiradi va ilova tezroq ochiladi.
 *
 * Admin panelda biror narsa o'zgartirilsa — kesh darhol tozalanadi,
 * ya'ni mijoz eski ma'lumotni ko'rmaydi.
 */
const TTL_MS = 60 * 1000;

const store = new Map(); // key -> { value, expiresAt }

export async function cached(key, loader) {
  const now = Date.now();
  const hit = store.get(key);
  if (hit && hit.expiresAt > now) return hit.value;

  const value = await loader();
  store.set(key, { value, expiresAt: now + TTL_MS });
  return value;
}

// Admin biror narsani o'zgartirsa chaqiriladi
export function clearCache() {
  store.clear();
}

export default { cached, clearCache };
