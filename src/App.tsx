import { useState, useEffect, useRef } from 'react';
import './App.css';
import { AIService } from './services/aiService';
import LandingPage from './LandingPage';
import ResizableTable from './components/ResizableTable';
import HelpPanel from './components/HelpPanel';
import Footer from './components/Footer';
import * as XLSX from 'xlsx';
import { Bar, Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement
} from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement, ArcElement);
import { DragDropContext, Droppable, Draggable, DropResult, DroppableProvided, DraggableProvided, DraggableStateSnapshot } from 'react-beautiful-dnd';

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



const presetColors: string[] = ['#e5e7eb', '#fbbf24', '#34d399', '#60a5fa', '#a78bfa', '#f472b6', '#f87171', '#facc15', '#38bdf8', '#6366f1'];

// Add a function to determine readable text color
function getContrastYIQ(hexcolor: string) {
  if (!hexcolor) return '#1e293b';
  hexcolor = hexcolor.replace('#', '');
  if (hexcolor.length === 3) hexcolor = hexcolor.split('').map(x => x + x).join('');
  const r = parseInt(hexcolor.substr(0,2),16);
  const g = parseInt(hexcolor.substr(2,2),16);
  const b = parseInt(hexcolor.substr(4,2),16);
  const yiq = ((r*299)+(g*587)+(b*114))/1000;
  return (yiq >= 128) ? '#1e293b' : '#fff';
}

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [spreadsheetData, setSpreadsheetData] = useState<SpreadsheetData>([]);
  const [formatting, setFormatting] = useState<SpreadsheetFormatting>([]);
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
  const [showChartModal, setShowChartModal] = useState(false);
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie'>('bar');
  const [chartRange, setChartRange] = useState<{ startRow: number; endRow: number; startCol: number; endCol: number }>({ startRow: 1, endRow: 1, startCol: 0, endCol: 0 });
  const [chartData, setChartData] = useState<any>(null);
  // Add state for pivot table
  const [showPivotModal, setShowPivotModal] = useState(false);
  const [pivotRows, setPivotRows] = useState<number[]>([]);
  const [pivotCols, setPivotCols] = useState<number[]>([]);
  const [pivotValue, setPivotValue] = useState<number | null>(null);
  const [pivotAgg, setPivotAgg] = useState<'sum' | 'count' | 'avg'>('sum');
  const [pivotResult, setPivotResult] = useState<any[][] | null>(null);
  // Add state for multi-sheet support
  const [sheets, setSheets] = useState<{ name: string; data: SpreadsheetData; color?: string; locked?: boolean }[]>([]);
  const [selectedSheet, setSelectedSheet] = useState(0);
  // Add state for renaming
  const [renamingSheet, setRenamingSheet] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [contextMenuSheet, setContextMenuSheet] = useState<number | null>(null);
  const [contextMenuAnchor, setContextMenuAnchor] = useState<{ x: number; y: number } | null>(null);
  const contextMenuRef = useRef<HTMLDivElement | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  

  
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
          setAiError(`${err.message}\n\nTo fix this:\n1. Make sure the backend server is running (npm start)\n2. Check if port 5001 is available\n3. Verify your AI API key is set in .env file`);
        } else if (err.message.includes('Rate limit') || err.message.includes('429')) {
          setAiError('Rate limit exceeded. Gemini free tier allows 15 requests/minute. Please wait a moment and try again.');
        } else if (err.message.includes('quota') || err.message.includes('QUOTA')) {
          setAiError('API quota exceeded. You may have reached your monthly limit. Try again later or check your Gemini API usage.');
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



  // Unified prompt handler
  function handleUserPrompt() {
    if (!prompt.trim() || !selectedFile) return;
    // 1. Try regex-based UI command parser for exact matches only
    const uiCommand = parseUICommand(prompt);
    if (uiCommand) {
      setPromptSuggestion(null);
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
    // 2. For everything else, send directly to AI
    setPromptSuggestion(null);
    handleRunAI();
  }



  const handleCellEdit = (row: number, col: number, value: string) => {
    if (isCurrentSheetLocked) return;
    setSpreadsheetData(prev => {
      const newData = prev.map(r => [...r]);
      newData[row][col] = value;
      return newData;
    });
  };

  const handleCellFormat = (row: number, col: number, fmt: any) => {
    setFormatting(prev => {
      const newFmt = prev.map(r => r ? [...r] : []);
      if (!newFmt[row]) newFmt[row] = [];
      newFmt[row][col] = { ...newFmt[row][col], ...fmt };
      return newFmt;
    });
  };

  // Update file upload logic to read all sheets
  const handleFileUpload = (jsonData: SpreadsheetData, allSheets?: { name: string; data: SpreadsheetData }[]) => {
    if (allSheets && allSheets.length > 0) {
      setSheets(allSheets.map(s => ({ ...s, locked: false })));
      setSelectedSheet(0);
      setSpreadsheetData(allSheets[0].data);
      setFormatting(allSheets[0].data.map(row => row.map(() => ({}))));
    } else {
      setSheets([{ name: 'Sheet1', data: jsonData, locked: false }]);
      setSelectedSheet(0);
      setSpreadsheetData(jsonData);
      setFormatting(jsonData.map(row => row.map(() => ({}))));
    }
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const reordered = Array.from(sheets);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    setSheets(reordered);
    // Adjust selectedSheet index if needed
    if (result.source.index === selectedSheet) {
      setSelectedSheet(result.destination.index);
    } else if (
      result.source.index < selectedSheet &&
      result.destination.index >= selectedSheet
    ) {
      setSelectedSheet(selectedSheet - 1);
    } else if (
      result.source.index > selectedSheet &&
      result.destination.index <= selectedSheet
    ) {
      setSelectedSheet(selectedSheet + 1);
    }
  };

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => setShowSuccess(false), 10000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  useEffect(() => {
    if (userFeedback) {
      const timer = setTimeout(() => setUserFeedback(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [userFeedback]);

  useEffect(() => {
    if (contextMenuSheet === null) return;
    function handleClick(e: MouseEvent) {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setContextMenuSheet(null);
        setContextMenuAnchor(null);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [contextMenuSheet]);

  if (showLanding) {
    return <LandingPage onBegin={() => setShowLanding(false)} />;
  }

  // Always show the actual application
  const isCurrentSheetLocked = sheets[selectedSheet]?.locked;
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
            <div>
              <h1 style={{
                fontSize: 'clamp(1.3rem, 4vw, 2.4rem)',
                fontWeight: 700,
                color: '#ffffff',
                textShadow: '0 2px 8px rgba(30, 58, 138, 0.5)',
                marginBottom: '10px',
                letterSpacing: 1,
                fontFamily: 'Hammersmith One, "Segoe UI", "Roboto", "Helvetica Neue", "Arial", sans-serif'
              }}>🤖 Excel AI Assistant</h1>
              <p style={{
                fontSize: 'clamp(0.9rem, 2vw, 1.2rem)',
                color: '#bfdbfe',
                fontWeight: 400,
                textShadow: '0 1px 4px rgba(30, 58, 138, 0.5)',
                lineHeight: 1.6,
                fontFamily: 'Hammersmith One, "Segoe UI", "Roboto", "Helvetica Neue", "Arial", sans-serif'
              }}>Upload Excel files → Type what you want → Get results instantly!</p>
            </div>
            <button
              onClick={() => setShowHelp(true)}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: '2px solid rgba(255,255,255,0.3)',
                borderRadius: '50%',
                width: '50px',
                height: '50px',
                color: 'white',
                fontSize: '24px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
              onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
              onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
              title="Need help? Click for examples!"
            >❓</button>
          </div>
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

            </div>
          )}
          {/* File upload UI remains unchanged */}
          {spreadsheetData.length === 0 && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '400px',
              width: '100%'
            }}>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <h2 style={{ color: '#60a5fa', fontSize: '1.5rem', marginBottom: '8px' }}>📁 Step 1: Upload Your File</h2>
                <p style={{ color: '#93c5fd', fontSize: '1rem', marginBottom: '20px' }}>Drag & drop or click to select Excel/CSV files</p>
              </div>
              <div
                onClick={() => document.getElementById('file-input')?.click()}
                style={{
                  width: 140,
                  height: 140,
                  borderRadius: '20px',
                  background: 'linear-gradient(145deg, #3b82f6 60%, #1e40af 100%)',
                  boxShadow: '0 8px 32px 0 rgba(30,64,175,0.25), 0 1.5px 4px 0 #2563eb',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  marginBottom: 24,
                  transition: 'transform 0.2s',
                  transform: 'scale(1)',
                  position: 'relative',
                  border: '4px solid #60a5fa',
                  animation: 'folder-bounce 1.5s infinite alternate',
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                title="Click to upload your Excel or CSV file"
              >
                {/* SVG 3D Folder Icon */}
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="folderBody" x1="0" y1="0" x2="0" y2="1" gradientTransform="rotate(20)">
                      <stop offset="0%" stopColor="#fbbf24"/>
                      <stop offset="100%" stopColor="#f59e42"/>
                    </linearGradient>
                    <linearGradient id="folderTop" x1="0" y1="0" x2="0" y2="1" gradientTransform="rotate(20)">
                      <stop offset="0%" stopColor="#fde68a"/>
                      <stop offset="100%" stopColor="#fbbf24"/>
                    </linearGradient>
                  </defs>
                  <rect x="8" y="24" width="48" height="28" rx="6" fill="url(#folderBody)"/>
                  <rect x="12" y="16" width="40" height="16" rx="4" fill="url(#folderTop)"/>
                  <rect x="20" y="12" width="12" height="8" rx="2" fill="#fde68a"/>
                  <ellipse cx="32" cy="52" rx="16" ry="4" fill="#fbbf24" fillOpacity="0.18"/>
                </svg>
              </div>
              <input
                id="file-input"
                type="file"
                accept={SUPPORTED_EXTENSIONS.join(',')}
                style={{ display: 'none' }}
                onChange={async e => {
                  if (e.target.files && e.target.files[0]) {
                    setSelectedFile(e.target.files[0]);
                    setFileError(null);
                    try {
                      const file = e.target.files[0];
                      const reader = new FileReader();
                      reader.onload = (evt) => {
                        try {
                          const data = evt.target?.result;
                          if (!data) throw new Error('No data read from file');
                          const workbook = XLSX.read(data, { type: 'binary' });
                          const allSheets = workbook.SheetNames.map(name => ({
                            name,
                            data: XLSX.utils.sheet_to_json(workbook.Sheets[name], { header: 1 }) as SpreadsheetData
                          }));
                          if (allSheets.length === 0 || allSheets[0].data.length === 0) throw new Error('No data found in the file');
                          handleFileUpload(allSheets[0].data as SpreadsheetData, allSheets);
                        } catch (err) {
                          setFileError('Failed to process file: ' + (err instanceof Error ? err.message : 'Unknown error'));
                          setSpreadsheetData([]);
                          setSheets([]);
                        }
                      };
                      reader.onerror = () => {
                        setFileError('Failed to read file');
                        setSpreadsheetData([]);
                        setSheets([]);
                      };
                      reader.readAsBinaryString(file);
                    } catch (err) {
                      setFileError('Failed to process file: ' + (err instanceof Error ? err.message : 'Unknown error'));
                      setSpreadsheetData([]);
                      setSheets([]);
                    }
                  }
                }}
              />
              <div style={{
                fontSize: '1.1rem',
                color: '#ffffff',
                fontWeight: 600,
                textAlign: 'center',
                lineHeight: '1.3'
              }}>
                📄 Click to Upload<br/>
                <span style={{ fontSize: '0.9rem', opacity: 0.9 }}>Excel • CSV • Up to 20MB</span>
              </div>
              <div style={{
                fontSize: '1.1rem',
                color: '#60a5fa',
                fontWeight: 700,
                marginTop: 12,
                letterSpacing: 1,
                textShadow: '0 2px 8px rgba(30, 58, 138, 0.15)'
              }}>
                🚀 Start Here!
              </div>
              {fileError && <div style={{ color: '#f87171', marginTop: 8 }}>{fileError}</div>}
              <style>{`
                @keyframes folder-bounce {
                  0% { box-shadow: 0 8px 32px 0 rgba(30,64,175,0.25), 0 1.5px 4px 0 #2563eb; transform: scale(1); }
                  100% { box-shadow: 0 16px 48px 0 rgba(30,64,175,0.35), 0 3px 8px 0 #2563eb; transform: scale(1.06); }
                }
              `}</style>
            </div>
          )}
          
          {sheets.length > 0 && (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="sheet-tabs" direction="horizontal">
                {(provided: DroppableProvided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center', position: 'relative' }}
                  >
                    {sheets.map((sheet, i) => (
                      <Draggable key={sheet.name + i} draggableId={sheet.name + i} index={i}>
                        {(dragProvided: DraggableProvided, dragSnapshot: DraggableStateSnapshot) => (
                          <div
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            style={{
                              ...dragProvided.draggableProps.style,
                              opacity: dragSnapshot.isDragging ? 0.7 : 1,
                              position: 'relative',
                              display: 'flex',
                              alignItems: 'center',
                              boxShadow: dragSnapshot.isDragging ? '0 0 0 3px #2563eb, 0 2px 8px #3b82f6' : undefined
                            }}
                          >
                            <span {...dragProvided.dragHandleProps} style={{ cursor: 'grab', marginRight: 2, userSelect: 'none' }}>☰</span>
                            {renamingSheet === i ? (
                              <input
                                value={renameValue}
                                autoFocus
                                onChange={e => setRenameValue(e.target.value)}
                                onBlur={() => {
                                  const trimmed = renameValue.trim();
                                  if (!trimmed || sheets.some((s, idx) => idx !== i && s.name === trimmed)) {
                                    setRenamingSheet(null);
                                    return;
                                  }
                                  setSheets(prev => prev.map((s, idx) => idx === i ? { ...s, name: trimmed } : s));
                                  setRenamingSheet(null);
                                }}
                                onKeyDown={e => {
                                  if (e.key === 'Enter') {
                                    const trimmed = renameValue.trim();
                                    if (!trimmed || sheets.some((s, idx) => idx !== i && s.name === trimmed)) {
                                      setRenamingSheet(null);
                                      return;
                                    }
                                    setSheets(prev => prev.map((s, idx) => idx === i ? { ...s, name: trimmed } : s));
                                    setRenamingSheet(null);
                                  } else if (e.key === 'Escape') {
                                    setRenamingSheet(null);
                                  }
                                }}
                                style={{
                                  padding: '6px 10px',
                                  borderRadius: 6,
                                  border: '1px solid #3b82f6',
                                  fontSize: '1rem',
                                  minWidth: 70
                                }}
                              />
                            ) : (
                              <button
                                onClick={() => {
                                  setSelectedSheet(i);
                                  setSpreadsheetData(sheet.data);
                                  setFormatting(sheet.data.map(row => row.map(() => ({}))));
                                }}
                                onDoubleClick={() => {
                                  setRenamingSheet(i);
                                  setRenameValue(sheet.name);
                                }}
                                style={{
                                  padding: '8px 18px',
                                  borderRadius: 6,
                                  border: i === selectedSheet ? '2px solid #2563eb' : '1px solid #e5e7eb',
                                  background: sheet.color || (i === selectedSheet ? '#3b82f6' : '#e5e7eb'),
                                  color: getContrastYIQ(sheet.color || (i === selectedSheet ? '#3b82f6' : '#e5e7eb')),
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  fontSize: '1rem',
                                  boxShadow: i === selectedSheet ? '0 2px 8px #3b82f6' : undefined,
                                  marginRight: 2,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 4
                                }}
                              >
                                {sheet.name}
                                {sheet.locked && <span style={{ marginLeft: 2, color: '#64748b', fontSize: 15 }} title="Sheet is locked">🔒</span>}
                              </button>
                            )}
                            {/* Context menu button */}
                            <span
                              onClick={e => {
                                e.stopPropagation();
                                setContextMenuSheet(i);
                                setContextMenuAnchor({ x: e.clientX, y: e.clientY });
                              }}
                              title="Sheet actions"
                              style={{ cursor: 'pointer', marginLeft: 2, color: '#64748b', fontSize: 18 }}
                            >
                              ⋮
                            </span>
                            {/* Rename icon */}
                            {renamingSheet !== i && (
                              <span
                                onClick={() => {
                                  setRenamingSheet(i);
                                  setRenameValue(sheet.name);
                                }}
                                title="Rename sheet"
                                style={{ cursor: 'pointer', marginLeft: 2, color: '#64748b', fontSize: 16 }}
                              >
                                ✏️
                              </span>
                            )}
                            {/* Delete icon */}
                            {sheets.length > 1 && (
                              <span
                                onClick={() => {
                                  if (sheets.length <= 1) return;
                                  setSheets(prev => prev.filter((_, idx) => idx !== i));
                                  if (selectedSheet === i) {
                                    setTimeout(() => setSelectedSheet(0), 0);
                                  } else if (selectedSheet > i) {
                                    setTimeout(() => setSelectedSheet(selectedSheet - 1), 0);
                                  }
                                }}
                                title="Delete sheet"
                                style={{ cursor: 'pointer', marginLeft: 2, color: '#ef4444', fontSize: 16 }}
                              >
                                🗑️
                              </span>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    {/* Add sheet button */}
                    <button
                      onClick={() => {
                        const newName = `Sheet${sheets.length + 1}`;
                        const blankData = Array(spreadsheetData.length > 0 ? spreadsheetData.length : 10).fill(null).map(() => Array(spreadsheetData[0]?.length || 5).fill(''));
                        setSheets(prev => [...prev, { name: newName, data: blankData, locked: false }]);
                        setSelectedSheet(sheets.length);
                        setSpreadsheetData(blankData);
                        setFormatting(blankData.map(row => row.map(() => ({}))));
                      }}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '50%',
                        border: 'none',
                        background: '#e5e7eb',
                        color: '#1e293b',
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontSize: '1.2rem',
                        marginLeft: 8
                      }}
                      title="Add new sheet"
                    >
                      +
                    </button>
                    {/* Context menu UI */}
                    {contextMenuSheet !== null && contextMenuAnchor && (
                      <div
                        ref={contextMenuRef}
                        style={{
                          position: 'fixed',
                          top: Math.min(contextMenuAnchor.y + 4, window.innerHeight - 220),
                          left: Math.min(contextMenuAnchor.x + 4, window.innerWidth - 180),
                          background: '#fff',
                          border: '1px solid #e5e7eb',
                          borderRadius: 8,
                          boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
                          zIndex: 1000,
                          minWidth: 160,
                          fontFamily: 'Hammersmith One, Segoe UI, Arial, sans-serif',
                          color: '#1e293b',
                          padding: 0
                        }}
                      >
                        <div style={{ padding: '10px 16px', cursor: 'pointer', transition: 'background 0.15s' }} onMouseOver={e => (e.currentTarget.style.background = '#f3f4f6')} onMouseOut={e => (e.currentTarget.style.background = 'transparent')} onClick={() => {
  if (contextMenuSheet !== null) {
    const original = sheets[contextMenuSheet];
    // Generate a unique name
    let baseName = original.name + ' Copy';
    let newName = baseName;
    let count = 1;
    while (sheets.some(s => s.name === newName)) {
      newName = baseName + (count++);
    }
    // Deep copy data and formatting if available
    const newData = original.data.map(row => [...row]);
    // If you have formatting, copy it as well (optional, if formatting is in sheet object)
    let newFormatting = undefined;
    if (formatting && selectedSheet === contextMenuSheet) {
      newFormatting = formatting.map(row => row.map(cell => ({ ...cell })));
    }
    setSheets(prev => [...prev, { ...original, name: newName, data: newData, locked: false }]);
    setSelectedSheet(sheets.length); // Select the new sheet
    if (newFormatting) setFormatting(newFormatting);
  }
  setContextMenuSheet(null);
  setContextMenuAnchor(null);
}}>Duplicate</div>
                        <div style={{ padding: '10px 16px', cursor: 'pointer', transition: 'background 0.15s' }} onMouseOver={e => (e.currentTarget.style.background = '#f3f4f6')} onMouseOut={e => (e.currentTarget.style.background = 'transparent')} onClick={() => { setRenamingSheet(contextMenuSheet); setRenameValue(sheets[contextMenuSheet!].name); setContextMenuSheet(null); setContextMenuAnchor(null); }}>Rename</div>
                        <div style={{ padding: '10px 16px', cursor: 'pointer', color: '#ef4444', transition: 'background 0.15s' }} onMouseOver={e => (e.currentTarget.style.background = '#fee2e2')} onMouseOut={e => (e.currentTarget.style.background = 'transparent')} onClick={() => { setSheets(prev => prev.filter((_, idx) => idx !== contextMenuSheet)); if (selectedSheet === contextMenuSheet) { setTimeout(() => setSelectedSheet(0), 0); } else if (selectedSheet > (contextMenuSheet ?? 0)) { setTimeout(() => setSelectedSheet(selectedSheet - 1), 0); } setContextMenuSheet(null); setContextMenuAnchor(null); }}>Delete</div>
                        <div style={{ padding: '10px 16px', cursor: 'pointer', position: 'relative', transition: 'background 0.15s' }} onMouseOver={e => (e.currentTarget.style.background = '#f3f4f6')} onMouseOut={e => (e.currentTarget.style.background = 'transparent')}>
                          Set Color
                          <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
                            {presetColors.map((color: string) => (
                              <span
                                key={color}
                                onClick={e => {
                                  e.stopPropagation();
                                  setSheets(prev => prev.map((s, idx) => idx === contextMenuSheet ? { ...s, color } : s));
                                  setContextMenuSheet(null);
                                  setContextMenuAnchor(null);
                                }}
                                style={{
                                  display: 'inline-block',
                                  width: 18,
                                  height: 18,
                                  borderRadius: '50%',
                                  background: color,
                                  border: '2px solid #e5e7eb',
                                  cursor: 'pointer',
                                  boxShadow: sheets[contextMenuSheet!]?.color === color ? '0 0 0 2px #3b82f6' : undefined
                                }}
                              />
                            ))}
                          </div>
                        </div>
                        <div style={{ padding: '10px 16px', cursor: 'pointer', transition: 'background 0.15s' }} onMouseOver={e => (e.currentTarget.style.background = '#f3f4f6')} onMouseOut={e => (e.currentTarget.style.background = 'transparent')} onClick={() => {
  if (contextMenuSheet !== null) {
    setSheets(prev => prev.map((s, idx) => idx === contextMenuSheet ? { ...s, locked: !s.locked } : s));
  }
  setContextMenuSheet(null);
  setContextMenuAnchor(null);
}}>{sheets[contextMenuSheet!]?.locked ? 'Unlock' : 'Lock'} Sheet</div>
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
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
                onClick={() => {
                  if (!spreadsheetData.length) return;
                  const ws = XLSX.utils.aoa_to_sheet(spreadsheetData);
                  const wb = XLSX.utils.book_new();
                  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
                  XLSX.writeFile(wb, 'spreadsheet.xlsx');
                }}
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
                onClick={() => {
                  if (!spreadsheetData.length) return;
                  const csv = spreadsheetData.map(row => row.map(cell => `"${cell || ''}"`).join(',')).join('\n');
                  const blob = new Blob([csv], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'spreadsheet.csv';
                  a.click();
                  URL.revokeObjectURL(url);
                }}
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
              formatting={formatting.slice(1)}
              title="Spreadsheet Data"
              subtitle={`Rows: ${spreadsheetData.length} | Columns: ${spreadsheetData[0]?.length || 0}`}
              onCellEdit={handleCellEdit}
              onCellFormat={handleCellFormat}
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
      
      <Footer />
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
      {/* Chart Modal UI */}
      {showChartModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(30, 41, 59, 0.4)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', borderRadius: 12, padding: 32, minWidth: 320, boxShadow: '0 8px 32px 0 rgba(30,64,175,0.15)' }}>
            <h3 style={{ color: '#1e293b', marginBottom: 16 }}>Create Chart</h3>
            <div style={{ marginBottom: 12 }}>
              <label>Chart Type: </label>
              <select value={chartType} onChange={e => setChartType(e.target.value as any)} style={{ fontSize: '1rem', marginLeft: 8 }}>
                <option value="bar">Bar</option>
                <option value="line">Line</option>
                <option value="pie">Pie</option>
              </select>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label>Data Range (row 1 = headers):</label>
              <div style={{ marginTop: 6 }}>
                <input type="number" min={1} max={spreadsheetData.length - 1} value={chartRange.startRow} onChange={e => setChartRange(r => ({ ...r, startRow: Number(e.target.value) }))} style={{ width: 50, marginRight: 4 }} />
                to
                <input type="number" min={1} max={spreadsheetData.length - 1} value={chartRange.endRow} onChange={e => setChartRange(r => ({ ...r, endRow: Number(e.target.value) }))} style={{ width: 50, marginLeft: 4, marginRight: 12 }} />
                Col
                <input type="number" min={0} max={spreadsheetData[0]?.length - 1} value={chartRange.startCol} onChange={e => setChartRange(r => ({ ...r, startCol: Number(e.target.value) }))} style={{ width: 40, marginLeft: 4 }} />
                to
                <input type="number" min={0} max={spreadsheetData[0]?.length - 1} value={chartRange.endCol} onChange={e => setChartRange(r => ({ ...r, endCol: Number(e.target.value) }))} style={{ width: 40, marginLeft: 4 }} />
              </div>
            </div>
            <div style={{ marginTop: 18, display: 'flex', gap: 12 }}>
              <button
                onClick={() => {
                  // Prepare chart data
                  const labels = spreadsheetData.slice(chartRange.startRow, chartRange.endRow + 1).map((_, i) => `Row ${chartRange.startRow + i}`);
                  const data = spreadsheetData.slice(chartRange.startRow, chartRange.endRow + 1).map(row => row.slice(chartRange.startCol, chartRange.endCol + 1).map(Number));
                  const flatData = data.map(arr => arr[0]);
                  setChartData({
                    labels,
                    datasets: [
                      {
                        label: spreadsheetData[0][chartRange.startCol],
                        data: chartType === 'pie' ? flatData : data.map(arr => arr[0]),
                        backgroundColor: chartType === 'pie' ? [
                          '#3b82f6', '#f59e42', '#fbbf24', '#10b981', '#ef4444', '#6366f1', '#f472b6', '#facc15', '#a3e635', '#38bdf8'
                        ] : '#3b82f6',
                        borderColor: '#1e40af',
                        borderWidth: 1
                      }
                    ]
                  });
                  setShowChartModal(false);
                }}
                style={{ padding: '8px 18px', borderRadius: 6, border: 'none', background: '#3b82f6', color: 'white', fontWeight: 600, cursor: 'pointer', fontSize: '1rem' }}
              >
                Create
              </button>
              <button
                onClick={() => setShowChartModal(false)}
                style={{ padding: '8px 18px', borderRadius: 6, border: 'none', background: '#e5e7eb', color: '#1e293b', fontWeight: 600, cursor: 'pointer', fontSize: '1rem' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Render chart below the table */}
      {chartData && (
        <div style={{ margin: '32px 0', background: 'white', borderRadius: 12, boxShadow: '0 4px 16px rgba(30,64,175,0.08)', padding: 24 }}>
          <h3 style={{ color: '#1e293b', marginBottom: 16 }}>Chart</h3>
          {chartType === 'bar' && <Bar data={chartData} />}
          {chartType === 'line' && <Line data={chartData} />}
          {chartType === 'pie' && <Pie data={chartData} />}
        </div>
      )}
      {/* Pivot Table Modal UI */}
      {showPivotModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(30, 41, 59, 0.4)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', borderRadius: 12, padding: 32, minWidth: 340, boxShadow: '0 8px 32px 0 rgba(30,64,175,0.15)' }}>
            <h3 style={{ color: '#1e293b', marginBottom: 16 }}>Create Pivot Table</h3>
            <div style={{ marginBottom: 12 }}>
              <label>Rows: </label>
              <select multiple value={pivotRows.map(String)} onChange={e => setPivotRows(Array.from(e.target.selectedOptions, o => Number(o.value)))} style={{ fontSize: '1rem', marginLeft: 8, minWidth: 120, height: 60 }}>
                {spreadsheetData[0]?.map((h, i) => <option key={i} value={i}>{h}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label>Columns: </label>
              <select multiple value={pivotCols.map(String)} onChange={e => setPivotCols(Array.from(e.target.selectedOptions, o => Number(o.value)))} style={{ fontSize: '1rem', marginLeft: 8, minWidth: 120, height: 60 }}>
                {spreadsheetData[0]?.map((h, i) => <option key={i} value={i}>{h}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label>Values: </label>
              <select value={pivotValue ?? ''} onChange={e => setPivotValue(Number(e.target.value))} style={{ fontSize: '1rem', marginLeft: 8, minWidth: 120 }}>
                <option value="">Select...</option>
                {spreadsheetData[0]?.map((h, i) => <option key={i} value={i}>{h}</option>)}
              </select>
              <select value={pivotAgg} onChange={e => setPivotAgg(e.target.value as any)} style={{ fontSize: '1rem', marginLeft: 8 }}>
                <option value="sum">Sum</option>
                <option value="count">Count</option>
                <option value="avg">Average</option>
              </select>
            </div>
            <div style={{ marginTop: 18, display: 'flex', gap: 12 }}>
              <button
                onClick={() => {
                  // Compute pivot table
                  if (pivotValue == null) return;
                  const rows = spreadsheetData.slice(1);
                  const rowKeys = Array.from(new Set(rows.map(r => pivotRows.map(i => r[i]).join('|'))));
                  const colKeys = Array.from(new Set(rows.map(r => pivotCols.map(i => r[i]).join('|'))));
                  const result: any[][] = [];
                  result.push(['', ...colKeys]);
                  rowKeys.forEach(rk => {
                    const row: any[] = [rk];
                    colKeys.forEach(ck => {
                      const vals = rows.filter(r =>
                        pivotRows.map(i => r[i]).join('|') === rk &&
                        pivotCols.map(i => r[i]).join('|') === ck
                      ).map(r => Number(r[pivotValue]));
                      let val: any = '';
                      if (pivotAgg === 'sum') val = vals.reduce((a, b) => a + b, 0);
                      if (pivotAgg === 'count') val = vals.length;
                      if (pivotAgg === 'avg') val = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : '';
                      row.push(val);
                    });
                    result.push(row);
                  });
                  setPivotResult(result);
                  setShowPivotModal(false);
                }}
                style={{ padding: '8px 18px', borderRadius: 6, border: 'none', background: '#10b981', color: 'white', fontWeight: 600, cursor: 'pointer', fontSize: '1rem' }}
              >
                Create
              </button>
              <button
                onClick={() => setShowPivotModal(false)}
                style={{ padding: '8px 18px', borderRadius: 6, border: 'none', background: '#e5e7eb', color: '#1e293b', fontWeight: 600, cursor: 'pointer', fontSize: '1rem' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Render pivot table below the main table */}
      {pivotResult && (
        <div style={{ margin: '32px 0', background: 'white', borderRadius: 12, boxShadow: '0 4px 16px rgba(30,64,175,0.08)', padding: 24 }}>
          <h3 style={{ color: '#1e293b', marginBottom: 16 }}>Pivot Table</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Calibri, Segoe UI, Arial, sans-serif', fontSize: 14 }}>
            <tbody>
              {pivotResult.map((rowArr, i) => (
                <tr key={i}>
                  {rowArr.map((cell, j) => (
                    <td key={j} style={{ border: '1px solid #e5e7eb', padding: 8, fontWeight: i === 0 ? 700 : 400, background: i === 0 ? '#f1f5f9' : 'white' }}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default App;
 
 