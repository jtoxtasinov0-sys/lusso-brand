/* O'rnatish videolari: iPhone (Safari) va Samsung (Chrome).
   Telefon ichidagi do'kon — capture-mini.js olgan HAQIQIY skrinshotlar (../build/shots).
   Telefon tizim menyulari ruscha, izohlar o'zbekcha. */
const DEV = new URLSearchParams(location.search).get('dev') === 'and' ? 'and' : 'ios';
const SHOT = '../build/shots/';
const URL_TEXT = 'lusso-miniapp.vercel.app';
const APP_BG = '#f9f5ec'; // do'kon yuqori qismining rangi (status bar ostida)

/* ---------------- vaqt jadvali ---------------- */
const T = { s: [4.4, 11.2, 13.9, 16.9, 20.6], outro: 25.2, dur: 30.2 };
const S = T.s;
const TL = {
  toBrowser: [S[0] + 0.1, S[0] + 0.55],
  urlTap: S[0] + 1.5,
  kbUp: [S[0] + 1.65, S[0] + 1.95],
  type: { t0: S[0] + 2.1, t1: S[0] + 4.2, text: URL_TEXT },
  goTap: S[0] + 4.7,
  load: [S[0] + 4.8, S[0] + 6.0],
  splash: [S[0] + 4.95, S[0] + 5.85],
  menuTap: S[1] + 1.4,
  menuUp: [S[1] + 1.55, S[1] + 2.05],
  rowTap: S[2] + 1.5,
  dlgUp: [S[2] + 1.9, S[2] + 2.4],
  addTap: S[3] + 1.3,
  dlgDown: [S[3] + 1.6, S[3] + 2.0],
  toHome: [S[3] + 1.8, S[3] + 2.4],
  pop: [S[3] + 2.6, S[3] + 3.2],
  iconTap: S[4] + 1.4,
  open: [S[4] + 1.55, S[4] + 2.15],
  appIn: [S[4] + 2.9, S[4] + 3.3],
};

/* ---------------- uy ekrani ikonalari (brendsiz, ruscha nomlar) ---------------- */
const GEN = [['#34C759', 'Телефон'], ['#0A84FF', 'Сообщения'], ['#FF9F0A', 'Фото'], ['#5E5CE6', 'Камера'],
  ['#FF375F', 'Музыка'], ['#30B0C7', 'Погода'], ['#8E8E93', 'Настройки'], ['#E6B800', 'Заметки'],
  ['#64D2FF', 'Почта'], ['#BF5AF2', 'Подкасты'], ['#FF453A', 'Календарь']];
const glyph = (i) => { const s = ['<circle cx="20" cy="20" r="9" fill="#fff"/>', '<rect x="11" y="11" width="18" height="18" rx="5" fill="#fff"/>', '<path d="M20 9l11 20H9z" fill="#fff"/>', '<path d="M9 20h22M20 9v22" stroke="#fff" stroke-width="5" stroke-linecap="round"/>'][i % 4]; return `<svg width="40" height="40" viewBox="0 0 40 40" opacity=".92">${s}</svg>`; };
const SLOT = DEV === 'ios' ? { x0: 66, dx: 113.3, y0: 120, dy: 124 } : { x0: 64, dx: 115, y0: 300, dy: 124 };
const ICON_SLOT = { x: SLOT.x0 + 3 * SLOT.dx, y: SLOT.y0 + 2 * SLOT.dy + 37 };
function homeGrid() {
  let h = '';
  GEN.forEach(([c, n], i) => { const r = Math.floor(i / 4), k = i % 4;
    h += `<div class="hicon" style="left:${SLOT.x0 + k * SLOT.dx - 37}px;top:${SLOT.y0 + r * SLOT.dy}px"><i style="background:linear-gradient(160deg,${c},${c}cc)">${glyph(i)}</i><span>${n}</span></div>`; });
  h += `<div class="hicon lusso" id="hIcon" style="left:${ICON_SLOT.x - 37}px;top:${ICON_SLOT.y - 37}px"><i><img src="${SHOT}icon-${DEV === 'ios' ? 180 : 192}.png"></i><span>${DEV === 'ios' ? 'LUSSO BRAND KR' : 'LUSSO'}</span></div>`;
  return h;
}

const css = `
.hicon{position:absolute;width:74px;text-align:center;color:#fff;font-size:12.5px;font-weight:500;text-shadow:0 1px 3px rgba(0,0,0,.3)}
.hicon i{display:flex;width:74px;height:74px;border-radius:18px;margin-bottom:6px;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,.15);overflow:hidden}
.and .hicon i{border-radius:50%}
.hicon i img{width:100%;height:100%}
.hicon span{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;width:84px;margin-left:-5px}
.dock{position:absolute;left:14px;right:14px;bottom:18px;height:104px;border-radius:36px;background:rgba(255,255,255,.26)}
.gbar{position:absolute;left:50%;bottom:9px;width:140px;height:5px;margin-left:-70px;border-radius:3px;z-index:70}
.dim{position:absolute;inset:0;background:rgba(0,0,0,.34)}
.prog{position:absolute;left:0;height:3px;background:#0a84ff;border-radius:2px}
/* iOS Safari */
.sbar{position:absolute;left:0;right:0;bottom:0;height:116px;background:rgba(249,249,251,.97);border-top:1px solid #dcdce0;color:#007AFF;z-index:30}
.sbar .url{position:absolute;left:16px;right:16px;top:10px;height:48px;border-radius:14px;background:#E6E6EB;display:flex;align-items:center;justify-content:space-between;padding:0 16px;color:#111;font-size:17px;overflow:hidden}
.sbar .url b{font-weight:500;display:flex;align-items:center;gap:6px}
.sbar .url .ph{color:#8a8a8e;font-weight:400}
.sbar .tools span{position:absolute;top:70px}
.ebar{position:absolute;left:0;right:0;height:66px;background:#f2f2f6;z-index:61;display:flex;align-items:center;padding:0 14px;gap:12px}
.ebar .f{flex:1;height:46px;border-radius:13px;background:#fff;display:flex;align-items:center;gap:8px;padding:0 12px;font-size:17px;color:#111;box-shadow:0 1px 2px rgba(0,0,0,.08)}
.ebar .c{color:#007AFF;font-size:17px}
.caret{display:inline-block;width:2px;height:22px;background:#0a84ff;margin-left:1px;vertical-align:middle}
.start{position:absolute;left:0;right:0;top:54px;bottom:116px;background:#f2f2f7;color:#111}
.start h4{font-size:22px;font-weight:700;margin:26px 20px 16px}
.tiles{display:grid;grid-template-columns:repeat(4,1fr);gap:18px 0;padding:0 8px}
.tiles div{text-align:center;font-size:12.5px;color:#333}
.tiles i{display:flex;width:64px;height:64px;border-radius:15px;margin:0 auto 7px;align-items:center;justify-content:center;font-style:normal;font-size:26px;font-weight:700;color:#fff}
.privacy{margin:30px 16px 0;background:#fff;border-radius:14px;padding:16px;font-size:14px;color:#555;line-height:1.35}
.privacy b{display:block;color:#111;font-size:16px;margin-bottom:4px}
.sheet{position:absolute;left:0;right:0;top:86px;height:1000px;background:#F2F2F7;border-radius:30px 30px 0 0;color:#111;z-index:40}
.sheet .row{position:absolute;left:0;right:0}
.sh-head{top:22px;height:80px;display:flex;align-items:center;gap:14px;padding:0 20px}
.sh-head .ico{width:66px;height:66px;border-radius:15px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.12)}
.sh-head .ico img{width:100%;height:100%}
.sh-head .nm{font-weight:700;font-size:18px}
.sh-head .u{color:#8a8a8e;font-size:15px;margin-top:2px}
.sh-head .x{margin-left:auto;width:34px;height:34px;border-radius:50%;background:#E3E3E8;display:flex;align-items:center;justify-content:center;color:#666;font-size:17px;font-weight:700}
.apps{top:136px;display:flex;justify-content:space-around;padding:0 6px}
.apps div{text-align:center;font-size:13px;color:#222;width:100px}
.apps i{display:block;width:64px;height:64px;border-radius:50%;margin:0 auto 8px}
.divi{top:252px;left:20px!important;right:20px!important;height:1px;background:#d6d6db}
.grp{left:16px!important;right:16px!important;background:#fff;border-radius:14px;overflow:hidden}
.grp div{height:56px;display:flex;align-items:center;gap:16px;padding:0 16px;font-size:17px;border-bottom:1px solid #e6e6ea}
.grp div:last-child{border-bottom:none}
.grp div.on{background:#dcdce2}
.addv{position:absolute;left:0;right:0;top:56px;height:1000px;background:#F2F2F7;border-radius:30px 30px 0 0;color:#111;z-index:45}
.addv .nav{height:64px;display:flex;align-items:center;justify-content:space-between;padding:0 18px;font-size:17px}
.addv .nav .c{color:#007AFF}
.addv .nav .t{font-weight:600;font-size:16px}
.addv .nav .a{color:#007AFF;font-weight:600;padding:6px 10px;border-radius:10px}
.addv .card{margin:14px 16px 0;background:#fff;border-radius:14px;display:flex;gap:14px;padding:14px}
.addv .card img{width:76px;height:76px;border-radius:18px}
.addv .card .f{flex:1;min-width:0}
.addv .card .f div{height:38px;border-bottom:1px solid #e6e6ea;display:flex;align-items:center;font-size:17px;white-space:nowrap}
.addv .card .f div:last-child{border:none;color:#8a8a8e;font-size:15px}
.addv .note{margin:10px 30px 0;color:#8a8a8e;font-size:13px;line-height:1.35}
.addv .tg{margin:22px 16px 0;background:#fff;border-radius:14px;height:52px;display:flex;align-items:center;justify-content:space-between;padding:0 16px;font-size:17px}
.toggle{width:52px;height:32px;border-radius:16px;background:#34C759;position:relative;flex:none}
.toggle:after{content:'';position:absolute;right:2px;top:2px;width:28px;height:28px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.25)}
/* Android Chrome */
.cbar{position:absolute;left:0;right:0;top:44px;height:64px;background:#fff;border-bottom:1px solid #e3e3e3;z-index:30}
.cbar .url{position:absolute;left:58px;width:296px;top:10px;height:44px;border-radius:22px;background:#F1F3F4;display:flex;align-items:center;gap:10px;padding:0 14px;font-size:15.5px;color:#202124;white-space:nowrap;overflow:hidden}
.cbar .url .ph{color:#5f6368}
.ntp{position:absolute;left:0;right:0;top:108px;bottom:0;background:#fff;text-align:center;color:#202124}
.ntp .lg{margin:120px auto 30px;font-family:'Inter Tight';font-weight:700;font-size:44px;letter-spacing:-.03em;color:#5f6368}
.ntp .sb{margin:0 26px;height:52px;border-radius:26px;background:#f1f3f4;display:flex;align-items:center;gap:12px;padding:0 18px;color:#5f6368;font-size:16px}
.ntp .sc{display:grid;grid-template-columns:repeat(4,1fr);gap:20px 0;margin:36px 14px 0}
.ntp .sc i{display:flex;width:52px;height:52px;border-radius:50%;margin:0 auto 8px;background:#e8eaed;align-items:center;justify-content:center;font-style:normal;font-weight:700;color:#5f6368;font-size:20px}
.ntp .sc div{font-size:12.5px;color:#3c4043}
.sugg{position:absolute;left:0;right:0;top:108px;bottom:0;background:#fff;z-index:20}
.sugg .s{height:58px;display:flex;align-items:center;gap:18px;padding:0 22px;font-size:16px;color:#202124;border-bottom:1px solid #f0f0f0}
.cmenu{position:absolute;left:162px;width:302px;top:50px;background:#fff;border-radius:18px;box-shadow:0 8px 30px rgba(0,0,0,.25);transform-origin:95% 0;overflow:hidden;color:#202124;z-index:40}
.cmenu .icons{height:56px;display:flex;justify-content:space-around;align-items:center;border-bottom:1px solid #eee}
.cmenu .it{height:48px;display:flex;align-items:center;gap:16px;padding:0 18px;font-size:15.5px;white-space:nowrap}
.cmenu .it.on{background:#e8eaed}
.cmenu .it svg{flex:none}
.cdlg{position:absolute;left:30px;right:30px;top:330px;background:#fff;border-radius:28px;padding:28px 26px 20px;color:#202124;z-index:45}
.cdlg h3{font-size:23px;font-weight:500;margin-bottom:22px}
.cdlg .r{display:flex;align-items:center;gap:16px}
.cdlg .r img{width:60px;height:60px;border-radius:50%}
.cdlg .r b{font-weight:600;font-size:17px;display:block}
.cdlg .r span{color:#5f6368;font-size:14.5px}
.cdlg .bt{display:flex;justify-content:flex-end;gap:8px;margin-top:30px;font-size:16px;font-weight:600}
.cdlg .bt span{padding:12px 20px;border-radius:24px;color:#0B57D0}
.cdlg .bt span.p{background:#0B57D0;color:#fff}
.splash{position:absolute;left:0;top:0;width:472px;height:1002px;overflow:hidden;transform-origin:0 0;z-index:65;background:${APP_BG}}
.splash .sicon{position:absolute;inset:0;width:100%;height:100%}
`;

/* ---------------- telefon ichi ---------------- */
function screenHTML() {
  const shotApp = `${SHOT}${DEV}-app.png`, shotSplash = `${SHOT}${DEV}-app-splash.png`;
  // ochilgan ilova (intro va final): status bar + to'liq ekran do'kon
  const appLayer = (id) => `<div class="layer" id="${id}" style="background:${APP_BG}">${statusBar('#23160b', DEV)}
     <img class="shot" src="${shotApp}" style="top:${DEV === 'ios' ? 54 : 44}px">
     <img class="shot" id="${id}Spl" src="${shotSplash}" style="top:0;height:1002px;object-fit:cover">
     ${DEV === 'and' ? '<div class="gbar" style="background:rgba(0,0,0,.35)"></div>' : '<div class="gbar" style="background:#111"></div>'}</div>`;
  if (DEV === 'ios') {
    return `
    ${appLayer('app0')}
    <div class="layer" id="web" style="background:${APP_BG}">
      ${statusBar('#111', 'ios')}
      <div class="start" id="start"><h4>Избранное</h4>
        <div class="tiles">${[['#4a7dff', 'П', 'Почта'], ['#ff6b4a', 'Н', 'Новости'], ['#2fbf71', 'К', 'Карты'], ['#8e6cff', 'В', 'Видео'], ['#ffb020', 'П', 'Погода'], ['#3cc4e0', 'С', 'Спорт'], ['#ff4f8b', 'М', 'Музыка'], ['#6b7280', 'Б', 'Банк']].map(([c, l, n]) => `<div><i style="background:${c}">${l}</i>${n}</div>`).join('')}</div>
        <div class="privacy"><b>Отчёт о конфиденциальности</b>Safari не позволил трекерам составить ваш профиль.</div></div>
      <img class="shot" id="pgSpl" src="${shotSplash}" style="top:54px;height:832px;object-fit:cover">
      <img class="shot" id="pg" src="${SHOT}ios-safari.png" style="top:54px">
      <div class="sbar" id="sbar">
        <div class="url" id="url"><span style="font-size:15px;font-weight:600">aA</span><b id="urlTxt"></b><span style="color:#555;font-size:18px">↻</span><div class="prog" id="prog" style="bottom:0"></div></div>
        <div class="tools">
          <span style="left:37px">${I.back('#007AFF')}</span><span style="left:129px">${I.fwd('#b5b5bb')}</span>
          <span style="left:221px;top:68px" id="share">${I.share('#007AFF')}</span>
          <span style="left:313px">${I.book('#007AFF')}</span><span style="left:405px">${I.tabs('#007AFF')}</span>
        </div>
      </div>
      <div class="ebar" id="ebar" style="top:606px"><div class="f">${I.search('#8a8a8e')}<span id="eTxt"></span><span class="caret" id="caret"></span></div><span class="c">Отменить</span></div>
      ${kbHTML('ios', 'kb')}
      <div class="dim" id="dim" style="z-index:39"></div>
      <div class="sheet" id="sheet">
        <div class="row sh-head"><div class="ico"><img src="${SHOT}icon-180.png"></div><div><div class="nm">LUSSO BRAND KR</div><div class="u">${URL_TEXT}</div></div><div class="x">✕</div></div>
        <div class="row apps"><div><i style="background:linear-gradient(#5AC8FA,#007AFF)"></i>AirDrop</div><div><i style="background:linear-gradient(#5FE07A,#30C04F)"></i>Сообщения</div><div><i style="background:linear-gradient(#4FA3FF,#1B6EF3)"></i>Почта</div><div><i style="background:linear-gradient(#FFF3B0,#FFD84A)"></i>Заметки</div></div>
        <div class="row divi"></div>
        <div class="row grp" style="top:272px"><div>${I.copy('#111')}Скопировать</div><div>${I.glass('#111')}Добавить в список для чтения</div></div>
        <div class="row grp" style="top:402px">
          <div>${I.bookO('#111')}Добавить закладку</div><div>${I.star('#111')}Добавить в Избранное</div>
          <div>${I.find('#111')}Найти на странице</div><div id="row">${I.plusq('#111')}Добавить на экран «Домой»</div>
        </div>
        <div class="row grp" style="top:642px"><div>${I.pen('#111')}Разметка</div><div>${I.print('#111')}Напечатать</div></div>
      </div>
      <div class="addv" id="addv">
        <div class="nav"><span class="c">Отменить</span><span class="t">На экран «Домой»</span><span class="a" id="addBtn">Добавить</span></div>
        <div class="card"><img src="${SHOT}icon-180.png"><div class="f"><div>LUSSO BRAND KR</div><div>${URL_TEXT}</div></div></div>
        <div class="note">На экран «Домой» будет добавлен значок для быстрого доступа к этому веб‑сайту.</div>
        <div class="tg"><span>Открыть как веб‑приложение</span><span class="toggle"></span></div>
      </div>
    </div>
    <div class="layer" id="home" style="background:#34407e">
      ${statusBar('#fff', 'ios')}${homeGrid()}<div class="dock"></div><div class="gbar" style="background:#fff"></div>
    </div>
    <div class="splash" id="openSpl"><img class="shot" src="${shotSplash}" style="top:0;height:1002px;object-fit:cover"><img class="sicon" src="${SHOT}icon-180.png"></div>
    ${appLayer('app1')}`;
  }
  return `
    ${appLayer('app0')}
    <div class="layer" id="web" style="background:#fff">
      ${statusBar('#202124', 'and')}
      <div class="ntp" id="start"><div class="lg">Поиск</div><div class="sb">${I.search('#5f6368', 20)}Введите запрос или URL</div>
        <div class="sc">${[['П', 'Почта'], ['Н', 'Новости'], ['К', 'Карты'], ['В', 'Видео'], ['П', 'Погода'], ['С', 'Спорт'], ['М', 'Музыка'], ['Б', 'Банк']].map(([l, n]) => `<div><i>${l}</i>${n}</div>`).join('')}</div></div>
      <img class="shot" id="pgSpl" src="${shotSplash}" style="top:108px;height:894px;object-fit:cover">
      <img class="shot" id="pg" src="${SHOT}and-chrome.png" style="top:108px">
      <div class="sugg" id="sugg"><div class="s">${I.search('#5f6368', 20)}<span id="sTxt"></span></div><div class="s" style="color:#5f6368">${I.gen('#5f6368', 1)}<span id="sTxt2"></span></div></div>
      <div class="cbar">
        <span style="position:absolute;left:18px;top:19px">${I.home('#444')}</span>
        <div class="url" id="url"><span id="lock">${I.lock('#5f6368')}</span><span id="urlTxt"></span><span class="caret" id="caret"></span></div>
        <span style="position:absolute;left:376px;top:20px">${I.tabn('#444', 2)}</span>
        <span style="position:absolute;left:432px;top:13px;padding:6px 8px" id="dots3">${I.dots('#444')}</span>
        <div class="prog" id="prog" style="bottom:-1px;background:#1a73e8"></div>
      </div>
      ${kbHTML('and', 'kb')}
      <div class="gbar" style="background:rgba(0,0,0,.35)"></div>
      <div class="dim" id="dim" style="z-index:39"></div>
      <div class="cmenu" id="cmenu">
        <div class="icons">${I.fwd('#444').replace('width="30" height="30"', 'width="22" height="22"')}${I.star('#444')}${I.dl('#444')}${I.info('#444')}${I.reload('#444')}</div>
        ${['Новая вкладка', 'Новая вкладка инкогнито', 'История', 'Удалить данные', 'Скачанные файлы', 'Закладки', 'Недавние вкладки', 'Поделиться…', 'Найти на странице', 'Перевести…'].map((s, k) => `<div class="it">${I.gen('#5f6368', k)}${s}</div>`).join('')}
        <div class="it" id="row">${I.addHome('#202124')}Добавить на главный экран</div>
        <div class="it">${I.gen('#5f6368', 0)}Версия для ПК</div>
      </div>
      <div class="cdlg" id="addv">
        <h3>Установить приложение</h3>
        <div class="r"><img src="${SHOT}icon-192.png"><div><b>LUSSO</b><span>${URL_TEXT}</span></div></div>
        <div class="bt"><span>Отмена</span><span class="p" id="addBtn">Установить</span></div>
      </div>
    </div>
    <div class="layer" id="home" style="background:#1d6a5d">
      ${statusBar('#fff', 'and')}
      <div style="position:absolute;left:34px;top:92px;color:#fff;font-family:'Inter Tight';font-weight:300;font-size:84px;letter-spacing:-.03em;line-height:1">9:41</div>
      <div style="position:absolute;left:38px;top:186px;color:#fff;font-size:18px;font-weight:500;opacity:.92">Сб, 3 октября</div>
      ${homeGrid()}<div class="gbar" style="background:rgba(255,255,255,.85)"></div>
    </div>
    <div class="splash" id="openSpl"><img class="shot" src="${shotSplash}" style="top:0;height:1002px;object-fit:cover"><img class="sicon" src="${SHOT}icon-192.png"></div>
    ${appLayer('app1')}`;
}

/* ---------------- matnlar ---------------- */
const HEADS = [
  { t: 'Bir bosishda, doim yoningizda.', a: 'Saytni ilovaga', b: '<span class="serif">aylantiring</span>' },
  DEV === 'ios' ? { t: 'Apple · iPhone · Safari', a: 'iPhone’da', b: '<span class="serif">o‘rnatish</span>' } : { t: 'Android · Samsung · Chrome', a: 'Samsung’da', b: '<span class="serif">o‘rnatish</span>' },
  { t: 'Hammasi tayyor!', a: 'LUSSO endi', b: '<span class="serif">ekraningizda</span>' },
];
const CAPS = DEV === 'ios' ? [
  { m: 'Safari’da saytni oching', s: URL_TEXT },
  { m: 'Pastdagi <q>Ulashish</q> tugmasini bosing', s: 'kvadrat ichida yuqoriga strelka' },
  { m: '<q>Добавить на экран «Домой»</q>', s: 'ya’ni «Bosh ekranga qo‘shish»' },
  { m: 'Yuqoridagi <q>Добавить</q> ni bosing', s: 'ya’ni «Qo‘shish»' },
  { m: 'Bosh ekrandagi <q>LUSSO</q> belgisini bosing', s: 'do‘kon ilova kabi to‘liq ekranda ochiladi' },
] : [
  { m: 'Chrome’da saytni oching', s: URL_TEXT },
  { m: 'Yuqori o‘ngdagi <q>⋮</q> ni bosing', s: 'uchta nuqta — Chrome menyusi' },
  { m: '<q>Добавить на главный экран</q>', s: 'ya’ni «Bosh ekranga qo‘shish»' },
  { m: '<q>Установить</q> ni bosing', s: 'ya’ni «O‘rnatish»' },
  { m: 'Bosh ekrandagi <q>LUSSO</q> belgisini bosing', s: 'do‘kon ilova kabi to‘liq ekranda ochiladi' },
];

/* ---------------- bosishlar (barmoq + qizil ramka + kamera) ---------------- */
const TAPS = [
  { el: '#url', press: TL.urlTap, hl: [S[0] + 0.7, TL.urlTap + 0.15], zoom: 1.6, pad: 5 },
  { el: '#kb .k[data-c="enter"]', press: TL.goTap, show: [TL.goTap - 0.9, TL.goTap + 0.3], hl: [TL.type.t1 + 0.05, TL.goTap + 0.12], zoom: 1.55, pad: 4, rad: 10, lead: 0.4 },
  { el: DEV === 'ios' ? '#share' : '#dots3', press: TL.menuTap, hl: [S[1] + 0.4, TL.menuTap + 0.15], zoom: 1.75, pad: 10, rad: 14 },
  { el: '#row', press: TL.rowTap, hl: [S[2] + 0.4, TL.rowTap + 0.2], zoom: 1.55, pad: 3, rad: DEV === 'ios' ? 14 : 10 },
  { el: '#addBtn', press: TL.addTap, hl: [S[3] + 0.3, TL.addTap + 0.15], zoom: 1.7, pad: 5, rad: DEV === 'ios' ? 12 : 26 },
  { el: '#hIcon i', press: TL.iconTap, hl: [S[4] + 0.4, TL.iconTap + 0.15], zoom: 1.6, pad: 6, rad: DEV === 'ios' ? 22 : 44 },
];
// yozish paytida kamera manzil qatori + klaviaturaga biroz yaqin turadi
const CAM = [{ t0: TL.type.t0 - 0.2, t1: TL.type.t1 - 0.25, x: 236, y: DEV === 'ios' ? 700 : 501, s: DEV === 'ios' ? 1.22 : 1.06 }];

/* ---------------- kadr ---------------- */
function render(t) {
  const ios = DEV === 'ios';
  // intro: ochilgan ilova -> brauzer
  const toB = P(t, TL.toBrowser[0], TL.toBrowser[1]);
  st($('#app0'), { opacity: 1 - toB, visibility: toB >= 1 ? 'hidden' : 'visible' });
  st($('#app0Spl'), { opacity: 1 - P(t, 0.9, 1.6) });

  // klaviatura va yozish
  const ty = typed(t, TL.type);
  const kbUp = P(t, TL.kbUp[0], TL.kbUp[1], E.out) * (1 - P(t, TL.goTap + 0.1, TL.goTap + 0.4, E.in));
  const KB = $('#kb'), kbH = ios ? 330 : 356;
  kbDraw(KB, DEV, 'en', 'url', ty.n > 4 ? ['lusso', 'lusso-miniapp', 'vercel.app'] : ['', '', '']);
  kbPress(KB, DEV, ty.key || (Math.abs(t - TL.goTap) < 0.12 ? '\n' : ''));
  st(KB, { transform: `translateY(${(1 - kbUp) * (kbH + 10)}px)` });
  const focused = t >= TL.urlTap + 0.1 && t < TL.goTap + 0.15;
  const loaded = t >= TL.goTap + 0.1;
  const caretOn = focused && Math.floor(t * 2.2) % 2 === 0 || (focused && ty.active);

  if (ios) {
    st($('#ebar'), { transform: `translateY(${(1 - kbUp) * (kbH + 80)}px)`, opacity: kbUp > 0.02 ? 1 : 0 });
    $('#eTxt').textContent = ty.text;
    st($('#caret'), { opacity: caretOn ? 1 : 0 });
    $('#urlTxt').innerHTML = loaded ? `${I.lock('#555')}${URL_TEXT}` : '<span class="ph">Поиск или имя веб‑сайта</span>';
    st($('#sbar'), { transform: `translateY(${kbUp * 130}px)` });
  } else {
    $('#urlTxt').innerHTML = loaded ? URL_TEXT : focused ? ty.text : '<span class="ph">Введите запрос или URL</span>';
    st($('#lock'), { display: loaded ? 'inline-flex' : 'none' });
    st($('#caret'), { display: focused ? 'inline-block' : 'none', opacity: caretOn ? 1 : 0 });
    st($('#sugg'), { opacity: focused && ty.n > 0 ? 1 : 0 });
    $('#sTxt').textContent = ty.text; $('#sTxt2').textContent = ty.n > 3 ? URL_TEXT : '';
    st($('#start .sb'), { opacity: focused ? 0 : 1 });
  }
  // sahifa yuklanishi: progress + splash -> do'kon
  const pr = P(t, TL.load[0], TL.load[1], E.out);
  st($('#prog'), { width: pr * 100 + '%', opacity: pr > 0 && pr < 1 ? 1 : 1 - P(t, TL.load[1], TL.load[1] + 0.2) });
  st($('#pgSpl'), { opacity: P(t, TL.splash[0], TL.splash[0] + 0.2) });
  st($('#pg'), { opacity: P(t, TL.splash[1], TL.splash[1] + 0.35) });
  st($('#start'), { opacity: 1 - P(t, TL.splash[0], TL.splash[0] + 0.2) });

  // menyu / ulashish oynasi
  const up = P(t, TL.menuUp[0], TL.menuUp[1], E.out), rowOn = t >= TL.rowTap - 0.05;
  const down = P(t, TL.dlgUp[0] - 0.1, TL.dlgUp[0] + 0.35);
  $('#row').className = (ios ? '' : 'it') + (rowOn ? ' on' : '');
  const dlg = P(t, TL.dlgUp[0], TL.dlgUp[1], ios ? E.out : E.back), dlgOff = P(t, TL.dlgDown[0], TL.dlgDown[1]);
  if (ios) {
    st($('#sheet'), { transform: `translateY(${(1 - up) * 1000 + down * 1000}px)` });
    st($('#addv'), { transform: `translateY(${(1 - dlg) * 1000 + dlgOff * 1000}px)` });
    st($('#dim'), { opacity: Math.max(up * (1 - down), dlg * (1 - dlgOff)) });
    st($('#addBtn'), { background: `rgba(0,122,255,${0.16 * W(t, TL.addTap - 0.05, TL.addTap + 0.3, 0.1)})` });
  } else {
    st($('#cmenu'), { opacity: up * (1 - down), transform: `scale(${L(0.6, 1, up)})`, visibility: up * (1 - down) > 0 ? 'visible' : 'hidden' });
    st($('#addv'), { opacity: Math.min(1, dlg * 2) * (1 - dlgOff), transform: `scale(${L(0.85, 1, dlg)})`, visibility: dlg * (1 - dlgOff) > 0 ? 'visible' : 'hidden' });
    st($('#dim'), { opacity: Math.max(0.6 * up * (1 - down), dlg * (1 - dlgOff)) });
    st($('#addBtn'), { filter: `brightness(${1 - 0.18 * W(t, TL.addTap - 0.05, TL.addTap + 0.3, 0.1)})` });
  }
  // uy ekrani
  const toHome = P(t, TL.toHome[0], TL.toHome[1]);
  st($('#web'), { opacity: 1 - toHome, transform: `scale(${L(1, 0.92, toHome)})`, visibility: toB > 0 && toHome < 1 ? 'visible' : 'hidden' });
  st($('#home'), { opacity: toHome, transform: `scale(${L(1.12, 1, toHome)})`, visibility: toHome > 0 ? 'visible' : 'hidden' });
  const pop = P(t, TL.pop[0], TL.pop[1], E.back), icon = $('#hIcon');
  st(icon, { transform: `scale(${window.__measure ? 1 : pop})`, opacity: window.__measure ? 1 : cl(pop * 2) });
  st($('i', icon), { boxShadow: `0 0 0 ${5 * W(t, TL.pop[1], TL.iconTap - 0.6, 0.3)}px rgba(255,255,255,.85),0 6px 18px rgba(0,0,0,.25)` });
  // ilovani ochish: ikonadan kattalashadi -> splash -> do'kon
  const open = P(t, TL.open[0], TL.open[1], E.io), spl = $('#openSpl');
  if (open <= 0) st(spl, { opacity: 0 });
  else {
    const sx = L(74 / 472, 1, open), sy = L(74 / 1002, 1, open);
    const x = L(ICON_SLOT.x - 37, 0, open), y = L(ICON_SLOT.y - 37, 0, open), r = L(ios ? 18 : 37, 0, open);
    st(spl, { opacity: cl(open * 6), transform: `translate(${x}px,${y}px) scale(${sx},${sy})`, borderRadius: `${r / sx}px / ${r / sy}px` });
    st($('.sicon', spl), { opacity: 1 - P(open, 0, 0.5, E.lin) });
  }
  const appIn = P(t, TL.appIn[0], TL.appIn[1]);
  st($('#app1'), { opacity: appIn, visibility: appIn > 0 ? 'visible' : 'hidden', zIndex: 66 });
  st($('#app1Spl'), { opacity: 0 });

  if (!window.__measure) renderCore(t);
}

/* ---------------- ishga tushirish ---------------- */
(function boot() {
  const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s);
  buildStage({
    title: DEV === 'ios' ? 'LUSSO — iPhone o‘rnatish' : 'LUSSO — Samsung o‘rnatish',
    heads: HEADS, caps: CAPS, label: DEV === 'ios' ? 'iPhone' : 'Samsung', steps: S, outro: T.outro, dur: T.dur,
    theme: THEMES[DEV], word: 'LUSSO',
    outroImg: SHOT + 'logo.png', outroText: `${I.lock('#fff')} ${URL_TEXT}`,
    taps: TAPS, cam: CAM,
  });
  $('#cam').innerHTML = phoneHTML(DEV, screenHTML());
  kbDraw($('#kb'), DEV, 'en', 'url');
  measureTaps(render);
  // ovoz voqealari
  const ev = baseEvents();
  ev.keys = keyTimes(TL.type);
  ev.up = [TL.menuUp[0], TL.dlgUp[0], TL.kbUp[0]];
  ev.down = [TL.toHome[0]];
  ev.pops = [TL.pop[0] + 0.15];
  ev.opens = [TL.open[0]];
  ev.load = [TL.load[0]];
  window.EVENTS = ev;
  window.DURATION = T.dur;
  window.render = render;
  render(Number(new URLSearchParams(location.search).get('t') || 0));
})();
