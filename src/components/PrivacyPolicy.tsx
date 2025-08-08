import React from 'react';

export default function PrivacyPolicy() {
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
        <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#1a1a1a', marginBottom: '10px' }}>Privacy Policy</h1>
        <p style={{ color: '#666', fontSize: '14px' }}>Last updated: January 8, 2025</p>
      </div>
      
      <div style={{ marginBottom: '30px' }}>
        <p style={{ fontSize: '16px', color: '#555' }}>
          At AdvExcel Online, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Excel AI Assistant service.
        </p>
      </div>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1a1a1a', marginBottom: '15px' }}>1. Information We Collect</h2>
        
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#333', marginBottom: '10px' }}>Personal Information</h3>
        <p>When you register for our service, we collect:</p>
        <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
          <li>Name and email address</li>
          <li>Account credentials (encrypted passwords)</li>
          <li>Payment information (processed securely through Razorpay)</li>
        </ul>

        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#333', marginBottom: '10px', marginTop: '20px' }}>Usage Information</h3>
        <p>We automatically collect certain information when you use our service:</p>
        <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
          <li>IP address and device information</li>
          <li>Browser type and version</li>
          <li>Usage patterns and feature interactions</li>
          <li>File upload metadata (not file contents)</li>
        </ul>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1a1a1a', marginBottom: '15px' }}>2. How We Use Your Information</h2>
        <p>We use the collected information for the following purposes:</p>
        <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
          <li><strong>Service Provision:</strong> To provide and maintain our Excel AI Assistant service</li>
          <li><strong>Account Management:</strong> To create and manage your user account</li>
          <li><strong>Payment Processing:</strong> To process subscription payments securely</li>
          <li><strong>Communication:</strong> To send service-related notifications and updates</li>
          <li><strong>Improvement:</strong> To analyze usage patterns and improve our service</li>
          <li><strong>Security:</strong> To detect and prevent fraud and unauthorized access</li>
        </ul>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1a1a1a', marginBottom: '15px' }}>3. Data Processing and Storage</h2>
        
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#333', marginBottom: '10px' }}>File Processing</h3>
        <p>When you upload Excel files:</p>
        <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
          <li>Files are processed in secure, encrypted environments</li>
          <li>Files are automatically deleted after processing is complete</li>
          <li>We do not permanently store your file contents</li>
          <li>Processing occurs on secure AWS infrastructure</li>
        </ul>

        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#333', marginBottom: '10px', marginTop: '20px' }}>Data Security</h3>
        <p>We implement industry-standard security measures:</p>
        <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
          <li>SSL/TLS encryption for all data transmission</li>
          <li>Encrypted storage of personal information</li>
          <li>Regular security audits and updates</li>
          <li>Access controls and authentication systems</li>
        </ul>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1a1a1a', marginBottom: '15px' }}>4. Information Sharing and Disclosure</h2>
        <p>We do not sell, trade, or rent your personal information to third parties. We may share information only in the following circumstances:</p>
        <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
          <li><strong>Service Providers:</strong> With trusted third-party services (AWS, Razorpay) that help us operate our service</li>
          <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
          <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets</li>
          <li><strong>Consent:</strong> With your explicit consent for specific purposes</li>
        </ul>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1a1a1a', marginBottom: '15px' }}>5. Third-Party Services</h2>
        
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#333', marginBottom: '10px' }}>Payment Processing</h3>
        <p>We use Razorpay for secure payment processing. Razorpay has its own privacy policy and security measures for handling payment information.</p>

        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#333', marginBottom: '10px', marginTop: '20px' }}>Cloud Infrastructure</h3>
        <p>Our service is hosted on Amazon Web Services (AWS), which provides enterprise-grade security and compliance standards.</p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1a1a1a', marginBottom: '15px' }}>6. Your Rights and Choices</h2>
        <p>You have the following rights regarding your personal information:</p>
        <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
          <li><strong>Access:</strong> Request access to your personal information</li>
          <li><strong>Correction:</strong> Request correction of inaccurate information</li>
          <li><strong>Deletion:</strong> Request deletion of your personal information</li>
          <li><strong>Portability:</strong> Request a copy of your data in a portable format</li>
          <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
        </ul>
        <p style={{ marginTop: '15px' }}>To exercise these rights, contact us at contact@advexcel.online</p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1a1a1a', marginBottom: '15px' }}>7. Data Retention</h2>
        <p>We retain your information for the following periods:</p>
        <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
          <li><strong>Account Information:</strong> Until you delete your account</li>
          <li><strong>Payment Records:</strong> As required by law (typically 7 years)</li>
          <li><strong>Usage Logs:</strong> Up to 12 months for security and analytics</li>
          <li><strong>Uploaded Files:</strong> Immediately deleted after processing</li>
        </ul>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1a1a1a', marginBottom: '15px' }}>8. Cookies and Tracking</h2>
        <p>We use cookies and similar technologies to:</p>
        <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
          <li>Maintain your login session</li>
          <li>Remember your preferences</li>
          <li>Analyze service usage and performance</li>
          <li>Provide security features</li>
        </ul>
        <p style={{ marginTop: '15px' }}>You can control cookie settings through your browser preferences.</p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1a1a1a', marginBottom: '15px' }}>9. International Data Transfers</h2>
        <p>Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your information in accordance with this Privacy Policy.</p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1a1a1a', marginBottom: '15px' }}>10. Children's Privacy</h2>
        <p>Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware of such collection, we will delete the information immediately.</p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1a1a1a', marginBottom: '15px' }}>11. Changes to This Privacy Policy</h2>
        <p>We may update this Privacy Policy from time to time. We will notify you of any material changes by:</p>
        <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
          <li>Posting the updated policy on our website</li>
          <li>Sending an email notification to registered users</li>
          <li>Displaying a prominent notice in our service</li>
        </ul>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1a1a1a', marginBottom: '15px' }}>12. Contact Information</h2>
        <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', border: '1px solid #e1e5e9' }}>
          <p style={{ margin: '0 0 10px 0' }}><strong>Data Protection Officer</strong></p>
          <p style={{ margin: '0 0 5px 0' }}>AdvExcel Online</p>
          <p style={{ margin: '0 0 5px 0' }}>Email: privacy@advexcel.online</p>
          <p style={{ margin: '0 0 5px 0' }}>General Contact: contact@advexcel.online</p>
          <p style={{ margin: '0' }}>Website: www.advexcel.online</p>
        </div>
      </section>

      <div style={{ borderTop: '1px solid #e1e5e9', paddingTop: '20px', marginTop: '40px', textAlign: 'center' }}>
        <p style={{ color: '#666', fontSize: '14px' }}>
          By using our Service, you acknowledge that you have read and understood this Privacy Policy and agree to the collection and use of information in accordance with this policy.
        </p>
      </div>
    </div>
  );
}