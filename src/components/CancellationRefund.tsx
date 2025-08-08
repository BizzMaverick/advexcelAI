import React from 'react';

export default function CancellationRefund() {
  return (
    <div style={{ 
      padding: '40px 20px', 
      maxWidth: '900px', 
      margin: '0 auto',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      lineHeight: '1.6',
      color: '#333'
    }}>
      <div style={{ borderBottom: '2px solid #e1e5e9', paddingBottom: '20px', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#1a1a1a', marginBottom: '10px' }}>Cancellation & Refund Policy</h1>
        <p style={{ color: '#666', fontSize: '14px' }}>Last updated: January 8, 2025</p>
      </div>
      
      <div style={{ marginBottom: '30px' }}>
        <p style={{ fontSize: '16px', color: '#555' }}>
          At AdvExcel Online, we strive to provide excellent service and customer satisfaction. This policy outlines our cancellation and refund procedures for our Excel AI Assistant subscription service.
        </p>
      </div>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1a1a1a', marginBottom: '15px' }}>1. Subscription Overview</h2>
        <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', border: '1px solid #e1e5e9' }}>
          <ul style={{ paddingLeft: '20px', margin: '0' }}>
            <li><strong>Service:</strong> Excel AI Assistant</li>
            <li><strong>Subscription Fee:</strong> ₹249 per month</li>
            <li><strong>Billing Cycle:</strong> Monthly (30 days from payment date)</li>
            <li><strong>Auto-renewal:</strong> No automatic renewal</li>
            <li><strong>Payment Method:</strong> Razorpay (Credit/Debit Cards, UPI, Net Banking)</li>
          </ul>
        </div>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1a1a1a', marginBottom: '15px' }}>2. Cancellation Policy</h2>
        
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#333', marginBottom: '10px' }}>2.1 How to Cancel</h3>
        <p>You can cancel your subscription at any time by:</p>
        <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
          <li>Contacting our support team at contact@advexcel.online</li>
          <li>Using the account settings in your dashboard</li>
          <li>Sending a cancellation request with your registered email</li>
        </ul>

        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#333', marginBottom: '10px', marginTop: '20px' }}>2.2 Cancellation Effects</h3>
        <p>Upon cancellation:</p>
        <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
          <li>Your access will continue until the end of your current billing period</li>
          <li>No future charges will be made to your account</li>
          <li>You will receive a cancellation confirmation email</li>
          <li>Your account data will be retained for 30 days for potential reactivation</li>
        </ul>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1a1a1a', marginBottom: '15px' }}>3. Refund Policy</h2>
        
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#333', marginBottom: '10px' }}>3.1 Refund Eligibility</h3>
        <p>We offer refunds in the following circumstances:</p>
        <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
          <li><strong>Technical Issues:</strong> If our service is unavailable for more than 48 consecutive hours</li>
          <li><strong>Billing Errors:</strong> If you were charged incorrectly due to our system error</li>
          <li><strong>Duplicate Payments:</strong> If you were charged multiple times for the same subscription</li>
          <li><strong>Unauthorized Charges:</strong> If charges were made without your authorization</li>
          <li><strong>Service Dissatisfaction:</strong> Within 7 days of first subscription (one-time only)</li>
        </ul>

        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#333', marginBottom: '10px', marginTop: '20px' }}>3.2 Non-Refundable Situations</h3>
        <p>Refunds will not be provided in the following cases:</p>
        <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
          <li>Change of mind after using the service for more than 7 days</li>
          <li>Failure to use the service during your subscription period</li>
          <li>Violation of our Terms of Service leading to account suspension</li>
          <li>Requests made after the subscription period has ended</li>
        </ul>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1a1a1a', marginBottom: '15px' }}>4. Refund Process</h2>
        
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#333', marginBottom: '10px' }}>4.1 How to Request a Refund</h3>
        <p>To request a refund, please:</p>
        <ol style={{ paddingLeft: '20px', marginTop: '10px' }}>
          <li>Email us at contact@advexcel.online with subject "Refund Request"</li>
          <li>Include your registered email address and payment transaction ID</li>
          <li>Provide a detailed reason for the refund request</li>
          <li>Attach any relevant screenshots or documentation</li>
        </ol>

        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#333', marginBottom: '10px', marginTop: '20px' }}>4.2 Refund Timeline</h3>
        <div style={{ background: '#e8f4fd', padding: '15px', borderRadius: '6px', border: '1px solid #b3d9ff' }}>
          <ul style={{ paddingLeft: '20px', margin: '0' }}>
            <li><strong>Review Period:</strong> 2-3 business days to review your request</li>
            <li><strong>Approval Notification:</strong> Email confirmation within 24 hours of approval</li>
            <li><strong>Processing Time:</strong> 5-7 business days for refund to appear in your account</li>
            <li><strong>Payment Method:</strong> Refund will be credited to the original payment method</li>
          </ul>
        </div>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1a1a1a', marginBottom: '15px' }}>5. Partial Refunds</h2>
        <p>In certain circumstances, we may offer partial refunds:</p>
        <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
          <li><strong>Service Downtime:</strong> Prorated refund based on service unavailability</li>
          <li><strong>Feature Limitations:</strong> If advertised features are temporarily unavailable</li>
          <li><strong>Performance Issues:</strong> If service performance significantly degrades</li>
        </ul>
        <p style={{ marginTop: '15px' }}>Partial refund amounts will be calculated based on the unused portion of your subscription.</p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1a1a1a', marginBottom: '15px' }}>6. Payment Gateway Refunds</h2>
        <p>Since we use Razorpay for payment processing:</p>
        <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
          <li>Refunds are processed through Razorpay's secure system</li>
          <li>You will receive email notifications from both AdvExcel and Razorpay</li>
          <li>Bank processing times may vary (typically 5-7 business days)</li>
          <li>For payment-related queries, you may also contact Razorpay support</li>
        </ul>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1a1a1a', marginBottom: '15px' }}>7. Dispute Resolution</h2>
        <p>If you're not satisfied with our refund decision:</p>
        <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
          <li>Contact our customer support team for escalation</li>
          <li>Provide additional documentation or clarification</li>
          <li>We will review your case within 5 business days</li>
          <li>Final decisions will be communicated via email</li>
        </ul>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1a1a1a', marginBottom: '15px' }}>8. Special Circumstances</h2>
        
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#333', marginBottom: '10px' }}>8.1 Service Discontinuation</h3>
        <p>If we discontinue our service:</p>
        <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
          <li>30 days advance notice will be provided</li>
          <li>Full refund for unused subscription period</li>
          <li>Data export assistance will be offered</li>
        </ul>

        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#333', marginBottom: '10px', marginTop: '20px' }}>8.2 Force Majeure</h3>
        <p>In case of events beyond our control (natural disasters, government regulations, etc.), refund policies may be adjusted with appropriate notice to users.</p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1a1a1a', marginBottom: '15px' }}>9. Contact Information</h2>
        <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', border: '1px solid #e1e5e9' }}>
          <p style={{ margin: '0 0 10px 0' }}><strong>Customer Support</strong></p>
          <p style={{ margin: '0 0 5px 0' }}>Email: contact@advexcel.online</p>
          <p style={{ margin: '0 0 5px 0' }}>Subject Line: "Cancellation" or "Refund Request"</p>
          <p style={{ margin: '0 0 5px 0' }}>Response Time: Within 24 hours</p>
          <p style={{ margin: '0' }}>Website: www.advexcel.online</p>
        </div>
      </section>

      <div style={{ borderTop: '1px solid #e1e5e9', paddingTop: '20px', marginTop: '40px', textAlign: 'center' }}>
        <p style={{ color: '#666', fontSize: '14px' }}>
          This policy is designed to be fair to both our customers and our business. We reserve the right to update this policy with reasonable notice to users.
        </p>
      </div>
    </div>
  );
}