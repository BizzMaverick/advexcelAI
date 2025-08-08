import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import MinimalApp from './components/MinimalApp';
import LandingPage from './LandingPage';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsAndConditions from './components/TermsAndConditions';
import CancellationRefund from './components/CancellationRefund';
import ShippingDelivery from './components/ShippingDelivery';
import ContactUs from './components/ContactUs';
import PaymentPage from './components/PaymentPage';

function App() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(() => {
    const savedUser = localStorage.getItem('advexcel_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [showPayment, setShowPayment] = useState(() => {
    const savedPaymentStatus = localStorage.getItem('advexcel_payment_required');
    return savedPaymentStatus === 'true';
  });

  const handleLogin = (userData: { name: string; email: string }) => {
    setUser(userData);
    localStorage.setItem('advexcel_user', JSON.stringify(userData));
    // Admin bypass
    if (userData.email === 'katragadda225@gmail.com') {
      setShowPayment(false);
      localStorage.setItem('advexcel_payment_required', 'false');
    } else {
      setShowPayment(true);
      localStorage.setItem('advexcel_payment_required', 'true');
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('advexcel_user');
    localStorage.removeItem('advexcel_payment_required');
    setShowPayment(false);
  };

  const handlePaymentSuccess = () => {
    setShowPayment(false);
    localStorage.setItem('advexcel_payment_required', 'false');
  };

  return (
    <Router>
      <Routes>
        {/* Legal Pages - Accessible without login */}
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-conditions" element={<TermsAndConditions />} />
        <Route path="/cancellation-refund" element={<CancellationRefund />} />
        <Route path="/shipping-delivery" element={<ShippingDelivery />} />
        <Route path="/contact-us" element={<ContactUs />} />
        
        {/* Main App Routes */}
        <Route path="/" element={
          !user ? (
            <LandingPage onLogin={handleLogin} />
          ) : showPayment ? (
            <PaymentPage 
              userEmail={user.email} 
              onPaymentSuccess={handlePaymentSuccess}
              onBackToLogin={handleLogout}
            />
          ) : (
            <MinimalApp user={user} onLogout={handleLogout} />
          )
        } />
      </Routes>
    </Router>
  );
}

export default App;