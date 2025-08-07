import React from 'react';
import { Link } from 'react-router-dom';

const CancellationRefund: React.FC = () => {
  return (
    <div style={{ 
      padding: '40px 20px', 
      fontFamily: 'Arial, sans-serif',
      maxWidth: '800px',
      margin: '0 auto',
      lineHeight: '1.8'
    }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>Cancellation and Refund Policy</h1>
      <p style={{ textAlign: 'center', marginBottom: '40px', fontStyle: 'italic' }}><strong>Last updated:</strong> December 2024</p>
      
      <h2 style={{ color: '#444', marginTop: '30px' }}>1. Subscription Cancellation</h2>
      <p>You may cancel your subscription at any time through your account settings or by contacting our support team. Cancellation will take effect at the end of your current billing period.</p>
      
      <h2 style={{ color: '#444', marginTop: '30px' }}>2. Refund Policy</h2>
      <p>We offer a 7-day money-back guarantee for new subscribers. If you are not satisfied with our service within the first 7 days of your subscription, you may request a full refund.</p>
      
      <h2 style={{ color: '#444', marginTop: '30px' }}>3. Refund Eligibility</h2>
      <p>Refunds are available under the following conditions:</p>
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '8px', 
        margin: '15px 0' 
      }}>
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          <li>Request made within 7 days of initial subscription</li>
          <li>Technical issues that prevent service usage</li>
          <li>Billing errors or duplicate charges</li>
          <li>Service not delivered as promised</li>
        </ul>
      </div>
      
      <h2 style={{ color: '#444', marginTop: '30px' }}>4. Non-Refundable Items</h2>
      <p>The following are not eligible for refunds:</p>
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '8px', 
        margin: '15px 0' 
      }}>
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          <li>Subscriptions older than 7 days</li>
          <li>Partial month usage</li>
          <li>Account termination due to policy violations</li>
          <li>Change of mind after the 7-day period</li>
        </ul>
      </div>
      
      <h2 style={{ color: '#444', marginTop: '30px' }}>5. Refund Process</h2>
      <p>To request a refund, contact us at contact@advexcel.online with your account details and reason for refund. Approved refunds will be processed within 5-7 business days to your original payment method.</p>
      
      <h2 style={{ color: '#444', marginTop: '30px' }}>6. Automatic Renewal</h2>
      <p>Subscriptions automatically renew monthly unless cancelled. You will be charged the current subscription rate at the time of renewal. Cancel before your renewal date to avoid charges.</p>
      
      <h2 style={{ color: '#444', marginTop: '30px' }}>7. Payment Disputes</h2>
      <p>For payment disputes or billing questions, contact us immediately. We will investigate and resolve issues promptly. Chargebacks may result in account suspension.</p>
      
      <h2 style={{ color: '#444', marginTop: '30px' }}>8. Service Modifications</h2>
      <p>If we significantly modify our service features or pricing, existing subscribers will be notified 30 days in advance and may cancel for a prorated refund.</p>
      
      <h2 style={{ color: '#444', marginTop: '30px' }}>Contact Information</h2>
      <p>For cancellations or refund requests, contact us at: <a href="mailto:contact@advexcel.online" style={{ color: '#007bff' }}>contact@advexcel.online</a></p>
      
      <div style={{ marginTop: '40px', textAlign: 'center' }}>
        <Link to="/" style={{ color: '#007bff', textDecoration: 'none', fontSize: '16px' }}>← Back to Home</Link>
      </div>
    </div>
  );
};

export default CancellationRefund;