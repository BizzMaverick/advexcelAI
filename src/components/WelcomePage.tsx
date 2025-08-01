import React from 'react';

interface WelcomePageProps {
  onProceed: () => void;
}

const WelcomePage: React.FC<WelcomePageProps> = ({ onProceed }) => {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '60px 40px',
        textAlign: 'center',
        maxWidth: '600px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        animation: 'fadeIn 1s ease-in'
      }}>
        <div style={{ fontSize: '80px', marginBottom: '20px' }}>🎉</div>
        <h1 style={{ 
          color: '#333', 
          fontSize: '2.5rem', 
          marginBottom: '20px',
          fontWeight: 'bold'
        }}>
          Welcome to Excel AI Assistant!
        </h1>
        <p style={{ 
          color: '#666', 
          fontSize: '1.2rem', 
          lineHeight: '1.6',
          marginBottom: '30px'
        }}>
          Transform your Excel experience with the power of AI! 
          Upload your spreadsheets and let our intelligent assistant 
          help you analyze, process, and gain insights from your data.
        </p>
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', marginBottom: '20px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '40px', marginBottom: '10px' }}>📊</div>
              <p style={{ color: '#666', fontSize: '14px' }}>Smart Analysis</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '40px', marginBottom: '10px' }}>🤖</div>
              <p style={{ color: '#666', fontSize: '14px' }}>AI Powered</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '40px', marginBottom: '10px' }}>⚡</div>
              <p style={{ color: '#666', fontSize: '14px' }}>Lightning Fast</p>
            </div>
          </div>
        </div>
        <button
          onClick={onProceed}
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            padding: '18px 40px',
            borderRadius: '50px',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'transform 0.2s ease',
            boxShadow: '0 10px 20px rgba(102, 126, 234, 0.3)'
          }}
          onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
          onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
        >
          Get Started →
        </button>
      </div>
    </div>
  );
};

export default WelcomePage;