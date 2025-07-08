import React, { useState, useEffect } from 'react';
import minionGif from './assets/minion.gif';
import logoImg from './assets/logo.png';

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #1e40af 100%)',
  zIndex: 9999,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
  textAlign: 'center',
  fontFamily: 'Poppins, Arial, sans-serif',
  overflow: 'hidden',
  transition: 'background 0.7s',
};

const coinContainerStyle: React.CSSProperties = {
  perspective: '1200px',
  width: 220,
  height: 220,
  margin: '0 auto 32px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const coinStyle: React.CSSProperties = {
  width: 220,
  height: 220,
  position: 'relative',
  transformStyle: 'preserve-3d',
  transition: 'transform 1s cubic-bezier(.4,2,.6,1)',
};

const coinFaceStyle: React.CSSProperties = {
  position: 'absolute',
  width: 220,
  height: 220,
  borderRadius: '50%',
  boxShadow: '0 8px 32px rgba(59, 130, 246, 0.3)',
  border: '6px solid #3b82f6',
  background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
  objectFit: 'cover',
  backfaceVisibility: 'hidden',
};

const introStyle: React.CSSProperties = {
  fontSize: '2rem',
  fontWeight: 700,
  color: '#ffffff',
  marginBottom: 18,
  textShadow: '0 2px 8px rgba(30, 58, 138, 0.5)',
  letterSpacing: 1.2,
};

const subIntroStyle: React.CSSProperties = {
  fontSize: '1.2rem',
  color: '#fbbf24',
  marginBottom: 30,
  fontWeight: 600,
  textShadow: '0 1px 4px rgba(30, 58, 138, 0.5)',
};

const buttonStyle: React.CSSProperties = {
  marginTop: 24,
  background: 'linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%)',
  color: '#1e3a8a',
  border: 'none',
  borderRadius: '8px',
  padding: '16px 40px',
  fontSize: '1.3rem',
  fontWeight: 800,
  cursor: 'pointer',
  boxShadow: '0 4px 12px rgba(251, 191, 36, 0.3)',
  transition: 'all 0.2s ease',
  outline: 'none',
};

const welcomeStyle: React.CSSProperties = {
  fontSize: '2.2rem',
  fontWeight: 900,
  marginBottom: 12,
  letterSpacing: 2,
  color: '#ffffff',
  textShadow: '0 2px 8px rgba(30, 58, 138, 0.5)',
};

const LandingPage: React.FC<{ onBegin: () => void }> = ({ onBegin }) => {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(prev => prev + 180);
    }, 2000); // Spin every 2 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={overlayStyle}>
      <div style={coinContainerStyle}>
        <div
          style={{
            ...coinStyle,
            transform: `rotateY(${rotation}deg)`,
          }}
        >
          <img
            src={minionGif}
            alt="Minion Side"
            style={{
              ...coinFaceStyle,
              zIndex: 2,
              transform: 'rotateY(0deg)',
            }}
            draggable={false}
          />
          <img
            src={logoImg}
            alt="Logo Side"
            style={{
              ...coinFaceStyle,
              transform: 'rotateY(180deg)',
            }}
            draggable={false}
          />
        </div>
      </div>
      <div style={welcomeStyle}>Welcome to Advanced Excel AI!</div>
      <div style={introStyle}>Unleash the Power of AI in Your Spreadsheets</div>
      <div style={subIntroStyle}>
        Meet your new Excel superpower: automate, analyze, and format like never before.<br />
        <span style={{ color: '#ffffff', fontWeight: 400 }}>Your productivity, reimagined.</span>
      </div>
      <button 
        style={buttonStyle} 
        onClick={onBegin}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 6px 16px rgba(251, 191, 36, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(251, 191, 36, 0.3)';
        }}
      >
        Let's Begin
      </button>
      <style>{`
        @keyframes pop {
          0% { transform: scale(0.7); opacity: 0; }
          80% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;