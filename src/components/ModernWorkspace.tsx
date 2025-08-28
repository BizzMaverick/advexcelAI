import { useState, useRef, useEffect } from 'react';
import { DataDetectionService } from '../services/dataDetectionService';
import { EnhancedAiService } from '../services/enhancedAiService';
import { AWSService } from '../services/awsService.js';
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
  const [dragActive, setDragActive] = useState(false);
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

  const handleRunAI = async () => {
    if (!prompt.trim() || !spreadsheetData.length) return;
    
    setAiLoading(true);
    try {
      const enhancedPrompt = dataStructure ? 
        EnhancedAiService.enhancePrompt(prompt, dataStructure) : 
        prompt;
      
      const result = selectedFile ? 
        await AWSService.uploadSpreadsheetWithPrompt(selectedFile, enhancedPrompt) :
        await AWSService.processPromptWithData(spreadsheetData, enhancedPrompt);
      
      if (result.data && Array.isArray(result.data)) {
        setAiResponse('Analysis completed successfully!');
      }
    } catch (err: any) {
      setAiResponse(err.message || 'Processing failed');
    } finally {
      setAiLoading(false);
      setPrompt('');
    }
  };

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
          <div style={{
            width: '40px',
            height: '40px',
            background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px'
          }}>
            ✨
          </div>
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

            {/* Smart Suggestions */}
            {dataStructure && (
              <div style={{ marginBottom: '32px' }}>
                <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600' }}>
                  💡 Smart Suggestions
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {EnhancedAiService.generateFollowUpQuestions(dataStructure).slice(0, 3).map((suggestion, index) => (
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

          {/* Right Panel - Data Display */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            padding: '32px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            minHeight: '600px'
          }}>
            {spreadsheetData.length > 0 ? (
              <>
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600' }}>
                    📊 Your Data
                  </h3>
                  <p style={{ margin: 0, fontSize: '14px', opacity: 0.7 }}>
                    {spreadsheetData.length} rows × {spreadsheetData[0]?.length || 0} columns
                  </p>
                </div>
                
                <div style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  maxHeight: '400px',
                  overflowY: 'auto'
                }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: 'rgba(255, 255, 255, 0.1)' }}>
                        {spreadsheetData[0]?.map((header, index) => (
                          <th key={index} style={{
                            padding: '12px 16px',
                            textAlign: 'left',
                            fontSize: '12px',
                            fontWeight: '600',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                          }}>
                            {String(header || `Col ${index + 1}`)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {spreadsheetData.slice(1, 11).map((row, rowIndex) => (
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
                
                {spreadsheetData.length > 11 && (
                  <p style={{ margin: '16px 0 0 0', fontSize: '12px', opacity: 0.6, textAlign: 'center' }}>
                    Showing first 10 rows of {spreadsheetData.length}
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
          </div>
        </div>

        {/* AI Response */}
        {aiResponse && (
          <div style={{
            maxWidth: '1200px',
            margin: '40px auto 0',
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            padding: '32px',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '600' }}>
              🤖 AI Analysis Results
            </h3>
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              padding: '24px',
              fontSize: '14px',
              lineHeight: '1.6'
            }}>
              {aiResponse}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}