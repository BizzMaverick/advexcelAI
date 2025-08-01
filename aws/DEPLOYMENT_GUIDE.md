# AWS Bedrock Deployment Guide

## Prerequisites Completed ✅
- [x] Bedrock model access enabled (Claude 3 Sonnet)
- [x] Lambda dependencies installed

## Step 1: Install AWS CLI

1. Download from: https://aws.amazon.com/cli/
2. Install and restart command prompt
3. Configure with: `aws configure`

## Step 2: Get AWS Credentials

1. Go to AWS Console → IAM → Users
2. Click your username → Security credentials
3. Create Access Key → Command Line Interface (CLI)
4. Copy Access Key ID and Secret Access Key

## Step 3: Deploy Infrastructure

### Option A: Automated Deployment (Recommended)
```bash
# Navigate to project directory
cd c:\Users\kynandan\Desktop\advexcel-online

# Run deployment script
aws\deploy.bat
```

### Option B: Manual Deployment

1. **Create CloudFormation Stack**:
   - Go to AWS Console → CloudFormation
   - Click "Create stack" → "With new resources"
   - Upload file: `aws\cloudformation\excel-ai-infrastructure.yaml`
   - Stack name: `excel-ai-assistant-stack`
   - Click "Create stack"

2. **Create Lambda Deployment Package**:
   ```bash
   cd aws\lambda
   powershell -Command "Compress-Archive -Path *.js,package.json,node_modules -DestinationPath lambda-deployment.zip -Force"
   ```

3. **Update Lambda Function**:
   - Go to AWS Console → Lambda
   - Find function: `excel-ai-assistant-processor`
   - Upload `lambda-deployment.zip`

4. **Get API Endpoint**:
   - Go to AWS Console → API Gateway
   - Find API: `excel-ai-assistant-api`
   - Copy Invoke URL

## Step 4: Update Frontend

1. **Update .env file**:
   ```
   REACT_APP_API_ENDPOINT=https://your-api-id.execute-api.us-east-1.amazonaws.com/prod
   ```

2. **Deploy React app**:
   ```bash
   npm run build
   git add .
   git commit -m "Update API endpoint"
   git push
   ```

## Step 5: Test Integration

1. Login to your app
2. Upload Excel/CSV file
3. Enter command: "Summarize this data"
4. Verify AI response appears

## Troubleshooting

### Common Issues:

1. **"Access Denied" errors**:
   - Check IAM permissions
   - Ensure Bedrock model is enabled

2. **CORS errors**:
   - Verify API Gateway CORS settings
   - Check browser console for details

3. **Lambda timeout**:
   - Increase timeout in CloudFormation template
   - Check CloudWatch logs

### Cost Monitoring:
- Monitor usage in AWS Cost Explorer
- Set up billing alerts
- Expected cost: $10-20/month for normal usage

## Next Steps After Deployment:
1. Test with different Excel files
2. Try various AI commands
3. Monitor performance and costs
4. Consider adding authentication to API