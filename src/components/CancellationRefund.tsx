import React from 'react';

export default function CancellationRefund() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#333', marginBottom: '30px' }}>Cancellation and Refund Policy</h1>
      <p style={{ color: '#666', marginBottom: '20px' }}>Last updated: {new Date().toLocaleDateString()}</p>
      
      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#333', marginBottom: '15px' }}>1. Subscription Cancellation</h2>
        <p style={{ lineHeight: '1.6', color: '#555' }}>
          You can cancel your Excel AI Assistant subscription at any time by:
        </p>
        <ul style={{ lineHeight: '1.6', color: '#555', marginLeft: '20px' }}>
          <li>Contacting our support team at support@advexcel.online</li>
          <li>Using the cancellation option in your account dashboard</li>
          <li>Sending a cancellation request via email</li>
        </ul>
        <p style={{ lineHeight: '1.6', color: '#555' }}>
          Upon cancellation, your service will remain active until the end of your current billing period.
        </p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#333', marginBottom: '15px' }}>2. Refund Policy</h2>
        <p style={{ lineHeight: '1.6', color: '#555' }}>
          <strong>7-Day Money Back Guarantee:</strong> If you are not satisfied with our service, 
          you can request a full refund within 7 days of your initial subscription.
        </p>
        <p style={{ lineHeight: '1.6', color: '#555' }}>
          <strong>Monthly Subscriptions:</strong> No refunds are provided for monthly subscription fees 
          after the 7-day trial period, except in cases of:
        </p>
        <ul style={{ lineHeight: '1.6', color: '#555', marginLeft: '20px' }}>
          <li>Service unavailability for more than 48 consecutive hours</li>
          <li>Technical issues preventing service usage</li>
          <li>Billing errors or duplicate charges</li>
        </ul>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#333', marginBottom: '15px' }}>3. Refund Process</h2>
        <p style={{ lineHeight: '1.6', color: '#555' }}>
          To request a refund:
        </p>
        <ol style={{ lineHeight: '1.6', color: '#555', marginLeft: '20px' }}>
          <li>Email us at support@advexcel.online with your refund request</li>
          <li>Include your account email and reason for refund</li>
          <li>We will review your request within 2-3 business days</li>
          <li>Approved refunds will be processed within 5-7 business days</li>
          <li>Refunds will be credited to your original payment method</li>
        </ol>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#333', marginBottom: '15px' }}>4. Non-Refundable Items</h2>
        <p style={{ lineHeight: '1.6', color: '#555' }}>
          The following are not eligible for refunds:
        </p>
        <ul style={{ lineHeight: '1.6', color: '#555', marginLeft: '20px' }}>
          <li>Subscription fees after the 7-day trial period (except as noted above)</li>
          <li>Services already consumed or used</li>
          <li>Cancellations made after the billing cycle has renewed</li>
          <li>Violations of our Terms of Service</li>
        </ul>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#333', marginBottom: '15px' }}>5. Processing Time</h2>
        <p style={{ lineHeight: '1.6', color: '#555' }}>
          Refunds are processed through Razorpay and typically take:
        </p>
        <ul style={{ lineHeight: '1.6', color: '#555', marginLeft: '20px' }}>
          <li>Credit/Debit Cards: 5-7 business days</li>
          <li>Net Banking: 5-7 business days</li>
          <li>UPI/Wallets: 1-3 business days</li>
        </ul>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#333', marginBottom: '15px' }}>6. Contact Us</h2>
        <p style={{ lineHeight: '1.6', color: '#555' }}>
          For cancellation or refund requests, contact us at:
          <br />
          Email: support@advexcel.online
          <br />
          Response Time: Within 24 hours
          <br />
          Website: https://www.advexcel.online
        </p>
      </section>
    </div>
  );
}