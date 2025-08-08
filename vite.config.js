export default {
  build: {
    outDir: 'dist'
  },
  define: {
    'process.env.REACT_APP_PAYMENT_API_URL': JSON.stringify(process.env.REACT_APP_PAYMENT_API_URL || 'https://zk23bd25ccxknvkxh4bp6td4vy0fhujq.lambda-url.us-east-1.on.aws/'),
    'process.env.REACT_APP_RAZORPAY_KEY_ID': JSON.stringify(process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_live_rXTFpXbw0dmrLy')
  }
};