import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // changeOrigin: false mantém o Host do navegador (localhost:5173); a API compara Host e Origin
    // para aceitar pedidos que mudam dados, e o atalho em string trocaria o Host por localhost:3333
    proxy: {
      '/api': { target: 'http://localhost:3333', changeOrigin: false },
      '/uploads': { target: 'http://localhost:3333', changeOrigin: false },
    },
  },
  test: { environment: 'jsdom', setupFiles: ['./src/test-setup.ts'], css: false },
});
