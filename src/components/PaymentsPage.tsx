import React, { useState, useEffect } from 'react';

interface PaymentsPageProps {
  user: { name: string; email: string };
  onPaymentSuccess: () => void;
  onBackToLogin: () => void;
}

export default function PaymentsPage({ user, onPaymentSuccess, onBackToLogin }: PaymentsPageProps) {
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'advanced' | 'full'>('full');
  const [isProcessing, setIsProcessing] = useState(false);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handlePayment = async () => {
    setIsProcessing(true);
    
    try {
      const amount = selectedPlan === 'full' ? 19900 : selectedPlan === 'advanced' ? 17900 : 4900; // Convert to paise
      
      // Create order first
      const orderResponse = await fetch(process.env.REACT_APP_PAYMENT_API_URL!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create-order',
          amount: amount,
          userEmail: user.email,
          plan: selectedPlan
        })
      });
      
      const orderResult = await orderResponse.json();
      
      if (!orderResult.success) {
        throw new Error('Failed to create order');
      }
      
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: amount,
        currency: 'INR',
        name: 'AdvExcel',
        description: `${selectedPlan === 'full' ? 'Full Package' : selectedPlan === 'advanced' ? 'Advanced' : 'Basic'} Plan - ₹${selectedPlan === 'full' ? '199' : selectedPlan === 'advanced' ? '179' : '49'}`,
        order_id: orderResult.orderId,
        handler: async function (response: any) {
          console.log('Payment response:', response);
          
          // Verify payment with backend
          try {
            const verifyResponse = await fetch(process.env.REACT_APP_PAYMENT_API_URL!, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                action: 'verify-payment',
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                userEmail: user.email,
                plan: selectedPlan
              })
            });
            
            const verifyResult = await verifyResponse.json();
            
            if (verifyResult.success) {
              alert('Payment verified successfully! Welcome to AdvExcel.');
              onPaymentSuccess();
            } else {
              alert('Payment verification failed. Please contact support.');
            }
          } catch (verifyError) {
            console.error('Verification error:', verifyError);
            alert('Payment verification failed. Please contact support.');
          }
          
          setIsProcessing(false);
        },
        prefill: {
          email: user.email,
          contact: ''
        },
        theme: {
          color: '#4ecdc4'
        },
        modal: {
          ondismiss: function() {
            console.log('Payment cancelled by user');
            setIsProcessing(false);
          }
        }
      };
      
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Payment error:', error);
      alert('Failed to initialize payment. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#fff', minHeight: '100vh' }}>
      <div style={{ padding: '20px', borderBottom: '1px solid #eee' }}>
        <a href="/" style={{ color: '#007bff', textDecoration: 'none', fontSize: '16px' }}>← Back to Home</a>
        <span style={{ marginLeft: '20px', color: '#666', fontSize: '14px' }}>Welcome, {user.name}</span>
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
        <h1 style={{ fontSize: '28px', fontWeight: '600', color: '#000', marginBottom: '10px' }}>Choose Your Plan</h1>
        <p style={{ color: '#666', fontSize: '14px', marginBottom: '30px' }}>Select the plan that best fits your needs</p>
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



        {/* Pricing Plans */}
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'space-between' }}>
          {/* Basic Plan */}
          <div style={{
            background: selectedPlan === 'basic' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            padding: '28px',
            border: selectedPlan === 'basic' ? '2px solid #4ecdc4' : '1px solid rgba(255, 255, 255, 0.2)',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onClick={() => setSelectedPlan('basic')}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: '600' }}>Basic</h3>
              <div style={{ fontSize: '40px', fontWeight: '700', color: '#4ecdc4' }}>₹49</div>
              <p style={{ margin: '4px 0 0 0', fontSize: '14px', opacity: 0.8 }}>per month</p>
            </div>
            
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px 0' }}>
              <li style={{ padding: '6px 0', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#4ecdc4' }}>✓</span> Basic Excel processing
              </li>
              <li style={{ padding: '6px 0', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#4ecdc4' }}>✓</span> Data sorting & filtering
              </li>
              <li style={{ padding: '6px 0', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#4ecdc4' }}>✓</span> 25 prompts per day
              </li>
              <li style={{ padding: '6px 0', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#4ecdc4' }}>✓</span> Email support
              </li>
            </ul>
          </div>

          {/* Advanced Plan */}
          <div style={{
            background: selectedPlan === 'advanced' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            padding: '28px',
            border: selectedPlan === 'advanced' ? '2px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.2)',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onClick={() => setSelectedPlan('advanced')}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: '600' }}>Advanced</h3>
              <div style={{ fontSize: '40px', fontWeight: '700', color: '#f59e0b' }}>₹179</div>
              <p style={{ margin: '4px 0 0 0', fontSize: '14px', opacity: 0.8 }}>per month</p>
            </div>
            
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px 0' }}>
              <li style={{ padding: '6px 0', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#f59e0b' }}>✓</span> Charts & visualizations
              </li>
              <li style={{ padding: '6px 0', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#f59e0b' }}>✓</span> Advanced analytics
              </li>
              <li style={{ padding: '6px 0', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#f59e0b' }}>✓</span> Pivot tables
              </li>
              <li style={{ padding: '6px 0', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#f59e0b' }}>✓</span> Statistical analysis
              </li>
            </ul>
          </div>

          {/* Full Package */}
          <div style={{
            background: selectedPlan === 'full' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            padding: '28px',
            border: selectedPlan === 'full' ? '2px solid #10b981' : '1px solid rgba(255, 255, 255, 0.2)',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            position: 'relative'
          }}
          onClick={() => setSelectedPlan('full')}>
            <div style={{
              position: 'absolute',
              top: '-10px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#10b981',
              color: 'white',
              padding: '4px 12px',
              borderRadius: '12px',
              fontSize: '11px',
              fontWeight: '600'
            }}>
              SAVE ₹29
            </div>
            
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: '600' }}>Full Package</h3>
              <div style={{ fontSize: '40px', fontWeight: '700', color: '#10b981' }}>₹199</div>
              <p style={{ margin: '4px 0 0 0', fontSize: '14px', opacity: 0.8 }}>per month</p>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#10b981' }}>Basic + Advanced</p>
            </div>
            
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px 0' }}>
              <li style={{ padding: '6px 0', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#10b981' }}>✓</span> Everything in Basic
              </li>
              <li style={{ padding: '6px 0', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#10b981' }}>✓</span> Everything in Advanced
              </li>
              <li style={{ padding: '6px 0', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#10b981' }}>✓</span> Unlimited prompts
              </li>
              <li style={{ padding: '6px 0', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#10b981' }}>✓</span> Priority support
              </li>
            </ul>
          </div>
        </div>
        
        {/* Savings Explanation */}
        <div style={{
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '12px',
          padding: '20px',
          marginTop: '24px',
          textAlign: 'center'
        }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600', color: '#10b981' }}>
            💡 Smart Savings with Full Package
          </h4>
          <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>
            Basic (₹49) + Advanced (₹179) = ₹228/month<br/>
            <strong>Full Package = ₹199/month (Save ₹29!)</strong>
          </p>
        </div>

        {/* Payment Button */}
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <button
            onClick={handlePayment}
            disabled={isProcessing}
            style={{
              background: isProcessing ? 'rgba(255, 255, 255, 0.3)' : '#4ecdc4',
              color: isProcessing ? 'rgba(255, 255, 255, 0.7)' : '#333',
              border: 'none',
              padding: '16px 48px',
              borderRadius: '25px',
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              fontSize: '18px',
              fontWeight: '600',
              transition: 'all 0.3s ease'
            }}
          >
            {isProcessing ? 'Processing...' : `Pay ₹${selectedPlan === 'basic' ? '49' : selectedPlan === 'advanced' ? '179' : '199'} - ${selectedPlan === 'basic' ? 'Basic' : selectedPlan === 'advanced' ? 'Advanced' : 'Full Package'}`}
          </button>
          
          <p style={{ margin: '16px 0 0 0', fontSize: '14px', opacity: 0.7 }}>
            Secure payment powered by Razorpay
          </p>
        </div>


      </div>

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