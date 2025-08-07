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
      
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px', fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: 'white', minHeight: 'calc(100vh - 80px)', boxShadow: '0 0 20px rgba(0,0,0,0.1)', textAlign: 'center' }}>
        <p style={{ color: '#666', marginBottom: '40px', fontSize: '14px' }}>Last updated: {new Date().toLocaleDateString()}</p>
        
        <section style={{ marginBottom: '50px' }}>
          <h2 style={{ color: '#2c3e50', marginBottom: '25px', fontSize: '22px', fontWeight: '600', borderBottom: '3px solid #0078d4', paddingBottom: '15px', display: 'inline-block' }}>1. Subscription Cancellation</h2>
          <p style={{ lineHeight: '2', color: '#495057', fontSize: '16px', marginBottom: '25px', maxWidth: '700px', margin: '0 auto 25px auto' }}>
            You may cancel your subscription at any time through your account settings or by contacting 
            our support team at contact@advexcel.online. Cancellation will take effect at the end of 
            your current billing period, and you will continue to have access to the service until then.
          </p>
        </section>

        <section style={{ marginBottom: '50px' }}>
          <h2 style={{ color: '#2c3e50', marginBottom: '25px', fontSize: '22px', fontWeight: '600', borderBottom: '3px solid #0078d4', paddingBottom: '15px', display: 'inline-block' }}>2. Refund Policy</h2>
          <p style={{ lineHeight: '2', color: '#495057', fontSize: '16px', marginBottom: '25px', maxWidth: '700px', margin: '0 auto 25px auto' }}>
            We offer a 7-day money-back guarantee for new subscribers. If you are not satisfied with 
            our service within the first 7 days of your subscription, you may request a full refund. 
            This policy ensures you can try our service risk-free.
          </p>
        </section>

        <section style={{ marginBottom: '50px' }}>
          <h2 style={{ color: '#2c3e50', marginBottom: '25px', fontSize: '22px', fontWeight: '600', borderBottom: '3px solid #0078d4', paddingBottom: '15px', display: 'inline-block' }}>3. Refund Eligibility</h2>
          <p style={{ lineHeight: '2', color: '#495057', fontSize: '16px', marginBottom: '25px', maxWidth: '700px', margin: '0 auto 25px auto' }}>Refunds are available under the following conditions:</p>
          <div style={{ textAlign: 'left', maxWidth: '600px', margin: '0 auto', backgroundColor: '#f8f9fa', padding: '25px', borderRadius: '8px' }}>
            <ul style={{ lineHeight: '2', color: '#495057', fontSize: '16px', paddingLeft: '25px', margin: 0 }}>
              <li style={{ marginBottom: '8px' }}>Request made within 7 days of initial subscription</li>
              <li style={{ marginBottom: '8px' }}>Technical issues that prevent service usage</li>
              <li style={{ marginBottom: '8px' }}>Billing errors or duplicate charges</li>
              <li style={{ marginBottom: '8px' }}>Service not delivered as promised</li>
              <li style={{ marginBottom: '8px' }}>Unauthorized charges to your account</li>
            </ul>
          </div>
        </section>

        <section style={{ marginBottom: '50px' }}>
          <h2 style={{ color: '#2c3e50', marginBottom: '25px', fontSize: '22px', fontWeight: '600', borderBottom: '3px solid #0078d4', paddingBottom: '15px', display: 'inline-block' }}>4. Non-Refundable Items</h2>
          <p style={{ lineHeight: '2', color: '#495057', fontSize: '16px', marginBottom: '25px', maxWidth: '700px', margin: '0 auto 25px auto' }}>The following are not eligible for refunds:</p>
          <div style={{ textAlign: 'left', maxWidth: '600px', margin: '0 auto', backgroundColor: '#f8f9fa', padding: '25px', borderRadius: '8px' }}>
            <ul style={{ lineHeight: '2', color: '#495057', fontSize: '16px', paddingLeft: '25px', margin: 0 }}>
              <li style={{ marginBottom: '8px' }}>Subscriptions older than 7 days</li>
              <li style={{ marginBottom: '8px' }}>Partial month usage after the 7-day period</li>
              <li style={{ marginBottom: '8px' }}>Account termination due to policy violations</li>
              <li style={{ marginBottom: '8px' }}>Change of mind after the 7-day guarantee period</li>
              <li style={{ marginBottom: '8px' }}>Renewal charges (unless cancelled before renewal)</li>
            </ul>
          </div>
        </section>

        <section style={{ marginBottom: '50px' }}>
          <h2 style={{ color: '#2c3e50', marginBottom: '25px', fontSize: '22px', fontWeight: '600', borderBottom: '3px solid #0078d4', paddingBottom: '15px', display: 'inline-block' }}>5. Refund Process</h2>
          <p style={{ lineHeight: '2', color: '#495057', fontSize: '16px', marginBottom: '25px', maxWidth: '700px', margin: '0 auto 25px auto' }}>
            To request a refund, contact us at contact@advexcel.online with your account details 
            and reason for refund. Include your subscription date and any relevant screenshots. 
            Approved refunds will be processed within 5-7 business days to your original payment method through Razorpay.
          </p>
        </section>

        <section style={{ marginBottom: '50px' }}>
          <h2 style={{ color: '#2c3e50', marginBottom: '25px', fontSize: '22px', fontWeight: '600', borderBottom: '3px solid #0078d4', paddingBottom: '15px', display: 'inline-block' }}>6. Automatic Renewal</h2>
          <p style={{ lineHeight: '2', color: '#495057', fontSize: '16px', marginBottom: '25px', maxWidth: '700px', margin: '0 auto 25px auto' }}>
            Subscriptions automatically renew monthly unless cancelled. You will be charged the current 
            subscription rate at the time of renewal. Cancel before your renewal date to avoid charges. 
            We will send reminder emails before renewal.
          </p>
        </section>

        <section style={{ marginBottom: '50px' }}>
          <h2 style={{ color: '#2c3e50', marginBottom: '25px', fontSize: '22px', fontWeight: '600', borderBottom: '3px solid #0078d4', paddingBottom: '15px', display: 'inline-block' }}>7. Contact Information</h2>
          <p style={{ lineHeight: '2', color: '#495057', fontSize: '16px', marginBottom: '25px', maxWidth: '700px', margin: '0 auto 25px auto' }}>
            For cancellations or refund requests, contact us at:
            <br /><br />
            <strong>Email:</strong> contact@advexcel.online
            <br />
            <strong>Website:</strong> https://www.advexcel.online
            <br />
            <strong>Response Time:</strong> Within 24 hours
          </p>
        </section>
      </div>
    </div>
  );
}