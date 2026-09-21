@echo off
chcp 65001 >nul
title LUSSO - narxlarni yangilash
cd /d "%~dp0backend"
echo ================================
echo  NARXLARNI YANGILASH
echo ================================
echo.
echo  Faqat narxlar o'zgaradi.
echo  Mahsulotlar, rasmlar va buyurtmalar joyida qoladi.
echo.
npm run db:prices
echo.
pause
