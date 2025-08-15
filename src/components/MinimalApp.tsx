import { useState } from 'react';
import * as XLSX from 'xlsx';
import logo from '../assets/logo.png';
import bedrockService from '../services/bedrockService';
import ErrorBoundary from './ErrorBoundary';

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
  const [fileLoading, setFileLoading] = useState(false);
  const [fileError, setFileError] = useState<string>('');
  const [showUseResultButton, setShowUseResultButton] = useState(false);
  const [lastAiResult, setLastAiResult] = useState<any[][]>([]);
  const [originalFileData, setOriginalFileData] = useState<any[][]>([]);
  const [selectedCells, setSelectedCells] = useState<string[]>([]);
  const [cellFormatting, setCellFormatting] = useState<{ [key: string]: any }>({});

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileError('');
    setFileLoading(true);
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

        if (parsedData.length > 1000) {
          parsedData = parsedData.slice(0, 1000);
          setFileError('File truncated to 1000 rows for performance');
        }

        setFileData(parsedData);
        setOriginalFileData([...parsedData]);
      } catch (error) {
        setFileError('Error reading file. Please ensure it is a valid Excel or CSV file.');
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
  };

  const handleColumnSum = (prompt: string, data: any[][]) => {
    const columnMatch = prompt.match(/sum\s+(?:of\s+)?column\s+([A-Z])/i);
    if (!columnMatch || !data || data.length <= 1) return null;
    
    const colLetter = columnMatch[1].toUpperCase();
    const colIndex = colLetter.charCodeAt(0) - 65;
    
    if (colIndex < 0 || colIndex >= (data[0]?.length || 0)) {
      return `<strong>Error:</strong> Column ${colLetter} does not exist`;
    }
    
    const columnName = data[0][colIndex] || `Column ${colLetter}`;
    let sum = 0;
    let count = 0;
    
    for (let i = 1; i < data.length; i++) {
      const cellValue = data[i][colIndex];
      const numValue = parseFloat(String(cellValue));
      if (!isNaN(numValue)) {
        sum += numValue;
        count++;
      }
    }
    
    if (count === 0) {
      return `<strong>Column ${colLetter} Sum:</strong><br><br>No numeric values found in column ${colLetter} (${columnName})`;
    }
    
    return `<strong>Column ${colLetter} Sum Result:</strong><br><br>Sum of ${columnName}: <strong>${sum.toLocaleString()}</strong><br>Cells processed: ${count}`;
  };

  const handleCellOperations = (prompt: string, data: any[][]) => {
    const cellAddMatch = prompt.match(/([A-Z])(\d+)\s*\+\s*([A-Z])(\d+)/i);
    if (!cellAddMatch || !data || data.length === 0) return null;
    
    const [, col1, row1, col2, row2] = cellAddMatch;
    const colIndex1 = col1.charCodeAt(0) - 65;
    const colIndex2 = col2.charCodeAt(0) - 65;
    const rowIndex1 = parseInt(row1) - 1;
    const rowIndex2 = parseInt(row2) - 1;
    
    if (rowIndex1 >= 0 && rowIndex1 < data.length && colIndex1 >= 0 && colIndex1 < (data[rowIndex1]?.length || 0) &&
        rowIndex2 >= 0 && rowIndex2 < data.length && colIndex2 >= 0 && colIndex2 < (data[rowIndex2]?.length || 0)) {
      
      const val1 = parseFloat(String(data[rowIndex1][colIndex1]));
      const val2 = parseFloat(String(data[rowIndex2][colIndex2]));
      
      if (!isNaN(val1) && !isNaN(val2)) {
        const result = val1 + val2;
        return `<strong>Cell Addition Result:</strong><br><br>${col1}${row1} (${val1}) + ${col2}${row2} (${val2}) = <strong>${result}</strong>`;
      }
    }
    
    return `<strong>Error:</strong> Could not find numeric values in specified cells`;
  };

  const handleProcessAI = async () => {
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt || !selectedFile || fileData.length === 0) {
      setAiResponse('Error: Please enter a command and select a file first');
      return;
    }
    
    // Handle local operations first
    const columnSumResult = handleColumnSum(trimmedPrompt, fileData);
    if (columnSumResult) {
      setAiResponse(columnSumResult);
      setPrompt('');
      return;
    }

    const cellOperationResult = handleCellOperations(trimmedPrompt, fileData);
    if (cellOperationResult) {
      setAiResponse(cellOperationResult);
      setPrompt('');
      return;
    }

    // Handle specific data queries (show X for Y)
    if (trimmedPrompt.toLowerCase().includes('show') && (trimmedPrompt.toLowerCase().includes('for') || trimmedPrompt.toLowerCase().includes('of'))) {
      const headers = fileData[0];
      const lowerPrompt = trimmedPrompt.toLowerCase();
      
      // Find requested columns
      const requestedColumns: number[] = [];
      headers.forEach((header, index) => {
        if (lowerPrompt.includes(String(header).toLowerCase())) {
          requestedColumns.push(index);
        }
      });
      
      // Find items to search for
      const searchTerms: string[] = [];
      const words = trimmedPrompt.split(/\s+/);
      let foundFor = false;
      words.forEach(word => {
        if (word.toLowerCase() === 'for' || word.toLowerCase() === 'of') {
          foundFor = true;
        } else if (foundFor && word.length > 2) {
          searchTerms.push(word.replace(/[,\s]+$/, ''));
        }
      });
      
      if (requestedColumns.length > 0 && searchTerms.length > 0) {
        const matches: any[][] = [];
        
        for (let i = 1; i < fileData.length; i++) {
          const row = fileData[i];
          for (const searchTerm of searchTerms) {
            for (let j = 0; j < row.length; j++) {
              const cellValue = String(row[j] || '').toLowerCase();
              if (cellValue.includes(searchTerm.toLowerCase())) {
                matches.push(row);
                break;
              }
            }
          }
        }
        
        if (matches.length > 0) {
          let response = `<strong>Results for ${searchTerms.join(', ')}:</strong><br><br>`;
          matches.forEach((row, index) => {
            const itemName = row[0] || `Item ${index + 1}`;
            response += `<strong>${itemName}:</strong><br>`;
            requestedColumns.forEach(colIndex => {
              response += `${headers[colIndex]}: ${row[colIndex] || 'N/A'}<br>`;
            });
            response += '<br>';
          });
          setAiResponse(response);
        } else {
          setAiResponse(`<strong>No matches found for ${searchTerms.join(', ')}</strong>`);
        }
        setPrompt('');
        return;
      }
    }

    // Handle lookup
    if (trimmedPrompt.toLowerCase().includes('lookup') || trimmedPrompt.toLowerCase().includes('find')) {
      const searchTerm = trimmedPrompt.replace(/lookup|find/gi, '').trim().replace(/['"`]/g, '');
      if (searchTerm) {
        const matches: any[][] = [];
        const headers = fileData[0];
        
        for (let i = 1; i < fileData.length; i++) {
          const row = fileData[i];
          for (let j = 0; j < row.length; j++) {
            const cellValue = String(row[j] || '').toLowerCase();
            if (cellValue.includes(searchTerm.toLowerCase())) {
              matches.push(row);
              break;
            }
          }
        }
        
        if (matches.length > 0) {
          let response = `<strong>Lookup results for '${searchTerm}' - Found ${matches.length} matches:</strong><br><br>`;
          matches.slice(0, 10).forEach((row, index) => {
            response += `<strong>Match ${index + 1}:</strong><br>`;
            headers.forEach((header, i) => {
              response += `${header}: ${row[i] || 'N/A'}<br>`;
            });
            response += '<br>';
          });
          if (matches.length > 10) {
            response += `<em>... and ${matches.length - 10} more matches</em>`;
          }
          setAiResponse(response);
        } else {
          setAiResponse(`<strong>No matches found for '${searchTerm}'</strong>`);
        }
        setPrompt('');
        return;
      }
    }

    // Handle sorting
    if (trimmedPrompt.toLowerCase().includes('sort')) {
      const sortedData = [...fileData];
      const headers = sortedData[0];
      const dataRows = sortedData.slice(1);
      
      // Find column to sort by
      let sortColumnIndex = 0;
      let sortColumnName = headers[0];
      
      // Check for column letter (A, B, C) or column reference (A1, B1, C1)
      const colLetterMatch = trimmedPrompt.match(/\b([A-Z])(?:1)?\b/i);
      if (colLetterMatch) {
        const colIndex = colLetterMatch[1].toUpperCase().charCodeAt(0) - 65;
        if (colIndex >= 0 && colIndex < headers.length) {
          sortColumnIndex = colIndex;
          sortColumnName = headers[colIndex];
        }
      } else {
        // Check if specific column name mentioned
        for (let i = 0; i < headers.length; i++) {
          const headerName = String(headers[i] || '').toLowerCase();
          if (trimmedPrompt.toLowerCase().includes(headerName)) {
            sortColumnIndex = i;
            sortColumnName = headers[i];
            break;
          }
        }
      }
      
      dataRows.sort((a, b) => {
        const aVal = String(a[sortColumnIndex] || '').toLowerCase();
        const bVal = String(b[sortColumnIndex] || '').toLowerCase();
        
        // Try numeric sort first
        const aNum = parseFloat(aVal);
        const bNum = parseFloat(bVal);
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return aNum - bNum;
        }
        
        // Fall back to alphabetical
        return aVal.localeCompare(bVal);
      });
      
      const result = [headers, ...dataRows];
      setLastAiResult(result);
      setShowUseResultButton(true);
      setAiResponse(`<strong>Data sorted successfully!</strong><br><br>Data has been sorted by ${sortColumnName}. Click "Apply to Main Sheet" to use the sorted data.`);
      setPrompt('');
      return;
    }
    
    setIsProcessing(true);
    setAiResponse('');
    
    try {
      const result = await bedrockService.processExcelData(fileData, trimmedPrompt, selectedFile.name);
      if (result.success) {
        setAiResponse(result.response || 'Processing completed');
      } else {
        setAiResponse(`Error: ${result.error || 'Unknown error occurred'}`);
      }
    } catch (error) {
      setAiResponse(`Error: ${error instanceof Error ? error.message : 'Failed to process request'}`);
    } finally {
      setIsProcessing(false);
      setPrompt('');
    }
  };

  const applyChangesToMainSheet = () => {
    if (lastAiResult.length > 0) {
      setFileData([...lastAiResult]);
      setShowUseResultButton(false);
      setAiResponse(prev => prev + '<br><br><p style="color: #10b981; font-weight: bold;">✅ Changes applied to main sheet!</p>');
    }
  };

  const resetToOriginal = () => {
    if (originalFileData.length > 0) {
      setFileData([...originalFileData]);
      setShowUseResultButton(false);
      setAiResponse('');
    }
  };

  return (
    <ErrorBoundary>
      <div style={{ minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
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
            <span style={{ fontSize: '16px', fontWeight: '600' }}>Excel AI</span>
          </div>
          <button onClick={onLogout} style={{ 
            background: 'rgba(255,255,255,0.2)', 
            border: 'none', 
            color: 'white', 
            padding: '6px 12px', 
            borderRadius: '4px', 
            cursor: 'pointer'
          }}>
            Logout
          </button>
        </header>
        
        <main style={{ padding: '20px', background: '#f5f5f5', minHeight: 'calc(100vh - 50px)' }}>
          {/* File Upload */}
          <div style={{ background: 'white', borderRadius: '8px', padding: '20px', marginBottom: '20px', color: '#333' }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>Upload File</h3>
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
                color: '#333'
              }}
            />
            {fileLoading && <div style={{ marginTop: '10px', color: '#0078d4', fontWeight: 'bold' }}>Loading...</div>}
            {fileError && <div style={{ marginTop: '10px', color: '#e53e3e', fontSize: '12px', fontWeight: 'bold' }}>{fileError}</div>}
          </div>

          {/* AI Command */}
          <div style={{ background: 'white', borderRadius: '8px', padding: '20px', marginBottom: '20px', color: '#333' }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>Ask AI</h3>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input 
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (!isProcessing && selectedFile && prompt.trim()) {
                      handleProcessAI();
                    }
                  }
                }}
                placeholder="Ask about your data..."
                style={{ 
                  flex: 1, 
                  padding: '12px', 
                  border: '1px solid #ddd', 
                  borderRadius: '6px',
                  color: '#333',
                  backgroundColor: '#ffffff'
                }}
              />
              <button 
                onClick={handleProcessAI}
                disabled={isProcessing || !selectedFile || !prompt.trim()}
                style={{ 
                  background: '#0078d4',
                  color: 'white',
                  border: 'none',
                  padding: '12px 20px',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                {isProcessing ? 'Processing...' : 'Submit'}
              </button>
            </div>
          </div>

          {/* Formatting Toolbar */}
          {fileData.length > 0 && (
            <div style={{ background: '#f8f9fa', padding: '10px', marginBottom: '20px', borderRadius: '6px' }}>
              <button 
                onClick={() => {
                  if (selectedCells.length === 0) return;
                  const newFormatting = { ...cellFormatting };
                  selectedCells.forEach(cellId => {
                    newFormatting[cellId] = { ...newFormatting[cellId], fontWeight: 'bold' };
                  });
                  setCellFormatting(newFormatting);
                }}
                style={{ 
                  background: '#0078d4', color: 'white', border: 'none', 
                  padding: '8px 12px', borderRadius: '4px', marginRight: '10px', cursor: 'pointer'
                }}
              >
                <strong>B</strong>
              </button>
              <button 
                onClick={() => {
                  if (selectedCells.length === 0) return;
                  const newFormatting = { ...cellFormatting };
                  selectedCells.forEach(cellId => {
                    newFormatting[cellId] = { ...newFormatting[cellId], fontStyle: 'italic' };
                  });
                  setCellFormatting(newFormatting);
                }}
                style={{ 
                  background: '#0078d4', color: 'white', border: 'none', 
                  padding: '8px 12px', borderRadius: '4px', marginRight: '10px', cursor: 'pointer'
                }}
              >
                <em>I</em>
              </button>
            </div>
          )}

          {/* File Data */}
          {fileData.length > 0 && (
            <div style={{ background: 'white', borderRadius: '8px', marginBottom: '20px', overflow: 'hidden' }}>
              <div style={{ padding: '15px', background: '#0078d4', color: 'white' }}>
                <h3 style={{ margin: 0, fontSize: '16px' }}>{selectedFile?.name}</h3>
                <p style={{ margin: '5px 0 0 0', fontSize: '12px', opacity: 0.9 }}>
                  {fileData.length} rows × {fileData[0]?.length || 0} columns
                </p>
              </div>
              <div style={{ maxHeight: '400px', overflow: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#e6f3ff', borderBottom: '2px solid #0078d4' }}>
                      <th style={{ padding: '8px', fontSize: '11px', fontWeight: 'bold', color: '#0078d4', border: '1px solid #ddd' }}>#</th>
                      {fileData[0] && fileData[0].map((_, colIndex) => (
                        <th key={colIndex} style={{ padding: '8px', fontSize: '11px', fontWeight: 'bold', color: '#0078d4', border: '1px solid #ddd' }}>
                          {String.fromCharCode(65 + colIndex)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {fileData.map((row, i) => (
                      <tr key={i}>
                        <td style={{ 
                          padding: '8px', 
                          borderRight: '1px solid #eee',
                          fontWeight: 'bold',
                          fontSize: '11px',
                          color: '#0078d4',
                          background: '#f8f9ff',
                          textAlign: 'center'
                        }}>
                          {i + 1}
                        </td>
                        {Array.isArray(row) && row.length > 0 ? row.map((cell, j) => (
                          <td 
                            key={j}
                            onClick={() => {
                              const cellId = `${i}-${j}`;
                              if (selectedCells.includes(cellId)) {
                                setSelectedCells(selectedCells.filter(id => id !== cellId));
                              } else {
                                setSelectedCells([...selectedCells, cellId]);
                              }
                            }}
                            style={{ 
                              padding: '8px', 
                              borderRight: '1px solid #eee',
                              fontWeight: i === 0 ? 'bold' : 'normal',
                              color: '#333',
                              cursor: 'pointer',
                              backgroundColor: selectedCells.includes(`${i}-${j}`) ? '#cce7ff' : 
                                              (i % 2 === 0 ? '#fafafa' : 'white'),
                              ...cellFormatting[`${i}-${j}`]
                            }}
                          >
                            {String(cell || '')}
                          </td>
                        )) : (
                          <td style={{ padding: '8px', color: '#666', fontStyle: 'italic' }}>No data</td>
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
            <div style={{ background: 'white', borderRadius: '8px', padding: '20px', color: '#333' }}>
              {showUseResultButton && (
                <div style={{ marginBottom: '15px', padding: '10px', background: '#f0f8ff', borderRadius: '4px', border: '1px solid #0078d4' }}>
                  <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#333' }}>
                    📊 <strong>Results ready!</strong> Choose an action:
                  </p>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                      onClick={applyChangesToMainSheet}
                      style={{ background: '#10b981', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      📋 Apply to Main Sheet
                    </button>
                    <button 
                      onClick={resetToOriginal}
                      style={{ background: '#6c757d', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      🔄 Reset to Original
                    </button>
                  </div>
                </div>
              )}
              <h4 style={{ margin: '0 0 15px 0', color: '#333' }}>AI Response</h4>
              <div style={{ 
                background: '#f8f9ff', 
                padding: '15px', 
                borderRadius: '6px', 
                border: '1px solid #e6f2fa',
                color: '#333'
              }}>
                <div dangerouslySetInnerHTML={{ __html: aiResponse.replace(/\n/g, '<br>') }} />
              </div>
            </div>
          )}
        </main>
      </div>
    </ErrorBoundary>
  );
}