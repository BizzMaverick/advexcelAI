import React, { useState } from 'react';
import logo from './assets/logo.png';

interface LandingPageProps {
  onLogin: (userData: { email: string; name: string }) => void;
}

export default function LandingPage({ onLogin }: LandingPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Professional color palette
  const colors = {
    primary: '#0078d4',
    primaryDark: '#005a9e',
    error: '#e53e3e',
    errorLight: '#fff5f5',
    border: '#ddd',
    text: '#333',
    textSecondary: '#666',
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    // Simple validation
    if (!email || !password) {
      setError('Please enter both email and password');
      setIsLoading(false);
      return;
    }
    
    // Simulate login
    setTimeout(() => {
      setIsLoading(false);
      onLogin({ email, name: email.split('@')[0] });
    }, 1000);
  };

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
        
        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ padding: '30px' }}>
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
                outline: 'none'
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
                outline: 'none'
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
          
          {error && (
            <div style={{
              color: colors.error,
              fontSize: '14px',
              marginBottom: '20px',
              padding: '10px',
              background: colors.errorLight,
              borderRadius: '4px',
              border: `1px solid ${colors.error}40`
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
              transition: 'background-color 0.2s'
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
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
          
          <p style={{ 
            textAlign: 'center', 
            margin: '24px 0 0 0',
            fontSize: '13px',
            color: colors.textSecondary
          }}>
            By logging in, you agree to our{' '}
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
  );
}