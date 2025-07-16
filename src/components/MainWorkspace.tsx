import { useState, useRef } from 'react';
import ExcelToolbar from './ExcelToolbar';
import ResizableTable from './ResizableTable';
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
  const [spreadsheetData, setSpreadsheetData] = useState<SpreadsheetData>([]);
  const [formatting, setFormatting] = useState<SpreadsheetFormatting>([]);
  const [aiResultData, setAiResultData] = useState<SpreadsheetData | null>(null);
  const [aiFormatting, setAiFormatting] = useState<SpreadsheetFormatting | null>(null);
  const [prompt, setPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
          
          setSpreadsheetData(jsonData);
          setFormatting(jsonData.map(row => row.map(() => ({}))));
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
      case 'sort-asc':
        setPrompt('sort data alphabetically A-Z');
        break;
      case 'sort-desc':
        setPrompt('sort data alphabetically Z-A');
        break;
      case 'filter':
        setPrompt('add filters to data');
        break;
      case 'insert-chart':
        setPrompt('create a chart from this data');
        break;
      case 'insert-pivot':
        setPrompt('create pivot table');
        break;
      case 'autosum':
        setPrompt('calculate sum of numeric columns');
        break;
      case 'remove-duplicates':
        setPrompt('remove duplicate rows');
        break;
      default:
        setPrompt(`apply ${action.replace('-', ' ')}`);
    }
  };

  const handleRunAI = async () => {
    if (!prompt.trim() || !selectedFile) return;
    setAiLoading(true);
    setAiError(null);
    
    try {
      const result = await AIService.uploadSpreadsheetWithPrompt(selectedFile, prompt);
      if (result.data && Array.isArray(result.data)) {
        setAiResultData(result.data);
        setAiFormatting(result.formatting || null);
      }
    } catch (err: any) {
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
        <div style={{ flex: 1, padding: '20px', overflow: 'auto' }}>
          {!selectedFile ? (
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
              <h2>Upload an Excel or CSV file to get started</h2>
              <p>Use the file upload panel on the left or click the toolbar buttons above</p>
            </div>
          ) : (
            <>
              {/* Original Data */}
              {spreadsheetData.length > 0 && (
                <ResizableTable
                  data={spreadsheetData.slice(1)}
                  headers={spreadsheetData[0]?.map(h => String(h || '')) || []}
                  formatting={formatting.slice(1)}
                  title="📋 Original Data"
                  subtitle={`${spreadsheetData.length} rows × ${spreadsheetData[0]?.length || 0} columns`}
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
  );
}