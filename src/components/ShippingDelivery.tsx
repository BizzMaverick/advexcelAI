import React from 'react';

export default function ShippingDelivery() {
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
        <h1 style={{ fontSize: '28px', fontWeight: '600', color: '#000', marginBottom: '10px' }}>Shipping and Delivery Policy</h1>
        <p style={{ color: '#666', fontSize: '14px', marginBottom: '30px' }}>Last updated on January 8th, 2025</p>
        
        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#000', marginBottom: '15px' }}>1. Service Nature</h2>
          <p style={{ marginBottom: '15px' }}>
            Excel AI Assistant is a digital service delivered entirely online. There are no physical products to ship or deliver. 
            All services are provided through our web platform, accessible from anywhere with an internet connection.
          </p>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#000', marginBottom: '15px' }}>2. Service Delivery</h2>
          <p style={{ marginBottom: '15px' }}>Upon successful payment and account activation:</p>
          <ul style={{ paddingLeft: '20px', marginBottom: '15px' }}>
            <li>Immediate access to the Excel AI Assistant platform</li>
            <li>Full feature availability within minutes of payment confirmation</li>
            <li>Account activation via email notification</li>
            <li>30-day access period from payment date</li>
            <li>Instant processing of Excel files</li>
          </ul>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#000', marginBottom: '15px' }}>3. Access Requirements</h2>
          <p style={{ marginBottom: '15px' }}>To access our service, you need:</p>
          <ul style={{ paddingLeft: '20px', marginBottom: '15px' }}>
            <li>Stable internet connection (minimum 1 Mbps recommended)</li>
            <li>Modern web browser (Chrome, Firefox, Safari, Edge)</li>
            <li>Valid email address for account verification</li>
            <li>Active subscription with payment confirmation</li>
            <li>JavaScript enabled in your browser</li>
          </ul>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#000', marginBottom: '15px' }}>4. Service Availability</h2>
          <p style={{ marginBottom: '15px' }}>
            Our service is available 24/7 with 99.9% uptime guarantee. Scheduled maintenance will be announced in advance 
            with minimal service interruption, typically during low-usage hours.
          </p>
          <p>
            Emergency maintenance may occur without prior notice but will be communicated immediately through email notifications.
          </p>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#000', marginBottom: '15px' }}>5. Geographic Availability</h2>
          <p>
            Excel AI Assistant is available globally to all users with internet access. The service works in all countries 
            and regions without restrictions, subject to local internet regulations.
          </p>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#000', marginBottom: '15px' }}>6. Data Processing and Delivery</h2>
          <p style={{ marginBottom: '15px' }}>
            Processed Excel files are delivered instantly through the web interface. Files can be downloaded immediately 
            after processing is complete.
          </p>
          <p>
            Processing times vary based on file size and complexity, typically ranging from seconds to a few minutes for standard Excel files.
          </p>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#000', marginBottom: '15px' }}>7. Technical Support</h2>
          <p>
            Technical support is provided via email at <a href="mailto:contact@advexcel.online?subject=Technical Support" style={{ color: '#007bff', textDecoration: 'none' }}>contact@advexcel.online</a>. We aim to respond to all queries within 24 hours 
            during business days. For urgent technical issues affecting service delivery, we provide priority support with faster response times.
          </p>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#000', marginBottom: '15px' }}>8. Contact Information</h2>
          <p style={{ marginBottom: '10px' }}>For service delivery questions, contact us at:</p>
          <p style={{ marginBottom: '5px' }}>Email: <a href="mailto:contact@advexcel.online" style={{ color: '#007bff', textDecoration: 'none' }}>contact@advexcel.online</a></p>
          <p style={{ marginBottom: '5px' }}>Website: www.advexcel.online</p>
          <p>Response Time: Within 24 hours</p>
        </section>
      </div>
    </div>
  );
}