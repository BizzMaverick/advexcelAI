@echo off
echo Deploying Excel AI Assistant AWS Infrastructure...

REM Check if AWS CLI is installed
aws --version >nul 2>&1
if %errorlevel% neq 0 (
    echo AWS CLI is not installed. Please install it first.
    exit /b 1
)

REM Set variables
set STACK_NAME=excel-ai-assistant-stack
set REGION=us-east-1

echo.
echo Step 1: Installing Lambda dependencies...
cd aws\lambda
call npm install
if %errorlevel% neq 0 (
    echo Failed to install dependencies
    exit /b 1
)

echo.
echo Step 2: Creating Lambda deployment package...
powershell -Command "Compress-Archive -Path *.js,package.json,node_modules -DestinationPath lambda-deployment.zip -Force"
if %errorlevel% neq 0 (
    echo Failed to create deployment package
    exit /b 1
)

cd ..\..

echo.
echo Step 3: Deploying CloudFormation stack...
aws cloudformation deploy ^
    --template-file aws\cloudformation\excel-ai-infrastructure.yaml ^
    --stack-name %STACK_NAME% ^
    --capabilities CAPABILITY_NAMED_IAM ^
    --region %REGION%

if %errorlevel% neq 0 (
    echo CloudFormation deployment failed
    exit /b 1
)

echo.
echo Step 4: Updating Lambda function code...
aws lambda update-function-code ^
    --function-name excel-ai-assistant-processor ^
    --zip-file fileb://aws/lambda/lambda-deployment.zip ^
    --region %REGION%

if %errorlevel% neq 0 (
    echo Lambda update failed
    exit /b 1
)

echo.
echo Step 5: Getting API endpoint...
for /f "tokens=*" %%i in ('aws cloudformation describe-stacks --stack-name %STACK_NAME% --query "Stacks[0].Outputs[?OutputKey=='ApiEndpoint'].OutputValue" --output text --region %REGION%') do set API_ENDPOINT=%%i

echo.
echo ========================================
echo Deployment completed successfully!
echo ========================================
echo API Endpoint: %API_ENDPOINT%
echo.
echo Next steps:
echo 1. Update your React app with the API endpoint
echo 2. Enable Bedrock model access in AWS Console
echo 3. Test the integration
echo ========================================

pause