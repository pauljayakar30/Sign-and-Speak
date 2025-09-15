import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/ask-': 'http://localhost:3000',
      '/pair': 'http://localhost:3000',
      '/health': 'http://localhost:3000',
      '/env-ok': 'http://localhost:3000'
    }
  }
})
