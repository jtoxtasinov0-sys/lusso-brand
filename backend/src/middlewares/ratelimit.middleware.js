/**
 * Admin panel login himoyasi.
 * Parol internetdan ochiq bo'lgani uchun — noto'g'ri urinishlar cheklanadi.
 */
const MAX_ATTEMPTS = 5; // necha marta xato qilish mumkin
const WINDOW_MS = 15 * 60 * 1000; // shu vaqt ichida
const BLOCK_MS = 15 * 60 * 1000; // bloklash muddati

const attempts = new Map(); // ip -> { count, firstAt, blockedUntil }

function clientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd) return fwd.split(',')[0].trim();
  return req.ip || req.socket?.remoteAddress || 'unknown';
}

export function loginLimiter(req, res, next) {
  const ip = clientIp(req);
  const now = Date.now();
  const rec = attempts.get(ip);

  // Telegram orqali kirishda parol yo'q — imzo tekshiriladi, ya'ni tanlab
  // topib bo'lmaydi. Shuning uchun blok bu yo'lni to'smaydi: panel bot ichidan
  // har doim ochilishi kerak.
  if (req.body?.initData) {
    req.loginIp = ip;
    return next();
  }

  if (rec?.blockedUntil && rec.blockedUntil > now) {
    const minutes = Math.ceil((rec.blockedUntil - now) / 60000);
    return res.status(429).json({
      error: `Juda ko'p noto'g'ri urinish. ${minutes} daqiqadan keyin qayta urining.`,
    });
  }

  // Eskirgan yozuvni tozalash
  if (rec && now - rec.firstAt > WINDOW_MS) attempts.delete(ip);

  req.loginIp = ip;
  next();
}

export function registerFailedLogin(ip) {
  const now = Date.now();
  const rec = attempts.get(ip) || { count: 0, firstAt: now };
  rec.count += 1;

  if (rec.count >= MAX_ATTEMPTS) {
    rec.blockedUntil = now + BLOCK_MS;
    console.warn(`🔒 ${ip} bloklandi — ${MAX_ATTEMPTS} marta noto'g'ri parol`);
  }

  attempts.set(ip, rec);
  return MAX_ATTEMPTS - rec.count;
}

export function clearFailedLogins(ip) {
  attempts.delete(ip);
}
