#!/bin/bash

echo "=== AWS CloudShell Deployment for Excel AI Assistant ==="
echo

# Set variables
STACK_NAME="excel-ai-assistant-stack"
REGION="us-east-1"

# Create temporary directory
mkdir -p ~/excel-ai-temp
cd ~/excel-ai-temp

# Create CloudFormation template
cat > excel-ai-infrastructure.yaml << 'EOF'
AWSTemplateFormatVersion: '2010-09-09'
Description: 'Excel AI Assistant - Bedrock Integration Infrastructure'

Parameters:
  ProjectName:
    Type: String
    Default: 'excel-ai-assistant'
    Description: 'Name of the project'

Resources:
  # S3 Bucket for file storage
  FileStorageBucket:
    Type: AWS::S3::Bucket
    Properties:
      BucketName: !Sub '${ProjectName}-files-${AWS::AccountId}'
      CorsConfiguration:
        CorsRules:
          - AllowedHeaders: ['*']
            AllowedMethods: [GET, PUT, POST, DELETE]
            AllowedOrigins: ['*']
            MaxAge: 3000
      PublicAccessBlockConfiguration:
        BlockPublicAcls: true
        BlockPublicPolicy: true
        IgnorePublicAcls: true
        RestrictPublicBuckets: true

  # IAM Role for Lambda
  LambdaExecutionRole:
    Type: AWS::IAM::Role
    Properties:
      RoleName: !Sub '${ProjectName}-lambda-role'
      AssumeRolePolicyDocument:
        Version: '2012-10-17'
        Statement:
          - Effect: Allow
            Principal:
              Service: lambda.amazonaws.com
            Action: sts:AssumeRole
      ManagedPolicyArns:
        - arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
      Policies:
        - PolicyName: BedrockAccess
          PolicyDocument:
            Version: '2012-10-17'
            Statement:
              - Effect: Allow
                Action:
                  - bedrock:InvokeModel
                Resource: 
                  - !Sub 'arn:aws:bedrock:${AWS::Region}::foundation-model/anthropic.claude-3-sonnet-20240229-v1:0'
        - PolicyName: S3Access
          PolicyDocument:
            Version: '2012-10-17'
            Statement:
              - Effect: Allow
                Action:
                  - s3:GetObject
                  - s3:PutObject
                  - s3:DeleteObject
                Resource: !Sub '${FileStorageBucket}/*'

  # Lambda Function
  ExcelAIProcessor:
    Type: AWS::Lambda::Function
    Properties:
      FunctionName: !Sub '${ProjectName}-processor'
      Runtime: nodejs20.x
      Handler: index.handler
      Role: !GetAtt LambdaExecutionRole.Arn
      Code:
        ZipFile: |
          const { BedrockRuntimeClient, InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");
          
          const bedrockClient = new BedrockRuntimeClient({ region: process.env.AWS_REGION });
          
          exports.handler = async (event) => {
              const headers = {
                  'Access-Control-Allow-Origin': '*',
                  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                  'Access-Control-Allow-Methods': 'POST,OPTIONS'
              };
          
              if (event.httpMethod === 'OPTIONS') {
                  return { statusCode: 200, headers, body: '' };
              }
          
              try {
                  const { fileData, prompt, fileName } = JSON.parse(event.body);
                  
                  const systemPrompt = `You are an Excel AI assistant. Analyze the provided Excel/CSV data and respond to user commands.
                  
          Data format: The data is provided as an array of arrays where the first row contains headers.
          Your task: ${prompt}
          
          Please provide a clear, actionable response. If the user asks for data manipulation, describe what changes should be made.`;
          
                  const userPrompt = `File: ${fileName}
          Data: ${JSON.stringify(fileData.slice(0, 50))} ${fileData.length > 50 ? '...(truncated)' : ''}
          
          Command: ${prompt}`;
          
                  const input = {
                      modelId: "anthropic.claude-3-sonnet-20240229-v1:0",
                      contentType: "application/json",
                      accept: "application/json",
                      body: JSON.stringify({
                          anthropic_version: "bedrock-2023-05-31",
                          max_tokens: 1000,
                          system: systemPrompt,
                          messages: [
                              {
                                  role: "user",
                                  content: userPrompt
                              }
                          ]
                      })
                  };
          
                  const command = new InvokeModelCommand(input);
                  const response = await bedrockClient.send(command);
                  
                  const responseBody = JSON.parse(new TextDecoder().decode(response.body));
                  const aiResponse = responseBody.content[0].text;
          
                  return {
                      statusCode: 200,
                      headers,
                      body: JSON.stringify({
                          success: true,
                          response: aiResponse,
                          fileName: fileName
                      })
                  };
          
              } catch (error) {
                  console.error('Error:', error);
                  return {
                      statusCode: 500,
                      headers,
                      body: JSON.stringify({
                          success: false,
                          error: error.message
                      })
                  };
              }
          };
      Environment:
        Variables:
          BUCKET_NAME: !Ref FileStorageBucket
      Timeout: 30
      MemorySize: 512

  # API Gateway
  ExcelAIApi:
    Type: AWS::ApiGateway::RestApi
    Properties:
      Name: !Sub '${ProjectName}-api'
      Description: 'API for Excel AI Assistant'
      EndpointConfiguration:
        Types:
          - REGIONAL

  # API Gateway Resource
  ProcessResource:
    Type: AWS::ApiGateway::Resource
    Properties:
      RestApiId: !Ref ExcelAIApi
      ParentId: !GetAtt ExcelAIApi.RootResourceId
      PathPart: 'process'

  # API Gateway Method
  ProcessMethod:
    Type: AWS::ApiGateway::Method
    Properties:
      RestApiId: !Ref ExcelAIApi
      ResourceId: !Ref ProcessResource
      HttpMethod: POST
      AuthorizationType: NONE
      Integration:
        Type: AWS_PROXY
        IntegrationHttpMethod: POST
        Uri: !Sub 'arn:aws:apigateway:${AWS::Region}:lambda:path/2015-03-31/functions/${ExcelAIProcessor.Arn}/invocations'
      MethodResponses:
        - StatusCode: 200
          ResponseHeaders:
            Access-Control-Allow-Origin: true

  # OPTIONS Method for CORS
  ProcessOptionsMethod:
    Type: AWS::ApiGateway::Method
    Properties:
      RestApiId: !Ref ExcelAIApi
      ResourceId: !Ref ProcessResource
      HttpMethod: OPTIONS
      AuthorizationType: NONE
      Integration:
        Type: MOCK
        IntegrationResponses:
          - StatusCode: 200
            ResponseHeaders:
              Access-Control-Allow-Headers: "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
              Access-Control-Allow-Methods: "'POST,OPTIONS'"
              Access-Control-Allow-Origin: "'*'"
            ResponseTemplates:
              application/json: ''
        RequestTemplates:
          application/json: '{"statusCode": 200}'
      MethodResponses:
        - StatusCode: 200
          ResponseHeaders:
            Access-Control-Allow-Headers: true
            Access-Control-Allow-Methods: true
            Access-Control-Allow-Origin: true

  # Lambda Permission for API Gateway
  LambdaApiPermission:
    Type: AWS::Lambda::Permission
    Properties:
      FunctionName: !Ref ExcelAIProcessor
      Action: lambda:InvokeFunction
      Principal: apigateway.amazonaws.com
      SourceArn: !Sub '${ExcelAIApi}/*/POST/process'

  # API Gateway Deployment
  ApiDeployment:
    Type: AWS::ApiGateway::Deployment
    DependsOn:
      - ProcessMethod
      - ProcessOptionsMethod
    Properties:
      RestApiId: !Ref ExcelAIApi
      StageName: 'prod'

Outputs:
  ApiEndpoint:
    Description: 'API Gateway endpoint URL'
    Value: !Sub 'https://${ExcelAIApi}.execute-api.${AWS::Region}.amazonaws.com/prod'
    Export:
      Name: !Sub '${ProjectName}-api-endpoint'
  
  BucketName:
    Description: 'S3 Bucket name for file storage'
    Value: !Ref FileStorageBucket
    Export:
      Name: !Sub '${ProjectName}-bucket-name'
EOF

echo "Step 1: Deploying CloudFormation stack..."
aws cloudformation deploy \
    --template-file excel-ai-infrastructure.yaml \
    --stack-name $STACK_NAME \
    --capabilities CAPABILITY_NAMED_IAM \
    --region $REGION

if [ $? -eq 0 ]; then
    echo "✅ CloudFormation deployment successful!"
    
    echo
    echo "Step 2: Getting API endpoint..."
    API_ENDPOINT=$(aws cloudformation describe-stacks \
        --stack-name $STACK_NAME \
        --query "Stacks[0].Outputs[?OutputKey=='ApiEndpoint'].OutputValue" \
        --output text \
        --region $REGION)
    
    echo
    echo "========================================="
    echo "🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!"
    echo "========================================="
    echo "API Endpoint: $API_ENDPOINT"
    echo
    echo "Next steps:"
    echo "1. Update your .env file with:"
    echo "   REACT_APP_API_ENDPOINT=$API_ENDPOINT"
    echo
    echo "2. Deploy your React app"
    echo "3. Test the integration!"
    echo "========================================="
else
    echo "❌ CloudFormation deployment failed"
    exit 1
fi

# Cleanup
cd ~
rm -rf ~/excel-ai-temp