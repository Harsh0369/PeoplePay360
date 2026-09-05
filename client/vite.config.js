import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Backend (PeoplePay360 API) runs on :5000
      '/api': 'http://localhost:5000',
    },
  },
});
