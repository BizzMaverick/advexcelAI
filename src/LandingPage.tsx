import React, { useState, useEffect } from 'react';
import logo from './assets/logo.png';
import authService from './services/authService';
import emailService from './services/emailService';
import VerificationScreen from './components/VerificationScreen';
import { typography } from './styles/typography';

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
  const [actualVerificationCode, setActualVerificationCode] = useState('');

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

  // Initialize
  useEffect(() => {
    emailService.initEmailJS();
    authService.init();
  }, []);

  // Only check current user if not explicitly logging out
  useEffect(() => {
    const checkCurrentUser = async () => {
      try {
        // Don't auto-login if user just logged out
        const justLoggedOut = sessionStorage.getItem('just_logged_out');
        if (justLoggedOut) {
          sessionStorage.removeItem('just_logged_out');
          return;
        }
        
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
        
        // AWS Cognito sends verification email automatically - no need for EmailJS
        
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
      // Verify using authService's verification system
      await authService.verifyEmail(pendingUser.email, verificationCode);
      
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
      // Resend verification code using authService
      const newCode = await authService.resendVerificationCode(pendingUser.email);
      
      // AWS Cognito sends verification email automatically - no need for EmailJS
      
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
      
      // Generate reset code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      
      // AWS Cognito sends password reset email automatically - no need for EmailJS
      
      // Store the reset code for verification
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

  // Unused function - removed to fix TypeScript error
  // const toggleMode = () => { ... };

  // Render verification screen
  if (needsVerification) {
    return (
      <VerificationScreen
        pendingUser={pendingUser}
        verificationCode={verificationCode}
        setVerificationCode={setVerificationCode}
        isLoading={isLoading}
        error={error}
        handleVerify={handleVerify}
        handleResendCode={handleResendCode}
        setNeedsVerification={setNeedsVerification}
        setPendingUser={setPendingUser}
      />
    );
  }

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
              alt="AdvExcel" 
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

  // Render login/signup form
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      fontFamily: typography.fontFamily,
    }}>
      {/* Logo at top center */}
      <div style={{
        textAlign: 'center',
        padding: '30px 20px',
        background: 'rgba(255,255,255,0.1)'
      }}>
        <img 
          src={logo} 
          alt="AdvExcel" 
          style={{ 
            height: '80px',
            marginBottom: '10px'
          }}
        />
        <h1 style={{
          color: '#333',
          margin: 0,
          fontSize: '24px',
          fontWeight: 'bold'
        }}>
          AdvExcel
        </h1>
      </div>

      {/* Split layout */}
      <div className="landing-container" style={{
        display: 'flex',
        minHeight: 'calc(100vh - 140px)',
        gap: '20px',
        padding: '20px',
        alignItems: 'center',
        flexDirection: 'column'
      }}>
        <style>
          {`
            @media (min-width: 768px) {
              .landing-container {
                flex-direction: row !important;
                gap: 40px !important;
                padding: 40px !important;
              }
            }
          `}
        </style>
        {/* Left side - Welcome message */}
        <div style={{
          flex: 1,
          padding: '20px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '80px', marginBottom: '30px' }}>🎉</div>
          <h2 style={{
            color: '#333',
            fontSize: '28px',
            marginBottom: '20px',
            fontWeight: 'bold'
          }}>
            Welcome!
          </h2>
          <p style={{
            color: '#666',
            fontSize: '18px',
            lineHeight: '1.6',
            marginBottom: '40px',
            maxWidth: '500px',
            margin: '0 auto 40px'
          }}>
            Transform your Excel experience with the power of AI! 
            Upload your spreadsheets and let our intelligent assistant 
            help you analyze, process, and gain insights from your data.
          </p>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '40px',
            marginBottom: '30px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '50px', marginBottom: '10px' }}>📊</div>
              <p style={{ color: '#666', fontSize: '16px', margin: 0 }}>Smart Analysis</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '50px', marginBottom: '10px' }}>🤖</div>
              <p style={{ color: '#666', fontSize: '16px', margin: 0 }}>AI Powered</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '50px', marginBottom: '10px' }}>⚡</div>
              <p style={{ color: '#666', fontSize: '16px', margin: 0 }}>Lightning Fast</p>
            </div>
          </div>
        </div>

        {/* Right side - Login form */}
        <div style={{
          flex: 1,
          width: '100%',
          maxWidth: '450px',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden'
        }}>
          <div style={{
            background: colors.primary,
            padding: '30px 20px',
            textAlign: 'center',
            color: 'white'
          }}>
            <h2 style={{
              margin: 0,
              fontSize: '24px',
              fontWeight: '500'
            }}>
              Get Started
            </h2>
            <p style={{
              margin: '10px 0 0 0',
              opacity: 0.9,
              fontSize: '15px'
            }}>
              Sign in or create your account
            </p>
          </div>
          
          {/* Festival Season Offer */}
          <div style={{
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            color: 'white',
            padding: '16px 20px',
            textAlign: 'center',
            fontSize: '16px',
            fontWeight: '600'
          }}>
            🎉 Festival Season Offer!
          </div>
          <div style={{
            background: '#fef3c7',
            border: '1px solid #f59e0b',
            padding: '12px 20px',
            fontSize: '13px',
            color: '#92400e',
            lineHeight: '1.4',
            textAlign: 'center'
          }}>
            <strong>Special Pricing Until Jan 16, 2026:</strong><br/>
            ✨ Basic Plan: ₹49 | Full Plan: ₹199 (Save ₹29!)<br/>
            🚀 3-day free trial + 5 advanced prompts
          </div>
        
        {/* Login/Signup Form */}
        <div style={{ padding: '30px 20px', textAlign: 'center' }}>
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
            margin: '8px 0 0 0',
            fontSize: '13px',
            color: colors.textSecondary
          }}>
            By {isSignup ? 'signing up' : 'logging in'}, you agree to our{' '}
            <a 
              href="#" 
              style={{ color: colors.primary, textDecoration: 'none' }}
              onClick={(e) => {
                e.preventDefault();
                window.open('/terms-conditions', '_blank');
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
                window.open('/privacy-policy', '_blank');
              }}
            >
              Privacy Policy
            </a>
          </p>
        </div>
        </div>
      </div>
    </div>
  );
}