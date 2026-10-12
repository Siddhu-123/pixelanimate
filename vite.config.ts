import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages serves the project under /<repo>/; the Pages workflow sets BASE_PATH.
  base: process.env.BASE_PATH || '/',
  cacheDir: 'node_modules/.vite/pixelanimate',
  plugins: [react()],
  server: {
    port: 5173,
    host: true
  }
});
