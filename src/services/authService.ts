import { Amplify, Auth } from 'aws-amplify';
import { 
  CognitoIdentityProviderClient, 
  InitiateAuthCommand,
  SignUpCommand,
  ConfirmSignUpCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
  ResendConfirmationCodeCommand
} from '@aws-sdk/client-cognito-identity-provider';

// Configure Amplify
Amplify.configure({
  Auth: {
    region: process.env.REACT_APP_AWS_REGION || 'us-east-1',
    userPoolId: process.env.REACT_APP_COGNITO_USER_POOL_ID,
    userPoolWebClientId: process.env.REACT_APP_COGNITO_CLIENT_ID,
    mandatorySignIn: true,
  }
});

// Initialize Cognito client
const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.REACT_APP_AWS_REGION || 'us-east-1',
});

interface User {
  email: string;
  name: string;
  sub?: string;
}

export const authService = {
  // Login a user
  login: async (email: string, password: string): Promise<User> => {
    try {
      const user = await Auth.signIn(email, password);
      
      return {
        email: user.attributes.email,
        name: user.attributes.name || user.attributes.email.split('@')[0],
        sub: user.attributes.sub
      };
    } catch (error: any) {
      console.error('Login error:', error);
      
      if (error.code === 'UserNotConfirmedException') {
        throw new Error('Please verify your email before logging in');
      } else if (error.code === 'NotAuthorizedException') {
        throw new Error('Incorrect username or password');
      } else if (error.code === 'UserNotFoundException') {
        throw new Error('User does not exist');
      }
      
      throw new Error('Login failed. Please try again.');
    }
  },
  
  // Register a new user
  register: async (email: string, password: string, name: string): Promise<User> => {
    try {
      await Auth.signUp({
        username: email,
        password,
        attributes: {
          email,
          name
        }
      });
      
      return { email, name };
    } catch (error: any) {
      console.error('Registration error:', error);
      
      if (error.code === 'UsernameExistsException') {
        throw new Error('An account with this email already exists');
      } else if (error.code === 'InvalidPasswordException') {
        throw new Error('Password does not meet requirements');
      } else if (error.code === 'InvalidParameterException') {
        throw new Error('Invalid email format');
      }
      
      throw new Error('Registration failed. Please try again.');
    }
  },
  
  // Verify email with code
  verifyEmail: async (email: string, code: string): Promise<boolean> => {
    try {
      await Auth.confirmSignUp(email, code);
      return true;
    } catch (error: any) {
      console.error('Verification error:', error);
      
      if (error.code === 'CodeMismatchException') {
        throw new Error('Invalid verification code');
      } else if (error.code === 'ExpiredCodeException') {
        throw new Error('Verification code has expired');
      } else if (error.code === 'LimitExceededException') {
        throw new Error('Too many attempts. Please try again later.');
      }
      
      throw new Error('Verification failed. Please try again.');
    }
  },
  
  // Resend verification code
  resendVerificationCode: async (email: string): Promise<void> => {
    try {
      await Auth.resendSignUp(email);
    } catch (error: any) {
      console.error('Resend code error:', error);
      
      if (error.code === 'LimitExceededException') {
        throw new Error('Too many attempts. Please try again later.');
      }
      
      throw new Error('Failed to resend code. Please try again.');
    }
  },
  
  // Forgot password
  forgotPassword: async (email: string): Promise<void> => {
    try {
      await Auth.forgotPassword(email);
    } catch (error: any) {
      console.error('Forgot password error:', error);
      
      if (error.code === 'UserNotFoundException') {
        throw new Error('No account found with this email');
      } else if (error.code === 'LimitExceededException') {
        throw new Error('Too many attempts. Please try again later.');
      }
      
      throw new Error('Password reset request failed. Please try again.');
    }
  },
  
  // Reset password with code
  resetPassword: async (email: string, code: string, newPassword: string): Promise<void> => {
    try {
      await Auth.forgotPasswordSubmit(email, code, newPassword);
    } catch (error: any) {
      console.error('Reset password error:', error);
      
      if (error.code === 'CodeMismatchException') {
        throw new Error('Invalid verification code');
      } else if (error.code === 'ExpiredCodeException') {
        throw new Error('Verification code has expired');
      } else if (error.code === 'InvalidPasswordException') {
        throw new Error('Password does not meet requirements');
      }
      
      throw new Error('Password reset failed. Please try again.');
    }
  },
  
  // Get current authenticated user
  getCurrentUser: async (): Promise<User | null> => {
    try {
      const user = await Auth.currentAuthenticatedUser();
      
      return {
        email: user.attributes.email,
        name: user.attributes.name || user.attributes.email.split('@')[0],
        sub: user.attributes.sub
      };
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  },
  
  // Sign out
  signOut: async (): Promise<void> => {
    try {
      await Auth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
      throw new Error('Sign out failed. Please try again.');
    }
  }
};

export default authService;