import { useState, useRef, useEffect } from 'react';
import { DataDetectionService } from '../services/dataDetectionService';
import { EnhancedAiService } from '../services/enhancedAiService';
import { AWSService } from '../services/awsService.js';
import ChartComponent from './ChartComponent';
import ModernDataInsights from './ModernDataInsights';
import * as XLSX from 'xlsx';

interface User {
  email: string;
  name: string;
}

interface ModernWorkspaceProps {
  user: User;
  onLogout: () => void;
}

export default function ModernWorkspace({ user, onLogout }: ModernWorkspaceProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [spreadsheetData, setSpreadsheetData] = useState<any[][]>([]);
  const [dataStructure, setDataStructure] = useState<any>(null);
  const [prompt, setPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string>('');
  const [aiResultData, setAiResultData] = useState<any[][] | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie'>('bar');
  const [sortColumn, setSortColumn] = useState<number>(-1);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filterText, setFilterText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    setSelectedFile(file);
    
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const data = evt.target?.result;
        if (!data) throw new Error('No data read from file');
        
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        
        setSpreadsheetData(jsonData);
        
        // Auto-analyze data structure
        try {
          const structure = DataDetectionService.analyzeData(jsonData);
          setDataStructure(structure);
        } catch (err) {
          console.error('Data analysis failed:', err);
        }
      } catch (err) {
        console.error('Failed to process file:', err);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleLocalLookup = (searchTerm: string) => {
    const headers = spreadsheetData[0];
    const dataRows = spreadsheetData.slice(1);
    
    const matches = dataRows.filter(row => 
      row.some(cell => 
        String(cell || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    
    if (matches.length > 0) {
      const resultData = [headers, ...matches];
      setAiResultData(resultData);
      setAiResponse(`🔍 Found ${matches.length} matches for '${searchTerm}':\n\nResults are displayed in the table below.`);
      return true;
    }
    return false;
  };

  const handleLocalMath = (formula: string) => {
    // Handle cell references like B3*E3, A1+B2, etc.
    const cellMathMatch = formula.match(/([A-Z])(\d+)\s*([+\-*/])\s*([A-Z])(\d+)/i);
    if (cellMathMatch) {
      const [, col1, row1, operator, col2, row2] = cellMathMatch;
      const colIndex1 = col1.charCodeAt(0) - 65;
      const colIndex2 = col2.charCodeAt(0) - 65;
      const rowIndex1 = parseInt(row1) - 1;
      const rowIndex2 = parseInt(row2) - 1;
      
      if (rowIndex1 >= 0 && rowIndex1 < spreadsheetData.length && 
          rowIndex2 >= 0 && rowIndex2 < spreadsheetData.length &&
          colIndex1 >= 0 && colIndex1 < (spreadsheetData[0]?.length || 0) &&
          colIndex2 >= 0 && colIndex2 < (spreadsheetData[0]?.length || 0)) {
        
        const val1 = parseFloat(String(spreadsheetData[rowIndex1][colIndex1]));
        const val2 = parseFloat(String(spreadsheetData[rowIndex2][colIndex2]));
        
        if (!isNaN(val1) && !isNaN(val2)) {
          let result;
          switch (operator) {
            case '+': result = val1 + val2; break;
            case '-': result = val1 - val2; break;
            case '*': result = val1 * val2; break;
            case '/': result = val2 !== 0 ? val1 / val2 : 'Error: Division by zero'; break;
          }
          setAiResponse(`${col1}${row1} ${operator} ${col2}${row2} = ${val1} ${operator} ${val2} = ${result}`);
          return true;
        }
      }
    }
    return false;
  };

  const handleRunAI = async () => {
    if (!prompt.trim() || !spreadsheetData.length) return;
    
    // Check for simple math operations first
    if (handleLocalMath(prompt.trim())) {
      setPrompt('');
      return;
    }
    
    // Check for simple lookup queries
    const lookupMatch = prompt.match(/(?:show|find|lookup|search)\s+(?:for\s+)?['"]?([^'"\s]+)['"]?/i);
    if (lookupMatch) {
      const searchTerm = lookupMatch[1];
      if (handleLocalLookup(searchTerm)) {
        setPrompt('');
        return;
      }
    }
    
    setAiLoading(true);
    try {
      const enhancedPrompt = dataStructure ? 
        EnhancedAiService.enhancePrompt(prompt, dataStructure) : 
        prompt;
      
      const result = selectedFile ? 
        await AWSService.uploadSpreadsheetWithPrompt(selectedFile, enhancedPrompt) :
        await AWSService.processPromptWithData(spreadsheetData, enhancedPrompt);
      
      if (result.data && Array.isArray(result.data)) {
        setAiResultData(result.data);
        setAiResponse('✅ Analysis completed! Results are displayed below.');
      } else if (result.result) {
        // Handle text-based results
        setAiResponse(result.result);
      } else {
        setAiResponse(result.response || result.error || 'Analysis completed successfully!');
      }
    } catch (err: any) {
      console.error('AI Processing Error:', err);
      setAiResponse(`❌ Error: ${err.message || 'Processing failed'}`);
    } finally {
      setAiLoading(false);
      if (!aiResultData) {
        setPrompt('');
      }
    }
  };

  const handleSort = (columnIndex: number) => {
    const newDirection = sortColumn === columnIndex && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortColumn(columnIndex);
    setSortDirection(newDirection);
    
    const sortedData = [...spreadsheetData];
    const headers = sortedData[0];
    const dataRows = sortedData.slice(1);
    
    dataRows.sort((a, b) => {
      const aVal = String(a[columnIndex] || '').toLowerCase();
      const bVal = String(b[columnIndex] || '').toLowerCase();
      
      const aNum = parseFloat(aVal);
      const bNum = parseFloat(bVal);
      
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return newDirection === 'asc' ? aNum - bNum : bNum - aNum;
      }
      
      return newDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    });
    
    setSpreadsheetData([headers, ...dataRows]);
  };

  const getFilteredData = () => {
    if (!filterText) return spreadsheetData;
    
    const headers = spreadsheetData[0];
    const filteredRows = spreadsheetData.slice(1).filter(row => 
      row.some(cell => 
        String(cell || '').toLowerCase().includes(filterText.toLowerCase())
      )
    );
    
    return [headers, ...filteredRows];
  };

  const downloadExcel = (data: any[][], filename: string) => {
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, filename);
  };

  const displayData = getFilteredData();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: '"Poppins", -apple-system, BlinkMacSystemFont, sans-serif',
      color: '#ffffff'
    }}>
      {/* Header */}
      <header style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        padding: '20px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <img src="/logo.png" alt="AdvExcel" style={{ height: '40px' }} />
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '600' }}>AdvExcel AI</h1>
            <p style={{ margin: 0, fontSize: '14px', opacity: 0.8 }}>Intelligent Data Analysis</p>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '14px'
          }}>
            Welcome, {user.name}
          </div>
          {(user.email === 'katragadda225@gmail.com' || user.email?.includes('@advexcel.online')) && (
            <button
              onClick={() => {
                localStorage.setItem('use_new_interface', 'false');
                window.location.reload();
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '25px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
              }}
            >
              Basic
            </button>
          )}
          <button
            onClick={onLogout}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '25px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ padding: '40px' }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr 2fr',
          gap: '40px',
          alignItems: 'start'
        }}>
          {/* Left Panel - Upload & AI */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            padding: '32px',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            {/* File Upload */}
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '600' }}>
                📁 Upload Your Data
              </h3>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                style={{ display: 'none' }}
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
              />
              
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: `2px dashed ${dragActive ? '#4ecdc4' : 'rgba(255, 255, 255, 0.3)'}`,
                  borderRadius: '16px',
                  padding: '40px 20px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  background: dragActive ? 'rgba(78, 205, 196, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>
                  {dragActive ? '📥' : '📊'}
                </div>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600' }}>
                  {dragActive ? 'Drop your file here' : 'Drag & drop or click to upload'}
                </h4>
                <p style={{ margin: 0, fontSize: '14px', opacity: 0.7 }}>
                  Excel (.xlsx, .xls) or CSV files
                </p>
              </div>
            </div>

            {/* File Status */}
            {selectedFile && (
              <div style={{
                background: 'rgba(78, 205, 196, 0.2)',
                border: '1px solid rgba(78, 205, 196, 0.4)',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '32px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ fontSize: '20px' }}>✅</div>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '14px' }}>{selectedFile.name}</div>
                    <div style={{ fontSize: '12px', opacity: 0.8 }}>
                      {spreadsheetData.length} rows • {dataStructure?.detectedFormat || 'Processing...'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            {spreadsheetData.length > 0 && (
              <div style={{ marginBottom: '32px' }}>
                <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600' }}>
                  ⚡ Quick Actions
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button
                    onClick={() => setShowChart(!showChart)}
                    style={{
                      background: showChart ? 'linear-gradient(45deg, #ff6b6b, #4ecdc4)' : 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}
                  >
                    📊 {showChart ? 'Hide' : 'Show'} Chart
                  </button>
                  <button
                    onClick={() => downloadExcel(spreadsheetData, `${selectedFile?.name || 'data'}_export.xlsx`)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}
                  >
                    💾 Export
                  </button>
                </div>
              </div>
            )}

            {/* Smart Suggestions */}
            {dataStructure && (
              <div style={{ marginBottom: '32px' }}>
                <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600' }}>
                  💡 Smart Suggestions
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {EnhancedAiService.generateFollowUpQuestions(dataStructure).slice(0, 2).map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => setPrompt(suggestion)}
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '12px',
                        padding: '12px 16px',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '13px',
                        textAlign: 'left',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                      }}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* AI Prompt */}
            <div>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600' }}>
                🤖 AI Assistant
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ask me anything about your data..."
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '12px',
                    padding: '16px',
                    color: 'white',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    minHeight: '80px',
                    outline: 'none'
                  }}
                />
                <button
                  onClick={handleRunAI}
                  disabled={!prompt.trim() || !spreadsheetData.length || aiLoading}
                  style={{
                    background: aiLoading ? 'rgba(255, 255, 255, 0.2)' : 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '16px',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: aiLoading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    opacity: (!prompt.trim() || !spreadsheetData.length) ? 0.5 : 1
                  }}
                >
                  {aiLoading ? '🔄 Processing...' : '✨ Analyze Data'}
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel - Data Display Only */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            padding: '32px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            minHeight: '600px',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {spreadsheetData.length > 0 ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '600' }}>
                      📊 Your Data
                    </h3>
                    <p style={{ margin: 0, fontSize: '14px', opacity: 0.7 }}>
                      {displayData.length - 1} rows × {displayData[0]?.length || 0} columns
                    </p>
                  </div>
                  <input
                    type="text"
                    placeholder="🔍 Filter data..."
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: 'white',
                      fontSize: '12px',
                      width: '200px',
                      outline: 'none'
                    }}
                  />
                </div>
                
                <div style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '12px',
                  overflow: 'auto',
                  maxHeight: '400px',
                  maxWidth: '100%'
                }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: 'rgba(255, 255, 255, 0.1)' }}>
                        {displayData[0]?.map((header, index) => (
                          <th key={index} 
                            onClick={() => handleSort(index)}
                            style={{
                              padding: '12px 16px',
                              textAlign: 'left',
                              fontSize: '12px',
                              fontWeight: '600',
                              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                              cursor: 'pointer',
                              position: 'relative'
                            }}>
                            {String(header || `Col ${index + 1}`)}
                            {sortColumn === index && (
                              <span style={{ marginLeft: '4px' }}>
                                {sortDirection === 'asc' ? '↑' : '↓'}
                              </span>
                            )}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {displayData.slice(1, 11).map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          {row.map((cell, cellIndex) => (
                            <td key={cellIndex} style={{
                              padding: '12px 16px',
                              fontSize: '13px',
                              borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                              opacity: 0.9
                            }}>
                              {String(cell || '')}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {displayData.length > 11 && (
                  <p style={{ margin: '16px 0 0 0', fontSize: '12px', opacity: 0.6, textAlign: 'center' }}>
                    Showing first 10 rows of {displayData.length - 1} {filterText && '(filtered)'}
                  </p>
                )}
              </>
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '64px', marginBottom: '24px', opacity: 0.3 }}>📈</div>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '20px', fontWeight: '600' }}>
                  Ready for Analysis
                </h3>
                <p style={{ margin: 0, fontSize: '16px', opacity: 0.7, maxWidth: '300px' }}>
                  Upload your Excel or CSV file to get started with AI-powered data insights
                </p>
              </div>
            )}
            
            {/* AI Results in Right Panel */}
            {aiResultData && (
              <div style={{
                marginTop: '32px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '12px',
                padding: '24px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>
                    🤖 AI Analysis Results
                  </h4>
                  <button
                    onClick={() => downloadExcel(aiResultData, 'ai_results.xlsx')}
                    style={{
                      background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '11px',
                      fontWeight: '500'
                    }}
                  >
                    💾 Export
                  </button>
                </div>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '8px',
                  overflow: 'auto',
                  maxHeight: '300px',
                  maxWidth: '100%'
                }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: 'rgba(255, 255, 255, 0.1)' }}>
                        {aiResultData[0]?.map((header, index) => (
                          <th key={index} style={{
                            padding: '8px 12px',
                            textAlign: 'left',
                            fontSize: '11px',
                            fontWeight: '600',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                            whiteSpace: 'nowrap'
                          }}>
                            {String(header || `Col ${index + 1}`)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {aiResultData.slice(1).map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          {row.map((cell, cellIndex) => (
                            <td key={cellIndex} style={{
                              padding: '8px 12px',
                              fontSize: '12px',
                              borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                              opacity: 0.9,
                              whiteSpace: 'nowrap'
                            }}>
                              {String(cell || '')}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {/* AI Response in Right Panel */}
            {aiResponse && (
              <div style={{
                marginTop: '32px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '12px',
                padding: '24px'
              }}>
                <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600' }}>
                  💬 AI Response
                </h4>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '8px',
                  padding: '16px',
                  fontSize: '13px',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap',
                  overflow: 'auto',
                  maxHeight: '200px',
                  maxWidth: '100%'
                }}>
                  <div dangerouslySetInnerHTML={{ __html: aiResponse.replace(/\n/g, '<br>') }} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Chart Display */}
        {showChart && spreadsheetData.length > 0 && (
          <div style={{
            maxWidth: '1200px',
            margin: '40px auto 0',
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            padding: '32px',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
                📊 Data Visualization
              </h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                {(['bar', 'line', 'pie'] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => setChartType(type)}
                    style={{
                      background: chartType === type ? 'linear-gradient(45deg, #ff6b6b, #4ecdc4)' : 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '8px',
                      padding: '8px 16px',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '500',
                      textTransform: 'capitalize'
                    }}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', padding: '24px' }}>
              <ChartComponent 
                data={spreadsheetData} 
                type={chartType}
                title={`${selectedFile?.name || 'Data'} - ${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart`}
              />
            </div>
          </div>
        )}

        {/* Data Insights */}
        {dataStructure && (
          <div style={{
            maxWidth: '1200px',
            margin: '40px auto 0'
          }}>
            <ModernDataInsights 
              data={spreadsheetData}
              onPromptSelect={(selectedPrompt) => {
                setPrompt(selectedPrompt);
                setTimeout(() => handleRunAI(), 100);
              }}
            />
          </div>
        )}


      </main>
    </div>
  );
}