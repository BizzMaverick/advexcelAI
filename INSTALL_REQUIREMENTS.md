# URGENT: Install Required Tools

## You need to manually install:

1. **AWS CLI** - Run as Administrator:
   ```
   msiexec /i AWSCLIV2.msi
   ```

2. **AWS SAM CLI** - Download from:
   https://github.com/aws/aws-sam-cli/releases/latest

3. **Configure AWS credentials:**
   ```
   aws configure
   ```
   Enter your:
   - AWS Access Key ID
   - AWS Secret Access Key  
   - Default region (us-east-1)

4. **Get your Razorpay Key Secret** from Razorpay dashboard

5. **Deploy:**
   ```
   set RAZORPAY_KEY_SECRET=your_actual_secret
   cd aws\payment-api
   sam build
   sam deploy --guided
   ```

## Cannot proceed without admin privileges to install AWS tools.

**The backend code is ready - just need these tools installed to deploy.**