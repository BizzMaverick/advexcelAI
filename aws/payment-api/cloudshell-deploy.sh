#!/bin/bash

# Upload these files to CloudShell first:
# - index.js
# - package.json  
# - cloudformation.yaml

echo "Installing dependencies..."
npm install

echo "Creating deployment package..."
zip -r function.zip index.js package.json node_modules/

echo "Deploying CloudFormation stack..."
aws cloudformation deploy \
  --template-file cloudformation.yaml \
  --stack-name excel-ai-payment-stack \
  --capabilities CAPABILITY_IAM \
  --parameter-overrides RazorpayKeySecret=OqzJ95rLtw69bbEvSy53ltyc

echo "Getting API endpoint URL..."
aws cloudformation describe-stacks \
  --stack-name excel-ai-payment-stack \
  --query "Stacks[0].Outputs[?OutputKey=='PaymentApiUrl'].OutputValue" \
  --output text

echo "Deployment complete!"