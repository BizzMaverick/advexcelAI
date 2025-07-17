# Email Verification Setup

This application uses EmailJS to send verification emails to users. Follow these steps to set up EmailJS for your application:

## EmailJS Setup

1. Create an account at [EmailJS](https://www.emailjs.com/)
2. Create a new email service:
   - Go to "Email Services" tab
   - Click "Add New Service"
   - Choose your email provider (Gmail, Outlook, etc.)
   - Follow the instructions to connect your email account

3. Create an email template:
   - Go to "Email Templates" tab
   - Click "Create New Template"
   - Use the HTML template provided in `emailTemplate.html` in this directory
   - Save the template

4. Update the configuration:
   - Open `emailConfig.ts` in this directory
   - Replace the placeholder values with your actual EmailJS credentials:
     - `serviceId`: Your EmailJS service ID (e.g., "service_advexcel")
     - `templateId`: Your EmailJS template ID (e.g., "template_verification")
     - `userId`: Your EmailJS user ID (found in Account > API Keys)

## Template Variables

The email template uses the following variables:

- `{{to_name}}`: The recipient's name
- `{{to_email}}`: The recipient's email address
- `{{verification_code}}`: The verification code
- `{{app_name}}`: The name of the application (Excel AI Assistant)
- `{{email_type}}`: The type of email (verification or password reset)

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
3. Make sure your email service is properly connected
4. Check your email spam folder
5. Verify that your EmailJS account is active and has available email credits