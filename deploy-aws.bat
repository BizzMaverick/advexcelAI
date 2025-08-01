@echo off
echo ===== Excel AI Assistant AWS Deployment =====

REM Check AWS CLI
where aws >nul 2>&1
if %errorlevel% neq 0 (
    echo AWS CLI not found. Please install AWS CLI first.
    echo Download from: https://aws.amazon.com/cli/
    pause
    exit /b 1
)

echo Checking AWS credentials...
aws sts get-caller-identity >nul 2>&1
if %errorlevel% neq 0 (
    echo AWS credentials not configured. Run: aws configure
    pause
    exit /b 1
)

echo Step 1: Deploying CloudFormation infrastructure...
aws cloudformation deploy ^
    --template-file aws\cloudformation\excel-ai-infrastructure.yaml ^
    --stack-name excel-ai-assistant-stack ^
    --capabilities CAPABILITY_NAMED_IAM ^
    --region us-east-1

if %errorlevel% neq 0 (
    echo CloudFormation deployment failed. Checking events...
    aws cloudformation describe-stack-events ^
        --stack-name excel-ai-assistant-stack ^
        --query "StackEvents[?ResourceStatus=='CREATE_FAILED'].[LogicalResourceId,ResourceStatusReason]" ^
        --output table ^
        --region us-east-1
    pause
    exit /b 1
)

echo Step 2: Getting API endpoint...
for /f "tokens=*" %%i in ('aws cloudformation describe-stacks --stack-name excel-ai-assistant-stack --query "Stacks[0].Outputs[?OutputKey=='ApiEndpoint'].OutputValue" --output text --region us-east-1') do set API_ENDPOINT=%%i

echo.
echo ========================================
echo Deployment completed successfully!
echo ========================================
echo API Endpoint: %API_ENDPOINT%
echo.
echo Next steps:
echo 1. Update bedrockService.ts with API endpoint
echo 2. Enable Bedrock model access in AWS Console
echo 3. Deploy frontend to Amplify
echo ========================================