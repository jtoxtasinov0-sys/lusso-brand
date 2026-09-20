# Deploy qo'llanmasi

| Qism | Xizmat | Manzil |
|---|---|---|
| Mini App | Vercel | https://lusso-miniapp.vercel.app |
| Admin panel | Vercel | https://lusso-brand-kr-admin.vercel.app |
| Backend + bot | Render | https://lusso-brand.onrender.com |
| Baza | Neon.tech | (PostgreSQL) |

> Admin panel odatda **botning ichida** ochiladi: `/panel` → tugma.
> Yuqoridagi manzil — botga beriladigan manzil (`ADMIN_PANEL_URL`).

Frontend allaqachon deploy qilingan. Qolgani — backend.

---

## 1. Render'da backend'ni ko'tarish

1. https://render.com — **GitHub bilan** ro'yxatdan o'ting.
2. **New → Blueprint** tugmasi.
3. `jtoxtasinov0-sys/lusso-brand` repo'sini tanlang. Render `render.yaml` ni
   o'zi topadi va sozlamalarni to'ldiradi.
4. **Servis nomi `lusso-brand` bo'lib qolsin** — `vercel.json` aynan shu
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
   | `ADMIN_PANEL_URL` | `https://lusso-brand-kr-admin.vercel.app` |
   | `PUBLIC_URL` | `https://lusso-brand.onrender.com` |

   `ADMIN_PANEL_URL` — botdagi `/panel` shu manzilni ochadi. Bo'sh qoldirsangiz
   `https://lusso-brand-kr-admin.vercel.app` ishlatiladi, ya'ni Vercel loyihasi
   shu nom bilan tursa buni yozish shart emas.

   `JWT_SECRET` ni Render o'zi yaratadi, `SKIP_INITDATA_CHECK` esa `false`
   qilib qo'yilgan — **uni true qilmang**, aks holda API'ni istalgan odam
   Telegramsiz chaqira oladi.

6. **Apply** → birinchi build 3–5 daqiqa. Tayyor bo'lgach
   `https://lusso-brand.onrender.com` manzili `status: ishlayapti ✅`
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

## 3.1 Admin panel havolasi

Panel Vercel'da `lusso-brand-kr-admin` nomi bilan turadi. Nomi boshqacha bo'lsa:

1. Vercel → admin loyihasi → **Settings → General → Project Name** →
   `lusso-brand-kr-admin` → **Save**. Manzil shu zahoti
   `https://lusso-brand-kr-admin.vercel.app` bo'ladi.
   (Domenlarda nuqta va `_` ishlatib bo'lmaydi, shuning uchun tire bilan.)
2. Nomi aynan `lusso-brand-kr-admin` bo'lsa — boshqa hech narsa qilish kerak emas,
   bot shu manzilni o'zi ishlatadi.
3. Vercel boshqa nom bergan bo'lsa, ikki yo'ldan biri:
   Render → Environment → `ADMIN_PANEL_URL` → yangi manzil → **Save**,
   yoki qayta deploy qilmasdan botda: `/panel https://<yangi-manzil>`

**Panel botning ichida ochilishi** uchun qo'shimcha sozlash shart emas —
`/panel` javobidagi tugma Mini App bo'lib ochadi va adminni parolsiz kiritadi.

Doimiy `t.me/...` havola ham kerak bo'lsa:

1. BotFather → `/newapp` → `@lusso_brand_bot`
2. Web App URL: `https://lusso-brand-kr-admin.vercel.app`, short name: `admin`
3. Render → Environment → `ADMIN_MINIAPP_URL` = `https://t.me/lusso_brand_bot/admin`

## 4. Agar Render'da boshqa nom qo'ysangiz

`miniapp/vercel.json` va `admin/vercel.json` dagi ikkita `destination`
manzilini yangi manzilga almashtiring va push qiling — Vercel o'zi qayta
deploy qiladi:

```bash
git add -A && git commit -m "backend manzili yangilandi" && git push
```

## Bepul tarifning ikkita cheklovi

**1. Servis uxlab qoladi.** 15 daqiqa so'rov bo'lmasa Render bepul servisni
to'xtatadi. Bot long polling'da ishlagani uchun **uxlagan paytda botga
yozganingizga javob bermaydi**, birinchi so'rov esa ~50 soniya kutadi.

Yechim: https://uptimerobot.com da bepul monitor yarating —
`https://lusso-brand.onrender.com` manzilini har 10 daqiqada tekshirsin.
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

Ikkala Vercel loyihasi ham GitHub repo'siga ulangan (Root Directory:
`miniapp` va `admin`). Ya'ni `main` branch'ga har push qilganingizda
frontend o'zi qayta quriladi. Render ham xuddi shunday ishlaydi.

Demak, odatdagi ish oqimi shunchaki:

```bash
git add -A && git commit -m "o'zgarish tavsifi" && git push
```

Qo'lda deploy kerak bo'lsa (masalan commit qilmasdan sinash uchun):

```bash
vercel deploy --prod --yes --cwd miniapp
```
