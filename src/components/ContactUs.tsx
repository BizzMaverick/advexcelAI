import React from 'react';
import { Link } from 'react-router-dom';

const ContactUs: React.FC = () => {
  return (
    <div style={{ 
      padding: '40px 20px', 
      fontFamily: 'Arial, sans-serif',
      maxWidth: '800px',
      margin: '0 auto',
      lineHeight: '1.8'
    }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>Contact Us</h1>
      <p style={{ textAlign: 'center', marginBottom: '40px', fontStyle: 'italic' }}>We're here to help! Reach out to us for any questions or support.</p>
      
      <h2 style={{ color: '#444', marginTop: '30px' }}>Get in Touch</h2>
      <p>For all inquiries, support requests, and feedback, please contact us at:</p>
      
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '30px', 
        borderRadius: '8px', 
        margin: '20px 0',
        textAlign: 'center'
      }}>
        <h3 style={{ color: '#007bff', marginBottom: '20px' }}>Email Support</h3>
        <p style={{ fontSize: '18px', marginBottom: '10px' }}>
          <a href="mailto:contact@advexcel.online" style={{ color: '#007bff', textDecoration: 'none', fontWeight: 'bold' }}>
            contact@advexcel.online
          </a>
        </p>
        <p style={{ color: '#666', fontSize: '14px' }}>We typically respond within 24 hours</p>
      </div>
      
      <h2 style={{ color: '#444', marginTop: '30px' }}>What We Can Help With</h2>
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '8px', 
        margin: '15px 0' 
      }}>
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          <li>Technical support and troubleshooting</li>
          <li>Account and billing questions</li>
          <li>Feature requests and feedback</li>
          <li>Subscription management</li>
          <li>Refund and cancellation requests</li>
          <li>General inquiries about our service</li>
        </ul>
      </div>
      
      <h2 style={{ color: '#444', marginTop: '30px' }}>Business Information</h2>
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '8px', 
        margin: '15px 0' 
      }}>
        <p><strong>Service Name:</strong> AdvExcel Online - Excel AI Assistant</p>
        <p><strong>Website:</strong> https://www.advexcel.online</p>
        <p><strong>Email:</strong> contact@advexcel.online</p>
        <p><strong>Service Type:</strong> AI-powered Excel processing and analysis</p>
        <p><strong>Pricing:</strong> ₹249 per month</p>
      </div>
      
      <h2 style={{ color: '#444', marginTop: '30px' }}>Response Times</h2>
      <p>We strive to provide prompt support:</p>
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '8px', 
        margin: '15px 0' 
      }}>
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          <li><strong>General Inquiries:</strong> Within 24 hours</li>
          <li><strong>Technical Support:</strong> Within 12 hours</li>
          <li><strong>Billing Issues:</strong> Within 6 hours</li>
          <li><strong>Urgent Matters:</strong> Same day response</li>
        </ul>
      </div>
      
      <h2 style={{ color: '#444', marginTop: '30px' }}>Before You Contact Us</h2>
      <p>To help us assist you better, please include:</p>
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '8px', 
        margin: '15px 0' 
      }}>
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          <li>Your account email address</li>
          <li>Detailed description of your issue</li>
          <li>Screenshots if applicable</li>
          <li>Browser and device information for technical issues</li>
          <li>Any error messages you received</li>
        </ul>
      </div>
      
      <h2 style={{ color: '#444', marginTop: '30px' }}>Privacy</h2>
      <p>All communications are confidential and handled according to our Privacy Policy. We never share your personal information with third parties.</p>
      
      <div style={{ marginTop: '40px', textAlign: 'center' }}>
        <Link to="/" style={{ color: '#007bff', textDecoration: 'none', fontSize: '16px' }}>← Back to Home</Link>
      </div>
    </div>
  );
};

export default ContactUs;