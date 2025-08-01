import { useState, useRef } from 'react';
import './App.css';
import ExcelToolbar from './components/ExcelToolbar';
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
  return (
    <div className="App" style={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif',
    }}>
      {/* Header */}
      <header style={{ 
        background: colors.primary, 
        color: 'white', 
        padding: '12px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img 
            src={logo} 
            alt="Excel AI Assistant" 
            style={{ height: '32px' }}
          />
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '500' }}>Excel AI Assistant</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '14px' }}>Welcome, {user.name}</span>
          <button 
            onClick={handleLogout}
            style={{ 
              background: 'rgba(255,255,255,0.2)', 
              border: '1px solid rgba(255,255,255,0.3)',
              color: 'white',
              padding: '6px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
            }}
          >
            Logout
          </button>
        </div>
      </header>
      
      {/* Toolbar */}
      <ExcelToolbar onToolAction={handleToolAction} />
      
      {/* Main Content */}
      <div style={{ 
        flex: 1, 
        display: 'flex',
        padding: '20px',
        background: colors.backgroundAlt
      }}>
        {/* Sidebar */}
        <div style={{ 
          width: '280px', 
          background: colors.background, 
          borderRadius: '6px',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          marginRight: '20px'
        }}>
          <h3 style={{ 
            margin: '0 0 16px 0', 
            color: colors.text,
            fontSize: '16px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ fontSize: '18px' }}>📁</span> File Upload
          </h3>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            style={{ display: 'none' }}
            onChange={(e) => {
              if (e.target.files?.[0]) {
                alert(`File selected: ${e.target.files[0].name}`);
              }
            }}
          />
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            style={{
              width: '100%',
              padding: '10px',
              background: colors.primary,
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginBottom: '24px',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = colors.primaryDark;
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = colors.primary;
            }}
          >
            <span style={{ fontSize: '16px' }}>📤</span>
            Choose Excel/CSV File
          </button>
          
          <h3 style={{ 
            margin: '0 0 12px 0', 
            color: colors.text,
            fontSize: '16px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ fontSize: '18px' }}>🤖</span> AI Command
          </h3>
          
          <textarea 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Type what you want to do... e.g., 'sort by name', 'highlight top 10', 'create pivot table'"
            style={{
              width: '100%',
              height: '100px',
              padding: '12px',
              border: `1px solid ${colors.border}`,
              borderRadius: '4px',
              fontSize: '14px',
              resize: 'vertical',
              fontFamily: 'inherit'
            }}
          />
          
          <button 
            onClick={handleRunAI}
            disabled={!prompt.trim() || isProcessing}
            style={{
              width: '100%',
              padding: '10px',
              background: isProcessing ? '#6c757d' : colors.success,
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              marginTop: '12px',
              fontSize: '14px',
              opacity: isProcessing ? 0.8 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
          >
            {isProcessing ? (
              <>
                <span style={{ fontSize: '16px' }}>⏳</span>
                Processing...
              </>
            ) : (
              <>
                <span style={{ fontSize: '16px' }}>🚀</span>
                Run AI Command
              </>
            )}
          </button>
        </div>
        
        {/* Main Area */}
        <div style={{ 
          flex: 1, 
          background: colors.background,
          borderRadius: '6px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <h2 style={{ 
            margin: '0 0 24px 0',
            color: colors.text,
            fontSize: '20px',
            fontWeight: '500'
          }}>
            Spreadsheet
          </h2>
          
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: colors.textSecondary,
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
            <h3 style={{ margin: '0 0 8px 0', fontWeight: '500' }}>No data loaded</h3>
            <p style={{ margin: '0 0 24px 0' }}>Please upload a file or create a new sheet</p>
            <button style={{
              padding: '10px 20px',
              background: colors.primary,
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{ fontSize: '16px' }}>📄</span>
              Create New Sheet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;