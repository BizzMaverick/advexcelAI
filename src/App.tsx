import React from 'react';
import './App.css';
import ExcelToolbar from './components/ExcelToolbar';

function App() {
  const handleToolAction = (action: string) => {
    console.log(`Action: ${action}`);
  };

  return (
    <div className="App">
      <header style={{ background: '#0078d4', color: 'white', padding: '20px' }}>
        <h1>Excel AI Assistant</h1>
      </header>
      <ExcelToolbar onToolAction={handleToolAction} />
      <div style={{ padding: '20px' }}>
        <p>Welcome to Excel AI Assistant</p>
      </div>
    </div>
  );
}

export default App;