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

function App() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  const handleLogin = (userData: { name: string; email: string }) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
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
          ) : (
            <MinimalApp user={user} onLogout={handleLogout} />
          )
        } />
      </Routes>
    </Router>
  );
}

export default App;