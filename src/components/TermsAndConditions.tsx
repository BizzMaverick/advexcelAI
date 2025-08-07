import React from 'react';
import { Link } from 'react-router-dom';

const TermsAndConditions: React.FC = () => {
  return (
    <div style={{ 
      padding: '40px 20px', 
      fontFamily: 'Arial, sans-serif',
      maxWidth: '800px',
      margin: '0 auto',
      lineHeight: '1.8'
    }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>Terms and Conditions</h1>
      <p style={{ textAlign: 'center', marginBottom: '40px', fontStyle: 'italic' }}><strong>Last updated:</strong> December 2024</p>
      
      <h2 style={{ color: '#444', marginTop: '30px' }}>1. Acceptance of Terms</h2>
      <p>By accessing and using AdvExcel Online, you accept and agree to be bound by the terms and provision of this agreement.</p>
      
      <h2 style={{ color: '#444', marginTop: '30px' }}>2. Service Description</h2>
      <p>AdvExcel Online is an AI-powered Excel processing service that helps users analyze, sort, filter, and manipulate Excel data through natural language commands.</p>
      
      <h2 style={{ color: '#444', marginTop: '30px' }}>3. User Accounts</h2>
      <p>Users must create an account to access our services. You are responsible for maintaining the confidentiality of your account credentials.</p>
      
      <h2 style={{ color: '#444', marginTop: '30px' }}>4. Subscription and Payment</h2>
      <p>Our service is offered on a subscription basis at ₹249 per month. Payments are processed through Razorpay. Subscriptions automatically renew unless cancelled.</p>
      
      <h2 style={{ color: '#444', marginTop: '30px' }}>5. Data Privacy</h2>
      <p>We process your Excel data to provide our AI services. Data is not stored permanently and is deleted after processing. See our Privacy Policy for details.</p>
      
      <h2 style={{ color: '#444', marginTop: '30px' }}>6. Acceptable Use</h2>
      <p>Users agree not to:</p>
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '8px', 
        margin: '15px 0' 
      }}>
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          <li>Upload malicious or harmful content</li>
          <li>Attempt to reverse engineer our services</li>
          <li>Use the service for illegal activities</li>
          <li>Share account credentials with others</li>
        </ul>
      </div>
      
      <h2 style={{ color: '#444', marginTop: '30px' }}>7. Service Availability</h2>
      <p>We strive to maintain 99.9% uptime but cannot guarantee uninterrupted service. Maintenance windows will be announced in advance.</p>
      
      <h2 style={{ color: '#444', marginTop: '30px' }}>8. Limitation of Liability</h2>
      <p>AdvExcel Online shall not be liable for any indirect, incidental, special, or consequential damages resulting from the use of our service.</p>
      
      <h2 style={{ color: '#444', marginTop: '30px' }}>9. Termination</h2>
      <p>We reserve the right to terminate accounts that violate these terms. Users may cancel their subscription at any time.</p>
      
      <h2 style={{ color: '#444', marginTop: '30px' }}>10. Changes to Terms</h2>
      <p>We reserve the right to modify these terms at any time. Users will be notified of significant changes via email.</p>
      
      <h2 style={{ color: '#444', marginTop: '30px' }}>11. Governing Law</h2>
      <p>These terms are governed by the laws of India. Any disputes will be resolved in the courts of Mumbai, India.</p>
      
      <h2 style={{ color: '#444', marginTop: '30px' }}>Contact Information</h2>
      <p>For questions about these terms, contact us at: <a href="mailto:contact@advexcel.online" style={{ color: '#007bff' }}>contact@advexcel.online</a></p>
      
      <div style={{ marginTop: '40px', textAlign: 'center' }}>
        <Link to="/" style={{ color: '#007bff', textDecoration: 'none', fontSize: '16px' }}>← Back to Home</Link>
      </div>
    </div>
  );
};

export default TermsAndConditions;