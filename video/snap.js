// Tekshiruv uchun alohida kadrlar: node snap.js ios 1,5.5,9 -> build/snap/ios_5.5.png
const path = require('path'), fs = require('fs');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async () => {
  const dev = process.argv[2] || 'ios';
  const ts = (process.argv[3] || '0').split(',').map(Number);
  const out = path.join(__dirname, 'build/snap'); fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  p.on('pageerror', (e) => console.log('ERR', e.message)); p.on('console', (m) => console.log('LOG', m.text()));
  await p.goto('file://' + path.join(__dirname, `stage/index.html?scene=install&dev=${dev}`));
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
  for (const t of ts) { await p.evaluate((t) => render(t), t); await p.screenshot({ path: path.join(out, `${dev}_${t}.png`) }); }
  await b.close();
})();
