import React from 'react';

export default function ContactUs() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#333', marginBottom: '30px' }}>Contact Us</h1>
      
      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ color: '#333', marginBottom: '20px' }}>Get in Touch</h2>
        <p style={{ lineHeight: '1.6', color: '#555', marginBottom: '30px' }}>
          We're here to help! If you have any questions, concerns, or feedback about 
          Excel AI Assistant, please don't hesitate to reach out to us.
        </p>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginBottom: '40px' }}>
        <div style={{ padding: '30px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' }}>
          <h3 style={{ color: '#333', marginBottom: '15px', display: 'flex', alignItems: 'center' }}>
            📧 Email Support
          </h3>
          <p style={{ lineHeight: '1.6', color: '#555', marginBottom: '10px' }}>
            <strong>General Support:</strong><br />
            support@advexcel.online
          </p>
          <p style={{ lineHeight: '1.6', color: '#555', marginBottom: '10px' }}>
            <strong>Technical Issues:</strong><br />
            tech@advexcel.online
          </p>
          <p style={{ lineHeight: '1.6', color: '#555' }}>
            <strong>Response Time:</strong> Within 24 hours
          </p>
        </div>

        <div style={{ padding: '30px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' }}>
          <h3 style={{ color: '#333', marginBottom: '15px', display: 'flex', alignItems: 'center' }}>
            🌐 Website
          </h3>
          <p style={{ lineHeight: '1.6', color: '#555', marginBottom: '10px' }}>
            <strong>Main Website:</strong><br />
            <a href="https://www.advexcel.online" style={{ color: '#0078d4', textDecoration: 'none' }}>
              https://www.advexcel.online
            </a>
          </p>
          <p style={{ lineHeight: '1.6', color: '#555' }}>
            <strong>Service Status:</strong><br />
            Available 24/7
          </p>
        </div>
      </div>

      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ color: '#333', marginBottom: '20px' }}>Business Information</h2>
        <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' }}>
          <p style={{ lineHeight: '1.6', color: '#555', marginBottom: '10px' }}>
            <strong>Service Name:</strong> Excel AI Assistant
          </p>
          <p style={{ lineHeight: '1.6', color: '#555', marginBottom: '10px' }}>
            <strong>Service Type:</strong> AI-Powered Excel Processing
          </p>
          <p style={{ lineHeight: '1.6', color: '#555', marginBottom: '10px' }}>
            <strong>Pricing:</strong> ₹249 per month
          </p>
          <p style={{ lineHeight: '1.6', color: '#555' }}>
            <strong>Payment Partner:</strong> Razorpay
          </p>
        </div>
      </section>

      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ color: '#333', marginBottom: '20px' }}>Support Categories</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          <div style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e9ecef' }}>
            <h4 style={{ color: '#333', marginBottom: '10px' }}>🔧 Technical Support</h4>
            <ul style={{ lineHeight: '1.6', color: '#555', marginLeft: '20px' }}>
              <li>Login issues</li>
              <li>File upload problems</li>
              <li>AI processing errors</li>
              <li>Browser compatibility</li>
            </ul>
          </div>

          <div style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e9ecef' }}>
            <h4 style={{ color: '#333', marginBottom: '10px' }}>💳 Billing Support</h4>
            <ul style={{ lineHeight: '1.6', color: '#555', marginLeft: '20px' }}>
              <li>Payment issues</li>
              <li>Subscription management</li>
              <li>Refund requests</li>
              <li>Invoice queries</li>
            </ul>
          </div>

          <div style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e9ecef' }}>
            <h4 style={{ color: '#333', marginBottom: '10px' }}>❓ General Inquiries</h4>
            <ul style={{ lineHeight: '1.6', color: '#555', marginLeft: '20px' }}>
              <li>Feature requests</li>
              <li>Service information</li>
              <li>Partnership opportunities</li>
              <li>Feedback and suggestions</li>
            </ul>
          </div>
        </div>
      </section>

      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ color: '#333', marginBottom: '20px' }}>Frequently Asked Questions</h2>
        <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' }}>
          <p style={{ lineHeight: '1.6', color: '#555', marginBottom: '15px' }}>
            <strong>Q: How quickly do you respond to support requests?</strong><br />
            A: We aim to respond to all inquiries within 24 hours during business days.
          </p>
          <p style={{ lineHeight: '1.6', color: '#555', marginBottom: '15px' }}>
            <strong>Q: What file formats do you support?</strong><br />
            A: We support .xlsx, .xls, and .csv file formats.
          </p>
          <p style={{ lineHeight: '1.6', color: '#555' }}>
            <strong>Q: Is there a free trial available?</strong><br />
            A: Yes, we offer a 7-day money-back guarantee for new subscribers.
          </p>
        </div>
      </section>

      <section>
        <h2 style={{ color: '#333', marginBottom: '20px' }}>Legal Pages</h2>
        <p style={{ lineHeight: '1.6', color: '#555' }}>
          For detailed information about our policies, please visit:
        </p>
        <ul style={{ lineHeight: '1.6', color: '#555', marginLeft: '20px' }}>
          <li><a href="/privacy-policy" style={{ color: '#0078d4', textDecoration: 'none' }}>Privacy Policy</a></li>
          <li><a href="/terms-conditions" style={{ color: '#0078d4', textDecoration: 'none' }}>Terms and Conditions</a></li>
          <li><a href="/cancellation-refund" style={{ color: '#0078d4', textDecoration: 'none' }}>Cancellation and Refund Policy</a></li>
          <li><a href="/shipping-delivery" style={{ color: '#0078d4', textDecoration: 'none' }}>Shipping and Delivery Policy</a></li>
        </ul>
      </section>
    </div>
  );
}