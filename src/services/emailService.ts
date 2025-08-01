import emailjs from '@emailjs/browser';

// EmailJS configuration
const serviceId = 'service_gyuegyb';
const verificationTemplateId = 'template_47ro7ih';
const passwordResetTemplateId = 'template_cn1z44j';
const userId = '3xCIlXaFmm79QkBaB'; // Your EmailJS user ID

// Initialize EmailJS
export const initEmailJS = () => {
  try {
    emailjs.init(userId);
    console.log('EmailJS initialized successfully with user ID:', userId);
  } catch (error) {
    console.error('Failed to initialize EmailJS:', error);
  }
};

// Send verification email
export const sendVerificationEmail = async (
  email: string,
  name: string,
  code: string
): Promise<boolean> => {
  try {
    console.log('Attempting to send verification email to:', email);
    
    const templateParams = {
      to_email: email,
      to_name: name,
      verification_code: code,
      app_name: 'Excel AI Assistant',
      from_name: 'Excel AI Assistant'
    };
    
    console.log('Template params:', templateParams);
    
    console.log('EmailJS send parameters:', {
      serviceId,
      templateId: verificationTemplateId,
      templateParams,
      userId
    });
    
    const response = await emailjs.send(
      serviceId,
      verificationTemplateId,
      templateParams,
      userId
    );
    
    console.log('Verification email sent successfully:', response);
    alert(`Verification code sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Failed to send verification email:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.status,
      text: error.text
    });
    alert(`Failed to send verification email: ${error.message || error}`);
    return false;
  }
};

// Send password reset email
export const sendPasswordResetEmail = async (
  email: string,
  name: string,
  code: string
): Promise<boolean> => {
  try {
    console.log('Attempting to send password reset email to:', email);
    
    const templateParams = {
      to_email: email,
      to_name: name,
      reset_code: code,
      app_name: 'Excel AI Assistant',
      from_name: 'Excel AI Assistant'
    };
    
    const response = await emailjs.send(
      serviceId,
      passwordResetTemplateId,
      templateParams,
      userId
    );
    
    console.log('Password reset email sent successfully:', response);
    alert(`Password reset code sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    return false;
  }
};

export default {
  initEmailJS,
  sendVerificationEmail,
  sendPasswordResetEmail
};