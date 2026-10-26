import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // GitHub Pages project site: https://remine-app.github.io/Re-chant/
  base: '/Re-chant/',
  server: {
    port: 5173,
  },
});
