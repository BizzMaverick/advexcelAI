import React from 'react';

export default function ShippingDelivery() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#333', marginBottom: '30px' }}>Shipping and Delivery Policy</h1>
      <p style={{ color: '#666', marginBottom: '20px' }}>Last updated: {new Date().toLocaleDateString()}</p>
      
      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#333', marginBottom: '15px' }}>1. Service Nature</h2>
        <p style={{ lineHeight: '1.6', color: '#555' }}>
          Excel AI Assistant is a <strong>digital service</strong> provided entirely online. 
          There are no physical products to ship or deliver. All services are delivered 
          electronically through our web platform.
        </p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#333', marginBottom: '15px' }}>2. Service Delivery</h2>
        <p style={{ lineHeight: '1.6', color: '#555' }}>
          Upon successful payment and account creation:
        </p>
        <ul style={{ lineHeight: '1.6', color: '#555', marginLeft: '20px' }}>
          <li><strong>Instant Access:</strong> Service is activated immediately after payment confirmation</li>
          <li><strong>Account Credentials:</strong> Login details are sent to your registered email</li>
          <li><strong>Service Availability:</strong> 24/7 access through https://www.advexcel.online</li>
          <li><strong>No Waiting Time:</strong> Start using the service right away</li>
        </ul>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#333', marginBottom: '15px' }}>3. Digital Delivery Process</h2>
        <ol style={{ lineHeight: '1.6', color: '#555', marginLeft: '20px' }}>
          <li>Complete payment through Razorpay</li>
          <li>Receive payment confirmation email</li>
          <li>Account is automatically activated</li>
          <li>Access service immediately at www.advexcel.online</li>
          <li>Start uploading and processing Excel files</li>
        </ol>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#333', marginBottom: '15px' }}>4. Service Requirements</h2>
        <p style={{ lineHeight: '1.6', color: '#555' }}>
          To access our service, you need:
        </p>
        <ul style={{ lineHeight: '1.6', color: '#555', marginLeft: '20px' }}>
          <li>Internet connection</li>
          <li>Modern web browser (Chrome, Firefox, Safari, Edge)</li>
          <li>Valid email address</li>
          <li>Excel files (.xlsx, .xls, .csv) to process</li>
        </ul>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#333', marginBottom: '15px' }}>5. Service Availability</h2>
        <p style={{ lineHeight: '1.6', color: '#555' }}>
          Our service is available:
        </p>
        <ul style={{ lineHeight: '1.6', color: '#555', marginLeft: '20px' }}>
          <li><strong>24/7 Access:</strong> Available round the clock</li>
          <li><strong>Global Availability:</strong> Accessible from anywhere with internet</li>
          <li><strong>Instant Processing:</strong> AI responses within seconds</li>
          <li><strong>Cloud-Based:</strong> No software installation required</li>
        </ul>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#333', marginBottom: '15px' }}>6. Technical Support</h2>
        <p style={{ lineHeight: '1.6', color: '#555' }}>
          If you experience any issues accessing the service:
        </p>
        <ul style={{ lineHeight: '1.6', color: '#555', marginLeft: '20px' }}>
          <li>Check your internet connection</li>
          <li>Clear browser cache and cookies</li>
          <li>Try a different browser</li>
          <li>Contact support at support@advexcel.online</li>
        </ul>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#333', marginBottom: '15px' }}>7. Contact Information</h2>
        <p style={{ lineHeight: '1.6', color: '#555' }}>
          For service delivery issues or technical support:
          <br />
          Email: support@advexcel.online
          <br />
          Website: https://www.advexcel.online
          <br />
          Response Time: Within 24 hours
        </p>
      </section>
    </div>
  );
}