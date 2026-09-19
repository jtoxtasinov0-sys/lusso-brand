// Telegram WebApp SDK bilan ishlash
export const tg = window.Telegram?.WebApp;

export function initTelegram() {
  if (!tg) return;
  tg.ready();
  tg.expand();
  try {
    tg.setHeaderColor('#ffffff');
    tg.setBackgroundColor('#ffffff');
    tg.disableVerticalSwipes?.();
  } catch {
    /* eski versiyalarda mavjud emas */
  }
}

export const initData = tg?.initData || '';

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

export function showBackButton(onClick) {
  if (!tg?.BackButton) return () => {};
  tg.BackButton.show();
  tg.BackButton.onClick(onClick);
  return () => {
    tg.BackButton.offClick(onClick);
    tg.BackButton.hide();
  };
}
