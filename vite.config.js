import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` (development, production, etc.)
  // in the current working directory.
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [react()],
    // This makes the env variables available to the client
    define: {
      'process.env': env,
    },
    server: {
      historyApiFallback: true,
      proxy: {
        '/api': 'http://localhost:3001',
      },
    },
    test: {
      globals: true,
      environment: 'happy-dom',
      setupFiles: './src/test/setup.js',
      exclude: ['**/node_modules/**', 'e2e/**'],
    },
  }
})