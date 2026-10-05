/**
 * QUYMA ATIRLAR — asl flakondan 10 ml / 20 ml idishga quyib beriladigan atirlar.
 *
 * Server ishga tushganda kategoriya bazada bo'lmasa — o'zi yaratiladi va
 * quyidagi ro'yxatdagi mahsulotlar bir marta qo'shiladi. Keyin atirlarni
 * qo'shish / o'chirish admin paneldan qilinadi (bu fayl ularni qayta tiklamaydi).
 */
import prisma from '../database/connection.js';

export const DECANT_SLUG = 'quyma';

const img = (name) => `/uploads/quyma/${name}.jpg`;

// 10 ml — asosiy narx, 20 ml — ustiga qo'shiladigan farq
const PRICE_10 = 12000;
const PRICE_20 = 22000;
const STOCK = 50;

const CATEGORY = {
  slug: DECANT_SLUG,
  nameUz: 'Gramli Atirlar',
  nameRu: 'Разливные духи',
  emoji: '🧪',
  sortOrder: 4,
  imageUrl: img('idish-10ml'),
  gallery: [
    img('idish-purkash'),
    img('idish-olcham-10ml'),
    img('idish-20ml'),
    img('idish-ishlatish'),
    img('idish-ichi'),
  ],
  noteUz: "Asl atirdan qora metall idishga quyib beriladi\n10 ml — 12 000 ₩  ·  20 ml — 22 000 ₩",
  noteRu: 'Разливаем из оригинального флакона в чёрный металлический атомайзер\n10 мл — 12 000 ₩  ·  20 мл — 22 000 ₩',
};

// [nomi, brend, rasm, hid (uz), hid (ru)]
const DECANTS = [
  ['Bvlgari Le Gemme Tygar', 'Bvlgari', 'bvlgari-le-gemme-tygar', "Sitrusli, yog'ochli — greypfrut va ambra", 'Цитрусово-древесный — грейпфрут и амбра'],
  ['Tom Ford Oud Wood', 'Tom Ford', 'tom-ford-oud-wood', "Ud, sandal daraxti, ziravorlar", 'Уд, сандал, специи'],
  ['Le Labo Bergamote 22', 'Le Labo', 'le-labo-bergamote-22', "Bergamot, greypfrut — yengil va toza", 'Бергамот, грейпфрут — лёгкий и чистый'],
  ['Jean Paul Gaultier Ultra Male', 'Jean Paul Gaultier', 'jpg-ultra-male', 'Shirin — nok, vanil, lavanda', 'Сладкий — груша, ваниль, лаванда'],
  ['Dior Homme Intense', 'Dior', 'dior-homme-intense', "Irisli, pudrali — kechki hid", 'Ирисовый, пудровый — вечерний'],
  ['Lacoste L.12.12 Noir', 'Lacoste', 'lacoste-l1212-noir', 'Tarvuz, lavanda, qora shokolad', 'Арбуз, лаванда, тёмный шоколад'],
  ['Xerjoff Blue Hope', 'Xerjoff', 'xerjoff-blue-hope', "Mevali, shirin, yog'ochli", 'Фруктовый, сладкий, древесный'],
  ['Jean Paul Gaultier Le Beau Le Parfum', 'Jean Paul Gaultier', 'jpg-le-beau-le-parfum', 'Ananas, kokos, tonka', 'Ананас, кокос, тонка'],
  ['Versace Eros Parfum', 'Versace', 'versace-eros-parfum', "Yalpiz, vanil, yog'ochli", 'Мята, ваниль, древесный'],
  ['Emporio Armani Stronger With You Oud', 'Emporio Armani', 'armani-swy-oud', "Ud, kashtan, vanil", 'Уд, каштан, ваниль'],
  ['Versace Eau Fraîche Extrême', 'Versace', 'versace-eau-fraiche-extreme', 'Dengiz, sitrus — yozgi toza hid', 'Морской, цитрусовый — летний'],
  ['Chanel Allure Homme Sport Eau Extrême', 'Chanel', 'chanel-allure-sport-eau-extreme', "Yalpiz, sitrus, mushk", 'Мята, цитрус, мускус'],
  ['Dior Sauvage Elixir', 'Dior', 'dior-sauvage-elixir', 'Ziravorli — dolchin, lavanda, qizilmiya', 'Пряный — корица, лаванда, лакрица'],
  ['Lattafa Hayaati Florence', 'Lattafa', 'lattafa-hayaati-florence', 'Gulli-mevali, nozik (ayollar uchun)', 'Цветочно-фруктовый, нежный (для женщин)'],
  ['Tom Ford Ombré Leather Parfum', 'Tom Ford', 'tom-ford-ombre-leather-parfum', 'Teri, kardamon, yasmin', 'Кожа, кардамон, жасмин'],
  ["YSL Libre L'Absolu Platine", 'Yves Saint Laurent', 'ysl-libre-absolu-platine', 'Lavanda, apelsin guli (ayollar uchun)', 'Лаванда, флёрдоранж (для женщин)'],
  ['Emporio Armani Stronger With You Intensely', 'Emporio Armani', 'armani-swy-intensely', 'Shirin — vanil, karamel, dolchin', 'Сладкий — ваниль, карамель, корица'],
  ['Tom Ford Tobacco Vanille', 'Tom Ford', 'tom-ford-tobacco-vanille', "Tamaki, vanil, quritilgan mevalar", 'Табак, ваниль, сухофрукты'],
  ['YSL Y Eau Fraîche', 'Yves Saint Laurent', 'ysl-y-eau-fraiche', 'Yangi, sitrusli — kundalik', 'Свежий, цитрусовый — на каждый день'],
  ['Emporio Armani Stronger With You Powerfully', 'Emporio Armani', 'armani-swy-powerfully', 'Vanil, olcha, ziravorlar', 'Ваниль, вишня, специи'],
  ['Ex Nihilo Fleur Narcotique', 'Ex Nihilo', 'ex-nihilo-fleur-narcotique', 'Lichi, bergamot, pion', 'Личи, бергамот, пион'],
];

export async function ensureDecants() {
  try {
    if (await prisma.category.findUnique({ where: { slug: DECANT_SLUG } })) return;

    const category = await prisma.category.create({ data: CATEGORY });

    for (const [i, [name, brand, image, smellUz, smellRu]] of DECANTS.entries()) {
      await prisma.product.create({
        data: {
          nameUz: name,
          nameRu: name,
          brand,
          descUz: `Asl atirdan quyiladi · 10 ml / 20 ml\n${smellUz}`,
          descRu: `Разлив из оригинала · 10 мл / 20 мл\n${smellRu}`,
          price: PRICE_10,
          categoryId: category.id,
          sortOrder: i,
          images: { create: [{ url: img(image), sortOrder: 0 }] },
          variants: {
            create: [
              { label: '10 ml', stock: STOCK, extraPrice: 0, sortOrder: 0 },
              { label: '20 ml', stock: STOCK, extraPrice: PRICE_20 - PRICE_10, sortOrder: 1 },
            ],
          },
        },
      });
    }
    console.log(`💧 "Quyma atirlar" kategoriyasi yaratildi (${DECANTS.length} ta atir)`);
  } catch (err) {
    console.error('⚠️  Quyma atirlarni qo\'shib bo\'lmadi:', err.message);
  }
}
