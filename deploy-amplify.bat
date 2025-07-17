@echo off
echo ===== Excel AI Assistant AWS Amplify Deployment =====

echo Building application...
call npm run build

echo Deploying to AWS Amplify...
echo Please ensure you have AWS CLI configured with appropriate credentials.

echo 1. Initializing Amplify...
aws amplify start-deployment --app-id YOUR_AMPLIFY_APP_ID --branch-name main

echo Deployment initiated!
echo Check the AWS Amplify Console for deployment status: https://console.aws.amazon.com/amplify/