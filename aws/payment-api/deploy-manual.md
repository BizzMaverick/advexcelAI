# Manual Deployment Steps

## Prerequisites Missing:
- AWS CLI not installed
- AWS SAM CLI not installed

## Install Required Tools:

1. **Install AWS CLI:**
   - Download from: https://aws.amazon.com/cli/
   - Run installer and restart terminal

2. **Install AWS SAM CLI:**
   - Download from: https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html

3. **Configure AWS:**
   ```bash
   aws configure
   ```

## Then Deploy:
```bash
set RAZORPAY_KEY_SECRET=your_actual_razorpay_secret
cd aws\payment-api
sam build
sam deploy --guided
```

## Alternative - Manual AWS Console Deployment:

1. Create Lambda function in AWS Console
2. Upload index.js code
3. Create API Gateway
4. Create DynamoDB table "ExcelAIPayments"
5. Set environment variable RAZORPAY_KEY_SECRET
6. Get API Gateway URL and update .env file