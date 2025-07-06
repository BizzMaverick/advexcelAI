import React, { useState } from 'react';

const LAUNCH_DATE = 'August 15th, 2025';

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
};

const modalStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.95)',
  color: '#764ba2',
  borderRadius: '16px',
  padding: '32px 40px',
  boxShadow: '0 8px 32px rgba(76, 0, 255, 0.15)',
  fontSize: '1.5rem',
  fontWeight: 600,
  marginTop: '24px',
  animation: 'pop 0.4s cubic-bezier(.68,-0.55,.27,1.55)',
};

const sparkleStyle: React.CSSProperties = {
  fontSize: '2.5rem',
  margin: '0 0.5rem',
  animation: 'sparkle 1.5s infinite alternate',
};

const buttonStyle: React.CSSProperties = {
  marginTop: '32px',
  background: 'linear-gradient(90deg, #ffb347 0%, #ffcc33 100%)',
  color: '#764ba2',
  border: 'none',
  borderRadius: '8px',
  padding: '14px 32px',
  fontSize: '1.2rem',
  fontWeight: 700,
  cursor: 'pointer',
  boxShadow: '0 2px 8px rgba(255, 204, 51, 0.15)',
  transition: 'transform 0.1s',
};

const LandingPage: React.FC = () => {
  const [showModal, setShowModal] = useState(false);

  const handleAnyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowModal(true);
  };

  const handleCloseModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowModal(false);
  };

  return (
    <div style={overlayStyle} onClick={handleAnyClick}>
      <div>
        <div style={{ fontSize: '3.5rem', fontWeight: 900, letterSpacing: '2px', marginBottom: '12px' }}>
          <span style={sparkleStyle}>✨</span>
          ADVANCED EXCEL AI
          <span style={sparkleStyle}>🚀</span>
        </div>
        <div style={{ fontSize: '2rem', marginBottom: '18px', fontWeight: 700 }}>
          Something <span style={{ color: '#ffcc33' }}>amazing</span> is coming!
        </div>
        <div style={{ fontSize: '1.3rem', marginBottom: '30px', color: '#fff', opacity: 0.9 }}>
          We are working hard to bring you the next generation of Excel superpowers.<br/>
          <span style={{ color: '#ffcc33', fontWeight: 700 }}>Launching on {LAUNCH_DATE}</span>
        </div>
        <button style={buttonStyle} onClick={handleAnyClick}>
          Notify Me &rarr;
        </button>
      </div>
      {showModal && (
        <div style={{ ...modalStyle, position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%, -30%)' }} onClick={handleCloseModal}>
          <div style={{ fontSize: '2.2rem', marginBottom: '10px' }}>🎉</div>
          <div style={{ fontWeight: 700, fontSize: '1.3rem', marginBottom: '8px' }}>
            We're launching on <span style={{ color: '#ffb347' }}>{LAUNCH_DATE}</span>!
          </div>
          <div style={{ fontSize: '1rem', color: '#764ba2', marginBottom: '10px' }}>
            Stay tuned for the most powerful AI Excel assistant ever.<br/>
            Follow us for updates and be the first to know!
          </div>
          <button style={{ ...buttonStyle, background: 'linear-gradient(90deg, #764ba2 0%, #667eea 100%)', color: 'white', marginTop: 0 }} onClick={handleCloseModal}>
            Close
          </button>
        </div>
      )}
      {/* Keyframes for animation */}
      <style>{`
        @keyframes sparkle {
          0% { filter: brightness(1.2) drop-shadow(0 0 8px #ffcc33); }
          100% { filter: brightness(1.5) drop-shadow(0 0 16px #ffb347); }
        }
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