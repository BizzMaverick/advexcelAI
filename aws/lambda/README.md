# Excel AI Assistant Lambda Function

This Lambda function processes Excel data using the Gemini API.

## Setup Instructions

### 1. Get a Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the API key for the next step

### 2. Set Environment Variables in AWS Lambda

1. Go to the AWS Lambda Console
2. Select your `excel-ai-function`
3. Go to the "Configuration" tab
4. Click on "Environment variables"
5. Click "Edit"
6. Add a new environment variable:
   - Key: `GEMINI_API_KEY`
   - Value: Your Gemini API key from step 1
7. Click "Save"

### 3. Deploy the Lambda Function

1. Package the Lambda function:
   ```
   cd aws/lambda
   zip -r function.zip .
   ```

2. Upload the package to AWS Lambda:
   ```
   aws lambda update-function-code --function-name excel-ai-function --zip-file fileb://function.zip
   ```

### 4. Test the Lambda Function

1. Create a test event with this JSON:
   ```json
   {
     "body": "{\"prompt\":\"highlight rows in red\"}"
   }
   ```

2. Click "Test"
3. Verify that the function returns a successful response with data and formatting

## Troubleshooting

- If you see "No Gemini API key found" in the logs, check that the environment variable is set correctly
- If you see "Gemini API Error", check that your API key is valid and has not expired
- If the function times out, consider increasing the timeout in the Lambda configuration