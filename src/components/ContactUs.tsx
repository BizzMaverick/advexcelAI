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
      
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px', fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: 'white', minHeight: 'calc(100vh - 80px)', boxShadow: '0 0 20px rgba(0,0,0,0.1)' }}>
        
        <section style={{ marginBottom: '50px', textAlign: 'center' }}>
          <h2 style={{ color: '#2c3e50', marginBottom: '20px', fontSize: '28px', fontWeight: '600' }}>Get in Touch</h2>
          <p style={{ lineHeight: '1.8', color: '#495057', fontSize: '18px', maxWidth: '600px', margin: '0 auto' }}>
            We're here to help! If you have any questions, concerns, or feedback about 
            Excel AI Assistant, please don't hesitate to reach out to us.
          </p>
        </section>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px', marginBottom: '50px' }}>
          <div style={{ padding: '40px 30px', backgroundColor: '#f8f9fa', borderRadius: '12px', border: '1px solid #e9ecef', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>📧</div>
            <h3 style={{ color: '#2c3e50', marginBottom: '20px', fontSize: '22px', fontWeight: '600' }}>Email Support</h3>
            <p style={{ lineHeight: '1.8', color: '#495057', fontSize: '16px', marginBottom: '15px' }}>
              <strong>General Support:</strong><br />
              contact@advexcel.online
            </p>
            <p style={{ lineHeight: '1.8', color: '#495057', fontSize: '16px', marginBottom: '15px' }}>
              <strong>Technical Issues:</strong><br />
              contact@advexcel.online
            </p>
            <p style={{ lineHeight: '1.8', color: '#495057', fontSize: '16px' }}>
              <strong>Response Time:</strong> Within 24 hours
            </p>
          </div>

          <div style={{ padding: '40px 30px', backgroundColor: '#f8f9fa', borderRadius: '12px', border: '1px solid #e9ecef', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>🌐</div>
            <h3 style={{ color: '#2c3e50', marginBottom: '20px', fontSize: '22px', fontWeight: '600' }}>Website</h3>
            <p style={{ lineHeight: '1.8', color: '#495057', fontSize: '16px', marginBottom: '15px' }}>
              <strong>Main Website:</strong><br />
              <a href="https://www.advexcel.online" style={{ color: '#0078d4', textDecoration: 'none', fontWeight: '500' }}>
                https://www.advexcel.online
              </a>
            </p>
            <p style={{ lineHeight: '1.8', color: '#495057', fontSize: '16px' }}>
              <strong>Service Status:</strong><br />
              Available 24/7
            </p>
          </div>
        </div>

        <section style={{ marginBottom: '50px' }}>
          <h2 style={{ color: '#2c3e50', marginBottom: '30px', fontSize: '24px', fontWeight: '600', textAlign: 'center' }}>Business Information</h2>
          <div style={{ padding: '30px', backgroundColor: '#f8f9fa', borderRadius: '12px', border: '1px solid #e9ecef' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
              <p style={{ lineHeight: '1.8', color: '#495057', fontSize: '16px', margin: 0 }}>
                <strong>Service Name:</strong> Excel AI Assistant
              </p>
              <p style={{ lineHeight: '1.8', color: '#495057', fontSize: '16px', margin: 0 }}>
                <strong>Service Type:</strong> AI-Powered Excel Processing
              </p>
              <p style={{ lineHeight: '1.8', color: '#495057', fontSize: '16px', margin: 0 }}>
                <strong>Pricing:</strong> ₹249 per month
              </p>
              <p style={{ lineHeight: '1.8', color: '#495057', fontSize: '16px', margin: 0 }}>
                <strong>Payment Partner:</strong> Razorpay
              </p>
            </div>
          </div>
        </section>

        <section style={{ marginBottom: '50px' }}>
          <h2 style={{ color: '#2c3e50', marginBottom: '30px', fontSize: '24px', fontWeight: '600', textAlign: 'center' }}>Support Categories</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px' }}>
            <div style={{ padding: '30px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e9ecef', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <h4 style={{ color: '#2c3e50', marginBottom: '15px', fontSize: '18px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px' }}>
                🔧 Technical Support
              </h4>
              <ul style={{ lineHeight: '1.8', color: '#495057', fontSize: '16px', marginLeft: '20px' }}>
                <li>Login issues</li>
                <li>File upload problems</li>
                <li>AI processing errors</li>
                <li>Browser compatibility</li>
              </ul>
            </div>

            <div style={{ padding: '30px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e9ecef', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <h4 style={{ color: '#2c3e50', marginBottom: '15px', fontSize: '18px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px' }}>
                💳 Billing Support
              </h4>
              <ul style={{ lineHeight: '1.8', color: '#495057', fontSize: '16px', marginLeft: '20px' }}>
                <li>Payment issues</li>
                <li>Subscription management</li>
                <li>Refund requests</li>
                <li>Invoice queries</li>
              </ul>
            </div>

            <div style={{ padding: '30px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e9ecef', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <h4 style={{ color: '#2c3e50', marginBottom: '15px', fontSize: '18px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px' }}>
                ❓ General Inquiries
              </h4>
              <ul style={{ lineHeight: '1.8', color: '#495057', fontSize: '16px', marginLeft: '20px' }}>
                <li>Feature requests</li>
                <li>Service information</li>
                <li>Partnership opportunities</li>
                <li>Feedback and suggestions</li>
              </ul>
            </div>
          </div>
        </section>

        <section style={{ marginBottom: '50px' }}>
          <h2 style={{ color: '#2c3e50', marginBottom: '30px', fontSize: '24px', fontWeight: '600', textAlign: 'center' }}>Frequently Asked Questions</h2>
          <div style={{ padding: '30px', backgroundColor: '#f8f9fa', borderRadius: '12px', border: '1px solid #e9ecef' }}>
            <div style={{ marginBottom: '25px' }}>
              <p style={{ lineHeight: '1.8', color: '#2c3e50', fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                Q: How quickly do you respond to support requests?
              </p>
              <p style={{ lineHeight: '1.8', color: '#495057', fontSize: '16px', marginBottom: 0 }}>
                A: We aim to respond to all inquiries within 24 hours during business days.
              </p>
            </div>
            <div style={{ marginBottom: '25px' }}>
              <p style={{ lineHeight: '1.8', color: '#2c3e50', fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                Q: What file formats do you support?
              </p>
              <p style={{ lineHeight: '1.8', color: '#495057', fontSize: '16px', marginBottom: 0 }}>
                A: We support .xlsx, .xls, and .csv file formats.
              </p>
            </div>
            <div>
              <p style={{ lineHeight: '1.8', color: '#2c3e50', fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                Q: Is there a free trial available?
              </p>
              <p style={{ lineHeight: '1.8', color: '#495057', fontSize: '16px', marginBottom: 0 }}>
                A: Yes, we offer a 7-day money-back guarantee for new subscribers.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 style={{ color: '#2c3e50', marginBottom: '30px', fontSize: '24px', fontWeight: '600', textAlign: 'center' }}>Legal Pages</h2>
          <p style={{ lineHeight: '1.8', color: '#495057', fontSize: '16px', textAlign: 'center', marginBottom: '20px' }}>
            For detailed information about our policies, please visit:
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '20px' }}>
            <a href="/privacy-policy" style={{ color: '#0078d4', textDecoration: 'none', fontSize: '16px', fontWeight: '500' }}>Privacy Policy</a>
            <a href="/terms-conditions" style={{ color: '#0078d4', textDecoration: 'none', fontSize: '16px', fontWeight: '500' }}>Terms and Conditions</a>
            <a href="/cancellation-refund" style={{ color: '#0078d4', textDecoration: 'none', fontSize: '16px', fontWeight: '500' }}>Cancellation and Refund Policy</a>
            <a href="/shipping-delivery" style={{ color: '#0078d4', textDecoration: 'none', fontSize: '16px', fontWeight: '500' }}>Shipping and Delivery Policy</a>
          </div>
        </section>
      </div>
    </div>
  );
}