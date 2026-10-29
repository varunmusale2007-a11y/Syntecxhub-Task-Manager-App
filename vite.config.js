import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Defaults to './' so production build works in any directory or local server without npm,
  // while GitHub Actions can supply VITE_BASE_PATH=/Syntecxhub-Task-Manager-App/
  base: process.env.VITE_BASE_PATH || './',
  build: {
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]'
      }
    }
  }
})

