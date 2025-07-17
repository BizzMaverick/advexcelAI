import React, { useState } from 'react';

interface LandingPageProps {
  onLogin: (userData: { email: string; name: string }) => void;
}

export default function LandingPage({ onLogin }: LandingPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '400px',
        width: '100%',
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)',
        overflow: 'hidden'
      }}>
        {/* Logo Section */}
        <div style={{
          background: '#0078d4',
          padding: '30px 20px',
          textAlign: 'center'
        }}>
          <img 
            src="/logo.png" 
            alt="Excel AI Assistant" 
            style={{ 
              height: '60px',
              marginBottom: '10px'
            }}
            onError={(e) => {
              // Fallback if logo image doesn't exist
              e.currentTarget.style.display = 'none';
            }}
          />
          <h1 style={{ 
            color: 'white', 
            margin: '0',
            fontSize: '24px',
            fontWeight: '500'
          }}>
            Excel AI Assistant
          </h1>
          <p style={{ 
            color: 'rgba(255, 255, 255, 0.8)', 
            margin: '10px 0 0 0',
            fontSize: '14px'
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
                fontWeight: '500'
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
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
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
                fontWeight: '500'
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
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
              required
            />
          </div>
          
          {error && (
            <div style={{
              color: '#e53e3e',
              fontSize: '14px',
              marginBottom: '20px',
              padding: '10px',
              background: '#fff5f5',
              borderRadius: '4px'
            }}>
              {error}
            </div>
          )}
          
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '12px',
              background: '#0078d4',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1
            }}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}