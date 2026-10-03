-- Video uchun demo baza: seed.js dagi Unsplash rasmlari (konteynerda ochilmaydi)
-- o'rniga repodagi backend/uploads/mahsulot rasmlari qo'yiladi.
DELETE FROM "ProductImage" WHERE url LIKE 'https://images.unsplash.com/%' AND "sortOrder" > 0;
-- Rasm avval yangilanadi (mahsulot asl nomi bo'yicha), keyin nomi rasmga moslanadi
UPDATE "ProductImage" SET url=v.u FROM "Product" p, (VALUES
 ('Air Force 1 White','/uploads/mahsulot/nike-air-force-1-low-white-muqwrz50-1.jpg'),('Adidas Samba OG','/uploads/mahsulot/nike-air-force-1-low-black-muqwrz50-1.jpg'),
 ('New Balance 530','/uploads/mahsulot/new-balance-327-sea-salt-muqwrz50-1.jpg'),('Classic Derby charm tufli','/uploads/mahsulot/nike-ldwaffle-sacai-fragment-blue-muqwrz50-1.jpg'),
 ('Ray-Ban Aviator Gold','/uploads/mahsulot/maybach-gold-classic-muqwrz50-1.jpg'),('Ray-Ban Wayfarer','/uploads/mahsulot/prada-linea-rossa-0120-muqwrz50-1.jpg'),
 ('Dior Sauvage EDT','/uploads/quyma/dior-sauvage-elixir.jpg'),('Bleu de Chanel EDP','/uploads/mahsulot/chanel-allure-homme-sport-eau-extreme-muqwrz50-1.jpg'),
 ('Versace Eros EDT','/uploads/mahsulot/versace-eros-parfum-muqwrz50-1.jpg')
) AS v(o,u) WHERE p."nameUz"=v.o AND "ProductImage"."productId"=p.id;
UPDATE "Product" SET "nameUz"=v.n,"nameRu"=v.n,brand=v.b FROM (VALUES
 ('Air Force 1 White','Air Force 1 Low White','Nike'),('Adidas Samba OG','Air Force 1 Low Black','Nike'),('New Balance 530','New Balance 327 Sea Salt','New Balance'),
 ('Classic Derby charm tufli','LD Waffle Sacai Blue','Nike'),('Ray-Ban Aviator Gold','Maybach Gold Classic','Maybach'),('Ray-Ban Wayfarer','Prada Linea Rossa','Prada'),
 ('Dior Sauvage EDT','Dior Sauvage Elixir','Dior'),('Bleu de Chanel EDP','Allure Homme Sport Extreme','Chanel'),('Versace Eros EDT','Versace Eros Parfum','Versace')
) AS v(o,n,b) WHERE "Product"."nameUz"=v.o;
-- seed.js barcha mahsulotlarni o'chiradi: "Quyma atirlar" bo'sh qolsa, backend qayta ishga tushganda o'zi to'ldiradi
DELETE FROM "Category" c WHERE c.slug='quyma' AND NOT EXISTS (SELECT 1 FROM "Product" p WHERE p."categoryId"=c.id);

-- Bank rekvizitlari (test ogohlantirishi chiqmasin) va demo mijozlar/buyurtmalar
UPDATE "Setting" SET "bankAccount"='110-482-913577' WHERE id=1;
INSERT INTO "User" ("telegramId","firstName",language) VALUES
 ('900001','Jasur','uz'),('900002','Dilshod','uz'),('900003','Sardor','uz'),('900004','Aziz','ru'),('900005','Bekzod','uz'),('900006','Timur','ru')
ON CONFLICT DO NOTHING;
INSERT INTO "Order" ("orderNumber","userId",items,subtotal,"deliveryFee",total,status,"customerName",phone,street,"createdAt","updatedAt")
SELECT v.num,(SELECT id FROM "User" WHERE "telegramId"=v.tg),v.items::json,v.total,0,v.total,v.st::"OrderStatus",v.nm,'010-2345-6789','Seoul, Gangnam-gu',now()-v.ago::interval,now()
FROM (VALUES
 ('LS-DEMO-1001','900001','[{"productId":17,"name":"Nike Dunk Low Panda","variant":"265","price":129000,"qty":1}]',129000,'PENDING_PAYMENT','Jasur','40 minutes'),
 ('LS-DEMO-1002','900002','[{"productId":2,"name":"Ray-Ban Ferrari Polarized","variant":"Qora-Qizil","price":95000,"qty":1}]',95000,'RECEIPT_SENT','Dilshod','2 hours'),
 ('LS-DEMO-1003','900003','[{"productId":11,"name":"Baccarat Rouge 540 Extrait","variant":"70ml","price":189000,"qty":1}]',189000,'CONFIRMED','Sardor','5 hours'),
 ('LS-DEMO-1004','900004','[{"productId":8,"name":"Stronger With You Freeze","variant":"50ml","price":99000,"qty":1}]',99000,'SHIPPED','Aziz','1 day'),
 ('LS-DEMO-1005','900005','[{"productId":20,"name":"Air Jordan 1 Low Gray","variant":"270","price":139000,"qty":1}]',139000,'DELIVERED','Bekzod','2 days')
) AS v(num,tg,items,total,st,nm,ago)
ON CONFLICT DO NOTHING;
