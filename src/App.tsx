import { useState } from 'react';
import './App.css';
import MinimalApp from './components/MinimalApp';
import LandingPage from './LandingPage';

function App() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  const handleLogin = (userData: { name: string; email: string }) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (!user) {
    return <LandingPage onLogin={handleLogin} />;
  }

  return <MinimalApp user={user} onLogout={handleLogout} />;
}

export default App;