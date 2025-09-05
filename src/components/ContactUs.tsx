import React from 'react';

export default function ContactUs() {
  return (
    <div style={{ backgroundColor: '#fff', minHeight: '100vh' }}>
      <div style={{ padding: '20px', borderBottom: '1px solid #eee' }}>
        <a href="/" style={{ color: '#007bff', textDecoration: 'none', fontSize: '16px' }}>← Back to Home</a>
      </div>
      <div style={{ 
        padding: '40px 20px', 
        maxWidth: '800px', 
        margin: '0 auto',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        lineHeight: '1.6',
        color: '#000',
        textAlign: 'left'
      }}>
        <h1 style={{ fontSize: '28px', fontWeight: '600', color: '#000', marginBottom: '10px' }}>Contact Us</h1>
        <p style={{ color: '#666', fontSize: '14px', marginBottom: '30px' }}>We're here to help! Reach out to us for any questions or support.</p>
        
        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#000', marginBottom: '15px' }}>1. Get in Touch</h2>
          <p style={{ marginBottom: '15px' }}>
            For all inquiries, support requests, and feedback, please contact us at our dedicated support email. 
            We are committed to providing prompt and helpful responses to all our users.
          </p>
          <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', border: '1px solid #e1e5e9', marginBottom: '15px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '10px' }}>Email Support</h3>
            <p style={{ marginBottom: '5px' }}>
              <a href="mailto:contact@advexcel.online" style={{ color: '#007bff', textDecoration: 'none', fontWeight: 'bold' }}>
                contact@advexcel.online
              </a>
            </p>
            <p style={{ color: '#666', fontSize: '14px' }}>We typically respond within 24 hours</p>
          </div>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#000', marginBottom: '15px' }}>2. What We Can Help With</h2>
          <p style={{ marginBottom: '15px' }}>Our support team can assist you with:</p>
          <ul style={{ paddingLeft: '20px', marginBottom: '15px' }}>
            <li>Technical support and troubleshooting</li>
            <li>Account management questions</li>
            <li>Payment and subscription inquiries</li>
            <li>Feature requests and feedback</li>
            <li>Account settings and preferences</li>
            <li>Cancellation and refund requests</li>
            <li>General inquiries about our service</li>
          </ul>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#000', marginBottom: '15px' }}>3. Business Information</h2>
          <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', border: '1px solid #e1e5e9' }}>
            <p style={{ marginBottom: '10px' }}><strong>Service Name:</strong> Excel AI Assistant</p>
            <p style={{ marginBottom: '10px' }}><strong>Website:</strong> www.advexcel.online</p>
            <p style={{ marginBottom: '10px' }}><strong>Email:</strong> <a href="mailto:contact@advexcel.online" style={{ color: '#007bff', textDecoration: 'none' }}>contact@advexcel.online</a></p>
            <p style={{ marginBottom: '10px' }}><strong>Service Type:</strong> AI-powered Excel processing and analysis</p>
            <p style={{ marginBottom: '0' }}><strong>Pricing:</strong> ₹199 per month</p>
          </div>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#000', marginBottom: '15px' }}>4. Response Times</h2>
          <p style={{ marginBottom: '15px' }}>We strive to provide prompt support with the following response times:</p>
          <ul style={{ paddingLeft: '20px', marginBottom: '15px' }}>
            <li>General Inquiries: Within 24 hours</li>
            <li>Technical Support: Within 12 hours</li>
            <li>Payment Issues: Within 6 hours</li>
            <li>Account Problems: Within 6 hours</li>
            <li>Urgent Matters: Same day response</li>
          </ul>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#000', marginBottom: '15px' }}>5. Before You Contact Us</h2>
          <p style={{ marginBottom: '15px' }}>To help us assist you better, please include the following information:</p>
          <ul style={{ paddingLeft: '20px', marginBottom: '15px' }}>
            <li>Your account email address</li>
            <li>Detailed description of your issue or question</li>
            <li>Screenshots if applicable (for technical issues)</li>
            <li>Browser and device information for technical problems</li>
            <li>Any error messages you received</li>
            <li>Steps you've already tried to resolve the issue</li>
          </ul>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#000', marginBottom: '15px' }}>6. Privacy and Security</h2>
          <p>
            All communications are confidential and handled according to our Privacy Policy. We never share your personal 
            information with third parties. Your data security and privacy are our top priorities in all support interactions.
          </p>
        </section>
      </div>
    </div>
  );
}