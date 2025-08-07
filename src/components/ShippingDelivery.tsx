import React from 'react';
import { Link } from 'react-router-dom';

const ShippingDelivery: React.FC = () => {
  return (
    <div style={{ 
      padding: '40px 20px', 
      fontFamily: 'Arial, sans-serif',
      maxWidth: '800px',
      margin: '0 auto',
      lineHeight: '1.8'
    }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>Shipping and Delivery Policy</h1>
      <p style={{ textAlign: 'center', marginBottom: '40px', fontStyle: 'italic' }}><strong>Last updated:</strong> December 2024</p>
      
      <h2 style={{ color: '#444', marginTop: '30px' }}>1. Service Nature</h2>
      <p>AdvExcel Online is a digital service delivered entirely online. There are no physical products to ship or deliver. All services are provided through our web platform.</p>
      
      <h2 style={{ color: '#444', marginTop: '30px' }}>2. Service Delivery</h2>
      <p>Upon successful subscription and payment:</p>
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '8px', 
        margin: '15px 0' 
      }}>
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          <li>Immediate access to the Excel AI Assistant platform</li>
          <li>Full feature availability within minutes of payment confirmation</li>
          <li>Account activation via email notification</li>
          <li>24/7 access to all subscribed features</li>
        </ul>
      </div>
      
      <h2 style={{ color: '#444', marginTop: '30px' }}>3. Access Requirements</h2>
      <p>To access our service, you need:</p>
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '8px', 
        margin: '15px 0' 
      }}>
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          <li>Stable internet connection</li>
          <li>Modern web browser (Chrome, Firefox, Safari, Edge)</li>
          <li>Valid email address for account verification</li>
          <li>Active subscription with confirmed payment</li>
        </ul>
      </div>
      
      <h2 style={{ color: '#444', marginTop: '30px' }}>4. Service Availability</h2>
      <p>Our service is available 24/7 with 99.9% uptime guarantee. Scheduled maintenance will be announced in advance with minimal service interruption.</p>
      
      <h2 style={{ color: '#444', marginTop: '30px' }}>5. Geographic Availability</h2>
      <p>AdvExcel Online is available globally. However, payment processing is currently optimized for Indian customers through Razorpay. International users may experience different payment options.</p>
      
      <h2 style={{ color: '#444', marginTop: '30px' }}>6. Technical Support</h2>
      <p>Technical support is provided via email at contact@advexcel.online. We aim to respond to all queries within 24 hours during business days.</p>
      
      <h2 style={{ color: '#444', marginTop: '30px' }}>7. Service Interruptions</h2>
      <p>In case of service interruptions:</p>
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '8px', 
        margin: '15px 0' 
      }}>
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          <li>Users will be notified via email</li>
          <li>Service credits may be provided for extended outages</li>
          <li>Alternative access methods will be communicated</li>
          <li>Regular updates on resolution progress</li>
        </ul>
      </div>
      
      <h2 style={{ color: '#444', marginTop: '30px' }}>8. Data Delivery</h2>
      <p>Processed Excel files are delivered instantly through the web interface. Files can be downloaded immediately after processing is complete.</p>
      
      <h2 style={{ color: '#444', marginTop: '30px' }}>Contact Information</h2>
      <p>For service delivery questions, contact us at: <a href="mailto:contact@advexcel.online" style={{ color: '#007bff' }}>contact@advexcel.online</a></p>
      
      <div style={{ marginTop: '40px', textAlign: 'center' }}>
        <Link to="/" style={{ color: '#007bff', textDecoration: 'none', fontSize: '16px' }}>← Back to Home</Link>
      </div>
    </div>
  );
};

export default ShippingDelivery;