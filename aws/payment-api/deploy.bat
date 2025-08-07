@echo off
echo Installing dependencies...
npm install

echo Packaging Lambda function...
powershell Compress-Archive -Path *.js,package.json,node_modules -DestinationPath function.zip -Force

echo Deploying CloudFormation stack...
aws cloudformation deploy ^
  --template-file cloudformation.yaml ^
  --stack-name excel-ai-payment-stack ^
  --capabilities CAPABILITY_IAM ^
  --parameter-overrides RazorpayKeySecret=%RAZORPAY_KEY_SECRET%

echo Getting API endpoint...
aws cloudformation describe-stacks ^
  --stack-name excel-ai-payment-stack ^
  --query "Stacks[0].Outputs[?OutputKey=='PaymentApiUrl'].OutputValue" ^
  --output text

echo Deployment complete!