import React from 'react';

export default function CancellationRefund() {
  return (
    <div style={{ backgroundColor: '#fff', minHeight: '100vh' }}>
      <div style={{ padding: '20px', borderBottom: '1px solid #eee' }}>
        <a href="/" style={{ color: '#007bff', textDecoration: 'none', fontSize: '16px' }}>← Back to Home</a>
      </div>
      <div style={{ 
        padding: '40px 20px', 
        maxWidth: '800px', 
        margin: '0 auto',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        lineHeight: '1.6',
        color: '#000',
        textAlign: 'left'
      }}>
        <h1 style={{ fontSize: '28px', fontWeight: '600', color: '#000', marginBottom: '10px' }}>Cancellation & Refund Policy</h1>
        <p style={{ color: '#666', fontSize: '14px', marginBottom: '30px' }}>Last updated on January 8th, 2025</p>
        
        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#000', marginBottom: '15px' }}>1. Introduction</h2>
          <p style={{ marginBottom: '15px' }}>
            At AdvExcel Online, we strive to provide excellent service and customer satisfaction. This policy outlines our cancellation and refund 
            procedures for our Excel AI Assistant subscription service.
          </p>
          <p>
            Our service operates on a monthly subscription basis at ₹199 per month, with payments processed securely through Razorpay. 
            Subscriptions do not auto-renew and provide 30 days of access from the payment date.
          </p>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#000', marginBottom: '15px' }}>2. Cancellation Policy</h2>
          <p style={{ marginBottom: '15px' }}>You can cancel your subscription at any time by:</p>
          <ul style={{ paddingLeft: '20px', marginBottom: '15px' }}>
            <li>Contacting our support team at <a href="mailto:contact@advexcel.online" style={{ color: '#007bff', textDecoration: 'none' }}>contact@advexcel.online</a></li>
            <li>Using the account settings in your dashboard</li>
            <li>Sending a cancellation request with your registered email</li>
          </ul>
          <p style={{ marginBottom: '15px' }}>Upon cancellation:</p>
          <ul style={{ paddingLeft: '20px' }}>
            <li>Your access will continue until the end of your current billing period</li>
            <li>No future charges will be made to your account</li>
            <li>You will receive a cancellation confirmation email</li>
            <li>Your account data will be retained for 30 days for potential reactivation</li>
          </ul>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#000', marginBottom: '15px' }}>3. Refund Policy</h2>
          <p style={{ marginBottom: '15px' }}>We offer refunds in the following circumstances:</p>
          <ul style={{ paddingLeft: '20px', marginBottom: '15px' }}>
            <li>Technical Issues: If our service is unavailable for more than 48 consecutive hours</li>
            <li>Billing Errors: If you were charged incorrectly due to our system error</li>
            <li>Duplicate Payments: If you were charged multiple times for the same subscription</li>
            <li>Unauthorized Charges: If charges were made without your authorization</li>
          </ul>
          <p style={{ marginBottom: '15px' }}>Refunds will not be provided in the following cases:</p>
          <ul style={{ paddingLeft: '20px' }}>
            <li>Change of mind or service dissatisfaction after payment</li>
            <li>Failure to use the service during your subscription period</li>
            <li>Violation of our Terms of Service leading to account suspension</li>
            <li>Requests made after the subscription period has ended</li>
          </ul>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#000', marginBottom: '15px' }}>4. Refund Process</h2>
          <p style={{ marginBottom: '15px' }}>To request a refund, please:</p>
          <ol style={{ paddingLeft: '20px', marginBottom: '15px' }}>
            <li>Email us at <a href="mailto:contact@advexcel.online?subject=Refund Request" style={{ color: '#007bff', textDecoration: 'none' }}>contact@advexcel.online</a> with subject "Refund Request"</li>
            <li>Include your registered email address and payment transaction ID</li>
            <li>Provide a detailed reason for the refund request</li>
            <li>Attach any relevant screenshots or documentation</li>
          </ol>
          <p style={{ marginBottom: '15px' }}>Refund Timeline:</p>
          <ul style={{ paddingLeft: '20px' }}>
            <li>Review Period: 2-3 business days to review your request</li>
            <li>Approval Notification: Email confirmation within 24 hours of approval</li>
            <li>Processing Time: 5-7 business days for refund to appear in your account</li>
            <li>Payment Method: Refund will be credited to the original payment method</li>
          </ul>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#000', marginBottom: '15px' }}>5. Partial Refunds</h2>
          <p style={{ marginBottom: '15px' }}>In certain circumstances, we may offer partial refunds:</p>
          <ul style={{ paddingLeft: '20px', marginBottom: '15px' }}>
            <li>Service Downtime: Prorated refund based on service unavailability</li>
            <li>Feature Limitations: If advertised features are temporarily unavailable</li>
            <li>Performance Issues: If service performance significantly degrades</li>
          </ul>
          <p>Partial refund amounts will be calculated based on the unused portion of your subscription.</p>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#000', marginBottom: '15px' }}>6. Payment Gateway Refunds</h2>
          <p style={{ marginBottom: '15px' }}>Since we use Razorpay for payment processing:</p>
          <ul style={{ paddingLeft: '20px' }}>
            <li>Refunds are processed through Razorpay's secure system</li>
            <li>You will receive email notifications from both AdvExcel and Razorpay</li>
            <li>Bank processing times may vary (typically 5-7 business days)</li>
            <li>For payment-related queries, you may also contact Razorpay support</li>
          </ul>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#000', marginBottom: '15px' }}>7. Dispute Resolution</h2>
          <p style={{ marginBottom: '15px' }}>If you're not satisfied with our refund decision:</p>
          <ul style={{ paddingLeft: '20px' }}>
            <li>Contact our customer support team for escalation</li>
            <li>Provide additional documentation or clarification</li>
            <li>We will review your case within 5 business days</li>
            <li>Final decisions will be communicated via email</li>
          </ul>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#000', marginBottom: '15px' }}>8. Contact Information</h2>
          <p style={{ marginBottom: '10px' }}>Customer Support</p>
          <p style={{ marginBottom: '5px' }}>Email: <a href="mailto:contact@advexcel.online" style={{ color: '#007bff', textDecoration: 'none' }}>contact@advexcel.online</a></p>
          <p style={{ marginBottom: '5px' }}>Subject Line: "Cancellation" or "Refund Request"</p>
          <p style={{ marginBottom: '5px' }}>Response Time: Within 24 hours</p>
          <p>Website: www.advexcel.online</p>
        </section>
      </div>
    </div>
  );
}