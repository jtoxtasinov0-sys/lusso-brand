// Telegram bot instansiyasi (grammY)
import path from 'path';
import fs from 'fs';
import { Bot, InputFile, InputMediaBuilder } from 'grammy';
import config from '../config/default.js';

if (!config.botToken) {
  console.warn('⚠️  BOT_TOKEN topilmadi (.env). Bot ishga tushmaydi, faqat API ishlaydi.');
}

// Token bo'lmasa ham server yiqilmasligi uchun "bo'sh" bot yaratiladi
export const bot = config.botToken ? new Bot(config.botToken) : null;

export const hasBot = Boolean(bot);

// Botning t.me havolasi (brauzerda ochilganda "botga o'tish" tugmasi uchun)
export function botLink() {
  if (config.botUrl) return config.botUrl;
  try {
    if (bot?.botInfo?.username) return `https://t.me/${bot.botInfo.username}`;
  } catch {
    /* bot hali ishga tushmagan */
  }
  return null;
}

// Xabar yuborish (xatolik bo'lsa server to'xtamaydi)
export async function safeSend(chatId, text, extra = {}) {
  if (!bot) return false;
  try {
    await bot.api.sendMessage(String(chatId), text, { parse_mode: 'Markdown', ...extra });
    return true;
  } catch (err) {
    console.error(`⚠️  ${chatId} ga xabar yuborilmadi: ${err.message}`);
    return false;
  }
}

/**
 * Rasm yuborish. photo quyidagilardan biri bo'lishi mumkin:
 *  - "/uploads/xxx.jpg"  → localdagi fayl (Telegramga to'g'ridan-to'g'ri yuklanadi)
 *  - "https://..."       → havola
 *  - file_id             → oldin yuborilgan rasmning id si (eng tez usul)
 * Muvaffaqiyatli bo'lsa message obyektini qaytaradi.
 */
export async function safeSendPhoto(chatId, photo, caption, extra = {}) {
  if (!bot) return null;
  try {
    const msg = await bot.api.sendPhoto(String(chatId), toPhoto(photo), {
      caption,
      parse_mode: 'Markdown',
      ...extra,
    });
    return msg;
  } catch (err) {
    console.error(`⚠️  ${chatId} ga rasm yuborilmadi: ${err.message}`);
    return null;
  }
}

export function toPhoto(photo) {
  // Admin paneldagi rasm ramkasi sozlamasi ("#z=1.3&x=50") faylga tegishli emas
  if (typeof photo === 'string') photo = photo.split('#')[0];
  if (typeof photo === 'string' && photo.startsWith('/uploads/')) {
    const filePath = path.join(config.uploadsDir, photo.replace('/uploads/', ''));
    if (fs.existsSync(filePath)) return new InputFile(filePath);
    // Diskda yo'q (server qayta ishga tushgan) — Telegram rasmni serverdan
    // o'zi oladi, server esa uni bazadan beradi
    if (config.publicUrl.startsWith('https://')) return config.publicUrl + photo;
  }
  return photo;
}

const CAPTION_MAX = 1024;

/**
 * Mahsulot rasmlari bilan xabar yuborish (buyurtma xabarlari uchun).
 *  - 1 ta rasm va matn qisqa bo'lsa — rasm + izoh bitta xabarda
 *  - bir nechta rasm — avval albom, keyin tugmali matn
 * Rasm yuborilmasa ham matn baribir yetib boradi. Matn yetib borsa true.
 */
export async function safeSendWithPhotos(chatId, photos, text, extra = {}) {
  if (!bot) return false;
  const list = [...new Set((photos || []).filter(Boolean))].slice(0, 10);

  if (list.length === 1 && text.length <= CAPTION_MAX) {
    if (await safeSendPhoto(chatId, list[0], text, extra)) return true;
  } else if (list.length === 1) {
    await safeSendPhoto(chatId, list[0], undefined);
  } else if (list.length > 1) {
    try {
      await bot.api.sendMediaGroup(
        String(chatId),
        list.map((p) => InputMediaBuilder.photo(toPhoto(p)))
      );
    } catch (err) {
      console.error(`⚠️  ${chatId} ga albom yuborilmadi: ${err.message}`);
    }
  }
  return safeSend(chatId, text, extra);
}

export default bot;
