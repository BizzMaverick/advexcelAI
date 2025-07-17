# Excel AI Assistant

A web-based Excel assistant powered by AWS services.

## Setup Instructions

### Prerequisites

- Node.js (v14 or later)
- AWS Account with appropriate permissions
- AWS Cognito User Pool

### AWS Cognito Setup

1. Create a User Pool in AWS Cognito
   - Go to AWS Console > Cognito > User Pools > Create user pool
   - Choose "Email" as the sign-in option
   - Configure security requirements (password policy, MFA, etc.)
   - Configure sign-up experience (required attributes, verification, etc.)
   - Configure message delivery (email provider)
   - Create an app client (enable username-password auth)
   - Review and create the user pool

2. Note down the following values:
   - User Pool ID
   - App Client ID
   - AWS Region

### Environment Configuration

1. Create a `.env` file in the project root with the following variables:
   ```
   REACT_APP_AWS_REGION=your-aws-region
   REACT_APP_COGNITO_USER_POOL_ID=your-user-pool-id
   REACT_APP_COGNITO_CLIENT_ID=your-app-client-id
   ```

### Installation

1. Clone the repository
   ```
   git clone https://github.com/your-username/advexcel-online.git
   cd advexcel-online
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Start the development server
   ```
   npm start
   ```

4. Build for production
   ```
   npm run build
   ```

## Authentication Features

- User registration with email verification
- Secure login with AWS Cognito
- Password reset functionality
- Session management
- Password strength requirements
- Error handling for common authentication issues

## Deployment

1. Build the application
   ```
   npm run build
   ```

2. Deploy to AWS Amplify (recommended)
   - Connect your GitHub repository to AWS Amplify
   - Configure build settings
   - Add environment variables
   - Deploy

3. Alternatively, deploy to AWS S3 + CloudFront
   ```
   aws s3 sync build/ s3://your-bucket-name
   ```

## Security Considerations

- All passwords are securely handled by AWS Cognito
- HTTPS is enforced for all API calls
- Environment variables are used for sensitive configuration
- Password requirements enforce strong security
- Email verification is required for new accounts