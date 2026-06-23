import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath, URL } from 'node:url';

// Base path is environment-driven so the same code deploys both at a domain root
// (Railway: BASE_PATH unset -> '/') and under a GitHub Pages project subpath
// (workflow sets BASE_PATH=/aventure-elya/).
// https://vite.dev/config/
export default defineConfig(() => {
  const base = process.env.BASE_PATH || '/';
  return {
  base,
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/icon-maskable.svg'],
      manifest: {
        name: "L'Aventure d'Elya",
        short_name: 'Elya',
        description: "Le jeu d'apprentissage magique d'Elya",
        theme_color: '#7c5cff',
        background_color: '#fff7ed',
        display: 'standalone',
        orientation: 'any',
        start_url: base,
        scope: base,
        icons: [
          { src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
          { src: 'icons/icon-maskable.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  };
});
