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
      
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px', fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: 'white', minHeight: 'calc(100vh - 80px)', boxShadow: '0 0 20px rgba(0,0,0,0.1)' }}>
        <p style={{ color: '#666', marginBottom: '30px', fontSize: '14px', textAlign: 'center' }}>Last updated: {new Date().toLocaleDateString()}</p>
        
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ color: '#2c3e50', marginBottom: '20px', fontSize: '20px', fontWeight: '600', borderBottom: '2px solid #e9ecef', paddingBottom: '10px' }}>1. Acceptance of Terms</h2>
          <p style={{ lineHeight: '1.8', color: '#495057', fontSize: '16px', textAlign: 'justify', marginBottom: '16px' }}>
            By accessing and using the Excel AI Assistant service, you accept and agree to be bound by 
            the terms and provision of this agreement. If you do not agree to abide by the above, 
            please do not use this service.
          </p>
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ color: '#2c3e50', marginBottom: '20px', fontSize: '20px', fontWeight: '600', borderBottom: '2px solid #e9ecef', paddingBottom: '10px' }}>2. Service Description</h2>
          <p style={{ lineHeight: '1.8', color: '#495057', fontSize: '16px', textAlign: 'justify', marginBottom: '16px' }}>
            Excel AI Assistant is a web-based service that provides AI-powered Excel file processing, 
            including sorting, filtering, calculations, and data analysis. The service is provided 
            on a subscription basis at ₹249 per month.
          </p>
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ color: '#2c3e50', marginBottom: '20px', fontSize: '20px', fontWeight: '600', borderBottom: '2px solid #e9ecef', paddingBottom: '10px' }}>3. User Responsibilities</h2>
          <p style={{ lineHeight: '1.8', color: '#495057', fontSize: '16px', textAlign: 'justify', marginBottom: '16px' }}>You agree to:</p>
          <ul style={{ lineHeight: '1.8', color: '#495057', fontSize: '16px', marginLeft: '30px', marginBottom: '20px' }}>
            <li>Provide accurate account information</li>
            <li>Use the service only for lawful purposes</li>
            <li>Not upload malicious or copyrighted content</li>
            <li>Not attempt to reverse engineer or hack the service</li>
            <li>Pay subscription fees on time</li>
          </ul>
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ color: '#2c3e50', marginBottom: '20px', fontSize: '20px', fontWeight: '600', borderBottom: '2px solid #e9ecef', paddingBottom: '10px' }}>4. Payment Terms</h2>
          <p style={{ lineHeight: '1.8', color: '#495057', fontSize: '16px', textAlign: 'justify', marginBottom: '16px' }}>
            Subscription fees are ₹249 per month, charged monthly in advance. 
            Payments are processed securely through Razorpay. 
            All fees are non-refundable except as required by law.
          </p>
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ color: '#2c3e50', marginBottom: '20px', fontSize: '20px', fontWeight: '600', borderBottom: '2px solid #e9ecef', paddingBottom: '10px' }}>5. Service Limitations</h2>
          <p style={{ lineHeight: '1.8', color: '#495057', fontSize: '16px', textAlign: 'justify', marginBottom: '16px' }}>
            We strive to provide reliable service but do not guarantee 100% uptime. 
            File size limits and processing limits may apply. 
            We reserve the right to modify or discontinue the service with notice.
          </p>
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ color: '#2c3e50', marginBottom: '20px', fontSize: '20px', fontWeight: '600', borderBottom: '2px solid #e9ecef', paddingBottom: '10px' }}>6. Intellectual Property</h2>
          <p style={{ lineHeight: '1.8', color: '#495057', fontSize: '16px', textAlign: 'justify', marginBottom: '16px' }}>
            The service and its original content remain our property. 
            You retain ownership of your uploaded files and data. 
            You grant us a limited license to process your files to provide the service.
          </p>
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ color: '#2c3e50', marginBottom: '20px', fontSize: '20px', fontWeight: '600', borderBottom: '2px solid #e9ecef', paddingBottom: '10px' }}>7. Limitation of Liability</h2>
          <p style={{ lineHeight: '1.8', color: '#495057', fontSize: '16px', textAlign: 'justify', marginBottom: '16px' }}>
            We shall not be liable for any indirect, incidental, special, consequential, 
            or punitive damages resulting from your use of the service. 
            Our total liability is limited to the amount paid by you in the last 12 months.
          </p>
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ color: '#2c3e50', marginBottom: '20px', fontSize: '20px', fontWeight: '600', borderBottom: '2px solid #e9ecef', paddingBottom: '10px' }}>8. Contact Information</h2>
          <p style={{ lineHeight: '1.8', color: '#495057', fontSize: '16px', textAlign: 'justify', marginBottom: '16px' }}>
            For questions about these Terms, contact us at:
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