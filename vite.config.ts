import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(),
     VitePWA({
      registerType: 'prompt',
      devOptions: {
        enabled: true,
      },
      includeAssets: ['kanri-logo.png'],
      manifest: {
        name: 'Kanri',
        short_name: 'Kanri',
        start_url: '/project',
        display: 'standalone',
        background_color: '#0f172a',
        theme_color: '#0f172a',
        icons: [
          {
            src: 'kanri-logo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
})
