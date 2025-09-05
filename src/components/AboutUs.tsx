import React from 'react';

export default function AboutUs() {
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
        <h1 style={{ fontSize: '28px', fontWeight: '600', color: '#000', marginBottom: '10px' }}>About Us</h1>
        <p style={{ color: '#666', fontSize: '14px', marginBottom: '30px' }}>Learn about AdvExcel AI and our mission</p>
        
        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#000', marginBottom: '15px' }}>1. About the Creator</h2>
          <p style={{ marginBottom: '15px' }}>
            <strong>Yadunandan Katragadda</strong> is a full-stack developer and AI enthusiast passionate about creating intelligent solutions 
            that simplify complex data analysis. With expertise in cloud technologies and machine learning, 
            he built AdvExcel AI to democratize advanced data analytics for everyone.
          </p>
          <p style={{ marginBottom: '15px' }}>
            As an AWS Solutions Architect and AI/ML Engineer, Yadunandan combines deep technical knowledge with a user-centric approach 
            to deliver powerful yet accessible tools for data professionals and business users alike.
          </p>
          <p>
            His vision is to make advanced data analytics as simple as having a conversation, 
            enabling anyone to unlock insights from their data without requiring technical expertise.
          </p>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#000', marginBottom: '15px' }}>2. About AdvExcel AI</h2>
          <p style={{ marginBottom: '15px' }}>
            AdvExcel AI is an intelligent data analysis platform that transforms how you work with Excel and CSV files. 
            Powered by Amazon Web Services and advanced AI, it brings enterprise-level analytics to your fingertips.
          </p>
          <p style={{ marginBottom: '15px' }}>
            Our platform uses natural language processing to let you ask questions in plain English, 
            get insights, create charts, and analyze patterns without complex formulas or technical expertise.
          </p>
          <p>
            Built on AWS infrastructure for reliability, security, and scalability, AdvExcel AI processes your data securely 
            and never permanently stores your sensitive information.
          </p>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#000', marginBottom: '15px' }}>3. Key Features</h2>
          <p style={{ marginBottom: '15px' }}>AdvExcel AI offers a comprehensive suite of data analysis tools:</p>
          <ul style={{ paddingLeft: '20px', marginBottom: '15px' }}>
            <li>AI-powered natural language processing for plain English queries</li>
            <li>Advanced pivot tables and statistical analysis</li>
            <li>Beautiful charts and data visualizations</li>
            <li>Predictive insights and trend analysis</li>
            <li>Data quality assessment and cleaning suggestions</li>
            <li>Multi-sheet Excel workbook support</li>
            <li>Secure cloud processing with AWS infrastructure</li>
          </ul>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#000', marginBottom: '15px' }}>4. Our Mission</h2>
          <p style={{ marginBottom: '15px' }}>
            To democratize advanced data analytics by making AI-powered insights accessible 
            to everyone, regardless of technical background.
          </p>
          <p>
            We believe that powerful data analysis shouldn't require years of training or expensive software. 
            AdvExcel AI empowers businesses and individuals to make data-driven decisions effortlessly.
          </p>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#000', marginBottom: '15px' }}>5. Technology Stack</h2>
          <p style={{ marginBottom: '15px' }}>AdvExcel AI is built using cutting-edge technologies:</p>
          <ul style={{ paddingLeft: '20px' }}>
            <li>Amazon Web Services (AWS) for cloud infrastructure</li>
            <li>AWS Bedrock for AI and machine learning capabilities</li>
            <li>React and TypeScript for the user interface</li>
            <li>AWS Cognito for secure user authentication</li>
            <li>Razorpay for secure payment processing</li>
          </ul>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#000', marginBottom: '15px' }}>6. Contact Us</h2>
          <p>
            Have questions or feedback? We'd love to hear from you! Contact us at <a href="mailto:contact@advexcel.online?subject=About AdvExcel AI" style={{ color: '#007bff', textDecoration: 'none' }}>contact@advexcel.online</a>
          </p>
        </section>
      </div>
    </div>
  );
}