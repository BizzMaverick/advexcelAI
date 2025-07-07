import { useState, useEffect } from 'react';
import './App.css';
import * as XLSX from 'xlsx';
import { AIService } from './services/aiService';

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

// File processing function
const processFile = async (file: File): Promise<any[][]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
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
        
        resolve(jsonData as any[][]);
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
  const [spreadsheetData, setSpreadsheetData] = useState<any[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [prompt, setPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiInstructions, setAiInstructions] = useState<string | null>(null);
  const [aiResultData, setAiResultData] = useState<any[][] | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  
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
    try {
      const result = await AIService.uploadSpreadsheetWithPrompt(selectedFile, prompt);
      setAiInstructions(result.result || '');
      if (result.aiError) {
        setAiError(result.aiError);
      }
      if (Array.isArray(result.newData) && result.newData.length > 0 && Array.isArray(result.newData[0])) {
        setAiResultData(result.newData);
      } else {
        setAiResultData(null);
      }
    } catch (err: any) {
      setAiError(err.message || 'AI processing failed');
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => setShowSuccess(false), 10000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  // Always show the actual application
  return (
    <div className="app">
      <div className="container">
        <div className="header">
          <h1>Advanced Excel AI Assistant</h1>
          <p>Upload your Excel files and use AI to perform advanced operations</p>
        </div>
        
        <div className="content">
          {spreadsheetData.length > 0 && (
            <div className="ai-prompt-bar">
              <input
                type="text"
                className="ai-prompt-input"
                placeholder="Add prompt here"
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !aiLoading && prompt.trim()) {
                    handleRunAI();
                  }
                }}
                disabled={aiLoading}
                autoFocus
              />
            </div>
          )}
          {spreadsheetData.length === 0 && (
            <div className="upload-section">
              <div className="upload-area" onClick={() => document.getElementById('file-input')?.click()}>
                <div className="upload-icon">📁</div>
                <div className="upload-text">Upload Excel/CSV File</div>
                <div className="upload-hint">Supports Excel (.xlsx, .xls, .xlsm, .xltx, .xltm, .xlsb), CSV (.csv), TSV (.tsv), OpenDocument (.ods), and text files (.txt)</div>
                <input
                  id="file-input"
                  type="file"
                  className="file-input"
                  accept=".xlsx,.xls,.csv,.xlsm,.xltx,.xltm,.xlsb,.ods,.tsv,.txt"
                  onChange={async (e) => {
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
                            setHeaders(data[0].map((cell: any) => String(cell || '')));
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
          
          <div className="status-bar">
            <div className="status-text">
              {isProcessing ? 'Processing file...' : 
               selectedFile ? `File loaded: ${selectedFile.name} (${spreadsheetData.length} rows)` : 
               'Ready to upload files'}
            </div>
            <div className="ai-controls">
              <button className="ai-button" disabled={!selectedFile || isProcessing}>
                {isProcessing ? <span className="loading"></span> : ''}AI Processing
              </button>
              <button className="ai-button" disabled={!selectedFile || isProcessing}>Download Excel</button>
              <button className="ai-button" disabled={!selectedFile || isProcessing}>Download CSV</button>
            </div>
          </div>
          
          {fileError && (
            <div className="error-message">
              <strong>Error:</strong> {fileError}
            </div>
          )}
          
          {selectedFile && !isProcessing && spreadsheetData.length > 0 && showSuccess && (
            <div className="success-message">
              <strong>Success!</strong> File "{selectedFile.name}" has been loaded successfully with {spreadsheetData.length} rows of data.
            </div>
          )}
          
          {/* Spreadsheet Display */}
          {spreadsheetData.length > 0 && (
            <div className="spreadsheet-container">
              <div className="spreadsheet-header">
                <h3>Spreadsheet Data</h3>
                <span className="data-info">Rows: {spreadsheetData.length} | Columns: {headers.length}</span>
              </div>
              <div className="spreadsheet-table-container">
                <table className="spreadsheet-table">
                  <thead>
                    <tr>
                      {headers.map((header, index) => (
                        <th key={index}>{header || `Column ${index + 1}`}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {spreadsheetData.slice(1)
                      .filter(row => row.some(cell => cell !== null && cell !== undefined && cell !== ''))
                      .map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          {row.map((cell, cellIndex) => (
                            <td key={cellIndex}>{cell === null || cell === undefined ? '' : String(cell)}</td>
                          ))}
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* AI Output */}
          {aiError && (
            <div className="error-message"><strong>AI Error:</strong> {aiError}</div>
          )}
          {aiInstructions && (
            <div className="ai-instructions">
              <strong>AI Instructions:</strong>
              <div>{aiInstructions}</div>
            </div>
          )}
          {aiResultData && aiResultData.length > 0 && (
            <div className="spreadsheet-container">
              <div className="spreadsheet-header">
                <h3>AI Result Data</h3>
                <span className="data-info">Rows: {aiResultData.length} | Columns: {aiResultData[0]?.length || 0}</span>
              </div>
              <div className="spreadsheet-table-container">
                <table className="spreadsheet-table">
                  <tbody>
                    {aiResultData.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {row.map((cell, cellIndex) => (
                          <td key={cellIndex}>{cell === null || cell === undefined ? '' : String(cell)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
 
 