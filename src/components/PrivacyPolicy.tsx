import React from 'react';

export default function PrivacyPolicy() {
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
        <h1 style={{ fontSize: '28px', fontWeight: '600', color: '#000', marginBottom: '10px' }}>Privacy Policy</h1>
        <p style={{ color: '#666', fontSize: '14px', marginBottom: '30px' }}>Last updated on January 8th, 2025</p>
        
        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#000', marginBottom: '15px' }}>1. Introduction to Privacy Policy</h2>
          <p style={{ marginBottom: '15px' }}>
            This Privacy Policy ("Privacy Policy") applies to your use of the AdvExcel Online website located at advexcel.online, 
            the services defined in AdvExcel's Terms of Use, and AdvExcel mobile applications (collectively, the "AdvExcel Platform" or "Website"). 
            However, it does not apply to any third-party websites linked to the Website or to any relationships you may have with businesses listed on AdvExcel.
          </p>
          <p style={{ marginBottom: '15px' }}>
            The terms "we," "our," and "us" refer to AdvExcel Online, and the terms "you," "your," and "User" refer to you as a user of AdvExcel. 
            The term "Personal Information" means information that you provide to us that personally identifies you, such as your name, phone number, 
            email address, and any other data linked to such information.
          </p>
          <p>
            Our practices and procedures regarding the collection and use of Personal Information are outlined below to ensure the safe use of the Website. 
            We have implemented reasonable security practices and procedures appropriate to the nature of the information and our business. 
            While we strive to provide security that exceeds industry standards, due to the inherent vulnerabilities of the internet, 
            we cannot guarantee complete security of all information transmitted to us by you.
          </p>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#000', marginBottom: '15px' }}>2. Information We Collect</h2>
          <p style={{ marginBottom: '15px' }}>
            We collect information you provide directly to us, such as when you create an account, make a payment, or contact us for support. 
            This may include your name, email address, phone number, and payment information.
          </p>
          <p>
            We also automatically collect certain information when you use our services, including your IP address, browser type, 
            operating system, and usage patterns.
          </p>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#000', marginBottom: '15px' }}>3. How We Use Your Information</h2>
          <p style={{ marginBottom: '15px' }}>We use the information we collect to:</p>
          <ul style={{ paddingLeft: '20px', marginBottom: '15px' }}>
            <li>Provide, maintain, and improve our services</li>
            <li>Process transactions and send related information</li>
            <li>Send technical notices, updates, and support messages</li>
            <li>Respond to your comments and questions</li>
            <li>Monitor and analyze trends and usage</li>
          </ul>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#000', marginBottom: '15px' }}>4. Information Sharing</h2>
          <p style={{ marginBottom: '15px' }}>
            We do not sell, trade, or otherwise transfer your Personal Information to third parties without your consent, 
            except as described in this Privacy Policy.
          </p>
          <p>
            We may share your information with service providers who assist us in operating our website and conducting our business, 
            provided they agree to keep this information confidential.
          </p>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#000', marginBottom: '15px' }}>5. Data Security</h2>
          <p>
            We implement appropriate security measures to protect your Personal Information against unauthorized access, alteration, 
            disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
          </p>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#000', marginBottom: '15px' }}>6. Your Rights</h2>
          <p style={{ marginBottom: '15px' }}>You have the right to:</p>
          <ul style={{ paddingLeft: '20px' }}>
            <li>Access your Personal Information</li>
            <li>Correct inaccurate information</li>
            <li>Request deletion of your information</li>
            <li>Object to processing of your information</li>
          </ul>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#000', marginBottom: '15px' }}>7. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page 
            and updating the "Last updated" date.
          </p>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#000', marginBottom: '15px' }}>8. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at <a href="mailto:contact@advexcel.online?subject=Privacy Policy Question" style={{ color: '#007bff', textDecoration: 'none' }}>contact@advexcel.online</a>
          </p>
        </section>
      </div>
    </div>
  );
}