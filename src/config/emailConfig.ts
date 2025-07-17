// EmailJS configuration with Google Workspace email
export const emailConfig = {
  serviceId: 'service_advexcel', // Replace with your EmailJS service ID
  templateId: 'template_verification', // Replace with your EmailJS template ID
  userId: 'YOUR_EMAILJS_USER_ID', // Replace with your EmailJS user ID
  
  // Google Workspace email configuration
  fromEmail: 'contact@advexcel.online', // Your active Google Workspace email
  fromName: 'Yadunandan Katragadda',
  replyTo: 'contact@advexcel.online', // Your active Google Workspace email
};

// Flag to use Google Workspace email (now active)
export const useWorkspaceEmail = true;

export default emailConfig;