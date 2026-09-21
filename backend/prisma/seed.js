// LUSSO BRAND KR — bazani mahsulotlar bilan to'ldirish: npm run db:seed
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Sizning o'z rasmlaringiz (backend/uploads papkasida)
const up = (name) => '/uploads/' + name;
// Qo'shimcha mahsulotlar uchun professional suratlar
const st = (id) => 'https://images.unsplash.com/' + id + '?auto=format&fit=crop&w=900&q=80';

const SHOE_SIZES = ['240', '245', '250', '255', '260', '265', '270', '275', '280', '285'];

const categories = [
  { slug: 'shoes', nameUz: 'Oyoq kiyim', nameRu: 'Обувь', emoji: '👟', sortOrder: 1 },
  { slug: 'glasses', nameUz: "Ko'zoynak", nameRu: 'Очки', emoji: '🕶', sortOrder: 2 },
  { slug: 'perfume', nameUz: 'Atirlar', nameRu: 'Парфюм', emoji: '🧴', sortOrder: 3 },
];

const products = [
  // ==================== KO'ZOYNAKLAR (sizning rasmlaringiz) ====================
  {
    cat: 'glasses', brand: 'Prada', nameUz: 'Prada Classic Black', nameRu: 'Prada Classic Black',
    descUz: "Klassik to'rtburchak shakl\nQalin atsetat ramka\nUV400 himoya\nOriginal quti va g'ilof bilan",
    descRu: 'Классическая прямоугольная форма\nПлотная ацетатная оправа\nЗащита UV400\nОригинальная коробка и чехол',
    price: 89000, oldPrice: 135000, isNew: true,
    images: [up('01-prada-black.jpg')],
    sizes: ['Qora'],
  },
  {
    cat: 'glasses', brand: 'Ray-Ban', nameUz: 'Ray-Ban Ferrari Polarized', nameRu: 'Ray-Ban Ferrari Polarized',
    descUz: "Ingichka sport ramka\nPolarizatsiyalangan linza\nFerrari kolleksiyasi\nQora-qizil dizayn\nOriginal quti va g'ilof",
    descRu: 'Тонкая спортивная оправа\nПоляризованные линзы\nКоллекция Ferrari\nЧёрно-красный дизайн\nОригинальная коробка и чехол',
    price: 95000, oldPrice: 145000, isNew: true,
    images: [up('02-rayban-ferrari.jpg')],
    sizes: ['Qora-Qizil'],
  },
  {
    cat: 'glasses', brand: 'Ray-Ban', nameUz: 'Ray-Ban Justin Black', nameRu: 'Ray-Ban Justin Black',
    descUz: "Mat qora ramka\nPolarizatsiyalangan linza\nKeng va universal shakl\nHaydash uchun ideal\nOriginal quti va g'ilof",
    descRu: 'Матовая чёрная оправа\nПоляризованные линзы\nШирокая универсальная форма\nИдеально для вождения\nОригинальная коробка и чехол',
    price: 79000, oldPrice: 120000,
    images: [up('03-rayban-justin.jpg')],
    sizes: ['Mat qora', 'Yaltiroq qora'],
  },
  {
    cat: 'glasses', brand: 'Smart', nameUz: "Smart Glasses (Bluetooth)", nameRu: 'Smart Glasses (Bluetooth)',
    descUz: "Koreyada eng ko'p so'ralayotgan model\nBluetooth 5.0 — qo'ng'iroq va musiqa\nO'rnatilgan mikrofon\n6 soat ishlash vaqti\nUV himoya linzalari",
    descRu: 'Самая востребованная модель в Корее\nBluetooth 5.0 — звонки и музыка\nВстроенный микрофон\n6 часов работы\nЛинзы с UV защитой',
    price: 59000, oldPrice: 89000, isNew: true,
    images: [up('04-smart-glasses.jpg')],
    sizes: ['Qora', 'Shaffof'],
  },
  {
    cat: 'glasses', brand: 'Maybach', nameUz: 'Maybach Rimless Gold', nameRu: 'Maybach Rimless Gold',
    descUz: "Ramkasiz (rimless) lyuks dizayn\nOltin rangli metall dastalar\nYashil gradient linza\nMaybach yozuvlari\nPremium quti bilan",
    descRu: 'Безободковый люкс дизайн\nЗолотистые металлические дужки\nЗелёные градиентные линзы\nГравировка Maybach\nПремиум коробка',
    price: 109000, oldPrice: 160000, isNew: true,
    images: [up('05-maybach-tomford.jpg')],
    sizes: ['Oltin-Yashil'],
  },
  {
    cat: 'glasses', brand: 'Cartier', nameUz: 'Cartier Rimless Blue', nameRu: 'Cartier Rimless Blue',
    descUz: "Ramkasiz kvadrat shakl\nKo'k gradient linza\nOltin rangli metall detallar\nLyuks segment\nOriginal quti bilan",
    descRu: 'Безободковая квадратная форма\nСиние градиентные линзы\nЗолотистые металлические детали\nЛюкс сегмент\nОригинальная коробка',
    price: 119000, oldPrice: 180000,
    images: [up('19-cartier-rimless.jpg')],
    sizes: ["Ko'k gradient", 'Qora gradient'],
  },

  // ==================== ATIRLAR (sizning rasmlaringiz) ====================
  {
    cat: 'perfume', brand: 'Tom Ford', nameUz: 'Tom Ford Ombré Leather', nameRu: 'Tom Ford Ombré Leather',
    descUz: "Charm, kardamon, jasmin\nJuda kuchli va uzoq — 10+ soat\nKuz-qish uchun ideal\nPremium quti bilan\nOriginal, Koreyadan",
    descRu: 'Кожа, кардамон, жасмин\nОчень стойкий — 10+ часов\nИдеален для осени и зимы\nПремиум коробка\nОригинал, из Кореи',
    price: 139000, oldPrice: 215000, isNew: true,
    images: [up('05-maybach-tomford.jpg')],
    sizes: ['50ml', '100ml'], extra: [0, 65000],
  },
  {
    cat: 'perfume', brand: 'Emporio Armani', nameUz: 'Stronger With You Freeze', nameRu: 'Stronger With You Freeze',
    descUz: "Karamel, olcha, vanil\nShirin va issiq hid\nYoshlar orasida eng mashhuri\nKunduzgi va kechki\n100ml original",
    descRu: 'Карамель, вишня, ваниль\nСладкий и тёплый аромат\nСамый популярный у молодёжи\nДень и вечер\n100 мл оригинал',
    price: 115000, oldPrice: 175000, isNew: true,
    images: [up('06-armani-freeze.jpg')],
    sizes: ['50ml', '100ml'], extra: [0, 40000],
  },
  {
    cat: 'perfume', brand: 'Emporio Armani', nameUz: 'Stronger With You Powerfully', nameRu: 'Stronger With You Powerfully',
    descUz: "Qizil meva, rom, tonka\nSalqin, kechgi uchrashuvlar uchun\nJuda uzoq turadi\nEng yangi versiya\n100ml original",
    descRu: 'Красные фрукты, ром, тонка\nДля прохладных вечерних встреч\nОчень стойкий\nСамая новая версия\n100 мл оригинал',
    price: 125000, oldPrice: 195000, isNew: true,
    images: [up('08-armani-powerfully.jpg'), up('07-armani-powerfully-box.jpg')],
    sizes: ['50ml', '100ml'], extra: [0, 45000],
  },
  {
    cat: 'perfume', brand: 'Kilian', nameUz: 'Kilian Apple Brandy', nameRu: 'Kilian Apple Brandy',
    descUz: "Olma brendi, dolchin, taxta\nNiche (lyuks) segment\nKristall shisha dizayn\nBir purkashda kun bo'yi\nOriginal quti bilan",
    descRu: 'Яблочный бренди, корица, дерево\nNiche (люкс) сегмент\nХрустальный дизайн флакона\nОдного пшика хватает на день\nОригинальная коробка',
    price: 145000, oldPrice: 235000,
    images: [up('09-kilian-apple-brandy.jpg')],
    sizes: ['50ml'],
  },
  {
    cat: 'perfume', brand: 'Maison Francis Kurkdjian', nameUz: 'Baccarat Rouge 540 Extrait', nameRu: 'Baccarat Rouge 540 Extrait',
    descUz: "Dunyodagi eng taniqli atir\nZafaron, amber, sadr daraxti\nExtrait de parfum — eng kuchli versiya\nUniseks\nOriginal, quti bilan",
    descRu: 'Самый известный аромат в мире\nШафран, амбра, кедр\nExtrait de parfum — самая стойкая версия\nУнисекс\nОригинал, с коробкой',
    price: 150000, oldPrice: 260000, isNew: true,
    images: [up('10-baccarat-540.jpg')],
    sizes: ['35ml', '70ml'], extra: [0, 150000],
  },
  {
    cat: 'perfume', brand: 'Escentric Molecules', nameUz: 'Molecule 02', nameRu: 'Molecule 02',
    descUz: "Ambroxan — teri bilan qo'shilib o'z hidini beradi\nHar kimda boshqacha hid qoldiradi\nUniseks\nOfis va kundalik uchun\n100ml",
    descRu: 'Амброксан — раскрывается по-своему на каждой коже\nУникальный аромат для каждого\nУнисекс\nДля офиса и каждый день\n100 мл',
    price: 99000, oldPrice: 155000,
    images: [up('12-molecule-02.jpg')],
    sizes: ['100ml'],
  },
  {
    cat: 'perfume', brand: 'Yves Saint Laurent', nameUz: 'YSL Y Eau Fraîche', nameRu: 'YSL Y Eau Fraîche',
    descUz: "Bergamot, olma, sadr\nSalqin va toza hid\nYoz uchun ideal\nOfisga mos\n100ml original",
    descRu: 'Бергамот, яблоко, кедр\nСвежий и чистый аромат\nИдеален для лета\nПодходит для офиса\n100 мл оригинал',
    price: 109000, oldPrice: 165000,
    images: [up('14-ysl-y.jpg'), up('13-ysl-y-box.jpg')],
    sizes: ['60ml', '100ml'], extra: [0, 40000],
  },
  {
    cat: 'perfume', brand: 'Rave', nameUz: 'Rave Blue', nameRu: 'Rave Blue',
    descUz: "Salqin, dengiz hidi\nArzon narxda kuchli shlayf\nKundalik kiyish uchun\nChiroyli sovg'abop quti\n100ml",
    descRu: 'Свежий, морской аромат\nМощный шлейф по доступной цене\nНа каждый день\nКрасивая подарочная упаковка\n100 мл',
    price: 49000, oldPrice: 75000,
    images: [up('20-rave-blue.jpg')],
    sizes: ['100ml'],
  },
  {
    cat: 'perfume', brand: 'Rave', nameUz: 'Rave Black', nameRu: 'Rave Black',
    descUz: "Sharqona, shirin-achchiq hid\nKechki uchrashuvlar uchun\nUzoq turadi\nSovg'abop quti\n100ml",
    descRu: 'Восточный, сладко-пряный аромат\nДля вечерних встреч\nСтойкий\nПодарочная упаковка\n100 мл',
    price: 49000, oldPrice: 75000,
    images: [up('21-rave-black.jpg')],
    sizes: ['100ml'],
  },
  {
    cat: 'perfume', brand: 'Now', nameUz: 'Now White (Vanil-Mandarin)', nameRu: 'Now White (Ваниль-Мандарин)',
    descUz: "Vanil va mandarin\nYengil, yoqimli va shirin\nUniseks — yigit ham, qiz ham\nSovg'a uchun ajoyib\n100ml",
    descRu: 'Ваниль и мандарин\nЛёгкий, приятный и сладкий\nУнисекс — и для него, и для неё\nОтличный подарок\n100 мл',
    price: 45000, oldPrice: 69000,
    images: [up('22-now-white.jpg')],
    sizes: ['100ml'],
  },

  // ==================== OYOQ KIYIM (sizning rasmlaringiz) ====================
  {
    cat: 'shoes', brand: 'Nike', nameUz: 'Nike Dunk Low Panda', nameRu: 'Nike Dunk Low Panda',
    descUz: "Qora-oq klassik kombinatsiya\nTabiiy charm ustki qism\nEng ko'p sotiladigan model\nHar qanday kiyimga mos\nOriginal quti bilan",
    descRu: 'Классическое чёрно-белое сочетание\nНатуральная кожа\nСамая продаваемая модель\nПодходит к любой одежде\nОригинальная коробка',
    price: 139000, oldPrice: 189000, isNew: true,
    images: [up('15-nike-dunk-panda.jpg')],
    sizes: SHOE_SIZES,
  },
  {
    cat: 'shoes', brand: 'Nike', nameUz: 'Nike Retro Runner Cream', nameRu: 'Nike Retro Runner Cream',
    descUz: "Retro yugurish uslubi\nZamsh va to'qima aralashmasi\nKrem-kulrang rang\nJuda yengil va shinam\nOriginal quti bilan",
    descRu: 'Ретро беговой стиль\nЗамша и текстиль\nКремово-серый цвет\nОчень лёгкие и удобные\nОригинальная коробка',
    price: 109000, oldPrice: 155000,
    images: [up('16-nike-retro-cream.jpg')],
    sizes: SHOE_SIZES,
  },
  {
    cat: 'shoes', brand: 'Nike', nameUz: 'Nike SB Dunk Low Gray', nameRu: 'Nike SB Dunk Low Gray',
    descUz: "Kulrang-oq dizayn\nSkeyt uchun mustahkam taglik\nQo'shimcha ip (shnurok) bilan\nUniversal rang\nOriginal quti bilan",
    descRu: 'Серо-белый дизайн\nПрочная подошва для скейта\nВ комплекте запасные шнурки\nУниверсальный цвет\nОригинальная коробка',
    price: 135000, oldPrice: 185000, isNew: true,
    images: [up('17-nike-sb-dunk-gray.jpg')],
    sizes: SHOE_SIZES,
  },
  {
    cat: 'shoes', brand: 'Jordan', nameUz: 'Air Jordan 1 Low Gray', nameRu: 'Air Jordan 1 Low Gray',
    descUz: "Legendar Jordan 1 modeli\nKulrang-oq-qora kombinatsiya\nTabiiy charm\nBalandligi past (low)\nOriginal quti bilan",
    descRu: 'Легендарная модель Jordan 1\nСеро-бело-чёрное сочетание\nНатуральная кожа\nНизкий профиль (low)\nОригинальная коробка',
    price: 149000, oldPrice: 199000, isNew: true,
    images: [up('18-jordan1-low-gray.jpg')],
    sizes: SHOE_SIZES,
  },

  // ==================== QO'SHIMCHA MAHSULOTLAR (professional suratlar) ====================
  {
    cat: 'shoes', brand: 'Nike', nameUz: 'Air Force 1 White', nameRu: 'Air Force 1 White',
    descUz: "Butunlay oq charm\nAir amortizatsiya\nHar kuni kiyish uchun klassika\nOriginal quti bilan",
    descRu: 'Полностью белая кожа\nАмортизация Air\nКлассика на каждый день\nОригинальная коробка',
    price: 125000, oldPrice: 175000,
    images: [st('photo-1600185365483-26d7a4cc7519'), st('photo-1549298916-b41d501d3772')],
    sizes: SHOE_SIZES,
  },
  {
    cat: 'shoes', brand: 'Adidas', nameUz: 'Adidas Samba OG', nameRu: 'Adidas Samba OG',
    descUz: "Klassik zamsh burun\nKoreyada eng modali model\nYengil va past profil\nOriginal quti bilan",
    descRu: 'Классический замшевый мыс\nСамая модная модель в Корее\nЛёгкие, низкий профиль\nОригинальная коробка',
    price: 129000, oldPrice: 179000,
    images: [st('photo-1542291026-7eec264c27ff'), st('photo-1552346154-21d32810aba3')],
    sizes: SHOE_SIZES,
  },
  {
    cat: 'shoes', brand: 'New Balance', nameUz: 'New Balance 530', nameRu: 'New Balance 530',
    descUz: "Kumush-oq retro dizayn\nABZORB amortizatsiya\nKun bo'yi yurish uchun qulay\nOriginal quti bilan",
    descRu: 'Серебристо-белый ретро дизайн\nАмортизация ABZORB\nУдобны весь день\nОригинальная коробка',
    price: 115000, oldPrice: 159000,
    images: [st('photo-1595950653106-6c9ebd614d3a'), st('photo-1539185441755-769473a23570')],
    sizes: SHOE_SIZES,
  },
  {
    cat: 'shoes', brand: 'Lusso', nameUz: 'Classic Derby charm tufli', nameRu: 'Classic Derby туфли',
    descUz: "Tabiiy charm\nRasmiy tadbir va to'ylar uchun\nQora rang\nQo'lda tikilgan",
    descRu: 'Натуральная кожа\nДля офиса и торжеств\nЧёрный цвет\nРучная прошивка',
    price: 135000, oldPrice: 195000,
    images: [st('photo-1533867617858-e7b97e060509'), st('photo-1614252369475-531eba835eb1')],
    sizes: SHOE_SIZES,
  },
  {
    cat: 'glasses', brand: 'Ray-Ban', nameUz: 'Ray-Ban Aviator Gold', nameRu: 'Ray-Ban Aviator Gold',
    descUz: "Klassik aviator shakl\nOltin rangli metall ramka\nUV400 himoya\nG'ilof va salfetka bilan",
    descRu: 'Классическая форма авиатор\nЗолотистая металлическая оправа\nЗащита UV400\nС чехлом и салфеткой',
    price: 75000, oldPrice: 110000,
    images: [st('photo-1572635196237-14b3f281503f'), st('photo-1511499767150-a48a237f0083')],
    sizes: ['Oltin', 'Kumush'],
  },
  {
    cat: 'glasses', brand: 'Ray-Ban', nameUz: 'Ray-Ban Wayfarer', nameRu: 'Ray-Ban Wayfarer',
    descUz: "Legendar Wayfarer shakli\nPolarizatsiyalangan linza\nMustahkam atsetat ramka\nG'ilof bilan",
    descRu: 'Легендарная форма Wayfarer\nПоляризованные линзы\nПрочная ацетатная оправа\nС чехлом',
    price: 69000, oldPrice: 99000,
    images: [st('photo-1473496169904-658ba7c44d8a'), st('photo-1577803645773-f96470509666')],
    sizes: ['Qora', 'Jigarrang'],
  },
  {
    cat: 'perfume', brand: 'Dior', nameUz: 'Dior Sauvage EDT', nameRu: 'Dior Sauvage EDT',
    descUz: "Bergamot va ambroxan\nKuchli va uzoq — 8+ soat\nErkaklar uchun eng ommabop atir\nOriginal, Koreyadan",
    descRu: 'Бергамот и амброксан\nСтойкость 8+ часов\nСамый популярный мужской аромат\nОригинал, из Кореи',
    price: 129000, oldPrice: 199000,
    images: [st('photo-1541643600914-78b084683601'), st('photo-1594035910387-fea47794261f')],
    sizes: ['60ml', '100ml'], extra: [0, 45000],
  },
  {
    cat: 'perfume', brand: 'Chanel', nameUz: 'Bleu de Chanel EDP', nameRu: 'Bleu de Chanel EDP',
    descUz: "Sitrus va sandal daraxti\nRasmiy uchrashuvlar uchun\nJuda uzoq turadi\nOriginal, quti bilan",
    descRu: 'Цитрус и сандал\nДля деловых встреч\nОчень стойкий\nОригинал, с коробкой',
    price: 139000, oldPrice: 210000,
    images: [st('photo-1585386959984-a4155224a1ad'), st('photo-1592945403244-b3fbafd7f539')],
    sizes: ['50ml', '100ml'], extra: [0, 70000],
  },
  {
    cat: 'perfume', brand: 'Versace', nameUz: 'Versace Eros EDT', nameRu: 'Versace Eros EDT',
    descUz: "Yalpiz, olma, vanil\nYoshlar uchun energiyali hid\nYozgi sevimli\nOriginal, quti bilan",
    descRu: 'Мята, яблоко, ваниль\nЭнергичный молодёжный аромат\nЛетний фаворит\nОригинал, с коробкой',
    price: 95000, oldPrice: 149000,
    images: [st('photo-1615634260167-c8cdede054de'), st('photo-1608528577891-eb055944f2e7')],
    sizes: ['50ml', '100ml'], extra: [0, 50000],
  },
];

const stories = [
  { imageUrl: up('11-parfum-group.jpg'), titleUz: 'Atirlar', titleRu: 'Парфюм', link: 'perfume' },
  { imageUrl: up('15-nike-dunk-panda.jpg'), titleUz: 'Yangi kelgan', titleRu: 'Новинки', link: 'shoes' },
  { imageUrl: up('19-cartier-rimless.jpg'), titleUz: "Ko'zoynak", titleRu: 'Очки', link: 'glasses' },
  { imageUrl: up('10-baccarat-540.jpg'), titleUz: 'Lyuks', titleRu: 'Люкс', link: 'perfume' },
  { imageUrl: up('04-smart-glasses.jpg'), titleUz: 'Smart', titleRu: 'Smart', link: 'glasses' },
];

async function main() {
  console.log('🌱 Baza toldirilmoqda...');

  await prisma.setting.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      shopName: 'LUSSO BRAND KR',
      deliveryFee: 3500,
      freeDeliveryFrom: 100000,
      bankName: 'Shinhan Bank',
      bankAccount: '110-000-000000',
      bankHolder: 'LUSSO BRAND',
      supportUsername: 'lusso_brand_kr',
    },
  });

  const catMap = {};
  for (const c of categories) {
    const saved = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { nameUz: c.nameUz, nameRu: c.nameRu, emoji: c.emoji, sortOrder: c.sortOrder },
      create: c,
    });
    catMap[c.slug] = saved.id;
  }
  console.log('   ✅ ' + categories.length + ' ta kategoriya');

  const existing = await prisma.product.count();
  if (existing > 0) {
    console.log('   ℹ️  Bazada ' + existing + ' ta mahsulot bor edi — yangilanmoqda');
    await prisma.product.deleteMany({});
  }

  for (const [i, p] of products.entries()) {
    await prisma.product.create({
      data: {
        nameUz: p.nameUz,
        nameRu: p.nameRu,
        brand: p.brand,
        descUz: p.descUz,
        descRu: p.descRu,
        price: p.price,
        oldPrice: p.oldPrice ?? null,
        isNew: !!p.isNew,
        sortOrder: i,
        categoryId: catMap[p.cat],
        images: { create: p.images.map((url, idx) => ({ url, sortOrder: idx })) },
        variants: {
          create: p.sizes.map((label, idx) => ({
            label,
            stock: 4 + ((idx * 3) % 9),
            extraPrice: p.extra ? p.extra[idx] || 0 : 0,
            sortOrder: idx,
          })),
        },
      },
    });
  }
  console.log('   ✅ ' + products.length + ' ta mahsulot');

  await prisma.story.deleteMany({});
  await prisma.story.createMany({ data: stories.map((s, i) => ({ ...s, sortOrder: i })) });
  console.log('   ✅ ' + stories.length + ' ta story');

  console.log('🎉 Tayyor! Admin panelda mahsulotlarni tahrirlashingiz mumkin.');
}

main()
  .catch((e) => {
    console.error('❌ Xatolik:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
