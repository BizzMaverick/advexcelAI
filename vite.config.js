import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    build: {
      outDir: 'dist'
    },
    define: {
      'process.env.REACT_APP_PAYMENT_API_URL': JSON.stringify(env.REACT_APP_PAYMENT_API_URL),
      'process.env.REACT_APP_RAZORPAY_KEY_ID': JSON.stringify(env.REACT_APP_RAZORPAY_KEY_ID)
    }
  };
});