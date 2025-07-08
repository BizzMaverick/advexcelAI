import React, { useState, useEffect } from 'react';
import minionGif from './assets/minion.gif';
import logoImg from './assets/logo.png';

// Add Google Fonts import for Hammersmith One
const fontLink = document.createElement('link');
fontLink.href = 'https://fonts.googleapis.com/css2?family=Hammersmith+One&display=swap';
fontLink.rel = 'stylesheet';
if (!document.head.querySelector('link[href*="Hammersmith+One"]')) {
  document.head.appendChild(fontLink);
}

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
  fontFamily: 'Hammersmith One, "Segoe UI", "Roboto", "Helvetica Neue", "Arial", sans-serif',
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
  transition: 'transform 1.2s cubic-bezier(.4,2,.6,1)',
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

// Remove yellow edge, use transparent or blue gradient
const coinEdgeStyle: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  left: '50%',
  width: 16,
  height: 220,
  background: 'linear-gradient(90deg, #1e3a8a 60%, #3b82f6 100%)',
  transform: 'translateX(-50%) rotateY(90deg)',
  borderRadius: '50%',
  zIndex: 1,
};

const introStyle: React.CSSProperties = {
  fontSize: '2rem',
  fontWeight: 600,
  color: '#e0f2fe',
  marginBottom: 18,
  textShadow: '0 2px 8px rgba(30, 58, 138, 0.5)',
  letterSpacing: 0.5,
  fontFamily: 'Hammersmith One, "Segoe UI", "Roboto", "Helvetica Neue", "Arial", sans-serif',
};

const subIntroStyle: React.CSSProperties = {
  fontSize: '1.2rem',
  color: '#bfdbfe',
  marginBottom: 30,
  fontWeight: 400,
  textShadow: '0 1px 4px rgba(30, 58, 138, 0.5)',
  fontFamily: 'Hammersmith One, "Segoe UI", "Roboto", "Helvetica Neue", "Arial", sans-serif',
  lineHeight: 1.6,
};

const buttonStyle: React.CSSProperties = {
  marginTop: 24,
  background: 'linear-gradient(90deg, #3b82f6 0%, #1e40af 100%)',
  color: '#ffffff',
  border: '2px solid #60a5fa',
  borderRadius: '12px',
  padding: '16px 40px',
  fontSize: '1.2rem',
  fontWeight: 600,
  cursor: 'pointer',
  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
  transition: 'all 0.2s ease',
  outline: 'none',
  fontFamily: 'Hammersmith One, "Segoe UI", "Roboto", "Helvetica Neue", "Arial", sans-serif',
  letterSpacing: 0.5,
};

const welcomeStyle: React.CSSProperties = {
  fontSize: '2.4rem',
  fontWeight: 700,
  marginBottom: 12,
  letterSpacing: 1,
  color: '#ffffff',
  textShadow: '0 2px 8px rgba(30, 58, 138, 0.5)',
  fontFamily: 'Hammersmith One, "Segoe UI", "Roboto", "Helvetica Neue", "Arial", sans-serif',
};

const welcomeAnim = {
  animation: 'fadeSlideIn 0.8s cubic-bezier(.4,2,.6,1) 0.1s both'
};
const introAnim = {
  animation: 'fadeSlideIn 0.8s cubic-bezier(.4,2,.6,1) 0.3s both'
};
const subIntroAnim = {
  animation: 'fadeSlideIn 0.8s cubic-bezier(.4,2,.6,1) 0.5s both'
};
const buttonAnim = {
  animation: 'fadeSlideIn 0.8s cubic-bezier(.4,2,.6,1) 0.7s both'
};

const LandingPage: React.FC<{ onBegin: () => void }> = ({ onBegin }) => {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(prev => prev + 180);
    }, 1200); // 3D spin every 1.2s
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={overlayStyle}>
      <div style={coinContainerStyle}>
        <div
          style={{
            ...coinStyle,
            transform: `rotateY(${rotation}deg)`
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
          <div style={coinEdgeStyle}></div>
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
      <div style={{ ...welcomeStyle, ...welcomeAnim }}>Welcome to Advanced Excel AI!</div>
      <div style={{ ...introStyle, ...introAnim }}>Unleash the Power of AI in Your Spreadsheets</div>
      <div style={{ ...subIntroStyle, ...subIntroAnim }}>
        Meet your new Excel superpower: automate, analyze, and format like never before.<br />
        <span style={{ color: '#ffffff', fontWeight: 500 }}>Your productivity, reimagined.</span>
      </div>
      <button 
        style={{ ...buttonStyle, ...buttonAnim }} 
        onClick={onBegin}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4)';
          e.currentTarget.style.background = 'linear-gradient(90deg, #1e40af 0%, #1e3a8a 100%)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
          e.currentTarget.style.background = 'linear-gradient(90deg, #3b82f6 0%, #1e40af 100%)';
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
        @keyframes fadeSlideIn {
          0% { opacity: 0; transform: translateY(40px) scale(0.98); }
          80% { opacity: 1; transform: translateY(-4px) scale(1.03); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;