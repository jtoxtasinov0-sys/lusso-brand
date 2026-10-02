import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Mini App 5173-portda ishlaydi.
// /api va /uploads so'rovlari backendga (5000) uzatiladi —
// shuning uchun ngrok faqat SHU portga ulanadi.
// API_TARGET=https://lusso-brand.onrender.com — lokal dizaynni haqiqiy ma'lumot bilan ko'rish uchun.
const target = process.env.API_TARGET || 'http://localhost:5000';
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    allowedHosts: true, // ngrok domenlari uchun
    proxy: {
      '/api': { target, changeOrigin: true },
      '/uploads': { target, changeOrigin: true },
    },
  },
});
