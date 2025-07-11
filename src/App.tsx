import { useState, useEffect, useRef } from 'react';
import './App.css';
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

type SpreadsheetData = (string | number | boolean | null | undefined)[][];
type SpreadsheetFormatting = ({ color?: string; background?: string; bold?: boolean; italic?: boolean } | undefined)[][];

type AIResult = {
  result?: string;
  aiError?: string;
  data?: SpreadsheetData;
  newData?: SpreadsheetData;
  formatting?: SpreadsheetFormatting;
};

// Add fuzzy string matching utility (Levenshtein distance)
function levenshtein(a: string, b: string): number {
  const matrix = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      if (a[i - 1] === b[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  return matrix[a.length][b.length];
}

// Add this utility to extract numbers from a string
function extractNumbers(str: string): number[] {
  return (str.match(/\d+/g) || []).map(Number);
}

// Update getClosestUICommands to also substitute numbers from the input into the template
function getPersonalizedSuggestion(input: string, template: string): string {
  const inputNumbers = extractNumbers(input);
  let result = template;
  // Replace numbers in template with those from input, in order
  let i = 0;
  result = result.replace(/\d+/g, () => {
    const val = inputNumbers[i];
    i++;
    return val !== undefined ? String(val) : '';
  });
  return result;
}

// List of supported UI command templates for suggestions
const uiCommandTemplates = [
  'set column 1 width to 100',
  'set all columns width to 80',
  'set row 1 height to 40',
  'set all rows height to 40',
  'freeze first row',
  'hide column 1',
  'show column 1',
  'show gridlines',
  'hide gridlines',
];

function getClosestUICommands(input: string, maxDistance = 6) {
  // Return the closest UI command templates within a distance threshold
  const distances = uiCommandTemplates.map(cmd => ({
    cmd,
    dist: levenshtein(input.toLowerCase(), cmd.toLowerCase())
  }));
  const minDist = Math.min(...distances.map(d => d.dist));
  // Return personalized suggestions
  return distances.filter(d => d.dist <= Math.max(maxDistance, minDist)).map(d => getPersonalizedSuggestion(input, d.cmd));
}

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [spreadsheetData] = useState<SpreadsheetData>([]);
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
  const [promptSuggestion, setPromptSuggestion] = useState<string | null>(null);
  
  // File validation function
  // Remove: const validateFile = (file: File): { isValid: boolean; error?: string } => {
  // Remove:   // Check file size (max 10MB)
  // Remove:   if (file.size > 10 * 1024 * 1024) {
  // Remove:   //   return { isValid: false, error: 'File size must be less than 10MB' };
  // Remove:   // }
    
  // Remove:   // Check file extension
  // Remove:   const extension = '.' + file.name.split('.').pop()?.toLowerCase();
  // Remove:   if (!SUPPORTED_EXTENSIONS.includes(extension)) {
  // Remove:   //   return { 
  // Remove:   //   isValid: false, 
  // Remove:   //   error: `Unsupported file type. Supported formats: ${SUPPORTED_EXTENSIONS.join(', ')}` 
  // Remove:   //   };
  // Remove:   // }
    
  // Remove:   // Check MIME type (optional, as some systems may not report correct MIME types)
  // Remove:   if (file.type && !SUPPORTED_MIME_TYPES.includes(file.type)) {
  // Remove:   //   console.warn(`MIME type ${file.type} not in supported list, but continuing with extension check`);
  // Remove:   // }
    
  // Remove:   return { isValid: true };
  // Remove: };
  
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
      setPromptSuggestion(null); // clear suggestion
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
      // Try to suggest the closest valid UI command
      const suggestions = getClosestUICommands(prompt);
      if (suggestions.length > 0) {
        setPromptSuggestion(suggestions[0]);
        setUserFeedback(`Did you mean: "${suggestions[0]}"? Click to accept.`);
      } else {
        setPromptSuggestion(null);
        setUserFeedback('This looks like a UI command, but it is not recognized. Please use a supported format.');
      }
      return;
    }
    setPromptSuggestion(null);
    // 3. Otherwise, send to backend/AI
    handleRunAI();
  }

  // Add handler for accepting prompt suggestion
  function handleAcceptSuggestion() {
    if (promptSuggestion) {
      setPrompt(promptSuggestion);
      setPromptSuggestion(null);
      setTimeout(() => handleUserPrompt(), 0); // re-run with suggestion
    }
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
          {/* Only show prompt input after upload */}
          {spreadsheetData.length > 0 && (
            <div style={{ margin: '20px 0', textAlign: 'center' }}>
              <input
                type="text"
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleUserPrompt(); }}
                placeholder="Type a command or ask a question..."
                style={{ width: '60%', padding: '10px', fontSize: '1.1rem', borderRadius: 6, border: '1px solid #ccc', fontFamily: 'Hammersmith One, Segoe UI, Arial, sans-serif' }}
                autoFocus
              />
              <button
                onClick={handleUserPrompt}
                style={{ marginLeft: 12, padding: '10px 18px', fontSize: '1.1rem', borderRadius: 6, border: 'none', background: '#2563eb', color: 'white', fontWeight: 600, cursor: 'pointer' }}
                disabled={!prompt.trim() || aiLoading}
              >{aiLoading ? 'Processing...' : 'Go'}</button>
              {promptSuggestion && (
                <div style={{ marginTop: 10, color: '#fbbf24', background: '#1e293b', padding: '8px 16px', borderRadius: 6, display: 'inline-block', cursor: 'pointer', fontWeight: 500 }}
                  onClick={handleAcceptSuggestion}
                  title="Click to accept suggestion"
                >
                  Did you mean: <span style={{ textDecoration: 'underline', color: '#38bdf8' }}>{promptSuggestion}</span>?
                  <span style={{ marginLeft: 8, color: '#38bdf8' }}>[Click to accept]</span>
                </div>
              )}
            </div>
          )}
          {/* File upload UI remains unchanged */}
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
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                }}
              >
                <input
                  id="file-input"
                  type="file"
                  accept={SUPPORTED_EXTENSIONS.join(',')}
                  style={{ display: 'none' }}
                  onChange={e => {
                    if (e.target.files && e.target.files[0]) {
                      setSelectedFile(e.target.files[0]);
                      setFileError(null);
                    }
                  }}
                />
                <div style={{ fontSize: '1.2rem', color: '#60a5fa', fontWeight: 600, marginBottom: 16 }}>
                  Click or drag your Excel/CSV file here to upload
                </div>
                <div style={{ fontSize: '1rem', color: '#bfdbfe', marginBottom: 8 }}>
                  Supported formats: {SUPPORTED_EXTENSIONS.join(', ')}
                </div>
                {fileError && <div style={{ color: '#f87171', marginTop: 8 }}>{fileError}</div>}
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
              {aiLoading ? 'Processing file...' : 
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
                  opacity: !selectedFile || aiLoading ? 0.5 : 1
                }}
                disabled={!selectedFile || aiLoading}
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
                  opacity: !selectedFile || aiLoading ? 0.5 : 1
                }}
                disabled={!selectedFile || aiLoading}
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
          
          {selectedFile && !aiLoading && spreadsheetData.length > 0 && showSuccess && (
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
              headers={Array.isArray(spreadsheetData[0]) ? spreadsheetData[0].map(cell => String(cell ?? '')) : []}
              title="Spreadsheet Data"
              subtitle={`Rows: ${spreadsheetData.length} | Columns: ${spreadsheetData[0]?.length || 0}`}
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
              headers={Array.isArray(spreadsheetData[0]) ? spreadsheetData[0].map(cell => String(cell ?? '')) : []}
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
 
 