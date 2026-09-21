/**
 * NARXLARNI YANGILASH
 *
 *   npm run db:prices
 *
 * Mahsulotlarning faqat narxini o'zgartiradi. Hech narsa o'chirilmaydi:
 * rasmlar, o'lchamlar, buyurtmalar va admin paneldan qo'shgan mahsulotlaringiz
 * joyida qoladi. (Farqi shunda: `npm run db:seed` hamma mahsulotni o'chirib
 * qaytadan yozadi, bu skript esa yo'q.)
 *
 * Narxni o'zgartirmoqchi bo'lsangiz — quyidagi jadvalni tahrirlang:
 *   [nomi, narxi, eski narxi]
 * "eski narx" — mijozga chizilgan holda ko'rsatiladigan narx (chegirma uchun).
 */
import prisma from '../src/database/connection.js';

const PRICES = [
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

const money = (n) => '\u20a9' + n.toLocaleString('ko-KR');

async function main() {
  console.log("\ud83d\udcb0 Narxlar yangilanmoqda...\n");

  let changed = 0;
  let same = 0;
  const missing = [];

  for (const [name, price, oldPrice] of PRICES) {
    const product = await prisma.product.findFirst({ where: { nameUz: name } });

    if (!product) {
      missing.push(name);
      continue;
    }

    if (product.price === price && product.oldPrice === oldPrice) {
      same++;
      continue;
    }

    await prisma.product.update({
      where: { id: product.id },
      data: { price, oldPrice },
    });

    console.log(`   ${money(product.price)} \u2192 ${money(price)}   ${name}`);
    changed++;
  }

  console.log('');
  console.log(`   \u2705 ${changed} ta narx yangilandi`);
  if (same) console.log(`   \u2022  ${same} tasi allaqachon to'g'ri edi`);

  if (missing.length) {
    console.log('');
    console.log("   \u26a0\ufe0f  Bazada topilmadi (nomi o'zgartirilgan bo'lishi mumkin):");
    for (const m of missing) console.log('      - ' + m);
    console.log("      Ularning narxini admin paneldan qo'lda qo'ying.");
  }

  const max = await prisma.product.aggregate({ _max: { price: true } });
  console.log('');
  console.log(`   Eng qimmat mahsulot: ${money(max._max.price || 0)}`);
  console.log('\n\ud83c\udf89 Tayyor. Ilovani qaytadan oching \u2014 yangi narxlar ko\'rinadi.');
}

main()
  .catch((e) => {
    console.error("\u274c Xatolik:", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
