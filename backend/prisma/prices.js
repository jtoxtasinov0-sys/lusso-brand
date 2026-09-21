/**
 * NARXLARNI YANGILASH (kompyuterdan)
 *
 *   npm run db:prices
 *   yoki 5-NARXLARNI-YANGILASH.bat faylini ikki marta bosing
 *
 * Narxlar ro'yxati: backend/src/core/prices.js
 * Faqat narx o'zgaradi — mahsulot, rasm, o'lcham va buyurtmalar joyida qoladi.
 */
import prisma from '../src/database/connection.js';
import { applyPrices } from '../src/core/prices.js';
import { clearCache } from '../src/core/cache.js';

const money = (n) => '\u20a9' + Number(n || 0).toLocaleString('ko-KR');

async function main() {
  console.log("\n\ud83d\udcb0 Narxlar yangilanmoqda...\n");

  const { changes, missing, same, max, total } = await applyPrices();
  clearCache();

  for (const c of changes) {
    console.log(`   ${money(c.from)} \u2192 ${money(c.to)}   ${c.name}`);
  }

  console.log('');
  console.log(`   \u2705 ${changes.length} ta narx yangilandi (jami ${total} ta)`);
  if (same) console.log(`   \u2022  ${same} tasi allaqachon to'g'ri edi`);

  if (missing.length) {
    console.log("\n   \u26a0\ufe0f  Bazada topilmadi \u2014 nomi o'zgartirilgan bo'lishi mumkin:");
    for (const m of missing) console.log('      - ' + m);
    console.log("      Ularni admin paneldan qo'lda to'g'rilang.");
  }

  console.log(`\n   Eng qimmat narx: ${money(max)}`);
  console.log("\n\ud83c\udf89 Tayyor. Ilovani qaytadan oching.\n");
}

main()
  .catch((e) => {
    console.error("\u274c Xatolik:", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
