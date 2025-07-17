@echo off
echo ===== Excel AI Assistant AWS Deployment =====

echo Building application...
call npm run build

echo Packaging Lambda function...
cd aws\lambda
powershell Compress-Archive -Path * -DestinationPath function.zip -Force
cd ..\..

echo Deploying to AWS...
echo Please ensure you have AWS CLI configured with appropriate credentials.

echo 1. Deploying Lambda function...
aws lambda update-function-code --function-name excel-ai-function --zip-file fileb://aws/lambda/function.zip

echo 2. Deploying frontend to Amplify...
echo Please use the AWS Amplify Console to deploy the frontend.
echo Visit: https://console.aws.amazon.com/amplify/

echo Deployment complete!
echo Don't forget to update the API Gateway URL in src/services/awsService.js