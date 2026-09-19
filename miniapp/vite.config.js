import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Mini App 5173-portda ishlaydi.
// /api va /uploads so'rovlari backendga (5000) uzatiladi —
// shuning uchun ngrok faqat SHU portga ulanadi.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    allowedHosts: true, // ngrok domenlari uchun
    proxy: {
      '/api': { target: 'http://localhost:5000', changeOrigin: true },
      '/uploads': { target: 'http://localhost:5000', changeOrigin: true },
    },
  },
});
