import { useState, useEffect, ChangeEvent, KeyboardEvent, useRef } from 'react';
import './App.css';
import * as XLSX from 'xlsx';
import { AIService } from './services/aiService';
import LandingPage from './LandingPage';
import ResizableTable from './components/ResizableTable';

// Supported file types
const SUPPORTED_EXTENSIONS = [
  '.xlsx', '.xls', '.xlsm', '.xltx', '.xltm', '.xlsb', // Excel formats
  '.csv', '.tsv', // Delimited text formats
  '.ods', // OpenDocument format
  '.txt' // Plain text
];

const SUPPORTED_MIME_TYPES = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.ms-excel', // .xls
  'application/vnd.ms-excel.sheet.macroEnabled.12', // .xlsm
  'application/vnd.openxmlformats-officedocument.spreadsheetml.template', // .xltx
  'application/vnd.ms-excel.template.macroEnabled.12', // .xltm
  'application/vnd.ms-excel.sheet.binary.macroEnabled.12', // .xlsb
  'text/csv', // .csv
  'text/tab-separated-values', // .tsv
  'application/vnd.oasis.opendocument.spreadsheet', // .ods
  'text/plain' // .txt
];

type SpreadsheetData = (string | number | boolean | null | undefined)[][];
type SpreadsheetFormatting = ({ color?: string; background?: string; bold?: boolean; italic?: boolean } | undefined)[][];

type AIResult = {
  result?: string;
  aiError?: string;
  data?: SpreadsheetData;
  newData?: SpreadsheetData;
  formatting?: SpreadsheetFormatting;
};

// File processing function
const processFile = async (file: File): Promise<SpreadsheetData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e: ProgressEvent<FileReader>) => {
      try {
        const data = e.target?.result;
        if (!data) {
          reject(new Error('No data read from file'));
          return;
        }

        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0]; // Get first sheet
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON array
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        // Ensure we have at least some data
        if (jsonData.length === 0) {
          reject(new Error('No data found in the file'));
          return;
        }
        
        resolve(jsonData as SpreadsheetData);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsBinaryString(file);
  });
};

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [spreadsheetData, setSpreadsheetData] = useState<SpreadsheetData>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [prompt, setPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiInstructions, setAiInstructions] = useState<string | null>(null);
  const [aiResultData, setAiResultData] = useState<SpreadsheetData | null>(null);
  const [aiFormatting, setAiFormatting] = useState<SpreadsheetFormatting | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showLanding, setShowLanding] = useState(true);
  const resizableTableRef = useRef<null | {
    setColumnWidth: (col: number, width: number) => void;
    setAllColumnsWidth: (width: number) => void;
    setRowHeight: (row: number, height: number) => void;
    setAllRowsHeight: (height: number) => void;
    freezeFirstRow: () => void;
    hideColumn: (col: number) => void;
    showColumn: (col: number) => void;
    showGridlines: () => void;
    hideGridlines: () => void;
  }>(null);
  const [userFeedback, setUserFeedback] = useState<string | null>(null);
  
  // File validation function
  const validateFile = (file: File): { isValid: boolean; error?: string } => {
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return { isValid: false, error: 'File size must be less than 10MB' };
    }
    
    // Check file extension
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!SUPPORTED_EXTENSIONS.includes(extension)) {
      return { 
        isValid: false, 
        error: `Unsupported file type. Supported formats: ${SUPPORTED_EXTENSIONS.join(', ')}` 
      };
    }
    
    // Check MIME type (optional, as some systems may not report correct MIME types)
    if (file.type && !SUPPORTED_MIME_TYPES.includes(file.type)) {
      console.warn(`MIME type ${file.type} not in supported list, but continuing with extension check`);
    }
    
    return { isValid: true };
  };
  
  // AI prompt handler
  const handleRunAI = async () => {
    if (!prompt.trim() || !selectedFile) return;
    setAiLoading(true);
    setAiError(null);
    setAiInstructions(null);
    setAiResultData(null);
    setAiFormatting(null);
    try {
      const result: AIResult = await AIService.uploadSpreadsheetWithPrompt(selectedFile, prompt);
      console.log('AI result:', result);
      setAiInstructions(result.result || '');
      if (result.aiError) {
        setAiError(result.aiError);
      }
      if (Array.isArray(result.data) && result.data.length > 0 && Array.isArray(result.data[0])) {
        setAiResultData(result.data);
        setAiFormatting(Array.isArray(result.formatting) ? result.formatting : null);
      } else if (Array.isArray(result.newData) && result.newData.length > 0 && Array.isArray(result.newData[0])) {
        setAiResultData(result.newData);
        setAiFormatting(null);
      } else {
        setAiResultData(null);
        setAiFormatting(null);
      }
    } catch (err: unknown) {
      console.error('AI processing error:', err);
      if (err instanceof Error) {
        // Check if it's a server connection error
        if (err.message.includes('Server error') || err.message.includes('Network error')) {
          setAiError(`${err.message}\n\nTo fix this:\n1. Make sure the backend server is running (npm start)\n2. Check if port 5001 is available\n3. Verify your OpenAI API key is set in .env file`);
        } else {
          setAiError(err.message || 'AI processing failed');
        }
      } else {
        setAiError('AI processing failed - unknown error occurred');
      }
    } finally {
      setAiLoading(false);
    }
  };

  // Regex-based intent parser for common UI commands
  function parseUICommand(prompt: string) {
    // Set column width (single column)
    let match = prompt.match(/set column (\d+) width to (\d+)/i);
    if (match) {
      return { type: 'setColumnWidth', col: parseInt(match[1], 10) - 1, width: parseInt(match[2], 10) };
    }
    // Set all columns width
    match = prompt.match(/set all columns width to (\d+)/i);
    if (match) {
      return { type: 'setAllColumnsWidth', width: parseInt(match[1], 10) };
    }
    // Set row height (single row)
    match = prompt.match(/set row (\d+) height to (\d+)/i);
    if (match) {
      return { type: 'setRowHeight', row: parseInt(match[1], 10) - 1, height: parseInt(match[2], 10) };
    }
    // Set all rows height
    match = prompt.match(/set all rows height to (\d+)/i);
    if (match) {
      return { type: 'setAllRowsHeight', height: parseInt(match[1], 10) };
    }
    // Freeze first row
    if (/freeze first row/i.test(prompt)) {
      return { type: 'freezeFirstRow' };
    }
    // Hide column
    match = prompt.match(/hide column (\d+)/i);
    if (match) {
      return { type: 'hideColumn', col: parseInt(match[1], 10) - 1 };
    }
    // Show column
    match = prompt.match(/show column (\d+)/i);
    if (match) {
      return { type: 'showColumn', col: parseInt(match[1], 10) - 1 };
    }
    // Show gridlines
    if (/show gridlines/i.test(prompt)) {
      return { type: 'showGridlines' };
    }
    // Hide gridlines
    if (/hide gridlines/i.test(prompt)) {
      return { type: 'hideGridlines' };
    }
    return null;
  }

  // OpenAI-powered intent classifier for ambiguous prompts
  async function classifyPromptWithAI(prompt: string): Promise<'ui' | 'data' | 'unknown'> {
    // Use OpenAI to classify the prompt
    try {
      const systemPrompt = `Classify the following prompt as either 'ui' (if it is about column width, row height, freeze, hide, show, gridlines, etc.) or 'data' (if it is about formulas, values, formatting, calculations, etc.). Only reply with 'ui' or 'data'.`;
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          max_tokens: 1,
          temperature: 0
        })
      });
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content?.trim().toLowerCase();
      if (content === 'ui') return 'ui';
      if (content === 'data') return 'data';
      return 'unknown';
    } catch (e) {
      return 'unknown';
    }
  }

  // Unified prompt handler
  async function handleUserPrompt() {
    if (!prompt.trim() || !selectedFile) return;
    // 1. Try regex-based UI command parser
    const uiCommand = parseUICommand(prompt);
    if (uiCommand) {
      // Handle UI commands
      if (uiCommand.type === 'setColumnWidth' && typeof uiCommand.col === 'number' && typeof uiCommand.width === 'number') {
        resizableTableRef.current?.setColumnWidth(uiCommand.col, uiCommand.width);
        setUserFeedback(`Set column ${uiCommand.col + 1} width to ${uiCommand.width}px`);
        return;
      }
      if (uiCommand.type === 'setAllColumnsWidth' && typeof uiCommand.width === 'number') {
        resizableTableRef.current?.setAllColumnsWidth(uiCommand.width);
        setUserFeedback(`Set all columns width to ${uiCommand.width}px`);
        return;
      }
      if (uiCommand.type === 'setRowHeight' && typeof uiCommand.row === 'number' && typeof uiCommand.height === 'number') {
        resizableTableRef.current?.setRowHeight(uiCommand.row, uiCommand.height);
        setUserFeedback(`Set row ${uiCommand.row + 1} height to ${uiCommand.height}px`);
        return;
      }
      if (uiCommand.type === 'setAllRowsHeight' && typeof uiCommand.height === 'number') {
        resizableTableRef.current?.setAllRowsHeight(uiCommand.height);
        setUserFeedback(`Set all rows height to ${uiCommand.height}px`);
        return;
      }
      if (uiCommand.type === 'freezeFirstRow') {
        resizableTableRef.current?.freezeFirstRow();
        setUserFeedback('Froze the first row');
        return;
      }
      if (uiCommand.type === 'hideColumn' && typeof uiCommand.col === 'number') {
        resizableTableRef.current?.hideColumn(uiCommand.col);
        setUserFeedback(`Hid column ${uiCommand.col + 1}`);
        return;
      }
      if (uiCommand.type === 'showColumn' && typeof uiCommand.col === 'number') {
        resizableTableRef.current?.showColumn(uiCommand.col);
        setUserFeedback(`Showed column ${uiCommand.col + 1}`);
        return;
      }
      if (uiCommand.type === 'showGridlines') {
        resizableTableRef.current?.showGridlines();
        setUserFeedback('Gridlines shown');
        return;
      }
      if (uiCommand.type === 'hideGridlines') {
        resizableTableRef.current?.hideGridlines();
        setUserFeedback('Gridlines hidden');
        return;
      }
    }
    // 2. If not matched, use OpenAI to classify
    const aiIntent = await classifyPromptWithAI(prompt);
    if (aiIntent === 'ui') {
      setUserFeedback('This looks like a UI command, but it is not recognized. Please use a supported format.');
      return;
    }
    // 3. Otherwise, send to backend/AI
    handleRunAI();
  }

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => setShowSuccess(false), 10000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  if (showLanding) {
    return <LandingPage onBegin={() => setShowLanding(false)} />;
  }

  // Always show the actual application
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #1e40af 100%)',
      fontFamily: 'Hammersmith One, "Segoe UI", "Roboto", "Helvetica Neue", "Arial", sans-serif',
      color: 'white',
      overflow: 'auto'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: 'clamp(10px, 4vw, 40px)',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Hammersmith One, "Segoe UI", "Roboto", "Helvetica Neue", "Arial", sans-serif'
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: 'clamp(16px, 4vw, 30px)',
          padding: 'clamp(10px, 2vw, 20px) 0',
          fontFamily: 'Hammersmith One, "Segoe UI", "Roboto", "Helvetica Neue", "Arial", sans-serif'
        }}>
          <h1 style={{
            fontSize: 'clamp(1.3rem, 4vw, 2.4rem)',
            fontWeight: 700,
            color: '#ffffff',
            textShadow: '0 2px 8px rgba(30, 58, 138, 0.5)',
            marginBottom: '10px',
            letterSpacing: 1,
            fontFamily: 'Hammersmith One, "Segoe UI", "Roboto", "Helvetica Neue", "Arial", sans-serif'
          }}>Advanced Excel AI Assistant</h1>
          <p style={{
            fontSize: 'clamp(0.9rem, 2vw, 1.2rem)',
            color: '#bfdbfe',
            fontWeight: 400,
            textShadow: '0 1px 4px rgba(30, 58, 138, 0.5)',
            lineHeight: 1.6,
            fontFamily: 'Hammersmith One, "Segoe UI", "Roboto", "Helvetica Neue", "Arial", sans-serif'
          }}>Upload your Excel files and use AI to perform advanced operations</p>
        </div>
        
        <div style={{ flex: 1 }}>
          {spreadsheetData.length > 0 && (
            <div style={{
              marginBottom: '20px',
              display: 'flex',
              gap: '10px',
              justifyContent: 'center'
            }}>
              <input
                type="text"
                style={{
                  flex: 1,
                  maxWidth: '500px',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '2px solid #60a5fa',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  fontSize: '1rem',
                  fontFamily: 'Hammersmith One, "Segoe UI", "Roboto", "Helvetica Neue", "Arial", sans-serif',
                  outline: 'none',
                  backdropFilter: 'blur(10px)'
                }}
                placeholder="Add prompt here"
                value={prompt}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setPrompt(e.target.value)}
                onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'Enter' && !aiLoading && prompt.trim()) {
                    handleUserPrompt();
                  }
                }}
                disabled={aiLoading}
                autoFocus
              />
              <button
                onClick={handleUserPrompt}
                disabled={aiLoading || !prompt.trim()}
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(90deg, #3b82f6 0%, #1e40af 100%)',
                  color: '#ffffff',
                  border: '2px solid #60a5fa',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                  transition: 'all 0.2s ease',
                  outline: 'none',
                  fontFamily: 'Hammersmith One, "Segoe UI", "Roboto", "Helvetica Neue", "Arial", sans-serif',
                  letterSpacing: 0.5,
                  opacity: aiLoading || !prompt.trim() ? 0.6 : 1
                }}
              >
                {aiLoading ? 'Processing...' : 'Run AI'}
              </button>
            </div>
          )}
          {spreadsheetData.length === 0 && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '400px'
            }}>
              <div 
                style={{
                  border: '3px dashed #60a5fa',
                  borderRadius: '16px',
                  padding: '60px 40px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s ease',
                  maxWidth: '500px',
                  width: '100%'
                }}
                onClick={() => document.getElementById('file-input')?.click()}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.borderColor = '#3b82f6';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.borderColor = '#60a5fa';
                }}
              >
                <div style={{ fontSize: '3rem', marginBottom: '20px' }}>📁</div>
                <div style={{
                  fontSize: '1.5rem',
                  fontWeight: 600,
                  color: '#ffffff',
                  marginBottom: '10px',
                  textShadow: '0 2px 8px rgba(30, 58, 138, 0.5)'
                }}>Upload Excel/CSV File</div>
                <div style={{
                  fontSize: '1rem',
                  color: '#bfdbfe',
                  lineHeight: 1.6
                }}>Supports Excel (.xlsx, .xls, .xlsm, .xltx, .xltm, .xlsb), CSV (.csv), TSV (.tsv), OpenDocument (.ods), and text files (.txt)</div>
                <input
                  id="file-input"
                  type="file"
                  style={{ display: 'none' }}
                  accept=".xlsx,.xls,.csv,.xlsm,.xltx,.xltm,.xlsb,.ods,.tsv,.txt"
                  onChange={async (e: ChangeEvent<HTMLInputElement>) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      console.log('File selected:', file.name, file.type, file.size);
                      
                      // Validate the file
                      const validation = validateFile(file);
                      if (validation.isValid) {
                        setSelectedFile(file);
                        setFileError(null);
                        setIsProcessing(true);
                        
                        try {
                          // Process the file
                          const data = await processFile(file);
                          setSpreadsheetData(data);
                          
                          // Extract headers (first row)
                          if (data.length > 0) {
                            setHeaders(data[0].map((cell: string | number | boolean | null | undefined) => String(cell || '')));
                          }
                          
                          console.log('File processed successfully:', data);
                          setShowSuccess(true);
                        } catch (error) {
                          console.error('Error processing file:', error);
                          setFileError(`Failed to process file: ${error instanceof Error ? error.message : 'Unknown error'}`);
                          setSelectedFile(null);
                          setSpreadsheetData([]);
                          setHeaders([]);
                        } finally {
                          setIsProcessing(false);
                        }
                      } else {
                        setFileError(validation.error || 'Invalid file');
                        setSelectedFile(null);
                      }
                    }
                  }}
                />
              </div>
            </div>
          )}
          
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '15px 0',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            marginTop: '20px'
          }}>
            <div style={{
              color: '#bfdbfe',
              fontSize: '0.9rem',
              fontWeight: 400
            }}>
              {isProcessing ? 'Processing file...' : 
               selectedFile ? `File loaded: ${selectedFile.name} (${spreadsheetData.length} rows)` : 
               'Ready to upload files'}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                style={{
                  padding: '8px 16px',
                  background: 'linear-gradient(90deg, #3b82f6 0%, #1e40af 100%)',
                  color: '#ffffff',
                  border: '1px solid #60a5fa',
                  borderRadius: '6px',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  outline: 'none',
                  fontFamily: 'Hammersmith One, "Segoe UI", "Roboto", "Helvetica Neue", "Arial", sans-serif',
                  opacity: !selectedFile || isProcessing ? 0.5 : 1
                }}
                disabled={!selectedFile || isProcessing}
              >
                Download Excel
              </button>
              <button 
                style={{
                  padding: '8px 16px',
                  background: 'linear-gradient(90deg, #3b82f6 0%, #1e40af 100%)',
                  color: '#ffffff',
                  border: '1px solid #60a5fa',
                  borderRadius: '6px',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  outline: 'none',
                  fontFamily: 'Hammersmith One, "Segoe UI", "Roboto", "Helvetica Neue", "Arial", sans-serif',
                  opacity: !selectedFile || isProcessing ? 0.5 : 1
                }}
                disabled={!selectedFile || isProcessing}
              >
                Download CSV
              </button>
            </div>
          </div>
          
          {fileError && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid #ef4444',
              borderRadius: '8px',
              padding: '15px',
              margin: '20px 0',
              color: '#fca5a5',
              fontSize: '0.9rem',
              fontFamily: 'Hammersmith One, "Segoe UI", "Roboto", "Helvetica Neue", "Arial", sans-serif'
            }}>
              <strong>Error:</strong> {fileError}
            </div>
          )}
          
          {selectedFile && !isProcessing && spreadsheetData.length > 0 && showSuccess && (
            <div style={{
              background: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid #22c55e',
              borderRadius: '8px',
              padding: '15px',
              margin: '20px 0',
              color: '#86efac',
              fontSize: '0.9rem',
              fontFamily: 'Hammersmith One, "Segoe UI", "Roboto", "Helvetica Neue", "Arial", sans-serif'
            }}>
              <strong>Success!</strong> File "{selectedFile.name}" has been loaded successfully with {spreadsheetData.length} rows of data.
            </div>
          )}
          
          {/* Spreadsheet Display */}
          {spreadsheetData.length > 0 && (
            <ResizableTable
              ref={resizableTableRef}
              data={spreadsheetData.slice(1).filter(row => row.some(cell => cell !== null && cell !== undefined && cell !== ''))}
              headers={headers}
              title="Spreadsheet Data"
              subtitle={`Rows: ${spreadsheetData.length} | Columns: ${headers.length}`}
            />
          )}

          {/* AI Output */}
          {aiError && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid #ef4444',
              borderRadius: '8px',
              padding: '15px',
              margin: '20px 0',
              color: '#fca5a5',
              fontSize: '0.9rem',
              fontFamily: 'Hammersmith One, "Segoe UI", "Roboto", "Helvetica Neue", "Arial", sans-serif'
            }}>
              <strong>AI Error:</strong> {aiError}
            </div>
          )}
          {aiInstructions && (
            <div style={{
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid #3b82f6',
              borderRadius: '8px',
              padding: '15px',
              margin: '20px 0',
              color: '#bfdbfe',
              fontSize: '0.9rem',
              fontFamily: 'Hammersmith One, "Segoe UI", "Roboto", "Helvetica Neue", "Arial", sans-serif',
              lineHeight: 1.6
            }}>
              <strong>AI Instructions:</strong>
              <div style={{ marginTop: '8px' }}>{aiInstructions}</div>
            </div>
          )}
          {aiResultData && aiResultData.length > 0 && (
            <ResizableTable
              data={aiResultData}
              headers={headers}
              formatting={aiFormatting || undefined}
              title="AI Result Data"
              subtitle={`Rows: ${aiResultData.length} | Columns: ${aiResultData[0]?.length || 0}`}
            />
          )}
          {userFeedback && (
            <div style={{
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid #3b82f6',
              borderRadius: '8px',
              padding: '15px',
              margin: '20px 0',
              color: '#bfdbfe',
              fontSize: '0.9rem',
              fontFamily: 'Hammersmith One, "Segoe UI", "Roboto", "Helvetica Neue", "Arial", sans-serif',
              lineHeight: 1.6
            }}>
              <strong>Feedback:</strong> {userFeedback}
            </div>
          )}
        </div>
      </div>
      <style>{`
        @media (max-width: 800px) {
          .spreadsheet-table th, .spreadsheet-table td {
            font-size: 0.8rem !important;
            padding: 6px 4px !important;
          }
        }
        @media (max-width: 600px) {
          .spreadsheet-table th, .spreadsheet-table td {
            font-size: 0.7rem !important;
            padding: 4px 2px !important;
          }
          .spreadsheet-table {
            font-size: 0.7rem !important;
          }
          input[type="text"] {
            font-size: 1rem !important;
            padding: 10px 8px !important;
          }
          button {
            font-size: 1rem !important;
            padding: 10px 16px !important;
          }
        }
      `}</style>
    </div>
  );
}

export default App;
 
 