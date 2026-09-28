// Validatsiya: Telegram Mini App initData tekshiruvi + Admin panel JWT
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import config from '../config/default.js';

/**
 * Telegram initData imzosini tekshiradi.
 * Hujjat: https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 */
export function verifyInitData(initData, botToken) {
  try {
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    if (!hash) return null;
    params.delete('hash');

    const dataCheckString = [...params.entries()]
      .map(([k, v]) => `${k}=${v}`)
      .sort()
      .join('\n');

    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
    const calculated = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

    if (calculated !== hash) return null;

    const userRaw = params.get('user');
    return userRaw ? JSON.parse(userRaw) : null;
  } catch {
    return null;
  }
}

/**
 * Mini App so'rovlarini himoyalash.
 * initData "x-init-data" sarlavhasida keladi.
 * Brauzerda test qilishda (SKIP_INITDATA_CHECK=true) soxta foydalanuvchi ishlatiladi.
 */
export function telegramAuth(req, res, next) {
  const initData = req.headers['x-init-data'] || '';

  if (initData && config.botToken) {
    const user = verifyInitData(initData, config.botToken);
    if (user) {
      req.tgUser = {
        id: String(user.id),
        firstName: user.first_name || 'Mijoz',
        lastName: user.last_name || null,
        username: user.username || null,
      };
      return next();
    }
  }

  // Brauzer (Chrome va h.k.) orqali kirgan mijoz: Telegram yo'q, shuning uchun
  // brauzer o'zi yaratib localStorage'da saqlagan tasodifiy "mehmon ID" bilan
  // tanib olinadi. Bazada u "web_<id>" ko'rinishida alohida mijoz bo'ladi.
  // Hozircha o'chiq (config.browserAccess) — do'kon faqat bot ichida ishlaydi.
  const guestId = req.headers['x-guest-id'] || '';
  if (config.browserAccess && /^[a-zA-Z0-9-]{16,64}$/.test(guestId)) {
    req.tgUser = { id: `web_${guestId}`, firstName: 'Mijoz', isGuest: true };
    return next();
  }

  // Test rejimi: faqat .env da yoqilgan bo'lsa VA so'rov shu kompyuterdan kelsa.
  // Shu sababli tunnel (ngrok/cloudflare) manzili hamisha himoyalangan qoladi.
  if (config.skipInitDataCheck && isLocalRequest(req)) {
    req.tgUser = {
      id: String(config.devTelegramId),
      firstName: 'Test',
      lastName: 'Mijoz',
      username: 'test_user',
    };
    return next();
  }

  return res.status(401).json({ code: 'BOT_ONLY', error: 'Telegram orqali kiring' });
}

function isLocalRequest(req) {
  const origin = req.headers.origin || req.headers.referer || '';
  if (!origin) return true; // curl va shunga o'xshash to'g'ridan-to'g'ri so'rovlar
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/.test(origin);
}

// ---------------- ADMIN PANEL ----------------
// via: 'telegram' (bot ichidan) yoki 'password' (brauzerdan)
export function signAdminToken(via = 'password') {
  return jwt.sign({ role: 'admin', via }, config.jwtSecret, { expiresIn: '7d' });
}

export function adminAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Avtorizatsiya talab qilinadi' });

  try {
    const payload = jwt.verify(token, config.jwtSecret);
    // Brauzer kirishi o'chiq bo'lsa — faqat bot ichida olingan token o'tadi
    // (avval brauzerda parol bilan olingan tokenlar ham shu yerda to'xtaydi)
    if (!config.browserAccess && payload.via !== 'telegram') {
      return res.status(401).json({ code: 'BOT_ONLY', error: 'Panel faqat bot ichida ishlaydi' });
    }
    return next();
  } catch {
    return res.status(401).json({ error: 'Sessiya tugadi, qaytadan kiring' });
  }
}
