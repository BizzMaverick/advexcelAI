import React, { useState } from 'react';
import PaymentService from '../services/paymentService';

export default function PaymentsPage() {
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'full'>('full');
  const [isProcessing, setIsProcessing] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  const handlePayment = async () => {
    if (!userEmail.trim()) {
      alert('Please enter your email address');
      return;
    }

    setIsProcessing(true);
    try {
      const amount = selectedPlan === 'basic' ? 49 : 199;
      const success = await PaymentService.initiatePayment(userEmail, amount, selectedPlan);
      
      if (success) {
        alert('Payment successful! You can now access all features.');
        window.location.href = '/';
      } else {
        alert('Payment failed. Please try again.');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

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
            <p style={{ margin: 0, fontSize: '14px', opacity: 0.8 }}>Choose Your Plan</p>
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
        {/* Festival Offer Banner */}
        <div style={{
          background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
          borderRadius: '16px',
          padding: '20px',
          textAlign: 'center',
          marginBottom: '40px',
          border: '2px solid rgba(255, 255, 255, 0.3)'
        }}>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: '600' }}>
            🎉 Festival Season Offer!
          </h2>
          <p style={{ margin: 0, fontSize: '16px', opacity: 0.9 }}>
            Special pricing valid until January 16, 2026
          </p>
        </div>

        {/* Email Input */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '32px',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '16px', fontWeight: '500' }}>
            Email Address
          </label>
          <input
            type="email"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            placeholder="Enter your email address"
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              background: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              fontSize: '16px',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Pricing Plans */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
          {/* Basic Plan */}
          <div style={{
            background: selectedPlan === 'basic' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            padding: '32px',
            border: selectedPlan === 'basic' ? '2px solid #4ecdc4' : '1px solid rgba(255, 255, 255, 0.2)',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onClick={() => setSelectedPlan('basic')}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: '600' }}>Basic Plan</h3>
              <div style={{ fontSize: '48px', fontWeight: '700', color: '#4ecdc4' }}>₹49</div>
              <p style={{ margin: '4px 0 0 0', fontSize: '14px', opacity: 0.8 }}>per month</p>
            </div>
            
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px 0' }}>
              <li style={{ padding: '8px 0', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#4ecdc4' }}>✓</span> 3-day free trial
              </li>
              <li style={{ padding: '8px 0', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#4ecdc4' }}>✓</span> 25 prompts per day
              </li>
              <li style={{ padding: '8px 0', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#4ecdc4' }}>✓</span> Basic Excel functions
              </li>
              <li style={{ padding: '8px 0', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#4ecdc4' }}>✓</span> Data sorting & filtering
              </li>
              <li style={{ padding: '8px 0', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#4ecdc4' }}>✓</span> Email support
              </li>
            </ul>
          </div>

          {/* Full Plan */}
          <div style={{
            background: selectedPlan === 'full' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            padding: '32px',
            border: selectedPlan === 'full' ? '2px solid #4ecdc4' : '1px solid rgba(255, 255, 255, 0.2)',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            position: 'relative'
          }}
          onClick={() => setSelectedPlan('full')}>
            <div style={{
              position: 'absolute',
              top: '-12px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#4ecdc4',
              color: '#333',
              padding: '4px 16px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              RECOMMENDED
            </div>
            
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: '600' }}>Full Plan</h3>
              <div style={{ fontSize: '48px', fontWeight: '700', color: '#4ecdc4' }}>₹199</div>
              <p style={{ margin: '4px 0 0 0', fontSize: '14px', opacity: 0.8 }}>per month</p>
              <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#4ecdc4' }}>Save ₹29!</p>
            </div>
            
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px 0' }}>
              <li style={{ padding: '8px 0', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#4ecdc4' }}>✓</span> Everything in Basic
              </li>
              <li style={{ padding: '8px 0', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#4ecdc4' }}>✓</span> Unlimited prompts
              </li>
              <li style={{ padding: '8px 0', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#4ecdc4' }}>✓</span> Advanced AI analytics
              </li>
              <li style={{ padding: '8px 0', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#4ecdc4' }}>✓</span> Charts & visualizations
              </li>
              <li style={{ padding: '8px 0', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#4ecdc4' }}>✓</span> Pivot tables
              </li>
              <li style={{ padding: '8px 0', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#4ecdc4' }}>✓</span> Statistical analysis
              </li>
              <li style={{ padding: '8px 0', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#4ecdc4' }}>✓</span> Priority support
              </li>
            </ul>
          </div>
        </div>

        {/* Payment Button */}
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <button
            onClick={handlePayment}
            disabled={isProcessing || !userEmail.trim()}
            style={{
              background: isProcessing || !userEmail.trim() ? 'rgba(255, 255, 255, 0.3)' : '#4ecdc4',
              color: isProcessing || !userEmail.trim() ? 'rgba(255, 255, 255, 0.7)' : '#333',
              border: 'none',
              padding: '16px 48px',
              borderRadius: '25px',
              cursor: isProcessing || !userEmail.trim() ? 'not-allowed' : 'pointer',
              fontSize: '18px',
              fontWeight: '600',
              transition: 'all 0.3s ease'
            }}
          >
            {isProcessing ? 'Processing...' : `Pay ₹${selectedPlan === 'basic' ? '49' : '199'} - ${selectedPlan === 'basic' ? 'Basic' : 'Full'} Plan`}
          </button>
          
          <p style={{ margin: '16px 0 0 0', fontSize: '14px', opacity: 0.7 }}>
            Secure payment powered by Razorpay
          </p>
        </div>

        {/* Features Comparison */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          padding: '32px',
          marginTop: '60px',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <h3 style={{ margin: '0 0 24px 0', fontSize: '20px', fontWeight: '600', textAlign: 'center' }}>
            Why Choose AdvExcel AI?
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>🤖</div>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600' }}>AI-Powered</h4>
              <p style={{ margin: 0, fontSize: '14px', opacity: 0.8 }}>
                Natural language processing for easy data analysis
              </p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>☁️</div>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600' }}>Cloud-Based</h4>
              <p style={{ margin: 0, fontSize: '14px', opacity: 0.8 }}>
                Secure AWS infrastructure with enterprise-grade security
              </p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>⚡</div>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600' }}>Lightning Fast</h4>
              <p style={{ margin: 0, fontSize: '14px', opacity: 0.8 }}>
                Get insights in seconds, not hours
              </p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>🎯</div>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600' }}>User-Friendly</h4>
              <p style={{ margin: 0, fontSize: '14px', opacity: 0.8 }}>
                No technical expertise required
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.2)',
        padding: '40px',
        textAlign: 'center'
      }}>
        <p style={{ margin: 0, fontSize: '14px', opacity: 0.7 }}>
          © 2024 AdvExcel AI. All rights reserved. | Powered by AWS & Razorpay
        </p>
      </footer>
    </div>
  );
}