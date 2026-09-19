import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Admin panel 5174-portda ishlaydi, backend — 5000
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    host: true,
    allowedHosts: true, // tunnel domenlari uchun
    proxy: {
      '/api': { target: 'http://localhost:5000', changeOrigin: true },
      '/uploads': { target: 'http://localhost:5000', changeOrigin: true },
    },
  },
});
