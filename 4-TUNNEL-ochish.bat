@echo off
title LUSSO TUNNEL (Telegramga ulash)
cd /d "%~dp0backend"
echo ==========================================
echo  Mini App'ni Telegramga ulash
echo  (avval 1-BACKEND va 2-MINIAPP ishlasin)
echo ==========================================
node tunnel.js
pause
