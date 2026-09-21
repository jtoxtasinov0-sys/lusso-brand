# 🛍 LUSSO BRAND KR

Koreyadagi erkaklar uchun oyoq kiyim, ko'zoynak va atirlar do'koni.
Telegram Mini App + Bot + Admin Panel.

**Bot:** [@lusso_brand_bot](https://t.me/lusso_brand_bot)
**Admin panel:** botda `/panel` → tugmani bosing (panel botning ichida ochiladi)

---

## ▶️ ISHGA TUSHIRISH — 4 ta tugma

Papkadagi fayllarni **shu tartibda** ikki marta bosing:

| Fayl | Nima qiladi |
|---|---|
| `1-BACKEND-ishga-tushirish.bat` | Bot va API (port 5000) |
| `2-MINIAPP-ishga-tushirish.bat` | Mijozlar uchun do'kon (port 5173) |
| `3-ADMIN-ishga-tushirish.bat` | Admin panel (port 5174) |
| `4-TUNNEL-ochish.bat` | Do'kon va admin panelni internetga chiqaradi |
| `5-NARXLARNI-YANGILASH.bat` | Narxlarni bazaga yozadi (kerak bo'lganda) |

To'rtala oyna **ochiq turishi kerak**. Yopilsa — do'kon ishlamaydi.

### 4-TUNNEL nima qiladi?
Ikkita `https://` manzil ochadi va ularni o'zi ulaydi:

1. **Do'kon** → Telegram botning "🛍 Do'kon" tugmasiga
2. **Admin panel** → botdagi `/panel` buyrug'iga

Oynada `✅ TAYYOR` chiqsa, botda `/start` bosing.

> Manzillar har safar o'zgaradi, lekin skript ularni o'zi yangilab qo'yadi —
> qo'lda hech narsa tahrirlash kerak emas.

---

## ⚠️ Bank rekvizitlari — TEST holatida

Hozir mijozlarga quyidagi **test** raqam ko'rsatilyapti:

| | |
|---|---|
| Bank | Shinhan Bank |
| Hisob raqam | `1234-5678-9012` |
| Qabul qiluvchi | LUSSO BRAND |

Haqiqiy savdoni boshlashdan oldin almashtiring:
**Admin panel → Sozlamalar → Bank rekvizitlari**

Almashtirmaguningizcha Boshqaruv panelida sariq ogohlantirish turadi.

---

## 📱 Admin panelni telefondan ochish

Botga **`/panel`** deb yozing va **🖥 Admin panelni ochish** tugmasini bosing —
panel Telegramning o'zida ochiladi, brauzerga chiqish va parol yozish shart emas.
Telegram sizni tanigani uchun panel o'zi kiritadi.

Yangi buyurtma haqidagi xabarda ham xuddi shu tugma bo'ladi — bosdingiz, panel ochildi.

> Tugma chiqmasa, panel manzili sozlanmagan. Ikki yo'l bor:
> Render → Environment → `ADMIN_PANEL_URL`, yoki to'g'ridan-to'g'ri botda:
> `/panel https://lusso-brand-kr-admin.vercel.app`

### Panelni alohida havola qilib ochish (ixtiyoriy)

BotFather orqali panelga `t.me/lusso_brand_bot/admin` ko'rinishidagi doimiy
havola berish mumkin:

1. [@BotFather](https://t.me/BotFather) → **`/newapp`** → `@lusso_brand_bot`
2. Nomi: `LUSSO Admin` · Tavsifi: `Admin panel`
3. Rasm: 640×360 png · GIF: **Skip**
4. **Web App URL:** `https://lusso-brand-kr-admin.vercel.app`
5. **Short name:** `admin` → havola tayyor: `t.me/lusso_brand_bot/admin`
6. Shu havolani Render → Environment → `ADMIN_MINIAPP_URL` ga yozing —
   `/panel` javobida ikkinchi tugma bo'lib chiqadi

### 👥 Boshqa odamga panel berish

Panel → **Sozlamalar → 🔐 Panelga kirish** bo'limida manzil va parol turadi.
**Manzil va parolni birga nusxalash** tugmasini bosib, o'sha odamga yuborasiz —
u brauzerdan kiradi. Botda `/panel` ham xuddi shu manzil va parolni beradi.

Parolni o'sha yerda istalgan vaqtda o'zgartirasiz: **Saqlash** bosilishi bilan
eski parol ishlamay qoladi. Render'ga ham, `.env` ga ham tegish kerak emas.

> Parol bilan kirgan odam **Telegram admini bo'lmaydi** — unga buyurtmalar
> haqida xabar kelmaydi va u `/panel` dan foydalana olmaydi.

### 🔒 Himoya
- **Telegram orqali** kirganda panel faqat adminlarga ochiladi (`/admin PAROL`
  qilganlar va `.env` dagi `ADMIN_IDS`). Boshqa odam havolani bilsa ham kira olmaydi.
- **Brauzerdan** kirishda parol so'raladi. Parol **5 marta** xato kiritilsa —
  IP **15 daqiqaga bloklanadi**. Bu blok Telegram orqali kirishga ta'sir qilmaydi,
  ya'ni botdan panelni baribir ocha olasiz.
- Parolni almashtirish: **Sozlamalar → Panel paroli**. U bo'sh qoldirilsa
  `.env` (yoki Render) dagi `ADMIN_PASSWORD` ishlatiladi.
- `/admin PAROL` buyrug'i esa hamisha `ADMIN_PASSWORD` ni so'raydi — ya'ni
  panel parolini bilgan odam o'zini admin qilib ola olmaydi.

---

## 👑 O'zingizni admin qilish

Botga yozing:
```
/admin LussoKR2026
```
Shundan keyin **har bir yangi buyurtma** haqida Telegramga xabar keladi:
mijoz ismi, telefoni, manzili, nima olgani va summasi.

---

## 📁 Loyiha tuzilishi

```
lusso_brand.kr/
├── backend/          Node.js — Bot va API
│   ├── prisma/       Baza sxemasi va seed
│   ├── src/
│   │   ├── config/        sozlamalar
│   │   ├── core/          bot instansiyasi
│   │   ├── database/      PostgreSQL ulanishi
│   │   ├── models/        User, Product, Order, Setting
│   │   ├── controllers/   bot, mijoz API, admin API
│   │   ├── routes/        yo'llar
│   │   ├── middlewares/   validatsiya, rasm yuklash
│   │   ├── locales/       uz / ru matnlar
│   │   └── index.js
│   ├── tunnel.js     Telegramga avtomatik ulash
│   ├── uploads/      mahsulot rasmlari va to'lov cheklari
│   └── .env          BAZA va TOKEN shu yerda
│
├── miniapp/          React — Mini App (port 5173)
└── admin/            React — admin panel (port 5174)
```

---

## 💰 Narxlarni yangilash

Barcha narxlar **bitta faylda**: `backend/prisma/prices.js`. Ochib, jadvalni
tahrirlaysiz (`[nomi, narxi, eski narxi]`), keyin `5-NARXLARNI-YANGILASH.bat`
faylini ikki marta bosasiz.

Bu skript **faqat narxni** o'zgartiradi — mahsulotlar, rasmlar, o'lchamlar va
buyurtmalar joyida qoladi.

> Bitta mahsulotning narxini o'zgartirish uchun bu shart emas —
> Admin panel → Mahsulotlar → ✏️ orqali qilaverasiz.

Hozirgi narxlar: **45 000 – 150 000 ₩**.

---

## 🗄 Baza bilan ishlash

```bash
cd backend
npm run db:push      # sxemani bazaga yozish
npm run db:prices    # faqat narxlarni yangilash (xavfsiz)
npm run db:seed      # mahsulotlarni qayta yuklash
npm run db:studio    # bazani brauzerda ko'rish
```

⚠️ `db:seed` barcha mahsulotlarni **o'chirib, qaytadan yozadi**.
Admin paneldan qo'shgan mahsulotlaringiz yo'qoladi — faqat boshida ishlating.
Narx uchun esa `db:prices` ishlating — u hech narsani o'chirmaydi.

---

## 📦 Buyurtma jarayoni

1. Mijoz Mini App'da mahsulot tanlaydi → o'lcham → savat
2. Manzil va telefonni kiritadi → **Tasdiqlash**
3. Bank rekvizitlari chiqadi → to'laydi → **chek rasmini yuklaydi**
4. Botdan mijozga buyurtma raqami va rekvizitlar keladi
5. Sizga (adminga) Telegramda xabar keladi
6. Admin panelda buyurtmani ochasiz → chekni ko'rasiz → **Tasdiqlangan** qilasiz
7. 운송장번호 (tracking) kiritasiz → mijozga avtomatik xabar boradi

---

## 🖼 Mahsulot va rasm qo'shish

Admin panel → **Mahsulotlar** → **+ Yangi mahsulot** yoki **✏️**

- **🖼 Galereyadan rasm tanlash** — bir nechta rasm birdan
- Rasmni sudrab tashlash ham mumkin
- Birinchi rasm — asosiy. Boshqa rasmni bosib asosiy qilish mumkin
- **👟 Oyoq kiyim o'lchamlari** tugmasi — 240–285 o'lchamlarni bir bosishda qo'shadi
- **🧴 30/50/100ml** — atirlar uchun

---

## 📢 Rassilka

Admin panel → **Rassilka** → matn + rasm + tugma → **Hammaga yuborish**.
Botni ishga tushirgan barcha mijozlarga yetadi.

---

## 🔑 .env fayl (backend papkasida)

| O'zgaruvchi | Nima uchun |
|---|---|
| `DATABASE_URL` | Neon PostgreSQL manzili |
| `BOT_TOKEN` | BotFather tokeni |
| `ADMIN_PASSWORD` | `/admin` buyrug'i uchun va Sozlamalarda parol yozilmagan holat uchun zaxira |
| `ADMIN_PANEL_URL` | Admin panel manzili — botdagi `/panel` shuni ochadi. Serverda bo'sh bo'lsa `lusso-brand-kr-admin.vercel.app` ishlatiladi |
| `ADMIN_MINIAPP_URL` | BotFather `/newapp` bergan `t.me/...` havola (ixtiyoriy) |
| `WEB_APP_URL` | Tunnel manzili — **avtomatik yoziladi** |
| `ADMIN_IDS` | Qo'shimcha adminlar (ixtiyoriy — `/admin` buyrug'i yetarli) |
| `SKIP_INITDATA_CHECK` | `false` bo'lishi kerak. Faqat brauzerda test qilish uchun `true` qiling |

---

## ❓ Tez-tez uchraydigan holatlar

**Ilova sekin ochilyapti**
Birinchi ochilish server uyqudan uyg'onishini kutadi. Endi server o'zini har 10
daqiqada uyg'oq tutadi, shuning uchun bu kamdan-kam bo'ladi. Rasmlar esa
brauzerda saqlanadi — ikkinchi ochilish darhol bo'ladi.

**Botdagi "Do'kon" tugmasi ochilmayapti**
`4-TUNNEL-ochish.bat` oynasi yopilgan. Qaytadan oching.

**Mini App "Telegram orqali kiring" deyapti**
Do'konni brauzerdan emas, Telegram ichidan oching.

**Botdagi `/panel` tugmasi eski manzilni ochyapti**
Bazada kompyuterdagi tunnel manzili qolib ketgan. Botda yangi manzilni bering:
`/panel https://lusso-brand-kr-admin.vercel.app`

**Panelga kirganda "Siz admin emassiz" deyapti**
Botga `/admin LussoKR2026` deb yozing, keyin panelni qaytadan oching.

**Brauzerda test qilmoqchiman**
`.env` da `SKIP_INITDATA_CHECK="true"` (hozir shunday turibdi) — brauzerda
`http://localhost:5173` ni ochib sinab ko'rishingiz mumkin.
Bu rejim **faqat shu kompyuterdan** ishlaydi: tunnel manzili har doim himoyalangan,
begona odam do'konni Telegramsiz ocholmaydi.
