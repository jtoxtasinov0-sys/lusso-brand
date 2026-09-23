// Bot logikalari: /start, til tanlash, telefon olish, menyu va xabarnomalar
import { Keyboard, InlineKeyboard } from 'grammy';
import config from '../config/default.js';
import { safeSend, safeSendPhoto } from '../core/bot.js';
import UserModel from '../models/User.js';
import OrderModel from '../models/Order.js';
import SettingModel from '../models/Setting.js';
import { applyPrices } from '../core/prices.js';
import { clearCache } from '../core/cache.js';
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

// Vaqtinchalik tunnel manzillari (kompyuterda test qilishda ochiladi).
// Kompyuter o'chgach ular o'ladi — shuning uchun doimiy manzil ulardan ustun turadi.
const TEMP_TUNNEL =
  /^https:\/\/[^/]*\.(trycloudflare\.com|ngrok-free\.app|ngrok\.io|ngrok\.dev|loca\.lt|serveo\.net|localhost\.run)/i;

const isPermanent = (url) => isHttps(url) && !TEMP_TUNNEL.test(url);

/**
 * Manzilni tanlash tartibi:
 *   1. .env dagi doimiy https manzil (Vercel) — deploy qilingan holat
 *   2. bazadagi manzil (tunnel.js kompyuterda ishlaganda yozadi)
 *   3. .env dagi qolgan qiymat (Wi-Fi manzili)
 * Shu tartib tufayli bazada eski, o'lik tunnel manzili qolib ketgan bo'lsa ham
 * bot doimiy manzilni yuboradi.
 */
async function pickUrl(envUrl, dbField) {
  if (isPermanent(envUrl)) return envUrl;
  try {
    const s = await SettingModel.get();
    if (isHttps(s[dbField])) return s[dbField];
  } catch {
    /* baza tayyor bo'lmasa */
  }
  return envUrl;
}

// Mini App manzili
export async function shopUrl() {
  return pickUrl(config.webAppUrl, 'webAppUrl');
}

// Admin panel manzili
export async function adminPanelUrl() {
  return pickUrl(config.adminUrl, 'adminUrl');
}

/**
 * Admin panelni ochadigan tugma.
 * https manzil bo'lsa — web_app tugmasi: panel botning ichida ochiladi,
 * brauzerga chiqish va parol yozish shart emas (Telegram o'zi tanitadi).
 */
export async function adminPanelKeyboard() {
  const url = await adminPanelUrl();
  const rows = [];

  if (isHttps(url)) rows.push([InlineKeyboard.webApp('🖥 Admin panelni ochish', url)]);
  if (config.adminMiniAppUrl) {
    rows.push([InlineKeyboard.url('↗️ Alohida oynada ochish', config.adminMiniAppUrl)]);
  }

  return rows.length ? InlineKeyboard.from(rows) : undefined;
}

/**
 * Panelni yuborish. Telegram web_app tugmasini faqat shaxsiy chatda qabul qiladi,
 * shuning uchun guruhda (yoki manzil sozlanmagan bo'lsa) oddiy havola yuboriladi.
 */
async function replyWithPanel(ctx, text, tail = '') {
  const keyboard = ctx.chat?.type === 'private' ? await adminPanelKeyboard() : undefined;

  // Manzil kod bloki ichida: bosilsa nusxa olinadi va Markdown uni buzmaydi
  return ctx.reply(`${text}\n\`${await adminPanelUrl()}\`${tail}`, {
    parse_mode: 'Markdown',
    reply_markup: keyboard,
  });
}

/**
 * Do'konni ochadigan tugma — INLINE (xabarga bog'langan) web_app tugmasi.
 * Pastki (reply) klaviaturadagi web_app tugmasi ba'zi Telegram versiyalarida
 * (ayniqsa iOS'da) initData'ni bo'sh yuborib qo'yadigan nosozlikka ega —
 * shuning uchun bu yerda ham admin panel kabi ishonchli INLINE tugma ishlatiladi.
 */
export async function shopKeyboard(lang) {
  const L = t(lang);
  const url = await shopUrl();
  if (!isHttps(url)) return undefined;
  return InlineKeyboard.from([[InlineKeyboard.webApp(L.menuShop, url)]]);
}

// Asosiy menyu klaviaturasi (pastki, doimiy klaviatura — faqat matnli tugmalar)
export async function mainKeyboard(lang) {
  const L = t(lang);
  const kb = new Keyboard();

  kb.text(L.menuOrders).row();
  kb.text(L.menuContact).text(L.menuAbout).row();
  kb.text(L.menuLang);

  return kb.resized();
}

/**
 * Asosiy menyuni yuboradi: bitta bosishda do'konni ochadigan INLINE
 * tugma (xabarga bog'langan) + pastki doimiy navigatsiya klaviaturasi.
 * Ikkalasi bitta xabarga sig'maydi (Telegram cheklovi), shuning uchun
 * ketma-ket ikkita xabar yuboriladi.
 */
async function sendMainMenu(ctx, lang) {
  const L = t(lang);
  const shopKb = ctx.chat?.type === 'private' ? await shopKeyboard(lang) : undefined;

  if (shopKb) {
    await ctx.reply(L.openShopHint, { reply_markup: shopKb });
  }

  return ctx.reply(L.mainMenu, { reply_markup: await mainKeyboard(lang) });
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

  await sendMainMenu(ctx, user.language);
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
    await sendMainMenu(ctx, lang);
  }
}

export async function onContact(ctx) {
  const phone = ctx.message.contact.phone_number;
  const user = await UserModel.setPhone(ctx.from.id, phone);
  const L = t(user.language);
  await ctx.reply(L.phoneSaved);
  await sendMainMenu(ctx, user.language);
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

  return sendMainMenu(ctx, lang);
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

  const keyboard = new InlineKeyboard().url(L.askQuestionBtn, config.ownerContactUrl);

  await safeSend(
    user.telegramId,
    `${head}\n\n🛍 *Buyurtma tarkibi:*\n${itemsText}\n\n${L.askQuestionText}`,
    { reply_markup: keyboard }
  );
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

  const keyboard = await adminPanelKeyboard();
  const items = (order.items || [])
    .map((i) => `• ${i.name}${i.variant ? ` (${i.variant})` : ''} × ${i.qty}`)
    .join('\n');

  const text =
    `🔔 *Yangi buyurtma!*\n\n` +
    `🧾 ${order.orderNumber}\n` +
    `👤 ${order.customerName} · ${order.phone}\n` +
    `📍 ${order.street}${order.detail ? ', ' + order.detail : ''}\n\n` +
    `${items}\n\n` +
    `💰 *${money(order.total)}*`;

  for (const id of ids) {
    const sent = await safeSend(id, text, { reply_markup: keyboard });
    // Guruh/kanalga web_app tugmasi yuborilmaydi — bunda xabar tugmasiz ketadi,
    // chunki yangi buyurtma haqidagi xabar har qanday holatda yetib borishi kerak
    if (!sent && keyboard) await safeSend(id, `${text}\n\n🖥 ${await adminPanelUrl()}`);
  }
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

  return replyWithPanel(
    ctx,
    "✅ *Siz admin bo'ldingiz!*\n\nEndi har bir yangi buyurtma haqida shu yerga xabar keladi.\n\n" +
      '🖥 Admin panel:'
  );
}

// Foydalanuvchi admin ekanini tekshirish (baza yiqilsa ADMIN_IDS bo'yicha)
async function isAdminUser(telegramId) {
  let user = null;
  try {
    user = await UserModel.findByTelegramId(telegramId);
  } catch {
    /* baza javob bermasa .env ga suyanamiz */
  }
  return Boolean(user?.isAdmin) || config.adminIds.includes(String(telegramId));
}

// /panel — admin panel havolasi va paroli (faqat adminlarga)
export async function onPanelCommand(ctx) {
  const isAdmin = await isAdminUser(ctx.from.id);

  if (!isAdmin) {
    return ctx.reply("Bu buyruq faqat adminlar uchun.\n\nAdmin bo'lish: `/admin PAROL`", {
      parse_mode: 'Markdown',
    });
  }

  // `/panel https://...` — panel manzilini almashtirish (qayta deploy qilmasdan)
  const arg = (ctx.message.text || '').split(/\s+/)[1];
  if (arg) {
    if (!isHttps(arg)) {
      return ctx.reply("Manzil `https://` bilan boshlanishi kerak.", { parse_mode: 'Markdown' });
    }
    await SettingModel.update({ adminUrl: arg.replace(/\/$/, '') });
    return ctx.reply(`✅ Panel manzili yangilandi:\n${arg}`, {
      reply_markup: await adminPanelKeyboard(),
    });
  }

  const url = await adminPanelUrl();

  if (!isHttps(url) && !config.adminMiniAppUrl) {
    return ctx.reply(
      "⚠️ *Admin panel manzili sozlanmagan.*\n\n" +
        `Hozirgi qiymat: \`${url}\`\n\n` +
        'Render → Environment → `ADMIN_PANEL_URL` ga panelning https manzilini yozing,\n' +
        "yoki shu yerda: `/panel https://sizning-panel.vercel.app`",
      { parse_mode: 'Markdown' }
    );
  }

  const pass = await SettingModel.panelPassword();

  return replyWithPanel(
    ctx,
    '🖥 *Admin panel*\n\nTugmani bossangiz shu yerda ochiladi.\n' +
      "Boshqa odamga yuborish uchun manzil (bosing — nusxa olinadi):",
    `\n🔑 Parol: \`${pass}\`\n\n` +
      "_Parolni panel → Sozlamalar bo'limida istalgan vaqtda o'zgartirasiz._"
  );
}

// /narxlar — fayldagi narxlarni bazaga yozish (faqat adminlar)
export async function onPricesCommand(ctx) {
  if (!(await isAdminUser(ctx.from.id))) {
    return ctx.reply('Bu buyruq faqat adminlar uchun.');
  }

  const confirmed = /\s(ha|tasdiq|tasdiqlash)\b/i.test(ctx.message.text || '');

  try {
    const { changes, missing, same, max, total } = await applyPrices({ dryRun: !confirmed });

    if (!changes.length) {
      return ctx.reply(
        `\u2705 *Narxlar joyida*\n\n${same} ta mahsulot allaqachon to'g'ri narxda.\n` +
          `Eng qimmat: ${money(max)}`,
        { parse_mode: 'Markdown' }
      );
    }

    const list = changes
      .slice(0, 15)
      .map((c) => `\u2022 ${c.name}\n   ${money(c.from)} \u2192 *${money(c.to)}*`)
      .join('\n');

    const tail = changes.length > 15 ? `\n\n...va yana ${changes.length - 15} ta` : '';
    const notFound = missing.length ? `\n\n\u26a0\ufe0f Topilmadi: ${missing.length} ta` : '';

    if (!confirmed) {
      return ctx.reply(
        `\ud83d\udcb0 *${changes.length} ta narx o'zgaradi* (jami ${total} ta)\n\n${list}${tail}${notFound}\n\n` +
          `Tasdiqlash uchun yozing: \`/narxlar ha\``,
        { parse_mode: 'Markdown' }
      );
    }

    clearCache(); // mijozlar yangi narxni darhol ko'rsin
    return ctx.reply(
      `\u2705 *${changes.length} ta narx yangilandi*\n\n${list}${tail}${notFound}\n\n` +
        `Eng qimmat narx: ${money(max)}\n\nDo'konni qaytadan oching.`,
      { parse_mode: 'Markdown' }
    );
  } catch (err) {
    console.error('onPricesCommand:', err);
    return ctx.reply("\u274c Narxlarni yangilab bo'lmadi: " + err.message);
  }
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
