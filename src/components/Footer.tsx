import React, { useState } from 'react';

const Footer: React.FC = () => {
  const [showPolicy, setShowPolicy] = useState<string | null>(null);

  const policies = {
    about: { title: "About Excel AI Assistant", content: "<h3>🤖 What We Do</h3><p>Excel AI Assistant transforms spreadsheet workflows with AI.</p>" },
    privacy: { title: "Privacy Policy", content: "<h3>🔒 Your Privacy Matters</h3><p>We protect your data with enterprise-grade security.</p>" },
    terms: { title: "Terms of Service", content: "<h3>📋 Terms of Service</h3><p>By using our service, you agree to these terms.</p>" },
    security: { title: "Security Policy", content: "<h3>🛡️ Security Policy</h3><p>Your data is encrypted and secure.</p>" },
    refund: { title: "Refund Policy", content: "<h3>💰 Refund Policy</h3><p>7-day refund window for all purchases.</p>" }
  };

  const PolicyModal = ({ policy, onClose }: { policy: { title: string; content: string }, onClose: () => void }) => (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.8)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: 'white', borderRadius: '12px', padding: '30px', maxWidth: '800px', maxHeight: '80vh', overflow: 'auto', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '15px', right: '20px', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#6b7280' }}>×</button>
        <h2 style={{ color: '#1f2937', marginBottom: '20px' }}>{policy.title}</h2>
        <div style={{ color: '#374151', lineHeight: '1.6' }} dangerouslySetInnerHTML={{ __html: policy.content }} />
      </div>
    </div>
  );

  return (
    <>
      <footer style={{ background: 'rgba(30, 58, 138, 0.9)', borderTop: '1px solid rgba(255,255,255,0.1)', padding: '40px 20px 20px', marginTop: '40px', color: '#bfdbfe' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '30px', marginBottom: '30px' }}>
            
            <div>
              <h3 style={{ color: '#ffffff', marginBottom: '15px', fontSize: '1.1rem' }}>🤖 Excel AI Assistant</h3>
              <p style={{ marginBottom: '15px', lineHeight: '1.6', fontSize: '0.9rem' }}>Transform your Excel workflow with AI. Upload, ask, and get results instantly.</p>
              <div style={{ marginBottom: '8px', fontSize: '0.85rem' }}>
                <strong>📧 Contact:</strong><br/>
                <a href="mailto:contact@advexcel.online" style={{ color: '#60a5fa', textDecoration: 'none' }}>contact@advexcel.online</a>
              </div>
              <div style={{ fontSize: '0.85rem' }}>
                <strong>🌐 Website:</strong><br/>
                <a href="https://advexcel.online" style={{ color: '#60a5fa', textDecoration: 'none' }}>advexcel.online</a>
              </div>
            </div>

            <div>
              <h4 style={{ color: '#ffffff', marginBottom: '15px', fontSize: '1rem' }}>Quick Links</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <a href="#" onClick={(e) => { e.preventDefault(); setShowPolicy('about'); }} style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '0.85rem' }}>About Us</a>
                <a href="#features" style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '0.85rem' }}>Features</a>
                <a href="#pricing" style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '0.85rem' }}>Pricing</a>
                <a href="mailto:contact@advexcel.online" style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '0.85rem' }}>Contact Support</a>
              </div>
            </div>

            <div>
              <h4 style={{ color: '#ffffff', marginBottom: '15px', fontSize: '1rem' }}>Legal & Policies</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button onClick={() => setShowPolicy('privacy')} style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', textAlign: 'left', padding: 0, fontSize: '0.85rem' }}>Privacy Policy</button>
                <button onClick={() => setShowPolicy('terms')} style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', textAlign: 'left', padding: 0, fontSize: '0.85rem' }}>Terms of Service</button>
                <button onClick={() => setShowPolicy('security')} style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', textAlign: 'left', padding: 0, fontSize: '0.85rem' }}>Security Policy</button>
                <button onClick={() => setShowPolicy('refund')} style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', textAlign: 'left', padding: 0, fontSize: '0.85rem' }}>Refund Policy</button>
              </div>
            </div>

            <div>
              <h4 style={{ color: '#ffffff', marginBottom: '15px', fontSize: '1rem' }}>Features</h4>
              <div style={{ fontSize: '0.85rem', lineHeight: '1.6', color: '#cbd5e1' }}>
                ✨ Natural Language Processing<br/>
                📊 Data Analytics & Pivot Tables<br/>
                📈 Chart Generation<br/>
                🎨 Smart Formatting<br/>
                🔒 Secure File Processing<br/>
                💾 Multiple Export Formats
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>© 2024 Excel AI Assistant. All rights reserved. Made with ❤️ for Excel users.</div>
            <div style={{ display: 'flex', gap: '15px', fontSize: '0.85rem', color: '#94a3b8' }}>
              <span>🇮🇳 Proudly Made in India</span>
              <span>🤖 Powered by Google Gemini AI</span>
            </div>
          </div>
        </div>
      </footer>

      {showPolicy && <PolicyModal policy={policies[showPolicy as keyof typeof policies]} onClose={() => setShowPolicy(null)} />}
    </>
  );
};

export default Footer;