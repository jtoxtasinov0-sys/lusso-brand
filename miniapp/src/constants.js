// Do'kon egasining Telegram profili — savol-javob uchun
export const SUPPORT_URL = 'https://t.me/Nurillo_0304';

// "Quyma atirlar" — o'z bo'limida turadi, umumiy ro'yxat va bosh sahifa
// tavsiyalariga aralashmaydi (backend/src/core/decants.js bilan bir xil)
export const DECANT_SLUG = 'quyma';
export const isDecant = (p) => p?.category?.slug === DECANT_SLUG;
