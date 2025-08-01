import { useState, useRef } from 'react';
import './App.css';
import MinimalApp from './components/MinimalApp';
import LandingPage from './LandingPage';
import logo from './assets/logo.png';

function App() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Professional color palette
  const colors = {
    primary: '#0078d4',
    primaryLight: '#e6f2fa',
    primaryDark: '#005a9e',
    success: '#107c10',
    border: '#e0e0e0',
    background: '#ffffff',
    backgroundAlt: '#f9f9f9',
    text: '#252525',
    textSecondary: '#505050',
  };
  
  const handleLogin = (userData: { name: string; email: string }) => {
    setUser(userData);
  };
  
  const handleLogout = () => {
    setUser(null);
  };
  
  const handleToolAction = (action: string) => {
    console.log(`Action: ${action}`);
    
    // Handle specific actions
    if (action === 'aws-import') {
      fileInputRef.current?.click();
    } else if (action.startsWith('aws-')) {
      alert(`AWS Action: ${action.replace('aws-', '')}`);
    } else {
      setPrompt(`Apply ${action.replace('-', ' ')} to the data`);
    }
  };
  
  const handleRunAI = () => {
    if (!prompt.trim()) return;
    setIsProcessing(true);
    
    // Simulate AI processing
    setTimeout(() => {
      setIsProcessing(false);
      alert(`AI Command executed: ${prompt}`);
    }, 1500);
  };

  // Show landing page if user is not logged in
  if (!user) {
    return <LandingPage onLogin={handleLogin} />;
  }

  // Show main application if user is logged in
  return <MinimalApp user={user} onLogout={handleLogout} />;
}

export default App;