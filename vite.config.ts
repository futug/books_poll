import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // server: {
  //   proxy: {
  //     '/api': {
  //       target: 'https://bookpoll.vercel.app',
  //       changeOrigin: true,
  //       rewrite: (path) => path.replace(/^\/api/, '/api'),
  //     },
  //     'auth': {
  //       target: 'http://localhost:3000/api/auth/telegram',
  //       changeOrigin: true,
  //       rewrite: (path) => path.replace(/^\/auth/, '/auth'),
  //     }
  //   }
  // }
})
