import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';
import './animations.css';
import MinimalApp from './components/MinimalApp';
import ModernWorkspace from './components/ModernWorkspace';
import LandingPage from './LandingPage';
import ModernLandingPage from './components/ModernLandingPage';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsAndConditions from './components/TermsAndConditions';
import CancellationRefund from './components/CancellationRefund';
import ShippingDelivery from './components/ShippingDelivery';
import ContactUs from './components/ContactUs';
import PaymentPage from './components/PaymentPage';
import TrialStatus from './components/TrialStatus';
import PaymentService from './services/paymentService';
import authService from './services/authService';
import AnalyticsDashboard from './components/AnalyticsDashboard';

function App() {
  // Font injection removed to prevent potential refresh issues

  const [user, setUser] = useState<{ name: string; email: string } | null>(() => {
    const savedUser = localStorage.getItem('advexcel_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  const [trialStatus, setTrialStatus] = useState<{
    hasValidPayment: boolean;
    inTrial?: boolean;
    trialExpired?: boolean;
    needsTrial?: boolean;
    trialExpiryDate?: string;
    promptsRemaining?: number;
    promptsUsed?: number;
    isAdmin?: boolean;
  }>({ hasValidPayment: false });
  
  const [loading, setLoading] = useState(false);
  
  // Feature flag for new interface - only for specific users
  const [useNewInterface, setUseNewInterface] = useState(() => {
    return localStorage.getItem('use_new_interface') === 'true';
  });
  
  const canUseNewInterface = user?.email === 'katragadda225@gmail.com' || user?.email?.includes('@advexcel.online');

  // Check trial/payment status when user logs in
  useEffect(() => {
    if (user) {
      checkUserStatus();
    }
  }, [user]);

  const checkUserStatus = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const status = await PaymentService.checkPaymentStatus(user.email);
      setTrialStatus(status);
      
      // If user needs trial, start it automatically
      if (status.needsTrial) {
        const trialStarted = await PaymentService.startTrial(user.email);
        if (trialStarted) {
          // Recheck status after starting trial
          const newStatus = await PaymentService.checkPaymentStatus(user.email);
          setTrialStatus(newStatus);
        }
      }
    } catch (error) {
      console.error('Failed to check user status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (userData: { name: string; email: string }) => {
    setUser(userData);
    localStorage.setItem('advexcel_user', JSON.stringify(userData));
  };

  const handleLogout = async () => {
    // Sign out from Cognito
    await authService.signOut();
    
    // Mark as logged out to prevent auto-login
    sessionStorage.setItem('just_logged_out', 'true');
    
    // Clear local state
    setUser(null);
    localStorage.removeItem('advexcel_user');
    setTrialStatus({ hasValidPayment: false });
  };

  const handlePaymentSuccess = () => {
    checkUserStatus(); // Refresh status after payment
  };

  const handleTrialRefresh = () => {
    // Block trial refresh to prevent component remounting during AI processing
    console.log('Trial refresh blocked to prevent remounting');
    // checkUserStatus(); 
  };

  // Show loading while checking status
  if (user && loading) {
    return (
      <div className="page-transition" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div className="loading-pulse" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '16px' }}>🔄</div>
          <div>Checking your account status...</div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Legal Pages - Accessible without login */}
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-conditions" element={<TermsAndConditions />} />
        <Route path="/cancellation-refund" element={<CancellationRefund />} />
        <Route path="/shipping-delivery" element={<ShippingDelivery />} />
        <Route path="/contact-us" element={<ContactUs />} />
        
        {/* Analytics Dashboard - Admin only */}
        <Route path="/analytics" element={<AnalyticsDashboard />} />
        
        {/* Main App Routes */}
        <Route path="/" element={
          !user ? (
            (useNewInterface && canUseNewInterface) ? <ModernLandingPage onLogin={handleLogin} /> : <LandingPage onLogin={handleLogin} />
          ) : trialStatus.trialExpired ? (
            <PaymentPage 
              userEmail={user.email} 
              onPaymentSuccess={handlePaymentSuccess}
              onBackToLogin={handleLogout}
              trialExpired={true}
            />
          ) : trialStatus.hasValidPayment ? (
            <>
              {trialStatus.inTrial && !useNewInterface && (
                <TrialStatus 
                  trialExpiryDate={trialStatus.trialExpiryDate}
                  promptsRemaining={trialStatus.promptsRemaining || 0}
                  promptsUsed={trialStatus.promptsUsed || 0}
                  onUpgrade={() => {
                    alert('Upgrade feature temporarily disabled to prevent data loss. Please contact support.');
                  }}
                  onRefresh={handleTrialRefresh}
                />
              )}
              
              {/* Modern Beta Testing Toggle - Only for admin */}
              {canUseNewInterface && (
                <div style={{
                  position: 'fixed',
                  top: '20px',
                  right: '20px',
                  zIndex: 9999,
                  background: useNewInterface ? 
                    'linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1))' :
                    'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: 'white',
                  padding: '12px 20px',
                  borderRadius: '25px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontFamily: '"Poppins", sans-serif',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }} onClick={() => {
                  const newValue = !useNewInterface;
                  localStorage.setItem('use_new_interface', newValue.toString());
                  setUseNewInterface(newValue);
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)';
                }}>
                  <span style={{ fontSize: '16px' }}>
                    {useNewInterface ? '🔄' : '✨'}
                  </span>
                  {useNewInterface ? 'Classic UI' : 'Modern UI'}
                </div>
              )}
              {(useNewInterface && canUseNewInterface) ? (
                <ModernWorkspace 
                  user={user} 
                  onLogout={handleLogout}
                />
              ) : (
                <MinimalApp 
                  user={user} 
                  onLogout={handleLogout}
                  trialStatus={trialStatus}
                  onTrialRefresh={handleTrialRefresh}
                />
              )}
            </>
          ) : (
            <PaymentPage 
              userEmail={user.email} 
              onPaymentSuccess={handlePaymentSuccess}
              onBackToLogin={handleLogout}
              trialExpired={false}
            />
          )
        } />
        
        {/* Direct payment page route */}
        <Route path="/payment" element={
          user ? (
            <PaymentPage 
              userEmail={user.email} 
              onPaymentSuccess={handlePaymentSuccess}
              onBackToLogin={handleLogout}
              trialExpired={false}
            />
          ) : (
            (useNewInterface && canUseNewInterface) ? <ModernLandingPage onLogin={handleLogin} /> : <LandingPage onLogin={handleLogin} />
          )
        } />
      </Routes>
    </Router>
  );
}

export default App;