// Barcha sozlamalar shu yerda to'planadi (.env faylidan o'qiladi)
import dotenv from 'dotenv';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const port = Number(process.env.PORT) || 5000;

// Repodagi funksiya kalitlari (GitHub Actions orqali o'zgartiriladi).
// Fayl bo'lmasa yoki buzilgan bo'lsa — hammasi o'chiq hisoblanadi.
function readFeatures() {
  try {
    return JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../features.json'), 'utf8'));
  } catch {
    return {};
  }
}

const features = readFeatures();

/**
 * Kompyuterning Wi-Fi/LAN manzilini topadi (masalan 192.168.0.7).
 * Telegram "localhost" ni havola qilmaydi, IP manzilni esa qiladi —
 * shuning uchun botdagi admin panel havolasi shu manzil bilan yuboriladi.
 */
function localIp() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === 'IPv4' && !net.internal) return net.address;
    }
  }
  return 'localhost';
}

const lanIp = localIp();

// Serverda (Render) ishlayaptimi yoki kompyuterdami
const onServer = Boolean(process.env.RENDER) || (process.env.PUBLIC_URL || '').startsWith('https://');

// Serverda ADMIN_PANEL_URL kiritilmay qolsa ham bot panelni bera olishi uchun
// standart manzil. Vercel loyihasi boshqa nom bilan tursa, uni Render'dagi
// ADMIN_PANEL_URL orqali yoki botda `/panel https://...` bilan almashtiring.
const DEFAULT_PANEL_URL = 'https://lusso-brand-kr-admin.vercel.app';

export const config = {
  port,
  publicUrl: process.env.PUBLIC_URL || `http://localhost:${port}`,

  // Telegram
  botToken: (process.env.BOT_TOKEN || '').trim(),
  webAppUrl: (process.env.WEB_APP_URL || '').trim(),
  adminIds: (process.env.ADMIN_IDS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),

  // Admin panel
  // Parol .env dan olinadi. Bo'sh bo'lsa — README dagi parol ishlatiladi,
  // shunda Render'da o'zgaruvchi kiritilmay qolsa ham panel ochilaveradi.
  adminPassword: (process.env.ADMIN_PASSWORD || 'LussoKR2026').trim(),
  jwtSecret: process.env.JWT_SECRET || 'lusso-dev-secret',
  lanIp,
  // Botdagi xabarlarda ko'rsatiladigan admin panel havolasi (doimiy manzil).
  // Serverda: .env → standart Vercel manzili. Kompyuterda: Wi-Fi manzili.
  adminUrl: (
    process.env.ADMIN_PANEL_URL ||
    (onServer ? DEFAULT_PANEL_URL : `http://${lanIp}:5174`)
  ).replace(/\/$/, ''),
  // Bot ichida Mini App bo'lib ochiladigan havola: https://t.me/<bot>/<short_name>
  // BotFather → /newapp orqali yaratiladi. Bo'sh bo'lsa ham panel web_app tugmasi
  // orqali botning ichida ochilaveradi.
  adminMiniAppUrl: (process.env.ADMIN_MINIAPP_URL || '').trim().replace(/\/$/, ''),

  // Do'kon va admin panelni oddiy brauzerdan (Telegram'siz) ochish ruxsati.
  // Ataylab .env/Render sozlamasida emas, repodagi backend/features.json da
  // turadi — uni faqat GitHub'ga kirishi bor dasturchi o'zgartira oladi.
  // Yoqish/o'chirish: GitHub → Actions → "Brauzer kirishi" → Run workflow.
  browserAccess: features.browserAccess === true,
  // Brauzerda ochilganda "botga o'tish" tugmasi uchun (masalan https://t.me/lusso_brand_kr_bot)
  botUrl: (process.env.BOT_URL || '').trim(),

  // Brauzerda (Telegramsiz) test qilish uchun
  skipInitDataCheck: String(process.env.SKIP_INITDATA_CHECK || '').toLowerCase() === 'true',
  devTelegramId: process.env.DEV_TELEGRAM_ID || '999000111',

  // Do'kon egasining Telegram profili (savol-javob uchun tugma/havola)
  ownerContactUrl: (process.env.OWNER_CONTACT_URL || 'https://t.me/Nurillo_0304').trim(),

  // Do'kon
  shop: {
    name: 'LUSSO BRAND KR',
    currency: '₩',
  },

  uploadsDir: path.resolve(__dirname, '../../uploads'),
};

export default config;
