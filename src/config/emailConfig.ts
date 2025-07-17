// EmailJS configuration with Google Workspace email
export const emailConfig = {
  serviceId: 'service_gyuegyb',
  verificationTemplateId: 'template_47ro7ih', // One-Time Password template
  passwordResetTemplateId: 'template_cn1z44j', // Password Reset template
  userId: 'YOUR_EMAILJS_USER_ID', // Replace with your EmailJS user ID
  
  // Google Workspace email configuration
  fromEmail: 'contact@advexcel.online',
  fromName: 'Yadunandan Katragadda',
  replyTo: 'contact@advexcel.online',
};

// Flag to use Google Workspace email (now active)
export const useWorkspaceEmail = true;

export default emailConfig;