import React, { useState } from 'react';

type LandingPageProps = {
  onBegin: () => void;
};

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

const minionGifStyle: React.CSSProperties = {
  width: 220,
  height: 220,
  borderRadius: '50%',
  boxShadow: '0 8px 32px rgba(76, 0, 255, 0.15)',
  cursor: 'pointer',
  marginBottom: 32,
  border: '6px solid #fff',
  background: '#fff',
  objectFit: 'cover',
  transition: 'opacity 0.7s',
};

const logoStyle: React.CSSProperties = {
  width: 180,
  height: 180,
  borderRadius: '24px',
  boxShadow: '0 8px 32px rgba(76, 0, 255, 0.15)',
  margin: '0 auto 32px',
  background: '#fff',
  objectFit: 'contain',
  transition: 'opacity 0.7s',
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

const LandingPage: React.FC<LandingPageProps> = ({ onBegin }) => {
  const [step, setStep] = useState<'minion' | 'intro'>('minion');
  const [fade, setFade] = useState(false);

  const handleMinionClick = () => {
    setFade(true);
    setTimeout(() => {
      setStep('intro');
      setFade(false);
    }, 600);
  };

  return (
    <div style={{ ...overlayStyle, background: step === 'intro' ? 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)' : overlayStyle.background }}>
      {step === 'minion' && (
        <>
          <img
            src="/minion.gif"
            alt="Blue Minion Welcome"
            style={{ ...minionGifStyle, opacity: fade ? 0 : 1 }}
            onClick={handleMinionClick}
            draggable={false}
          />
          <div style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: 12, letterSpacing: 2 }}>
            Welcome to Advanced Excel AI!
          </div>
          <div style={{ fontSize: '1.1rem', color: '#ffcc33', fontWeight: 600, marginBottom: 10 }}>
            Click the minion to get started
          </div>
        </>
      )}
      {step === 'intro' && (
        <>
          <img
            src="/logo.png"
            alt="App Logo"
            style={{ ...logoStyle, opacity: fade ? 0 : 1 }}
            draggable={false}
          />
          <div style={introStyle}>
            Unleash the Power of AI in Your Spreadsheets
          </div>
          <div style={subIntroStyle}>
            Meet your new Excel superpower: automate, analyze, and format like never before.<br/>
            <span style={{ color: '#fff', fontWeight: 400 }}>Your productivity, reimagined.</span>
          </div>
          <button style={buttonStyle} onClick={onBegin}>
            Let's Begin
          </button>
        </>
      )}
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