import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

<<<<<<< HEAD
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
}) 
=======
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})
>>>>>>> 21ae1af82d09521b87df252822dab1fb1422f456
