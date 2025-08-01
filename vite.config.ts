import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          chart: ['chart.js', 'react-chartjs-2'],
        }
      }
    }
  },
  optimizeDeps: {
    include: ['@emailjs/browser']
  },
  define: {
    global: 'globalThis'
  }
})