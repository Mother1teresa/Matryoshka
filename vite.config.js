import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: '/Matryoshka/',
  server: {
    proxy: {
      '/api': {
        target: 'http://85.198.96.229',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api/auth')
      }
    }
  }
})