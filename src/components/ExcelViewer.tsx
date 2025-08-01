import React, { useState } from 'react';

interface ExcelViewerProps {
  fileData: {
    fileName: string;
    sheets: { [key: string]: any[][] };
    sheetNames: string[];
  };
  user: { name: string; email: string };
  onBack: () => void;
  onLogout: () => void;
}

const ExcelViewer: React.FC<ExcelViewerProps> = ({ fileData, user, onBack, onLogout }) => {
  const [activeSheet, setActiveSheet] = useState(fileData.sheetNames[0]);
  const [prompt, setPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const currentSheetData = fileData.sheets[activeSheet] || [];

  const handleAIQuery = async () => {
    if (!prompt.trim()) return;
    
    setIsProcessing(true);
    try {
      // Here you would call your Bedrock service
      // For now, simulate AI response
      setTimeout(() => {
        setAiResponse(`AI Analysis: ${prompt}\n\nBased on your ${fileData.fileName} data, I can see ${currentSheetData.length} rows of data. The analysis shows interesting patterns in your dataset.`);
        setIsProcessing(false);
      }, 2000);
    } catch (error) {
      setAiResponse('Error processing your request. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      {/* Header */}
      <div style={{ 
        background: 'white', 
        padding: '15px 20px', 
        borderBottom: '1px solid #ddd',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button 
            onClick={onBack}
            style={{
              background: '#667eea',
              color: 'white',
              border: 'none',
              padding: '8px 15px',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            ← Back
          </button>
          <h2 style={{ margin: 0, color: '#333' }}>📊 {fileData.fileName}</h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ color: '#666' }}>Welcome, {user.name}</span>
          <button 
            onClick={onLogout}
            style={{
              background: '#ff4757',
              color: 'white',
              border: 'none',
              padding: '8px 15px',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', height: 'calc(100vh - 70px)' }}>
        {/* Left Panel - AI Chat */}
        <div style={{ 
          width: '350px', 
          background: 'white', 
          borderRight: '1px solid #ddd',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ padding: '20px', borderBottom: '1px solid #eee' }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>🤖 AI Assistant</h3>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask me anything about your data..."
              style={{
                width: '100%',
                height: '80px',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                resize: 'none',
                fontSize: '14px'
              }}
            />
            <button
              onClick={handleAIQuery}
              disabled={isProcessing || !prompt.trim()}
              style={{
                width: '100%',
                background: isProcessing ? '#ccc' : '#667eea',
                color: 'white',
                border: 'none',
                padding: '10px',
                borderRadius: '5px',
                marginTop: '10px',
                cursor: isProcessing ? 'not-allowed' : 'pointer',
                fontSize: '14px'
              }}
            >
              {isProcessing ? 'Processing...' : 'Ask AI'}
            </button>
          </div>
          
          <div style={{ flex: 1, padding: '20px', overflow: 'auto' }}>
            {aiResponse && (
              <div style={{
                background: '#f8f9ff',
                padding: '15px',
                borderRadius: '10px',
                border: '1px solid #e6f2fa'
              }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>AI Response:</h4>
                <p style={{ margin: 0, color: '#666', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                  {aiResponse}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Excel Data */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Sheet Tabs */}
          {fileData.sheetNames.length > 1 && (
            <div style={{ 
              background: 'white', 
              padding: '10px 20px', 
              borderBottom: '1px solid #ddd',
              display: 'flex',
              gap: '10px'
            }}>
              {fileData.sheetNames.map(sheetName => (
                <button
                  key={sheetName}
                  onClick={() => setActiveSheet(sheetName)}
                  style={{
                    background: activeSheet === sheetName ? '#667eea' : '#f5f5f5',
                    color: activeSheet === sheetName ? 'white' : '#333',
                    border: 'none',
                    padding: '8px 15px',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  {sheetName}
                </button>
              ))}
            </div>
          )}

          {/* Data Table */}
          <div style={{ 
            flex: 1, 
            overflow: 'auto', 
            background: 'white',
            padding: '20px'
          }}>
            <div style={{ 
              border: '1px solid #ddd',
              borderRadius: '5px',
              overflow: 'auto',
              maxHeight: '100%'
            }}>
              <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse',
                fontSize: '14px'
              }}>
                <tbody>
                  {currentSheetData.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row.map((cell, cellIndex) => (
                        <td
                          key={cellIndex}
                          style={{
                            border: '1px solid #eee',
                            padding: '8px 12px',
                            background: rowIndex === 0 ? '#f8f9fa' : 'white',
                            fontWeight: rowIndex === 0 ? 'bold' : 'normal',
                            minWidth: '100px',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {cell || ''}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div style={{ 
              marginTop: '15px', 
              color: '#666', 
              fontSize: '14px',
              textAlign: 'center'
            }}>
              Showing {currentSheetData.length} rows × {currentSheetData[0]?.length || 0} columns
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExcelViewer;