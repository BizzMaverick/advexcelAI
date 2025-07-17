/**
 * Simple authentication service with mock user database
 * This can be replaced with AWS Cognito or another auth provider in production
 */

interface User {
  id: string;
  email: string;
  name: string;
  password: string;
  verified: boolean;
}

// Mock user database - in production, this would be replaced with a real database
const users: User[] = [
  {
    id: '1',
    email: 'demo@example.com',
    name: 'Demo User',
    password: 'Password123!',
    verified: true
  },
  {
    id: '2',
    email: 'admin@advexcel.com',
    name: 'Admin User',
    password: 'Admin123!',
    verified: true
  }
];

// Mock verification codes - in production, this would be sent via email
const verificationCodes: Record<string, string> = {};

// Mock password reset codes - in production, this would be sent via email
const resetCodes: Record<string, string> = {};

// Simple password hashing - in production, use a proper hashing library
const hashPassword = (password: string): string => {
  return password; // This is just a placeholder - NEVER do this in production
};

export const authService = {
  // Login a user
  login: async (email: string, password: string): Promise<{ email: string; name: string }> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      throw new Error('User not found');
    }
    
    if (user.password !== hashPassword(password)) {
      throw new Error('Invalid password');
    }
    
    if (!user.verified) {
      throw new Error('Please verify your email before logging in');
    }
    
    return { email: user.email, name: user.name };
  },
  
  // Register a new user
  register: async (email: string, password: string, name: string): Promise<{ email: string; name: string }> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if user already exists
    const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      throw new Error('Email already registered');
    }
    
    // Password validation
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      throw new Error('Password must contain at least one uppercase letter');
    }
    
    if (!/[0-9]/.test(password)) {
      throw new Error('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      throw new Error('Password must contain at least one special character');
    }
    
    // Create new user
    const newUser: User = {
      id: (users.length + 1).toString(),
      email,
      name,
      password: hashPassword(password),
      verified: false
    };
    
    // Add to mock database
    users.push(newUser);
    
    // Generate verification code
    const verificationCode = '123456'; // In production, generate a random code
    verificationCodes[email.toLowerCase()] = verificationCode;
    
    // In production, send email with verification code
    console.log(`Verification code for ${email}: ${verificationCode}`);
    
    return { email, name };
  },
  
  // Verify email with code
  verifyEmail: async (email: string, code: string): Promise<boolean> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const storedCode = verificationCodes[email.toLowerCase()];
    
    if (!storedCode) {
      throw new Error('No verification code found for this email');
    }
    
    if (storedCode !== code) {
      throw new Error('Invalid verification code');
    }
    
    // Mark user as verified
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      user.verified = true;
    }
    
    // Remove verification code
    delete verificationCodes[email.toLowerCase()];
    
    return true;
  },
  
  // Resend verification code
  resendVerificationCode: async (email: string): Promise<void> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      throw new Error('User not found');
    }
    
    if (user.verified) {
      throw new Error('Email is already verified');
    }
    
    // Generate new verification code
    const verificationCode = '123456'; // In production, generate a random code
    verificationCodes[email.toLowerCase()] = verificationCode;
    
    // In production, send email with verification code
    console.log(`New verification code for ${email}: ${verificationCode}`);
  },
  
  // Forgot password
  forgotPassword: async (email: string): Promise<void> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      throw new Error('No account found with this email');
    }
    
    // Generate reset code
    const resetCode = '123456'; // In production, generate a random code
    resetCodes[email.toLowerCase()] = resetCode;
    
    // In production, send email with reset code
    console.log(`Password reset code for ${email}: ${resetCode}`);
  },
  
  // Reset password with code
  resetPassword: async (email: string, code: string, newPassword: string): Promise<void> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const storedCode = resetCodes[email.toLowerCase()];
    
    if (!storedCode) {
      throw new Error('No reset code found for this email');
    }
    
    if (storedCode !== code) {
      throw new Error('Invalid reset code');
    }
    
    // Password validation
    if (newPassword.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(newPassword)) {
      throw new Error('Password must contain at least one uppercase letter');
    }
    
    if (!/[0-9]/.test(newPassword)) {
      throw new Error('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
      throw new Error('Password must contain at least one special character');
    }
    
    // Update user password
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      user.password = hashPassword(newPassword);
    }
    
    // Remove reset code
    delete resetCodes[email.toLowerCase()];
  },
  
  // Get current authenticated user (simulated)
  getCurrentUser: async (): Promise<{ email: string; name: string } | null> => {
    // In a real app, this would check for a valid session token
    // For this demo, we'll just return null
    return null;
  },
  
  // Sign out (simulated)
  signOut: async (): Promise<void> => {
    // In a real app, this would invalidate the session token
    // For this demo, we'll just do nothing
  }
};

export default authService;