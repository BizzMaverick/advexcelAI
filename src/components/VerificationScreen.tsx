import React from 'react';

interface VerificationScreenProps {
  pendingUser: { email: string; name: string } | null;
  verificationCode: string;
  setVerificationCode: (code: string) => void;
  isLoading: boolean;
  error: string;
  handleVerify: (e: React.FormEvent) => void;
  handleResendCode: () => void;
  setNeedsVerification: (value: boolean) => void;
  setPendingUser: (user: { email: string; name: string } | null) => void;
}

export default function VerificationScreen({
  pendingUser,
  verificationCode,
  setVerificationCode,
  isLoading,
  error,
  handleVerify,
  handleResendCode,
  setNeedsVerification,
  setPendingUser
}: VerificationScreenProps) {
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