/* LUSSO qo'llanma videolari — umumiy sahna mantig'i.
   Sahna (scene) CFG beradi: sarlavhalar, qadamlar, barmoq bosishlari, kamera.
   render(t) har bir kadr uchun hamma narsani joyiga qo'yadi (deterministik). */

/* ===================== yordamchilar ===================== */
const E = {
  lin: (x) => x,
  out: (x) => 1 - Math.pow(1 - x, 3),
  in: (x) => x * x * x,
  io: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
  sine: (x) => -(Math.cos(Math.PI * x) - 1) / 2,
  back: (x) => { const c1 = 1.6, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); },
};
const cl = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const P = (t, a, b, e = E.io) => (t <= a ? 0 : t >= b ? 1 : e((t - a) / (b - a)));
const L = (a, b, x) => a + (b - a) * x;
const W = (t, a, b, d = 0.35) => Math.min(P(t, a, a + d, E.out), 1 - P(t, b - d, b, E.out));
function K(t, kf, e = E.io) {
  if (t <= kf[0][0]) return kf[0][1];
  for (let i = 1; i < kf.length; i++) if (t <= kf[i][0]) { const [a, va] = kf[i - 1], [b, vb] = kf[i]; return L(va, vb, e((t - a) / (b - a))); }
  return kf[kf.length - 1][1];
}
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const st = (el, o) => { if (el) for (const k in o) el.style[k] = o[k]; };

/* telefon geometriyasi (sahna koordinatalari) */
const PH = { x: 290, y: 445, w: 500, h: 1030 };
const SCR = { x: PH.x + 14, y: PH.y + 14, w: 472, h: 1002 };
const CAM_C = { x: 540, y: 963 }; // kamera oynasi markazi

/* ===================== ikonalar ===================== */
const I = {
  sig: (c) => `<svg width="20" height="13" viewBox="0 0 20 13"><rect x="0" y="9" width="3.4" height="4" rx="1" fill="${c}"/><rect x="5.4" y="6" width="3.4" height="7" rx="1" fill="${c}"/><rect x="10.8" y="3" width="3.4" height="10" rx="1" fill="${c}"/><rect x="16.2" y="0" width="3.4" height="13" rx="1" fill="${c}"/></svg>`,
  wifi: (c) => `<svg width="19" height="14" viewBox="0 0 19 14"><path d="M9.5 13.2l2.6-3.1a4 4 0 00-5.2 0zM4.9 7.7a7 7 0 019.2 0l1.6-1.9a9.6 9.6 0 00-12.4 0zM1.8 4a11.8 11.8 0 0115.4 0l1.6-1.9A14.4 14.4 0 00.2 2.1z" fill="${c}"/></svg>`,
  bat: (c) => `<svg width="28" height="14" viewBox="0 0 28 14"><rect x="1" y="1" width="23" height="12" rx="4" stroke="${c}" stroke-width="1.4" fill="none" opacity=".45"/><rect x="3" y="3" width="17" height="8" rx="2" fill="${c}"/><rect x="25.5" y="4.5" width="2" height="5" rx="1" fill="${c}" opacity=".45"/></svg>`,
  batA: (c) => `<svg width="12" height="20" viewBox="0 0 12 20"><rect x="1" y="2.5" width="10" height="16.5" rx="2" stroke="${c}" stroke-width="1.4" fill="none"/><rect x="4" y="0.5" width="4" height="2" rx="1" fill="${c}"/><rect x="2.8" y="6" width="6.4" height="11.2" rx="1" fill="${c}"/></svg>`,
  share: (c) => `<svg width="30" height="32" viewBox="0 0 30 32"><path d="M15 3v18M8 10l7-7 7 7" stroke="${c}" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 14H6v15h18V14h-4" stroke="${c}" stroke-width="2.6" fill="none" stroke-linejoin="round"/></svg>`,
  back: (c) => `<svg width="30" height="30" viewBox="0 0 30 30"><path d="M19 4L8 15l11 11" stroke="${c}" stroke-width="2.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  fwd: (c) => `<svg width="30" height="30" viewBox="0 0 30 30"><path d="M11 4l11 11-11 11" stroke="${c}" stroke-width="2.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  book: (c) => `<svg width="32" height="30" viewBox="0 0 32 30"><path d="M16 7c-3-2.5-8-3-13-2v20c5-1 10-.5 13 2 3-2.5 8-3 13-2V5c-5-1-10-.5-13 2zM16 7v20" stroke="${c}" stroke-width="2.4" fill="none" stroke-linejoin="round"/></svg>`,
  tabs: (c) => `<svg width="30" height="30" viewBox="0 0 30 30"><rect x="3" y="8" width="19" height="19" rx="4" stroke="${c}" stroke-width="2.4" fill="none"/><path d="M8 4h14a4 4 0 014 4v14" stroke="${c}" stroke-width="2.4" fill="none"/></svg>`,
  search: (c, s = 18) => `<svg width="${s}" height="${s}" viewBox="0 0 18 18"><circle cx="7.5" cy="7.5" r="5.5" stroke="${c}" stroke-width="2" fill="none"/><path d="M12 12l4.5 4.5" stroke="${c}" stroke-width="2" stroke-linecap="round"/></svg>`,
  mic: (c) => `<svg width="16" height="22" viewBox="0 0 16 22"><rect x="4" y="1" width="8" height="13" rx="4" fill="${c}"/><path d="M1 10a7 7 0 0014 0M8 17v4" stroke="${c}" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`,
  globe: (c) => `<svg width="26" height="26" viewBox="0 0 26 26"><circle cx="13" cy="13" r="10.5" stroke="${c}" stroke-width="1.8" fill="none"/><path d="M2.5 13h21M13 2.5c-3.5 3-3.5 18 0 21M13 2.5c3.5 3 3.5 18 0 21" stroke="${c}" stroke-width="1.6" fill="none"/></svg>`,
  plusq: (c) => `<svg width="26" height="26" viewBox="0 0 26 26"><rect x="2" y="2" width="22" height="22" rx="6" stroke="${c}" stroke-width="2.2" fill="none"/><path d="M13 7.5v11M7.5 13h11" stroke="${c}" stroke-width="2.2" stroke-linecap="round"/></svg>`,
  star: (c) => `<svg width="26" height="26" viewBox="0 0 26 26"><path d="M13 2.5l3.2 6.7 7.3.9-5.4 5 1.4 7.3L13 18.8l-6.5 3.6 1.4-7.3-5.4-5 7.3-.9z" stroke="${c}" stroke-width="2" fill="none" stroke-linejoin="round"/></svg>`,
  bookO: (c) => `<svg width="26" height="26" viewBox="0 0 32 30"><path d="M16 7c-3-2.5-8-3-13-2v20c5-1 10-.5 13 2 3-2.5 8-3 13-2V5c-5-1-10-.5-13 2zM16 7v20" stroke="${c}" stroke-width="2.6" fill="none" stroke-linejoin="round"/></svg>`,
  find: (c) => `<svg width="26" height="26" viewBox="0 0 26 26"><path d="M5 2h12l4 4v8M5 2v22h9" stroke="${c}" stroke-width="2" fill="none" stroke-linejoin="round"/><circle cx="18" cy="19" r="4" stroke="${c}" stroke-width="2" fill="none"/><path d="M21 22l3 3" stroke="${c}" stroke-width="2" stroke-linecap="round"/></svg>`,
  pen: (c) => `<svg width="26" height="26" viewBox="0 0 26 26"><circle cx="13" cy="13" r="11" stroke="${c}" stroke-width="2" fill="none"/><path d="M9 20l4-12 4 12M10.5 16h5" stroke="${c}" stroke-width="2" fill="none"/></svg>`,
  print: (c) => `<svg width="26" height="26" viewBox="0 0 26 26"><rect x="3" y="9" width="20" height="10" rx="3" stroke="${c}" stroke-width="2" fill="none"/><path d="M7 9V3h12v6M7 15h12v8H7z" stroke="${c}" stroke-width="2" fill="none"/></svg>`,
  copy: (c) => `<svg width="26" height="26" viewBox="0 0 26 26"><rect x="8" y="8" width="14" height="16" rx="3" stroke="${c}" stroke-width="2.2" fill="none"/><path d="M5 18V5a3 3 0 013-3h9" stroke="${c}" stroke-width="2.2" fill="none"/></svg>`,
  glass: (c) => `<svg width="34" height="18" viewBox="0 0 34 18"><circle cx="8" cy="10" r="6" stroke="${c}" stroke-width="2.4" fill="none"/><circle cx="26" cy="10" r="6" stroke="${c}" stroke-width="2.4" fill="none"/><path d="M14 9h6" stroke="${c}" stroke-width="2.4"/></svg>`,
  bmk: (c) => `<svg width="22" height="26" viewBox="0 0 22 26"><path d="M3 2h16v22l-8-6-8 6z" stroke="${c}" stroke-width="2.4" fill="none" stroke-linejoin="round"/></svg>`,
  up: (c) => `<svg width="24" height="16" viewBox="0 0 24 16"><path d="M2 13L12 3l10 10" stroke="${c}" stroke-width="2.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  dots: (c) => `<svg width="8" height="26" viewBox="0 0 8 26"><circle cx="4" cy="4" r="2.6" fill="${c}"/><circle cx="4" cy="13" r="2.6" fill="${c}"/><circle cx="4" cy="22" r="2.6" fill="${c}"/></svg>`,
  home: (c) => `<svg width="26" height="26" viewBox="0 0 26 26"><path d="M3 12L13 3l10 9M6 10v13h5v-7h4v7h5V10" stroke="${c}" stroke-width="2.2" fill="none" stroke-linejoin="round"/></svg>`,
  lock: (c) => `<svg width="14" height="16" viewBox="0 0 16 18"><rect x="2" y="8" width="12" height="9" rx="2" fill="${c}"/><path d="M5 8V5a3 3 0 016 0v3" stroke="${c}" stroke-width="2" fill="none"/></svg>`,
  tune: (c) => `<svg width="22" height="22" viewBox="0 0 22 22"><path d="M3 6h9M16 6h3M3 16h3M10 16h9" stroke="${c}" stroke-width="2" stroke-linecap="round"/><circle cx="14" cy="6" r="2.4" stroke="${c}" stroke-width="2" fill="none"/><circle cx="8" cy="16" r="2.4" stroke="${c}" stroke-width="2" fill="none"/></svg>`,
  tabn: (c, n = 3) => `<svg width="24" height="24" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="4" stroke="${c}" stroke-width="2.2" fill="none"/><text x="12" y="16.5" font-size="11" font-weight="700" text-anchor="middle" fill="${c}" font-family="Inter">${n}</text></svg>`,
  addHome: (c) => `<svg width="22" height="24" viewBox="0 0 22 24"><rect x="3" y="1.5" width="16" height="21" rx="3" stroke="${c}" stroke-width="2" fill="none"/><path d="M11 8v8M7 12h8" stroke="${c}" stroke-width="2" stroke-linecap="round"/></svg>`,
  dl: (c) => `<svg width="22" height="22" viewBox="0 0 22 22"><path d="M11 2v13M5 10l6 6 6-6M3 20h16" stroke="${c}" stroke-width="2.2" fill="none" stroke-linecap="round"/></svg>`,
  info: (c) => `<svg width="22" height="22" viewBox="0 0 22 22"><circle cx="11" cy="11" r="9" stroke="${c}" stroke-width="2" fill="none"/><path d="M11 10v6M11 6v1" stroke="${c}" stroke-width="2.2" stroke-linecap="round"/></svg>`,
  reload: (c) => `<svg width="22" height="22" viewBox="0 0 22 22"><path d="M18 11a7 7 0 11-2-5M18 3v4h-4" stroke="${c}" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  gen: (c, k = 0) => {
    const g = [
      `<rect x="4" y="6" width="14" height="10" rx="2" stroke="${c}" stroke-width="2" fill="none"/>`,
      `<circle cx="11" cy="11" r="7.5" stroke="${c}" stroke-width="2" fill="none"/><path d="M11 7v4l3 2" stroke="${c}" stroke-width="2" fill="none" stroke-linecap="round"/>`,
      `<path d="M4 18L18 4M6 4h12v12" stroke="${c}" stroke-width="2" fill="none" stroke-linecap="round"/>`,
      `<path d="M5 3h12v16l-6-4-6 4z" stroke="${c}" stroke-width="2" fill="none" stroke-linejoin="round"/>`,
      `<circle cx="9.5" cy="9.5" r="6" stroke="${c}" stroke-width="2" fill="none"/><path d="M14 14l5 5" stroke="${c}" stroke-width="2" stroke-linecap="round"/>`,
      `<path d="M3 6h16M3 11h16M3 16h10" stroke="${c}" stroke-width="2" stroke-linecap="round"/>`,
    ][k % 6];
    return `<svg width="22" height="22" viewBox="0 0 22 22">${g}</svg>`;
  },
};
const statusBar = (c, dev, time = '9:41') => dev === 'and'
  ? `<div class="status" style="color:${c}"><span>${time}</span><span class="ic">${I.wifi(c)}${I.sig(c)}${I.batA(c)}<b style="font-size:14px;font-weight:500">86%</b></span></div>`
  : `<div class="status" style="color:${c}"><span>${time}</span><span class="ic">${I.sig(c)}${I.wifi(c)}${I.bat(c)}</span></div>`;

/* ===================== klaviatura ===================== */
const KB_LAYOUT = {
  en: ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'],
  ru: ['йцукенгшщзх', 'фывапролджэ', 'ячсмитьбю'],
  num: ['1234567890', '-/:;()₩&@"', '.,?!\''],
};
// kbHTML: dev — ios|and, mode — 'url' (Перейти) | 'text' (Ввод) | 'done' (Готово)
function kbHTML(dev, id) {
  return `<div class="kb ${dev}" id="${id}"></div>`;
}
const kbState = {};
function kbDraw(el, dev, layout, mode, sug) {
  const key = layout + mode + (sug || []).join('|');
  if (kbState[el.id] === key) return;
  kbState[el.id] = key;
  const rows = KB_LAYOUT[layout];
  const kw = dev === 'and' ? 40 : 41;
  const narrow = layout === 'ru' ? (dev === 'and' ? 35 : 37) : kw; // ruscha qatorda 11 ta tugma
  const k = (c, w) => `<span class="k" data-c="${c}" style="width:${w}px">${c}</span>`;
  const goLabel = mode === 'url' ? (dev === 'and' ? '→' : 'Перейти') : mode === 'done' ? 'Готово' : (dev === 'and' ? '↵' : 'Ввод');
  let h = '';
  h += `<div class="sug">${(sug || ['', '', '']).map((s) => `<span>${s}</span>`).join('')}</div>`;
  if (dev === 'and' && layout !== 'num') h += `<div class="r num">${'1234567890'.split('').map((c) => `<span class="k" data-c="${c}" style="width:40px">${c}</span>`).join('')}</div>`;
  rows.forEach((r, ri) => {
    const w = r.length > 10 ? narrow : kw;
    let inner = r.split('').map((c) => k(c, w)).join('');
    if (ri === 2) {
      const side = layout === 'ru' ? 44 : dev === 'and' ? 52 : 54;
      inner = `<span class="k g" data-c="shift" style="width:${side}px;font-size:20px">${layout === 'num' ? '#+=' : '⇧'}</span>` + (layout === 'num' ? '<span style="width:14px"></span>' : '') + inner + (layout === 'num' ? '<span style="width:14px"></span>' : '') + `<span class="k g" data-c="bs" style="width:${side}px;font-size:20px">⌫</span>`;
    }
    h += `<div class="r">${inner}</div>`;
  });
  const sym = layout === 'num' ? 'ABC' : '123';
  if (dev === 'and') {
    h += `<div class="r"><span class="k g" data-c="sym" style="width:58px;font-size:15px">!#1</span><span class="k g" style="width:40px;font-size:18px">,</span><span class="k g" style="width:40px;font-size:13px">${layout === 'ru' ? 'РУС' : 'EN'}</span><span class="k" data-c=" " style="width:142px;font-size:14px;color:#777">${layout === 'ru' ? 'Русский' : 'English'}</span><span class="k g" data-c="." style="width:40px;font-size:18px">.</span><span class="k go" data-c="enter" style="width:62px;font-size:22px">${goLabel}</span></div>`;
  } else {
    const space = mode === 'url' ? `<span class="k" data-c=" " style="width:${layout === 'num' ? 196 : 140}px;font-size:16px">пробел</span><span class="k" data-c="." style="width:41px">.</span>` : `<span class="k" data-c=" " style="width:${layout === 'num' ? 196 : 232}px;font-size:16px">пробел</span>`;
    h += `<div class="r"><span class="k g" data-c="sym" style="width:${mode === 'url' && layout !== 'num' ? 52 : 98}px;font-size:16px">${sym}</span>${mode === 'url' && layout !== 'num' ? '<span class="k g" style="width:40px;font-size:16px">😊</span>' : ''}${space}<span class="k ${mode === 'url' || mode === 'done' ? 'go' : 'g'}" data-c="enter" style="width:${mode === 'url' ? 96 : 98}px">${goLabel}</span></div>`;
    h += `<div class="bot">${I.globe('#55575c')}${I.mic('#55575c')}</div>`;
  }
  el.innerHTML = h;
}
// kbPress: c — bosilgan belgi (katta harf bo'lsa shift ham yonadi)
function kbPress(el, dev, c) {
  $$('.k.on', el).forEach((k) => k.classList.remove('on'));
  $$('.bub', el).forEach((b) => b.remove());
  if (!c) return;
  const low = c === '\n' ? 'enter' : c.toLowerCase();
  const k = $(`.k[data-c="${CSS.escape(low)}"]`, el);
  if (!k) return;
  k.classList.add('on');
  if (c !== low && c.toUpperCase() === c) $('.k[data-c="shift"]', el)?.classList.add('on');
  if (dev === 'ios' && low.length === 1 && low !== ' ' && !k.classList.contains('g')) {
    k.classList.remove('on');
    const b = document.createElement('span');
    b.className = 'bub'; b.textContent = c;
    k.appendChild(b);
  }
}
// matndan klaviatura tilini aniqlash (kirill → ru, raqam → num)
const layoutOf = (ch, numeric) => (numeric ? 'num' : /[а-яё]/i.test(ch || '') ? 'ru' : 'en');
// yozish holati: [t0,t1] oralig'ida text harfma-harf chiqadi
function typed(t, ty) {
  const n = Math.round(ty.text.length * P(t, ty.t0, ty.t1, E.lin));
  const active = t >= ty.t0 - 0.02 && t < ty.t1 + 0.12;
  // har bir harf bosilgandan keyin ~0.09s davomida tugma yonib turadi
  const per = (ty.t1 - ty.t0) / ty.text.length;
  const since = (t - ty.t0) - (n - 1) * per;
  const key = active && n > 0 && since < Math.min(0.11, per * 0.8) ? ty.text[n - 1] : '';
  return { n, text: ty.text.slice(0, Math.max(0, n)), key, active };
}
// har bir harf vaqti (ovoz effektlari uchun)
const keyTimes = (ty) => ty.text.split('').map((_, i) => +(ty.t0 + ((i + 1) / ty.text.length) * (ty.t1 - ty.t0)).toFixed(3));

/* ===================== sahna qurish ===================== */
let CFG = null;
const TAP_T = []; // o'lchangan nishonlar

function buildStage(cfg) {
  CFG = cfg;
  document.title = cfg.title;
  $('#head').innerHTML = cfg.heads.map((h, i) => `<div class="hblock" id="h${i}"><div class="tag serif">${h.t}</div><div class="line"><div>${h.a}</div></div><div class="line"><div>${h.b}</div></div></div>`).join('');
  $('#cap').innerHTML = cfg.caps.map((c, i) => `<div class="cblock"><div class="meta"><span class="n">${i + 1}</span>${cfg.label} · ${i + 1}/${cfg.caps.length}-qadam</div><div class="main">${c.m}</div><div class="sub">${c.s}</div></div>`).join('');
  $('#dots').innerHTML = cfg.caps.map(() => '<i></i>').join('');
  const th = cfg.theme, root = document.documentElement.style;
  root.setProperty('--bg', th.bg); root.setProperty('--word', th.word);
  root.setProperty('--soft', th.soft); root.setProperty('--accent', th.accent);
  root.setProperty('--noise', `url("data:image/svg+xml;utf8,${encodeURIComponent(NOISE)}")`);
  $('#outro').innerHTML = `<img src="${cfg.outroImg}"><br><div class="u">${cfg.outroText}</div>`;
}

/* bosishlar: {el (selector) | at:[x,y,w,h], press, show:[a,b], zoom, hl:[a,b]} */
function measureTaps(sceneRender) {
  window.__measure = true;
  const scr = $('#screen');
  CFG.taps.forEach((tp) => {
    if (tp.at) { tp.r = { x: tp.at[0], y: tp.at[1], w: tp.at[2] || 0, h: tp.at[3] || 0 }; return; }
    sceneRender(tp.press - 0.02);
    const sr = scr.getBoundingClientRect(), k = sr.width / SCR.w;
    const er = $(tp.el).getBoundingClientRect();
    tp.r = { x: (er.left - sr.left) / k, y: (er.top - sr.top) / k, w: er.width / k, h: er.height / k };
  });
  window.__measure = false;
  CFG.taps.forEach((tp) => { tp.cx = tp.r.x + tp.r.w / 2 + (tp.dx || 0); tp.cy = tp.r.y + tp.r.h / 2 + (tp.dy || 0); });
  buildCamera();
}

/* kamera: har bir bosishda tugmaga yaqinlashadi, keyin uzoqlashadi */
let CAMKF = null;
function buildCamera() {
  const wins = CFG.taps.filter((tp) => tp.zoom !== 0).map((tp) => ({
    t0: tp.press - (tp.lead ?? 0.45), t1: tp.press + (tp.hold ?? 0.55), x: tp.zx ?? tp.cx, y: tp.zy ?? tp.cy, s: tp.zoom || 1.55,
  })).concat(CFG.cam || []).sort((a, b) => a.t0 - b.t0);
  const kf = [[0, { x: 236, y: 500, s: 1 }]];
  const IN = 0.6, OUT = 0.75;
  wins.forEach((w, i) => {
    const prev = wins[i - 1];
    if (prev && w.t0 - IN - prev.t1 < OUT * 0.9) {
      // keyingi nishon yaqin — uzoqlashmasdan to'g'ridan-to'g'ri suriladi
      const mid = Math.max(prev.t1 + 0.05, Math.min(w.t0 - 0.35, prev.t1 + 0.25));
      kf.push([mid, { ...prev }]);
    } else {
      if (prev) kf.push([prev.t1 + OUT, { x: prev.x, y: prev.y, s: 1 }]);
      kf.push([w.t0 - IN, { x: w.x, y: w.y, s: 1 }]);
    }
    kf.push([w.t0, w]); kf.push([w.t1, w]);
  });
  const last = wins[wins.length - 1];
  if (last) kf.push([last.t1 + OUT, { x: last.x, y: last.y, s: 1 }]);
  // vaqt bo'yicha tartiblangan, takrorlanmagan
  CAMKF = kf.filter((k, i) => i === 0 || k[0] > kf[i - 1][0]);
}
function camAt(t) {
  const f = (key) => K(t, CAMKF.map((k) => [k[0], k[1][key]]), E.sine);
  return { x: f('x'), y: f('y'), s: f('s') };
}

/* ===================== kadr ===================== */
function renderCore(t, extra = {}) {
  const C = CFG, steps = C.steps, OUTRO = C.outro, DUR = C.dur;
  /* sarlavhalar */
  const hw = [[0, steps[0] - 0.1], [steps[0] - 0.1, OUTRO + 0.3], [OUTRO + 0.3, 99]];
  hw.forEach(([a, b], i) => {
    const el = $('#h' + i); if (!el) return;
    const inP = i === 0 ? P(t, 0.25, 1.3, E.out) : P(t, a, a + 0.8, E.out);
    const outP = P(t, b - 0.35, b + 0.15, E.in);
    st($('.tag', el), { opacity: inP * (1 - outP), transform: `translateY(${(1 - inP) * 20}px)` });
    $$('.line > div', el).forEach((ln, k) => {
      const ip = i === 0 ? P(t, 0.35 + k * 0.12, 1.35 + k * 0.12, E.out) : P(t, a + 0.05 + k * 0.1, a + 0.85 + k * 0.1, E.out);
      st(ln, { transform: `translateY(${(1 - ip) * 124 - outP * 124}px)` });
    });
    el.style.visibility = t < a - 0.5 || t > b + 0.3 ? 'hidden' : 'visible';
  });

  /* sahna: intro'da pastdan ko'tariladi, oxirida biroz uzoqlashadi */
  const rise = P(t, 0.3, 2.0, E.out), fin = P(t, OUTRO, OUTRO + 1.4, E.io);
  const base = `translate(${540 * (1 - L(1, 0.84, fin))}px,${L(320, 0, rise) + L(0, -40, fin) + 960 * (1 - L(1, 0.84, fin))}px) scale(${L(1, 0.84, fin)})`;
  st($('#view'), { opacity: P(t, 0.15, 1.2, E.out) });
  /* telefon: 3D burchakda, postament ustida (rasmdagidek); kamera yaqinlashganda to'g'rilanadi */
  const zoomNow = window.__measure ? 1 : camAt(t).s;
  const z = cl((zoomNow - 1) / 0.35), calm = 1 - z;
  const swing = P(t, 0.4, 2.4, E.out);
  const ry = L(38, POSE.ry, swing) * (1 - z * 0.75) + L(0, 6, fin), rx = L(10, POSE.rx, swing) * (1 - z * 0.75), rz = L(-12, POSE.rz, swing) * (1 - z * 0.75);
  const bob = Math.sin(t * 1.1) * 4 * calm;
  if (window.__measure) st($('#phone'), { transform: 'none' });
  else st($('#phone'), { transform: `translateY(${bob}px) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg)` });
  st($('#word'), { transform: `translateX(${Math.sin(t * 0.18) * 14}px)` });

  /* kamera: probe orqali nishonning sahnadagi haqiqiy joyi o'lchanadi */
  if (window.__measure) st($('#cam'), { transform: 'none' });
  else {
    const c = camAt(t), cam = $('#cam'), pr = $('#probe');
    cam.style.transform = base;
    st(pr, { left: c.x + 'px', top: c.y + 'px' });
    const r = pr.getBoundingClientRect(), px = r.left, py = r.top;
    const f = cl((c.s - 1) / 0.5) * 0.66;
    const qx = px + (CAM_C.x - px) * f, qy = py + (CAM_C.y - py) * f;
    cam.style.transform = `translate(${qx - c.s * px}px,${qy - c.s * py}px) scale(${c.s}) ${base}`;
  }

  /* barmoq */
  const fg = { op: 0, x: 0, y: 0, sc: 1, r: [[0, 0], [0, 0]] };
  C.taps.forEach((tp) => {
    if (!tp.r || tp.finger === false) return;
    const show = tp.show || [tp.press - 1.1, tp.press + 0.6];
    if (t < show[0] - 0.01 || t > show[1] + 0.01) return;
    const fx = tp.cx + (tp.fx ?? 70), fy = tp.cy + (tp.fy ?? 180);
    const m = P(t, show[0], tp.press - 0.2, E.io);
    fg.op = W(t, show[0], show[1], 0.25); fg.x = L(fx, tp.cx, m); fg.y = L(fy, tp.cy, m);
    const d = t - tp.press;
    if (d > -0.15 && d < 0.25) fg.sc = 1 - 0.24 * Math.sin(cl((d + 0.15) / 0.4) * Math.PI);
    [0, 0.14].forEach((o, j) => { const e = d - o; if (e >= 0 && e < 0.75) fg.r[j] = [L(0.5, 2.7, E.out(e / 0.75)), (1 - e / 0.75) * 0.95]; });
  });
  if (extra.finger) Object.assign(fg, extra.finger);
  const F = $('#finger');
  st(F, { opacity: fg.op, transform: `translate(${fg.x}px,${fg.y}px)` });
  st($('.dot', F), { transform: `scale(${fg.sc})` });
  $$('.rip', F).forEach((r, j) => st(r, { transform: `scale(${fg.r[j][0]})`, opacity: fg.r[j][1] }));

  /* qizil ramka */
  let hl = null;
  C.taps.forEach((tp) => {
    if (!tp.hl || !tp.r) return;
    const [a, b] = tp.hl;
    if (t >= a && t <= b) hl = { tp, op: W(t, a, b, 0.25) };
  });
  const H = $('#hl');
  if (hl) {
    const { r } = hl.tp, pad = hl.tp.pad ?? 6;
    const pulse = 1 + Math.sin(t * 7) * 0.012;
    st(H, { display: 'block', left: r.x - pad + 'px', top: r.y - pad + 'px', width: r.w + pad * 2 + 'px', height: r.h + pad * 2 + 'px', borderRadius: (hl.tp.rad ?? 16) + 'px', opacity: hl.op, transform: `scale(${pulse})` });
  } else st(H, { display: 'none' });

  /* izohlar */
  const caps = $$('.cblock');
  caps.forEach((el, k) => {
    const s = steps[k] + 0.05, e = (k + 1 < caps.length ? steps[k + 1] : OUTRO) - 0.05;
    const w = W(t, s, e, 0.35), inP = P(t, s, s + 0.5, E.out);
    st(el, { opacity: w, transform: `translateY(${(1 - inP) * 26}px)`, visibility: w > 0 ? 'visible' : 'hidden' });
  });
  let cur = -1;
  for (let j = 0; j < caps.length; j++) if (t >= steps[j] && t < (j + 1 < caps.length ? steps[j + 1] : OUTRO)) cur = j;
  $$('#dots i').forEach((d, j) => st(d, { width: (j === cur ? 40 : 12) + 'px', background: j <= cur ? '#fff' : 'rgba(255,255,255,.25)' }));
  st($('#dots'), { opacity: W(t, steps[0] - 0.2, OUTRO + 0.2, 0.3) });

  /* yakun */
  const o = P(t, OUTRO + 0.7, OUTRO + 1.5, E.out);
  st($('#outro'), { opacity: o, transform: `translateY(${(1 - o) * 30}px)` });
  st($('#fade'), { opacity: 1 - P(t, 0, 0.35) + P(t, DUR - 0.6, DUR) });
}

/* ovoz effektlari uchun voqealar ro'yxati */
function baseEvents() {
  const C = CFG;
  return {
    dur: C.dur,
    taps: C.taps.filter((tp) => tp.sound !== false).map((tp) => tp.press),
    steps: C.steps.slice(),
    heads: [C.steps[0] - 0.1, C.outro + 0.3],
    done: C.outro + 0.15,
    keys: [], up: [], down: [], pops: [], opens: [],
  };
}

/* umumiy telefon qobig'i */
function phoneHTML(dev, inner) {
  const btns = dev === 'ios'
    ? '<div class="pbtn" style="left:-3px;top:200px;height:44px"></div><div class="pbtn" style="left:-3px;top:270px;height:80px"></div><div class="pbtn" style="left:-3px;top:365px;height:80px"></div><div class="pbtn" style="right:-3px;top:300px;height:120px"></div>'
    : '<div class="pbtn" style="right:-3px;top:230px;height:110px"></div><div class="pbtn" style="right:-3px;top:370px;height:60px"></div>';
  return sceneryHTML() + `<div class="phone ${dev}" id="phone"><div class="shadow"></div>${btns}<div class="frame"></div><div class="bezel"></div>
    <div class="screen" id="screen">${dev === 'ios' ? '<div class="island"></div>' : '<div class="hole"></div>'}${inner}
      <div class="hl" id="hl"></div><div id="probe" style="position:absolute;width:0;height:0"></div>
      <div class="finger" id="finger"><i class="rip"></i><i class="rip"></i><b class="dot"></b></div>
    </div></div>`;
}

/* telefon holati (qadamlar davomida) */
const POSE = { rx: 3, ry: 13, rz: -3 };

/* beton fakturasi (SVG shovqin) */
const NOISE = `<svg xmlns='http://www.w3.org/2000/svg' width='260' height='260'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' seed='7'/><feColorMatrix values='0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 .5  0 0 0 .55 0'/></filter><rect width='100%' height='100%' filter='url(#n)'/><filter id='m'><feTurbulence type='fractalNoise' baseFrequency='.04' numOctaves='2' seed='3'/><feColorMatrix values='0 0 0 0 .3  0 0 0 0 .3  0 0 0 0 .3  0 0 0 .35 0'/></filter><rect width='100%' height='100%' filter='url(#m)'/></svg>`;

/* beton blok: old yuz + yuqori yuz + yon yuz */
function block(x, y, w, h, d, shade = 0.12) {
  return `<div class="blk" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;--blkShade:${shade}">
    <div class="top" style="top:${-d * 0.42}px;height:${d * 0.42}px;transform:skewX(-48deg)"></div>
    <div class="side" style="left:${w}px;width:${d * 0.47}px;transform:skewY(-42deg);transform-origin:0 0"></div></div>`;
}
const rod = (x, y, len, ang) => `<div class="rod" style="left:${x}px;top:${y}px;width:${len}px;transform:rotate(${ang}deg)"></div>`;
function sceneryHTML() {
  return `<div id="word">${(CFG && CFG.word) || 'LUSSO'}</div>
    ${block(96, 1010, 600, 470, 120, 0.3)}
    ${block(830, 1090, 260, 390, 90, 0.38)}
    ${rod(-60, 1150, 520, 13)}
    ${block(214, 1462, 960, 62, 110, 0.12)}
    ${rod(520, 1420, 700, 12)}
    <div class="pshadow"></div>`;
}

/* har bir video o'z rangida (gradient yo'q — tekis fon, rasmdagidek) */
const THEMES = {
  ios: { bg: '#0f1838', word: '#24356b', soft: 'rgba(255,255,255,.62)', accent: '#8db8ff' },
  and: { bg: '#0c2b27', word: '#1d4f47', soft: 'rgba(255,255,255,.62)', accent: '#63e2c3' },
  admin: { bg: '#2c0f1d', word: '#53223a', soft: 'rgba(255,255,255,.62)', accent: '#f3c46b' },
};
