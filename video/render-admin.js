// Admin panel qo'llanmasi: HAQIQIY admin panelni (backend + mock baza) Playwright'da boshqaradi
// va har kadrda skrinshotni sahnadagi telefon ichiga qo'yadi.
//   1-o'tish (sinov): hamma harakatlar bajariladi, tugmalarning aniq joyi o'lchanadi,
//                     natija uchun do'kon (miniapp) skrinshotlari olinadi.
//   2-o'tish: baza tozalanib, xuddi shu harakatlar kadrma-kadr yozib olinadi.
// Foydalanish: node render-admin.js            -> video/LUSSO-Admin-mahsulot-qoshish.mp4
//              node render-admin.js --snap 6,12.5 -> build/snap/admin_<t>.png
const path = require('path'), fs = require('fs');
const { spawn, execFileSync } = require('child_process');
const B = require('./lib/browser');

const FPS = 30;
const BUILD = path.join(__dirname, 'build');
const SNAP = process.argv[2] === '--snap' ? process.argv[3].split(',').map(Number) : null;
const K = 472 / 393; // admin px -> telefon ekrani px
const PRODUCT = 'Prada Symbole Hexagon';
const PHOTO = path.join(__dirname, '../backend/uploads/mahsulot/prada-symbole-hexagon-muqwrz50-1.jpg');

/* ===================== vaqt jadvali ===================== */
const S = [4.4, 8.0, 11.0, 16.6, 23.0, 27.8, 31.8, 34.6, 40.0, 43.0, 47.6];
const OUTRO = 52.6, DUR = 57.6;
const TYPE = [
  { t0: 18.0, t1: 19.9, f: 'nameUz', text: PRODUCT, sug: ['Prada', 'Symbole'] },
  { t0: 20.7, t1: 22.4, f: 'nameRu', text: 'Очки Prada Symbole', sug: ['Очки', 'Prada'] },
  { t0: 24.1, t1: 24.7, f: 'brand', text: 'Prada', sug: ['Prada', 'Prado'] },
  { t0: 29.0, t1: 29.6, f: 'price', text: '99000', numeric: true },
  { t0: 30.2, t1: 30.9, f: 'oldPrice', text: '149000', numeric: true },
  { t0: 35.9, t1: 39.0, f: 'descUz', text: 'Olti burchakli ramka\nUV400 himoya\nOriginal quti bilan', sug: ['ramka', 'himoya'] },
  { t0: 41.3, t1: 41.9, f: 'variant', text: 'Qora', sug: ['Qora', 'Qoramtir'] },
];
const KBW = [{ a: 17.75, b: 22.65, layout: 'en' }, { a: 23.95, b: 25.0, layout: 'en' }, { a: 28.85, b: 31.1, layout: 'num' }, { a: 35.65, b: 39.3, layout: 'en' }, { a: 41.05, b: 42.3, layout: 'en' }];
const FOCUS = [[17.72, 'nameUz'], [20.42, 'nameRu'], [23.92, 'brand'], [28.82, 'price'], [30.02, 'oldPrice'], [35.62, 'descUz'], [41.02, 'variant']];
const BLUR = [22.7, 25.0, 31.1, 39.3, 42.3];
// modal ichida aylantirish: [t0, t1, maydon, maydon tepasining kerakli y (admin px)]
const SCROLL = [[16.7, 17.2, 'nameUz', 120], [23.05, 23.5, 'brand', 150], [27.85, 28.35, 'price', 150], [31.85, 32.3, 'isNew', 260], [34.65, 35.15, 'descUz', 110], [40.05, 40.6, 'variant', 190], [43.05, 43.6, 'save', 420]];
const MENUS = [
  { f: 'categoryId', open: 25.9, pickAt: 26.9, close: 27.05, value: 'glasses' },
  { f: 'isNew', open: 32.8, pickAt: 33.8, close: 33.95, value: '1' },
];
const PICK = { up: 12.35, pickAt: 13.6, addAt: 14.7, down: 14.85 };
const SAVE_AT = 44.4;
const MINI = { in: 47.8, tap: 49.3, sheet: 49.55 };
// bosishlar: q — admin sahifasidagi nishon, el — sahnadagi (tizim) element
const TAPS = [
  { q: { tab: 2 }, press: 6.0, hl: [5.0, 6.15], zoom: 1.7, rad: 22 },
  { q: { text: '+ Yangi mahsulot' }, press: 9.3, hl: [8.5, 9.45], zoom: 1.65, rad: 18 },
  { q: { text: 'Galereyadan rasm tanlash' }, press: 12.1, hl: [11.4, 12.25], zoom: 1.5 },
  { el: '#ph0', press: PICK.pickAt, hl: [13.0, 13.75], zoom: 1.45, rad: 4, pad: 2 },
  { el: '#pAdd', press: PICK.addAt, hl: [14.05, 14.85], zoom: 1.7, rad: 12 },
  { q: { f: 'nameUz' }, press: 17.7, hl: [17.25, 17.85], zoom: 1.35, hold: 0.3, rad: 18 },
  { q: { f: 'nameRu' }, press: 20.4, hl: [20.0, 20.55], zoom: 1.35, hold: 0.3, rad: 18 },
  { q: { f: 'brand' }, press: 23.9, hl: [23.5, 24.05], zoom: 1.35, hold: 0.3, rad: 18 },
  { q: { f: 'categoryId' }, press: 25.8, hl: [25.3, 25.95], zoom: 1.45, rad: 18 },
  { menuItem: [0, 1], press: 26.9, hl: [26.3, 27.0], zoom: 1.45, rad: 0, pad: 0 },
  { q: { f: 'price' }, press: 28.8, hl: [28.4, 28.95], zoom: 1.35, hold: 0.3, rad: 18 },
  { q: { f: 'oldPrice' }, press: 30.0, hl: [29.7, 30.15], zoom: 1.35, hold: 0.3, rad: 18 },
  { q: { f: 'isNew' }, press: 32.7, hl: [32.3, 32.85], zoom: 1.45, rad: 18 },
  { menuItem: [1, 1], press: 33.8, hl: [33.2, 33.9], zoom: 1.45, rad: 0, pad: 0 },
  { q: { f: 'descUz' }, press: 35.6, hl: [35.2, 35.75], zoom: 1.3, hold: 0.3, rad: 18 },
  { q: { f: 'variant' }, press: 41.0, hl: [40.6, 41.15], zoom: 1.4, hold: 0.3, rad: 16 },
  { q: { f: 'save' }, press: SAVE_AT, hl: [43.7, SAVE_AT + 0.15], zoom: 1.5, rad: 18 },
  { q: { row: 0 }, press: 45.9, hl: [45.3, 47.3], zoom: 1.3, finger: false, sound: false, hold: 1.0, rad: 14 },
  { mini: true, press: MINI.tap, hl: [48.5, MINI.tap + 0.15], zoom: 1.45, rad: 22 },
];
// yozish paytida kamera maydon va klaviaturani birga ko'rsatadi
const CAM = [[18.0, 19.95], [20.7, 22.45], [24.1, 24.75], [29.0, 30.95], [35.9, 39.05], [41.3, 41.95]].map(([a, b]) => ({ t0: a, t1: b, x: 236, y: 600, s: 1.06 }));

const HEADS = [
  { t: 'LUSSO Admin · qo‘llanma', a: 'Admin panelda', b: 'mahsulot <span class="serif">qo‘shish</span>' },
  { t: 'Admin panel · telefondan', a: 'Yangi mahsulot', b: '<span class="serif">qo‘shamiz</span>' },
  { t: 'Hammasi tayyor!', a: 'Mahsulot', b: '<span class="serif">do‘konda</span>' },
];
const CAPS = [
  { m: 'Pastdagi <q>🛍</q> bo‘limni oching', s: '«Mahsulotlar» — barcha tovarlar ro‘yxati' },
  { m: '<q>+ Yangi mahsulot</q> ni bosing', s: 'mahsulot qo‘shish oynasi ochiladi' },
  { m: 'Rasm qo‘shing', s: '«Galereyadan rasm tanlash» → rasm → «Добавить»' },
  { m: 'Nomini yozing', s: 'o‘zbekcha va ruscha (ruschasi ixtiyoriy)' },
  { m: 'Brend va kategoriya', s: 'kategoriya ro‘yxatdan tanlanadi' },
  { m: 'Narxlarni kiriting', s: 'yangi narx va chizilgan eski narx (₩)' },
  { m: '<q>NEW</q> belgisini yoqing', s: 'mahsulot «Yangi kelganlar»da chiqadi' },
  { m: 'Tavsif yozing', s: 'har bir qator — alohida band' },
  { m: 'Rang va zaxira', s: 'variant: Qora · zaxirada 10 dona' },
  { m: '<q>Saqlash</q> ni bosing', s: 'mahsulot darhol ro‘yxatda paydo bo‘ladi' },
  { m: 'Natija: mahsulot do‘konda', s: 'mijozlar uni shu zahoti ko‘radi' },
];

/* ===================== admin sahifasidagi yordamchilar ===================== */
const HELPERS = () => {
  const LABELS = { nameUz: 'Nomi (o', nameRu: 'Nomi (ruscha)', brand: 'Brend', categoryId: 'Kategoriya', price: 'Yangi narx', oldPrice: 'Eski narx', isNew: 'NEW belgisi', descUz: 'Tarkibi' };
  window.__field = (f) => {
    if (f === 'variant') return document.querySelector('.variant-row input.input');
    if (f === 'save') return [...document.querySelectorAll('.modal button')].find((b) => b.textContent.trim() === 'Saqlash');
    for (const row of document.querySelectorAll('.modal .form-row')) {
      const l = row.querySelector('.label');
      if (l && l.textContent.trim().startsWith(LABELS[f])) return row.querySelector('input,select,textarea');
    }
    return null;
  };
  window.__q = (q) => {
    if (q.tab !== undefined) return document.querySelectorAll('.side-btn')[q.tab];
    if (q.text) return [...document.querySelectorAll('button')].find((b) => b.textContent.trim().includes(q.text));
    if (q.f) return __field(q.f);
    if (q.row !== undefined) return document.querySelectorAll('tbody tr')[q.row];
    return null;
  };
  window.__rect = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; };
  window.__setVal = (el, v) => {
    const proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : el.tagName === 'SELECT' ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, v);
    el.dispatchEvent(new Event(el.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true }));
  };
  window.__scrollBy = (f, y) => { const bd = document.querySelector('.modal-backdrop'); const el = __field(f); if (!bd || !el) return null; return bd.scrollTop + el.getBoundingClientRect().top - y; };
  window.__scroll = (v) => { const bd = document.querySelector('.modal-backdrop'); if (bd) bd.scrollTop = v; };
};
const UPLOADED = [];
const toScreen = (r) => ({ x: r.x * K, y: 54 + r.y * K, w: r.w * K, h: r.h * K });

/* ===================== bir o'tish (sinov yoki yozish) ===================== */
async function cleanup() {
  const tok = await B.adminToken();
  const h = { Authorization: 'Bearer ' + tok };
  const list = await (await fetch(B.API + '/api/admin/products', { headers: h })).json();
  for (const p of list.filter((p) => p.nameUz === PRODUCT)) await fetch(B.API + '/api/admin/products/' + p.id, { method: 'DELETE', headers: h });
  return tok;
}

async function openAdmin(browser) {
  const tok = await cleanup();
  const ctx = await B.phoneContext(browser, { height: Math.round(948 / K), storage: { 'lusso-admin-token': tok } });
  await ctx.addInitScript(HELPERS);
  const A = await ctx.newPage();
  A.on('pageerror', (e) => console.log('ADMIN XATO', e.message));
  // video uchun yuklangan rasmlar oxirida o'chiriladi (repoga tushmasin)
  A.on('response', async (r) => { if (r.url().endsWith('/api/admin/upload')) { try { UPLOADED.push((await r.json()).url); } catch {} } });
  await A.goto(B.ADMIN);
  await A.waitForSelector('.side-btn');
  await A.waitForTimeout(1500);
  await A.evaluate(() => document.fonts.ready);
  await A.addStyleTag({ content: '*{caret-color:transparent!important;transition:none!important;animation:none!important}' });
  return { A, ctx };
}

function actions(A) {
  return [
    { t: 6.05, fade: true, fn: () => A.evaluate(() => __q({ tab: 2 }).click()), wait: 900 },
    { t: 9.35, fade: true, fn: () => A.evaluate(() => __q({ text: '+ Yangi mahsulot' }).click()), wait: 300 },
    { t: 15.0, fade: true, fn: async () => { await A.setInputFiles('input[type=file]', PHOTO); await A.waitForFunction(() => document.querySelector('.img-item img')?.complete, null, { timeout: 15000 }); } },
    ...FOCUS.map(([t, f]) => ({ t, fn: () => A.evaluate((f) => __field(f).focus({ preventScroll: true }), f) })),
    ...BLUR.map((t) => ({ t, fn: () => A.evaluate(() => document.activeElement && document.activeElement.blur()) })),
    ...MENUS.map((m) => ({ t: m.pickAt + 0.05, fn: () => A.evaluate(([f, v]) => { const el = __field(f); const opt = f === 'categoryId' ? [...el.options].find((o) => o.textContent.includes("Ko'zoynak")) : [...el.options].find((o) => o.value === v); __setVal(el, opt.value); }, [m.f, m.value]) })),
    { t: SAVE_AT + 0.05, fade: true, fn: () => A.evaluate(() => __field('save').click()), wait: 1200 },
  ].sort((a, b) => a.t - b.t);
}

/* ===================== 1-o'tish: o'lchash ===================== */
async function dryRun(browser) {
  const { A, ctx } = await openAdmin(browser);
  const acts = actions(A);
  const events = [...acts.map((a) => ({ t: a.t, a })), ...TAPS.filter((tp) => tp.q).map((tp) => ({ t: tp.press - 0.01, tp })),
    ...MENUS.map((m) => ({ t: m.open - 0.02, m })), ...TYPE.map((ty) => ({ t: ty.t1, ty })), ...SCROLL.map((s) => ({ t: s[0], s }))].sort((a, b) => a.t - b.t);
  for (const e of events) {
    if (e.a) { await e.a.fn(); if (e.a.wait) await A.waitForTimeout(e.a.wait); }
    if (e.ty) await A.evaluate(([f, v]) => __setVal(__field(f), v), [e.ty.f, e.ty.text]);
    if (e.s) { const v = await A.evaluate(([f, y]) => __scrollBy(f, y), [e.s[2], e.s[3]]); await A.evaluate((v) => __scroll(v), v); e.s.push(v); }
    if (e.tp) { await A.waitForTimeout(150); e.tp.at = toScreen(await A.evaluate((q) => __rect(__q(q)), e.tp.q)); }
    if (e.m) {
      const r = toScreen(await A.evaluate((f) => __rect(__field(f)), e.m.f));
      e.m.items = await A.evaluate((f) => [...__field(f).options].map((o) => o.textContent.trim()), e.m.f);
      e.m.from = await A.evaluate((f) => __field(f).selectedIndex, e.m.f);
      e.m.to = e.m.f === 'categoryId' ? e.m.items.findIndex((s) => s.includes("Ko'zoynak")) : 1;
      e.m.x = Math.max(10, Math.min(472 - 310, r.x)); e.m.y = r.y + r.h + 6;
    }
  }
  const stripBg = await A.evaluate(() => getComputedStyle(document.body).backgroundColor);
  await ctx.close();
  // natija: do'konda yangi mahsulot (haqiqiy miniapp)
  const mctx = await B.phoneContext(browser, { height: Math.round(948 / K), storage: { 'lusso-onboarded': '1', 'lusso-lang': 'uz' } });
  const M = await mctx.newPage();
  await M.goto(B.MINI);
  await M.waitForSelector('.cat-card', { timeout: 20000 });
  await M.waitForTimeout(1500);
  await M.locator('.cat-card', { hasText: "Ko'zoynak" }).click();
  await M.waitForSelector(`.card:has-text("${PRODUCT}")`, { timeout: 15000 });
  await M.waitForTimeout(2200);
  const card = M.locator('.card', { hasText: PRODUCT }).first();
  const miniTap = toScreen(await card.evaluate((el) => { const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; }));
  await M.screenshot({ path: path.join(BUILD, 'shots/admin-mini-a.png') });
  await card.click();
  await M.waitForTimeout(1800);
  await M.screenshot({ path: path.join(BUILD, 'shots/admin-mini-b.png') });
  await mctx.close();
  return { stripBg, miniTap };
}

/* ===================== 2-o'tish: yozish ===================== */
(async () => {
  fs.mkdirSync(path.join(BUILD, 'snap'), { recursive: true });
  const browser = await B.launch();
  console.log('1-o‘tish: o‘lchash...');
  const dry = await dryRun(browser);
  TAPS.forEach((tp) => {
    if (tp.at) tp.at = [tp.at.x, tp.at.y, tp.at.w, tp.at.h];
    if (tp.mini) tp.at = [dry.miniTap.x, dry.miniTap.y, dry.miniTap.w, dry.miniTap.h];
  });
  const TL = {
    heads: HEADS, caps: CAPS, steps: S, outro: OUTRO, dur: DUR, stripBg: dry.stripBg,
    taps: TAPS.map(({ q, ...r }) => r), cam: CAM, type: TYPE, kb: KBW,
    pick: PICK, menus: MENUS, saveAt: SAVE_AT, modal: [9.35, SAVE_AT + 0.05],
    mini: { ...MINI, a: '../build/shots/admin-mini-a.png', b: '../build/shots/admin-mini-b.png' },
  };

  console.log('2-o‘tish: yozish...');
  const { A } = await openAdmin(browser);
  const Sg = await (await browser.newContext({ viewport: { width: 1080, height: 1920 } })).newPage();
  Sg.on('pageerror', (e) => { console.error('SAHNA XATO', e.message); process.exit(1); });
  await Sg.goto('file://' + path.join(__dirname, 'stage/index.html?scene=admin'));
  await Sg.evaluate(() => document.fonts.ready);
  await Sg.evaluate((tl) => setup(tl), TL);
  fs.writeFileSync(path.join(BUILD, 'events-admin.json'), JSON.stringify(await Sg.evaluate(() => EVENTS)));

  const acts = actions(A);
  let ai = 0, lastScroll = null, settle = 0, fadeNext = false, sent = null;
  const typedN = TYPE.map(() => -1);
  const shot = async () => 'data:image/jpeg;base64,' + (await A.screenshot({ type: 'jpeg', quality: 92 })).toString('base64');
  const N = Math.round(DUR * FPS);
  const frames = SNAP ? [...Array(Math.round(Math.max(...SNAP) * FPS) + 1).keys()] : [...Array(N).keys()];
  const silent = path.join(BUILD, 'silent-admin.mp4');
  const ff = SNAP ? null : spawn('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-r', String(FPS), silent], { stdio: ['pipe', 'inherit', 'inherit'] });
  const SC = SCROLL.map((s) => ({ t0: s[0], t1: s[1], f: s[2], y: s[3], from: null, to: null }));
  let cur = null;

  for (const fi of frames) {
    const t = fi / FPS;
    let dirty = !cur;
    while (ai < acts.length && acts[ai].t <= t) {
      const a = acts[ai++];
      if (a.fade) fadeNext = true;
      await a.fn(); if (a.wait) await A.waitForTimeout(a.wait);
      dirty = true; settle = a.t + 0.5;
    }
    // aylantirish (silliq)
    for (const s of SC) {
      if (t >= s.t0 && s.from === null) { s.from = await A.evaluate(() => document.querySelector('.modal-backdrop')?.scrollTop || 0); s.to = await A.evaluate(([f, y]) => __scrollBy(f, y), [s.f, s.y]); }
      if (t >= s.t0 && t <= s.t1 + 0.04) {
        const v = Math.round(s.from + (s.to - s.from) * E_io(Math.min(1, (t - s.t0) / (s.t1 - s.t0))));
        if (v !== lastScroll) { lastScroll = v; dirty = true; await A.evaluate((v) => __scroll(v), v); }
      }
    }
    // harfma-harf yozish
    for (let k = 0; k < TYPE.length; k++) {
      const ty = TYPE[k];
      const n = Math.round(ty.text.length * Math.max(0, Math.min(1, (t - ty.t0) / (ty.t1 - ty.t0))));
      if (t >= ty.t0 && n !== typedN[k]) { typedN[k] = n; dirty = true; await A.evaluate(([f, v]) => __setVal(__field(f), v), [ty.f, ty.text.slice(0, n)]); }
    }
    if (t < settle) dirty = true;
    let src = null;
    if (dirty) { cur = await shot(); if (cur !== sent) src = cur; }
    if (!SNAP || SNAP.some((x) => Math.round(x * FPS) === fi)) {
      await Sg.evaluate(([src, fade, t]) => { setShot(src, fade, t); render(t); }, [src, fadeNext && !!src, t]);
      if (src) { sent = src; fadeNext = false; }
      const buf = await Sg.screenshot({ type: 'jpeg', quality: 94 });
      if (SNAP) fs.writeFileSync(path.join(BUILD, `snap/admin_${t.toFixed(2)}.png`), buf);
      else if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
    } else if (src) {
      // tekshiruv rejimi: kadr yozilmasa ham rasm sahnaga uzatiladi
      await Sg.evaluate(([src, fade, t]) => setShot(src, fade, t), [src, fadeNext, t]); sent = src; fadeNext = false;
    }
    if (!SNAP && fi % 150 === 0) console.log(`kadr ${fi}/${N}`);
  }
  if (ff) { ff.stdin.end(); await new Promise((r) => ff.on('close', r)); }
  await browser.close();
  await cleanup();
  for (const u of UPLOADED) fs.rmSync(path.join(__dirname, '../backend', u), { force: true });
  if (SNAP) return;
  const wav = path.join(BUILD, 'audio-admin.wav');
  execFileSync('node', [path.join(__dirname, 'audio.js'), path.join(BUILD, 'events-admin.json'), wav], { stdio: 'inherit' });
  const out = path.join(__dirname, 'LUSSO-Admin-mahsulot-qoshish.mp4');
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', silent, '-i', wav, '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', out]);
  console.log('✓', out);
})();

function E_io(x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
