# LUSSO — qo'llanma videolari

Uchta vertikal video (1080×1920, 30 fps, H.264 + AAC):

| Fayl | Nima |
|---|---|
| `LUSSO-iPhone-ornatish.mp4` | iPhone, Safari: saytni bosh ekranga o'rnatish (~30 s) |
| `LUSSO-Samsung-ornatish.mp4` | Samsung, Chrome: saytni bosh ekranga o'rnatish (~30 s) |
| `LUSSO-Admin-mahsulot-qoshish.mp4` | Admin panelda yangi mahsulot qo'shish (~58 s) |

Telefon ichidagi do'kon va admin panel **haqiqiy koddan** olingan: `miniapp/`, `admin/` va
`backend/` demo baza bilan ishga tushiriladi, Playwright ularni boshqaradi va ekranini suratga
oladi. Admin videosida rasm haqiqatan yuklanadi, matn harfma-harf yoziladi, mahsulot bazaga
saqlanadi va oxirida do'kon katalogida ko'rsatiladi. Tizim oynalari (Safari/Chrome menyulari,
klaviatura, galereya) ruscha, izohlar o'zbekcha. Musiqa va effektlar `audio.js` da sintez
qilinadi — tashqi audio fayl yo'q.

## Qayta yaratish

```bash
video/setup.sh                 # PostgreSQL + demo baza + backend/miniapp/admin
cd video
node capture-mini.js           # do'kon skrinshotlari -> build/shots
node render-install.js ios     # -> LUSSO-iPhone-ornatish.mp4
node render-install.js and     # -> LUSSO-Samsung-ornatish.mp4
node render-admin.js           # -> LUSSO-Admin-mahsulot-qoshish.mp4
```

Tekshirish: `node snap.js ios 5,12.6` (alohida kadrlar), `node render-admin.js --snap 6,20`,
`./qa.sh LUSSO-iPhone-ornatish.mp4 ios` (har soniyadan kadr, montaj).

## Tuzilishi

- `stage/` — sahna: `core.js` (sarlavha, izohlar, nuqtalar, kamera zoom, barmoq halqasi,
  qizil ramka, klaviatura), `install.js` (iPhone/Samsung), `admin.js` (admin ustidagi tizim
  qatlamlari), `stage.css`
- `lib/browser.js` — ilovalarni telefon o'lchamida ochish, shriftlarni lokal ulash
- `data/demo-fix.sql` — demo baza uchun tuzatishlar (rasmlar, demo buyurtmalar)
- `fonts/` — Inter, Inter Tight, Instrument Serif, Onest (SIL OFL)
- `audio.js` — musiqa + effektlar sintezi
