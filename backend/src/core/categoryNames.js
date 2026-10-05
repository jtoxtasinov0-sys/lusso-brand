/**
 * Kategoriya nomlarini yangilash (bir martalik).
 *
 * Faqat nomi hali eski bo'lgan kategoriya o'zgaradi — admin paneldan
 * keyin qo'yilgan nom/emoji server qayta ishga tushganda bosilib ketmaydi.
 */
import prisma from '../database/connection.js';

const RENAMES = [
  { slug: 'shoes', from: 'Oyoq kiyim', nameUz: 'Krasofkalar', nameRu: 'Кроссовки', emoji: '👟' },
  { slug: 'glasses', from: "Ko'zoynak", nameUz: 'Ochkilar', emoji: '😎' },
  { slug: 'perfume', from: 'Atirlar', nameUz: 'Atirlar', emoji: '🧴' },
  { slug: 'quyma', from: 'Quyma atirlar', nameUz: 'Gramli Atirlar', emoji: '🧪' },
];

export async function renameCategories() {
  try {
    for (const { slug, from, ...data } of RENAMES) {
      await prisma.category.updateMany({ where: { slug, nameUz: from }, data });
    }
  } catch (err) {
    console.error("⚠️  Kategoriya nomlarini yangilab bo'lmadi:", err.message);
  }
}
