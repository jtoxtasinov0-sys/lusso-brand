// Telegram WebApp SDK bilan ishlash
export const tg = window.Telegram?.WebApp;

export function initTelegram() {
  if (!tg) return;
  tg.ready();
  tg.expand();
  try {
    tg.setHeaderColor('#faf7f1');
    tg.setBackgroundColor('#faf7f1');
    tg.setBottomBarColor?.('#faf7f1');
    tg.disableVerticalSwipes?.();
  } catch {
    /* eski versiyalarda mavjud emas */
  }
}

// Ilova Telegram ichida ochilganmi yoki oddiy brauzerda (Chrome va h.k.)?
// telegram-web-app.js brauzerda ham window.Telegram.WebApp ni yaratadi,
// lekin u yerda platform "unknown" bo'ladi.
export function isTelegram() {
  if (getInitData()) return true;
  return Boolean(tg?.platform && tg.platform !== 'unknown');
}

// Brauzer mijozining doimiy tasodifiy ID si — savat, buyurtmalar va
// manzillar shu ID ga bog'lanadi (localStorage'da saqlanadi)
export function getGuestId() {
  let id = '';
  try {
    id = localStorage.getItem('lusso-guest-id') || '';
  } catch {
    /* ignore */
  }
  if (!/^[a-zA-Z0-9-]{16,64}$/.test(id)) {
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    id = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
    try {
      localStorage.setItem('lusso-guest-id', id);
    } catch {
      /* ignore */
    }
  }
  return id;
}

// MUHIM: bu funksiya, o'zgarmas const emas — chunki Telegram ba'zan
// initData'ni sahifa ochilgan zahoti emas, bir lahzadan keyin to'ldiradi.
// Uni bitta marta o'qib saqlab qo'ysak, "hali bo'sh" holatida qolib ketishi
// mumkin va barcha so'rovlar butun sessiya davomida 401 bilan qaytadi.
export function getInitData() {
  return window.Telegram?.WebApp?.initData || '';
}

// Ba'zan Telegram initData'ni sahifa render bo'lgan zahoti emas, bir
// necha o'n millisekundadan keyin to'ldiradi. Shu sabab birinchi
// so'rovdan oldin qisqa vaqt (jami ~600ms, har 40ms tekshirib) kutamiz.
export function waitForInitData(timeoutMs = 600) {
  if (getInitData()) return Promise.resolve(getInitData());
  return new Promise((resolve) => {
    const start = Date.now();
    const tick = () => {
      const id = getInitData();
      if (id || Date.now() - start >= timeoutMs) return resolve(id);
      setTimeout(tick, 40);
    };
    tick();
  });
}

export function tgUser() {
  return tg?.initDataUnsafe?.user || null;
}

export function haptic(type = 'light') {
  try {
    if (type === 'success' || type === 'error' || type === 'warning') {
      tg?.HapticFeedback?.notificationOccurred(type);
    } else {
      tg?.HapticFeedback?.impactOccurred(type);
    }
  } catch {
    /* ignore */
  }
}

export function closeApp() {
  try {
    tg?.close();
  } catch {
    /* ignore */
  }
}

// Tashqi havolani ochish (Telegram link bo'lsa — botning o'zida, aks holda brauzerda)
export function openLink(url) {
  try {
    if (url.includes('t.me/') && tg?.openTelegramLink) {
      tg.openTelegramLink(url);
      return;
    }
    if (tg?.openLink) {
      tg.openLink(url);
      return;
    }
  } catch {
    /* ignore */
  }
  window.open(url, '_blank');
}

export function showBackButton(onClick) {
  if (!tg?.BackButton) return () => {};
  tg.BackButton.show();
  tg.BackButton.onClick(onClick);
  return () => {
    tg.BackButton.offClick(onClick);
    tg.BackButton.hide();
  };
}
