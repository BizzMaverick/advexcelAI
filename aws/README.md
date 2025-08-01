# AWS Bedrock Integration Setup

## Prerequisites

1. **AWS CLI installed and configured**
   ```bash
   aws configure
   ```

2. **Node.js 20+ installed**

3. **AWS Account with Bedrock access**
   - Enable Claude 3 Sonnet model in AWS Bedrock console
   - Ensure you have permissions for Lambda, API Gateway, S3, and Bedrock

## Deployment Steps

### 1. Enable Bedrock Model Access
1. Go to AWS Console → Bedrock → Model access
2. Request access to "Claude 3 Sonnet" model
3. Wait for approval (usually instant)

### 2. Deploy Infrastructure
```bash
# Run the deployment script
aws\deploy.bat
```

This will:
- Create S3 bucket for file storage
- Deploy Lambda function with Node.js 20 runtime
- Set up API Gateway with CORS
- Configure IAM roles and permissions

### 3. Update Frontend Configuration
1. Copy the API endpoint from deployment output
2. Update your `.env` file:
   ```
   REACT_APP_API_ENDPOINT=https://your-api-gateway-url.execute-api.us-east-1.amazonaws.com/prod
   ```

### 4. Test the Integration
1. Deploy your React app
2. Upload an Excel/CSV file
3. Enter a command like "Summarize this data"
4. Verify AI response appears

## Architecture

```
React App → API Gateway → Lambda Function → Bedrock (Claude 3)
                ↓
            S3 Bucket (file storage)
```

## Troubleshooting

### Common Issues

1. **Bedrock Access Denied**
   - Ensure Claude 3 Sonnet model is enabled in Bedrock console
   - Check IAM permissions for Bedrock access

2. **CORS Errors**
   - Verify API Gateway CORS configuration
   - Check if OPTIONS method is properly configured

3. **Lambda Timeout**
   - Increase timeout in CloudFormation template
   - Optimize file processing for large files

4. **High Costs**
   - Monitor Bedrock usage in AWS Cost Explorer
   - Implement request throttling if needed

## Cost Estimation

- **Lambda**: ~$0.20 per 1M requests
- **API Gateway**: ~$3.50 per 1M requests  
- **Bedrock Claude 3 Sonnet**: ~$3 per 1M input tokens
- **S3**: ~$0.023 per GB/month

For typical usage (100 requests/day), expect ~$10-20/month.

## Security Notes

- API Gateway has no authentication (add Cognito if needed)
- S3 bucket blocks public access
- Lambda runs with minimal required permissions
- Consider adding rate limiting for production use