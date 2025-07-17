# AWS Deployment Guide for Excel AI Assistant

This guide explains how to deploy the Excel AI Assistant application to AWS.

## Prerequisites

1. AWS Account with appropriate permissions
2. AWS CLI installed and configured
3. Node.js and npm installed

## Step 1: Deploy Frontend with AWS Amplify

1. Log in to the AWS Management Console
2. Navigate to AWS Amplify
3. Click "New App" → "Host Web App"
4. Connect to your GitHub repository
5. Configure build settings (use default settings)
6. Deploy

## Step 2: Deploy Lambda Function

1. Create a Lambda function:
   ```bash
   aws lambda create-function \
     --function-name excel-ai-function \
     --runtime nodejs18.x \
     --handler upload.handler \
     --role arn:aws:iam::YOUR_ACCOUNT_ID:role/lambda-excel-role \
     --zip-file fileb://aws/lambda/function.zip
   ```

2. Package and deploy the Lambda function:
   ```bash
   npm run package:lambda
   npm run deploy:lambda
   ```

## Step 3: Create API Gateway

1. Create a new REST API in API Gateway
2. Create a resource and POST method
3. Integrate with your Lambda function
4. Enable CORS
5. Deploy the API to a stage (e.g., "prod")
6. Note the API endpoint URL

## Step 4: Update Frontend Configuration

1. Open `src/services/awsService.js`
2. Replace `YOUR_API_GATEWAY_URL` with your actual API Gateway URL

## Step 5: Configure Domain in Route 53

1. Create a hosted zone for your domain
2. Add an A record pointing to your Amplify app
3. Update nameservers at your domain registrar (GoDaddy)

## Step 6: Update MainWorkspace.tsx

1. Import the AWS service instead of the Netlify service
2. Update API calls to use the AWS service

## Troubleshooting

- Check CloudWatch Logs for Lambda function errors
- Verify CORS settings in API Gateway
- Ensure IAM permissions are correctly configured