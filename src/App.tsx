import React, { useState } from 'react';
import './App.css';
import ExcelToolbar from './components/ExcelToolbar';

function App() {
  const [user] = useState({ name: 'User', email: 'user@example.com' });
  
  const handleToolAction = (action: string) => {
    console.log(`Action: ${action}`);
    
    // Simple alert for actions
    if (action.startsWith('aws-')) {
      alert(`AWS Action: ${action.replace('aws-', '')}`);
    } else {
      alert(`Tool Action: ${action}`);
    }
  };

  return (
    <div className="App" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{ 
        background: '#0078d4', 
        color: 'white', 
        padding: '12px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h1 style={{ margin: 0, fontSize: '20px' }}>Excel AI Assistant</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span>Welcome, {user.name}</span>
          <button style={{ 
            background: 'rgba(255,255,255,0.2)', 
            border: '1px solid rgba(255,255,255,0.3)',
            color: 'white',
            padding: '6px 12px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}>
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
        background: '#f9f9f9'
      }}>
        {/* Sidebar */}
        <div style={{ 
          width: '250px', 
          background: 'white', 
          borderRadius: '4px',
          padding: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          marginRight: '20px'
        }}>
          <h3 style={{ margin: '0 0 16px 0' }}>File Upload</h3>
          <button style={{
            width: '100%',
            padding: '8px',
            background: '#0078d4',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginBottom: '16px'
          }}>
            Choose Excel/CSV File
          </button>
          
          <h3 style={{ margin: '16px 0 8px 0' }}>AI Command</h3>
          <textarea 
            placeholder="Type what you want to do..."
            style={{
              width: '100%',
              height: '80px',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              resize: 'vertical'
            }}
          />
          <button style={{
            width: '100%',
            padding: '8px',
            background: '#107c10',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '8px'
          }}>
            Run AI Command
          </button>
        </div>
        
        {/* Main Area */}
        <div style={{ 
          flex: 1, 
          background: 'white',
          borderRadius: '4px',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ margin: '0 0 20px 0' }}>Spreadsheet</h2>
          <p>No data loaded. Please upload a file or create a new sheet.</p>
        </div>
      </div>
    </div>
  );
}

export default App;