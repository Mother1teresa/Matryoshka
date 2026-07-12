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
        configure: (proxy, _options) => {
          proxy.on('proxyRes', (proxyRes, _req) => {
            // Переписываем Secure флаг для localhost (dev-режим)
            const cookies = proxyRes.headers['set-cookie'];
            if (cookies) {
              proxyRes.headers['set-cookie'] = cookies.map(cookie => 
                cookie.replace('Secure;', '').replace('Secure,', '').replace('Secure', '')
              );
            }
          });
        }
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