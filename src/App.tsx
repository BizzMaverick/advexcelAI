import { useState } from 'react';
import './App.css';
import MinimalApp from './components/MinimalApp';
import LandingPage from './LandingPage';
import WelcomePage from './components/WelcomePage';

function App() {
  const [currentView, setCurrentView] = useState('welcome');
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  const handleLogin = (userData: { name: string; email: string }) => {
    setUser(userData);
    setCurrentView('main');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('welcome');
  };

  if (currentView === 'welcome') {
    return <WelcomePage onProceed={() => setCurrentView('auth')} />;
  }

  if (currentView === 'auth') {
    return <LandingPage onLogin={handleLogin} />;
  }

  if (currentView === 'main' && user) {
    return <MinimalApp user={user} onLogout={handleLogout} />;
  }

  return <WelcomePage onProceed={() => setCurrentView('auth')} />;
}

export default App;