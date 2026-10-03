-- Video uchun demo baza: seed.js dagi Unsplash rasmlari (konteynerda ochilmaydi)
-- o'rniga repodagi backend/uploads/mahsulot rasmlari qo'yiladi.
DELETE FROM "ProductImage" WHERE url LIKE 'https://images.unsplash.com/%' AND "sortOrder" > 0;
UPDATE "Product" SET "nameUz"=v.n,"nameRu"=v.n,brand=v.b FROM (VALUES
 (21,'Air Force 1 Low White','Nike'),(22,'Air Force 1 Low Black','Nike'),(23,'New Balance 327 Sea Salt','New Balance'),
 (24,'LD Waffle Sacai Blue','Nike'),(25,'Maybach Gold Classic','Maybach'),(26,'Prada Linea Rossa','Prada'),
 (27,'Dior Sauvage Elixir','Dior'),(28,'Allure Homme Sport Extreme','Chanel'),(29,'Versace Eros Parfum','Versace')
) AS v(id,n,b) WHERE "Product".id=v.id;
UPDATE "ProductImage" SET url=v.u FROM (VALUES
 (21,'/uploads/mahsulot/nike-air-force-1-low-white-muqwrz50-1.jpg'),(22,'/uploads/mahsulot/nike-air-force-1-low-black-muqwrz50-1.jpg'),
 (23,'/uploads/mahsulot/new-balance-327-sea-salt-muqwrz50-1.jpg'),(24,'/uploads/mahsulot/nike-ldwaffle-sacai-fragment-blue-muqwrz50-1.jpg'),
 (25,'/uploads/mahsulot/maybach-gold-classic-muqwrz50-1.jpg'),(26,'/uploads/mahsulot/prada-linea-rossa-0120-muqwrz50-1.jpg'),
 (27,'/uploads/quyma/dior-sauvage-elixir.jpg'),(28,'/uploads/mahsulot/chanel-allure-homme-sport-eau-extreme-muqwrz50-1.jpg'),
 (29,'/uploads/mahsulot/versace-eros-parfum-muqwrz50-1.jpg')
) AS v(id,u) WHERE "ProductImage"."productId"=v.id;

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
