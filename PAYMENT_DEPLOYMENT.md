# Payment Backend Deployment Guide

## Prerequisites
- AWS CLI configured with appropriate permissions
- AWS SAM CLI installed
- Razorpay Key Secret

## Step 1: Set Environment Variable
```bash
set RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here
```

## Step 2: Deploy Backend
```bash
cd aws\payment-api
deploy.bat
```

## Step 3: Update Frontend Environment
After deployment, copy the API Gateway URL from the output and update `.env`:
```
REACT_APP_PAYMENT_API_URL=https://your-actual-api-url.execute-api.region.amazonaws.com/Prod/payment
```

## Step 4: Test Payment Flow
1. Register new user (not admin email)
2. Should see payment page
3. Complete payment with test card
4. Payment should be verified by backend
5. Access granted to Excel AI Assistant

## Security Features
✅ Backend payment verification with Razorpay signature
✅ DynamoDB storage of verified payments
✅ 30-day subscription validity
✅ Payment status checking on login
✅ Admin bypass for katragadda225@gmail.com

## Test Cards (Razorpay)
- Card: 4111 1111 1111 1111
- CVV: Any 3 digits
- Expiry: Any future date