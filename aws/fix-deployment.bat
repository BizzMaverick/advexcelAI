@echo off
echo === Checking AWS CLI and Deployment Issues ===

REM Check if AWS CLI is in PATH
where aws >nul 2>&1
if %errorlevel% neq 0 (
    echo AWS CLI not found in PATH
    echo Please install AWS CLI or add it to PATH
    echo Download from: https://aws.amazon.com/cli/
    pause
    exit /b 1
)

echo AWS CLI found, checking version...
aws --version

echo.
echo Checking AWS credentials...
aws sts get-caller-identity

if %errorlevel% neq 0 (
    echo AWS credentials not configured
    echo Run: aws configure
    pause
    exit /b 1
)

echo.
echo Deploying simplified test stack...
aws cloudformation deploy ^
    --template-file aws\cloudformation\simple-stack.yaml ^
    --stack-name excel-ai-simple-test ^
    --capabilities CAPABILITY_IAM ^
    --region us-east-1

if %errorlevel% neq 0 (
    echo Deployment failed, checking events...
    aws cloudformation describe-stack-events ^
        --stack-name excel-ai-simple-test ^
        --query "StackEvents[?ResourceStatus=='CREATE_FAILED'].[LogicalResourceId,ResourceStatusReason]" ^
        --output table ^
        --region us-east-1
) else (
    echo Deployment successful!
)

pause