export default {
  build: {
    outDir: 'dist'
  },
  define: {
    'process.env.REACT_APP_PAYMENT_API_URL': JSON.stringify(process.env.REACT_APP_PAYMENT_API_URL || 'https://zk23bd25ccxknvkxh4bp6td4vy0fhujq.lambda-url.us-east-1.on.aws/'),
    'process.env.REACT_APP_RAZORPAY_KEY_ID': JSON.stringify(process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_live_GmXkfqL5dMK0iL'),
    'process.env.REACT_APP_AWS_REGION': JSON.stringify(process.env.REACT_APP_AWS_REGION || 'us-east-1'),
    'process.env.REACT_APP_COGNITO_USER_POOL_ID': JSON.stringify(process.env.REACT_APP_COGNITO_USER_POOL_ID || 'us-east-1_uEuByLejj'),
    'process.env.REACT_APP_COGNITO_CLIENT_ID': JSON.stringify(process.env.REACT_APP_COGNITO_CLIENT_ID || '6f3k8cq1bha2f7bnvo8enl978c')
  }
};