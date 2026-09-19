// Telegram bot instansiyasi (grammY)
import path from 'path';
import fs from 'fs';
import { Bot, InputFile } from 'grammy';
import config from '../config/default.js';

if (!config.botToken) {
  console.warn('⚠️  BOT_TOKEN topilmadi (.env). Bot ishga tushmaydi, faqat API ishlaydi.');
}

// Token bo'lmasa ham server yiqilmasligi uchun "bo'sh" bot yaratiladi
export const bot = config.botToken ? new Bot(config.botToken) : null;

export const hasBot = Boolean(bot);

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
  if (typeof photo === 'string' && photo.startsWith('/uploads/')) {
    const filePath = path.join(config.uploadsDir, photo.replace('/uploads/', ''));
    if (fs.existsSync(filePath)) return new InputFile(filePath);
  }
  return photo;
}

export default bot;
