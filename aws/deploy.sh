#!/bin/bash

# Deploy payment infrastructure
echo "Deploying payment infrastructure..."

# Install Lambda dependencies
cd lambda
npm install
cd ..

# Deploy CloudFormation stack
sam deploy --template-file cloudformation/payment-infrastructure.yaml \
  --stack-name advexcel-payment-stack \
  --parameter-overrides \
    RazorpayKeyId="rzp_test_GwLaqT264JyMlU" \
    RazorpayKeySecret="YOUR_RAZORPAY_KEY_SECRET" \
  --capabilities CAPABILITY_IAM \
  --region us-east-1

# Get API Gateway URL
API_URL=$(aws cloudformation describe-stacks \
  --stack-name advexcel-payment-stack \
  --query 'Stacks[0].Outputs[?OutputKey==`ApiGatewayEndpoint`].OutputValue' \
  --output text)

echo "API Gateway URL: $API_URL"
echo "Update your .env file with: REACT_APP_API_URL=$API_URL"