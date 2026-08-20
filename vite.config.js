import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon512.jpg'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true
      },
      manifest: {
        name: 'Daily Work',
        short_name: 'Daily Work',
        description: 'บันทึกงานประจำวัน',
        background_color: '#000000',
        theme_color: '#000000',
        icons: [
          {
            src: 'icon512.jpg',
            sizes: '192x192',
            type: 'image/jpeg'
          },
          {
            src: 'icon512.jpg',
            sizes: '512x512',
            type: 'image/jpeg'
          }
        ]
      }
    })
  ],
  base: '/daily-work-log/',
})