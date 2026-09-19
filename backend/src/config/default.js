// Barcha sozlamalar shu yerda to'planadi (.env faylidan o'qiladi)
import dotenv from 'dotenv';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const port = Number(process.env.PORT) || 5000;

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
  adminPassword: process.env.ADMIN_PASSWORD || 'lusso2025',
  jwtSecret: process.env.JWT_SECRET || 'lusso-dev-secret',
  lanIp,
  // Botdagi xabarlarda ko'rsatiladigan admin panel havolasi
  adminUrl: (process.env.ADMIN_PANEL_URL || `http://${lanIp}:5174`).replace(/\/$/, ''),

  // Brauzerda (Telegramsiz) test qilish uchun
  skipInitDataCheck: String(process.env.SKIP_INITDATA_CHECK || '').toLowerCase() === 'true',
  devTelegramId: process.env.DEV_TELEGRAM_ID || '999000111',

  // Do'kon
  shop: {
    name: 'LUSSO BRAND KR',
    currency: '₩',
  },

  uploadsDir: path.resolve(__dirname, '../../uploads'),
};

export default config;
