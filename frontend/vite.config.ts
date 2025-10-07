import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

// Tạo __dirname theo chuẩn ESM
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // Thường trỏ đến ./src thay vì ./
    },
  },
  server: {
    port: 3000,
    open: true,
    watch: {
      // Giảm tần suất watch để tránh lock file trên Windows
      usePolling: false,
      interval: 1000
    }
  },
  // QUAN TRỌNG: Thêm cacheDir để tránh xung đột permission
  cacheDir: './.vite-cache',
  // Tối ưu build để tránh memory issues
  build: {
    sourcemap: false,
    rollupOptions: {
      maxParallelFileOps: 5
    }
  },
  // Clear screen khi dev
  clearScreen: false
})