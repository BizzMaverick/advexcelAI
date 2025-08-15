import { useState } from 'react';
import * as XLSX from 'xlsx';
import logo from '../assets/logo.png';
import bedrockService from '../services/bedrockService';
import ErrorBoundary from './ErrorBoundary';

interface User {
  email: string;
  name: string;
}

interface MinimalAppProps {
  user: User;
  onLogout: () => void;
}

export default function MinimalApp({ user, onLogout }: MinimalAppProps) {
  const [prompt, setPrompt] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileData, setFileData] = useState<any[][]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiResponse, setAiResponse] = useState<string>('');
  const [fileLoading, setFileLoading] = useState(false);
  const [fileError, setFileError] = useState<string>('');
  const [showUseResultButton, setShowUseResultButton] = useState(false);
  const [lastAiResult, setLastAiResult] = useState<any[][]>([]);
  const [originalFileData, setOriginalFileData] = useState<any[][]>([]);
  const [selectedCells, setSelectedCells] = useState<string[]>([]);
  const [cellFormatting, setCellFormatting] = useState<{ [key: string]: any }>({});
  const [copiedFormat, setCopiedFormat] = useState<any>(null);
  const [formatPainterActive, setFormatPainterActive] = useState(false);
  const [undoStack, setUndoStack] = useState<{ [key: string]: any }[]>([]);
  const [redoStack, setRedoStack] = useState<{ [key: string]: any }[]>([]);
  const [showFeedbackBox, setShowFeedbackBox] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [legalContent, setLegalContent] = useState({ title: '', content: '' });

  const saveToUndoStack = (currentFormatting: { [key: string]: any }) => {
    setUndoStack(prev => [...prev, { ...currentFormatting }]);
    setRedoStack([]);
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const previousState = undoStack[undoStack.length - 1];
    setRedoStack(prev => [{ ...cellFormatting }, ...prev]);
    setUndoStack(prev => prev.slice(0, -1));
    setCellFormatting(previousState);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const nextState = redoStack[0];
    setUndoStack(prev => [...prev, { ...cellFormatting }]);
    setRedoStack(prev => prev.slice(1));
    setCellFormatting(nextState);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileError('');
    setFileLoading(true);
    setSelectedFile(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        let parsedData: any[][];
        
        if (file.name.endsWith('.csv')) {
          const text = e.target?.result as string;
          parsedData = text.split('\n')
            .map(row => row.split(',').map(cell => cell.trim()))
            .filter(row => row.some(cell => cell.length > 0));
        } else {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          parsedData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as any[][];
        }

        if (parsedData.length > 1000) {
          parsedData = parsedData.slice(0, 1000);
          setFileError('File truncated to 1000 rows for performance');
        }

        setFileData(parsedData);
        setOriginalFileData([...parsedData]);
      } catch (error) {
        setFileError('Error reading file. Please ensure it is a valid Excel or CSV file.');
      } finally {
        setFileLoading(false);
      }
    };
    
    reader.onerror = () => {
      setFileError('Error reading file');
      setFileLoading(false);
    };

    if (file.name.endsWith('.csv')) {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  };

  const handleColumnSum = (prompt: string, data: any[][]) => {
    const columnMatch = prompt.match(/sum\s+(?:of\s+)?column\s+([A-Z])/i);
    if (!columnMatch || !data || data.length <= 1) return null;
    
    const colLetter = columnMatch[1].toUpperCase();
    const colIndex = colLetter.charCodeAt(0) - 65;
    
    if (colIndex < 0 || colIndex >= (data[0]?.length || 0)) {
      return `<strong>Error:</strong> Column ${colLetter} does not exist`;
    }
    
    const columnName = data[0][colIndex] || `Column ${colLetter}`;
    let sum = 0;
    let count = 0;
    
    for (let i = 1; i < data.length; i++) {
      const cellValue = data[i][colIndex];
      const numValue = parseFloat(String(cellValue));
      if (!isNaN(numValue)) {
        sum += numValue;
        count++;
      }
    }
    
    if (count === 0) {
      return `<strong>Column ${colLetter} Sum:</strong><br><br>No numeric values found in column ${colLetter} (${columnName})`;
    }
    
    return `<strong>Column ${colLetter} Sum Result:</strong><br><br>Sum of ${columnName}: <strong>${sum.toLocaleString()}</strong><br>Cells processed: ${count}`;
  };

  const handleMathOperations = (prompt: string, data: any[][]) => {
    if (!data || data.length <= 1) return null;
    
    const lowerPrompt = prompt.toLowerCase();
    const headers = data[0];
    
    // Find column by name or letter
    const getColumnIndex = (columnRef: string) => {
      // Check if it's a letter (A, B, C)
      if (/^[A-Z]$/i.test(columnRef)) {
        return columnRef.toUpperCase().charCodeAt(0) - 65;
      }
      // Check if it's a column name
      return headers.findIndex(h => String(h).toLowerCase().includes(columnRef.toLowerCase()));
    };
    
    // Get numeric values from column
    const getColumnValues = (colIndex: number) => {
      if (colIndex < 0 || colIndex >= headers.length) return [];
      return data.slice(1).map(row => parseFloat(String(row[colIndex] || ''))).filter(n => !isNaN(n));
    };
    
    // Basic math operations
    if (lowerPrompt.includes('average')) {
      const colMatch = lowerPrompt.match(/average\s+(?:of\s+)?(?:column\s+)?([a-z0-9:]+)/i);
      if (colMatch) {
        const colIndex = getColumnIndex(colMatch[1]);
        const values = getColumnValues(colIndex);
        if (values.length > 0) {
          const avg = values.reduce((a, b) => a + b, 0) / values.length;
          return `<strong>Average Result:</strong><br><br>Average of ${headers[colIndex]}: <strong>${avg.toFixed(2)}</strong><br>Values processed: ${values.length}`;
        }
      }
    }
    
    if (lowerPrompt.includes('count')) {
      const colMatch = lowerPrompt.match(/count\s+(?:of\s+)?(?:column\s+)?([a-z0-9:]+)/i);
      if (colMatch) {
        const colIndex = getColumnIndex(colMatch[1]);
        const values = getColumnValues(colIndex);
        return `<strong>Count Result:</strong><br><br>Count of numeric values in ${headers[colIndex]}: <strong>${values.length}</strong>`;
      }
    }
    
    if (lowerPrompt.includes('max')) {
      const colMatch = lowerPrompt.match(/max\s+(?:of\s+)?(?:column\s+)?([a-z0-9:]+)/i);
      if (colMatch) {
        const colIndex = getColumnIndex(colMatch[1]);
        const values = getColumnValues(colIndex);
        if (values.length > 0) {
          const max = Math.max(...values);
          return `<strong>Maximum Result:</strong><br><br>Maximum value in ${headers[colIndex]}: <strong>${max}</strong>`;
        }
      }
    }
    
    if (lowerPrompt.includes('min')) {
      const colMatch = lowerPrompt.match(/min\s+(?:of\s+)?(?:column\s+)?([a-z0-9:]+)/i);
      if (colMatch) {
        const colIndex = getColumnIndex(colMatch[1]);
        const values = getColumnValues(colIndex);
        if (values.length > 0) {
          const min = Math.min(...values);
          return `<strong>Minimum Result:</strong><br><br>Minimum value in ${headers[colIndex]}: <strong>${min}</strong>`;
        }
      }
    }
    
    // Cell operations
    const cellAddMatch = prompt.match(/([A-Z])(\d+)\s*\+\s*([A-Z])(\d+)/i);
    const cellSubMatch = prompt.match(/([A-Z])(\d+)\s*-\s*([A-Z])(\d+)/i);
    const cellMulMatch = prompt.match(/([A-Z])(\d+)\s*\*\s*([A-Z])(\d+)/i);
    const cellDivMatch = prompt.match(/([A-Z])(\d+)\s*\/\s*([A-Z])(\d+)/i);
    
    const performCellOperation = (match: RegExpMatchArray, operation: string, symbol: string) => {
      const [, col1, row1, col2, row2] = match;
      const colIndex1 = col1.charCodeAt(0) - 65;
      const colIndex2 = col2.charCodeAt(0) - 65;
      const rowIndex1 = parseInt(row1) - 1;
      const rowIndex2 = parseInt(row2) - 1;
      
      if (rowIndex1 >= 0 && rowIndex1 < data.length && colIndex1 >= 0 && colIndex1 < (data[rowIndex1]?.length || 0) &&
          rowIndex2 >= 0 && rowIndex2 < data.length && colIndex2 >= 0 && colIndex2 < (data[rowIndex2]?.length || 0)) {
        
        const val1 = parseFloat(String(data[rowIndex1][colIndex1]));
        const val2 = parseFloat(String(data[rowIndex2][colIndex2]));
        
        if (!isNaN(val1) && !isNaN(val2)) {
          let result;
          switch (operation) {
            case 'add': result = val1 + val2; break;
            case 'subtract': result = val1 - val2; break;
            case 'multiply': result = val1 * val2; break;
            case 'divide': result = val2 !== 0 ? val1 / val2 : 'Error: Division by zero'; break;
          }
          return `<strong>Cell ${operation} Result:</strong><br><br>${col1}${row1} (${val1}) ${symbol} ${col2}${row2} (${val2}) = <strong>${result}</strong>`;
        }
      }
      return `<strong>Error:</strong> Could not find numeric values in specified cells`;
    };
    
    if (cellAddMatch) return performCellOperation(cellAddMatch, 'add', '+');
    if (cellSubMatch) return performCellOperation(cellSubMatch, 'subtract', '-');
    if (cellMulMatch) return performCellOperation(cellMulMatch, 'multiply', '*');
    if (cellDivMatch) return performCellOperation(cellDivMatch, 'divide', '/');
    
    return null;
  };

  const handleCellOperations = (prompt: string, data: any[][]) => {
    return handleMathOperations(prompt, data);
  };

  const handleProcessAI = async () => {
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt || !selectedFile || fileData.length === 0) {
      setAiResponse('Error: Please enter a command and select a file first');
      return;
    }
    
    // Handle local operations first
    const columnSumResult = handleColumnSum(trimmedPrompt, fileData);
    if (columnSumResult) {
      setAiResponse(columnSumResult);
      setPrompt('');
      return;
    }

    const cellOperationResult = handleCellOperations(trimmedPrompt, fileData);
    if (cellOperationResult) {
      setAiResponse(cellOperationResult);
      setPrompt('');
      return;
    }

    // Handle sorting
    if (trimmedPrompt.toLowerCase().includes('sort')) {
      const sortedData = [...fileData];
      const headers = sortedData[0];
      const dataRows = sortedData.slice(1);
      
      // Find column to sort by
      let sortColumnIndex = 0;
      let sortColumnName = headers[0];
      
      // Check for column letter (A, B, C) or column reference (A1, B1, C1)
      const colLetterMatch = trimmedPrompt.match(/\b([A-Z])(?:1)?\b/i);
      if (colLetterMatch) {
        const colIndex = colLetterMatch[1].toUpperCase().charCodeAt(0) - 65;
        if (colIndex >= 0 && colIndex < headers.length) {
          sortColumnIndex = colIndex;
          sortColumnName = headers[colIndex];
        }
      } else {
        // Check if specific column name mentioned
        for (let i = 0; i < headers.length; i++) {
          const headerName = String(headers[i] || '').toLowerCase();
          if (trimmedPrompt.toLowerCase().includes(headerName)) {
            sortColumnIndex = i;
            sortColumnName = headers[i];
            break;
          }
        }
      }
      
      dataRows.sort((a, b) => {
        const aVal = String(a[sortColumnIndex] || '').toLowerCase();
        const bVal = String(b[sortColumnIndex] || '').toLowerCase();
        
        // Try numeric sort first
        const aNum = parseFloat(aVal);
        const bNum = parseFloat(bVal);
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return aNum - bNum;
        }
        
        // Fall back to alphabetical
        return aVal.localeCompare(bVal);
      });
      
      const result = [headers, ...dataRows];
      setLastAiResult(result);
      setShowUseResultButton(true);
      let response = `<strong>Data sorted by ${sortColumnName}:</strong><br><br>`;
      response += '<div style="max-height: 400px; overflow: auto;"><table style="border-collapse: collapse; width: 100%; margin-top: 10px;">';
      response += '<thead><tr style="background: #f0f8ff;">';
      headers.forEach(header => {
        response += `<th style="border: 1px solid #ddd; padding: 8px; text-align: left;">${header}</th>`;
      });
      response += '</tr></thead><tbody>';
      dataRows.forEach((row, index) => {
        response += `<tr style="${index % 2 === 0 ? 'background: #fafafa;' : ''}">`;
        row.forEach(cell => {
          response += `<td style="border: 1px solid #ddd; padding: 8px;">${cell || 'N/A'}</td>`;
        });
        response += '</tr>';
      });
      response += '</tbody></table></div>';

      setAiResponse(response);
      setPrompt('');
      return;
    }

    // Handle find duplicates
    if (trimmedPrompt.toLowerCase().includes('find') && trimmedPrompt.toLowerCase().includes('duplicate')) {
      const headers = fileData[0];
      const dataRows = fileData.slice(1);
      
      // Find duplicate rows
      const duplicates: any[][] = [];
      const seen = new Set();
      
      dataRows.forEach(row => {
        const rowStr = JSON.stringify(row);
        if (seen.has(rowStr)) {
          duplicates.push(row);
        } else {
          seen.add(rowStr);
        }
      });
      
      if (duplicates.length > 0) {
        const result = [headers, ...duplicates];
        setLastAiResult(result);
        setShowUseResultButton(true);
        
        let response = `<strong>Found ${duplicates.length} duplicate rows:</strong><br><br>`;
        response += '<div style="max-height: 400px; overflow: auto;"><table style="border-collapse: collapse; width: 100%; margin-top: 10px;">';
        response += '<thead><tr style="background: #f0f8ff;">';
        headers.forEach(header => {
          response += `<th style="border: 1px solid #ddd; padding: 8px; text-align: left;">${header}</th>`;
        });
        response += '</tr></thead><tbody>';
        duplicates.forEach((row, index) => {
          response += `<tr style="${index % 2 === 0 ? 'background: #fafafa;' : ''}">`;
          row.forEach(cell => {
            response += `<td style="border: 1px solid #ddd; padding: 8px;">${cell || 'N/A'}</td>`;
          });
          response += '</tr>';
        });
        response += '</tbody></table></div>';
        setAiResponse(response);
      } else {
        setAiResponse('<strong>No duplicate rows found!</strong>');
      }
      setPrompt('');
      return;
    }

    // Handle remove duplicates
    if (trimmedPrompt.toLowerCase().includes('remove') && trimmedPrompt.toLowerCase().includes('duplicate')) {
      const headers = fileData[0];
      const dataRows = fileData.slice(1);
      
      // Remove duplicates based on all columns
      const uniqueRows = dataRows.filter((row, index) => {
        return dataRows.findIndex(otherRow => 
          JSON.stringify(row) === JSON.stringify(otherRow)
        ) === index;
      });
      
      const result = [headers, ...uniqueRows];
      const removedCount = dataRows.length - uniqueRows.length;
      
      setLastAiResult(result);
      setShowUseResultButton(true);
      setAiResponse(`<strong>Duplicates removed successfully!</strong><br><br>Removed ${removedCount} duplicate rows. ${uniqueRows.length} unique rows remaining. Click "Apply to Main Sheet" to use the cleaned data.`);
      setPrompt('');
      return;
    }

    // Handle find and replace (improved pattern matching)
    const replacePatterns = [
      /(?:find|replace)\s+([^\s]+)\s+(?:and\s+)?replace\s+(?:with\s+)?([^\s]+)/i,
      /replace\s+([^\s]+)\s+with\s+([^\s]+)/i
    ];
    
    for (const pattern of replacePatterns) {
      const replaceMatch = trimmedPrompt.match(pattern);
      if (replaceMatch) {
        const [, findText, replaceText] = replaceMatch;
        const newData = fileData.map(row => 
          row.map(cell => 
            String(cell || '').replace(new RegExp(findText.trim(), 'gi'), replaceText.trim())
          )
        );
        
        // Count replacements
        let replacementCount = 0;
        fileData.forEach(row => {
          row.forEach(cell => {
            const matches = String(cell || '').match(new RegExp(findText.trim(), 'gi'));
            if (matches) replacementCount += matches.length;
          });
        });
        
        if (replacementCount > 0) {
          setLastAiResult(newData);
          setShowUseResultButton(true);
          setAiResponse(`<strong>Find and Replace completed!</strong><br><br>Replaced "${findText.trim()}" with "${replaceText.trim()}" in ${replacementCount} locations. Click "Apply to Main Sheet" to use the updated data.`);
        } else {
          setAiResponse(`<strong>No matches found for "${findText.trim()}"</strong>`);
        }
        setPrompt('');
        return;
      }
    }

    // Handle data queries with flexible parsing
    const headers = fileData[0];
    const lowerPrompt = trimmedPrompt.toLowerCase();
    
    // Find requested columns (exact matching)
    const requestedColumns: number[] = [];
    headers.forEach((header, index) => {
      const headerStr = String(header).toLowerCase();
      // Only match if the full column name is mentioned
      if (lowerPrompt.includes(headerStr)) {
        requestedColumns.push(index);
      }
    });
    
    // Find search terms (countries/items) - flexible extraction
    const searchTerms: string[] = [];
    const words = trimmedPrompt.split(/\s+/);
    const stopWords = ['show', 'lookup', 'find', 'get', 'for', 'of', 'and', 'the', 'in', 'with', 'by'];
    
    // Extract potential country/item names (capitalized words or known patterns)
    words.forEach(word => {
      const cleanWord = word.replace(/[,\s]+$/, '');
      if (cleanWord.length > 2 && 
          !stopWords.includes(cleanWord.toLowerCase()) &&
          !headers.some(h => String(h).toLowerCase().includes(cleanWord.toLowerCase()))) {
        searchTerms.push(cleanWord);
      }
    });
    
    if (searchTerms.length > 0) {
      const matches: any[][] = [];
      
      for (let i = 1; i < fileData.length; i++) {
        const row = fileData[i];
        for (const searchTerm of searchTerms) {
          for (let j = 0; j < row.length; j++) {
            const cellValue = String(row[j] || '').toLowerCase();
            if (cellValue.includes(searchTerm.toLowerCase())) {
              matches.push(row);
              break;
            }
          }
        }
      }
      
      if (matches.length > 0) {
        // Prepare result data for actions
        let resultData;
        if (requestedColumns.length > 0) {
          const resultHeaders = ['Item', ...requestedColumns.map(i => headers[i])];
          const resultRows = matches.map(row => [row[0], ...requestedColumns.map(i => row[i])]);
          resultData = [resultHeaders, ...resultRows];
        } else {
          resultData = [headers, ...matches];
        }
        setLastAiResult(resultData);
        setShowUseResultButton(true);
        
        let response = `<strong>Results for ${searchTerms.join(', ')}:</strong><br><br>`;
        response += '<div style="max-height: 400px; overflow: auto;"><table style="border-collapse: collapse; width: 100%; margin-top: 10px;">';
        response += '<thead><tr style="background: #f0f8ff;">';
        
        if (requestedColumns.length > 0) {
          response += '<th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Item</th>';
          requestedColumns.forEach(colIndex => {
            response += `<th style="border: 1px solid #ddd; padding: 8px; text-align: left;">${headers[colIndex]}</th>`;
          });
        } else {
          headers.forEach(header => {
            response += `<th style="border: 1px solid #ddd; padding: 8px; text-align: left;">${header}</th>`;
          });
        }
        
        response += '</tr></thead><tbody>';
        matches.forEach((row, index) => {
          response += `<tr style="${index % 2 === 0 ? 'background: #fafafa;' : ''}">`;
          
          if (requestedColumns.length > 0) {
            response += `<td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">${row[0] || 'N/A'}</td>`;
            requestedColumns.forEach(colIndex => {
              response += `<td style="border: 1px solid #ddd; padding: 8px;">${row[colIndex] || 'N/A'}</td>`;
            });
          } else {
            row.forEach(cell => {
              response += `<td style="border: 1px solid #ddd; padding: 8px;">${cell || 'N/A'}</td>`;
            });
          }
          
          response += '</tr>';
        });
        response += '</tbody></table></div>';
        setAiResponse(response);
        setPrompt('');
        return;
      } else {
        setAiResponse(`<strong>No matches found for ${searchTerms.join(', ')}</strong>`);
        setPrompt('');
        return;
      }
    }

    
    setIsProcessing(true);
    setAiResponse('');
    
    try {
      const result = await bedrockService.processExcelData(fileData, trimmedPrompt, selectedFile.name);
      if (result.success) {
        setAiResponse(result.response || 'Processing completed');
      } else {
        setAiResponse(`Error: ${result.error || 'Unknown error occurred'}`);
      }
    } catch (error) {
      setAiResponse(`Error: ${error instanceof Error ? error.message : 'Failed to process request'}`);
    } finally {
      setIsProcessing(false);
      setPrompt('');
    }
  };

  const applyChangesToMainSheet = () => {
    if (lastAiResult.length > 0) {
      setFileData([...lastAiResult]);
      setShowUseResultButton(false);
      setAiResponse(prev => prev + '<br><br><p style="color: #10b981; font-weight: bold;">✅ Changes applied to main sheet!</p>');
    }
  };

  const resetToOriginal = () => {
    if (originalFileData.length > 0) {
      setFileData([...originalFileData]);
      setShowUseResultButton(false);
      setAiResponse('');
    }
  };

  const downloadAsExcel = (data: any[][], filename: string) => {
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, filename);
  };

  const createNewSheet = () => {
    if (lastAiResult.length > 0) {
      downloadAsExcel(lastAiResult, 'AI_Results.xlsx');
      setAiResponse(prev => prev + '<br><br><p style="color: #10b981; font-weight: bold;">📥 New sheet downloaded as AI_Results.xlsx!</p>');
    }
  };

  const downloadCurrentSheet = () => {
    if (fileData.length > 0) {
      const filename = selectedFile?.name.replace(/\.[^/.]+$/, '_updated.xlsx') || 'updated_data.xlsx';
      downloadAsExcel(fileData, filename);
      setAiResponse(prev => prev + '<br><br><p style="color: #10b981; font-weight: bold;">📥 Current sheet downloaded!</p>');
    }
  };

  return (
    <ErrorBoundary>
      <div style={{ minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <header style={{ 
          background: '#0078d4', 
          color: 'white', 
          padding: '10px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img src={logo} alt="Logo" style={{ height: '24px' }} />
            <span style={{ fontSize: '16px', fontWeight: '600' }}>Excel AI</span>
          </div>
          <button onClick={onLogout} style={{ 
            background: 'rgba(255,255,255,0.2)', 
            border: 'none', 
            color: 'white', 
            padding: '6px 12px', 
            borderRadius: '4px', 
            cursor: 'pointer'
          }}>
            Logout
          </button>
        </header>
        
        <main style={{ padding: '20px', background: '#f5f5f5', minHeight: 'calc(100vh - 50px)' }}>
          {/* File Upload */}
          <div style={{ background: 'white', borderRadius: '8px', padding: '20px', marginBottom: '20px', color: '#333' }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#333', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>📁</span>
              Upload File
            </h3>
            <input 
              type="file" 
              accept=".xlsx,.xls,.csv" 
              onChange={handleFileUpload}
              disabled={fileLoading}
              style={{ 
                width: '100%', 
                padding: '12px', 
                border: '2px dashed #0078d4', 
                borderRadius: '6px', 
                background: '#f8f9ff',
                color: '#333'
              }}
            />
            {fileLoading && <div style={{ marginTop: '10px', color: '#0078d4', fontWeight: 'bold' }}>Loading...</div>}
            {fileError && <div style={{ marginTop: '10px', color: '#e53e3e', fontSize: '12px', fontWeight: 'bold' }}>{fileError}</div>}
          </div>

          {/* AI Command */}
          <div style={{ background: 'white', borderRadius: '8px', padding: '20px', marginBottom: '20px', color: '#333' }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#333', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>🤖</span>
              Ask AI
            </h3>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input 
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (!isProcessing && selectedFile && prompt.trim()) {
                      handleProcessAI();
                    }
                  }
                }}
                placeholder="Ask about your data..."
                style={{ 
                  flex: 1, 
                  padding: '12px', 
                  border: '1px solid #ddd', 
                  borderRadius: '6px',
                  color: '#333',
                  backgroundColor: '#ffffff'
                }}
              />
              <button 
                onClick={handleProcessAI}
                disabled={isProcessing || !selectedFile || !prompt.trim()}
                style={{ 
                  background: '#0078d4',
                  color: 'white',
                  border: 'none',
                  padding: '12px 20px',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                {isProcessing ? 'Processing...' : 'Submit'}
              </button>
            </div>
          </div>

          {/* Formatting Toolbar */}
          {fileData.length > 0 && (
            <div style={{ 
              background: '#ffffff', 
              padding: '12px 16px', 
              marginBottom: '20px', 
              border: '1px solid #e7e7e7',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                {/* Text Style Section */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ 
                    fontSize: '14px', 
                    fontWeight: '500', 
                    color: '#232f3e', 
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    minWidth: '70px'
                  }}>Text Style</span>
                  
                  <button 
                    onClick={() => {
                      if (selectedCells.length === 0) return;
                      saveToUndoStack(cellFormatting);
                      const newFormatting = { ...cellFormatting };
                      selectedCells.forEach(cellId => {
                        const currentWeight = newFormatting[cellId]?.fontWeight;
                        newFormatting[cellId] = { 
                          ...newFormatting[cellId], 
                          fontWeight: currentWeight === 'bold' ? 'normal' : 'bold' 
                        };
                      });
                      setCellFormatting(newFormatting);
                    }}
                    style={{ 
                      background: '#ffffff', 
                      color: '#232f3e', 
                      border: '1px solid #d5d9d9',
                      padding: '8px 16px', 
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: '500',
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                      transition: 'all 0.15s ease',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#f7f8f8';
                      e.target.style.borderColor = '#007185';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = '#ffffff';
                      e.target.style.borderColor = '#d5d9d9';
                    }}
                  >
                    Bold
                  </button>
                  
                  <button 
                    onClick={() => {
                      if (selectedCells.length === 0) return;
                      saveToUndoStack(cellFormatting);
                      const newFormatting = { ...cellFormatting };
                      selectedCells.forEach(cellId => {
                        const currentStyle = newFormatting[cellId]?.fontStyle;
                        newFormatting[cellId] = { 
                          ...newFormatting[cellId], 
                          fontStyle: currentStyle === 'italic' ? 'normal' : 'italic' 
                        };
                      });
                      setCellFormatting(newFormatting);
                    }}
                    style={{ 
                      background: '#ffffff', 
                      color: '#232f3e', 
                      border: '1px solid #d5d9d9',
                      padding: '8px 16px', 
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: '500',
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                      transition: 'all 0.15s ease',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#f7f8f8';
                      e.target.style.borderColor = '#007185';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = '#ffffff';
                      e.target.style.borderColor = '#d5d9d9';
                    }}
                  >
                    Italic
                  </button>
                  
                  <button 
                    onClick={() => {
                      if (!formatPainterActive) {
                        // Activate format painter mode
                        if (selectedCells.length === 1) {
                          const cellId = selectedCells[0];
                          const format = cellFormatting[cellId] || {};
                          setCopiedFormat(format);
                          setFormatPainterActive(true);
                        }
                      } else {
                        // Deactivate format painter mode
                        setFormatPainterActive(false);
                        setCopiedFormat(null);
                      }
                    }}
                    style={{ 
                      background: formatPainterActive ? '#e7f3ff' : '#ffffff', 
                      color: '#232f3e', 
                      border: formatPainterActive ? '2px solid #007185' : '1px solid #d5d9d9',
                      padding: '8px 12px', 
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '16px',
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                      transition: 'all 0.15s ease',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                    }}
                    onMouseEnter={(e) => {
                      if (!formatPainterActive) {
                        e.target.style.background = '#f7f8f8';
                        e.target.style.borderColor = '#007185';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!formatPainterActive) {
                        e.target.style.background = '#ffffff';
                        e.target.style.borderColor = '#d5d9d9';
                      }
                    }}
                    title={formatPainterActive ? 'Click cells to apply format' : 'Format Painter: Select 1 cell then click'}
                  >
                    🖌️
                  </button>
                  
                  <button 
                    onClick={handleUndo}
                    disabled={undoStack.length === 0}
                    style={{ 
                      background: undoStack.length > 0 ? '#ffffff' : '#f5f5f5', 
                      color: undoStack.length > 0 ? '#232f3e' : '#999', 
                      border: '1px solid #d5d9d9',
                      padding: '8px 12px', 
                      borderRadius: '6px',
                      cursor: undoStack.length > 0 ? 'pointer' : 'not-allowed',
                      fontSize: '16px',
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                      transition: 'all 0.15s ease',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                    }}
                    title="Undo"
                  >
                    ↶
                  </button>
                  
                  <button 
                    onClick={handleRedo}
                    disabled={redoStack.length === 0}
                    style={{ 
                      background: redoStack.length > 0 ? '#ffffff' : '#f5f5f5', 
                      color: redoStack.length > 0 ? '#232f3e' : '#999', 
                      border: '1px solid #d5d9d9',
                      padding: '8px 12px', 
                      borderRadius: '6px',
                      cursor: redoStack.length > 0 ? 'pointer' : 'not-allowed',
                      fontSize: '16px',
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                      transition: 'all 0.15s ease',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                    }}
                    title="Redo"
                  >
                    ↷
                  </button>
                </div>
                
                {/* Divider */}
                <div style={{ width: '1px', height: '32px', background: '#e7e7e7' }}></div>
                
                {/* Text Color Section */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ 
                    fontSize: '14px', 
                    fontWeight: '500', 
                    color: '#232f3e', 
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    minWidth: '70px'
                  }}>Text Color</span>
                  
                  <select
                    onChange={(e) => {
                      if (selectedCells.length === 0) return;
                      saveToUndoStack(cellFormatting);
                      const color = e.target.value;
                      const newFormatting = { ...cellFormatting };
                      selectedCells.forEach(cellId => {
                        newFormatting[cellId] = { ...newFormatting[cellId], color };
                      });
                      setCellFormatting(newFormatting);
                    }}
                    style={{
                      background: '#ffffff',
                      color: '#232f3e',
                      border: '1px solid #d5d9d9',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                      minWidth: '120px'
                    }}
                  >
                    <option value="">Text Color</option>
                    <option value="#000000">⬛ Black</option>
                    <option value="#ffffff">⬜ White</option>
                    <option value="#e74c3c">🟥 Red</option>
                    <option value="#3498db">🟦 Blue</option>
                    <option value="#2ecc71">🟩 Green</option>
                    <option value="#f39c12">🟧 Orange</option>
                    <option value="#9b59b6">🟪 Purple</option>
                    <option value="#1abc9c">🟩 Teal</option>
                    <option value="#34495e">⬛ Dark Gray</option>
                    <option value="#95a5a6">⬜ Light Gray</option>
                    <option value="#c0392b">🟥 Dark Red</option>
                    <option value="#2980b9">🟦 Dark Blue</option>
                  </select>
                </div>
                
                {/* Divider */}
                <div style={{ width: '1px', height: '32px', background: '#e7e7e7' }}></div>
                
                {/* Cell Color Section */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ 
                    fontSize: '14px', 
                    fontWeight: '500', 
                    color: '#232f3e', 
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    minWidth: '70px'
                  }}>Cell Color</span>
                  
                  <select
                    onChange={(e) => {
                      if (selectedCells.length === 0) return;
                      saveToUndoStack(cellFormatting);
                      const backgroundColor = e.target.value;
                      const newFormatting = { ...cellFormatting };
                      selectedCells.forEach(cellId => {
                        newFormatting[cellId] = { ...newFormatting[cellId], backgroundColor };
                      });
                      setCellFormatting(newFormatting);
                    }}
                    style={{
                      background: '#ffffff',
                      color: '#232f3e',
                      border: '1px solid #d5d9d9',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                      minWidth: '120px'
                    }}
                  >
                    <option value="">Cell Color</option>
                    <option value="#000000">⬛ Black</option>
                    <option value="#ffffff">⬜ White</option>
                    <option value="#e74c3c">🟥 Red</option>
                    <option value="#3498db">🟦 Blue</option>
                    <option value="#2ecc71">🟩 Green</option>
                    <option value="#f39c12">🟧 Orange</option>
                    <option value="#9b59b6">🟪 Purple</option>
                    <option value="#1abc9c">🟩 Teal</option>
                    <option value="#34495e">⬛ Dark Gray</option>
                    <option value="#95a5a6">⬜ Light Gray</option>
                    <option value="#c0392b">🟥 Dark Red</option>
                    <option value="#2980b9">🟦 Dark Blue</option>
                  </select>
                </div>
                
                {/* Divider */}
                <div style={{ width: '1px', height: '32px', background: '#e7e7e7' }}></div>
                
                {/* Alignment Section */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ 
                    fontSize: '14px', 
                    fontWeight: '500', 
                    color: '#232f3e', 
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    minWidth: '70px'
                  }}>Alignment</span>
                  
                  <select
                    onChange={(e) => {
                      if (selectedCells.length === 0) return;
                      saveToUndoStack(cellFormatting);
                      const align = e.target.value;
                      const newFormatting = { ...cellFormatting };
                      selectedCells.forEach(cellId => {
                        newFormatting[cellId] = { ...newFormatting[cellId], textAlign: align };
                      });
                      setCellFormatting(newFormatting);
                    }}
                    style={{
                      background: '#ffffff',
                      color: '#232f3e',
                      border: '1px solid #d5d9d9',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                      minWidth: '120px'
                    }}
                  >
                    <option value="">Choose Align</option>
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </div>
                
                {/* Selection Status */}
                <div style={{ 
                  marginLeft: 'auto',
                  fontSize: '13px', 
                  color: '#565959', 
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  background: selectedCells.length > 0 ? '#e7f3ff' : '#f7f8f8',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid ' + (selectedCells.length > 0 ? '#007185' : '#e7e7e7'),
                  fontWeight: '500'
                }}>
                  {selectedCells.length > 0 ? `${selectedCells.length} cell${selectedCells.length > 1 ? 's' : ''} selected` : 'Select cells to format'}
                </div>
              </div>
            </div>
          )}

          {/* File Data */}
          {fileData.length > 0 && (
            <div style={{ background: 'white', borderRadius: '8px', marginBottom: '20px', overflow: 'hidden' }}>
              <div style={{ padding: '15px', background: '#0078d4', color: 'white' }}>
                <h3 style={{ margin: 0, fontSize: '16px' }}>{selectedFile?.name}</h3>
                <p style={{ margin: '5px 0 0 0', fontSize: '12px', opacity: 0.9 }}>
                  {fileData.length} rows × {fileData[0]?.length || 0} columns
                </p>
              </div>
              <div style={{ maxHeight: '400px', overflow: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#e6f3ff', borderBottom: '2px solid #0078d4' }}>
                      <th style={{ padding: '8px', fontSize: '11px', fontWeight: 'bold', color: '#0078d4', border: '1px solid #ddd' }}>#</th>
                      {fileData[0] && fileData[0].map((_, colIndex) => (
                        <th key={colIndex} style={{ padding: '8px', fontSize: '11px', fontWeight: 'bold', color: '#0078d4', border: '1px solid #ddd' }}>
                          {String.fromCharCode(65 + colIndex)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {fileData.map((row, i) => (
                      <tr key={i}>
                        <td style={{ 
                          padding: '8px', 
                          borderRight: '1px solid #eee',
                          fontWeight: 'bold',
                          fontSize: '11px',
                          color: '#0078d4',
                          background: '#f8f9ff',
                          textAlign: 'center'
                        }}>
                          {i + 1}
                        </td>
                        {Array.isArray(row) && row.length > 0 ? row.map((cell, j) => (
                          <td 
                            key={j}
                            onClick={(e) => {
                              const cellId = `${i}-${j}`;
                              
                              if (formatPainterActive && copiedFormat) {
                                // Apply copied format to clicked cell
                                saveToUndoStack(cellFormatting);
                                const newFormatting = { ...cellFormatting };
                                newFormatting[cellId] = { ...copiedFormat };
                                setCellFormatting(newFormatting);
                                setFormatPainterActive(false);
                                setCopiedFormat(null);
                                return;
                              }
                              
                              // Multiple cell selection with Ctrl+click
                              if (e.ctrlKey || e.metaKey) {
                                if (selectedCells.includes(cellId)) {
                                  setSelectedCells(selectedCells.filter(id => id !== cellId));
                                } else {
                                  setSelectedCells([...selectedCells, cellId]);
                                }
                              } else {
                                // Single cell selection
                                setSelectedCells([cellId]);
                              }
                            }}
                            style={{ 
                              padding: '8px', 
                              borderRight: '1px solid #eee',
                              fontWeight: i === 0 ? 'bold' : 'normal',
                              color: '#333',
                              cursor: 'pointer',
                              backgroundColor: selectedCells.includes(`${i}-${j}`) ? '#cce7ff' : 
                                              (i % 2 === 0 ? '#fafafa' : 'white'),
                              ...cellFormatting[`${i}-${j}`]
                            }}
                          >
                            {String(cell || '')}
                          </td>
                        )) : (
                          <td style={{ padding: '8px', color: '#666', fontStyle: 'italic' }}>No data</td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {/* AI Response */}
          {aiResponse && (
            <div style={{ background: 'white', borderRadius: '8px', marginBottom: '20px', overflow: 'hidden' }}>
              {showUseResultButton && (
                <div style={{ marginBottom: '15px', padding: '10px', background: '#f0f8ff', borderRadius: '4px', border: '1px solid #0078d4' }}>
                  <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#333' }}>
                    📊 <strong>Results ready!</strong> Choose an action:
                  </p>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button 
                      onClick={applyChangesToMainSheet}
                      style={{ background: '#10b981', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      📋 Apply to Main Sheet
                    </button>
                    <button 
                      onClick={createNewSheet}
                      style={{ background: '#0078d4', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      📄 Download Results Only
                    </button>
                    <button 
                      onClick={downloadCurrentSheet}
                      style={{ background: '#f59e0b', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      📥 Download Full Data
                    </button>
                    <button 
                      onClick={resetToOriginal}
                      style={{ background: '#6c757d', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      🔄 Reset to Original
                    </button>
                  </div>
                </div>
              )}
              <div style={{ padding: '15px', background: '#0078d4', color: 'white' }}>
                <h4 style={{ margin: 0, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '16px' }}>💬</span>
                  AI Response
                </h4>
                <div style={{ marginTop: '5px', fontSize: '12px', opacity: 0.9 }} dangerouslySetInnerHTML={{ 
                  __html: aiResponse.split('<br><br>')[0] || aiResponse.split('<table')[0] || 'Processing completed'
                }} />
              </div>
              <div style={{ 
                background: '#ffffff', 
                padding: '20px', 
                color: '#333'
              }}>
                <div dangerouslySetInnerHTML={{ __html: aiResponse.includes('<table') ? aiResponse.split('<br><br>').slice(1).join('<br><br>') : aiResponse.split('<br><br>').slice(1).join('<br><br>') || aiResponse }} />
              </div>
            </div>
          )}
        </main>
        
        {/* Footer with Legal Pages */}
        <footer style={{
          background: '#232f3e',
          color: '#ffffff',
          padding: '20px',
          textAlign: 'center',
          borderTop: '1px solid #e1e5e9'
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap', marginBottom: '12px' }}>
            <a onClick={() => {
              setLegalContent({ 
                title: 'Privacy Policy', 
                content: `Last updated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

1. Introduction to Privacy Policy
This Privacy Policy applies to your use of the Excel AI platform, including all services, features, and functionalities provided through our web application. The terms "we," "our," and "us" refer to Excel AI, and the terms "you," "your," and "User" refer to you as a user of our platform.

The term "Personal Information" means information that personally identifies you, such as your name, email address, and any data linked to such information. By using Excel AI, you agree to this Privacy Policy and consent to the collection, use, and processing of your information as described below.

2. Information We Collect and How We Use It
We collect Personal Information when you create an account, including your name, email address, and authentication credentials through AWS Cognito. We also temporarily process the Excel/CSV files you upload to provide AI-powered analysis and insights.

Your uploaded files are processed in real-time and are not permanently stored on our servers. File data is used solely to generate AI responses and perform requested operations like sorting, filtering, and mathematical calculations.

3. Data Security and Processing
We use Amazon Web Services (AWS) infrastructure to ensure enterprise-grade security. Your data is encrypted in transit and processed using secure AWS services including Amazon Bedrock for AI functionality. We implement industry-standard security practices to protect your information.

4. Data Retention and Deletion
Uploaded files are processed temporarily and automatically deleted after your session ends. Account information is retained as long as your account remains active. You may request deletion of your account and associated data at any time through the feedback system.

5. Third-Party Services
We use AWS Cognito for authentication and AWS Bedrock for AI processing. These services are governed by Amazon's privacy policies and security standards. We do not share your personal information with any other third parties.

6. Your Rights
You have the right to access, modify, or delete your personal information. You can update your account details or request account deletion through our support channels. You also have the right to withdraw consent for data processing at any time.

7. Contact Information
For privacy-related questions or requests, please use our feedback system or contact us through the support channels provided in the application.` 
              });
              setShowLegalModal(true);
            }} style={{ color: '#ffffff', textDecoration: 'none', fontSize: '14px', cursor: 'pointer' }}>Privacy Policy</a>
            <a onClick={() => {
              setLegalContent({ 
                title: 'Terms of Service', 
                content: `Last updated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

1. Acceptance of Terms
By accessing and using Excel AI, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.

2. Description of Service
Excel AI is a web-based platform that provides AI-powered analysis and manipulation of Excel and CSV files. Our service includes data sorting, filtering, mathematical calculations, duplicate detection, and other spreadsheet operations powered by Amazon Web Services.

3. User Responsibilities
You are responsible for:
• Ensuring you have the right to upload and process any files you submit
• Not uploading files containing sensitive personal data, confidential information, or copyrighted material without proper authorization
• Using the service in compliance with applicable laws and regulations
• Maintaining the security of your account credentials
• Not attempting to reverse engineer, hack, or compromise the service

4. Prohibited Uses
You may not use Excel AI to:
• Process illegal, harmful, or malicious content
• Upload files containing viruses, malware, or other harmful code
• Attempt to gain unauthorized access to our systems or other users' accounts
• Use the service for any commercial purpose without explicit permission
• Violate any applicable laws or regulations

5. Service Availability
We strive to maintain high service availability but do not guarantee uninterrupted access. The service is provided "as-is" without warranties of any kind. We reserve the right to modify, suspend, or discontinue the service at any time with or without notice.

6. Limitation of Liability
Excel AI shall not be liable for any direct, indirect, incidental, special, or consequential damages resulting from your use of the service. Your sole remedy for dissatisfaction with the service is to stop using it.

7. Modifications to Terms
We reserve the right to modify these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms.

8. Governing Law
These terms shall be governed by and construed in accordance with applicable laws, without regard to conflict of law principles.` 
              });
              setShowLegalModal(true);
            }} style={{ color: '#ffffff', textDecoration: 'none', fontSize: '14px', cursor: 'pointer' }}>Terms of Service</a>
            <a onClick={() => {
              setLegalContent({ 
                title: 'Cookie Policy', 
                content: `Last updated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

1. What Are Cookies
Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and provide information to website owners.

2. How We Use Cookies
Excel AI uses cookies to:
• Maintain your login session and authentication state
• Remember your preferences and settings
• Analyze how you use our service to improve functionality
• Ensure security and prevent fraudulent activity
• Provide personalized user experience

3. Types of Cookies We Use

Essential Cookies:
• Authentication cookies from AWS Cognito to maintain your login session
• Security cookies to protect against cross-site request forgery
• Session cookies to maintain application state

Analytical Cookies:
• Usage analytics to understand how users interact with our platform
• Performance monitoring to identify and fix issues
• Feature usage tracking to improve our services

4. Third-Party Cookies
We use Amazon Web Services, which may set their own cookies for:
• Authentication and session management (AWS Cognito)
• Service monitoring and analytics
• Security and fraud prevention

5. Managing Cookies
You can control cookies through your browser settings:
• Most browsers allow you to view, delete, and block cookies
• You can set your browser to notify you when cookies are being set
• Disabling essential cookies may prevent the service from functioning properly

6. Cookie Retention
• Session cookies are deleted when you close your browser
• Persistent cookies remain until they expire or you delete them
• Authentication cookies typically expire after a set period for security

7. Updates to This Policy
We may update this Cookie Policy from time to time. Any changes will be posted on this page with an updated revision date.

8. Contact Us
If you have questions about our use of cookies, please contact us through our feedback system.` 
              });
              setShowLegalModal(true);
            }} style={{ color: '#ffffff', textDecoration: 'none', fontSize: '14px', cursor: 'pointer' }}>Cookie Policy</a>
            <a onClick={() => {
              setLegalContent({ 
                title: 'Support & Help Center', 
                content: `Welcome to Excel AI Support

1. Getting Started
Excel AI is designed to be intuitive and user-friendly. Here's how to get started:
• Create an account using your email address
• Upload your Excel (.xlsx, .xls) or CSV files
• Use natural language commands to analyze your data
• Apply AI-generated results to your spreadsheet or download new files

2. Supported File Formats
• Microsoft Excel files (.xlsx, .xls)
• Comma-separated values (.csv)
• Maximum file size: Large files are automatically truncated to 1000 rows for performance

3. Available Features

Data Analysis:
• Sort data by any column
• Find and remove duplicate entries
• Mathematical operations (sum, average, count, min, max)
• Cell-to-cell calculations
• Data filtering and search

Formatting Tools:
• Bold and italic text formatting
• Text and cell color customization
• Text alignment options
• Format painter for copying styles
• Undo/redo functionality

4. Common Commands
• "Sort by column A" - Sorts data by the specified column
• "Find duplicates" - Identifies duplicate rows
• "Sum column B" - Calculates sum of numeric values
• "Show data for [country/item]" - Filters and displays matching records
• "Replace [old] with [new]" - Find and replace text

5. Troubleshooting

File Upload Issues:
• Ensure your file is in supported format (.xlsx, .xls, .csv)
• Check that the file is not corrupted
• Try refreshing the page and uploading again

AI Not Responding:
• Make sure you've uploaded a file first
• Use clear, specific commands
• Try rephrasing your request

Formatting Issues:
• Select cells before applying formatting
• Use Ctrl+click for multiple cell selection
• Check that undo/redo buttons are enabled

6. Best Practices
• Use descriptive column headers in your data
• Keep file sizes reasonable for better performance
• Be specific in your AI commands
• Review results before applying changes to your main sheet

7. Contact Support
For additional help:
• Use the feedback button (👍) for quick questions
• Report bugs or issues through the feedback system
• Suggest new features via feedback

8. System Requirements
• Modern web browser (Chrome, Firefox, Safari, Edge)
• Stable internet connection
• JavaScript enabled
• Cookies enabled for authentication` 
              });
              setShowLegalModal(true);
            }} style={{ color: '#ffffff', textDecoration: 'none', fontSize: '14px', cursor: 'pointer' }}>Support</a>
            <a onClick={() => {
              setLegalContent({ 
                title: 'Contact Us', 
                content: `Get in Touch with Excel AI

1. Quick Support
For immediate assistance, use our in-app feedback system:
• Click the thumbs up button (👍) in the bottom right corner
• Describe your issue or question
• Our team will review and respond promptly

2. Contact Information

All Inquiries:
• Email: contact@advexcel.online
• Response time: 24-48 hours
• For technical support, general questions, business inquiries, and partnerships
• Include details about your browser, file type, and specific issue when reporting problems

3. Before Contacting Support
To help us assist you better, please:
• Try the troubleshooting steps in our Support section
• Note your browser type and version
• Describe the specific steps that led to the issue
• Include any error messages you received

4. Feature Requests
We love hearing from our users! Submit feature requests through:
• The feedback button with "Feature Request" in your message
• Email: contact@advexcel.online with subject "Feature Request"
• Include detailed descriptions of desired functionality

5. Privacy & Security Concerns
For privacy-related questions or security concerns:
• Email: contact@advexcel.online with subject "Privacy/Security"
• Reference our Privacy Policy for detailed information
• Report security vulnerabilities responsibly

6. Business Hours
• Support team operates Monday-Friday, 9 AM - 6 PM EST
• Feedback system monitored 24/7 for urgent issues
• Response times may vary during weekends and holidays

7. Office Location
Excel AI Development Team
Powered by Amazon Web Services
Cloud-based operations for global accessibility

We're committed to providing excellent support and continuously improving Excel AI based on your feedback. Thank you for choosing our platform for your data analysis needs!` 
              });
              setShowLegalModal(true);
            }} style={{ color: '#ffffff', textDecoration: 'none', fontSize: '14px', cursor: 'pointer' }}>Contact Us</a>
          </div>
          <p style={{ margin: 0, fontSize: '12px', color: '#cccccc' }}>
            © 2024 Excel AI. All rights reserved. | Powered by AWS
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
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000
          }}>
            <div style={{
              background: 'white',
              borderRadius: '8px',
              padding: '24px',
              maxWidth: '500px',
              width: '90%',
              maxHeight: '70vh',
              overflow: 'auto'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, color: '#232f3e' }}>{legalContent.title}</h3>
                <button
                  onClick={() => setShowLegalModal(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '20px',
                    cursor: 'pointer',
                    color: '#666'
                  }}
                >
                  ×
                </button>
              </div>
              <div style={{ color: '#333', lineHeight: '1.6', margin: 0, whiteSpace: 'pre-line', fontSize: '14px' }}>{legalContent.content}</div>
              <div style={{ marginTop: '20px', textAlign: 'right' }}>
                <button
                  onClick={() => setShowLegalModal(false)}
                  style={{
                    background: '#0078d4',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    cursor: 'pointer'
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
              background: 'linear-gradient(145deg, #4CAF50, #45a049)',
              color: 'white',
              cursor: 'pointer',
              boxShadow: '0 8px 16px rgba(76,175,80,0.3), inset 0 2px 4px rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              border: 'none',
              transition: 'all 0.3s ease',
              animation: 'spin3d 2s infinite linear'
            }}
            onMouseEnter={(e) => {
              const target = e.target as HTMLElement;
              target.style.transform = 'scale(1.1)';
              target.style.boxShadow = '0 12px 24px rgba(76,175,80,0.4), inset 0 2px 4px rgba(255,255,255,0.3)';
            }}
            onMouseLeave={(e) => {
              const target = e.target as HTMLElement;
              target.style.transform = 'scale(1)';
              target.style.boxShadow = '0 8px 16px rgba(76,175,80,0.3), inset 0 2px 4px rgba(255,255,255,0.2)';
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
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
              padding: '20px',
              border: '1px solid #e1e5e9'
            }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#232f3e', fontSize: '16px' }}>Send Feedback</h4>
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Share your thoughts about Excel AI..."
                style={{
                  width: '100%',
                  height: '80px',
                  border: '1px solid #d5d9d9',
                  borderRadius: '6px',
                  padding: '8px',
                  fontSize: '14px',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  resize: 'none',
                  outline: 'none'
                }}
              />
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <button
                  onClick={() => {
                    if (feedbackText.trim()) {
                      alert('Thank you for your feedback! We appreciate your input.');
                      setFeedbackText('');
                      setShowFeedbackBox(false);
                    }
                  }}
                  style={{
                    background: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
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
                    background: '#f5f5f5',
                    color: '#333',
                    border: '1px solid #d5d9d9',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
        
        <style>{`
          @keyframes spin3d {
            0% { transform: rotateY(0deg); }
            100% { transform: rotateY(360deg); }
          }
        `}</style>
      </div>
    </ErrorBoundary>
  );
}