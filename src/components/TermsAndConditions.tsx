import React from 'react';

export default function TermsAndConditions() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#333', marginBottom: '30px' }}>Terms and Conditions</h1>
      <p style={{ color: '#666', marginBottom: '20px' }}>Last updated: {new Date().toLocaleDateString()}</p>
      
      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#333', marginBottom: '15px' }}>1. Acceptance of Terms</h2>
        <p style={{ lineHeight: '1.6', color: '#555' }}>
          By accessing and using the Excel AI Assistant service, you accept and agree to be bound by 
          the terms and provision of this agreement. If you do not agree to abide by the above, 
          please do not use this service.
        </p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#333', marginBottom: '15px' }}>2. Service Description</h2>
        <p style={{ lineHeight: '1.6', color: '#555' }}>
          Excel AI Assistant is a web-based service that provides AI-powered Excel file processing, 
          including sorting, filtering, calculations, and data analysis. The service is provided 
          on a subscription basis at ₹249 per month.
        </p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#333', marginBottom: '15px' }}>3. User Responsibilities</h2>
        <p style={{ lineHeight: '1.6', color: '#555' }}>You agree to:</p>
        <ul style={{ lineHeight: '1.6', color: '#555', marginLeft: '20px' }}>
          <li>Provide accurate account information</li>
          <li>Use the service only for lawful purposes</li>
          <li>Not upload malicious or copyrighted content</li>
          <li>Not attempt to reverse engineer or hack the service</li>
          <li>Pay subscription fees on time</li>
        </ul>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#333', marginBottom: '15px' }}>4. Payment Terms</h2>
        <p style={{ lineHeight: '1.6', color: '#555' }}>
          Subscription fees are ₹249 per month, charged monthly in advance. 
          Payments are processed securely through Razorpay. 
          All fees are non-refundable except as required by law.
        </p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#333', marginBottom: '15px' }}>5. Service Limitations</h2>
        <p style={{ lineHeight: '1.6', color: '#555' }}>
          We strive to provide reliable service but do not guarantee 100% uptime. 
          File size limits and processing limits may apply. 
          We reserve the right to modify or discontinue the service with notice.
        </p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#333', marginBottom: '15px' }}>6. Intellectual Property</h2>
        <p style={{ lineHeight: '1.6', color: '#555' }}>
          The service and its original content remain our property. 
          You retain ownership of your uploaded files and data. 
          You grant us a limited license to process your files to provide the service.
        </p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#333', marginBottom: '15px' }}>7. Limitation of Liability</h2>
        <p style={{ lineHeight: '1.6', color: '#555' }}>
          We shall not be liable for any indirect, incidental, special, consequential, 
          or punitive damages resulting from your use of the service. 
          Our total liability is limited to the amount paid by you in the last 12 months.
        </p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#333', marginBottom: '15px' }}>8. Contact Information</h2>
        <p style={{ lineHeight: '1.6', color: '#555' }}>
          For questions about these Terms, contact us at:
          <br />
          Email: support@advexcel.online
          <br />
          Website: https://www.advexcel.online
        </p>
      </section>
    </div>
  );
}