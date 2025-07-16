import { useState } from 'react';
import './App.css';
import LandingPage from './LandingPage';
import LoginPage from './components/LoginPage';
import MainWorkspace from './components/MainWorkspace';

interface User {
  email: string;
  name: string;
}

function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const handleGetStarted = () => {
    setShowLanding(false);
    setShowLogin(true);
  };

  const handleLogin = (userData: User) => {
    setUser(userData);
    setShowLogin(false);
  };

  const handleLogout = () => {
    setUser(null);
    setShowLanding(true);
    setShowLogin(false);
  };

  if (showLanding) {
    return <LandingPage onBegin={handleGetStarted} />;
  }

  if (showLogin) {
    return <LoginPage onLogin={handleLogin} />;
  }

  if (user) {
    return <MainWorkspace user={user} onLogout={handleLogout} />;
  }

  return null;
}

export default App;