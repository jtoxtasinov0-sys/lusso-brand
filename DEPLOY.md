# Deploy qo'llanmasi

| Qism | Xizmat | Manzil |
|---|---|---|
| Mini App | Vercel | https://lusso-miniapp.vercel.app |
| Admin panel | Vercel | https://lusso-admin-sand.vercel.app |
| Backend + bot | Render | https://lusso-brand-api.onrender.com |
| Baza | Neon.tech | (PostgreSQL) |

Frontend allaqachon deploy qilingan. Qolgani — backend.

---

## 1. Render'da backend'ni ko'tarish

1. https://render.com — **GitHub bilan** ro'yxatdan o'ting.
2. **New → Blueprint** tugmasi.
3. `jtoxtasinov0-sys/lusso-brand` repo'sini tanlang. Render `render.yaml` ni
   o'zi topadi va sozlamalarni to'ldiradi.
4. **Servis nomi `lusso-brand-api` bo'lib qolsin** — `vercel.json` aynan shu
   manzilga murojaat qiladi. Boshqa nom qo'ysangiz, 4-bo'limga qarang.
5. Render maxfiy qiymatlarni so'raydi. Ularni `backend/.env` faylingizdan
   ko'chiring:

   | Kalit | Qiymat |
   |---|---|
   | `DATABASE_URL` | Neon connection string (`postgresql://...`) |
   | `BOT_TOKEN` | BotFather tokeni |
   | `ADMIN_IDS` | Telegram ID laringiz, vergul bilan |
   | `ADMIN_PASSWORD` | admin panel paroli |
   | `WEB_APP_URL` | `https://lusso-miniapp.vercel.app` |
   | `ADMIN_PANEL_URL` | `https://lusso-admin-sand.vercel.app` |
   | `PUBLIC_URL` | `https://lusso-brand-api.onrender.com` |

   `JWT_SECRET` ni Render o'zi yaratadi, `SKIP_INITDATA_CHECK` esa `false`
   qilib qo'yilgan — **uni true qilmang**, aks holda API'ni istalgan odam
   Telegramsiz chaqira oladi.

6. **Apply** → birinchi build 3–5 daqiqa. Tayyor bo'lgach
   `https://lusso-brand-api.onrender.com` manzili `status: ishlayapti ✅`
   qaytarsa, hammasi joyida.

## 2. Bazani to'ldirish (bir marta)

Render'ning bepul tarifida konsol yo'q, shuning uchun seed'ni o'z
kompyuteringizdan ishga tushiring — baza baribir o'sha Neon:

```bash
cd backend
npm run db:seed
```

(`backend/.env` dagi `DATABASE_URL` Neon'ga qarab turgani kifoya.)

## 3. Telegram'ni ulash

BotFather'da:

- `/setmenubutton` → botingiz → `https://lusso-miniapp.vercel.app` → tugma nomi
- yoki `/newapp` orqali Mini App yarating.

## 4. Agar Render'da boshqa nom qo'ysangiz

`miniapp/vercel.json` va `admin/vercel.json` dagi ikkita `destination`
manzilini yangi manzilga almashtiring, so'ng:

```bash
cd miniapp && vercel deploy --prod --yes
cd ../admin && vercel deploy --prod --yes
```

---

## Bepul tarifning ikkita cheklovi

**1. Servis uxlab qoladi.** 15 daqiqa so'rov bo'lmasa Render bepul servisni
to'xtatadi. Bot long polling'da ishlagani uchun **uxlagan paytda botga
yozganingizga javob bermaydi**, birinchi so'rov esa ~50 soniya kutadi.

Yechim: https://uptimerobot.com da bepul monitor yarating —
`https://lusso-brand-api.onrender.com` manzilini har 10 daqiqada tekshirsin.
Shunda servis doim uyg'oq turadi (oyiga ~730 soat, bepul limit 750 soat).
Jiddiyroq yechim — Render'ning $7/oy tarifi.

**2. Yuklangan rasmlar o'chib ketadi.** Render'da disk vaqtinchalik: har
deploy'da `backend/uploads` boshlang'ich holatiga qaytadi. Repo'dagi 23 ta
mahsulot rasmi saqlanib qoladi, lekin **admin paneldan keyin yuklagan
rasmlaringiz yo'qoladi**.

Yechim: Render Disk (pullik) yoki rasmlarni Cloudinary / Supabase Storage kabi
tashqi xizmatga yuklash.

---

## Keyingi o'zgarishlar

Vercel loyihalari CLI orqali yaratilgan, ya'ni GitHub'ga push qilinganda
avtomatik yangilanmaydi. Ikki yo'l bor:

- **Qo'lda:** `cd miniapp && vercel deploy --prod --yes`
- **Avtomatik:** Vercel panelida loyiha → Settings → Git → repo'ni ulang va
  Root Directory ni `miniapp` (admin uchun `admin`) qilib belgilang.

Render esa `main` branch'ga har push'da o'zi qayta deploy qiladi.
