# Email Verification Setup with Google Workspace

This application uses EmailJS to send verification emails to users from your Google Workspace account with your GoDaddy domain. Follow these steps to set up the email verification system:

## EmailJS Setup with Google Workspace

1. Create an account at [EmailJS](https://www.emailjs.com/)

2. Create a new email service:
   - Go to "Email Services" tab
   - Click "Add New Service"
   - Choose "Gmail" as your email provider
   - Connect your Google Workspace account that uses your GoDaddy domain
   - Follow the instructions to authorize EmailJS to send emails from your account

3. Create an email template:
   - Go to "Email Templates" tab
   - Click "Create New Template"
   - Set the "From Email" to your custom domain email (e.g., support@yourdomain.com)
   - Set the "From Name" to "Excel AI Assistant Support" or your preferred sender name
   - Set the "Reply To" to your no-reply email (e.g., no-reply@yourdomain.com)
   - Use the HTML template provided in `emailTemplate.html` in this directory
   - Save the template

4. Update the configuration:
   - Open `emailConfig.ts` in this directory
   - Replace the placeholder values with your actual EmailJS credentials:
     - `serviceId`: Your EmailJS service ID (e.g., "service_advexcel")
     - `templateId`: Your EmailJS template ID (e.g., "template_verification")
     - `userId`: Your EmailJS user ID (found in Account > API Keys)
     - `fromEmail`: Your custom domain email (e.g., "support@yourdomain.com")
     - `fromName`: Your sender name (e.g., "Excel AI Assistant Support")
     - `replyTo`: Your no-reply email (e.g., "no-reply@yourdomain.com")

## Google Workspace Email Setup

1. Make sure your Google Workspace account is properly set up with your GoDaddy domain
2. Verify that you can send and receive emails from your custom domain
3. Check that SPF, DKIM, and DMARC records are properly configured in your GoDaddy DNS settings
4. If using 2-factor authentication, you may need to create an app password for EmailJS

## Template Variables

The email template uses the following variables:

- `{{to_name}}`: The recipient's name
- `{{to_email}}`: The recipient's email address
- `{{verification_code}}`: The verification code
- `{{app_name}}`: The name of the application (Excel AI Assistant)
- `{{email_type}}`: The type of email (verification or password reset)
- `{{from_email}}`: Your custom domain email
- `{{from_name}}`: Your sender name
- `{{reply_to}}`: Your no-reply email

## Testing

To test the email functionality:

1. Make sure you've updated the configuration with valid EmailJS credentials
2. Register a new user with a valid email address
3. Check your email for the verification code
4. Enter the code in the verification screen

## Troubleshooting

If emails are not being sent:

1. Check the browser console for any errors
2. Verify that your EmailJS credentials are correct
3. Make sure your Google Workspace account is properly connected
4. Check your email spam folder
5. Verify that your EmailJS account is active and has available email credits
6. Check that your Google Workspace account has the necessary permissions to send emails through third-party services