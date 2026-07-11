import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  define: {
    global: 'globalThis',
  },
  base: '/',
  server: {
    proxy: {
      '/api': {
        target: 'http://85.198.96.229:8080',
        changeOrigin: true,
        secure: false,
      },
      '/chat-websocket': {
        target: 'http://85.198.96.229:8080',
        changeOrigin: true,
        secure: false,
        ws: true,
      }
    }
  }
})
