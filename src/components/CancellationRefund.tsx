import React from 'react';

export default function CancellationRefund() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* Header with Home Link */}
      <header style={{ backgroundColor: '#0078d4', color: 'white', padding: '16px 0' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <a href="/" style={{ color: 'white', textDecoration: 'none', fontSize: '16px', fontWeight: 'bold' }}>← Back to Home</a>
          <h1 style={{ margin: 0, fontSize: '24px' }}>Cancellation and Refund Policy</h1>
        </div>
      </header>
      
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px', fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: 'white', minHeight: 'calc(100vh - 80px)', boxShadow: '0 0 20px rgba(0,0,0,0.1)' }}>
        <p style={{ color: '#666', marginBottom: '30px', fontSize: '14px', textAlign: 'center' }}>Last updated: {new Date().toLocaleDateString()}</p>
        
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ color: '#2c3e50', marginBottom: '20px', fontSize: '20px', fontWeight: '600', borderBottom: '2px solid #e9ecef', paddingBottom: '10px' }}>1. Subscription Cancellation</h2>
          <p style={{ lineHeight: '1.8', color: '#495057', fontSize: '16px', textAlign: 'justify', marginBottom: '16px' }}>
            You can cancel your Excel AI Assistant subscription at any time by:
          </p>
          <ul style={{ lineHeight: '1.8', color: '#495057', fontSize: '16px', marginLeft: '30px', marginBottom: '20px' }}>
            <li>Contacting our support team at contact@advexcel.online</li>
            <li>Using the cancellation option in your account dashboard</li>
            <li>Sending a cancellation request via email</li>
          </ul>
          <p style={{ lineHeight: '1.8', color: '#495057', fontSize: '16px', textAlign: 'justify', marginBottom: '16px' }}>
            Upon cancellation, your service will remain active until the end of your current billing period.
          </p>
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ color: '#2c3e50', marginBottom: '20px', fontSize: '20px', fontWeight: '600', borderBottom: '2px solid #e9ecef', paddingBottom: '10px' }}>2. Refund Policy</h2>
          <p style={{ lineHeight: '1.8', color: '#495057', fontSize: '16px', textAlign: 'justify', marginBottom: '16px' }}>
            <strong>7-Day Money Back Guarantee:</strong> If you are not satisfied with our service, 
            you can request a full refund within 7 days of your initial subscription.
          </p>
          <p style={{ lineHeight: '1.8', color: '#495057', fontSize: '16px', textAlign: 'justify', marginBottom: '16px' }}>
            <strong>Monthly Subscriptions:</strong> No refunds are provided for monthly subscription fees 
            after the 7-day trial period, except in cases of:
          </p>
          <ul style={{ lineHeight: '1.8', color: '#495057', fontSize: '16px', marginLeft: '30px', marginBottom: '20px' }}>
            <li>Service unavailability for more than 48 consecutive hours</li>
            <li>Technical issues preventing service usage</li>
            <li>Billing errors or duplicate charges</li>
          </ul>
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ color: '#2c3e50', marginBottom: '20px', fontSize: '20px', fontWeight: '600', borderBottom: '2px solid #e9ecef', paddingBottom: '10px' }}>3. Refund Process</h2>
          <p style={{ lineHeight: '1.8', color: '#495057', fontSize: '16px', textAlign: 'justify', marginBottom: '16px' }}>
            To request a refund:
          </p>
          <ol style={{ lineHeight: '1.8', color: '#495057', fontSize: '16px', marginLeft: '30px', marginBottom: '20px' }}>
            <li>Email us at contact@advexcel.online with your refund request</li>
            <li>Include your account email and reason for refund</li>
            <li>We will review your request within 2-3 business days</li>
            <li>Approved refunds will be processed within 5-7 business days</li>
            <li>Refunds will be credited to your original payment method</li>
          </ol>
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ color: '#2c3e50', marginBottom: '20px', fontSize: '20px', fontWeight: '600', borderBottom: '2px solid #e9ecef', paddingBottom: '10px' }}>4. Non-Refundable Items</h2>
          <p style={{ lineHeight: '1.8', color: '#495057', fontSize: '16px', textAlign: 'justify', marginBottom: '16px' }}>
            The following are not eligible for refunds:
          </p>
          <ul style={{ lineHeight: '1.8', color: '#495057', fontSize: '16px', marginLeft: '30px', marginBottom: '20px' }}>
            <li>Subscription fees after the 7-day trial period (except as noted above)</li>
            <li>Services already consumed or used</li>
            <li>Cancellations made after the billing cycle has renewed</li>
            <li>Violations of our Terms of Service</li>
          </ul>
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ color: '#2c3e50', marginBottom: '20px', fontSize: '20px', fontWeight: '600', borderBottom: '2px solid #e9ecef', paddingBottom: '10px' }}>5. Processing Time</h2>
          <p style={{ lineHeight: '1.8', color: '#495057', fontSize: '16px', textAlign: 'justify', marginBottom: '16px' }}>
            Refunds are processed through Razorpay and typically take:
          </p>
          <ul style={{ lineHeight: '1.8', color: '#495057', fontSize: '16px', marginLeft: '30px', marginBottom: '20px' }}>
            <li>Credit/Debit Cards: 5-7 business days</li>
            <li>Net Banking: 5-7 business days</li>
            <li>UPI/Wallets: 1-3 business days</li>
          </ul>
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ color: '#2c3e50', marginBottom: '20px', fontSize: '20px', fontWeight: '600', borderBottom: '2px solid #e9ecef', paddingBottom: '10px' }}>6. Contact Us</h2>
          <p style={{ lineHeight: '1.8', color: '#495057', fontSize: '16px', textAlign: 'justify', marginBottom: '16px' }}>
            For cancellation or refund requests, contact us at:
            <br />
            Email: contact@advexcel.online
            <br />
            Response Time: Within 24 hours
            <br />
            Website: https://www.advexcel.online
          </p>
        </section>
      </div>
    </div>
  );
}