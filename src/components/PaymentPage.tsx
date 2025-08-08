import React, { useState, useEffect } from 'react';

interface PaymentPageProps {
  userEmail: string;
  onPaymentSuccess: () => void;
  onBackToLogin: () => void;
}

export default function PaymentPage({ userEmail, onPaymentSuccess, onBackToLogin }: PaymentPageProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  
  // Check if user already has valid payment
  useEffect(() => {
    checkPaymentStatus();
  }, []);
  
  const checkPaymentStatus = async () => {
    try {
      const response = await fetch(process.env.REACT_APP_PAYMENT_API_URL!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'check-status',
          userEmail: userEmail
        })
      });
      
      const result = await response.json();
      
      if (result.hasValidPayment) {
        onPaymentSuccess();
        return;
      }
    } catch (error) {
      console.error('Status check error:', error);
    }
    
    setIsCheckingStatus(false);
  };
  
  React.useEffect(() => {
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
      // Create order first
      const orderResponse = await fetch(process.env.REACT_APP_PAYMENT_API_URL!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create-order',
          amount: 24900,
          userEmail: userEmail
        })
      });
      
      const orderResult = await orderResponse.json();
      
      if (!orderResult.success) {
        throw new Error('Failed to create order');
      }
      
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: 24900, // ₹249 in paise
        currency: 'INR',
        name: 'Excel AI Assistant',
        description: 'Monthly Subscription - ₹249/month',
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
                userEmail: userEmail
              })
            });
            
            const verifyResult = await verifyResponse.json();
            
            if (verifyResult.success) {
              alert('Payment verified successfully! Welcome to Excel AI Assistant.');
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

  if (isCheckingStatus) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{ color: 'white', fontSize: '18px' }}>Checking payment status...</div>
      </div>
    );
  }

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