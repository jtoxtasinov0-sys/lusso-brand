// Haqiqiy ilovalarni (miniapp + admin) Playwright'da ochish uchun umumiy sozlamalar.
// Tashqi so'rovlar (Google Fonts, telegram.org) lokal fayllarga yo'naltiriladi —
// shunda render internetga bog'liq bo'lmaydi va har safar bir xil chiqadi.
const fs = require('fs');
const path = require('path');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');

const FONTS = path.resolve(__dirname, '../fonts');
const MINI = process.env.MINI_URL || 'http://localhost:5173';
const ADMIN = process.env.ADMIN_URL || 'http://localhost:5174';
const API = process.env.API_URL || 'http://localhost:5000';

// Telefon ekrani: 393pt kenglik (iPhone 15 / Galaxy S24 ga yaqin)
const VW = 393;

// Admin -apple-system/Segoe UI/Roboto/Inter stekini ishlatadi; Linux'da birinchi
// uchtasi yo'q, shuning uchun Inter'ni lokal fayldan ulaymiz (iOS'dagi SF'ga eng yaqin)
const INTER_CSS = fs.readFileSync(path.join(FONTS, 'local.css'), 'utf8')
  .replace(/url\((f\d+\.woff2)\)/g, 'url(http://fonts.local/$1)');

async function route(ctx) {
  await ctx.route('**/*', async (r) => {
    const u = new URL(r.request().url());
    if (u.host === 'fonts.googleapis.com') {
      const css = fs.readFileSync(path.join(FONTS, 'onest.css'), 'utf8').replace(/url\((onest\d+\.woff2)\)/g, 'url(http://fonts.local/$1)');
      return r.fulfill({ status: 200, contentType: 'text/css', body: css });
    }
    if (u.host === 'fonts.local') return r.fulfill({ status: 200, contentType: 'font/woff2', body: fs.readFileSync(path.join(FONTS, path.basename(u.pathname))) });
    if (u.host === 'telegram.org') return r.fulfill({ status: 200, contentType: 'application/javascript', body: '' });
    if (u.hostname === 'localhost' || u.hostname === '127.0.0.1') return r.continue();
    return r.abort();
  });
}

async function launch() {
  return chromium.launch();
}

// dpr — screenshot aniqligi (kamera yaqinlashganda ham tiniq bo'lishi uchun 2.4)
async function phoneContext(browser, { height, dpr = 2.4, storage = {} } = {}) {
  const ctx = await browser.newContext({
    viewport: { width: VW, height }, deviceScaleFactor: dpr, isMobile: true, hasTouch: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
  });
  await route(ctx);
  await ctx.addInitScript((s) => { for (const k in s) localStorage.setItem(k, s[k]); }, storage);
  await ctx.addInitScript((css) => {
    document.addEventListener('DOMContentLoaded', () => { const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st); });
  }, INTER_CSS);
  return ctx;
}

async function adminToken() {
  const pw = process.env.ADMIN_PASSWORD || 'demo1234';
  const res = await fetch(API + '/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: pw }) });
  const data = await res.json();
  if (!data.token) throw new Error('Admin login xato: ' + JSON.stringify(data));
  return data.token;
}

module.exports = { launch, phoneContext, adminToken, MINI, ADMIN, API, VW, FONTS };
