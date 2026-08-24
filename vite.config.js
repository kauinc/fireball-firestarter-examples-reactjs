import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    proxy: {
      // Dashboard token API has no CORS — proxy it in dev
      '/api/livekit-token': {
        target: 'https://dtdashboard-nine.vercel.app',
        changeOrigin: true,
      },
    },
  },
})
