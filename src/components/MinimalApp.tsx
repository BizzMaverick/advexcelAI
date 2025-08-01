import { useState } from 'react';
import * as XLSX from 'xlsx';
import logo from '../assets/logo.png';
import bedrockService from '../services/bedrockService';

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
  const [aiResponse, setAiResponse] = useState<string>('');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          if (file.name.endsWith('.csv')) {
            const text = e.target?.result as string;
            const rows = text.split('\n').map(row => row.split(','));
            setFileData(rows.filter(row => row.some(cell => cell.trim()))); // Remove empty rows
          } else {
            // Parse Excel files
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
            setFileData(jsonData as any[][]);
          }
        } catch (error) {
          console.error('Error parsing file:', error);
          alert('Error reading file. Please make sure it\'s a valid Excel or CSV file.');
        }
      };
      
      if (file.name.endsWith('.csv')) {
        reader.readAsText(file);
      } else {
        reader.readAsArrayBuffer(file);
      }
    }
  };

  const handleProcessAI = async () => {
    if (!prompt.trim()) {
      alert('Please enter a command');
      return;
    }
    
    if (!selectedFile || fileData.length === 0) {
      alert('Please select a file first');
      return;
    }
    
    setIsProcessing(true);
    setAiResponse('');
    
    try {
      const result = await bedrockService.processExcelData(
        fileData,
        prompt,
        selectedFile.name
      );
      
      if (result.success && result.response) {
        setAiResponse(result.response);
      } else {
        setAiResponse(`Error: ${result.error || 'Unknown error occurred'}`);
      }
    } catch (error) {
      setAiResponse(`Error: ${error instanceof Error ? error.message : 'Failed to process request'}`);
    } finally {
      setIsProcessing(false);
    }
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
      
      <main style={{ 
        padding: '40px 20px', 
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        minHeight: 'calc(100vh - 80px)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ 
              color: '#333', 
              fontSize: '32px',
              marginBottom: '10px',
              fontWeight: 'bold'
            }}>
              Excel AI Assistant
            </h2>
            <p style={{ 
              color: '#666', 
              fontSize: '18px',
              margin: 0
            }}>
              Upload Excel files and process them with AI commands
            </p>
          </div>
          
          {/* File Upload Section */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '30px',
            marginBottom: '30px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '15px' }}>📁</div>
              <h3 style={{ color: '#333', marginBottom: '10px' }}>Upload Your File</h3>
              <p style={{ color: '#666', fontSize: '14px' }}>Supports .xlsx, .xls, and .csv files</p>
            </div>
            <input 
              type="file" 
              accept=".xlsx,.xls,.csv" 
              onChange={handleFileUpload}
              style={{ 
                padding: '12px 20px',
                border: '2px dashed #667eea',
                borderRadius: '8px',
                background: '#f8f9ff',
                cursor: 'pointer',
                fontSize: '14px',
                width: '100%',
                maxWidth: '400px'
              }} 
            />
          </div>
          
          {selectedFile && (
            <div style={{ marginBottom: '20px', padding: '15px', background: '#f0f8ff', border: '1px solid #0078d4', borderRadius: '4px' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#0078d4' }}>Selected File: {selectedFile.name}</h4>
              <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>Size: {(selectedFile.size / 1024).toFixed(2)} KB</p>
            </div>
          )}
          
          {fileData.length > 0 && (
            <div style={{ 
              marginBottom: '30px', 
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              overflow: 'hidden'
            }}>
              <div style={{ 
                padding: '20px', 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white'
              }}>
                <h3 style={{ margin: 0, fontSize: '18px' }}>📊 {selectedFile?.name}</h3>
                <p style={{ margin: '5px 0 0 0', opacity: 0.9, fontSize: '14px' }}>
                  {fileData.length} rows × {fileData[0]?.length || 0} columns
                </p>
              </div>
              <div style={{ 
                maxHeight: '500px', 
                overflow: 'auto',
                padding: '0'
              }}>
                <table style={{ 
                  width: '100%', 
                  borderCollapse: 'collapse',
                  fontSize: '14px'
                }}>
                  <tbody>
                    {fileData.map((row, i) => (
                      <tr key={i} style={{ 
                        background: i === 0 ? '#f8f9ff' : (i % 2 === 0 ? '#fafafa' : 'white'),
                        borderBottom: '1px solid #eee'
                      }}>
                        {Array.isArray(row) && row.length > 0 ? row.map((cell, j) => (
                          <td key={j} style={{ 
                            padding: '12px 16px', 
                            borderRight: '1px solid #eee',
                            fontWeight: i === 0 ? 'bold' : 'normal',
                            color: i === 0 ? '#333' : '#666',
                            minWidth: '120px',
                            whiteSpace: 'nowrap'
                          }}>
                            {cell !== null && cell !== undefined ? String(cell) : ''}
                          </td>
                        )) : (
                          <td style={{ 
                            padding: '12px 16px', 
                            color: '#999',
                            fontStyle: 'italic'
                          }}>
                            No data in this row
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {/* AI Command Section */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '30px',
            marginBottom: '30px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '32px', marginRight: '15px' }}>🤖</div>
              <div>
                <h3 style={{ color: '#333', margin: 0 }}>AI Assistant</h3>
                <p style={{ color: '#666', fontSize: '14px', margin: '5px 0 0 0' }}>Ask questions about your data</p>
              </div>
            </div>
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Type your AI command here... (e.g., 'Sort by age', 'Calculate average', 'Filter by city')"
              style={{ 
                width: '100%', 
                height: '120px', 
                padding: '16px', 
                border: '2px solid #eee', 
                borderRadius: '8px', 
                marginBottom: '20px', 
                resize: 'vertical',
                fontSize: '14px',
                fontFamily: 'inherit'
              }}
            />
            <button 
              onClick={handleProcessAI}
              disabled={isProcessing || !selectedFile}
              style={{ 
                background: isProcessing || !selectedFile ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                color: 'white', 
                border: 'none', 
                padding: '14px 28px', 
                borderRadius: '8px', 
                cursor: isProcessing || !selectedFile ? 'not-allowed' : 'pointer', 
                fontSize: '16px',
                fontWeight: 'bold',
                boxShadow: isProcessing || !selectedFile ? 'none' : '0 4px 12px rgba(102, 126, 234, 0.3)'
              }}
            >
              {isProcessing ? '🔄 Processing...' : '✨ Process with AI'}
            </button>
          </div>
          
          {aiResponse && (
            <div style={{ 
              background: 'white',
              borderRadius: '12px',
              padding: '30px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              textAlign: 'left'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ fontSize: '32px', marginRight: '15px' }}>💡</div>
                <h4 style={{ color: '#333', margin: 0, fontSize: '20px' }}>AI Response</h4>
              </div>
              <div style={{ 
                whiteSpace: 'pre-wrap', 
                fontSize: '15px', 
                lineHeight: '1.6',
                color: '#555',
                background: '#f8f9ff',
                padding: '20px',
                borderRadius: '8px',
                border: '1px solid #e6f2fa'
              }}>
                {aiResponse}
              </div>
            </div>
          )}
        </div>
        
        </div>
      </main>
    </div>
  );
}