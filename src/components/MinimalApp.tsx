import { useState, useCallback, useMemo } from 'react';
import * as XLSX from 'xlsx';
import logo from '../assets/logo.png';
import bedrockService from '../services/bedrockService';
import ErrorBoundary from './ErrorBoundary';
import FormattingToolbar, { FormatStyle } from './FormattingToolbar';
import { downloadFormattedExcel, downloadCSV } from '../utils/excelExport';

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
  trialStatus?: any;
  onTrialRefresh?: () => void;
}

export default function MinimalApp({ user, onLogout }: MinimalAppProps) {
  const [prompt, setPrompt] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileData, setFileData] = useState<any[][]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiResponse, setAiResponse] = useState<string>('');
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());
  const [dataKey, setDataKey] = useState<string>('initial');
  const [cellFormatting, setCellFormatting] = useState<{ [key: string]: FormatStyle }>({});
  const [selectedCells, setSelectedCells] = useState<string[]>([]);

  const [fileLoading, setFileLoading] = useState(false);
  const [fileError, setFileError] = useState<string>('');
  const [showUseResultButton, setShowUseResultButton] = useState(false);
  const [lastAiResult, setLastAiResult] = useState<any[][]>([]);
  const [showFileInfo, setShowFileInfo] = useState(true);

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
        setShowFileInfo(true);
        
        // Auto-hide file info after 10 seconds
        setTimeout(() => {
          setShowFileInfo(false);
        }, 10000);
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
    
    // Force a small delay to ensure state is clean
    await new Promise(resolve => setTimeout(resolve, 100));
    
    try {
      const result = await bedrockService.processExcelData(
        fileData,
        trimmedPrompt,
        selectedFile.name
      );
      
      if (result.success) {
        setAiResponse(String(result.response || 'Processing completed').substring(0, 2000));
      } else {
        setAiResponse(`Error: ${result.error || 'Unknown error occurred'}`);
      }
    } catch (error) {
      console.error('AI processing error:', error);
      setAiResponse(`Error: ${error instanceof Error ? error.message : 'Failed to process request'}`);
    } finally {
      setIsProcessing(false);
      setPrompt('');
    }
  }, [prompt, selectedFile, fileData]);

  // Memoize file display data for performance
  const displayData = useMemo(() => {
    return fileData.slice(0, 50); // Only display first 50 rows on mobile
  }, [fileData, lastUpdate, dataKey]);

  return (
    <ErrorBoundary>
    <div style={{ minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      {/* Simple Mobile Header */}
      <header style={{ 
        background: '#0078d4', 
        color: 'white', 
        padding: '10px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src={logo} alt="Logo" style={{ height: '24px' }} />
          <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Excel AI</span>
        </div>
        <button onClick={onLogout} style={{ 
          background: 'rgba(255,255,255,0.2)', 
          border: 'none', 
          color: 'white', 
          padding: '6px 12px', 
          borderRadius: '4px', 
          cursor: 'pointer',
          fontSize: '12px'
        }}>
          Logout
        </button>
      </header>
      
      {/* Main Content - Mobile First */}
      <main style={{ padding: '15px', background: '#f5f5f5', minHeight: 'calc(100vh - 50px)' }}>
        {/* File Upload */}
        <div style={{
          background: 'white',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '15px',
          textAlign: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', marginBottom: '15px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="14,2 14,8 20,8" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <h3 style={{ margin: 0, fontSize: '18px' }}>Upload File</h3>
          </div>
          <input 
            type="file" 
            accept=".xlsx,.xls,.csv" 
            onChange={handleFileUpload}
            disabled={fileLoading}
            style={{ 
              width: '100%',
              padding: '12px',
              border: '2px dashed #0078d4',
              borderRadius: '6px',
              background: '#f8f9ff',
              fontSize: '14px'
            }} 
          />
          {fileLoading && <div style={{ marginTop: '10px', color: '#0078d4' }}>Loading...</div>}
          {fileError && <div style={{ marginTop: '10px', color: '#e53e3e', fontSize: '12px' }}>{fileError}</div>}
        </div>

        {/* AI Command */}
        <div style={{
          background: 'white',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '15px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <h3 style={{ margin: 0, fontSize: '18px' }}>Ask AI</h3>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input 
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask about your data..."
              style={{ 
                flex: 1,
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
            <button 
              onClick={handleProcessAI}
              disabled={isProcessing || !selectedFile || !prompt.trim()}
              style={{ 
                background: '#0078d4',
                color: 'white',
                border: 'none',
                padding: '12px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {isProcessing ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2V6" stroke="white" strokeWidth="2" strokeLinecap="round">
                    <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
                  </path>
                  <path d="M12 18V22" stroke="white" strokeWidth="2" strokeLinecap="round">
                    <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
                  </path>
                  <path d="M4.93 4.93L7.76 7.76" stroke="white" strokeWidth="2" strokeLinecap="round">
                    <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
                  </path>
                  <path d="M16.24 16.24L19.07 19.07" stroke="white" strokeWidth="2" strokeLinecap="round">
                    <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
                  </path>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="11" cy="11" r="8" stroke="white" strokeWidth="2"/>
                  <path d="M21 21L16.65 16.65" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )
            </button>
          </div>
        </div>
        
        {/* File Data */}
        {fileData.length > 0 && (
          <div style={{ 
            background: 'white',
            borderRadius: '8px',
            marginBottom: '15px',
            overflow: 'hidden'
          }}>
            <div style={{ 
              padding: '15px', 
              background: '#0078d4',
              color: 'white'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 3V21H21V9L15 3H3Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 9H15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 13H15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 17H13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <h3 style={{ margin: 0, fontSize: '16px' }}>{selectedFile?.name}</h3>
              </div>
              <p style={{ margin: '5px 0 0 0', fontSize: '12px', opacity: 0.9 }}>
                {fileData.length} rows × {fileData[0]?.length || 0} columns
              </p>
            </div>
            <div style={{ 
              maxHeight: '300px', 
              overflow: 'auto',
              fontSize: '12px'
            }}>
              <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse'
              }}>
                <tbody>
                  {displayData.map((row, i) => (
                    <tr key={i} style={{ 
                      background: i === 0 ? '#f0f8ff' : (i % 2 === 0 ? '#fafafa' : 'white'),
                      borderBottom: '1px solid #eee'
                    }}>
                      {Array.isArray(row) && row.length > 0 ? row.slice(0, 4).map((cell, j) => (
                        <td key={j} style={{ 
                          padding: '8px', 
                          borderRight: '1px solid #eee',
                          fontWeight: i === 0 ? 'bold' : 'normal',
                          maxWidth: '80px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          color: '#333'
                        }}>
                          {cell !== null && cell !== undefined ? String(cell) : ''}
                        </td>
                      )) : (
                        <td style={{ padding: '8px', color: '#999', fontStyle: 'italic' }}>
                          No data
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* AI Response */}
        {aiResponse && (
          <div style={{ 
            background: 'white',
            borderRadius: '8px',
            padding: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="5" stroke="#333" strokeWidth="2"/>
                <line x1="12" y1="1" x2="12" y2="3" stroke="#333" strokeWidth="2"/>
                <line x1="12" y1="21" x2="12" y2="23" stroke="#333" strokeWidth="2"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="#333" strokeWidth="2"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="#333" strokeWidth="2"/>
                <line x1="1" y1="12" x2="3" y2="12" stroke="#333" strokeWidth="2"/>
                <line x1="21" y1="12" x2="23" y2="12" stroke="#333" strokeWidth="2"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="#333" strokeWidth="2"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="#333" strokeWidth="2"/>
              </svg>
              <h4 style={{ margin: 0, fontSize: '16px' }}>AI Response</h4>
            </div>
            <div style={{ 
              fontSize: '14px', 
              lineHeight: '1.5',
              background: '#f8f9ff',
              padding: '15px',
              borderRadius: '6px',
              border: '1px solid #e6f2fa'
            }}>
              {aiResponse}
            </div>
          </div>
        )}
      </main>
    </div>
    </ErrorBoundary>
  );
}