Write-Host "=== Simplified AWS Deployment ===" -ForegroundColor Green

# Check AWS CLI
try {
    aws --version
    Write-Host "AWS CLI found" -ForegroundColor Green
} catch {
    Write-Host "AWS CLI not found. Please install AWS CLI first." -ForegroundColor Red
    exit 1
}

# Deploy simple stack first
Write-Host "Deploying simplified stack..." -ForegroundColor Yellow

aws cloudformation deploy `
    --template-file "aws/cloudformation/simple-stack.yaml" `
    --stack-name "excel-ai-simple-test" `
    --capabilities CAPABILITY_IAM `
    --region "us-east-1"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Simple stack deployed successfully" -ForegroundColor Green
    
    # Get outputs
    $bucketName = aws cloudformation describe-stacks `
        --stack-name "excel-ai-simple-test" `
        --query "Stacks[0].Outputs[?OutputKey=='BucketName'].OutputValue" `
        --output text `
        --region "us-east-1"
    
    Write-Host "Bucket created: $bucketName" -ForegroundColor Cyan
} else {
    Write-Host "❌ Simple stack deployment failed" -ForegroundColor Red
    Write-Host "Checking stack events..." -ForegroundColor Yellow
    
    aws cloudformation describe-stack-events `
        --stack-name "excel-ai-simple-test" `
        --query "StackEvents[?ResourceStatus=='CREATE_FAILED'].[LogicalResourceId,ResourceStatusReason]" `
        --output table `
        --region "us-east-1"
}