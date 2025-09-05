import React from 'react';

export default function AboutUs() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#ffffff'
    }}>
      {/* Header */}
      <header style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        padding: '20px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <img src="/logo.png" alt="AdvExcel" style={{ height: '40px' }} />
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '600' }}>AdvExcel AI</h1>
            <p style={{ margin: 0, fontSize: '14px', opacity: 0.8 }}>About Us</p>
          </div>
        </div>
        <button
          onClick={() => window.location.href = '/'}
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '25px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          Back to App
        </button>
      </header>

      {/* Main Content */}
      <main style={{ padding: '60px 40px', maxWidth: '1000px', margin: '0 auto' }}>
        {/* About the Creator */}
        <section style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '40px',
          marginBottom: '40px',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <h2 style={{ margin: '0 0 24px 0', fontSize: '28px', fontWeight: '600' }}>
            👨‍💻 About the Creator
          </h2>
          <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '300px' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: '600' }}>
                Kynandan Katragadda
              </h3>
              <p style={{ margin: '0 0 16px 0', fontSize: '16px', lineHeight: '1.6', opacity: 0.9 }}>
                Full-stack developer and AI enthusiast passionate about creating intelligent solutions 
                that simplify complex data analysis. With expertise in cloud technologies and machine learning, 
                I built AdvExcel AI to democratize advanced data analytics for everyone.
              </p>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '14px'
                }}>
                  🚀 AWS Solutions Architect
                </div>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '14px'
                }}>
                  🤖 AI/ML Engineer
                </div>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '14px'
                }}>
                  💻 Full-Stack Developer
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* About AdvExcel AI */}
        <section style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '40px',
          marginBottom: '40px',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <h2 style={{ margin: '0 0 24px 0', fontSize: '28px', fontWeight: '600' }}>
            🚀 About AdvExcel AI
          </h2>
          <p style={{ margin: '0 0 24px 0', fontSize: '18px', lineHeight: '1.6', opacity: 0.9 }}>
            AdvExcel AI is an intelligent data analysis platform that transforms how you work with Excel and CSV files. 
            Powered by Amazon Web Services and advanced AI, it brings enterprise-level analytics to your fingertips.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginTop: '32px' }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '16px',
              padding: '24px'
            }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: '600' }}>
                🤖 AI-Powered Analysis
              </h3>
              <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5', opacity: 0.8 }}>
                Natural language processing lets you ask questions in plain English. 
                Get insights, create charts, and analyze patterns without complex formulas.
              </p>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '16px',
              padding: '24px'
            }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: '600' }}>
                ☁️ Cloud-Native
              </h3>
              <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5', opacity: 0.8 }}>
                Built on AWS infrastructure for reliability, security, and scalability. 
                Your data is processed securely and never permanently stored.
              </p>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '16px',
              padding: '24px'
            }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: '600' }}>
                📊 Advanced Features
              </h3>
              <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5', opacity: 0.8 }}>
                Pivot tables, statistical analysis, predictive insights, data quality assessment, 
                and beautiful visualizations - all in one platform.
              </p>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '16px',
              padding: '24px'
            }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: '600' }}>
                🎯 User-Friendly
              </h3>
              <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5', opacity: 0.8 }}>
                No technical expertise required. Upload your file, ask questions, 
                and get professional-grade analysis in seconds.
              </p>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '40px',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <h2 style={{ margin: '0 0 32px 0', fontSize: '28px', fontWeight: '600', textAlign: 'center' }}>
            🎯 Our Mission
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚀</div>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: '600' }}>Mission</h3>
              <p style={{ margin: 0, fontSize: '16px', lineHeight: '1.6', opacity: 0.9 }}>
                To democratize advanced data analytics by making AI-powered insights accessible 
                to everyone, regardless of technical background.
              </p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔮</div>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: '600' }}>Vision</h3>
              <p style={{ margin: 0, fontSize: '16px', lineHeight: '1.6', opacity: 0.9 }}>
                To become the go-to platform for intelligent data analysis, empowering businesses 
                and individuals to make data-driven decisions effortlessly.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.2)',
        padding: '40px',
        textAlign: 'center'
      }}>
        <p style={{ margin: '0 0 16px 0', fontSize: '16px', opacity: 0.9 }}>
          Ready to transform your data analysis?
        </p>
        <button
          onClick={() => window.location.href = '/'}
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            color: 'white',
            padding: '12px 32px',
            borderRadius: '25px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '600',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
          }}
        >
          Get Started with AdvExcel AI
        </button>
        <p style={{ margin: '24px 0 0 0', fontSize: '14px', opacity: 0.7 }}>
          © 2024 AdvExcel AI. Built with ❤️ by Kynandan Katragadda
        </p>
      </footer>
    </div>
  );
}