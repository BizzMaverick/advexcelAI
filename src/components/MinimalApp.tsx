import { useState } from 'react';
import React from 'react';
import * as XLSX from 'xlsx';
import emailjs from '@emailjs/browser';
import logo from '../assets/logo.png';
import bedrockService from '../services/bedrockService';
import PaymentService from '../services/paymentService';
import ErrorBoundary from './ErrorBoundary';

interface User {
  email: string;
  name: string;
}

interface MinimalAppProps {
  user: User;
  onLogout: () => void;
  trialStatus?: {
    hasValidPayment: boolean;
    inTrial?: boolean;
    trialExpired?: boolean;
    promptsRemaining?: number;
    promptsUsed?: number;
    isAdmin?: boolean;
  };
  onTrialRefresh?: () => void;
}

export default function MinimalApp({ user, onLogout, trialStatus, onTrialRefresh }: MinimalAppProps) {
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

  // Generate device fingerprint for single device login
  const getDeviceFingerprint = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx!.textBaseline = 'top';
    ctx!.font = '14px Arial';
    ctx!.fillText('Device fingerprint', 2, 2);
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL()
    ].join('|');
    
    // Create a simple hash
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  };

  // Check device on component mount
  React.useEffect(() => {
    const deviceId = getDeviceFingerprint();
    localStorage.setItem('device_id', deviceId);
    
    // Send device info with first API call for validation
    console.log('Device ID:', deviceId);
  }, []);

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

    // Check if user can use a prompt (trial/payment limits)
    if (!trialStatus?.isAdmin) {
      const deviceId = localStorage.getItem('device_id') || getDeviceFingerprint();
      const promptCheck = await PaymentService.canUsePrompt(user.email);
      
      // Note: Device validation should be handled in the backend PaymentService
      // For now, we'll add device info to future API calls
      
      if (!promptCheck.canUse) {
        if (promptCheck.reason === 'trial_expired') {
          setAiResponse('⏰ <strong>Trial Expired!</strong><br><br>Your 3-day free trial has ended. Please upgrade to continue using AdvExcel.');
          return;
        } else if (promptCheck.reason === 'daily_limit_reached') {
          setAiResponse('📊 <strong>Daily Limit Reached!</strong><br><br>You have used all 25 prompts for today. Your limit will reset tomorrow, or upgrade for unlimited access.');
          return;
        } else if (promptCheck.reason === 'no_payment') {
          setAiResponse('💳 <strong>Payment Required!</strong><br><br>Please complete payment to access AdvExcel.');
          return;
        } else {
          setAiResponse(`❌ <strong>Access Denied:</strong><br><br>${promptCheck.reason || 'Please check your subscription status.'}`);
          return;
        }
      }
      
      // Show remaining prompts for trial users
      if (trialStatus?.inTrial && promptCheck.promptsRemaining !== undefined) {
        console.log(`Prompts remaining today: ${promptCheck.promptsRemaining}`);
      }
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
      <div className="page-transition" style={{ minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
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
            <span style={{ fontSize: '16px', fontWeight: '600' }}>AdvExcel</span>
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
          <div className="section-animate card-animate" style={{ background: 'white', borderRadius: '8px', padding: '20px', marginBottom: '20px', color: '#333' }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#333', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>📁</span>
              Upload File
            </h3>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input 
                type="file" 
                accept=".xlsx,.xls,.csv" 
                onChange={handleFileUpload}
                disabled={fileLoading}
                style={{ 
                  flex: 1,
                  padding: '12px', 
                  border: '1px solid #ddd', 
                  borderRadius: '6px',
                  color: '#333',
                  backgroundColor: '#ffffff'
                }}
              />
            </div>
            {fileLoading && <div style={{ marginTop: '10px', color: '#0078d4', fontWeight: 'bold' }}>Loading...</div>}
            {fileError && <div style={{ marginTop: '10px', color: '#e53e3e', fontSize: '12px', fontWeight: 'bold' }}>{fileError}</div>}
          </div>

          {/* AI Command */}
          <div className="section-animate card-animate" style={{ background: 'white', borderRadius: '8px', padding: '20px', marginBottom: '20px', color: '#333' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ margin: 0, color: '#333', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>🤖</span>
                Ask AI
              </h3>
              {trialStatus?.inTrial && (
                <div style={{ 
                  background: '#e7f3ff', 
                  color: '#0078d4', 
                  padding: '4px 12px', 
                  borderRadius: '12px', 
                  fontSize: '12px', 
                  fontWeight: '500'
                }}>
                  Trial: {trialStatus.promptsRemaining || 0} prompts left today
                </div>
              )}
            </div>
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
                className="btn-animate"
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
                <h3 style={{ margin: 0, fontSize: '16px' }}>AI Response</h3>
                <p style={{ margin: '5px 0 0 0', fontSize: '12px', opacity: 0.9 }}>
                  {aiResponse.split('<br><br>')[0]?.replace(/<[^>]*>/g, '') || aiResponse.split('<table')[0]?.replace(/<[^>]*>/g, '') || 'Processing completed'}
                </p>
              </div>
              <div style={{ maxHeight: '400px', overflow: 'auto' }}>
                <div style={{ 
                  background: '#ffffff', 
                  padding: '20px', 
                  color: '#333'
                }}>
                  <div dangerouslySetInnerHTML={{ __html: aiResponse.includes('<table') ? aiResponse.split('<br><br>').slice(1).join('<br><br>') : aiResponse.split('<br><br>').slice(1).join('<br><br>') || aiResponse }} />
                </div>
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
                content: `Last updated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

What Information We Collect:
• Your name and email address when you create an account
• Excel/CSV files you upload for processing
• Usage data to improve our service

How We Use Your Information:
• Process your files to provide AI-powered analysis
• Maintain your account and authentication
• Improve our services and user experience

Data Security:
• We use Amazon Web Services (AWS) for secure processing
• Your data is encrypted and protected with industry standards
• Files are processed temporarily and not permanently stored
• Account data is kept secure until you delete your account

Data Sharing:
• We do not sell or share your personal information
• We only use AWS services (Cognito, Bedrock) for processing
• No third-party access to your data

Your Rights:
• Access, modify, or delete your personal information
• Request account deletion at any time
• Withdraw consent for data processing

Contact Us:
For privacy questions, email: contact@advexcel.online` 
              });
              setShowLegalModal(true);
            }} style={{ color: '#ffffff', textDecoration: 'none', fontSize: '14px', cursor: 'pointer' }}>Privacy Policy</a>
            <a onClick={() => {
              setLegalContent({ 
                title: 'Terms of Service', 
                content: `Last updated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

By using Excel AI, you agree to these terms.

What Excel AI Does:
• AI-powered analysis of Excel and CSV files
• Data sorting, filtering, and mathematical calculations
• Duplicate detection and data manipulation
• Powered by Amazon Web Services

Your Responsibilities:
• Only upload files you have permission to process
• Don't upload sensitive personal data or confidential information
• Use the service legally and responsibly
• Keep your account credentials secure
• Don't attempt to hack or compromise the service

Prohibited Uses:
• Illegal, harmful, or malicious content
• Files with viruses or malware
• Unauthorized access attempts
• Commercial use without permission
• Violating applicable laws

Service Terms:
• Service provided "as-is" without warranties
• We may modify or discontinue service anytime
• No guarantee of uninterrupted access
• Limited liability for service issues

Changes:
• We may update these terms anytime
• Continued use means you accept changes

Contact: contact@advexcel.online` 
              });
              setShowLegalModal(true);
            }} style={{ color: '#ffffff', textDecoration: 'none', fontSize: '14px', cursor: 'pointer' }}>Terms of Service</a>
            <a onClick={() => {
              setLegalContent({ 
                title: 'Cookie Policy', 
                content: `Last updated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

What Are Cookies:
Small text files stored on your device to make websites work better.

How We Use Cookies:
• Keep you logged in (authentication)
• Remember your preferences
• Analyze usage to improve our service
• Ensure security and prevent fraud

Types of Cookies:

Essential Cookies (Required):
• AWS Cognito authentication cookies
• Security and session management
• Application functionality

Analytical Cookies (Optional):
• Usage analytics and performance monitoring
• Feature tracking to improve services

Third-Party Cookies:
• Amazon Web Services for authentication and security
• No other third-party cookies

Managing Cookies:
• Control cookies through your browser settings
• View, delete, or block cookies as needed
• Disabling essential cookies may break functionality
• Session cookies deleted when browser closes

Contact: contact@advexcel.online` 
              });
              setShowLegalModal(true);
            }} style={{ color: '#ffffff', textDecoration: 'none', fontSize: '14px', cursor: 'pointer' }}>Cookie Policy</a>
            <a onClick={() => {
              setLegalContent({ 
                title: 'Support & Help', 
                content: `Getting Started:
• Create account with your email
• Upload Excel (.xlsx, .xls) or CSV files
• Use natural language commands
• Apply results or download new files

Supported Files:
• Excel files (.xlsx, .xls)
• CSV files (.csv)
• Large files truncated to 1000 rows

Key Features:
• Sort data by any column
• Find and remove duplicates
• Math operations (sum, average, count, min, max)
• Data filtering and search
• Text formatting (bold, italic, colors)
• Format painter and undo/redo

Common Commands:
• "Sort by column A"
• "Find duplicates"
• "Sum column B"
• "Show data for [item]"
• "Replace [old] with [new]"

Troubleshooting:
• Upload issues: Check file format, refresh page
• AI not responding: Upload file first, use clear commands
• Formatting issues: Select cells first, use Ctrl+click

Best Practices:
• Use descriptive column headers
• Keep reasonable file sizes
• Be specific in commands
• Review results before applying

Need Help:
• Use feedback button (👍) for quick questions
• Email: contact@advexcel.online
• Include browser type and specific issue details

System Requirements:
• Modern web browser
• Internet connection
• JavaScript and cookies enabled` 
              });
              setShowLegalModal(true);
            }} style={{ color: '#ffffff', textDecoration: 'none', fontSize: '14px', cursor: 'pointer' }}>Support</a>
            <a onClick={() => {
              setLegalContent({ 
                title: 'Contact Us', 
                content: `Quick Support:
• Click the feedback button (👍) in bottom right corner
• Describe your issue or question
• We'll respond promptly

Email Contact:
• contact@advexcel.online
• Response time: 24-48 hours
• For all inquiries: technical support, questions, business, partnerships

Before Contacting:
• Try troubleshooting steps in Support section
• Note your browser type and version
• Describe specific steps that caused the issue
• Include any error messages

Feature Requests:
• Use feedback button with "Feature Request"
• Email with subject "Feature Request"
• Include detailed descriptions

Privacy & Security:
• Email with subject "Privacy/Security"
• Reference our Privacy Policy
• Report security issues responsibly

Business Hours:
• Monday-Friday, 9 AM - 6 PM EST
• Feedback monitored 24/7 for urgent issues
• Weekend response times may vary

About Us:
• Excel AI Development Team
• Powered by Amazon Web Services
• Cloud-based for global accessibility

We're committed to excellent support and continuous improvement based on your feedback!` 
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
              maxWidth: '600px',
              width: '90%',
              maxHeight: '70vh',
              overflow: 'auto'
            }}>
              <div style={{ position: 'relative', marginBottom: '16px', textAlign: 'center' }}>
                <h3 style={{ margin: 0, color: '#232f3e' }}>{legalContent.title}</h3>
                <button
                  onClick={() => setShowLegalModal(false)}
                  style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
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
                  onClick={async () => {
                    if (feedbackText.trim()) {
                      try {
                        await emailjs.send(
                          'service_gyuegyb',
                          'template_16urb42',
                          {
                            user_email: user.email,
                            user_name: user.name,
                            message: feedbackText,
                            to_email: 'contact@advexcel.online'
                          },
                          '3xCIlXaFmm79QkBaB'
                        );
                        alert('Thank you for your feedback! We have received your message and will respond soon.');
                        setFeedbackText('');
                        setShowFeedbackBox(false);
                      } catch (error) {
                        console.error('Failed to send feedback:', error);
                        alert('Sorry, there was an error sending your feedback. Please try again or email us directly at contact@advexcel.online');
                      }
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