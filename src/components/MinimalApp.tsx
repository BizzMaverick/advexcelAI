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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileData, setFileData] = useState<any[][]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      
      // Simple CSV parsing for demo
      if (file.name.endsWith('.csv')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          const rows = text.split('\n').map(row => row.split(','));
          setFileData(rows.slice(0, 10)); // Show first 10 rows
        };
        reader.readAsText(file);
      } else {
        // For Excel files, show placeholder data
        setFileData([
          ['Name', 'Age', 'City'],
          ['John Doe', '30', 'New York'],
          ['Jane Smith', '25', 'Los Angeles'],
          ['Bob Johnson', '35', 'Chicago']
        ]);
      }
    }
  };

  const handleProcessAI = () => {
    if (!prompt.trim()) {
      alert('Please enter a command');
      return;
    }
    
    if (!selectedFile) {
      alert('Please select a file first');
      return;
    }
    
    setIsProcessing(true);
    
    // Simulate AI processing
    setTimeout(() => {
      setIsProcessing(false);
      alert(`AI processed "${prompt}" on file "${selectedFile.name}"`);
    }, 2000);
  };

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
        
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <input 
            type="file" 
            accept=".xlsx,.xls,.csv" 
            onChange={handleFileUpload}
            style={{ marginBottom: '20px', padding: '10px', width: '100%', border: '1px solid #ddd', borderRadius: '4px' }} 
          />
          
          {selectedFile && (
            <div style={{ marginBottom: '20px', padding: '15px', background: '#f0f8ff', border: '1px solid #0078d4', borderRadius: '4px' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#0078d4' }}>Selected File: {selectedFile.name}</h4>
              <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>Size: {(selectedFile.size / 1024).toFixed(2)} KB</p>
            </div>
          )}
          
          {fileData.length > 0 && (
            <div style={{ marginBottom: '20px', overflowX: 'auto' }}>
              <h4 style={{ color: '#333', marginBottom: '10px' }}>File Preview:</h4>
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
                <tbody>
                  {fileData.map((row, i) => (
                    <tr key={i} style={{ background: i === 0 ? '#f5f5f5' : 'white' }}>
                      {row.map((cell, j) => (
                        <td key={j} style={{ padding: '8px', border: '1px solid #ddd', fontSize: '14px' }}>
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          <textarea 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Type your AI command here... (e.g., 'Sort by age', 'Calculate average', 'Filter by city')"
            style={{ width: '100%', height: '100px', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '20px', resize: 'vertical' }}
          />
          
          <button 
            onClick={handleProcessAI}
            disabled={isProcessing}
            style={{ 
              background: isProcessing ? '#ccc' : '#0078d4', 
              color: 'white', 
              border: 'none', 
              padding: '12px 24px', 
              borderRadius: '4px', 
              cursor: isProcessing ? 'not-allowed' : 'pointer', 
              fontSize: '16px' 
            }}
          >
            {isProcessing ? 'Processing...' : 'Process with AI'}
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