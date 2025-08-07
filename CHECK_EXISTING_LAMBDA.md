# Check Your Existing Lambda Function

## Steps:

1. **Click on `excel-ai-payment-verification`**
2. **Check if code exists in the function**
3. **Go to Configuration → Environment variables**
   - Should have: `RAZORPAY_KEY_SECRET`
4. **Go to Configuration → Function URL** 
   - If exists, copy the URL
   - If not, create one with CORS enabled

## Get the Function URL:
- Copy the Function URL 
- Add to your `.env` file:
```
REACT_APP_PAYMENT_API_URL=https://your-function-url.lambda-url.region.on.aws/
```

## If Function is Empty:
- Upload our `lambda-deployment.zip` file
- Set environment variable `RAZORPAY_KEY_SECRET`

**Tell me what you see in the function - is there code or is it empty?**