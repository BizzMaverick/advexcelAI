import { useState } from 'react';
import logo from '../assets/logo.png';

interface User {
  email: string;
  name: string;
}

interface MinimalAppProps {
  user: User;
  onLogout: () => void;
}

export default function MinimalApp({ user, onLogout }: MinimalAppProps) {
  const [prompt, setPrompt] = useState('');

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      <header style={{ background: '#0078d4', color: 'white', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src={logo} alt="Logo" style={{ height: '32px' }} />
          <h1 style={{ margin: 0, fontSize: '20px' }}>Excel AI Assistant</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span>Welcome, {user.name}</span>
          <button onClick={onLogout} style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>
            Logout
          </button>
        </div>
      </header>
      
      <main style={{ padding: '40px 20px', textAlign: 'center' }}>
        <h2 style={{ color: '#333', marginBottom: '20px' }}>Excel AI Assistant</h2>
        <p style={{ color: '#666', marginBottom: '30px' }}>Upload Excel files and process them with AI commands</p>
        
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <input type="file" accept=".xlsx,.xls,.csv" style={{ marginBottom: '20px', padding: '10px', width: '100%', border: '1px solid #ddd', borderRadius: '4px' }} />
          
          <textarea 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Type your AI command here..."
            style={{ width: '100%', height: '100px', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '20px', resize: 'vertical' }}
          />
          
          <button style={{ background: '#0078d4', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}>
            Process with AI
          </button>
        </div>
        
        <div style={{ marginTop: '40px', padding: '20px', background: '#f5f5f5', borderRadius: '8px', maxWidth: '600px', margin: '40px auto 0' }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#333' }}>Features</h3>
          <ul style={{ textAlign: 'left', color: '#666' }}>
            <li>Upload Excel and CSV files</li>
            <li>Process data with AI commands</li>
            <li>Natural language processing</li>
            <li>Data analysis and formatting</li>
          </ul>
        </div>
      </main>
    </div>
  );
}