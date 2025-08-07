# Manual AWS Deployment (CLI Tools Not Working)

## AWS Console Deployment Steps:

### 1. Create DynamoDB Table
- Go to AWS Console → DynamoDB → Tables → Create table
- Table name: `ExcelAIPayments`
- Partition key: `userEmail` (String)
- Use default settings → Create table

### 2. Create Lambda Function
- Go to AWS Console → Lambda → Create function
- Function name: `excel-payment-api`
- Runtime: Node.js 18.x
- Upload `aws/payment-api/lambda-deployment.zip`
- Set environment variable: `RAZORPAY_KEY_SECRET` = your_actual_secret

### 3. Create API Gateway
- Go to AWS Console → API Gateway → Create API → REST API
- Create resource: `/payment`
- Create method: `POST` → Integration type: Lambda Function
- Enable CORS
- Deploy API → Get invoke URL

### 4. Update Frontend
Add to `.env`:
```
REACT_APP_PAYMENT_API_URL=https://your-api-id.execute-api.region.amazonaws.com/prod/payment
REACT_APP_RAZORPAY_KEY_ID=your_razorpay_key_id
```

### 5. Set Lambda Permissions
- Lambda → Configuration → Permissions
- Add DynamoDB full access policy

## Files Ready:
- ✅ `lambda-deployment.zip` created
- ✅ Backend code complete
- ✅ Ready for manual deployment