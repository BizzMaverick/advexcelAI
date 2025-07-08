import React, { useState } from 'react';
import minionGif from './assets/minion.gif';
import logoImg from './assets/logo.png';

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
};

const coinStyle: React.CSSProperties = {
  width: 220,
  height: 220,
  position: 'relative',
  transformStyle: 'preserve-3d',
  transition: 'transform 1s cubic-bezier(.4,2,.6,1)',
  cursor: 'pointer',
};

const coinFaceStyle: React.CSSProperties = {
  position: 'absolute',
  width: 220,
  height: 220,
  borderRadius: '50%',
  boxShadow: '0 8px 32px rgba(76, 0, 255, 0.15)',
  border: '6px solid #fff',
  background: '#fff',
  objectFit: 'cover',
  backfaceVisibility: 'hidden',
};

const introStyle: React.CSSProperties = {
  fontSize: '2rem',
  fontWeight: 700,
  color: '#fff',
  marginBottom: 18,
  textShadow: '0 2px 8px #764ba2',
  letterSpacing: 1.2,
};

const subIntroStyle: React.CSSProperties = {
  fontSize: '1.2rem',
  color: '#ffcc33',
  marginBottom: 30,
  fontWeight: 600,
  textShadow: '0 1px 4px #764ba2',
};

const buttonStyle: React.CSSProperties = {
  marginTop: 24,
  background: 'linear-gradient(90deg, #ffb347 0%, #ffcc33 100%)',
  color: '#764ba2',
  border: 'none',
  borderRadius: '8px',
  padding: '16px 40px',
  fontSize: '1.3rem',
  fontWeight: 800,
  cursor: 'pointer',
  boxShadow: '0 2px 8px rgba(255, 204, 51, 0.15)',
  transition: 'transform 0.1s',
  outline: 'none',
};

const welcomeStyle: React.CSSProperties = {
  fontSize: '2.2rem',
  fontWeight: 900,
  marginBottom: 12,
  letterSpacing: 2,
};

const LandingPage: React.FC<{ onBegin: () => void }> = ({ onBegin }) => {
  const [spun, setSpun] = useState(false);

  const handleSpin = () => setSpun(s => !s);

  return (
    <div style={overlayStyle}>
      <div style={coinContainerStyle}>
        <div
          style={{
            ...coinStyle,
            transform: spun ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
          onClick={handleSpin}
          title="Click to spin"
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
        <span style={{ color: '#fff', fontWeight: 400 }}>Your productivity, reimagined.</span>
      </div>
      <button style={buttonStyle} onClick={onBegin}>
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