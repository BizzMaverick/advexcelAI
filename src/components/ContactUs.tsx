import React from 'react';

export default function ContactUs() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* Header with Home Link */}
      <header style={{ backgroundColor: '#0078d4', color: 'white', padding: '16px 0' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <a href="/" style={{ color: 'white', textDecoration: 'none', fontSize: '16px', fontWeight: 'bold' }}>← Back to Home</a>
          <h1 style={{ margin: 0, fontSize: '24px' }}>Contact Us</h1>
        </div>
      </header>
      
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px', fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: 'white', minHeight: 'calc(100vh - 80px)', boxShadow: '0 0 20px rgba(0,0,0,0.1)', textAlign: 'center' }}>
        <p style={{ color: '#666', marginBottom: '40px', fontSize: '14px' }}>We're here to help! Reach out to us for any questions or support.</p>
        
        <section style={{ marginBottom: '50px' }}>
          <h2 style={{ color: '#2c3e50', marginBottom: '25px', fontSize: '22px', fontWeight: '600', borderBottom: '3px solid #0078d4', paddingBottom: '15px', display: 'inline-block' }}>1. Get in Touch</h2>
          <p style={{ lineHeight: '2', color: '#495057', fontSize: '16px', marginBottom: '25px', maxWidth: '700px', margin: '0 auto 25px auto' }}>
            For all inquiries, support requests, and feedback, please contact us at our dedicated support email. 
            We are committed to providing prompt and helpful responses to all our users.
          </p>
          <div style={{ backgroundColor: '#f8f9fa', padding: '30px', borderRadius: '8px', margin: '20px 0' }}>
            <h3 style={{ color: '#0078d4', marginBottom: '20px', fontSize: '20px' }}>Email Support</h3>
            <p style={{ fontSize: '18px', marginBottom: '10px' }}>
              <a href="mailto:contact@advexcel.online" style={{ color: '#0078d4', textDecoration: 'none', fontWeight: 'bold' }}>
                contact@advexcel.online
              </a>
            </p>
            <p style={{ color: '#666', fontSize: '14px' }}>We typically respond within 24 hours</p>
          </div>
        </section>

        <section style={{ marginBottom: '50px' }}>
          <h2 style={{ color: '#2c3e50', marginBottom: '25px', fontSize: '22px', fontWeight: '600', borderBottom: '3px solid #0078d4', paddingBottom: '15px', display: 'inline-block' }}>2. What We Can Help With</h2>
          <p style={{ lineHeight: '2', color: '#495057', fontSize: '16px', marginBottom: '25px', maxWidth: '700px', margin: '0 auto 25px auto' }}>Our support team can assist you with:</p>
          <div style={{ textAlign: 'left', maxWidth: '600px', margin: '0 auto', backgroundColor: '#f8f9fa', padding: '25px', borderRadius: '8px' }}>
            <ul style={{ lineHeight: '2', color: '#495057', fontSize: '16px', paddingLeft: '25px', margin: 0 }}>
              <li style={{ marginBottom: '8px' }}>Technical support and troubleshooting</li>
              <li style={{ marginBottom: '8px' }}>Account and billing questions</li>
              <li style={{ marginBottom: '8px' }}>Feature requests and feedback</li>
              <li style={{ marginBottom: '8px' }}>Subscription management and upgrades</li>
              <li style={{ marginBottom: '8px' }}>Refund and cancellation requests</li>
              <li style={{ marginBottom: '8px' }}>General inquiries about our service</li>
            </ul>
          </div>
        </section>

        <section style={{ marginBottom: '50px' }}>
          <h2 style={{ color: '#2c3e50', marginBottom: '25px', fontSize: '22px', fontWeight: '600', borderBottom: '3px solid #0078d4', paddingBottom: '15px', display: 'inline-block' }}>3. Business Information</h2>
          <div style={{ textAlign: 'left', maxWidth: '600px', margin: '0 auto', backgroundColor: '#f8f9fa', padding: '25px', borderRadius: '8px' }}>
            <p style={{ lineHeight: '2', color: '#495057', fontSize: '16px', marginBottom: '12px' }}><strong>Service Name:</strong> Excel AI Assistant</p>
            <p style={{ lineHeight: '2', color: '#495057', fontSize: '16px', marginBottom: '12px' }}><strong>Website:</strong> https://www.advexcel.online</p>
            <p style={{ lineHeight: '2', color: '#495057', fontSize: '16px', marginBottom: '12px' }}><strong>Email:</strong> contact@advexcel.online</p>
            <p style={{ lineHeight: '2', color: '#495057', fontSize: '16px', marginBottom: '12px' }}><strong>Service Type:</strong> AI-powered Excel processing and analysis</p>
            <p style={{ lineHeight: '2', color: '#495057', fontSize: '16px', marginBottom: '12px' }}><strong>Pricing:</strong> ₹249 per month</p>
            <p style={{ lineHeight: '2', color: '#495057', fontSize: '16px', marginBottom: '12px' }}><strong>Payment Method:</strong> Razorpay (Cards, UPI, Net Banking)</p>
          </div>
        </section>

        <section style={{ marginBottom: '50px' }}>
          <h2 style={{ color: '#2c3e50', marginBottom: '25px', fontSize: '22px', fontWeight: '600', borderBottom: '3px solid #0078d4', paddingBottom: '15px', display: 'inline-block' }}>4. Response Times</h2>
          <p style={{ lineHeight: '2', color: '#495057', fontSize: '16px', marginBottom: '25px', maxWidth: '700px', margin: '0 auto 25px auto' }}>We strive to provide prompt support with the following response times:</p>
          <div style={{ textAlign: 'left', maxWidth: '600px', margin: '0 auto', backgroundColor: '#f8f9fa', padding: '25px', borderRadius: '8px' }}>
            <ul style={{ lineHeight: '2', color: '#495057', fontSize: '16px', paddingLeft: '25px', margin: 0 }}>
              <li style={{ marginBottom: '8px' }}><strong>General Inquiries:</strong> Within 24 hours</li>
              <li style={{ marginBottom: '8px' }}><strong>Technical Support:</strong> Within 12 hours</li>
              <li style={{ marginBottom: '8px' }}><strong>Billing Issues:</strong> Within 6 hours</li>
              <li style={{ marginBottom: '8px' }}><strong>Urgent Matters:</strong> Same day response</li>
              <li style={{ marginBottom: '8px' }}><strong>Refund Requests:</strong> Within 24 hours</li>
            </ul>
          </div>
        </section>

        <section style={{ marginBottom: '50px' }}>
          <h2 style={{ color: '#2c3e50', marginBottom: '25px', fontSize: '22px', fontWeight: '600', borderBottom: '3px solid #0078d4', paddingBottom: '15px', display: 'inline-block' }}>5. Before You Contact Us</h2>
          <p style={{ lineHeight: '2', color: '#495057', fontSize: '16px', marginBottom: '25px', maxWidth: '700px', margin: '0 auto 25px auto' }}>To help us assist you better, please include the following information:</p>
          <div style={{ textAlign: 'left', maxWidth: '600px', margin: '0 auto', backgroundColor: '#f8f9fa', padding: '25px', borderRadius: '8px' }}>
            <ul style={{ lineHeight: '2', color: '#495057', fontSize: '16px', paddingLeft: '25px', margin: 0 }}>
              <li style={{ marginBottom: '8px' }}>Your account email address</li>
              <li style={{ marginBottom: '8px' }}>Detailed description of your issue or question</li>
              <li style={{ marginBottom: '8px' }}>Screenshots if applicable (for technical issues)</li>
              <li style={{ marginBottom: '8px' }}>Browser and device information for technical problems</li>
              <li style={{ marginBottom: '8px' }}>Any error messages you received</li>
              <li style={{ marginBottom: '8px' }}>Steps you've already tried to resolve the issue</li>
            </ul>
          </div>
        </section>

        <section style={{ marginBottom: '50px' }}>
          <h2 style={{ color: '#2c3e50', marginBottom: '25px', fontSize: '22px', fontWeight: '600', borderBottom: '3px solid #0078d4', paddingBottom: '15px', display: 'inline-block' }}>6. Privacy and Security</h2>
          <p style={{ lineHeight: '2', color: '#495057', fontSize: '16px', marginBottom: '25px', maxWidth: '700px', margin: '0 auto 25px auto' }}>
            All communications are confidential and handled according to our Privacy Policy. 
            We never share your personal information with third parties. Your data security 
            and privacy are our top priorities in all support interactions.
          </p>
        </section>
      </div>
    </div>
  );
}