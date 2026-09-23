// Bot matnlari: o'zbekcha va ruscha
export const texts = {
  uz: {
    chooseLanguage: 'Tilni tanlang / Выберите язык',
    welcome: (name) =>
      `Assalomu alaykum, ${name}! 👋\n\n*LUSSO BRAND KR* — Koreyadagi erkaklar uchun original oyoq kiyim 👟, ko'zoynak 🕶 va atirlar 🧴 do'koni.\n\nDavom etish uchun telefon raqamingizni yuboring.`,
    sendPhone: '📱 Telefon raqamni yuborish',
    phoneSaved: 'Rahmat! ✅\n\nEndi do\'konni ochib, xaridni boshlashingiz mumkin 👇',
    menuShop: '🛍 Do\'konni ochish',
    menuOrders: '📦 Buyurtmalarim',
    menuContact: '📞 Aloqa',
    menuAbout: 'ℹ️ Biz haqimizda',
    menuLang: '🌐 Til / Язык',
    mainMenu: 'Asosiy menyu 👇',
    noOrders: 'Sizda hali buyurtma yo\'q.\n\nDo\'konni ochib, birinchi buyurtmangizni bering 🛍',
    yourOrders: '📦 *Sizning buyurtmalaringiz:*',
    contact: (username) =>
      `📞 *Aloqa*\n\nSavollaringiz bo'lsa yozing: @${username}\n\nIsh vaqti: har kuni 10:00 — 22:00 (KST)`,
    openShopHint: 'Do\'konni ochish uchun pastdagi tugmani bosing 👇',
    orderCreated: (o) =>
      `✅ *Buyurtmangiz qabul qilindi!*\n\n🧾 Buyurtma: *${o.orderNumber}*\n💰 Jami: *${money(o.total)}*\n\n💳 To'lov uchun:\n\`${o.bankAccount}\`\n${o.bankName} — ${o.bankHolder}\n\n⚠️ To'lovni amalga oshirib, chek rasmini yuboring. Tasdiqlangach, buyurtmangiz jo'natiladi 📦`,
    receiptReceived: 'Chek qabul qilindi ✅\nAdmin tekshirgach sizga xabar beramiz.',
    statusCONFIRMED: (o) =>
      `✅ *To'lovingiz tasdiqlandi!*\n\n🧾 Buyurtma: ${o.orderNumber}\nBuyurtmangiz tayyorlanmoqda 📦`,
    statusSHIPPED: (o) =>
      `🚚 *Buyurtmangiz jo'natildi!*\n\n🧾 Buyurtma: ${o.orderNumber}${
        o.trackingNumber ? `\n📮 Kuzatuv raqami: \`${o.trackingNumber}\`` : ''
      }\n\n1-2 kun ichida yetib boradi.`,
    statusDELIVERED: (o) =>
      `🎉 *Buyurtmangiz yetkazildi!*\n\n🧾 ${o.orderNumber}\n\nXaridingiz muborak bo'lsin! Yana kutamiz 🖤`,
    statusCANCELLED: (o) => `❌ Buyurtma ${o.orderNumber} bekor qilindi.\n\nSavollar uchun admin bilan bog'laning.`,
    askQuestionBtn: '❓ Savol berish',
    askQuestionText: "Savollaringiz bo'lsa — pastdagi tugma orqali administratorga yozing 👇",
  },

  ru: {
    chooseLanguage: 'Tilni tanlang / Выберите язык',
    welcome: (name) =>
      `Здравствуйте, ${name}! 👋\n\n*LUSSO BRAND KR* — магазин мужской обуви 👟, очков 🕶 и парфюма 🧴 в Корее.\n\nОтправьте номер телефона, чтобы продолжить.`,
    sendPhone: '📱 Отправить номер',
    phoneSaved: 'Спасибо! ✅\n\nТеперь можно открыть магазин 👇',
    menuShop: '🛍 Открыть магазин',
    menuOrders: '📦 Мои заказы',
    menuContact: '📞 Связь',
    menuAbout: 'ℹ️ О нас',
    menuLang: '🌐 Til / Язык',
    mainMenu: 'Главное меню 👇',
    noOrders: 'У вас пока нет заказов.\n\nОткройте магазин и сделайте первый заказ 🛍',
    yourOrders: '📦 *Ваши заказы:*',
    contact: (username) =>
      `📞 *Связь*\n\nПишите нам: @${username}\n\nРаботаем ежедневно 10:00 — 22:00 (KST)`,
    openShopHint: 'Нажмите кнопку ниже, чтобы открыть магазин 👇',
    orderCreated: (o) =>
      `✅ *Заказ принят!*\n\n🧾 Заказ: *${o.orderNumber}*\n💰 Итого: *${money(o.total)}*\n\n💳 Для оплаты:\n\`${o.bankAccount}\`\n${o.bankName} — ${o.bankHolder}\n\n⚠️ Оплатите и отправьте скриншот чека. После подтверждения заказ будет отправлен 📦`,
    receiptReceived: 'Чек получен ✅\nМы сообщим после проверки.',
    statusCONFIRMED: (o) => `✅ *Оплата подтверждена!*\n\n🧾 Заказ: ${o.orderNumber}\nЗаказ готовится 📦`,
    statusSHIPPED: (o) =>
      `🚚 *Заказ отправлен!*\n\n🧾 Заказ: ${o.orderNumber}${
        o.trackingNumber ? `\n📮 Трек-номер: \`${o.trackingNumber}\`` : ''
      }\n\nДоставка 1-2 дня.`,
    statusDELIVERED: (o) => `🎉 *Заказ доставлен!*\n\n🧾 ${o.orderNumber}\n\nСпасибо за покупку! Ждём снова 🖤`,
    statusCANCELLED: (o) => `❌ Заказ ${o.orderNumber} отменён.\n\nПо вопросам напишите администратору.`,
    askQuestionBtn: '❓ Задать вопрос',
    askQuestionText: 'Если есть вопросы — напишите администратору по кнопке ниже 👇',
  },
};

export function money(n) {
  return '₩' + Number(n || 0).toLocaleString('ko-KR');
}

export function t(lang) {
  return texts[lang] || texts.uz;
}

export default texts;
