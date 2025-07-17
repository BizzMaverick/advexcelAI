import React, { useState, useEffect } from 'react';
import logo from './assets/logo.png';
import authService from './services/authService';

interface LandingPageProps {
  onLogin: (userData: { email: string; name: string }) => void;
}

export default function LandingPage({ onLogin }: LandingPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [pendingUser, setPendingUser] = useState<{ email: string; name: string } | null>(null);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Professional color palette
  const colors = {
    primary: '#0078d4',
    primaryDark: '#005a9e',
    success: '#107c10',
    error: '#e53e3e',
    errorLight: '#fff5f5',
    border: '#ddd',
    text: '#333',
    textSecondary: '#666',
  };

  // Check if user is already logged in
  useEffect(() => {
    const checkCurrentUser = async () => {
      try {
        const user = await authService.getCurrentUser();
        if (user) {
          onLogin({ email: user.email, name: user.name });
        }
      } catch (error) {
        console.error('Error checking current user:', error);
      }
    };

    checkCurrentUser();
  }, [onLogin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      // Simple validation
      if (!email || !password) {
        throw new Error('Please fill in all required fields');
      }
      
      if (isSignup) {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        
        if (!name) {
          throw new Error('Please enter your name');
        }
        
        // Password strength validation
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
        
        // Register new user
        const user = await authService.register(email, password, name);
        
        // Set pending user and show verification screen
        setPendingUser({ email, name: user?.name || name });
        setNeedsVerification(true);
      } else {
        // Login existing user
        const user = await authService.login(email, password);
        
        if (user) {
          onLogin({ email: user.email, name: user.name });
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingUser) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const isVerified = await authService.verifyEmail(pendingUser.email, verificationCode);
      
      if (isVerified) {
        // Try to login after verification
        try {
          const user = await authService.login(pendingUser.email, password);
          onLogin({ email: user.email, name: user.name });
        } catch (loginErr) {
          // If login fails after verification, go back to login screen
          setNeedsVerification(false);
          setPendingUser(null);
          setIsSignup(false);
        }
      } else {
        throw new Error('Invalid verification code');
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!pendingUser) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      await authService.resendVerificationCode(pendingUser.email);
      alert('A new verification code has been sent to your email');
    } catch (err: any) {
      setError(err.message || 'Failed to resend verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    setError('');
    
    try {
      if (!email) {
        throw new Error('Please enter your email address');
      }
      
      await authService.forgotPassword(email);
      setForgotPassword(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send password reset code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    setError('');
    
    try {
      if (!resetCode || !newPassword || !confirmNewPassword) {
        throw new Error('Please fill in all required fields');
      }
      
      if (newPassword !== confirmNewPassword) {
        throw new Error('Passwords do not match');
      }
      
      // Password strength validation
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
      
      await authService.resetPassword(email, resetCode, newPassword);
      
      // Reset form and show success message
      setForgotPassword(false);
      setResetCode('');
      setNewPassword('');
      setConfirmNewPassword('');
      alert('Password has been reset successfully. You can now log in with your new password.');
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignup(!isSignup);
    setError('');
    setForgotPassword(false);
  };

  // Render password reset form
  if (forgotPassword) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        padding: '20px',
        fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif',
      }}>
        <div style={{
          maxWidth: '400px',
          width: '100%',
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1), 0 2px 5px rgba(0, 0, 0, 0.05)',
          overflow: 'hidden'
        }}>
          {/* Logo Section */}
          <div style={{
            background: colors.primary,
            padding: '30px 20px',
            textAlign: 'center'
          }}>
            <img 
              src={logo} 
              alt="Excel AI Assistant" 
              style={{ 
                height: '70px',
                marginBottom: '16px'
              }}
            />
            <h1 style={{ 
              color: 'white', 
              margin: '0',
              fontSize: '26px',
              fontWeight: '500'
            }}>
              Reset Password
            </h1>
          </div>
          
          {/* Password Reset Form */}
          <div style={{ padding: '30px', textAlign: 'center' }}>
            <div style={{ 
              marginBottom: '24px',
              fontSize: '15px',
              color: colors.text,
              maxWidth: '320px',
              margin: '0 auto 24px'
            }}>
              <p>We've sent a password reset code to <strong>{email}</strong></p>
              <p>Please enter the code and your new password below.</p>
            </div>
            
            <form onSubmit={handleResetPassword} style={{ 
              display: 'inline-block',
              width: '100%',
              maxWidth: '320px',
              textAlign: 'left'
            }}>
              <div style={{ marginBottom: '20px' }}>
                <label 
                  htmlFor="resetCode" 
                  style={{ 
                    display: 'block', 
                    marginBottom: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: colors.text
                  }}
                >
                  Reset Code
                </label>
                <input
                  id="resetCode"
                  type="text"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  placeholder="Enter reset code"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `1px solid ${colors.border}`,
                    borderRadius: '4px',
                    fontSize: '14px',
                    transition: 'border-color 0.2s',
                    outline: 'none',
                    boxSizing: 'border-box',
                    textAlign: 'center',
                    letterSpacing: '4px',
                    fontWeight: '600'
                  }}
                  required
                />
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label 
                  htmlFor="newPassword" 
                  style={{ 
                    display: 'block', 
                    marginBottom: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: colors.text
                  }}
                >
                  New Password
                </label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `1px solid ${colors.border}`,
                    borderRadius: '4px',
                    fontSize: '14px',
                    transition: 'border-color 0.2s',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  required
                />
              </div>
              
              <div style={{ marginBottom: '24px' }}>
                <label 
                  htmlFor="confirmNewPassword" 
                  style={{ 
                    display: 'block', 
                    marginBottom: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: colors.text
                  }}
                >
                  Confirm New Password
                </label>
                <input
                  id="confirmNewPassword"
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Confirm new password"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `1px solid ${colors.border}`,
                    borderRadius: '4px',
                    fontSize: '14px',
                    transition: 'border-color 0.2s',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  required
                />
              </div>
              
              {error && (
                <div style={{
                  color: colors.error,
                  fontSize: '14px',
                  marginBottom: '20px',
                  padding: '10px',
                  background: colors.errorLight,
                  borderRadius: '4px',
                  border: `1px solid ${colors.error}40`,
                  boxSizing: 'border-box'
                }}>
                  <strong>Error:</strong> {error}
                </div>
              )}
              
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: colors.primary,
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '15px',
                  fontWeight: '500',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.7 : 1,
                  transition: 'background-color 0.2s',
                  boxSizing: 'border-box'
                }}
              >
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </button>
              
              <p style={{ 
                textAlign: 'center', 
                margin: '24px 0 0 0',
                fontSize: '13px'
              }}>
                <a 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    setForgotPassword(false);
                  }}
                  style={{
                    color: colors.primary,
                    textDecoration: 'none'
                  }}
                >
                  Back to login
                </a>
              </p>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Render verification screen
  if (needsVerification) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        padding: '20px',
        fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif',
      }}>
        <div style={{
          maxWidth: '400px',
          width: '100%',
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1), 0 2px 5px rgba(0, 0, 0, 0.05)',
          overflow: 'hidden'
        }}>
          {/* Logo Section */}
          <div style={{
            background: colors.primary,
            padding: '30px 20px',
            textAlign: 'center'
          }}>
            <img 
              src={logo} 
              alt="Excel AI Assistant" 
              style={{ 
                height: '70px',
                marginBottom: '16px'
              }}
            />
            <h1 style={{ 
              color: 'white', 
              margin: '0',
              fontSize: '26px',
              fontWeight: '500'
            }}>
              Email Verification
            </h1>
          </div>
          
          {/* Verification Form */}
          <div style={{ padding: '30px', textAlign: 'center' }}>
            <div style={{ 
              marginBottom: '24px',
              fontSize: '15px',
              color: colors.text,
              maxWidth: '320px',
              margin: '0 auto 24px'
            }}>
              <p>We've sent a verification code to <strong>{pendingUser?.email}</strong></p>
              <p>Please enter the code below to verify your email address.</p>
            </div>
            
            <form onSubmit={handleVerify} style={{ 
              display: 'inline-block',
              width: '100%',
              maxWidth: '320px',
              textAlign: 'left'
            }}>
              <div style={{ marginBottom: '24px' }}>
                <label 
                  htmlFor="verificationCode" 
                  style={{ 
                    display: 'block', 
                    marginBottom: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: colors.text
                  }}
                >
                  Verification Code
                </label>
                <input
                  id="verificationCode"
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Enter verification code"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `1px solid ${colors.border}`,
                    borderRadius: '4px',
                    fontSize: '14px',
                    transition: 'border-color 0.2s',
                    outline: 'none',
                    boxSizing: 'border-box',
                    textAlign: 'center',
                    letterSpacing: '4px',
                    fontWeight: '600'
                  }}
                  required
                />
              </div>
              
              {error && (
                <div style={{
                  color: colors.error,
                  fontSize: '14px',
                  marginBottom: '20px',
                  padding: '10px',
                  background: colors.errorLight,
                  borderRadius: '4px',
                  border: `1px solid ${colors.error}40`,
                  boxSizing: 'border-box'
                }}>
                  <strong>Error:</strong> {error}
                </div>
              )}
              
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: colors.primary,
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '15px',
                  fontWeight: '500',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.7 : 1,
                  transition: 'background-color 0.2s',
                  boxSizing: 'border-box'
                }}
              >
                {isLoading ? 'Verifying...' : 'Verify Email'}
              </button>
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                marginTop: '24px',
                fontSize: '13px'
              }}>
                <a 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    handleResendCode();
                  }}
                  style={{
                    color: colors.primary,
                    textDecoration: 'none'
                  }}
                >
                  Resend code
                </a>
                
                <a 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    setNeedsVerification(false);
                    setPendingUser(null);
                  }}
                  style={{
                    color: colors.primary,
                    textDecoration: 'none'
                  }}
                >
                  Back to login
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Render login/signup form
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      padding: '20px',
      fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif',
    }}>
      <div style={{
        maxWidth: '400px',
        width: '100%',
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1), 0 2px 5px rgba(0, 0, 0, 0.05)',
        overflow: 'hidden'
      }}>
        {/* Logo Section */}
        <div style={{
          background: colors.primary,
          padding: '30px 20px',
          textAlign: 'center'
        }}>
          <img 
            src={logo} 
            alt="Excel AI Assistant" 
            style={{ 
              height: '70px',
              marginBottom: '16px'
            }}
          />
          <h1 style={{ 
            color: 'white', 
            margin: '0',
            fontSize: '26px',
            fontWeight: '500'
          }}>
            Excel AI Assistant
          </h1>
          <p style={{ 
            color: 'rgba(255, 255, 255, 0.8)', 
            margin: '10px 0 0 0',
            fontSize: '15px'
          }}>
            Powered by AWS
          </p>
        </div>
        
        {/* Login/Signup Form */}
        <div style={{ padding: '30px', textAlign: 'center' }}>
          <div style={{ marginBottom: '20px' }}>
            <button 
              onClick={() => setIsSignup(false)}
              style={{
                padding: '8px 16px',
                background: !isSignup ? colors.primary : 'transparent',
                color: !isSignup ? 'white' : colors.text,
                border: `1px solid ${!isSignup ? colors.primary : colors.border}`,
                borderRadius: '4px 0 0 4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: !isSignup ? '500' : 'normal'
              }}
            >
              Login
            </button>
            <button 
              onClick={() => setIsSignup(true)}
              style={{
                padding: '8px 16px',
                background: isSignup ? colors.primary : 'transparent',
                color: isSignup ? 'white' : colors.text,
                border: `1px solid ${isSignup ? colors.primary : colors.border}`,
                borderRadius: '0 4px 4px 0',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: isSignup ? '500' : 'normal'
              }}
            >
              Sign Up
            </button>
          </div>
          
          {!isSignup ? (
            // Login Form
            <form onSubmit={handleSubmit} style={{ 
              display: 'inline-block',
              width: '100%',
              maxWidth: '320px',
              textAlign: 'left'
            }}>
              <div style={{ marginBottom: '20px' }}>
                <label 
                  htmlFor="email" 
                  style={{ 
                    display: 'block', 
                    marginBottom: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: colors.text
                  }}
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `1px solid ${colors.border}`,
                    borderRadius: '4px',
                    fontSize: '14px',
                    transition: 'border-color 0.2s',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  required
                />
              </div>
              
              <div style={{ marginBottom: '24px' }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '6px'
                }}>
                  <label 
                    htmlFor="password" 
                    style={{ 
                      fontSize: '14px',
                      fontWeight: '500',
                      color: colors.text
                    }}
                  >
                    Password
                  </label>
                  <a 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      if (email) {
                        handleForgotPassword(e);
                      } else {
                        setError('Please enter your email address to reset your password');
                      }
                    }}
                    style={{
                      fontSize: '12px',
                      color: colors.primary,
                      textDecoration: 'none'
                    }}
                  >
                    Forgot password?
                  </a>
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `1px solid ${colors.border}`,
                    borderRadius: '4px',
                    fontSize: '14px',
                    transition: 'border-color 0.2s',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  required
                />
              </div>
              
              {error && (
                <div style={{
                  color: colors.error,
                  fontSize: '14px',
                  marginBottom: '20px',
                  padding: '10px',
                  background: colors.errorLight,
                  borderRadius: '4px',
                  border: `1px solid ${colors.error}40`,
                  boxSizing: 'border-box'
                }}>
                  <strong>Error:</strong> {error}
                </div>
              )}
              
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: colors.primary,
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '15px',
                  fontWeight: '500',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.7 : 1,
                  transition: 'background-color 0.2s',
                  boxSizing: 'border-box'
                }}
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          ) : (
            // Signup Form
            <form onSubmit={handleSubmit} style={{ 
              display: 'inline-block',
              width: '100%',
              maxWidth: '320px',
              textAlign: 'left'
            }}>
              <div style={{ marginBottom: '20px' }}>
                <label 
                  htmlFor="name" 
                  style={{ 
                    display: 'block', 
                    marginBottom: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: colors.text
                  }}
                >
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `1px solid ${colors.border}`,
                    borderRadius: '4px',
                    fontSize: '14px',
                    transition: 'border-color 0.2s',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  required
                />
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label 
                  htmlFor="email" 
                  style={{ 
                    display: 'block', 
                    marginBottom: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: colors.text
                  }}
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `1px solid ${colors.border}`,
                    borderRadius: '4px',
                    fontSize: '14px',
                    transition: 'border-color 0.2s',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  required
                />
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label 
                  htmlFor="password" 
                  style={{ 
                    display: 'block', 
                    marginBottom: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: colors.text
                  }}
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `1px solid ${colors.border}`,
                    borderRadius: '4px',
                    fontSize: '14px',
                    transition: 'border-color 0.2s',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  required
                />
                <p style={{ 
                  fontSize: '12px', 
                  color: colors.textSecondary, 
                  margin: '6px 0 0 0' 
                }}>
                  Password must be at least 8 characters with uppercase, number, and special character.
                </p>
              </div>
              
              <div style={{ marginBottom: '24px' }}>
                <label 
                  htmlFor="confirmPassword" 
                  style={{ 
                    display: 'block', 
                    marginBottom: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: colors.text
                  }}
                >
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `1px solid ${colors.border}`,
                    borderRadius: '4px',
                    fontSize: '14px',
                    transition: 'border-color 0.2s',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  required
                />
              </div>
              
              {error && (
                <div style={{
                  color: colors.error,
                  fontSize: '14px',
                  marginBottom: '20px',
                  padding: '10px',
                  background: colors.errorLight,
                  borderRadius: '4px',
                  border: `1px solid ${colors.error}40`,
                  boxSizing: 'border-box'
                }}>
                  <strong>Error:</strong> {error}
                </div>
              )}
              
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: colors.primary,
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '15px',
                  fontWeight: '500',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.7 : 1,
                  transition: 'background-color 0.2s',
                  boxSizing: 'border-box'
                }}
              >
                {isLoading ? 'Signing up...' : 'Sign Up'}
              </button>
            </form>
          )}
          
          <p style={{ 
            textAlign: 'center', 
            margin: '24px 0 0 0',
            fontSize: '13px',
            color: colors.textSecondary
          }}>
            By {isSignup ? 'signing up' : 'logging in'}, you agree to our{' '}
            <a 
              href="#" 
              style={{ color: colors.primary, textDecoration: 'none' }}
              onClick={(e) => {
                e.preventDefault();
                window.open('/terms', '_blank');
              }}
            >
              Terms of Service
            </a>{' '}
            and{' '}
            <a 
              href="#" 
              style={{ color: colors.primary, textDecoration: 'none' }}
              onClick={(e) => {
                e.preventDefault();
                window.open('/privacy', '_blank');
              }}
            >
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}