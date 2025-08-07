@echo off
echo Deploying Payment API...

if "%RAZORPAY_KEY_SECRET%"=="" (
    echo Error: RAZORPAY_KEY_SECRET environment variable not set
    echo Please run: set RAZORPAY_KEY_SECRET=your_secret_key
    exit /b 1
)

sam build
sam deploy --guided --parameter-overrides RazorpayKeySecret=%RAZORPAY_KEY_SECRET%

echo Deployment complete!