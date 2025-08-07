import React from 'react';

export default function ShippingDelivery() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* Header with Home Link */}
      <header style={{ backgroundColor: '#0078d4', color: 'white', padding: '16px 0' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <a href="/" style={{ color: 'white', textDecoration: 'none', fontSize: '16px', fontWeight: 'bold' }}>← Back to Home</a>
          <h1 style={{ margin: 0, fontSize: '24px' }}>Shipping and Delivery Policy</h1>
        </div>
      </header>
      
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px', fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: 'white', minHeight: 'calc(100vh - 80px)', boxShadow: '0 0 20px rgba(0,0,0,0.1)' }}>
        <p style={{ color: '#666', marginBottom: '30px', fontSize: '14px', textAlign: 'center' }}>Last updated: {new Date().toLocaleDateString()}</p>
        
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ color: '#2c3e50', marginBottom: '20px', fontSize: '20px', fontWeight: '600', borderBottom: '2px solid #e9ecef', paddingBottom: '10px' }}>1. Service Nature</h2>
          <p style={{ lineHeight: '1.8', color: '#495057', fontSize: '16px', textAlign: 'justify', marginBottom: '16px' }}>
            Excel AI Assistant is a <strong>digital service</strong> provided entirely online. 
            There are no physical products to ship or deliver. All services are delivered 
            electronically through our web platform.
          </p>
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ color: '#2c3e50', marginBottom: '20px', fontSize: '20px', fontWeight: '600', borderBottom: '2px solid #e9ecef', paddingBottom: '10px' }}>2. Service Delivery</h2>
          <p style={{ lineHeight: '1.8', color: '#495057', fontSize: '16px', textAlign: 'justify', marginBottom: '16px' }}>
            Upon successful payment and account creation:
          </p>
          <ul style={{ lineHeight: '1.8', color: '#495057', fontSize: '16px', marginLeft: '30px', marginBottom: '20px' }}>
            <li><strong>Instant Access:</strong> Service is activated immediately after payment confirmation</li>
            <li><strong>Account Credentials:</strong> Login details are sent to your registered email</li>
            <li><strong>Service Availability:</strong> 24/7 access through https://www.advexcel.online</li>
            <li><strong>No Waiting Time:</strong> Start using the service right away</li>
          </ul>
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ color: '#2c3e50', marginBottom: '20px', fontSize: '20px', fontWeight: '600', borderBottom: '2px solid #e9ecef', paddingBottom: '10px' }}>3. Digital Delivery Process</h2>
          <ol style={{ lineHeight: '1.8', color: '#495057', fontSize: '16px', marginLeft: '30px', marginBottom: '20px' }}>
            <li>Complete payment through Razorpay</li>
            <li>Receive payment confirmation email</li>
            <li>Account is automatically activated</li>
            <li>Access service immediately at www.advexcel.online</li>
            <li>Start uploading and processing Excel files</li>
          </ol>
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ color: '#2c3e50', marginBottom: '20px', fontSize: '20px', fontWeight: '600', borderBottom: '2px solid #e9ecef', paddingBottom: '10px' }}>4. Service Requirements</h2>
          <p style={{ lineHeight: '1.8', color: '#495057', fontSize: '16px', textAlign: 'justify', marginBottom: '16px' }}>
            To access our service, you need:
          </p>
          <ul style={{ lineHeight: '1.8', color: '#495057', fontSize: '16px', marginLeft: '30px', marginBottom: '20px' }}>
            <li>Internet connection</li>
            <li>Modern web browser (Chrome, Firefox, Safari, Edge)</li>
            <li>Valid email address</li>
            <li>Excel files (.xlsx, .xls, .csv) to process</li>
          </ul>
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ color: '#2c3e50', marginBottom: '20px', fontSize: '20px', fontWeight: '600', borderBottom: '2px solid #e9ecef', paddingBottom: '10px' }}>5. Service Availability</h2>
          <p style={{ lineHeight: '1.8', color: '#495057', fontSize: '16px', textAlign: 'justify', marginBottom: '16px' }}>
            Our service is available:
          </p>
          <ul style={{ lineHeight: '1.8', color: '#495057', fontSize: '16px', marginLeft: '30px', marginBottom: '20px' }}>
            <li><strong>24/7 Access:</strong> Available round the clock</li>
            <li><strong>Global Availability:</strong> Accessible from anywhere with internet</li>
            <li><strong>Instant Processing:</strong> AI responses within seconds</li>
            <li><strong>Cloud-Based:</strong> No software installation required</li>
          </ul>
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ color: '#2c3e50', marginBottom: '20px', fontSize: '20px', fontWeight: '600', borderBottom: '2px solid #e9ecef', paddingBottom: '10px' }}>6. Technical Support</h2>
          <p style={{ lineHeight: '1.8', color: '#495057', fontSize: '16px', textAlign: 'justify', marginBottom: '16px' }}>
            If you experience any issues accessing the service:
          </p>
          <ul style={{ lineHeight: '1.8', color: '#495057', fontSize: '16px', marginLeft: '30px', marginBottom: '20px' }}>
            <li>Check your internet connection</li>
            <li>Clear browser cache and cookies</li>
            <li>Try a different browser</li>
            <li>Contact support at contact@advexcel.online</li>
          </ul>
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ color: '#2c3e50', marginBottom: '20px', fontSize: '20px', fontWeight: '600', borderBottom: '2px solid #e9ecef', paddingBottom: '10px' }}>7. Contact Information</h2>
          <p style={{ lineHeight: '1.8', color: '#495057', fontSize: '16px', textAlign: 'justify', marginBottom: '16px' }}>
            For service delivery issues or technical support:
            <br />
            Email: contact@advexcel.online
            <br />
            Website: https://www.advexcel.online
            <br />
            Response Time: Within 24 hours
          </p>
        </section>
      </div>
    </div>
  );
}