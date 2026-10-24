import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Proxy /api to the Express/NestJS backend when VITE_API_BASE_URL is not set to an absolute URL.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { proxy: { '/api': { target: 'http://localhost:4000', changeOrigin: true } } },
});
