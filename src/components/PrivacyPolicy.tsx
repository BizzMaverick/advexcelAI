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
      
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px', fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: 'white', minHeight: 'calc(100vh - 80px)', boxShadow: '0 0 20px rgba(0,0,0,0.1)', textAlign: 'center' }}>
        <p style={{ color: '#666', marginBottom: '40px', fontSize: '14px' }}>Last updated: {new Date().toLocaleDateString()}</p>
        
        <section style={{ marginBottom: '50px' }}>
          <h2 style={{ color: '#2c3e50', marginBottom: '25px', fontSize: '22px', fontWeight: '600', borderBottom: '3px solid #0078d4', paddingBottom: '15px', display: 'inline-block' }}>1. Information We Collect</h2>
          <p style={{ lineHeight: '2', color: '#495057', fontSize: '16px', marginBottom: '25px', maxWidth: '700px', margin: '0 auto 25px auto' }}>
            We collect information you provide directly to us, such as when you create an account, 
            use our Excel AI Assistant service, or contact us for support. This includes:
          </p>
          <div style={{ textAlign: 'left', maxWidth: '600px', margin: '0 auto', backgroundColor: '#f8f9fa', padding: '25px', borderRadius: '8px' }}>
            <ul style={{ lineHeight: '2', color: '#495057', fontSize: '16px', paddingLeft: '25px', margin: 0 }}>
              <li style={{ marginBottom: '8px' }}>Email address and name for account creation</li>
              <li style={{ marginBottom: '8px' }}>Excel files you upload for processing</li>
              <li style={{ marginBottom: '8px' }}>Payment information (processed securely by Razorpay)</li>
              <li style={{ marginBottom: '8px' }}>Usage data and service interactions</li>
            </ul>
          </div>
        </section>

        <section style={{ marginBottom: '50px' }}>
          <h2 style={{ color: '#2c3e50', marginBottom: '25px', fontSize: '22px', fontWeight: '600', borderBottom: '3px solid #0078d4', paddingBottom: '15px', display: 'inline-block' }}>2. How We Use Your Information</h2>
          <p style={{ lineHeight: '2', color: '#495057', fontSize: '16px', marginBottom: '25px', maxWidth: '700px', margin: '0 auto 25px auto' }}>
            We use the information we collect to:
          </p>
          <div style={{ textAlign: 'left', maxWidth: '600px', margin: '0 auto', backgroundColor: '#f8f9fa', padding: '25px', borderRadius: '8px' }}>
            <ul style={{ lineHeight: '2', color: '#495057', fontSize: '16px', paddingLeft: '25px', margin: 0 }}>
              <li style={{ marginBottom: '8px' }}>Provide and improve our Excel AI Assistant service</li>
              <li style={{ marginBottom: '8px' }}>Process your Excel files and AI requests</li>
              <li style={{ marginBottom: '8px' }}>Handle billing and payments</li>
              <li style={{ marginBottom: '8px' }}>Send service-related communications</li>
              <li style={{ marginBottom: '8px' }}>Ensure security and prevent fraud</li>
            </ul>
          </div>
        </section>

        <section style={{ marginBottom: '50px' }}>
          <h2 style={{ color: '#2c3e50', marginBottom: '25px', fontSize: '22px', fontWeight: '600', borderBottom: '3px solid #0078d4', paddingBottom: '15px', display: 'inline-block' }}>3. Data Security</h2>
          <p style={{ lineHeight: '2', color: '#495057', fontSize: '16px', marginBottom: '25px', maxWidth: '700px', margin: '0 auto 25px auto' }}>
            We implement appropriate security measures to protect your personal information. 
            Your Excel files are processed securely and are not stored permanently on our servers. 
            Payment information is handled by Razorpay and follows industry-standard security practices.
          </p>
        </section>

        <section style={{ marginBottom: '50px' }}>
          <h2 style={{ color: '#2c3e50', marginBottom: '25px', fontSize: '22px', fontWeight: '600', borderBottom: '3px solid #0078d4', paddingBottom: '15px', display: 'inline-block' }}>4. Data Sharing</h2>
          <p style={{ lineHeight: '2', color: '#495057', fontSize: '16px', marginBottom: '25px', maxWidth: '700px', margin: '0 auto 25px auto' }}>
            We do not sell, trade, or share your personal information with third parties except:
          </p>
          <div style={{ textAlign: 'left', maxWidth: '600px', margin: '0 auto', backgroundColor: '#f8f9fa', padding: '25px', borderRadius: '8px' }}>
            <ul style={{ lineHeight: '2', color: '#495057', fontSize: '16px', paddingLeft: '25px', margin: 0 }}>
              <li style={{ marginBottom: '8px' }}>With your consent</li>
              <li style={{ marginBottom: '8px' }}>To comply with legal obligations</li>
              <li style={{ marginBottom: '8px' }}>With service providers (like AWS for hosting, Razorpay for payments)</li>
              <li style={{ marginBottom: '8px' }}>To protect our rights and safety</li>
            </ul>
          </div>
        </section>

        <section style={{ marginBottom: '50px' }}>
          <h2 style={{ color: '#2c3e50', marginBottom: '25px', fontSize: '22px', fontWeight: '600', borderBottom: '3px solid #0078d4', paddingBottom: '15px', display: 'inline-block' }}>5. Your Rights</h2>
          <p style={{ lineHeight: '2', color: '#495057', fontSize: '16px', marginBottom: '25px', maxWidth: '700px', margin: '0 auto 25px auto' }}>
            You have the right to access, update, or delete your personal information. 
            You can also request data portability or restrict processing. 
            Contact us at contact@advexcel.online to exercise these rights.
          </p>
        </section>

        <section style={{ marginBottom: '50px' }}>
          <h2 style={{ color: '#2c3e50', marginBottom: '25px', fontSize: '22px', fontWeight: '600', borderBottom: '3px solid #0078d4', paddingBottom: '15px', display: 'inline-block' }}>6. Contact Us</h2>
          <p style={{ lineHeight: '2', color: '#495057', fontSize: '16px', marginBottom: '25px', maxWidth: '700px', margin: '0 auto 25px auto' }}>
            If you have questions about this Privacy Policy, please contact us at:
            <br /><br />
            <strong>Email:</strong> contact@advexcel.online
            <br />
            <strong>Website:</strong> https://www.advexcel.online
          </p>
        </section>
      </div>
    </div>
  );
}