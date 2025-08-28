import { useState } from 'react';
import authService from '../services/authService';

interface ModernLandingPageProps {
  onLogin: (userData: { name: string; email: string }) => void;
}

export default function ModernLandingPage({ onLogin }: ModernLandingPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const result = await authService.signIn(email, password);
        if (result.success && result.user) {
          onLogin({
            name: result.user.name || email.split('@')[0],
            email: result.user.email
          });
        } else {
          setError(result.error || 'Login failed');
        }
      } else {
        const result = await authService.signUp(email, password, name);
        if (result.success) {
          setError('Please check your email to verify your account, then login.');
          setIsLogin(true);
        } else {
          setError(result.error || 'Registration failed');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: '"Poppins", -apple-system, BlinkMacSystemFont, sans-serif',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '1200px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '60px',
        alignItems: 'center'
      }}>
        {/* Left Side - Hero Content */}
        <div style={{ color: 'white' }}>
          <div style={{
            width: '60px',
            height: '60px',
            background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
            marginBottom: '32px'
          }}>
            ✨
          </div>
          
          <h1 style={{
            fontSize: '48px',
            fontWeight: '700',
            margin: '0 0 24px 0',
            lineHeight: '1.2',
            background: 'linear-gradient(45deg, #ffffff, #f0f0f0)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Transform Your Data with AI
          </h1>
          
          <p style={{
            fontSize: '20px',
            margin: '0 0 32px 0',
            opacity: 0.9,
            lineHeight: '1.6'
          }}>
            Upload Excel files, ask questions in plain English, and get instant AI-powered insights. 
            No complex formulas needed.
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { icon: '🚀', text: 'Instant data analysis with AI' },
              { icon: '📊', text: 'Smart charts and visualizations' },
              { icon: '🔍', text: 'Natural language queries' },
              { icon: '⚡', text: 'Real-time processing' }
            ].map((feature, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '16px'
              }}>
                <span style={{ fontSize: '20px' }}>{feature.icon}</span>
                <span>{feature.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '40px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 style={{
              fontSize: '28px',
              fontWeight: '600',
              margin: '0 0 8px 0',
              color: 'white'
            }}>
              {isLogin ? 'Welcome Back' : 'Get Started'}
            </h2>
            <p style={{
              fontSize: '16px',
              margin: 0,
              color: 'rgba(255, 255, 255, 0.8)'
            }}>
              {isLogin ? 'Sign in to your account' : 'Create your free account'}
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {!isLogin && (
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  marginBottom: '8px',
                  color: 'white'
                }}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={!isLogin}
                  style={{
                    width: '100%',
                    padding: '16px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    fontSize: '16px',
                    fontFamily: 'inherit',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Enter your full name"
                />
              </div>
            )}

            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '8px',
                color: 'white'
              }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  fontSize: '16px',
                  fontFamily: 'inherit',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '8px',
                color: 'white'
              }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  fontSize: '16px',
                  fontFamily: 'inherit',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                placeholder="Enter your password"
              />
            </div>

            {error && (
              <div style={{
                background: 'rgba(255, 107, 107, 0.2)',
                border: '1px solid rgba(255, 107, 107, 0.4)',
                borderRadius: '12px',
                padding: '12px 16px',
                color: '#ff6b6b',
                fontSize: '14px'
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                background: loading ? 'rgba(255, 255, 255, 0.2)' : 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
                border: 'none',
                borderRadius: '12px',
                padding: '16px',
                color: 'white',
                fontSize: '16px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? '⏳ Processing...' : (isLogin ? '🚀 Sign In' : '✨ Create Account')}
            </button>
          </form>

          <div style={{
            textAlign: 'center',
            marginTop: '24px',
            paddingTop: '24px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <p style={{
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.8)',
              margin: '0 0 8px 0'
            }}>
              {isLogin ? "Don't have an account?" : "Already have an account?"}
            </p>
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#4ecdc4',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              {isLogin ? 'Create Account' : 'Sign In'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}