# AWS Amplify Deployment Guide for Excel AI Assistant

This guide explains how to deploy the Excel AI Assistant application to AWS Amplify.

## Prerequisites

1. AWS Account with appropriate permissions
2. AWS CLI installed and configured
3. Node.js and npm installed

## Step 1: Create an Amplify App

1. Log in to the AWS Management Console
2. Navigate to AWS Amplify
3. Click "New App" → "Host Web App"
4. Connect to your GitHub repository
   - Select your repository
   - Select the main branch
   - Click "Next"

## Step 2: Configure Build Settings

1. In the "App build specification" section, keep the default settings
2. The build spec should match our amplify.yml file:
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm ci
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: dist
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
   ```
3. Click "Next"
4. Review the settings and click "Save and deploy"

## Step 3: Update API Endpoint

1. After deployment, get your Amplify app URL
2. Open `src/services/awsService.js`
3. Update the API Gateway URL if needed to match your Lambda function

## Step 4: Configure Environment Variables (Optional)

1. In the Amplify Console, go to your app
2. Click on "Environment variables"
3. Add any required environment variables:
   - Key: `REACT_APP_API_URL`
   - Value: Your API Gateway URL

## Step 5: Set Up Custom Domain (Optional)

1. In the Amplify Console, go to your app
2. Click on "Domain management"
3. Click "Add domain"
4. Follow the steps to set up your custom domain

## Step 6: Continuous Deployment

Amplify automatically sets up continuous deployment from your GitHub repository. Any push to the main branch will trigger a new deployment.

## Manual Deployment

If you need to manually deploy:

1. For Windows users:
   ```
   deploy-amplify.bat
   ```

2. For Linux/macOS users:
   ```
   ./deploy-amplify.sh
   ```

**Note:** Make sure to replace `YOUR_AMPLIFY_APP_ID` in the scripts with your actual Amplify App ID.

## Troubleshooting

- If the build fails, check the build logs in the Amplify Console
- Ensure your repository has the correct amplify.yml file
- Verify that all dependencies are properly listed in package.json
- Check that the API Gateway URL in awsService.js is correct