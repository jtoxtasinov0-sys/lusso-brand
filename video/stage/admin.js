/* Admin videosi: telefon ichidagi rasm — render-admin.js boshqarayotgan HAQIQIY admin
   panelning skrinshoti. Bu fayl faqat ustidagi tizim qatlamlarini (klaviatura, galereya,
   select menyusi) va umumiy sahnani chizadi. Vaqt jadvali (TL) Node'dan keladi. */
const SHOT = '../build/shots/';
const UP = '../../backend/uploads/';
let TL = null;
let curSrc = '', prevSrc = '', fadeAt = -9;

const css = `
#strip{position:absolute;left:0;right:0;top:0;height:54px;z-index:5}
#cur,#prev{top:54px;height:948px;object-fit:cover;object-position:top}
#prev{z-index:2}
#mini{position:absolute;left:0;top:0;width:472px;height:1002px;z-index:8;background:#f9f5ec}
#mini img{position:absolute;left:0;top:54px;width:472px}
.kb{z-index:60}
#pickDim{position:absolute;inset:0;background:rgba(0,0,0,.35);z-index:61}
#pick{position:absolute;left:0;right:0;top:60px;bottom:0;background:#fff;border-radius:22px 22px 0 0;z-index:62;overflow:hidden;color:#111}
#pick .ph{height:62px;display:flex;align-items:center;justify-content:space-between;padding:0 18px;font-size:17px}
#pick .ph b{font-weight:600}
#pick .ph span{color:#007AFF}
#pick .ph #pAdd{font-weight:600;padding:6px 8px;border-radius:9px}
#pick .seg{margin:0 18px 10px;height:34px;border-radius:9px;background:#eeeef0;display:flex;padding:2px;font-size:14px;font-weight:500}
#pick .seg div{flex:1;display:flex;align-items:center;justify-content:center;border-radius:7px}
#pick .seg div.on{background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.15)}
#pick .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:3px}
#pick .grid div{aspect-ratio:1;background-size:cover;background-position:center;position:relative}
#pick .chk{position:absolute;right:8px;bottom:8px;width:28px;height:28px;border-radius:50%;background:#007AFF;border:2px solid #fff;color:#fff;font-size:15px;font-weight:700;display:flex;align-items:center;justify-content:center}
#pick .grid div.sel:after{content:'';position:absolute;inset:0;box-shadow:inset 0 0 0 3px #007AFF}
#menu{position:absolute;width:300px;background:rgba(250,250,251,.98);border-radius:16px;box-shadow:0 12px 40px rgba(0,0,0,.3);z-index:63;overflow:hidden;transform-origin:30% 0;color:#111}
#menu div{height:48px;display:flex;align-items:center;padding:0 16px 0 44px;font-size:17px;border-bottom:1px solid #e1e1e4;position:relative;white-space:nowrap}
#menu div:last-child{border:none}
#menu div.on:before{content:'✓';position:absolute;left:17px;font-weight:600}
#menu div.hl{background:#e2e2e7}
`;

const GALLERY = ['mahsulot/prada-symbole-hexagon-muqwrz50-1.jpg', 'mahsulot/maybach-gold-classic-muqwrz50-1.jpg', 'mahsulot/tom-ford-0776-muqwrz50-1.jpg',
  'mahsulot/versace-rimless-medusa-muqwrz50-1.jpg', 'mahsulot/ray-ban-8397-polarized-muqwrz50-1.jpg', 'mahsulot/cartier-rimless-gold-muqwrz50-1.jpg',
  'mahsulot/prada-linea-rossa-0120-muqwrz50-1.jpg', 'mahsulot/burberry-rimless-pilot-muqwrz50-1.jpg', 'mahsulot/nike-air-force-1-low-white-muqwrz50-1.jpg',
  'mahsulot/ysl-libre-muqwrz50-1.jpg', 'mahsulot/tom-ford-oud-wood-muqwrz50-1.jpg', 'mahsulot/new-balance-327-sea-salt-muqwrz50-1.jpg',
  'mahsulot/ray-ban-8948-polarized-muqwrz50-1.jpg', 'mahsulot/maybach-23262-pilot-muqwrz50-1.jpg', 'mahsulot/versace-eros-parfum-muqwrz50-1.jpg'];

function screenHTML() {
  return `
    <div id="strip" style="background:${TL.stripBg}"><div id="stripDim" style="position:absolute;inset:0;background:rgba(42,31,16,.4)"></div></div>
    ${statusBar('#23160b', 'ios', '13:05')}
    <img class="shot" id="cur"><img class="shot" id="prev">
    <div id="mini"><img id="miniA"><img id="miniB"></div>
    ${kbHTML('ios', 'kb')}
    <div id="pickDim"></div>
    <div id="pick">
      <div class="ph"><span>Отменить</span><b>Фото</b><span id="pAdd">Добавить</span></div>
      <div class="seg"><div class="on">Фото</div><div>Альбомы</div></div>
      <div class="grid">${GALLERY.map((g, i) => `<div id="ph${i}" style="background-image:url('${UP}${g}')"></div>`).join('')}</div>
    </div>
    <div id="menu"></div>
    <div class="gbar" style="position:absolute;left:50%;bottom:9px;width:140px;height:5px;margin-left:-70px;border-radius:3px;background:#111;z-index:70"></div>`;
}

/* Node har kadrda chaqiradi: yangi skrinshot (bo'lsa) va almashtirish effekti */
function setShot(src, fade, t) {
  if (!src) return;
  if (fade && curSrc) { prevSrc = curSrc; fadeAt = t; $('#prev').src = prevSrc; }
  curSrc = src; $('#cur').src = src;
}

function render(t) {
  const L2 = TL;
  st($('#stripDim'), { opacity: Math.min(P(t, L2.modal[0], L2.modal[0] + 0.3, E.lin), 1 - P(t, L2.modal[1], L2.modal[1] + 0.3, E.lin)) });
  /* skrinshotlar almashinuvi */
  st($('#prev'), { opacity: prevSrc ? 1 - P(t, fadeAt, fadeAt + 0.3, E.lin) : 0 });
  /* klaviatura */
  let kbUp = 0, kbType = null;
  L2.kb.forEach((w) => { const v = Math.min(P(t, w.a, w.a + 0.3, E.out), 1 - P(t, w.b, w.b + 0.3, E.in)); if (v > kbUp) { kbUp = v; kbType = w; } });
  let key = '', lay = kbType ? kbType.layout : 'en', sug = ['', '', ''];
  L2.type.forEach((ty) => {
    const r = typed(t, ty);
    if (t >= ty.t0 - 0.05 && t < ty.t1 + 0.3) {
      lay = ty.numeric ? 'num' : layoutOf(ty.text[Math.max(0, r.n - 1)] || ty.text[0]);
      if (r.key) key = r.key;
      const word = r.text.split(/[\s\n]/).pop();
      if (!ty.numeric && word.length > 1) sug = [`«${word}»`, ty.sug?.[0] || '', ty.sug?.[1] || ''];
    }
  });
  const KB = $('#kb');
  kbDraw(KB, 'ios', lay, 'text', sug);
  kbPress(KB, 'ios', key);
  st(KB, { transform: `translateY(${(1 - kbUp) * 340}px)` });
  /* galereya */
  const pk = L2.pick;
  const up = Math.min(P(t, pk.up, pk.up + 0.45, E.out), 1 - P(t, pk.down, pk.down + 0.4, E.in));
  st($('#pick'), { transform: `translateY(${(1 - up) * 960}px)` });
  st($('#pickDim'), { opacity: up });
  const sel = t >= pk.pickAt;
  const ph0 = $('#ph0');
  ph0.className = sel ? 'sel' : '';
  ph0.innerHTML = sel ? `<span class="chk" style="transform:scale(${E.back(cl((t - pk.pickAt) / 0.18))})">1</span>` : '';
  st($('#pAdd'), { background: `rgba(0,122,255,${0.15 * W(t, pk.addAt - 0.05, pk.addAt + 0.3, 0.1)})` });
  /* select menyusi */
  const M = $('#menu');
  let mshow = null;
  L2.menus.forEach((m) => { if (t >= m.open && t < m.close + 0.25) mshow = m; });
  if (mshow || window.__measureMenu) {
    const m = mshow || window.__measureMenu;
    const op = window.__measure ? 1 : Math.min(P(t, m.open, m.open + 0.2, E.out), 1 - P(t, m.close, m.close + 0.2));
    const on = t >= m.pickAt ? m.to : m.from;
    M.innerHTML = m.items.map((s, k) => `<div class="${k === on ? 'on' : ''} ${t >= m.pickAt - 0.15 && t < m.close && k === m.to ? 'hl' : ''}" data-k="${k}">${s}</div>`).join('');
    st(M, { display: 'block', left: m.x + 'px', top: m.y + 'px', opacity: op, transform: `scale(${L(0.85, 1, window.__measure ? 1 : P(t, m.open, m.open + 0.25, E.out))})` });
  } else st(M, { display: 'none' });
  /* natija: do'kon (miniapp) */
  const mi = P(t, L2.mini.in, L2.mini.in + 0.5);
  st($('#mini'), { opacity: mi, visibility: mi > 0 ? 'visible' : 'hidden' });
  st($('#miniB'), { opacity: P(t, L2.mini.sheet, L2.mini.sheet + 0.35) });

  if (!window.__measure) renderCore(t);
}

function setup(tl) {
  TL = tl;
  const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s);
  buildStage({
    title: 'LUSSO Admin — mahsulot qo‘shish', heads: tl.heads, caps: tl.caps, label: 'Admin', steps: tl.steps, outro: tl.outro, dur: tl.dur,
    theme: THEMES.admin, word: 'ADMIN', outroImg: SHOT + 'logo.png', outroText: 'lusso-admin-sand.vercel.app', taps: tl.taps, cam: tl.cam,
  });
  $('#cam').innerHTML = phoneHTML('ios', screenHTML());
  $('#miniA').src = tl.mini.a; $('#miniB').src = tl.mini.b;
  kbDraw($('#kb'), 'ios', 'en', 'text');
  // galereya va menyu nishonlari sahnaning o'zida o'lchanadi
  tl.taps.forEach((tp) => {
    if (tp.menuItem !== undefined) { const m = tl.menus[tp.menuItem[0]]; tp.at = [m.x, m.y + tp.menuItem[1] * 48, 300, 48]; }
  });
  measureTaps(render);
  const ev = baseEvents();
  tl.type.forEach((ty) => ev.keys.push(...keyTimes(ty)));
  ev.up = [tl.pick.up, ...tl.menus.map((m) => m.open), ...tl.kb.map((w) => w.a)];
  ev.down = [tl.pick.down];
  ev.saves = [tl.saveAt + 0.25];
  ev.opens = [tl.mini.in];
  window.EVENTS = ev;
  window.DURATION = tl.dur;
}
window.render = render; window.setup = setup; window.setShot = setShot;
