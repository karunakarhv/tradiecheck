import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    historyApiFallback: true,
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
  build: {
    // Broadest WebView compatibility for iOS 13+ and Android 6+
    target: 'es2015',
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: './src/test/setup.js',
    exclude: ['**/node_modules/**', 'e2e/**'],
  },
})
