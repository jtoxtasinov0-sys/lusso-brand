// Do'kon (miniapp) ekranlarini HAQIQIY koddan suratga oladi.
// Natija: build/shots/*.png — install videolarida telefon ichiga qo'yiladi.
// Ishga tushirishdan oldin: backend (5000) va miniapp (5173) ishlab turishi kerak (setup.sh).
const fs = require('fs');
const path = require('path');
const B = require('./lib/browser');

const OUT = path.join(__dirname, 'build/shots');
fs.mkdirSync(OUT, { recursive: true });

// Telefon ekrani sahnada 472×1002 px, 393pt → 1 pt = 1.201 px
const PT = 472 / 393;
const H = (px) => Math.round(px / PT);
// [nom, ko'rinadigan balandlik (sahna px), splash?]
const SHOTS = [
  ['ios-safari', 1002 - 54 - 116],  // Safari: status bar + pastki panel
  ['ios-app', 1002 - 54],           // ekrandagi ilova (standalone)
  ['and-chrome', 1002 - 44 - 64],   // Chrome: status bar + manzil qatori
  ['and-app', 1002 - 44],
];

async function shoot(browser, name, px, splash) {
  const ctx = await B.phoneContext(browser, { height: H(px), storage: { 'lusso-onboarded': '1', 'lusso-lang': 'uz' } });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.log(name, 'ERR', e.message));
  // Splash: React ishga tushmasin — index.html dagi logo ekrani qoladi
  if (splash) await page.route('**/src/main.jsx', (r) => r.fulfill({ status: 200, contentType: 'application/javascript', body: '' }));
  await page.goto(B.MINI);
  await page.evaluate(() => document.fonts.ready);
  if (splash) {
    await page.waitForTimeout(1200);
    await page.addStyleTag({ content: '#splash *{animation:none!important} #splash .bar::after{transform:translateX(70%)}' });
  } else {
    await page.waitForSelector('.hello', { timeout: 20000 });
    // barcha rasmlar yuklanib, kirish animatsiyalari tugashini kutamiz
    await page.waitForFunction(() => [...document.images].filter((i) => i.getBoundingClientRect().top < innerHeight && i.loading !== 'lazy').every((i) => i.complete), null, { timeout: 20000 });
    await page.waitForTimeout(2500);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);
  }
  const file = path.join(OUT, `${name}${splash ? '-splash' : ''}.png`);
  await page.screenshot({ path: file });
  console.log('✓', path.basename(file));
  await ctx.close();
}

(async () => {
  const browser = await B.launch();
  for (const [name, px] of SHOTS) await shoot(browser, name, px, false);
  await shoot(browser, 'ios-app', 1002 - 54, true);
  await shoot(browser, 'and-app', 1002 - 44, true);
  // ikonalar (Bosh ekran va qo'shish oynasi uchun) — miniapp/public dan
  for (const f of ['icon-180.png', 'icon-192.png', 'icon-512.png', 'logo.png']) fs.copyFileSync(path.join(__dirname, '../miniapp/public', f), path.join(OUT, f));
  await browser.close();
})();
