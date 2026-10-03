// Mijozlar bilan aloqa raqami — savollarga WhatsApp va Telegram orqali javob beriladi
export const CONTACT_PHONE = '010-5790-4777';
const PHONE_INTL = '821057904777'; // +82 10-5790-4777
export const WHATSAPP_URL = `https://wa.me/${PHONE_INTL}`;
export const TELEGRAM_URL = `https://t.me/+${PHONE_INTL}`;
export const CALL_URL = `tel:+${PHONE_INTL}`;

// "Quyma atirlar" — o'z bo'limida turadi, umumiy ro'yxat va bosh sahifa
// tavsiyalariga aralashmaydi (backend/src/core/decants.js bilan bir xil)
export const DECANT_SLUG = 'quyma';
export const isDecant = (p) => p?.category?.slug === DECANT_SLUG;
