import React from 'react';

export default function TermsAndConditions() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* Header with Home Link */}
      <header style={{ backgroundColor: '#0078d4', color: 'white', padding: '16px 0' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <a href="/" style={{ color: 'white', textDecoration: 'none', fontSize: '16px', fontWeight: 'bold' }}>← Back to Home</a>
          <h1 style={{ margin: 0, fontSize: '24px' }}>Terms and Conditions</h1>
        </div>
      </header>
      
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px', fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: 'white', minHeight: 'calc(100vh - 80px)', boxShadow: '0 0 20px rgba(0,0,0,0.1)', textAlign: 'center' }}>
        <p style={{ color: '#666', marginBottom: '40px', fontSize: '14px' }}>Last updated: {new Date().toLocaleDateString()}</p>
        
        <section style={{ marginBottom: '50px' }}>
          <h2 style={{ color: '#2c3e50', marginBottom: '25px', fontSize: '22px', fontWeight: '600', borderBottom: '3px solid #0078d4', paddingBottom: '15px', display: 'inline-block' }}>1. Acceptance of Terms</h2>
          <p style={{ lineHeight: '2', color: '#495057', fontSize: '16px', marginBottom: '25px', maxWidth: '700px', margin: '0 auto 25px auto' }}>
            By accessing and using the Excel AI Assistant service, you accept and agree to be bound by 
            the terms and provision of this agreement. If you do not agree to abide by the above, 
            please do not use this service.
          </p>
        </section>

        <section style={{ marginBottom: '50px' }}>
          <h2 style={{ color: '#2c3e50', marginBottom: '25px', fontSize: '22px', fontWeight: '600', borderBottom: '3px solid #0078d4', paddingBottom: '15px', display: 'inline-block' }}>2. Service Description</h2>
          <p style={{ lineHeight: '2', color: '#495057', fontSize: '16px', marginBottom: '25px', maxWidth: '700px', margin: '0 auto 25px auto' }}>
            Excel AI Assistant is a free web-based service that provides AI-powered Excel file processing, 
            including sorting, filtering, calculations, and data analysis.
          </p>
        </section>

        <section style={{ marginBottom: '50px' }}>
          <h2 style={{ color: '#2c3e50', marginBottom: '25px', fontSize: '22px', fontWeight: '600', borderBottom: '3px solid #0078d4', paddingBottom: '15px', display: 'inline-block' }}>3. User Responsibilities</h2>
          <p style={{ lineHeight: '2', color: '#495057', fontSize: '16px', marginBottom: '25px', maxWidth: '700px', margin: '0 auto 25px auto' }}>You agree to:</p>
          <div style={{ textAlign: 'left', maxWidth: '600px', margin: '0 auto', backgroundColor: '#f8f9fa', padding: '25px', borderRadius: '8px' }}>
            <ul style={{ lineHeight: '2', color: '#495057', fontSize: '16px', paddingLeft: '25px', margin: 0 }}>
              <li style={{ marginBottom: '8px' }}>Provide accurate account information</li>
              <li style={{ marginBottom: '8px' }}>Use the service only for lawful purposes</li>
              <li style={{ marginBottom: '8px' }}>Not upload malicious or copyrighted content</li>
              <li style={{ marginBottom: '8px' }}>Not attempt to reverse engineer or hack the service</li>

            </ul>
          </div>
        </section>

        <section style={{ marginBottom: '50px' }}>
          <h2 style={{ color: '#2c3e50', marginBottom: '25px', fontSize: '22px', fontWeight: '600', borderBottom: '3px solid #0078d4', paddingBottom: '15px', display: 'inline-block' }}>4. Service Access</h2>
          <p style={{ lineHeight: '2', color: '#495057', fontSize: '16px', marginBottom: '25px', maxWidth: '700px', margin: '0 auto 25px auto' }}>
            Excel AI Assistant is provided as a free service to all registered users. 
            No subscription fees or charges apply. 
            Access is granted upon successful account registration and email verification.
          </p>
        </section>

        <section style={{ marginBottom: '50px' }}>
          <h2 style={{ color: '#2c3e50', marginBottom: '25px', fontSize: '22px', fontWeight: '600', borderBottom: '3px solid #0078d4', paddingBottom: '15px', display: 'inline-block' }}>5. Service Limitations</h2>
          <p style={{ lineHeight: '2', color: '#495057', fontSize: '16px', marginBottom: '25px', maxWidth: '700px', margin: '0 auto 25px auto' }}>
            We strive to provide reliable service but do not guarantee 100% uptime. 
            File size limits and processing limits may apply. 
            We reserve the right to modify or discontinue the service with reasonable notice.
          </p>
        </section>

        <section style={{ marginBottom: '50px' }}>
          <h2 style={{ color: '#2c3e50', marginBottom: '25px', fontSize: '22px', fontWeight: '600', borderBottom: '3px solid #0078d4', paddingBottom: '15px', display: 'inline-block' }}>6. Intellectual Property</h2>
          <p style={{ lineHeight: '2', color: '#495057', fontSize: '16px', marginBottom: '25px', maxWidth: '700px', margin: '0 auto 25px auto' }}>
            The service and its original content remain our property. 
            You retain ownership of your uploaded files and data. 
            You grant us a limited license to process your files to provide the service.
          </p>
        </section>

        <section style={{ marginBottom: '50px' }}>
          <h2 style={{ color: '#2c3e50', marginBottom: '25px', fontSize: '22px', fontWeight: '600', borderBottom: '3px solid #0078d4', paddingBottom: '15px', display: 'inline-block' }}>7. Limitation of Liability</h2>
          <p style={{ lineHeight: '2', color: '#495057', fontSize: '16px', marginBottom: '25px', maxWidth: '700px', margin: '0 auto 25px auto' }}>
            We shall not be liable for any indirect, incidental, special, consequential, 
            or punitive damages resulting from your use of the service. 
            Our total liability is limited to the amount paid by you in the last 12 months.
          </p>
        </section>

        <section style={{ marginBottom: '50px' }}>
          <h2 style={{ color: '#2c3e50', marginBottom: '25px', fontSize: '22px', fontWeight: '600', borderBottom: '3px solid #0078d4', paddingBottom: '15px', display: 'inline-block' }}>8. Termination</h2>
          <p style={{ lineHeight: '2', color: '#495057', fontSize: '16px', marginBottom: '25px', maxWidth: '700px', margin: '0 auto 25px auto' }}>
            We reserve the right to terminate accounts that violate these terms. 
            Users may delete their account at any time through their account settings 
            or by contacting support at contact@advexcel.online.
          </p>
        </section>

        <section style={{ marginBottom: '50px' }}>
          <h2 style={{ color: '#2c3e50', marginBottom: '25px', fontSize: '22px', fontWeight: '600', borderBottom: '3px solid #0078d4', paddingBottom: '15px', display: 'inline-block' }}>9. Contact Information</h2>
          <p style={{ lineHeight: '2', color: '#495057', fontSize: '16px', marginBottom: '25px', maxWidth: '700px', margin: '0 auto 25px auto' }}>
            For questions about these Terms, contact us at:
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