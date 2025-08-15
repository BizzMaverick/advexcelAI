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
      dataRows.slice(0, 20).forEach((row, index) => {
        response += `<tr style="${index % 2 === 0 ? 'background: #fafafa;' : ''}">`;
        row.forEach(cell => {
          response += `<td style="border: 1px solid #ddd; padding: 8px;">${cell || 'N/A'}</td>`;
        });
        response += '</tr>';
      });
      response += '</tbody></table></div>';
      if (dataRows.length > 20) {
        response += `<br><em>Showing first 20 rows of ${dataRows.length} sorted rows</em>`;
      }
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
            <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>Upload File</h3>
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
            <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>Ask AI</h3>
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
              padding: '16px 24px', 
              marginBottom: '20px', 
              border: '1px solid #e7e7e7',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
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
                      const newFormatting = { ...cellFormatting };
                      selectedCells.forEach(cellId => {
                        newFormatting[cellId] = { ...newFormatting[cellId], fontWeight: 'bold' };
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
                      const newFormatting = { ...cellFormatting };
                      selectedCells.forEach(cellId => {
                        newFormatting[cellId] = { ...newFormatting[cellId], fontStyle: 'italic' };
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
                  
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {[
                      { color: '#232f3e', name: 'Black' },
                      { color: '#cc0c39', name: 'Red' },
                      { color: '#007185', name: 'Blue' },
                      { color: '#007600', name: 'Green' },
                      { color: '#b12704', name: 'Orange' },
                      { color: '#565959', name: 'Gray' }
                    ].map(({ color, name }) => (
                      <button 
                        key={color}
                        onClick={() => {
                          if (selectedCells.length === 0) return;
                          const newFormatting = { ...cellFormatting };
                          selectedCells.forEach(cellId => {
                            newFormatting[cellId] = { ...newFormatting[cellId], color };
                          });
                          setCellFormatting(newFormatting);
                        }}
                        style={{ 
                          background: color,
                          border: '2px solid #ffffff', 
                          width: '28px',
                          height: '28px',
                          borderRadius: '6px', 
                          cursor: 'pointer',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.08)',
                          transition: 'transform 0.15s ease'
                        }}
                        onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                        title={`${name} text`}
                      />
                    ))}
                  </div>
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
                  
                  {[
                    { align: 'left', text: 'Left' },
                    { align: 'center', text: 'Center' },
                    { align: 'right', text: 'Right' }
                  ].map(({ align, text }) => (
                    <button 
                      key={align}
                      onClick={() => {
                        if (selectedCells.length === 0) return;
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
                      {text}
                    </button>
                  ))}
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
                            onClick={() => {
                              const cellId = `${i}-${j}`;
                              if (selectedCells.includes(cellId)) {
                                setSelectedCells(selectedCells.filter(id => id !== cellId));
                              } else {
                                setSelectedCells([...selectedCells, cellId]);
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
            <div style={{ background: 'white', borderRadius: '8px', padding: '20px', color: '#333' }}>
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
              <h4 style={{ margin: '0 0 15px 0', color: '#333' }}>AI Response</h4>
              <div style={{ 
                background: '#f8f9ff', 
                padding: '15px', 
                borderRadius: '6px', 
                border: '1px solid #e6f2fa',
                color: '#333'
              }}>
                <div dangerouslySetInnerHTML={{ __html: aiResponse.replace(/\n/g, '<br>') }} />
              </div>
            </div>
          )}
        </main>
      </div>
    </ErrorBoundary>
  );
}