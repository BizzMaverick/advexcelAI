import emailjs from '@emailjs/browser';

// EmailJS configuration
const serviceId = 'service_gyuegyb';
const verificationTemplateId = 'template_47ro7ih';
const passwordResetTemplateId = 'template_cn1z44j';
const userId = '3xCIlXaFmm79QkBaB'; // Your EmailJS user ID

// Initialize EmailJS
export const initEmailJS = () => {
  emailjs.init(userId);
};

// Send verification email
export const sendVerificationEmail = async (
  email: string,
  name: string,
  code: string
): Promise<boolean> => {
  try {
    const response = await emailjs.send(
      serviceId,
      verificationTemplateId,
      {
        to_email: email,
        to_name: name,
        verification_code: code,
        app_name: 'Excel AI Assistant',
        from_email: 'contact@advexcel.online',
        from_name: 'Excel AI Assistant',
        reply_to: 'contact@advexcel.online'
      },
      userId
    );
    
    console.log('Verification email sent successfully:', response);
    return true;
  } catch (error) {
    console.error('Failed to send verification email:', error);
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
    const response = await emailjs.send(
      serviceId,
      passwordResetTemplateId,
      {
        to_email: email,
        to_name: name,
        reset_code: code,
        app_name: 'Excel AI Assistant',
        from_email: 'contact@advexcel.online',
        from_name: 'Excel AI Assistant',
        reply_to: 'contact@advexcel.online'
      },
      userId
    );
    
    console.log('Password reset email sent successfully:', response);
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