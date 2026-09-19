# 🛍 LUSSO BRAND KR

Koreyadagi erkaklar uchun oyoq kiyim, ko'zoynak va atirlar do'koni.
Telegram Mini App + Bot + Admin Panel.

**Bot:** [@lusso_brand_bot](https://t.me/lusso_brand_bot)
**Admin panel:** botda `/panel` · parol: `LussoKR2026`

---

## ▶️ ISHGA TUSHIRISH — 4 ta tugma

Papkadagi fayllarni **shu tartibda** ikki marta bosing:

| Fayl | Nima qiladi |
|---|---|
| `1-BACKEND-ishga-tushirish.bat` | Bot va API (port 5000) |
| `2-MINIAPP-ishga-tushirish.bat` | Mijozlar uchun do'kon (port 5173) |
| `3-ADMIN-ishga-tushirish.bat` | Admin panel (port 5174) |
| `4-TUNNEL-ochish.bat` | Do'kon va admin panelni internetga chiqaradi |

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

Botga **`/panel`** deb yozing — bosiladigan `https://` havola va parol keladi.
Mobil internetda ham, boshqa shaharda ham ochiladi — Wi-Fi shart emas.

> `localhost` ni Telegram havola qilib bermaydi va u faqat kompyuterda ishlaydi.
> Shuning uchun bot tunnel manzilini yuboradi.

### 🔒 Himoya
Admin panel internetda ochiq bo'lgani uchun:
- Parol **5 marta** xato kiritilsa — IP **15 daqiqaga bloklanadi**
- Har bir xatodan keyin nechta urinish qolgani ko'rsatiladi
- Parolni almashtirish: `.env` dagi `ADMIN_PASSWORD`, keyin backendni qayta ishga tushiring
- Havolani begonaga bermang — u tasodifiy va topib bo'lmaydigan, lekin bilgan odam ocha oladi

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

## 🗄 Baza bilan ishlash

```bash
cd backend
npm run db:push      # sxemani bazaga yozish
npm run db:seed      # mahsulotlarni qayta yuklash
npm run db:studio    # bazani brauzerda ko'rish
```

⚠️ `db:seed` barcha mahsulotlarni **o'chirib, qaytadan yozadi**.
Admin paneldan qo'shgan mahsulotlaringiz yo'qoladi — faqat boshida ishlating.

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
| `ADMIN_PASSWORD` | Admin panel paroli va `/admin` buyrug'i uchun |
| `WEB_APP_URL` | Tunnel manzili — **avtomatik yoziladi** |
| `ADMIN_IDS` | Qo'shimcha adminlar (ixtiyoriy — `/admin` buyrug'i yetarli) |
| `SKIP_INITDATA_CHECK` | `false` bo'lishi kerak. Faqat brauzerda test qilish uchun `true` qiling |

---

## ❓ Tez-tez uchraydigan holatlar

**Botdagi "Do'kon" tugmasi ochilmayapti**
`4-TUNNEL-ochish.bat` oynasi yopilgan. Qaytadan oching.

**Mini App "Telegram orqali kiring" deyapti**
Do'konni brauzerdan emas, Telegram ichidan oching.

**Brauzerda test qilmoqchiman**
`.env` da `SKIP_INITDATA_CHECK="true"` (hozir shunday turibdi) — brauzerda
`http://localhost:5173` ni ochib sinab ko'rishingiz mumkin.
Bu rejim **faqat shu kompyuterdan** ishlaydi: tunnel manzili har doim himoyalangan,
begona odam do'konni Telegramsiz ocholmaydi.
