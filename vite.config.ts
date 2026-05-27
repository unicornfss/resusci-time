import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: [
        'favicon.png',
        'favicon-16x16.png',
        'favicon-32x32.png',
        'favicon-192.png',
        'favicon-512.png',
        'apple-touch-icon.png',
        'ambulance-service-logo.png',
        'als-alogorhythm.png',
      ],
      manifest: {
        name: 'Resusci-Time',
        short_name: 'Resusci-Time',
        description:
          'Guided adult cardiac arrest protocol timer and checklist for ambulance resources.',
        theme_color: '#1f4f1f',
        background_color: '#dfe8df',
        display: 'standalone',
        orientation: 'any',
        start_url: './',
        scope: './',
        icons: [
          {
            src: 'favicon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'apple-touch-icon.png',
            sizes: '180x180',
            type: 'image/png',
          },
          {
            src: 'favicon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'favicon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,jpg}'],
        navigateFallback: 'index.html',
      },
    }),
  ],
  // Relative base works for both github.io/repo/ and custom-domain root (CNAME).
  base: mode === 'production' ? './' : '/',
}))
