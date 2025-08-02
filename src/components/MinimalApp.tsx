import { useState, useCallback, useMemo } from 'react';
import * as XLSX from 'xlsx';
import logo from '../assets/logo.png';
import bedrockService from '../services/bedrockService';
import ErrorBoundary from './ErrorBoundary';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_ROWS = 1000;
const ALLOWED_TYPES = ['.xlsx', '.xls', '.csv'];

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
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());
  const [dataKey, setDataKey] = useState<string>('initial');

  const [fileLoading, setFileLoading] = useState(false);
  const [fileError, setFileError] = useState<string>('');

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileError('');
    setFileLoading(true);

    // Validate file
    if (file.size > MAX_FILE_SIZE) {
      setFileError(`File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`);
      setFileLoading(false);
      return;
    }

    const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_TYPES.includes(fileExt)) {
      setFileError(`Invalid file type. Allowed: ${ALLOWED_TYPES.join(', ')}`);
      setFileLoading(false);
      return;
    }

    setSelectedFile(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        let parsedData: any[][];
        
        if (file.name.endsWith('.csv')) {
          const text = e.target?.result as string;
          parsedData = text.split('\n')
            .map(row => row.split(',').map(cell => cell.trim()))
            .filter(row => row.some(cell => cell.length > 0));
        } else {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          parsedData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as any[][];
        }

        // Limit rows for performance
        if (parsedData.length > MAX_ROWS) {
          parsedData = parsedData.slice(0, MAX_ROWS);
          setFileError(`File truncated to ${MAX_ROWS} rows for performance`);
        }

        // Sanitize data
        const sanitizedData = parsedData.map(row => 
          row.map(cell => {
            if (typeof cell === 'string') {
              return cell.replace(/<[^>]*>/g, '').substring(0, 200); // Remove HTML, limit length
            }
            return cell;
          })
        );

        setFileData(sanitizedData);
      } catch (error) {
        console.error('Error parsing file:', error);
        setFileError('Error reading file. Please ensure it\'s a valid Excel or CSV file.');
      } finally {
        setFileLoading(false);
      }
    };
    
    reader.onerror = () => {
      setFileError('Error reading file');
      setFileLoading(false);
    };

    if (file.name.endsWith('.csv')) {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  }, []);

  const handleProcessAI = useCallback(async () => {
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) {
      setAiResponse('Error: Please enter a command');
      return;
    }
    
    if (!selectedFile || fileData.length === 0) {
      setAiResponse('Error: Please select a file first');
      return;
    }

    // Validate prompt length and content
    if (trimmedPrompt.length > 500) {
      setAiResponse('Error: Command too long. Maximum 500 characters.');
      return;
    }
    
    setIsProcessing(true);
    setAiResponse('');
    
    try {
      const result = await bedrockService.processExcelData(
        fileData,
        trimmedPrompt,
        selectedFile.name
      );
      
      if (result.success) {
        if (result.structured && result.structured.operation) {
          const { operation, result: opResult, explanation, formulas, formatting } = result.structured;
          
          let displayResponse = `**${explanation || 'Operation completed'}**\n\n`;
          
          if (['sort', 'filter', 'calculate', 'edit', 'formula'].includes(operation)) {
            if (Array.isArray(opResult) && opResult.length > 0) {
              console.log('Updating fileData with:', opResult);
              // Force React to detect the change by creating new array reference
              setFileData([...opResult]);
              setLastUpdate(Date.now());
              setDataKey(`data-${Date.now()}-${Math.random()}`);
              displayResponse += `✅ Data has been updated and is displayed above.`;
            } else {
              displayResponse += String(opResult).substring(0, 1000);
            }
          } else if (operation === 'pivot') {
            displayResponse += String(opResult).substring(0, 1000);
            if (result.structured.pivotSummary) {
              displayResponse += `\n\n**Pivot Analysis:**\n${String(result.structured.pivotSummary).substring(0, 500)}`;
            }
          } else if (operation === 'lookup') {
            displayResponse += String(opResult).substring(0, 1000);
            if (result.structured.lookupResults) {
              displayResponse += `\n\n**Lookup Results:**\n${String(result.structured.lookupResults).substring(0, 500)}`;
            }
          } else if (operation === 'chart') {
            displayResponse += String(opResult).substring(0, 1000);
            if (result.structured.chartData) {
              displayResponse += `\n\n**Chart Data:**\n${String(result.structured.chartData).substring(0, 500)}`;
            }
          } else if (operation === 'analytics') {
            displayResponse += String(opResult).substring(0, 1000);
            if (result.structured.analytics) {
              displayResponse += `\n\n**Analytics Results:**\n${String(result.structured.analytics).substring(0, 500)}`;
            }
          } else {
            displayResponse += String(opResult).substring(0, 1000);
          }
          
          if (formulas && Array.isArray(formulas) && formulas.length > 0) {
            displayResponse += `\n\n**📊 Formulas:**\n${formulas.slice(0, 5).join('\n')}`;
          }
          
          if (formatting) {
            displayResponse += `\n\n**🎨 Formatting:**\n${String(formatting).substring(0, 300)}`;
          }
          
          setAiResponse(displayResponse);
        } else {
          setAiResponse(String(result.response || 'No response').substring(0, 2000));
        }
      } else {
        setAiResponse(`Error: ${result.error || 'Unknown error occurred'}`);
      }
    } catch (error) {
      console.error('AI processing error:', error);
      setAiResponse(`Error: ${error instanceof Error ? error.message : 'Failed to process request'}`);
    } finally {
      setIsProcessing(false);
    }
  }, [prompt, selectedFile, fileData]);

  // Memoize file display data for performance
  const displayData = useMemo(() => {
    return fileData.slice(0, 100); // Only display first 100 rows
  }, [fileData, lastUpdate]);

  return (
    <ErrorBoundary>
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
              disabled={fileLoading}
              style={{ 
                padding: '12px 20px',
                border: '2px dashed #667eea',
                borderRadius: '8px',
                background: fileLoading ? '#f0f0f0' : '#f8f9ff',
                cursor: fileLoading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                width: '100%',
                maxWidth: '400px'
              }} 
            />
            {fileLoading && (
              <div style={{ marginTop: '10px', color: '#667eea' }}>📁 Loading file...</div>
            )}
            {fileError && (
              <div style={{ marginTop: '10px', color: '#e53e3e', fontSize: '14px' }}>
                ⚠️ {fileError}
              </div>
            )}
          </div>
          
          {selectedFile && (
            <div style={{ marginBottom: '20px', padding: '15px', background: '#f0f8ff', border: '1px solid #0078d4', borderRadius: '4px' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#0078d4' }}>Selected File: {selectedFile.name}</h4>
              <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>Size: {(selectedFile.size / 1024).toFixed(2)} KB</p>
            </div>
          )}
          
          {fileData.length > 0 && (
            <div key={dataKey} style={{ 
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
                <table key={`${dataKey}-table`} style={{ 
                  width: '100%', 
                  borderCollapse: 'collapse',
                  fontSize: '14px'
                }}>
                  <tbody>
                    {displayData.map((row, i) => (
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
              onChange={(e) => setPrompt(e.target.value.substring(0, 500))}
              placeholder="Type your AI command here... (e.g., 'Sort by age', 'Calculate average', 'Filter by city')"
              maxLength={500}
              style={{ 
                width: '100%', 
                height: '120px', 
                padding: '16px', 
                border: '2px solid #eee', 
                borderRadius: '8px', 
                marginBottom: '10px', 
                resize: 'vertical',
                fontSize: '14px',
                fontFamily: 'inherit'
              }}
            />
            <div style={{ 
              fontSize: '12px', 
              color: '#666', 
              marginBottom: '20px',
              textAlign: 'right'
            }}>
              {prompt.length}/500 characters
            </div>
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
      </main>
    </div>
    </ErrorBoundary>
  );
}