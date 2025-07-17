import React, { useState } from 'react';
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
        onLogin({ email: pendingUser.email, name: pendingUser.name });
      } else {
        throw new Error('Invalid verification code');
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignup(!isSignup);
    setError('');
  };

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
              <p>Please enter the 6-digit code below to verify your email address.</p>
              <p style={{ fontSize: '13px', color: colors.textSecondary, marginTop: '12px' }}>
                For this demo, use code: <strong>123456</strong>
              </p>
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
                  placeholder="Enter 6-digit code"
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
                  maxLength={6}
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
                disabled={isLoading || verificationCode.length !== 6}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: colors.primary,
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '15px',
                  fontWeight: '500',
                  cursor: isLoading || verificationCode.length !== 6 ? 'not-allowed' : 'pointer',
                  opacity: isLoading || verificationCode.length !== 6 ? 0.7 : 1,
                  transition: 'background-color 0.2s',
                  boxSizing: 'border-box'
                }}
              >
                {isLoading ? 'Verifying...' : 'Verify Email'}
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
          
          <form onSubmit={handleSubmit} style={{ 
            display: 'inline-block',
            width: '100%',
            maxWidth: '320px',
            textAlign: 'left'
          }}>
            {isSignup && (
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
                  onFocus={(e) => {
                    e.target.style.borderColor = colors.primary;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = colors.border;
                  }}
                  required={isSignup}
                />
              </div>
            )}
            
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
                onFocus={(e) => {
                  e.target.style.borderColor = colors.primary;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = colors.border;
                }}
                required
              />
            </div>
            
            <div style={{ marginBottom: isSignup ? '20px' : '24px' }}>
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
                {!isSignup && (
                  <a 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      alert('Password reset functionality would be implemented here');
                    }}
                    style={{
                      fontSize: '12px',
                      color: colors.primary,
                      textDecoration: 'none'
                    }}
                  >
                    Forgot password?
                  </a>
                )}
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
                onFocus={(e) => {
                  e.target.style.borderColor = colors.primary;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = colors.border;
                }}
                required
              />
            </div>
            
            {isSignup && (
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
                  onFocus={(e) => {
                    e.target.style.borderColor = colors.primary;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = colors.border;
                  }}
                  required={isSignup}
                />
              </div>
            )}
            
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
              onMouseOver={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.background = colors.primaryDark;
                }
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = colors.primary;
              }}
            >
              {isLoading ? (isSignup ? 'Signing up...' : 'Logging in...') : (isSignup ? 'Sign Up' : 'Login')}
            </button>
            
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
                  alert('Terms of Service would be displayed here');
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
                  alert('Privacy Policy would be displayed here');
                }}
              >
                Privacy Policy
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}