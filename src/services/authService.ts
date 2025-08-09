import { CognitoUserPool, CognitoUser, AuthenticationDetails, CognitoUserAttribute } from 'amazon-cognito-identity-js';

// AWS Cognito configuration
const poolData = {
  UserPoolId: process.env.REACT_APP_COGNITO_USER_POOL_ID || 'us-east-1_uEuByLejj',
  ClientId: process.env.REACT_APP_COGNITO_CLIENT_ID || '6f3k8cq1bha2f7bnvo8enl978c'
};

const userPool = new CognitoUserPool(poolData);

export const authService = {
  // Initialize
  init: () => {
    console.log('AWS Cognito initialized');
  },
  
  // Login a user
  login: async (email: string, password: string): Promise<{ email: string; name: string }> => {
    return new Promise((resolve, reject) => {
      const authenticationDetails = new AuthenticationDetails({
        Username: email,
        Password: password,
      });

      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
      });

      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: (result) => {
          const accessToken = result.getAccessToken().getJwtToken();
          const idToken = result.getIdToken().getJwtToken();
          
          // Get user attributes
          cognitoUser.getUserAttributes((err, attributes) => {
            if (err) {
              reject(new Error(err.message));
              return;
            }
            
            const nameAttr = attributes?.find(attr => attr.getName() === 'name');
            const emailAttr = attributes?.find(attr => attr.getName() === 'email');
            
            resolve({
              email: emailAttr?.getValue() || email,
              name: nameAttr?.getValue() || 'User'
            });
          });
        },
        onFailure: (err) => {
          if (err.code === 'UserNotConfirmedException') {
            reject(new Error('Please verify your email before logging in'));
          } else if (err.code === 'NotAuthorizedException') {
            reject(new Error('Invalid email or password'));
          } else if (err.code === 'UserNotFoundException') {
            reject(new Error('User not found'));
          } else {
            reject(new Error(err.message || 'Login failed'));
          }
        },
      });
    });
  },
  
  // Register a new user
  register: async (email: string, password: string, name: string): Promise<{ email: string; name: string; verificationCode: string }> => {
    return new Promise((resolve, reject) => {
      const attributeList = [
        new CognitoUserAttribute({
          Name: 'email',
          Value: email,
        }),
        new CognitoUserAttribute({
          Name: 'name',
          Value: name,
        }),
      ];

      userPool.signUp(email, password, attributeList, [], (err, result) => {
        if (err) {
          if (err.code === 'UsernameExistsException') {
            reject(new Error('Email already registered'));
          } else if (err.code === 'InvalidPasswordException') {
            reject(new Error('Password must be at least 8 characters with uppercase, number, and special character'));
          } else {
            reject(new Error(err.message || 'Registration failed'));
          }
          return;
        }

        // Return success - verification code will be sent by Cognito
        resolve({
          email,
          name,
          verificationCode: 'sent-via-email' // Cognito sends this automatically
        });
      });
    });
  },
  
  // Verify email with code
  verifyEmail: async (email: string, code: string): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
      });

      cognitoUser.confirmRegistration(code, true, (err, result) => {
        if (err) {
          if (err.code === 'CodeMismatchException') {
            reject(new Error('Invalid verification code'));
          } else if (err.code === 'ExpiredCodeException') {
            reject(new Error('Verification code has expired'));
          } else {
            reject(new Error(err.message || 'Verification failed'));
          }
          return;
        }
        resolve(true);
      });
    });
  },
  
  // Resend verification code
  resendVerificationCode: async (email: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
      });

      cognitoUser.resendConfirmationCode((err, result) => {
        if (err) {
          reject(new Error(err.message || 'Failed to resend verification code'));
          return;
        }
        resolve('sent-via-email'); // Cognito sends this automatically
      });
    });
  },
  
  // Forgot password
  forgotPassword: async (email: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
      });

      cognitoUser.forgotPassword({
        onSuccess: () => {
          resolve();
        },
        onFailure: (err) => {
          if (err.code === 'UserNotFoundException') {
            reject(new Error('No account found with this email'));
          } else {
            reject(new Error(err.message || 'Failed to send reset code'));
          }
        },
      });
    });
  },
  
  // Reset password with code
  resetPassword: async (email: string, code: string, newPassword: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
      });

      cognitoUser.confirmPassword(code, newPassword, {
        onSuccess: () => {
          resolve();
        },
        onFailure: (err) => {
          if (err.code === 'CodeMismatchException') {
            reject(new Error('Invalid reset code'));
          } else if (err.code === 'ExpiredCodeException') {
            reject(new Error('Reset code has expired'));
          } else if (err.code === 'InvalidPasswordException') {
            reject(new Error('Password must be at least 8 characters with uppercase, number, and special character'));
          } else {
            reject(new Error(err.message || 'Failed to reset password'));
          }
        },
      });
    });
  },
  
  // Get current authenticated user
  getCurrentUser: async (): Promise<{ email: string; name: string } | null> => {
    return new Promise((resolve) => {
      const cognitoUser = userPool.getCurrentUser();
      
      if (!cognitoUser) {
        resolve(null);
        return;
      }

      cognitoUser.getSession((err: any, session: any) => {
        if (err || !session.isValid()) {
          resolve(null);
          return;
        }

        cognitoUser.getUserAttributes((err, attributes) => {
          if (err) {
            resolve(null);
            return;
          }
          
          const nameAttr = attributes?.find(attr => attr.getName() === 'name');
          const emailAttr = attributes?.find(attr => attr.getName() === 'email');
          
          resolve({
            email: emailAttr?.getValue() || '',
            name: nameAttr?.getValue() || 'User'
          });
        });
      });
    });
  },
  
  // Sign out
  signOut: async (): Promise<void> => {
    return new Promise((resolve) => {
      const cognitoUser = userPool.getCurrentUser();
      if (cognitoUser) {
        cognitoUser.signOut();
      }
      resolve();
    });
  }
};

export default authService;