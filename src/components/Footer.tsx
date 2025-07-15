import React, { useState } from 'react';

const Footer: React.FC = () => {
  const [showPolicy, setShowPolicy] = useState<string | null>(null);

  const policies = {
    about: {
      title: "About Excel AI Assistant",
      content: `
        <h3>🤖 What We Do</h3>
        <p>Excel AI Assistant is an innovative web application that transforms how you work with spreadsheets. Using advanced AI technology, we make Excel operations as simple as typing what you want in plain English.</p>
        
        <h3>🎯 Our Mission</h3>
        <p>To democratize data analysis by making Excel accessible to everyone, regardless of their technical expertise. No more complex formulas or confusing functions - just tell us what you want, and we'll do it.</p>
        
        <h3>✨ Key Features</h3>
        <ul>
          <li>Natural language processing for Excel operations</li>
          <li>Advanced data analytics and pivot tables</li>
          <li>Smart formatting and conditional highlighting</li>
          <li>Chart generation and data visualization</li>
          <li>Multi-sheet support with collaboration features</li>
          <li>Secure file processing with privacy protection</li>
        </ul>
        
        <h3>🚀 Technology</h3>
        <p>Built with React, TypeScript, and powered by Google Gemini AI for intelligent spreadsheet processing. Our platform ensures fast, accurate, and secure handling of your data.</p>
        
        <h3>📞 Contact Us</h3>
        <p>Email: <a href="mailto:contact@advexcel.online">contact@advexcel.online</a><br/>
        Website: <a href="https://advexcel.online">https://advexcel.online</a></p>
      `
    },
    privacy: {
      title: "Privacy Policy",
      content: `
        <h3>🔒 Your Privacy Matters</h3>
        <p><strong>Last Updated:</strong> ${new Date().toLocaleDateString()}</p>
        
        <h3>📊 Data We Collect</h3>
        <ul>
          <li><strong>File Data:</strong> Excel/CSV files you upload for processing</li>
          <li><strong>Usage Data:</strong> AI requests, feature usage, error logs</li>
          <li><strong>Technical Data:</strong> IP address, browser type, device information</li>
          <li><strong>Account Data:</strong> Email, payment information (if applicable)</li>
        </ul>
        
        <h3>🎯 How We Use Your Data</h3>
        <ul>
          <li>Process your spreadsheet requests through AI</li>
          <li>Improve our service quality and features</li>
          <li>Provide customer support</li>
          <li>Send service updates and notifications</li>
        </ul>
        
        <h3>🛡️ Data Protection</h3>
        <ul>
          <li><strong>Encryption:</strong> All data transmitted using HTTPS/TLS</li>
          <li><strong>Storage:</strong> Files processed temporarily, deleted after 24 hours</li>
          <li><strong>Access:</strong> Only authorized personnel can access systems</li>
          <li><strong>No Sharing:</strong> We never sell or share your personal data</li>
        </ul>
        
        <h3>🍪 Cookies</h3>
        <p>We use essential cookies for functionality and analytics cookies to improve our service. You can disable non-essential cookies in your browser settings.</p>
        
        <h3>📧 Contact for Privacy</h3>
        <p>Email: <a href="mailto:contact@advexcel.online">contact@advexcel.online</a></p>
      `
    },
    terms: {
      title: "Terms of Service",
      content: `
        <h3>📋 Terms of Service</h3>
        <p><strong>Last Updated:</strong> ${new Date().toLocaleDateString()}</p>
        
        <h3>✅ Acceptance of Terms</h3>
        <p>By using Excel AI Assistant, you agree to these terms. If you don't agree, please don't use our service.</p>
        
        <h3>🎯 Service Description</h3>
        <ul>
          <li>AI-powered Excel and CSV file processing</li>
          <li>Natural language spreadsheet operations</li>
          <li>Data analysis and visualization tools</li>
          <li>File format conversion and download</li>
        </ul>
        
        <h3>👤 User Responsibilities</h3>
        <ul>
          <li>Provide accurate information</li>
          <li>Use service for lawful purposes only</li>
          <li>Don't upload malicious or copyrighted content</li>
          <li>Respect usage limits and fair use policies</li>
        </ul>
        
        <h3>🚫 Prohibited Uses</h3>
        <ul>
          <li>Illegal activities or content</li>
          <li>Spam, harassment, or abuse</li>
          <li>Reverse engineering or hacking attempts</li>
          <li>Excessive usage that impacts service quality</li>
        </ul>
        
        <h3>💰 Payment Terms</h3>
        <ul>
          <li>Free tier: 10 AI requests/day, 1MB file limit</li>
          <li>Paid plans: As displayed on pricing page</li>
          <li>Refunds: Available within 7 days of purchase</li>
          <li>Auto-renewal: Can be cancelled anytime</li>
        </ul>
        
        <h3>⚖️ Limitation of Liability</h3>
        <p>We provide the service "as is" without warranties. We're not liable for data loss, business interruption, or indirect damages.</p>
        
        <h3>📧 Contact</h3>
        <p>Email: <a href="mailto:contact@advexcel.online">contact@advexcel.online</a></p>
      `
    },
    security: {
      title: "Security Policy",
      content: `
        <h3>🛡️ Security Policy</h3>
        <p><strong>Last Updated:</strong> ${new Date().toLocaleDateString()}</p>
        
        <h3>🔐 Data Security Measures</h3>
        <ul>
          <li><strong>Encryption in Transit:</strong> All data encrypted using TLS 1.3</li>
          <li><strong>Encryption at Rest:</strong> Files encrypted using AES-256</li>
          <li><strong>Secure Processing:</strong> AI processing in isolated environments</li>
          <li><strong>Access Controls:</strong> Multi-factor authentication for staff</li>
        </ul>
        
        <h3>🗂️ File Handling</h3>
        <ul>
          <li><strong>Temporary Storage:</strong> Files stored only during processing</li>
          <li><strong>Auto-Deletion:</strong> All files deleted within 24 hours</li>
          <li><strong>No Backup:</strong> We don't create permanent backups of your files</li>
          <li><strong>Virus Scanning:</strong> All uploads scanned for malware</li>
        </ul>
        
        <h3>🔍 Monitoring & Logging</h3>
        <ul>
          <li>24/7 security monitoring</li>
          <li>Automated threat detection</li>
          <li>Regular security audits</li>
          <li>Incident response procedures</li>
        </ul>
        
        <h3>🚨 Report Security Issues</h3>
        <p>Found a security vulnerability? Please report it responsibly:</p>
        <p>Email: <a href="mailto:contact@advexcel.online">contact@advexcel.online</a><br/>
        We'll respond within 24 hours and provide updates on resolution.</p>
        
        <h3>🏆 Compliance</h3>
        <ul>
          <li>GDPR compliant for EU users</li>
          <li>SOC 2 Type II certified</li>
          <li>Regular penetration testing</li>
          <li>Industry standard security practices</li>
        </ul>
      `
    },
    refund: {
      title: "Refund Policy",
      content: `
        <h3>💰 Refund Policy</h3>
        <p><strong>Last Updated:</strong> ${new Date().toLocaleDateString()}</p>
        
        <h3>✅ Refund Eligibility</h3>
        <ul>
          <li><strong>7-Day Window:</strong> Request refunds within 7 days of purchase</li>
          <li><strong>Service Issues:</strong> Technical problems preventing usage</li>
          <li><strong>Billing Errors:</strong> Incorrect charges or duplicate payments</li>
          <li><strong>Subscription Cancellation:</strong> Unused portion of subscription</li>
        </ul>
        
        <h3>❌ Non-Refundable</h3>
        <ul>
          <li>Services already consumed (AI requests used)</li>
          <li>Refund requests after 7 days</li>
          <li>Violation of terms of service</li>
          <li>Prepaid credits (unless technical issues)</li>
        </ul>
        
        <h3>📝 Refund Process</h3>
        <ol>
          <li>Email us at <a href="mailto:refunds@excelaai.com">refunds@excelaai.com</a></li>
          <li>Include your order ID and reason for refund</li>
          <li>We'll review within 2 business days</li>
          <li>Approved refunds processed within 5-7 business days</li>
        </ol>
        
        <h3>💳 Refund Methods</h3>
        <ul>
          <li>Original payment method (credit card, UPI, etc.)</li>
          <li>Bank transfer for large amounts</li>
          <li>Account credits for partial refunds</li>
        </ul>
        
        <h3>🇮🇳 Indian Users</h3>
        <p>Refunds comply with Indian consumer protection laws. Additional rights may apply under local regulations.</p>
        
        <h3>📞 Questions?</h3>
        <p>Email: <a href="mailto:contact@advexcel.online">contact@advexcel.online</a><br/>
        Website: <a href="https://advexcel.online">https://advexcel.online</a></p>
      `
    }
  };

  const PolicyModal = ({ policy, onClose }: { policy: { title: string; content: string }, onClose: () => void }) => (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0,0,0,0.8)',
      zIndex: 10000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '30px',
        maxWidth: '800px',
        maxHeight: '80vh',
        overflow: 'auto',
        position: 'relative'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '15px',
            right: '20px',
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: '#6b7280'
          }}
        >×</button>
        <h2 style={{ color: '#1f2937', marginBottom: '20px' }}>{policy.title}</h2>
        <div 
          style={{ color: '#374151', lineHeight: '1.6' }}
          dangerouslySetInnerHTML={{ __html: policy.content }}
        />
      </div>
    </div>
  );

  return (
    <>
      <footer style={{
        background: 'rgba(30, 58, 138, 0.9)',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        padding: '40px 20px 20px',
        marginTop: '40px',
        color: '#bfdbfe'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(4, 1fr)', 
            gap: '40px',
            marginBottom: '40px'
          }}>
            {/* Company Info */}
            <div>
              <h3 style={{ color: '#ffffff', marginBottom: '20px', fontSize: '1.2rem', fontWeight: '600' }}>🤖 Excel AI Assistant</h3>
              <p style={{ marginBottom: '20px', lineHeight: '1.7', fontSize: '0.95rem', color: '#cbd5e1' }}>
                Transform your Excel workflow with AI. Upload, ask, and get results instantly.
              </p>
              <div style={{ marginBottom: '12px', fontSize: '0.9rem' }}>
                <strong style={{ color: '#e2e8f0' }}>📧 Contact:</strong><br/>
                <a href="mailto:contact@advexcel.online" style={{ color: '#60a5fa', textDecoration: 'none' }}>contact@advexcel.online</a>
              </div>
              <div style={{ fontSize: '0.9rem' }}>
                <strong style={{ color: '#e2e8f0' }}>🌐 Website:</strong><br/>
                <a href="https://advexcel.online" style={{ color: '#60a5fa', textDecoration: 'none' }}>advexcel.online</a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 style={{ color: '#ffffff', marginBottom: '20px', fontSize: '1.1rem', fontWeight: '600' }}>Quick Links</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button onClick={() => setShowPolicy('about')} style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', textAlign: 'left', padding: '4px 0', fontSize: '0.9rem', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = '#60a5fa'} onMouseOut={e => e.target.style.color = '#cbd5e1'}>About Us</button>
                <a href="#features" style={{ color: '#cbd5e1', textDecoration: 'none', padding: '4px 0', fontSize: '0.9rem', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = '#60a5fa'} onMouseOut={e => e.target.style.color = '#cbd5e1'}>Features</a>
                <a href="#pricing" style={{ color: '#cbd5e1', textDecoration: 'none', padding: '4px 0', fontSize: '0.9rem', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = '#60a5fa'} onMouseOut={e => e.target.style.color = '#cbd5e1'}>Pricing</a>
                <a href="mailto:contact@advexcel.online" style={{ color: '#cbd5e1', textDecoration: 'none', padding: '4px 0', fontSize: '0.9rem', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = '#60a5fa'} onMouseOut={e => e.target.style.color = '#cbd5e1'}>Contact Support</a>
              </div>
            </div>

            {/* Legal */}
            <div>
              <h4 style={{ color: '#ffffff', marginBottom: '20px', fontSize: '1.1rem', fontWeight: '600' }}>Legal & Policies</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button onClick={() => setShowPolicy('privacy')} style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', textAlign: 'left', padding: '4px 0', fontSize: '0.9rem', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = '#60a5fa'} onMouseOut={e => e.target.style.color = '#cbd5e1'}>Privacy Policy</button>
                <button onClick={() => setShowPolicy('terms')} style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', textAlign: 'left', padding: '4px 0', fontSize: '0.9rem', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = '#60a5fa'} onMouseOut={e => e.target.style.color = '#cbd5e1'}>Terms of Service</button>
                <button onClick={() => setShowPolicy('security')} style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', textAlign: 'left', padding: '4px 0', fontSize: '0.9rem', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = '#60a5fa'} onMouseOut={e => e.target.style.color = '#cbd5e1'}>Security Policy</button>
                <button onClick={() => setShowPolicy('refund')} style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', textAlign: 'left', padding: '4px 0', fontSize: '0.9rem', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = '#60a5fa'} onMouseOut={e => e.target.style.color = '#cbd5e1'}>Refund Policy</button>
              </div>
            </div>

            {/* Features */}
            <div>
              <h4 style={{ color: '#ffffff', marginBottom: '20px', fontSize: '1.1rem', fontWeight: '600' }}>Features</h4>
              <div style={{ fontSize: '0.9rem', lineHeight: '1.8', color: '#cbd5e1' }}>
                ✨ Natural Language Processing<br/>
                📊 Data Analytics & Pivot Tables<br/>
                📈 Chart Generation<br/>
                🎨 Smart Formatting<br/>
                🔒 Secure File Processing<br/>
                💾 Multiple Export Formats
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div style={{
            borderTop: '1px solid rgba(255,255,255,0.1)',
            paddingTop: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '15px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>
              © 2024 Excel AI Assistant. All rights reserved. Made with ❤️ for Excel users.
            </div>
            <div style={{ display: 'flex', gap: '20px', fontSize: '0.9rem', color: '#94a3b8' }}>
              <span>🇮🇳 Proudly Made in India</span>
              <span>🤖 Powered by Google Gemini AI</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Policy Modals */}
      {showPolicy && (
        <PolicyModal 
          policy={policies[showPolicy as keyof typeof policies]} 
          onClose={() => setShowPolicy(null)} 
        />
      )}
    </>
  );
};

export default Footer;