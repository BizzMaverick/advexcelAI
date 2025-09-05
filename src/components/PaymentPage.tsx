import React, { useState, useEffect } from 'react';

interface PaymentPageProps {
  userEmail: string;
  onPaymentSuccess: () => void;
  onBackToLogin: () => void;
  trialExpired?: boolean;
}

export default function PaymentPage({ userEmail, onPaymentSuccess, onBackToLogin, trialExpired = false }: PaymentPageProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'advanced' | 'full' | null>(null);
  
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
      if (!selectedPlan) return;
      
      const amount = selectedPlan === 'full' ? 19900 : selectedPlan === 'advanced' ? 17900 : 4900; // ₹199, ₹179, or ₹49 in paise
      
      // Create order first
      const orderResponse = await fetch(process.env.REACT_APP_PAYMENT_API_URL!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create-order',
          amount: amount,
          userEmail: userEmail,
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
                userEmail: userEmail,
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
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>{trialExpired ? '⏰' : '💳'}</div>
        <h1 style={{ color: '#333', fontSize: '28px', marginBottom: '10px' }}>
          {trialExpired ? 'Trial Expired' : 'Complete Payment'}
        </h1>
        <p style={{ color: '#666', fontSize: '16px', marginBottom: '30px' }}>
          {trialExpired 
            ? `Hi ${userEmail}! Your 3-day free trial has ended. Upgrade to continue using AdvExcel.`
            : `Welcome ${userEmail}! Complete payment to access AdvExcel.`
          }
        </p>

        {/* Festival Season Plans */}
        <div style={{ marginBottom: '30px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            color: 'white',
            padding: '12px',
            borderRadius: '8px 8px 0 0',
            textAlign: 'center',
            fontSize: '14px',
            fontWeight: '600'
          }}>
            🎉 Festival Season Offer - Until Jan 16, 2026
          </div>
          
          <div style={{
            border: '2px solid #0078d4',
            borderRadius: '0 0 8px 8px',
            padding: '20px',
            background: '#f8f9ff'
          }}>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <div style={{
                flex: 1,
                border: selectedPlan === 'basic' ? '2px solid #0078d4' : '1px solid #ddd',
                borderRadius: '8px',
                padding: '12px',
                background: selectedPlan === 'basic' ? '#e7f3ff' : 'white',
                cursor: 'pointer'
              }} onClick={() => setSelectedPlan('basic')}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#0078d4' }}>₹49</div>
                <div style={{ fontSize: '11px', color: '#666' }}>Basic</div>
                <div style={{ fontSize: '10px', color: '#888' }}>Excel processing</div>
              </div>
              
              <div style={{
                flex: 1,
                border: selectedPlan === 'advanced' ? '2px solid #f59e0b' : '1px solid #ddd',
                borderRadius: '8px',
                padding: '12px',
                background: selectedPlan === 'advanced' ? '#fef3c7' : 'white',
                cursor: 'pointer'
              }} onClick={() => setSelectedPlan('advanced')}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#f59e0b' }}>₹179</div>
                <div style={{ fontSize: '11px', color: '#666' }}>Advanced</div>
                <div style={{ fontSize: '10px', color: '#888' }}>Charts & Analytics</div>
              </div>
              
              <div style={{
                flex: 1,
                border: selectedPlan === 'full' ? '2px solid #10b981' : '1px solid #ddd',
                borderRadius: '8px',
                padding: '12px',
                background: selectedPlan === 'full' ? '#ecfdf5' : 'white',
                cursor: 'pointer',
                position: 'relative'
              }} onClick={() => setSelectedPlan('full')}>
                <div style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '4px',
                  background: '#10b981',
                  color: 'white',
                  fontSize: '9px',
                  padding: '2px 4px',
                  borderRadius: '4px'
                }}>SAVE ₹29</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#10b981' }}>₹199</div>
                <div style={{ fontSize: '11px', color: '#666' }}>Full Package</div>
                <div style={{ fontSize: '10px', color: '#888' }}>Basic + Advanced</div>
              </div>
            </div>
            
            {/* Savings explanation */}
            <div style={{
              background: '#ecfdf5',
              border: '1px solid #10b981',
              borderRadius: '6px',
              padding: '10px',
              fontSize: '12px',
              color: '#065f46',
              textAlign: 'center'
            }}>
              💡 <strong>Smart Choice:</strong> Full Package = Basic (₹49) + Advanced (₹179) for just ₹199<br/>
              <span style={{ fontSize: '11px' }}>Save ₹29/month vs buying separately!</span>
            </div>
          </div>
        </div>

        <button
          onClick={handlePayment}
          disabled={isProcessing || !selectedPlan}
          style={{
            width: '100%',
            padding: '16px',
            background: isProcessing || !selectedPlan ? '#ccc' : (selectedPlan === 'full' ? '#10b981' : '#0078d4'),
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: isProcessing || !selectedPlan ? 'not-allowed' : 'pointer',
            marginBottom: '20px'
          }}
        >
          {isProcessing ? '🔄 Processing...' : `🔒 Pay ₹${selectedPlan === 'full' ? '199' : selectedPlan === 'advanced' ? '179' : '49'} with Razorpay`}
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