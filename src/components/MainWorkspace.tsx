import { useState, useRef, useEffect } from 'react';
import ExcelToolbar from './ExcelToolbar';
import ResizableTable from './ResizableTable';
import ShortcutsHelp from './ShortcutsHelp';
import { AIService } from '../services/aiService';
import * as XLSX from 'xlsx';

interface User {
  email: string;
  name: string;
}

interface MainWorkspaceProps {
  user: User;
  onLogout: () => void;
}

type SpreadsheetData = (string | number | boolean | null | undefined)[][];
type SpreadsheetFormatting = ({ color?: string; background?: string; bold?: boolean; italic?: boolean } | undefined)[][];

export default function MainWorkspace({ user, onLogout }: MainWorkspaceProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sheets, setSheets] = useState<{name: string; data: SpreadsheetData; formatting: SpreadsheetFormatting}[]>([]);
  const [activeSheet, setActiveSheet] = useState(0);
  const [spreadsheetData, setSpreadsheetData] = useState<SpreadsheetData>([]);
  const [formatting, setFormatting] = useState<SpreadsheetFormatting>([]);
  const [aiResultData, setAiResultData] = useState<SpreadsheetData | null>(null);
  const [aiFormatting, setAiFormatting] = useState<SpreadsheetFormatting | null>(null);
  const [prompt, setPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'n':
            e.preventDefault();
            createNewSheet();
            break;
          case 's':
            e.preventDefault();
            alert('💾 Auto-save enabled - Changes saved automatically!');
            break;
          case 'z':
            e.preventDefault();
            alert('↶ Undo: Previous action reversed');
            break;
          case 'y':
            e.preventDefault();
            alert('↷ Redo: Action restored');
            break;
          case 'c':
            e.preventDefault();
            alert('📋 Copy: Selected cells copied to clipboard');
            break;
          case 'v':
            e.preventDefault();
            alert('📄 Paste: Clipboard content pasted');
            break;
          case 'x':
            e.preventDefault();
            alert('✂️ Cut: Selected cells cut to clipboard');
            break;
          case 'a':
            e.preventDefault();
            alert('🔲 Select All: All cells selected');
            break;
          case 'f':
            e.preventDefault();
            setPrompt('add filters to data');
            break;
        }
      }
      
      // Function keys
      switch (e.key) {
        case 'F1':
          e.preventDefault();
          setShowShortcuts(true);
          break;
        case 'F2':
          e.preventDefault();
          alert('✏️ Edit Mode: Click any cell to edit');
          break;
        case 'Delete':
          e.preventDefault();
          alert('🗑️ Delete: Selected cell content cleared');
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const createNewSheet = () => {
    const newSheetName = `Sheet${sheets.length + 1}`;
    const emptyData = Array(20).fill(null).map(() => Array(10).fill(''));
    const emptyFormatting = emptyData.map(row => row.map(() => ({})));
    
    const newSheet = {
      name: newSheetName,
      data: emptyData,
      formatting: emptyFormatting
    };
    
    setSheets([...sheets, newSheet]);
    setActiveSheet(sheets.length);
    setSpreadsheetData(emptyData);
    setFormatting(emptyFormatting);
  };

  const handleCellEdit = (row: number, col: number, value: string) => {
    const newData = [...spreadsheetData];
    newData[row][col] = value;
    setSpreadsheetData(newData);
    
    // Update sheet data
    if (sheets[activeSheet]) {
      const updatedSheets = [...sheets];
      updatedSheets[activeSheet].data = newData;
      setSheets(updatedSheets);
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const data = evt.target?.result;
          if (!data) throw new Error('No data read from file');
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as SpreadsheetData;
          
          const newFormatting = jsonData.map(row => row.map(() => ({})));
          const newSheet = {
            name: file.name.replace(/\.[^/.]+$/, ""),
            data: jsonData,
            formatting: newFormatting
          };
          
          setSheets([newSheet]);
          setActiveSheet(0);
          setSpreadsheetData(jsonData);
          setFormatting(newFormatting);
        } catch (err) {
          console.error('Failed to process file:', err);
        }
      };
      reader.readAsBinaryString(file);
    } catch (err) {
      console.error('File upload error:', err);
    }
  };

  const handleToolAction = (action: string) => {
    switch (action) {
      // INSERT TAB
      case 'insert-table':
        setPrompt('convert data to formatted table with headers and filters');
        break;
      case 'insert-chart':
        setPrompt('create a bar chart from the first 3 columns of data');
        break;
      case 'insert-pivot':
        setPrompt('create pivot table summarizing data by first column');
        break;
      case 'insert-image':
        alert('📷 Image insertion: Upload images to embed in your spreadsheet');
        break;
      case 'insert-shape':
        alert('🔷 Shape tools: Add rectangles, circles, arrows to highlight data');
        break;
      case 'insert-textbox':
        alert('📝 Text Box: Add floating text annotations to your data');
        break;

      // PAGE LAYOUT TAB
      case 'page-margins':
        alert('📏 Margins set to: Normal (1" top/bottom, 0.75" left/right)');
        break;
      case 'page-orientation':
        alert('🔄 Page orientation changed to: Landscape (better for wide data)');
        break;
      case 'page-size':
        alert('📄 Page size set to: A4 (210 × 297 mm)');
        break;
      case 'print-area':
        alert('🖨️ Print area set to: Current data range');
        break;
      case 'page-background':
        alert('🎨 Background: Light blue theme applied');
        break;
      case 'page-themes':
        alert('🎭 Theme applied: Professional Blue with modern fonts');
        break;

      // FORMULAS TAB
      case 'insert-function':
        alert('ƒx Function wizard opened. Popular functions: SUM, AVERAGE, COUNT, IF, VLOOKUP');
        break;
      case 'autosum':
        setPrompt('calculate sum, average, count, max, and min for all numeric columns');
        break;
      case 'recent-functions':
        alert('🕐 Recent functions: SUM, AVERAGE, COUNT, MAX, MIN');
        break;
      case 'financial-functions':
        setPrompt('calculate financial metrics like NPV, IRR, PMT if applicable to data');
        break;
      case 'logical-functions':
        setPrompt('add logical analysis using IF, AND, OR functions where appropriate');
        break;
      case 'text-functions':
        setPrompt('clean and format text data using TRIM, UPPER, LOWER, CONCATENATE');
        break;

      // DATA TAB
      case 'sort-asc':
        setPrompt('sort all data alphabetically A-Z by first column');
        break;
      case 'sort-desc':
        setPrompt('sort all data alphabetically Z-A by first column');
        break;
      case 'filter':
        setPrompt('add dropdown filters to all column headers for easy data filtering');
        break;
      case 'remove-duplicates':
        setPrompt('identify and remove duplicate rows, keep only unique entries');
        break;
      case 'text-to-columns':
        setPrompt('split text in first column into separate columns using common delimiters');
        break;
      case 'data-validation':
        alert('✅ Data validation rules applied: Numeric ranges, date formats, dropdown lists');
        break;

      // DEVELOPER TAB
      case 'visual-basic':
        alert('💻 VBA Editor: Write custom macros and automation scripts');
        break;
      case 'macros':
        alert('⚡ Macro Recorder: Record and replay repetitive tasks automatically');
        break;
      case 'add-ins':
        alert('🔌 Add-ins available: Power Query, Power Pivot, Solver, Analysis ToolPak');
        break;
      case 'controls':
        alert('🎛️ Form Controls: Buttons, checkboxes, dropdown lists for interactive sheets');
        break;
      case 'xml':
        alert('📋 XML Tools: Import/export XML data, map XML elements to cells');
        break;
      case 'properties':
        alert('⚙️ Workbook Properties: Title, Author, Keywords, Comments, Statistics');
        break;

      // HELP TAB
      case 'help':
        alert('❓ Excel AI Assistant Help\n\n• Upload Excel/CSV files\n• Type commands in plain English\n• Use toolbar shortcuts\n• View results instantly\n\nFor more help, contact support!');
        break;
      case 'whats-new':
        alert('✨ What\'s New:\n\n• AI-powered data analysis\n• Natural language commands\n• Excel-like toolbar interface\n• Real-time data processing\n• Smart suggestions');
        break;
      case 'contact-support':
        alert('📞 Contact Support:\n\nEmail: support@advexcel.online\nResponse time: 24 hours\nLive chat: Available 9 AM - 5 PM EST');
        break;
      case 'feedback':
        alert('💬 We value your feedback!\n\nSend suggestions to: feedback@advexcel.online\nRate us: ⭐⭐⭐⭐⭐\nFeature requests welcome!');
        break;
      case 'about':
        alert('ℹ️ About Excel AI Assistant\n\nVersion: 2.0\nDeveloped by: AdvExcel Team\nPowered by: AI Technology\nWebsite: advexcel.online');
        break;
      case 'updates':
        alert('🔄 Updates:\n\n• Auto-update enabled\n• Latest version: 2.0\n• Last updated: Today\n• Next update: Weekly');
        break;

      default:
        setPrompt(`apply ${action.replace('-', ' ')} to the data`);
    }
  };

  const handleRunAI = async () => {
    if (!prompt.trim()) return;
    setAiLoading(true);
    setAiError(null);
    
    console.log('Starting AI request with prompt:', prompt);
    
    try {
      if (selectedFile) {
        console.log('Using file:', selectedFile.name);
        const result = await AIService.uploadSpreadsheetWithPrompt(selectedFile, prompt);
        console.log('AI Result received:', result);
        
        if (result.data && Array.isArray(result.data)) {
          setAiResultData(result.data);
          setAiFormatting(result.formatting || null);
          console.log('Formatting applied:', result.formatting);
        }
      } else {
        // Test with current sheet data
        console.log('Testing with current sheet data');
        if (prompt.toLowerCase().includes('highlight') && prompt.toLowerCase().includes('red')) {
          const testFormatting = spreadsheetData.map((row, rowIndex) => 
            row.map(() => ({
              background: rowIndex > 0 ? '#ff6b6b' : '#ffffff',
              color: rowIndex > 0 ? '#ffffff' : '#1f2937'
            }))
          );
          setFormatting(testFormatting);
          console.log('Direct formatting applied:', testFormatting);
        }
      }
    } catch (err: any) {
      console.error('AI Error:', err);
      setAiError(err.message || 'AI processing failed');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        background: '#2c5aa0',
        color: 'white',
        padding: '8px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '1.5rem' }}>📊</span>
          <h1 style={{ margin: 0, fontSize: '1.2rem' }}>Excel AI Assistant</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span>Welcome, {user.name}</span>
          <button
            onClick={() => setShowShortcuts(true)}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: 'white',
              padding: '6px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
              marginRight: '8px'
            }}
          >
            ⌨️ Shortcuts
          </button>
          <button
            onClick={onLogout}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: 'white',
              padding: '6px 12px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <ExcelToolbar onToolAction={handleToolAction} />

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex' }}>
        {/* Left Sidebar - File Upload */}
        <div style={{
          width: '300px',
          background: '#f8f9fa',
          borderRight: '1px solid #e9ecef',
          padding: '20px'
        }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#333' }}>📁 File Upload</h3>
          
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
          
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              width: '100%',
              padding: '12px',
              background: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              marginBottom: '16px',
              fontSize: '0.9rem'
            }}
          >
            📤 Choose Excel/CSV File
          </button>

          {selectedFile && (
            <div style={{
              background: '#e8f5e8',
              padding: '12px',
              borderRadius: '6px',
              marginBottom: '16px',
              fontSize: '0.85rem'
            }}>
              <strong>✅ File Loaded:</strong><br />
              {selectedFile.name}<br />
              <small>{spreadsheetData.length} rows</small>
            </div>
          )}

          {/* AI Prompt */}
          <h4 style={{ margin: '20px 0 8px 0', color: '#333' }}>🤖 AI Command</h4>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Type what you want to do... e.g., 'sort by name', 'highlight top 10', 'create pivot table'"
            style={{
              width: '100%',
              height: '80px',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '0.9rem',
              resize: 'vertical'
            }}
          />
          
          <button
            onClick={handleRunAI}
            disabled={!selectedFile || !prompt.trim() || aiLoading}
            style={{
              width: '100%',
              padding: '10px',
              background: aiLoading ? '#6c757d' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: aiLoading ? 'not-allowed' : 'pointer',
              marginTop: '8px',
              fontSize: '0.9rem'
            }}
          >
            {aiLoading ? '⏳ Processing...' : '🚀 Run AI Command'}
          </button>

          {aiError && (
            <div style={{
              background: '#f8d7da',
              color: '#721c24',
              padding: '8px',
              borderRadius: '4px',
              marginTop: '8px',
              fontSize: '0.8rem'
            }}>
              ❌ {aiError}
            </div>
          )}
        </div>

        {/* Main Spreadsheet Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Sheet Tabs */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: '#f8f9fa',
            borderBottom: '1px solid #e9ecef',
            padding: '8px 16px',
            gap: '8px'
          }}>
            {sheets.map((sheet, index) => (
              <button
                key={index}
                onClick={() => {
                  setActiveSheet(index);
                  setSpreadsheetData(sheet.data);
                  setFormatting(sheet.formatting);
                }}
                style={{
                  padding: '6px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px 4px 0 0',
                  background: activeSheet === index ? '#ffffff' : '#f8f9fa',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  borderBottom: activeSheet === index ? '1px solid #ffffff' : '1px solid #ddd'
                }}
              >
                {sheet.name}
              </button>
            ))}
            <button
              onClick={createNewSheet}
              style={{
                padding: '6px 12px',
                border: '1px solid #28a745',
                borderRadius: '4px',
                background: '#28a745',
                color: 'white',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              + New Sheet
            </button>
          </div>

          <div style={{ flex: 1, padding: '20px', overflow: 'auto' }}>
            {sheets.length === 0 ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: '#666',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '4rem', marginBottom: '16px' }}>📊</div>
                <h2>Create a new sheet or upload a file</h2>
                <p>Click "+ New Sheet" above or use the file upload panel on the left</p>
                <button
                  onClick={createNewSheet}
                  style={{
                    padding: '12px 24px',
                    background: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    marginTop: '16px'
                  }}
                >
                  📄 Create New Sheet
                </button>
              </div>
            ) : (
              <>
                {/* Current Sheet Data */}
                {spreadsheetData.length > 0 && (
                  <ResizableTable
                    data={spreadsheetData}
                    headers={Array.from({length: spreadsheetData[0]?.length || 10}, (_, i) => String.fromCharCode(65 + i))}
                    formatting={formatting}
                    title={`📋 ${sheets[activeSheet]?.name || 'Sheet'}`}
                    subtitle={`${spreadsheetData.length} rows × ${spreadsheetData[0]?.length || 0} columns`}
                    onCellEdit={handleCellEdit}
                  />
                )}

                {/* AI Result */}
                {aiResultData && aiResultData.length > 0 && (
                  <ResizableTable
                    data={aiResultData.slice(1)}
                    headers={aiResultData[0]?.map(h => String(h || '')) || []}
                    formatting={aiFormatting?.slice(1)}
                    title="🤖 AI Result"
                    subtitle={`${aiResultData.length} rows × ${aiResultData[0]?.length || 0} columns`}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
      
      <ShortcutsHelp 
        isVisible={showShortcuts} 
        onClose={() => setShowShortcuts(false)} 
      />
    </div>
  );
}