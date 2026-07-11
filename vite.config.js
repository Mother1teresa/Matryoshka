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
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      },
      '/sockjs': {
        target: 'http://85.198.96.229:8080',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/sockjs/, '/ws'),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('SockJS proxy error:', err.message);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('SockJS proxy req:', req.method, req.url, '→', proxyReq.path);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('SockJS proxy res:', proxyRes.statusCode, req.url);
          });
        },
      }
    }
  }
})
