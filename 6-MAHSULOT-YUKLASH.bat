@echo off
chcp 65001 >nul
title LUSSO - mahsulot yuklash
cd /d "%~dp0backend"
echo ================================
echo  MAHSULOTLARNI YUKLASH
echo ================================
echo.
echo  Rasmlar MAHSULOTLAR papkasidan olinadi.
echo  Qollanma: MAHSULOTLAR\QOLLANMA.txt
echo.
npm run db:import
echo.
pause
