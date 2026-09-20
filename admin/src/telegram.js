// Panel Telegram ichida (Mini App bo'lib) ochilganda ishlaydigan yordamchilar.
// Brauzerda ochilsa — hammasi bo'sh qaytadi va panel odatdagidek parol so'raydi.
export const tg = window.Telegram?.WebApp;

// initData faqat bot ichida bo'ladi. Shu bor bo'lsa — panel Telegramda ochilgan.
export const initData = tg?.initData || '';

export const isTelegram = Boolean(initData);

export function initTelegram() {
  if (!tg) return;
  try {
    tg.ready();
    tg.expand();
    tg.setHeaderColor('#0f1115');
    tg.setBackgroundColor('#f6f7f9');
    tg.disableVerticalSwipes?.();
    tg.enableClosingConfirmation?.();
  } catch {
    /* Telegramning eski versiyalarida bu usullar yo'q */
  }
}

export function tgUser() {
  return tg?.initDataUnsafe?.user || null;
}

export function haptic(type = 'light') {
  try {
    if (['success', 'error', 'warning'].includes(type)) {
      tg?.HapticFeedback?.notificationOccurred(type);
    } else {
      tg?.HapticFeedback?.impactOccurred(type);
    }
  } catch {
    /* ignore */
  }
}
