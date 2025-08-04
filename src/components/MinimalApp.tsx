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
    
    // Force a small delay to ensure state is clean
    await new Promise(resolve => setTimeout(resolve, 100));
    
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
              console.log('Showing processed data in response:', opResult.length, 'rows');
              
              // Store result for "Use this result" functionality
              setLastAiResult([...opResult]);
              setShowUseResultButton(true);
              
              // Display processed data as a table in the response
              let tableHtml = '<div style="max-height: 400px; overflow: auto; border: 1px solid #ddd; border-radius: 4px; margin: 10px 0;"><table style="width: 100%; border-collapse: collapse; font-size: 12px;">';
              
              opResult.slice(0, 50).forEach((row, i) => {
                const isHeader = i === 0;
                tableHtml += `<tr style="background: ${isHeader ? '#f0f8ff' : (i % 2 === 0 ? '#fafafa' : 'white')}; border-bottom: 1px solid #eee;">`;
                row.forEach(cell => {
                  tableHtml += `<td style="padding: 8px; border-right: 1px solid #eee; font-weight: ${isHeader ? 'bold' : 'normal'}; white-space: nowrap;">${String(cell || '')}</td>`;
                });
                tableHtml += '</tr>';
              });
              
              tableHtml += '</table></div>';
              
              if (opResult.length > 50) {
                tableHtml += `<p style="color: #666; font-size: 12px; margin: 5px 0;">Showing first 50 rows of ${opResult.length} total rows</p>`;
              }
              
              displayResponse += `✅ **Processed Data:**\n\n${tableHtml}\n\n**Click "Use This Result" below to replace your main data with this result.**`;
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
      // Clear the prompt for next request
      setPrompt('');
    }
  }, [prompt, selectedFile, fileData]);

  const handleFormatChange = useCallback((format: FormatStyle) => {
    const newFormatting = { ...cellFormatting };
    selectedCells.forEach(cellKey => {
      newFormatting[cellKey] = { ...newFormatting[cellKey], ...format };
    });
    setCellFormatting(newFormatting);
    setDataKey(`formatted-${Date.now()}`);
  }, [cellFormatting, selectedCells]);

  const handleClearFormat = useCallback(() => {
    const newFormatting = { ...cellFormatting };
    selectedCells.forEach(cellKey => {
      delete newFormatting[cellKey];
    });
    setCellFormatting(newFormatting);
    setSelectedCells([]);
    setDataKey(`cleared-${Date.now()}`);
  }, [cellFormatting, selectedCells]);

  const handleCellClick = useCallback((rowIndex: number, colIndex: number, event: React.MouseEvent) => {
    const cellKey = `${rowIndex}-${colIndex}`;
    
    if (event.ctrlKey || event.metaKey) {
      // Multi-select with Ctrl/Cmd
      setSelectedCells(prev => 
        prev.includes(cellKey) 
          ? prev.filter(key => key !== cellKey)
          : [...prev, cellKey]
      );
    } else {
      // Single select
      setSelectedCells([cellKey]);
    }
  }, []);

  const handleUseAiResult = useCallback(() => {
    if (lastAiResult.length > 0) {
      setFileData([...lastAiResult]);
      setDataKey(`ai-result-${Date.now()}`);
      setShowUseResultButton(false);
      setCellFormatting({}); // Clear formatting when using new data
      setSelectedCells([]);
    }
  }, [lastAiResult]);

  const handleDownloadExcel = useCallback(() => {
    const success = downloadFormattedExcel(fileData, cellFormatting, selectedFile?.name || 'data');
    if (success) {
      alert('Excel file downloaded successfully!');
    } else {
      alert('Error downloading Excel file. Please try again.');
    }
  }, [fileData, cellFormatting, selectedFile]);

  const handleDownloadCSV = useCallback(() => {
    const success = downloadCSV(fileData, selectedFile?.name || 'data');
    if (success) {
      alert('CSV file downloaded successfully!');
    } else {
      alert('Error downloading CSV file. Please try again.');
    }
  }, [fileData, selectedFile]);

  // Memoize file display data for performance
  const displayData = useMemo(() => {
    console.log('DisplayData updating, fileData length:', fileData.length, 'dataKey:', dataKey);
    return fileData.slice(0, 100); // Only display first 100 rows
  }, [fileData, lastUpdate, dataKey]);

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
              {/* Formatting Toolbar */}
              <div style={{ padding: '20px 20px 0 20px' }}>
                <FormattingToolbar
                  onFormatChange={handleFormatChange}
                  onClearFormat={handleClearFormat}
                  selectedCells={selectedCells}
                />
              </div>
              <div style={{ 
                padding: '20px', 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px' }}>📊 {selectedFile?.name}</h3>
                  <p style={{ margin: '5px 0 0 0', opacity: 0.9, fontSize: '14px' }}>
                    {fileData.length} rows × {fileData[0]?.length || 0} columns
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={handleDownloadExcel}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      border: '1px solid rgba(255,255,255,0.3)',
                      color: 'white',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    📥 Download Excel
                  </button>
                  <button
                    onClick={handleDownloadCSV}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      border: '1px solid rgba(255,255,255,0.3)',
                      color: 'white',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    📥 Download CSV
                  </button>
                </div>
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
                        {Array.isArray(row) && row.length > 0 ? row.map((cell, j) => {
                          const cellKey = `${i}-${j}`;
                          const isSelected = selectedCells.includes(cellKey);
                          const cellFormat = cellFormatting[cellKey] || {};
                          
                          return (
                            <td 
                              key={j} 
                              onClick={(e) => handleCellClick(i, j, e)}
                              style={{ 
                                padding: '12px 16px', 
                                borderRight: '1px solid #eee',
                                fontWeight: cellFormat.fontWeight || (i === 0 ? 'bold' : 'normal'),
                                fontStyle: cellFormat.fontStyle || 'normal',
                                color: cellFormat.color || (i === 0 ? '#333' : '#666'),
                                backgroundColor: isSelected 
                                  ? '#e3f2fd' 
                                  : cellFormat.backgroundColor || 'transparent',
                                textAlign: cellFormat.textAlign as any || 'left',
                                fontSize: cellFormat.fontSize || '14px',
                                minWidth: '120px',
                                whiteSpace: 'nowrap',
                                cursor: 'pointer',
                                userSelect: 'none',
                                border: isSelected ? '2px solid #2196f3' : '1px solid #eee'
                              }}
                            >
                              {cell !== null && cell !== undefined ? String(cell) : ''}
                            </td>
                          );
                        }) : (
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
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ fontSize: '32px', marginRight: '15px' }}>💡</div>
                  <h4 style={{ color: '#333', margin: 0, fontSize: '20px' }}>AI Response</h4>
                </div>
                {showUseResultButton && (
                  <button
                    onClick={handleUseAiResult}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#4caf50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 'bold'
                    }}
                  >
                    ✅ Use This Result
                  </button>
                )}
              </div>
              <div style={{ 
                fontSize: '15px', 
                lineHeight: '1.6',
                color: '#555',
                background: '#f8f9ff',
                padding: '20px',
                borderRadius: '8px',
                border: '1px solid #e6f2fa'
              }}>
                <div 
                  style={{ whiteSpace: 'pre-wrap' }}
                  dangerouslySetInnerHTML={{ 
                    __html: aiResponse.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
                  }} 
                />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
    </ErrorBoundary>
  );
}