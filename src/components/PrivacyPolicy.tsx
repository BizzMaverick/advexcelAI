import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* Header with Home Link */}
      <header style={{ backgroundColor: '#0078d4', color: 'white', padding: '16px 0' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <a href="/" style={{ color: 'white', textDecoration: 'none', fontSize: '16px', fontWeight: 'bold' }}>← Back to Home</a>
          <h1 style={{ margin: 0, fontSize: '24px' }}>Privacy Policy</h1>
        </div>
      </header>
      
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px', fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: 'white', minHeight: 'calc(100vh - 80px)', boxShadow: '0 0 20px rgba(0,0,0,0.1)' }}>
        <p style={{ color: '#666', marginBottom: '30px', fontSize: '14px', textAlign: 'center' }}>Last updated: {new Date().toLocaleDateString()}</p>
        
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ color: '#2c3e50', marginBottom: '20px', fontSize: '20px', fontWeight: '600', borderBottom: '2px solid #e9ecef', paddingBottom: '10px' }}>1. Information We Collect</h2>
          <p style={{ lineHeight: '1.8', color: '#495057', fontSize: '16px', textAlign: 'justify', marginBottom: '16px' }}>
            We collect information you provide directly to us, such as when you create an account, 
            use our Excel AI Assistant service, or contact us for support. This includes:
          </p>
          <ul style={{ lineHeight: '1.8', color: '#495057', fontSize: '16px', marginLeft: '30px', marginBottom: '20px' }}>
            <li>Email address and name for account creation</li>
            <li>Excel files you upload for processing</li>
            <li>Payment information (processed securely by Razorpay)</li>
            <li>Usage data and service interactions</li>
          </ul>
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ color: '#2c3e50', marginBottom: '20px', fontSize: '20px', fontWeight: '600', borderBottom: '2px solid #e9ecef', paddingBottom: '10px' }}>2. How We Use Your Information</h2>
          <p style={{ lineHeight: '1.8', color: '#495057', fontSize: '16px', textAlign: 'justify', marginBottom: '16px' }}>
            We use the information we collect to:
          </p>
          <ul style={{ lineHeight: '1.8', color: '#495057', fontSize: '16px', marginLeft: '30px', marginBottom: '20px' }}>
            <li>Provide and improve our Excel AI Assistant service</li>
            <li>Process your Excel files and AI requests</li>
            <li>Handle billing and payments</li>
            <li>Send service-related communications</li>
            <li>Ensure security and prevent fraud</li>
          </ul>
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ color: '#2c3e50', marginBottom: '20px', fontSize: '20px', fontWeight: '600', borderBottom: '2px solid #e9ecef', paddingBottom: '10px' }}>3. Data Security</h2>
          <p style={{ lineHeight: '1.8', color: '#495057', fontSize: '16px', textAlign: 'justify', marginBottom: '16px' }}>
            We implement appropriate security measures to protect your personal information. 
            Your Excel files are processed securely and are not stored permanently on our servers. 
            Payment information is handled by Razorpay and follows industry-standard security practices.
          </p>
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ color: '#2c3e50', marginBottom: '20px', fontSize: '20px', fontWeight: '600', borderBottom: '2px solid #e9ecef', paddingBottom: '10px' }}>4. Data Sharing</h2>
          <p style={{ lineHeight: '1.8', color: '#495057', fontSize: '16px', textAlign: 'justify', marginBottom: '16px' }}>
            We do not sell, trade, or share your personal information with third parties except:
          </p>
          <ul style={{ lineHeight: '1.8', color: '#495057', fontSize: '16px', marginLeft: '30px', marginBottom: '20px' }}>
            <li>With your consent</li>
            <li>To comply with legal obligations</li>
            <li>With service providers (like AWS for hosting, Razorpay for payments)</li>
            <li>To protect our rights and safety</li>
          </ul>
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ color: '#2c3e50', marginBottom: '20px', fontSize: '20px', fontWeight: '600', borderBottom: '2px solid #e9ecef', paddingBottom: '10px' }}>5. Your Rights</h2>
          <p style={{ lineHeight: '1.8', color: '#495057', fontSize: '16px', textAlign: 'justify', marginBottom: '16px' }}>
            You have the right to access, update, or delete your personal information. 
            You can also request data portability or restrict processing. 
            Contact us at contact@advexcel.online to exercise these rights.
          </p>
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ color: '#2c3e50', marginBottom: '20px', fontSize: '20px', fontWeight: '600', borderBottom: '2px solid #e9ecef', paddingBottom: '10px' }}>6. Contact Us</h2>
          <p style={{ lineHeight: '1.8', color: '#495057', fontSize: '16px', textAlign: 'justify', marginBottom: '16px' }}>
            If you have questions about this Privacy Policy, please contact us at:
            <br />
            Email: contact@advexcel.online
            <br />
            Website: https://www.advexcel.online
          </p>
        </section>
      </div>
    </div>
  );
}