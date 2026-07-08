import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa' // นำเข้าปลั๊กอิน

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon512.png'],
      manifest: {
        name: 'Daily Work',
        short_name: 'Daily Work',
        description: 'บันทึกงานประจำวัน',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'icon180.png',
            sizes: '180x180',
            type: 'image/png'
          },
          {
            src: 'icon512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  base: '/daily-work-log/',
})