import React, { useState } from 'react';

interface PaymentPageProps {
  userEmail: string;
  onPaymentSuccess: () => void;
  onBackToLogin: () => void;
}

export default function PaymentPage({ userEmail, onPaymentSuccess, onBackToLogin }: PaymentPageProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Load Razorpay script
  React.useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      console.log('Razorpay script loaded successfully');
    };
    script.onerror = () => {
      console.error('Failed to load Razorpay script');
    };
    document.body.appendChild(script);
    
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handlePayment = async () => {
    setIsProcessing(true);
    
    if (!(window as any).Razorpay) {
      alert('Payment system not loaded. Please refresh and try again.');
      setIsProcessing(false);
      return;
    }
    
    try {
      const options = {
        key: 'rzp_test_GwLaqT264JyMlU',
        amount: 24900, // ₹249 in paise
        currency: 'INR',
        name: 'Excel AI Assistant',
        description: 'Monthly Subscription - ₹249/month',
        order_id: 'order_test_' + Date.now(), // Dummy order ID for testing
        handler: function (response: any) {
          console.log('Payment successful:', response);
          alert('Payment successful! Welcome to Excel AI Assistant.');
          setIsProcessing(false);
          onPaymentSuccess();
        },
        prefill: {
          email: userEmail,
          contact: ''
        },
        theme: {
          color: '#667eea'
        },
        modal: {
          ondismiss: function() {
            console.log('Payment cancelled by user');
            setIsProcessing(false);
          },
          escape: true,
          backdropclose: false
        },
        retry: {
          enabled: true,
          max_count: 3
        }
      };
      
      const rzp = new (window as any).Razorpay(options);
      
      rzp.on('payment.failed', function (response: any) {
        console.error('Payment failed:', response.error);
        alert(`Payment failed: ${response.error.description}`);
        setIsProcessing(false);
      });
      
      rzp.open();
    } catch (error) {
      console.error('Payment initialization error:', error);
      alert('Failed to initialize payment. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>💳</div>
        <h1 style={{ color: '#333', fontSize: '28px', marginBottom: '10px' }}>Complete Payment</h1>
        <p style={{ color: '#666', fontSize: '16px', marginBottom: '30px' }}>
          Welcome {userEmail}!
        </p>

        <div style={{
          border: '2px solid #667eea',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '30px',
          background: '#f8f9ff'
        }}>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#667eea', marginBottom: '10px' }}>
            ₹249<span style={{ fontSize: '16px', fontWeight: 'normal' }}>/month</span>
          </div>
          <p style={{ color: '#666', fontSize: '14px' }}>Excel AI Assistant Subscription</p>
        </div>

        <button
          onClick={handlePayment}
          disabled={isProcessing}
          style={{
            width: '100%',
            padding: '16px',
            background: isProcessing ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: isProcessing ? 'not-allowed' : 'pointer',
            marginBottom: '20px'
          }}
        >
          {isProcessing ? '🔄 Processing...' : '🔒 Pay with Razorpay'}
        </button>

        <button
          onClick={onBackToLogin}
          style={{
            background: 'none',
            border: 'none',
            color: '#666',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          ← Back to Login
        </button>
      </div>
    </div>
  );
}