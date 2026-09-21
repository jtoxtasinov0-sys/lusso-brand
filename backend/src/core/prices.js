/**
 * Mahsulot narxlari — bitta joyda turadi.
 *
 * O'zgartirish uchun quyidagi jadvalni tahrirlang: [nomi, narxi, eski narxi].
 * "eski narx" — mijozga chizilgan holda ko'rsatiladi (chegirmani bildiradi),
 * mijoz to'laydigan narx emas.
 *
 * Bazaga yozish uchun ikki yo'l bor:
 *   1. Botda:  /narxlar ha      (adminlar uchun, kompyuter kerak emas)
 *   2. Kompyuterda: 5-NARXLARNI-YANGILASH.bat  yoki  npm run db:prices
 *
 * Ikkalasi ham faqat narxni o'zgartiradi — hech narsa o'chirilmaydi.
 */
import prisma from '../database/connection.js';

export const PRICE_LIST = [
  ['Smart Glasses (Bluetooth)', 59000, 89000],
  ['Ray-Ban Wayfarer', 69000, 99000],
  ['Ray-Ban Aviator Gold', 75000, 110000],
  ['Ray-Ban Justin Black', 79000, 120000],
  ['Prada Classic Black', 89000, 135000],
  ['Ray-Ban Ferrari Polarized', 95000, 145000],
  ['Maybach Rimless Gold', 109000, 160000],
  ['Cartier Rimless Blue', 119000, 180000],
  ['Now White (Vanil-Mandarin)', 45000, 69000],
  ['Rave Blue', 49000, 75000],
  ['Rave Black', 49000, 75000],
  ['Versace Eros EDT', 95000, 149000],
  ['Molecule 02', 99000, 155000],
  ['YSL Y Eau Fraîche', 109000, 165000],
  ['Stronger With You Freeze', 115000, 175000],
  ['Stronger With You Powerfully', 125000, 195000],
  ['Dior Sauvage EDT', 129000, 199000],
  ['Tom Ford Ombré Leather', 139000, 215000],
  ['Bleu de Chanel EDP', 139000, 210000],
  ['Kilian Apple Brandy', 145000, 235000],
  ['Baccarat Rouge 540 Extrait', 150000, 260000],
  ['Nike Retro Runner Cream', 109000, 155000],
  ['New Balance 530', 115000, 159000],
  ['Air Force 1 White', 125000, 175000],
  ['Adidas Samba OG', 129000, 179000],
  ['Nike SB Dunk Low Gray', 135000, 185000],
  ['Classic Derby charm tufli', 135000, 195000],
  ['Nike Dunk Low Panda', 139000, 189000],
  ['Air Jordan 1 Low Gray', 149000, 199000],
];

/**
 * Narxlarni bazaga yozadi.
 * @param {boolean} dryRun true bo'lsa — hech narsa yozilmaydi, faqat hisoblanadi
 */
export async function applyPrices({ dryRun = false } = {}) {
  const changes = [];
  const missing = [];
  let same = 0;

  for (const [name, price, oldPrice] of PRICE_LIST) {
    const product = await prisma.product.findFirst({ where: { nameUz: name } });

    if (!product) {
      missing.push(name);
      continue;
    }

    if (product.price === price && product.oldPrice === oldPrice) {
      same++;
      continue;
    }

    if (!dryRun) {
      await prisma.product.update({ where: { id: product.id }, data: { price, oldPrice } });
    }

    changes.push({ name, from: product.price, to: price });
  }

  const max = Math.max(...PRICE_LIST.map((p) => p[1]));
  return { changes, missing, same, max, total: PRICE_LIST.length };
}

export default applyPrices;
