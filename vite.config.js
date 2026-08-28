import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true // เปิดให้ Service Worker และ PWA ทำงานในโหมด dev (npm run dev)
      },
      includeAssets: ['icon512.jpg'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024, // รองรับไฟล์ภาพพื้นหลังขนาดใหญ่
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
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // 1. แยกก้อน Firebase
          if (id.includes('node_modules/firebase') || id.includes('node_modules/@firebase')) {
            return 'firebase-vendor';
          }
          // 2. แยกสาย React และ Router
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router-dom')) {
            return 'react-vendor';
          }
          // 3. แยกชุดไอคอน Lucide React
          if (id.includes('node_modules/lucide-react')) {
            return 'icons-vendor';
          }
          // 4. แยก Three.js สำหรับหน้า 3D Galaxy (ถ้ามี)
          if (id.includes('node_modules/three') || id.includes('node_modules/@react-three')) {
            return 'three-vendor';
          }
        }
      }
    }
  },
})