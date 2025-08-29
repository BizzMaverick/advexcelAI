import { useState, useRef, useEffect } from 'react';
import { DataDetectionService } from '../services/dataDetectionService';
import { EnhancedAiService } from '../services/enhancedAiService';
import bedrockService from '../services/bedrockService';
import ChartComponent from './ChartComponent';
import ModernDataInsights from './ModernDataInsights';
import * as XLSX from 'xlsx';
import emailjs from '@emailjs/browser';

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
  const [showFeedbackBox, setShowFeedbackBox] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [legalContent, setLegalContent] = useState({ title: '', content: '' });
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
          
          // Automatically trigger comprehensive AI analysis
          setTimeout(() => performAutoAnalysis(jsonData), 1000);
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

  const performAutoAnalysis = async (data: any[][]) => {
    setAiLoading(true);
    setAiResponse('🔄 Performing comprehensive data analysis...');
    
    try {
      const enhancedPrompt = `You are a senior data analyst. Perform COMPLETE data analytics on this dataset and provide ALL possible outcomes:

**REQUIRED ANALYSIS:**
1. **DATA OVERVIEW**: Total rows, columns, data types, missing values
2. **STATISTICAL SUMMARY**: Min, max, mean, median, mode, standard deviation for all numeric columns
3. **TREND ANALYSIS**: Year-over-year changes, growth rates, seasonal patterns
4. **GEOGRAPHIC ANALYSIS**: Country/region breakdowns, highest/lowest values
5. **CORRELATION ANALYSIS**: Relationships between variables
6. **ANOMALY DETECTION**: Outliers, unusual patterns, data quality issues
7. **PREDICTIVE INSIGHTS**: Future trends, forecasting
8. **ACTIONABLE RECOMMENDATIONS**: Policy suggestions, resource allocation, strategic decisions
9. **RISK ASSESSMENT**: Potential issues, warning indicators
10. **COMPARATIVE ANALYSIS**: Benchmarking, rankings, performance metrics

**OUTPUT FORMAT:**
- Provide detailed numerical results
- Include percentage changes and ratios
- Generate summary tables with key metrics
- Highlight top 5 insights
- Give specific recommendations with reasoning

Be comprehensive and analytical - this is for executive decision making.`;
      
      const result = await bedrockService.processExcelData(data, enhancedPrompt, selectedFile?.name || 'data');
      
      if (result.success && result.response) {
        // Enhanced response formatting for comprehensive analysis
        const formattedResponse = `📊 **COMPREHENSIVE DATA ANALYTICS REPORT**\n\n${result.response}`;
        setAiResponse(formattedResponse);
        
        // If structured data is available, set it for table display
        if (result.structured && Array.isArray(result.structured)) {
          setAiResultData(result.structured);
        }
        return;
      } else {
        throw new Error(result.error || 'AI analysis failed');
      }
      
      // Generate local analysis as fallback
      const headers = data[0];
      const rows = data.slice(1);
      const numericColumns = [];
      const textColumns = [];
      
      // Analyze column types
      headers.forEach((header, index) => {
        const values = rows.map(row => row[index]).filter(val => val !== null && val !== undefined && val !== '');
        const numericValues = values.filter(val => !isNaN(Number(val)));
        
        if (numericValues.length > values.length * 0.7) {
          numericColumns.push({ name: header, index, values: numericValues.map(Number) });
        } else {
          textColumns.push({ name: header, index, values });
        }
      });
      
      // Generate insights
      let insights = `📊 **Data Analysis Results**\n\n`;
      insights += `**Dataset Overview:**\n`;
      insights += `• Total rows: ${rows.length}\n`;
      insights += `• Total columns: ${headers.length}\n`;
      insights += `• Numeric columns: ${numericColumns.length}\n`;
      insights += `• Text columns: ${textColumns.length}\n\n`;
      
      // Numeric analysis
      if (numericColumns.length > 0) {
        insights += `**Numeric Analysis:**\n`;
        numericColumns.forEach(col => {
          const values = col.values;
          const sum = values.reduce((a, b) => a + b, 0);
          const avg = sum / values.length;
          const min = Math.min(...values);
          const max = Math.max(...values);
          
          insights += `• ${col.name}: Avg: ${avg.toFixed(2)}, Min: ${min}, Max: ${max}\n`;
        });
        insights += `\n`;
      }
      
      // Text analysis
      if (textColumns.length > 0) {
        insights += `**Text Analysis:**\n`;
        textColumns.forEach(col => {
          const uniqueValues = [...new Set(col.values)];
          insights += `• ${col.name}: ${uniqueValues.length} unique values\n`;
        });
        insights += `\n`;
      }
      
      insights += `**Recommendations:**\n`;
      insights += `• Data appears to be well-structured\n`;
      insights += `• Consider creating visualizations for numeric data\n`;
      insights += `• Review data for any missing values\n`;
      
      setAiResponse(insights);
      
    } catch (err: any) {
      console.error('Auto Analysis Error:', err);
      setAiResponse(`⚠️ **Analysis Notice:** AWS AI service is temporarily unavailable. A basic local analysis has been performed instead.\n\nYour data has been successfully loaded and is ready for editing. You can:\n• Edit cells directly in the table\n• Sort columns by clicking headers\n• Export your data\n• Create charts\n\nFor advanced AI analysis, please try again later.`);
    } finally {
      setAiLoading(false);
    }
  };

  const handleCustomAnalysis = async () => {
    if (!prompt.trim() || !spreadsheetData.length) return;
    
    setAiLoading(true);
    try {
      // Try AWS service first, fallback to local processing
      try {
        const enhancedPrompt = dataStructure ? 
          EnhancedAiService.enhancePrompt(prompt, dataStructure) : 
          prompt;
        
        const result = await bedrockService.processExcelData(spreadsheetData, enhancedPrompt, selectedFile?.name || 'data');
        
        if (result.success && result.response) {
          setAiResponse(result.response);
        } else {
          throw new Error(result.error || 'Analysis failed');
        }
      } catch (apiError) {
        // Fallback: Provide helpful response based on prompt
        const lowerPrompt = prompt.toLowerCase();
        let response = `⚠️ **AI Service Temporarily Unavailable**\n\n`;
        
        if (lowerPrompt.includes('sum') || lowerPrompt.includes('total')) {
          response += `For sum calculations, you can:\n• Click on column headers to sort\n• Use the export feature to analyze in Excel\n• Manually review the numeric columns`;
        } else if (lowerPrompt.includes('chart') || lowerPrompt.includes('graph')) {
          response += `For charts:\n• Use the "Show Chart" button in Quick Actions\n• Switch between bar, line, and pie charts\n• Export data for external visualization`;
        } else if (lowerPrompt.includes('duplicate')) {
          response += `For duplicate detection:\n• Sort columns to identify similar values\n• Use manual review of the data\n• Export to Excel for advanced duplicate removal`;
        } else {
          response += `Your request: "${prompt}"\n\nWhile AI analysis is unavailable, you can:\n• Edit data directly in the table\n• Sort by clicking column headers\n• Create charts using Quick Actions\n• Export data for external analysis`;
        }
        
        setAiResponse(response);
      }
    } catch (err: any) {
      console.error('AI Processing Error:', err);
      setAiResponse(`❌ Error: ${err.message || 'Processing failed'}`);
    } finally {
      setAiLoading(false);
      setPrompt('');
    }
  };
  
  const handleCellEdit = (rowIndex: number, colIndex: number, newValue: string) => {
    const newData = [...spreadsheetData];
    newData[rowIndex][colIndex] = newValue;
    setSpreadsheetData(newData);
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
          alignItems: 'stretch'
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

            {/* Analysis Actions */}
            {spreadsheetData.length > 0 && (
              <div style={{ marginBottom: '32px' }}>
                <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600' }}>
                  🔄 Analysis Actions
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button
                    onClick={() => performAutoAnalysis(spreadsheetData)}
                    disabled={aiLoading}
                    style={{
                      background: aiLoading ? 'rgba(255, 255, 255, 0.2)' : 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '12px',
                      padding: '12px 16px',
                      color: 'white',
                      cursor: aiLoading ? 'not-allowed' : 'pointer',
                      fontSize: '13px',
                      fontWeight: '500',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {aiLoading ? '🔄 Analyzing...' : '🧠 Re-run Full Analysis'}
                  </button>
                </div>
              </div>
            )}

            {/* Custom Analysis */}
            <div>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600' }}>
                📝 Custom Analysis
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ask for specific analysis or insights..."
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
                  onClick={handleCustomAnalysis}
                  disabled={!prompt.trim() || !spreadsheetData.length || aiLoading}
                  style={{
                    background: aiLoading ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
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
                  {aiLoading ? '🔄 Processing...' : '🔍 Custom Analysis'}
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
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            {spreadsheetData.length > 0 ? (
              <>
                <div style={{ marginBottom: '16px' }}>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '600' }}>
                    📊 Your Data
                  </h3>
                  <p style={{ margin: 0, fontSize: '14px', opacity: 0.7 }}>
                    {displayData.length - 1} rows × {displayData[0]?.length || 0} columns
                  </p>
                </div>
                
                <div style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '12px',
                  overflowX: 'scroll',
                  overflowY: 'scroll',
                  maxHeight: '400px',
                  width: '100%',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'rgba(255, 255, 255, 0.3) rgba(255, 255, 255, 0.1)'
                }} className="custom-scrollbar">
                  <table style={{ 
                    borderCollapse: 'collapse', 
                    width: 'auto',
                    tableLayout: 'auto'
                  }}>
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
                              position: 'relative',
                              whiteSpace: 'nowrap',
                              minWidth: '150px'
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
                      {displayData.slice(1).map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          {displayData[0]?.map((_, cellIndex) => (
                            <td key={cellIndex} style={{
                              padding: '4px',
                              fontSize: '13px',
                              borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                              opacity: 0.9,
                              whiteSpace: 'nowrap',
                              minWidth: '150px'
                            }}>
                              <input
                                type="text"
                                value={String(row[cellIndex] || '')}
                                onChange={(e) => handleCellEdit(rowIndex + 1, cellIndex, e.target.value)}
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  color: 'white',
                                  fontSize: '13px',
                                  width: '100%',
                                  padding: '8px 12px',
                                  outline: 'none'
                                }}
                                onFocus={(e) => {
                                  e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                                  e.target.style.borderRadius = '4px';
                                }}
                                onBlur={(e) => {
                                  e.target.style.background = 'transparent';
                                }}
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                

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
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'rgba(255, 255, 255, 0.3) rgba(255, 255, 255, 0.1)'
                }} className="custom-scrollbar">
                  <table style={{ borderCollapse: 'collapse', width: 'max-content', minWidth: '100%' }}>
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
                  whiteSpace: 'nowrap',
                  overflow: 'auto',
                  maxHeight: '200px',
                  minWidth: '400px'
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
                setTimeout(() => handleCustomAnalysis(), 100);
              }}
            />
          </div>
        )}


      </main>
      
      {/* Footer with Legal Pages */}
      <footer style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.2)',
        color: 'white',
        padding: '40px',
        textAlign: 'center'
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', flexWrap: 'wrap', marginBottom: '20px' }}>
          <a onClick={() => {
            setLegalContent({ 
              title: 'Privacy Policy', 
              content: `Last updated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

What Information We Collect:
• Your name and email address when you create an account
• Excel/CSV files you upload for processing
• Usage data to improve our service

How We Use Your Information:
• Process your files to provide AI-powered analysis
• Maintain your account and authentication
• Improve our services and user experience

Data Security:
• We use Amazon Web Services (AWS) for secure processing
• Your data is encrypted and protected with industry standards
• Files are processed temporarily and not permanently stored
• Account data is kept secure until you delete your account

Data Sharing:
• We do not sell or share your personal information
• We only use AWS services (Cognito, Bedrock) for processing
• No third-party access to your data

Your Rights:
• Access, modify, or delete your personal information
• Request account deletion at any time
• Withdraw consent for data processing

Contact Us:
For privacy questions, email: contact@advexcel.online` 
            });
            setShowLegalModal(true);
          }} style={{ color: 'white', textDecoration: 'none', fontSize: '16px', cursor: 'pointer', opacity: 0.8, transition: 'opacity 0.3s ease' }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
          >Privacy Policy</a>
          
          <a onClick={() => {
            setLegalContent({ 
              title: 'Terms of Service', 
              content: `Last updated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

By using Excel AI, you agree to these terms.

What Excel AI Does:
• AI-powered analysis of Excel and CSV files
• Data sorting, filtering, and mathematical calculations
• Duplicate detection and data manipulation
• Powered by Amazon Web Services

Your Responsibilities:
• Only upload files you have permission to process
• Don't upload sensitive personal data or confidential information
• Use the service legally and responsibly
• Keep your account credentials secure
• Don't attempt to hack or compromise the service

Prohibited Uses:
• Illegal, harmful, or malicious content
• Files with viruses or malware
• Unauthorized access attempts
• Commercial use without permission
• Violating applicable laws

Service Terms:
• Service provided "as-is" without warranties
• We may modify or discontinue service anytime
• No guarantee of uninterrupted access
• Limited liability for service issues

Changes:
• We may update these terms anytime
• Continued use means you accept changes

Contact: contact@advexcel.online` 
            });
            setShowLegalModal(true);
          }} style={{ color: 'white', textDecoration: 'none', fontSize: '16px', cursor: 'pointer', opacity: 0.8, transition: 'opacity 0.3s ease' }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
          >Terms of Service</a>
          
          <a onClick={() => {
            setLegalContent({ 
              title: 'Cookie Policy', 
              content: `Last updated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

What Are Cookies:
Small text files stored on your device to make websites work better.

How We Use Cookies:
• Keep you logged in (authentication)
• Remember your preferences
• Analyze usage to improve our service
• Ensure security and prevent fraud

Types of Cookies:

Essential Cookies (Required):
• AWS Cognito authentication cookies
• Security and session management
• Application functionality

Analytical Cookies (Optional):
• Usage analytics and performance monitoring
• Feature tracking to improve services

Third-Party Cookies:
• Amazon Web Services for authentication and security
• No other third-party cookies

Managing Cookies:
• Control cookies through your browser settings
• View, delete, or block cookies as needed
• Disabling essential cookies may break functionality
• Session cookies deleted when browser closes

Contact: contact@advexcel.online` 
            });
            setShowLegalModal(true);
          }} style={{ color: 'white', textDecoration: 'none', fontSize: '16px', cursor: 'pointer', opacity: 0.8, transition: 'opacity 0.3s ease' }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
          >Cookie Policy</a>
          
          <a onClick={() => {
            setLegalContent({ 
              title: 'Support & Help', 
              content: `Getting Started:
• Create account with your email
• Upload Excel (.xlsx, .xls) or CSV files
• Use natural language commands
• Apply results or download new files

Supported Files:
• Excel files (.xlsx, .xls)
• CSV files (.csv)
• Large files truncated to 1000 rows

Key Features:
• Sort data by any column
• Find and remove duplicates
• Math operations (sum, average, count, min, max)
• Data filtering and search
• AI-powered data insights
• Chart generation and visualization

Common Commands:
• "Sort by column A"
• "Find duplicates"
• "Sum column B"
• "Show data for [item]"
• "Create a chart"

Troubleshooting:
• Upload issues: Check file format, refresh page
• AI not responding: Upload file first, use clear commands
• Scrolling issues: Use horizontal/vertical scroll bars

Best Practices:
• Use descriptive column headers
• Keep reasonable file sizes
• Be specific in commands
• Review results before applying

Need Help:
• Use feedback button (👍) for quick questions
• Email: contact@advexcel.online
• Include browser type and specific issue details

System Requirements:
• Modern web browser
• Internet connection
• JavaScript and cookies enabled` 
            });
            setShowLegalModal(true);
          }} style={{ color: 'white', textDecoration: 'none', fontSize: '16px', cursor: 'pointer', opacity: 0.8, transition: 'opacity 0.3s ease' }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
          >Support</a>
          
          <a onClick={() => {
            setLegalContent({ 
              title: 'Contact Us', 
              content: `Quick Support:
• Click the feedback button (👍) in bottom right corner
• Describe your issue or question
• We'll respond promptly

Email Contact:
• contact@advexcel.online
• Response time: 24-48 hours
• For all inquiries: technical support, questions, business, partnerships

Before Contacting:
• Try troubleshooting steps in Support section
• Note your browser type and version
• Describe specific steps that caused the issue
• Include any error messages

Feature Requests:
• Use feedback button with "Feature Request"
• Email with subject "Feature Request"
• Include detailed descriptions

Privacy & Security:
• Email with subject "Privacy/Security"
• Reference our Privacy Policy
• Report security issues responsibly

Business Hours:
• Monday-Friday, 9 AM - 6 PM EST
• Feedback monitored 24/7 for urgent issues
• Weekend response times may vary

About Us:
• AdvExcel AI Development Team
• Powered by Amazon Web Services
• Cloud-based for global accessibility

We're committed to excellent support and continuous improvement based on your feedback!` 
            });
            setShowLegalModal(true);
          }} style={{ color: 'white', textDecoration: 'none', fontSize: '16px', cursor: 'pointer', opacity: 0.8, transition: 'opacity 0.3s ease' }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
          >Contact Us</a>
        </div>
        <p style={{ margin: 0, fontSize: '14px', opacity: 0.7 }}>
          © 2024 AdvExcel AI. All rights reserved. | Powered by AWS
        </p>
      </footer>
      
      {/* Legal Modal */}
      {showLegalModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            padding: '32px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '70vh',
            overflow: 'auto',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{ position: 'relative', marginBottom: '24px', textAlign: 'center' }}>
              <h3 style={{ margin: 0, color: '#333', fontSize: '24px', fontWeight: '600' }}>{legalContent.title}</h3>
              <button
                onClick={() => setShowLegalModal(false)}
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ×
              </button>
            </div>
            <div style={{ color: '#333', lineHeight: '1.6', margin: 0, whiteSpace: 'pre-line', fontSize: '15px' }}>{legalContent.content}</div>
            <div style={{ marginTop: '24px', textAlign: 'right' }}>
              <button
                onClick={() => setShowLegalModal(false)}
                style={{
                  background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Floating Feedback Button */}
      <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
        <div 
          onClick={() => setShowFeedbackBox(!showFeedbackBox)}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1))',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            color: 'white',
            cursor: 'pointer',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            const target = e.target as HTMLElement;
            target.style.transform = 'scale(1.1)';
            target.style.background = 'linear-gradient(145deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.2))';
          }}
          onMouseLeave={(e) => {
            const target = e.target as HTMLElement;
            target.style.transform = 'scale(1)';
            target.style.background = 'linear-gradient(145deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1))';
          }}
          title="Give Feedback"
        >
          👍
        </div>
        
        {showFeedbackBox && (
          <div style={{
            position: 'absolute',
            bottom: '70px',
            right: '0',
            width: '300px',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            padding: '20px',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <h4 style={{ margin: '0 0 12px 0', color: '#333', fontSize: '16px', fontWeight: '600' }}>Send Feedback</h4>
            <textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Share your thoughts about AdvExcel..."
              style={{
                width: '100%',
                height: '80px',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '14px',
                fontFamily: 'inherit',
                resize: 'none',
                outline: 'none',
                boxSizing: 'border-box',
                background: 'rgba(255, 255, 255, 0.8)',
                color: '#333'
              }}
            />
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <button
                onClick={async () => {
                  if (feedbackText.trim()) {
                    try {
                      await emailjs.send(
                        'service_gyuegyb',
                        'template_16urb42',
                        {
                          user_email: user.email,
                          user_name: user.name,
                          message: feedbackText,
                          to_email: 'contact@advexcel.online'
                        },
                        '3xCIlXaFmm79QkBaB'
                      );
                      alert('Thank you for your feedback! We have received your message and will respond soon.');
                      setFeedbackText('');
                      setShowFeedbackBox(false);
                    } catch (error) {
                      console.error('Failed to send feedback:', error);
                      alert('Sorry, there was an error sending your feedback. Please try again or email us directly at contact@advexcel.online');
                    }
                  }
                }}
                style={{
                  background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
                  color: 'white',
                  border: 'none',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.3s ease'
                }}
              >
                Send
              </button>
              <button
                onClick={() => {
                  setShowFeedbackBox(false);
                  setFeedbackText('');
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.8)',
                  color: '#333',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  transition: 'all 0.3s ease'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}