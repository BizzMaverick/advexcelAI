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
          <h2 style={{ color: '#2c3e50', marginBottom: '25px', fontSize: '22px', fontWeight: '600', borderBottom: '3px solid #0078d4', paddingBottom: '15px', display: 'inline-block' }}>2. Service Access</h2>
          <p style={{ lineHeight: '2', color: '#495057', fontSize: '16px', marginBottom: '25px', maxWidth: '700px', margin: '0 auto 25px auto' }}>
            Excel AI Assistant is a free service available to all registered users. 
            You can cancel your account at any time through your account settings.
          </p>
        </section>

        <section style={{ marginBottom: '50px' }}>
          <h2 style={{ color: '#2c3e50', marginBottom: '25px', fontSize: '22px', fontWeight: '600', borderBottom: '3px solid #0078d4', paddingBottom: '15px', display: 'inline-block' }}>3. Data Retention</h2>
          <p style={{ lineHeight: '2', color: '#495057', fontSize: '16px', marginBottom: '25px', maxWidth: '700px', margin: '0 auto 25px auto' }}>When you cancel your account:</p>
          <div style={{ textAlign: 'left', maxWidth: '600px', margin: '0 auto', backgroundColor: '#f8f9fa', padding: '25px', borderRadius: '8px' }}>
            <ul style={{ lineHeight: '2', color: '#495057', fontSize: '16px', paddingLeft: '25px', margin: 0 }}>
              <li style={{ marginBottom: '8px' }}>Your account will be deactivated immediately</li>
              <li style={{ marginBottom: '8px' }}>Personal data will be deleted within 30 days</li>
              <li style={{ marginBottom: '8px' }}>Processed files are not stored permanently</li>
              <li style={{ marginBottom: '8px' }}>You can reactivate your account anytime</li>
              <li style={{ marginBottom: '8px' }}>No charges or fees apply</li>
            </ul>
          </div>
        </section>

        <section style={{ marginBottom: '50px' }}>
          <h2 style={{ color: '#2c3e50', marginBottom: '25px', fontSize: '22px', fontWeight: '600', borderBottom: '3px solid #0078d4', paddingBottom: '15px', display: 'inline-block' }}>4. Service Limitations</h2>
          <p style={{ lineHeight: '2', color: '#495057', fontSize: '16px', marginBottom: '25px', maxWidth: '700px', margin: '0 auto 25px auto' }}>Please note the following service limitations:</p>
          <div style={{ textAlign: 'left', maxWidth: '600px', margin: '0 auto', backgroundColor: '#f8f9fa', padding: '25px', borderRadius: '8px' }}>
            <ul style={{ lineHeight: '2', color: '#495057', fontSize: '16px', paddingLeft: '25px', margin: 0 }}>
              <li style={{ marginBottom: '8px' }}>File size limits may apply</li>
              <li style={{ marginBottom: '8px' }}>Processing time depends on file complexity</li>
              <li style={{ marginBottom: '8px' }}>Account termination for policy violations</li>
              <li style={{ marginBottom: '8px' }}>Service availability subject to maintenance</li>
              <li style={{ marginBottom: '8px' }}>No guaranteed uptime commitments</li>
            </ul>
          </div>
        </section>

        <section style={{ marginBottom: '50px' }}>
          <h2 style={{ color: '#2c3e50', marginBottom: '25px', fontSize: '22px', fontWeight: '600', borderBottom: '3px solid #0078d4', paddingBottom: '15px', display: 'inline-block' }}>5. Account Deletion</h2>
          <p style={{ lineHeight: '2', color: '#495057', fontSize: '16px', marginBottom: '25px', maxWidth: '700px', margin: '0 auto 25px auto' }}>
            To delete your account, contact us at contact@advexcel.online with your account details. 
            Include your registered email and any specific data deletion requests. 
            Account deletion will be processed within 5-7 business days.
          </p>
        </section>

        <section style={{ marginBottom: '50px' }}>
          <h2 style={{ color: '#2c3e50', marginBottom: '25px', fontSize: '22px', fontWeight: '600', borderBottom: '3px solid #0078d4', paddingBottom: '15px', display: 'inline-block' }}>6. Service Updates</h2>
          <p style={{ lineHeight: '2', color: '#495057', fontSize: '16px', marginBottom: '25px', maxWidth: '700px', margin: '0 auto 25px auto' }}>
            We continuously improve our service with new features and updates. 
            All registered users automatically receive access to new features. 
            We will notify users of major updates via email.
          </p>
        </section>

        <section style={{ marginBottom: '50px' }}>
          <h2 style={{ color: '#2c3e50', marginBottom: '25px', fontSize: '22px', fontWeight: '600', borderBottom: '3px solid #0078d4', paddingBottom: '15px', display: 'inline-block' }}>7. Contact Information</h2>
          <p style={{ lineHeight: '2', color: '#495057', fontSize: '16px', marginBottom: '25px', maxWidth: '700px', margin: '0 auto 25px auto' }}>
            For account cancellations or support, contact us at:
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