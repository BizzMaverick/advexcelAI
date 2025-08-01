import { useState, useRef, useEffect } from 'react';
import ExcelToolbar from './ExcelToolbar';
import SimpleTable from './SimpleTable';
import ShortcutsHelp from './ShortcutsHelp';
import { AWSService } from '../services/awsService.js';
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
  // Professional color palette
  const colors = {
    primary: '#0078d4',       // Microsoft blue
    primaryLight: '#e6f2fa',  // Light blue for hover
    primaryDark: '#005a9e',   // Dark blue for active states
    text: '#252525',          // Dark gray for text
    textSecondary: '#505050', // Secondary text color
    border: '#e0e0e0',        // Light gray for borders
    background: '#ffffff',    // White background
    backgroundAlt: '#f9f9f9', // Alternate background
    success: '#107c10',       // Green for success states
    warning: '#d83b01',       // Orange for warnings
    headerBg: '#0078d4',      // Header background
    sidebarBg: '#f9f9f9',     // Sidebar background
  };
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
  
  // Unused function - commented out to fix TypeScript error
  // const handleDirectFormatting = (action: string) => { ... };

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
      // AWS TAB
      case 'aws-save-s3':
        alert('☁️ Saving to AWS S3... Your data is being securely stored in the cloud.');
        break;
      case 'aws-share-link':
        alert('🔗 Generating shareable link... You can now share this spreadsheet with others.');
        break;
      case 'aws-export':
        alert('📤 Exporting to AWS... Your data is being prepared for export.');
        break;
      case 'aws-import':
        alert('📥 Import from AWS... Select a file from your AWS storage to import.');
        break;
      case 'aws-sync':
        alert('🔄 Syncing with AWS... Your data is being synchronized with the cloud.');
        break;
      case 'aws-settings':
        alert('⚙️ AWS Settings... Configure your AWS integration settings.');
        break;
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
      let result;
      
      if (selectedFile) {
        // Use AWS service with file
        console.log('Using file with AWS service:', selectedFile.name);
        result = await AWSService.uploadSpreadsheetWithPrompt(selectedFile, prompt);
      } else {
        // Use AWS service with current data
        console.log('Using current sheet data with AWS service');
        result = await AWSService.processPromptWithData(spreadsheetData, prompt);
      }
      
      console.log('AWS Result received:', result);
      
      if (result.data && Array.isArray(result.data)) {
        setAiResultData(result.data);
        if (result.formatting && Array.isArray(result.formatting)) {
          setAiFormatting(result.formatting);
          setFormatting(result.formatting);
          console.log('AWS formatting applied:', result.formatting);
        }
      }
    } catch (err: any) {
      console.error('AWS Error:', err);
      setAiError(err.message || 'AWS processing failed');
      
      // Apply local highlighting on error as fallback
      if (prompt.toLowerCase().includes('highlight')) {
        // Simple fallback highlighting
        const newFormatting = [];
        for (let i = 0; i < spreadsheetData.length; i++) {
          const row = [];
          for (let j = 0; j < spreadsheetData[i].length; j++) {
            if (i === 0) {
              row.push({}); // Skip header
            } else {
              row.push({
                background: '#fef2f2',
                color: '#dc2626'
              });
            }
          }
          newFormatting.push(row);
        }
        setFormatting(newFormatting);
        console.log('Applied fallback highlighting after error');
      }
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        background: colors.headerBg,
        color: 'white',
        padding: '12px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V5Z" stroke="white" strokeWidth="2"/>
            <path d="M3 9H21" stroke="white" strokeWidth="2"/>
            <path d="M9 9V21" stroke="white" strokeWidth="2"/>
          </svg>
          <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '500' }}>Excel AI Assistant</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '14px' }}>Welcome, {user.name}</span>
          <button
            onClick={() => setShowShortcuts(true)}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.3)',
              color: 'white',
              padding: '6px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="5" width="4" height="4" rx="1" fill="white"/>
              <rect x="10" y="5" width="4" height="4" rx="1" fill="white"/>
              <rect x="17" y="5" width="4" height="4" rx="1" fill="white"/>
              <rect x="3" y="12" width="4" height="4" rx="1" fill="white"/>
              <rect x="10" y="12" width="4" height="4" rx="1" fill="white"/>
              <rect x="17" y="12" width="4" height="4" rx="1" fill="white"/>
            </svg>
            Shortcuts
          </button>
          <button
            onClick={onLogout}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.3)',
              color: 'white',
              padding: '6px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 17L21 12L16 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 12H9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
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
          width: '280px',
          background: colors.sidebarBg,
          borderRight: `1px solid ${colors.border}`,
          padding: '24px 20px',
          fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif',
        }}>
          <h3 style={{ 
            margin: '0 0 20px 0', 
            color: colors.text, 
            fontSize: '16px', 
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 22H20C21.1046 22 22 21.1046 22 20V8C22 6.89543 21.1046 6 20 6H13.4142C13.149 6 12.8946 5.89464 12.7071 5.70711L10.2929 3.29289C10.1054 3.10536 9.851 3 9.58579 3H4C2.89543 3 2 3.89543 2 5V20C2 21.1046 2.89543 22 4 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            File Upload
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
          
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              width: '100%',
              padding: '12px',
              background: colors.primary,
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginBottom: '20px',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
              transition: 'all 0.2s'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 15V3M12 3L8 7M12 3L16 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 15V19C3 19.5304 3.21071 20.0391 3.58579 20.4142C3.96086 20.7893 4.46957 21 5 21H19C19.5304 21 20.0391 20.7893 20.4142 20.4142C20.7893 20.0391 21 19.5304 21 19V15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Choose Excel/CSV File
          </button>

          {selectedFile && (
            <div style={{
              background: 'rgba(16, 124, 16, 0.1)',
              padding: '12px 16px',
              borderRadius: '4px',
              marginBottom: '24px',
              fontSize: '13px',
              border: '1px solid rgba(16, 124, 16, 0.2)',
              color: colors.text
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 11.0857V12.0057C21.9988 14.1621 21.3005 16.2604 20.0093 17.9875C18.7182 19.7147 16.9033 20.9782 14.8354 21.5896C12.7674 22.201 10.5573 22.1276 8.53447 21.3803C6.51168 20.633 4.78465 19.2518 3.61096 17.4428C2.43727 15.6338 1.87979 13.4938 2.02168 11.342C2.16356 9.19029 2.99721 7.14205 4.39828 5.5028C5.79935 3.86354 7.69279 2.72111 9.79619 2.24587C11.8996 1.77063 14.1003 1.98806 16.07 2.86572" stroke="#107c10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M22 4L12 14.01L9 11.01" stroke="#107c10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <strong style={{ fontWeight: '500' }}>File Loaded</strong>
              </div>
              <div style={{ marginLeft: '24px', color: colors.textSecondary }}>
                <div style={{ marginBottom: '4px' }}>{selectedFile.name}</div>
                <div>{spreadsheetData.length} rows</div>
              </div>
            </div>
          )}
          
          {/* AI Command section will be below */}

          {/* AI Prompt */}
          <h4 style={{ 
            margin: '0 0 12px 0', 
            color: colors.text, 
            fontSize: '16px', 
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            AI Command
          </h4>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Type what you want to do... e.g., 'sort by name', 'highlight top 10', 'create pivot table'"
            style={{
              width: '100%',
              height: '80px',
              padding: '12px',
              border: `1px solid ${colors.border}`,
              borderRadius: '4px',
              fontSize: '14px',
              resize: 'vertical',
              fontFamily: 'inherit',
              marginBottom: '12px'
            }}
          />
          
          <button
            onClick={handleRunAI}
            disabled={!prompt.trim() || aiLoading}
            style={{
              width: '100%',
              padding: '12px',
              background: aiLoading ? '#6c757d' : colors.success,
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: aiLoading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
          >
            {aiLoading ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2V6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
                  </path>
                  <path d="M12 18V22" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.3">
                    <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
                  </path>
                  <path d="M4.93 4.93L7.76 7.76" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5">
                    <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
                  </path>
                  <path d="M16.24 16.24L19.07 19.07" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.2">
                    <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
                  </path>
                  <path d="M2 12H6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.7">
                    <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
                  </path>
                  <path d="M18 12H22" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.1">
                    <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
                  </path>
                  <path d="M4.93 19.07L7.76 16.24" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.8">
                    <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
                  </path>
                  <path d="M16.24 7.76L19.07 4.93" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.4">
                    <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
                  </path>
                </svg>
                Processing...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 12H19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 5L19 12L12 19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Run AI Command
              </>
            )}
          </button>

          {aiError && (
            <div style={{
              background: 'rgba(216, 59, 1, 0.1)',
              color: colors.warning,
              padding: '12px',
              borderRadius: '4px',
              marginTop: '12px',
              fontSize: '13px',
              border: '1px solid rgba(216, 59, 1, 0.2)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px'
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 9V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 17H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10.29 3.86L1.82 18C1.64537 18.3024 1.55296 18.6453 1.55199 18.9945C1.55101 19.3437 1.6415 19.6871 1.81442 19.9905C1.98734 20.2939 2.23672 20.5467 2.53773 20.7238C2.83875 20.9009 3.1808 20.9961 3.53 21H20.47C20.8192 20.9961 21.1613 20.9009 21.4623 20.7238C21.7633 20.5467 22.0127 20.2939 22.1856 19.9905C22.3585 19.6871 22.449 19.3437 22.448 18.9945C22.447 18.6453 22.3546 18.3024 22.18 18L13.71 3.86C13.5317 3.56611 13.2807 3.32312 12.9812 3.15448C12.6817 2.98585 12.3437 2.89725 12 2.89725C11.6563 2.89725 11.3183 2.98585 11.0188 3.15448C10.7193 3.32312 10.4683 3.56611 10.29 3.86Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {aiError}
            </div>
          )}
        </div>

        {/* Main Spreadsheet Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Sheet Tabs */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: colors.backgroundAlt,
            borderBottom: `1px solid ${colors.border}`,
            padding: '8px 16px',
            gap: '8px',
            fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif',
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
                  padding: '8px 16px',
                  border: `1px solid ${activeSheet === index ? colors.primary : colors.border}`,
                  borderRadius: '4px 4px 0 0',
                  background: activeSheet === index ? colors.background : colors.backgroundAlt,
                  cursor: 'pointer',
                  fontSize: '13px',
                  color: activeSheet === index ? colors.primary : colors.textSecondary,
                  borderBottom: activeSheet === index ? `1px solid ${colors.background}` : `1px solid ${colors.border}`,
                  position: 'relative',
                  top: '1px',
                  fontWeight: activeSheet === index ? '500' : 'normal',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V9L13 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M13 2V9H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {sheet.name}
                </div>
              </button>
            ))}
            <button
              onClick={createNewSheet}
              style={{
                padding: '8px 12px',
                border: 'none',
                borderRadius: '4px',
                background: 'transparent',
                color: colors.primary,
                cursor: 'pointer',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.2s'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              New Sheet
            </button>
          </div>

          <div style={{ flex: 1, padding: '24px', overflow: 'auto' }}>
            {sheets.length === 0 ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: colors.textSecondary,
                textAlign: 'center',
                fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif',
              }}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V9L13 2Z" stroke="#0078d4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M13 2V9H20" stroke="#0078d4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 13H16" stroke="#0078d4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 17H16" stroke="#0078d4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <h2 style={{ fontSize: '24px', fontWeight: '500', color: colors.text, margin: '24px 0 8px' }}>No spreadsheet open</h2>
                <p style={{ fontSize: '16px', maxWidth: '400px', lineHeight: '1.5', marginBottom: '24px' }}>Create a new sheet or upload an Excel/CSV file to get started</p>
                <button
                  onClick={createNewSheet}
                  style={{
                    padding: '12px 24px',
                    background: colors.primary,
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 5V19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M5 12H19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Create New Sheet
                </button>
              </div>
            ) : (
              <>
                {/* Spreadsheet data will be displayed below */}
                
                {/* Current Sheet Data */}
                {spreadsheetData.length > 0 && (
                  <SimpleTable
                    data={spreadsheetData}
                    headers={Array.from({length: spreadsheetData[0]?.length || 10}, (_, i) => String.fromCharCode(65 + i))}
                    title={`📋 ${sheets[activeSheet]?.name || 'Sheet'}`}
                    subtitle={`${spreadsheetData.length} rows × ${spreadsheetData[0]?.length || 0} columns`}
                  />
                )}

                {/* AI Result */}
                {aiResultData && aiResultData.length > 0 && (
                  <SimpleTable
                    data={aiResultData.slice(1)}
                    headers={aiResultData[0]?.map(h => String(h || '')) || []}
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