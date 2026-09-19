// Bot logikalari: /start, til tanlash, telefon olish, menyu va xabarnomalar
import { Keyboard, InlineKeyboard } from 'grammy';
import config from '../config/default.js';
import { safeSend, safeSendPhoto } from '../core/bot.js';
import UserModel from '../models/User.js';
import OrderModel from '../models/Order.js';
import SettingModel from '../models/Setting.js';
import { t, money } from '../locales/index.js';

const STATUS_LABEL = {
  PENDING_PAYMENT: { uz: "⏳ To'lov kutilmoqda", ru: '⏳ Ожидает оплаты' },
  RECEIPT_SENT: { uz: '🧾 Chek tekshirilmoqda', ru: '🧾 Чек на проверке' },
  CONFIRMED: { uz: '✅ Tasdiqlandi', ru: '✅ Подтверждён' },
  SHIPPED: { uz: "🚚 Jo'natildi", ru: '🚚 Отправлен' },
  DELIVERED: { uz: '🎉 Yetkazildi', ru: '🎉 Доставлен' },
  CANCELLED: { uz: '❌ Bekor qilindi', ru: '❌ Отменён' },
};

const isHttps = (url) => typeof url === 'string' && url.startsWith('https://');

// Mini App manzili: avval bazadan (tunnel avtomatik yozadi), keyin .env dan
export async function shopUrl() {
  try {
    const s = await SettingModel.get();
    if (isHttps(s.webAppUrl)) return s.webAppUrl;
  } catch {
    /* baza tayyor bo'lmasa */
  }
  return config.webAppUrl;
}

// Admin panel manzili: avval bazadan (tunnel yozadi), keyin Wi-Fi manzili
export async function adminPanelUrl() {
  try {
    const s = await SettingModel.get();
    if (isHttps(s.adminUrl)) return s.adminUrl;
  } catch {
    /* baza tayyor bo'lmasa */
  }
  return config.adminUrl;
}

// Asosiy menyu klaviaturasi
export async function mainKeyboard(lang) {
  const L = t(lang);
  const kb = new Keyboard();
  const url = await shopUrl();

  if (isHttps(url)) kb.webApp(L.menuShop, url).row();
  else kb.text(L.menuShop).row();

  kb.text(L.menuOrders).row();
  kb.text(L.menuContact).text(L.menuAbout).row();
  kb.text(L.menuLang);

  return kb.resized();
}

function phoneKeyboard(lang) {
  const L = t(lang);
  return new Keyboard().requestContact(L.sendPhone).resized().oneTime();
}

function langKeyboard() {
  return new InlineKeyboard().text("🇺🇿 O'zbekcha", 'lang:uz').text('🇷🇺 Русский', 'lang:ru');
}

// ---------------- HANDLERLAR ----------------

export async function onStart(ctx) {
  const user = await UserModel.findOrCreate({
    id: ctx.from.id,
    firstName: ctx.from.first_name,
    lastName: ctx.from.last_name,
    username: ctx.from.username,
  });

  if (!user.phone) {
    await ctx.reply(t(user.language).chooseLanguage, { reply_markup: langKeyboard() });
    return;
  }

  const L = t(user.language);
  await ctx.reply(L.mainMenu, { reply_markup: await mainKeyboard(user.language) });
}

export async function onLanguageChosen(ctx) {
  const lang = ctx.callbackQuery.data.split(':')[1];
  await UserModel.findOrCreate({
    id: ctx.from.id,
    firstName: ctx.from.first_name,
    lastName: ctx.from.last_name,
    username: ctx.from.username,
  });
  const user = await UserModel.setLanguage(ctx.from.id, lang);
  const L = t(lang);

  await ctx.answerCallbackQuery();
  await ctx.editMessageText(lang === 'uz' ? "Til: O'zbekcha ✅" : 'Язык: Русский ✅');

  if (!user.phone) {
    await ctx.reply(L.welcome(ctx.from.first_name || ''), {
      parse_mode: 'Markdown',
      reply_markup: phoneKeyboard(lang),
    });
  } else {
    await ctx.reply(L.mainMenu, { reply_markup: await mainKeyboard(lang) });
  }
}

export async function onContact(ctx) {
  const phone = ctx.message.contact.phone_number;
  const user = await UserModel.setPhone(ctx.from.id, phone);
  const L = t(user.language);
  await ctx.reply(L.phoneSaved, { reply_markup: await mainKeyboard(user.language) });
}

export async function onText(ctx) {
  const user = await UserModel.findOrCreate({
    id: ctx.from.id,
    firstName: ctx.from.first_name,
    lastName: ctx.from.last_name,
    username: ctx.from.username,
  });
  const lang = user.language;
  const L = t(lang);
  const text = ctx.message.text;

  if (text === L.menuOrders) return sendMyOrders(ctx, user);

  if (text === L.menuContact) {
    const s = await SettingModel.get();
    return ctx.reply(L.contact(s.supportUsername), { parse_mode: 'Markdown' });
  }

  if (text === L.menuAbout) {
    const s = await SettingModel.get();
    return ctx.reply(lang === 'ru' ? s.aboutRu : s.aboutUz);
  }

  if (text === L.menuLang) {
    return ctx.reply(L.chooseLanguage, { reply_markup: langKeyboard() });
  }

  if (text === L.menuShop) {
    if (!isHttps(await shopUrl())) {
      return ctx.reply(
        lang === 'ru'
          ? '⚠️ Магазин пока не подключён. Администратор настраивает туннель.'
          : "⚠️ Do'kon hali ulanmagan. Administrator tunnel sozlamoqda."
      );
    }
    return ctx.reply(L.openShopHint, { reply_markup: await mainKeyboard(lang) });
  }

  return ctx.reply(L.mainMenu, { reply_markup: await mainKeyboard(lang) });
}

async function sendMyOrders(ctx, user) {
  const L = t(user.language);
  const orders = await OrderModel.byUser(user.id);
  if (!orders.length) return ctx.reply(L.noOrders);

  const lines = orders.slice(0, 10).map((o) => {
    const status = STATUS_LABEL[o.status][user.language] || o.status;
    const date = new Date(o.createdAt).toLocaleDateString('ru-RU');
    const track = o.trackingNumber ? `\n   📮 ${o.trackingNumber}` : '';
    return `🧾 *${o.orderNumber}* — ${money(o.total)}\n   ${status} · ${date}${track}`;
  });

  return ctx.reply(`${L.yourOrders}\n\n${lines.join('\n\n')}`, { parse_mode: 'Markdown' });
}

// ---------------- XABARNOMALAR (API dan chaqiriladi) ----------------

export async function notifyOrderCreated(order) {
  const user = order.user;
  if (!user) return;
  const L = t(user.language);
  const s = await SettingModel.get();

  const itemsText = (order.items || [])
    .map((i) => `• ${i.name}${i.variant ? ` (${i.variant})` : ''} × ${i.qty}`)
    .join('\n');

  const head = L.orderCreated({
    orderNumber: order.orderNumber,
    total: order.total,
    bankName: s.bankName,
    bankAccount: s.bankAccount,
    bankHolder: s.bankHolder,
  });

  await safeSend(user.telegramId, `${head}\n\n🛍 *Buyurtma tarkibi:*\n${itemsText}`);
}

export async function notifyReceipt(order) {
  const user = order.user;
  if (!user) return;
  await safeSend(user.telegramId, t(user.language).receiptReceived);
}

export async function notifyStatus(order) {
  const user = order.user;
  if (!user) return;
  const L = t(user.language);
  const fn = L[`status${order.status}`];
  if (!fn) return;
  await safeSend(user.telegramId, fn(order));
}

// Adminlarga yangi buyurtma haqida qisqa signal
export async function notifyAdmins(order) {
  const fromDb = await UserModel.admins();
  const ids = new Set([...config.adminIds, ...fromDb.map((u) => u.telegramId)]);
  if (!ids.size) return;

  const panel = await adminPanelUrl();
  const items = (order.items || [])
    .map((i) => `• ${i.name}${i.variant ? ` (${i.variant})` : ''} × ${i.qty}`)
    .join('\n');

  const text =
    `🔔 *Yangi buyurtma!*\n\n` +
    `🧾 ${order.orderNumber}\n` +
    `👤 ${order.customerName} · ${order.phone}\n` +
    `📍 ${order.street}${order.detail ? ', ' + order.detail : ''}\n\n` +
    `${items}\n\n` +
    `💰 *${money(order.total)}*\n\n` +
    `🖥 ${panel}`;

  for (const id of ids) await safeSend(id, text);
}

// /admin <parol> — o'zini admin qilib ro'yxatdan o'tkazish
export async function onAdminCommand(ctx) {
  const parts = (ctx.message.text || '').split(' ');
  const password = parts[1];

  if (!password) {
    return ctx.reply("Foydalanish: `/admin PAROL`", { parse_mode: 'Markdown' });
  }

  if (password !== config.adminPassword) {
    return ctx.reply("❌ Parol noto'g'ri");
  }

  await UserModel.findOrCreate({
    id: ctx.from.id,
    firstName: ctx.from.first_name,
    lastName: ctx.from.last_name,
    username: ctx.from.username,
  });
  await UserModel.makeAdmin(ctx.from.id);

  return ctx.reply(
    "✅ *Siz admin bo'ldingiz!*\n\nEndi har bir yangi buyurtma haqida shu yerga xabar keladi.\n\n" +
      `🖥 Admin panel:\n${await adminPanelUrl()}\n🔑 Parol: \`${config.adminPassword}\``,
    { parse_mode: 'Markdown' }
  );
}

// /panel — admin panel havolasi va paroli (faqat adminlarga)
export async function onPanelCommand(ctx) {
  const user = await UserModel.findByTelegramId(ctx.from.id);
  const isAdmin = user?.isAdmin || config.adminIds.includes(String(ctx.from.id));

  if (!isAdmin) {
    return ctx.reply("Bu buyruq faqat adminlar uchun.\n\nAdmin bo'lish: `/admin PAROL`", {
      parse_mode: 'Markdown',
    });
  }

  return ctx.reply(
    `🖥 *Admin panel*\n\n${await adminPanelUrl()}\n\n` + `🔑 Parol: \`${config.adminPassword}\``,
    { parse_mode: 'Markdown' }
  );
}

// ---------------- RASSILKA ----------------
export async function runBroadcast({ text, imageUrl, buttonText, buttonUrl }) {
  const users = await UserModel.allTelegramIds();
  let sent = 0;
  let failed = 0;

  const markup =
    buttonText && buttonUrl ? new InlineKeyboard().url(buttonText, buttonUrl) : undefined;

  // Rasm birinchi marta yuklanadi, keyin file_id orqali tez yuboriladi
  let photo = imageUrl || null;

  for (const u of users) {
    if (photo) {
      const msg = await safeSendPhoto(u.telegramId, photo, text, { reply_markup: markup });
      if (msg) {
        sent++;
        const fileId = msg.photo?.[msg.photo.length - 1]?.file_id;
        if (fileId) photo = fileId;
      } else {
        failed++;
      }
    } else {
      (await safeSend(u.telegramId, text, { reply_markup: markup })) ? sent++ : failed++;
    }
    // Telegram limiti: sekundiga ~30 xabar
    await new Promise((r) => setTimeout(r, 45));
  }

  return { sent, failed, total: users.length };
}

export { STATUS_LABEL };
