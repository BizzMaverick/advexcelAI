//import React from 'react';
import { useState } from 'react';
import * as XLSX from 'xlsx';
import Spreadsheet from 'react-spreadsheet';
import { AIService } from './services/aiService';
import type { ExcelOperation } from './services/aiService';
import { ApiKeyStatus } from './components/ApiKeyStatus';

const features = [
  {
    icon: '🤖',
    title: 'AI-Powered Excel Automation',
    description: 'Let AI handle formulas, data cleaning, and repetitive tasks instantly.'
  },
  {
    icon: '💬',
    title: 'Natural Language Prompts',
    description: 'Just type what you want—no coding or complex formulas needed.'
  },
  {
    icon: '📊',
    title: 'Advanced Analytics',
    description: 'Get instant insights, trends, and visualizations from your data.'
  },
  {
    icon: '🔒',
    title: 'Secure & Private',
    description: 'Your data stays safe and private—always.'
  }
];

const LandingPage = () => {
  const [showUploader, setShowUploader] = useState(false);
  const [sheetLoaded, setSheetLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [spreadsheetData, setSpreadsheetData] = useState<any[][]>([]);
  const [rawData, setRawData] = useState<any[][]>([]);
  const [showHeaderConfig, setShowHeaderConfig] = useState(false);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [lastOperation, setLastOperation] = useState<ExcelOperation | null>(null);
  const [apiKeyValid, setApiKeyValid] = useState(false);

    const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      console.log('No file selected');
      return;
    }
    
    setIsLoading(true);
    console.log('File selected:', file.name, file.size);
    
    try {
      const data = await file.arrayBuffer();
      console.log('File data loaded, size:', data.byteLength);
      
      const workbook = XLSX.read(data);
      console.log('Workbook loaded, sheets:', workbook.SheetNames);
      
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const json: (string | number | null)[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      
      console.log('Sheet data converted to JSON, rows:', json.length);
      
      // Convert to react-spreadsheet format
      const spreadsheetData = json.map(row => 
        row.map(cell => ({ value: cell || '' }))
      );
      
      console.log('Spreadsheet data prepared:', spreadsheetData);
      setRawData(spreadsheetData);
      setShowHeaderConfig(true);
      console.log('File uploaded successfully! Please configure headers.');
      
    } catch (error) {
      console.error('Error processing file:', error);
      alert('Error processing file. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleHeaderConfig = (headerRowIndex: number) => {
    if (rawData.length === 0) return;
    
    // Use the specified row as headers
    const headers = rawData[headerRowIndex]?.map(cell => cell?.value || '') || [];
    const dataRows = rawData.filter((_, index) => index !== headerRowIndex);
    
    // Create new spreadsheet data with proper headers
    const newSpreadsheetData = [
      headers.map(header => ({ value: header })),
      ...dataRows
    ];
    
    setSpreadsheetData(newSpreadsheetData);
    setShowHeaderConfig(false);
    setSheetLoaded(true);
    console.log('Headers configured:', headers);
  };

  const handleAIProcessing = async () => {
    if (!prompt.trim() || !spreadsheetData.length) return;
    
    setIsProcessingAI(true);
    setLastOperation(null);
    
    try {
      console.log('Processing AI prompt:', prompt);
      console.log('Spreadsheet data structure:', {
        totalRows: spreadsheetData.length,
        headers: spreadsheetData[0]?.map(cell => cell?.value),
        firstDataRow: spreadsheetData[1]?.map(cell => cell?.value)
      });
      
      const result = await AIService.processExcelPrompt(
        prompt,
        spreadsheetData,
        spreadsheetData
      );
      
      console.log('AI processing result:', result);
      
      setSpreadsheetData(result.newData);
      setLastOperation(result.operation);
      setPrompt('');
      
    } catch (error) {
      console.error('AI processing error:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Error processing AI request. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('API key not configured')) {
          errorMessage = 'OpenAI API key not configured. Please check your .env file.';
        } else if (error.message.includes('401')) {
          errorMessage = 'Invalid OpenAI API key. Please check your API key.';
        } else if (error.message.includes('429')) {
          errorMessage = 'Rate limit exceeded. Please try again later.';
        } else if (error.message.includes('network')) {
          errorMessage = 'Network error. Please check your internet connection.';
        }
      }
      
      alert(errorMessage);
    } finally {
      setIsProcessingAI(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(120deg, #23243a 0%, #23243a 60%, #23243a 100%)',
      padding: 0,
      margin: 0,
    }}>
      <img src="/logo.png" alt="Excel Pro Logo" style={{ height: 64, marginBottom: 24, borderRadius: 12, boxShadow: '0 2px 8px #0002' }} />
      <h1 style={{ fontSize: 48, fontWeight: 800, margin: 0, color: '#fff', textAlign: 'center' }}>Excel Pro AI</h1>
      {!showUploader && (
        <>
          <p style={{ fontSize: 22, color: '#bfc4d1', margin: '18px 0 32px 0', textAlign: 'center', maxWidth: 600 }}>
            AI-powered Excel automation and analytics for everyone. <br />
            <span style={{ fontWeight: 500 }}>
              <button
                style={{
                  background: 'linear-gradient(90deg, #6a8dff 0%, #7f53ff 100%)',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: 18,
                  border: 'none',
                  borderRadius: 8,
                  padding: '6px 18px',
                  margin: '0 4px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px #0002',
                  transition: 'background 0.2s',
                  display: 'inline-block',
                  verticalAlign: 'middle',
                }}
                onClick={() => setShowUploader(true)}
              >
                Get Started
              </button>
            </span>
            to <b>Upload your sheet</b>, type a prompt, and let AI do the work!
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 28,
            width: '100%',
            maxWidth: 900,
            margin: '0 auto',
            justifyItems: 'center',
          }}>
            {features.map((feature, idx) => (
              <div key={idx} style={{
                background: 'rgba(40, 42, 60, 0.98)',
                borderRadius: 18,
                boxShadow: '0 2px 12px #0003',
                padding: '32px 28px',
                minHeight: 180,
                width: '100%',
                maxWidth: 340,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'center',
                color: '#fff',
                transition: 'transform 0.15s',
              }}>
                <span style={{ fontSize: 36, marginBottom: 12 }}>{feature.icon}</span>
                <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 8px 0' }}>{feature.title}</h2>
                <p style={{ fontSize: 16, color: '#bfc4d1', margin: 0 }}>{feature.description}</p>
              </div>
            ))}
          </div>
        </>
      )}
      {showUploader && !sheetLoaded && (
        <>
          <p style={{ fontSize: 22, color: '#bfc4d1', margin: '18px 0 32px 0', textAlign: 'center', maxWidth: 600 }}>
            AI-powered Excel automation and analytics for everyone. <br />
            <label style={{ fontWeight: 500, cursor: 'pointer', color: '#7f53ff', textDecoration: 'underline' }}>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFile}
                style={{ display: 'none' }}
                disabled={isLoading}
              />
              {isLoading ? 'Processing...' : 'Upload your sheet'}
            </label>
            , type a prompt, and let AI do the work!
          </p>
          {isLoading && (
            <div style={{ textAlign: 'center', marginTop: 20 }}>
              <div style={{ 
                display: 'inline-block',
                width: 40,
                height: 40,
                border: '4px solid #7f53ff',
                borderTop: '4px solid transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              <p style={{ color: '#bfc4d1', marginTop: 10 }}>Processing your Excel file...</p>
            </div>
          )}
        </>
      )}
      {showHeaderConfig && (
        <div style={{ width: '100%', maxWidth: 800, margin: '0 auto', marginTop: 24 }}>
          <div style={{
            background: 'rgba(40, 42, 60, 0.98)',
            borderRadius: 18,
            padding: '32px',
            color: '#fff',
            textAlign: 'center'
          }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 16px 0' }}>
              Configure Headers
            </h2>
            <p style={{ fontSize: 16, color: '#bfc4d1', margin: '0 0 24px 0' }}>
              Select which row contains your column headers:
            </p>
            
            <div style={{ 
              background: '#fff', 
              borderRadius: 8, 
              padding: 16,
              marginBottom: 24,
              maxHeight: '40vh',
              overflow: 'auto'
            }}>
              <Spreadsheet 
                data={rawData}
                onChange={() => {}} // Read-only for header selection
              />
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
              {rawData.slice(0, Math.min(5, rawData.length)).map((row, index) => (
                <button
                  key={index}
                  onClick={() => handleHeaderConfig(index)}
                  style={{
                    background: 'linear-gradient(90deg, #6a8dff 0%, #7f53ff 100%)',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: 14,
                    border: 'none',
                    borderRadius: 6,
                    padding: '8px 16px',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px #0002',
                    transition: 'background 0.2s',
                  }}
                >
                  Row {index + 1}: {row[0]?.value || 'Empty'}...
                </button>
              ))}
            </div>
            
            <p style={{ fontSize: 14, color: '#bfc4d1', marginTop: 16 }}>
              Click on a row to use it as your headers. The AI will use these headers to understand your data.
            </p>
          </div>
        </div>
      )}
      {sheetLoaded && (
        <div style={{ width: '100%', maxWidth: 1200, margin: '0 auto', marginTop: 24 }}>
          <ApiKeyStatus onValidKey={() => setApiKeyValid(true)} />
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16, flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ display: 'flex', marginBottom: 8 }}>
              <input
                type="text"
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder="Type your prompt (e.g., 'Sum column B', 'Remove duplicates', etc.)"
                style={{
                  width: 400,
                  padding: '10px 16px',
                  fontSize: 18,
                  borderRadius: 8,
                  border: '1px solid #7f53ff',
                  outline: 'none',
                  marginRight: 8
                }}
                onKeyPress={e => e.key === 'Enter' && handleAIProcessing()}
              />
              <button
                onClick={handleAIProcessing}
                style={{
                  background: 'linear-gradient(90deg, #6a8dff 0%, #7f53ff 100%)',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: 18,
                  border: 'none',
                  borderRadius: 8,
                  padding: '10px 24px',
                  cursor: (isProcessingAI || !apiKeyValid) ? 'not-allowed' : 'pointer',
                  boxShadow: '0 2px 8px #0002',
                  transition: 'background 0.2s',
                  opacity: (isProcessingAI || !apiKeyValid) ? 0.7 : 1,
                }}
                disabled={!prompt.trim() || isProcessingAI || !apiKeyValid}
              >
                {isProcessingAI ? 'Processing...' : !apiKeyValid ? 'API Key Required' : 'Run AI'}
              </button>
            </div>
            
            {lastOperation && (
              <div style={{
                background: 'rgba(127, 83, 255, 0.1)',
                border: '1px solid #7f53ff',
                borderRadius: 8,
                padding: '12px 16px',
                marginTop: 8,
                color: '#7f53ff',
                fontSize: 14,
                fontWeight: 500
              }}>
                ✅ {lastOperation.description}
              </div>
            )}
            
            <div style={{ 
              marginTop: 12, 
              fontSize: 14, 
              color: '#bfc4d1',
              textAlign: 'center',
              maxWidth: 600
            }}>
              <strong>Try these AI commands:</strong><br />
              "Sort under heading Table" • "Sum column B" • "Average column A" • "Filter {'>'} 100" • "Add row"
            </div>
          </div>
          <div style={{ 
            background: '#fff', 
            borderRadius: 8, 
            padding: 16,
            boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
            overflow: 'auto',
            maxHeight: '70vh'
          }}>
            <Spreadsheet 
              data={spreadsheetData}
              onChange={setSpreadsheetData}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;