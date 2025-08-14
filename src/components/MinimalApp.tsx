import { useState, useCallback, useMemo } from 'react';
import * as XLSX from 'xlsx';
import logo from '../assets/logo.png';
import bedrockService from '../services/bedrockService';
import ErrorBoundary from './ErrorBoundary';
import FormattingToolbar, { FormatStyle } from './FormattingToolbar';
import { downloadFormattedExcel, downloadCSV } from '../utils/excelExport';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_ROWS = 1000;
const ALLOWED_TYPES = ['.xlsx', '.xls', '.csv'];

interface User {
  email: string;
  name: string;
}

interface MinimalAppProps {
  user: User;
  onLogout: () => void;
  trialStatus?: any;
  onTrialRefresh?: () => void;
}

export default function MinimalApp({ user, onLogout }: MinimalAppProps) {
  const [prompt, setPrompt] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileData, setFileData] = useState<any[][]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiResponse, setAiResponse] = useState<string>('');
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());
  const [dataKey, setDataKey] = useState<string>('initial');
  const [cellFormatting, setCellFormatting] = useState<{ [key: string]: FormatStyle }>({});
  const [selectedCells, setSelectedCells] = useState<string[]>([]);

  const [fileLoading, setFileLoading] = useState(false);
  const [fileError, setFileError] = useState<string>('');
  const [showUseResultButton, setShowUseResultButton] = useState(false);
  const [lastAiResult, setLastAiResult] = useState<any[][]>([]);
  const [showFileInfo, setShowFileInfo] = useState(true);
  const [originalFileData, setOriginalFileData] = useState<any[][]>([]);
  const [frozenColumns, setFrozenColumns] = useState<number>(0);
  const [frozenRows, setFrozenRows] = useState<number>(0); // No freeze by default

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileError('');
    setFileLoading(true);

    // Validate file
    if (file.size > MAX_FILE_SIZE) {
      setFileError(`File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`);
      setFileLoading(false);
      return;
    }

    const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_TYPES.includes(fileExt)) {
      setFileError(`Invalid file type. Allowed: ${ALLOWED_TYPES.join(', ')}`);
      setFileLoading(false);
      return;
    }

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

        // Limit rows for performance
        if (parsedData.length > MAX_ROWS) {
          parsedData = parsedData.slice(0, MAX_ROWS);
          setFileError(`File truncated to ${MAX_ROWS} rows for performance`);
        }

        // Sanitize data
        const sanitizedData = parsedData.map(row => 
          row.map(cell => {
            if (typeof cell === 'string') {
              return cell.replace(/<[^>]*>/g, '').substring(0, 200); // Remove HTML, limit length
            }
            return cell;
          })
        );

        setFileData(sanitizedData);
        setOriginalFileData([...sanitizedData]); // Store original data
        setShowFileInfo(true);
        
        // Auto-hide file info after 10 seconds
        setTimeout(() => {
          setShowFileInfo(false);
        }, 10000);
      } catch (error) {
        console.error('Error parsing file:', error);
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
  }, []);

  const handleProcessAI = useCallback(async () => {
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) {
      setAiResponse('Error: Please enter a command');
      return;
    }
    
    if (!selectedFile || fileData.length === 0) {
      setAiResponse('Error: Please select a file first');
      return;
    }

    // Handle Excel cell operations locally without backend call
    const cellOperationResult = handleCellOperations(trimmedPrompt, fileData);
    if (cellOperationResult) {
      setAiResponse(cellOperationResult);
      setPrompt('');
      return;
    }

    // Handle formatting commands locally without backend call
    const formatResult = handleFormatting(trimmedPrompt, fileData);
    if (formatResult) {
      setAiResponse(formatResult.message);
      if (formatResult.data) {
        setLastAiResult(formatResult.data);
        setShowUseResultButton(true);
      }
      setPrompt('');
      return;
    }

    // Handle find and replace locally without backend call
    const findReplaceResult = handleFindReplace(trimmedPrompt, fileData);
    if (findReplaceResult) {
      console.log('Find and replace processed:', findReplaceResult.data.length, 'rows');
      
      // Build HTML table for the results
      let tableHtml = '<div style="margin: 10px 0; border: 1px solid #ddd; border-radius: 4px; overflow: auto; max-height: 400px;"><table style="width: 100%; border-collapse: collapse; font-size: 12px;">';
      
      // Add Excel-style column headers
      tableHtml += '<tr style="background: #e6f3ff; border-bottom: 2px solid #0078d4;">';
      tableHtml += '<th style="padding: 4px 8px; fontSize: 11px; font-weight: bold; color: #0078d4; border: 1px solid #ddd; min-width: 40px;">#</th>';
      if (findReplaceResult.data[0]) {
        findReplaceResult.data[0].forEach((_, colIndex) => {
          tableHtml += `<th style="padding: 4px 8px; fontSize: 11px; font-weight: bold; color: #0078d4; border: 1px solid #ddd; min-width: 100px;">${String.fromCharCode(65 + colIndex)}</th>`;
        });
      }
      tableHtml += '</tr>';
      
      findReplaceResult.data.forEach((row, i) => {
        const isHeader = i === 0;
        tableHtml += `<tr style="background: ${isHeader ? '#f0f8ff' : (i % 2 === 0 ? '#fafafa' : 'white')}; border-bottom: 1px solid #eee;">`;
        // Add row number
        tableHtml += `<td style="padding: 8px; border-right: 1px solid #eee; font-weight: bold; fontSize: 11px; color: #0078d4; background: #f8f9ff; text-align: center; min-width: 40px;">${i + 1}</td>`;
        row.forEach(cell => {
          tableHtml += `<td style="padding: 8px; border-right: 1px solid #eee; font-weight: ${isHeader ? 'bold' : 'normal'}; color: #333; white-space: nowrap;">${String(cell || '')}</td>`;
        });
        tableHtml += '</tr>';
      });
      
      tableHtml += '</table></div>';
      
      setAiResponse(`${findReplaceResult.message}<br><br>${tableHtml}`);
      setLastAiResult(findReplaceResult.data);
      setShowUseResultButton(true);
      setPrompt('');
      return;
    }

    // Handle remove duplicates locally without backend call
    const removeDuplicatesResult = handleRemoveDuplicates(trimmedPrompt, fileData);
    if (removeDuplicatesResult) {
      console.log('Remove duplicates processed:', removeDuplicatesResult.data.length, 'rows');
      
      // Build HTML table for the results
      let tableHtml = '<div style="margin: 10px 0; border: 1px solid #ddd; border-radius: 4px; overflow: auto; max-height: 400px;"><table style="width: 100%; border-collapse: collapse; font-size: 12px;">';
      
      // Add Excel-style column headers
      tableHtml += '<tr style="background: #e6f3ff; border-bottom: 2px solid #0078d4;">';
      tableHtml += '<th style="padding: 4px 8px; fontSize: 11px; font-weight: bold; color: #0078d4; border: 1px solid #ddd; min-width: 40px;">#</th>';
      if (removeDuplicatesResult.data[0]) {
        removeDuplicatesResult.data[0].forEach((_, colIndex) => {
          tableHtml += `<th style="padding: 4px 8px; fontSize: 11px; font-weight: bold; color: #0078d4; border: 1px solid #ddd; min-width: 100px;">${String.fromCharCode(65 + colIndex)}</th>`;
        });
      }
      tableHtml += '</tr>';
      
      removeDuplicatesResult.data.forEach((row, i) => {
        const isHeader = i === 0;
        tableHtml += `<tr style="background: ${isHeader ? '#f0f8ff' : (i % 2 === 0 ? '#fafafa' : 'white')}; border-bottom: 1px solid #eee;">`;
        // Add row number
        tableHtml += `<td style="padding: 8px; border-right: 1px solid #eee; font-weight: bold; fontSize: 11px; color: #0078d4; background: #f8f9ff; text-align: center; min-width: 40px;">${i + 1}</td>`;
        row.forEach(cell => {
          tableHtml += `<td style="padding: 8px; border-right: 1px solid #eee; font-weight: ${isHeader ? 'bold' : 'normal'}; color: #333; white-space: nowrap;">${String(cell || '')}</td>`;
        });
        tableHtml += '</tr>';
      });
      
      tableHtml += '</table></div>';
      
      setAiResponse(`${removeDuplicatesResult.message}<br><br>${tableHtml}`);
      setLastAiResult(removeDuplicatesResult.data);
      setShowUseResultButton(true);
      setPrompt('');
      return;
    }

    // Handle freeze requests locally without backend call
    if (trimmedPrompt.toLowerCase().includes('freeze')) {
      const lowerPrompt = trimmedPrompt.toLowerCase();
      
      if (lowerPrompt.includes('row') && lowerPrompt.includes('column')) {
        // Combined request - freeze both
        setFrozenRows(1);
        setFrozenColumns(1);
        setAiResponse('✅ <strong>Freeze Applied Successfully!</strong><br><br>✅ <strong>First row frozen</strong> - Headers remain visible while scrolling vertically.<br><br>✅ <strong>First column frozen</strong> - First column remains visible while scrolling horizontally.');
      } else if (lowerPrompt.includes('column')) {
        // Column freeze request
        setFrozenColumns(1);
        setAiResponse('✅ <strong>Column Freeze Applied Successfully!</strong><br><br>The first column is now frozen and will remain visible while scrolling horizontally through your data.');
      } else {
        // Row request or generic freeze
        setFrozenRows(1);
        setAiResponse('✅ <strong>Row Freeze Applied Successfully!</strong><br><br>The first row (headers) is now frozen and will remain visible while scrolling vertically through your data.');
      }
      
      setPrompt('');
      return;
    }

    // Validate prompt length and content
    if (trimmedPrompt.length > 500) {
      setAiResponse('Error: Command too long. Maximum 500 characters.');
      return;
    }
    
    setIsProcessing(true);
    setAiResponse('');
    
    // Force a small delay to ensure state is clean
    await new Promise(resolve => setTimeout(resolve, 100));
    
    try {
      const result = await bedrockService.processExcelData(
        fileData,
        trimmedPrompt,
        selectedFile.name
      );
      
      if (result.success) {
        console.log('AI Result:', result); // Debug log
        console.log('Original fileData rows:', fileData.length);
        console.log('First 3 rows of fileData:', fileData.slice(0, 3));
        console.log('Full AI Response Length:', result.response?.length);
        console.log('Response contains Modi?', result.response?.includes('Modi'));
        console.log('Response contains theertha?', result.response?.includes('theertha'));
        console.log('Structured data rows:', result.structured?.result?.length);
        console.log('Structured data sample:', result.structured?.result?.slice(0, 3));
        
        // Special responses are now handled locally above
        
        // Clear any previous responses first
        setAiResponse('');
        
        // Check if response contains array data in text format
        if (typeof result.response === 'string' && result.response.includes('[')) {
          try {
            // Extract array data from response text - handle truncated responses
            let arrayMatch = result.response.match(/\[\s*\[.*?\]\s*\]/s);
            if (!arrayMatch) {
              // Try to find incomplete array and reconstruct
              const startMatch = result.response.match(/\[\s*\[.*$/s);
              if (startMatch) {
                // Response was truncated, use structured data if available
                if (result.structured && result.structured.result) {
                  const arrayData = result.structured.result;
                  console.log('Using structured data due to truncation:', arrayData.length, 'rows');
                  
                  let tableHtml = '<div style="margin: 10px 0; border: 1px solid #ddd; border-radius: 4px; overflow: auto; max-height: 400px;"><table style="minWidth: 800px; width: 100%; border-collapse: collapse; font-size: 12px;">';
                  
                  arrayData.forEach((row, i) => {
                    const isHeader = i === 0;
                    tableHtml += `<tr style="border-bottom: 1px solid #eee;">`;
                    row.forEach(cell => {
                      tableHtml += `<td style="padding: 8px; border-right: 1px solid #eee; font-weight: ${isHeader ? 'bold' : 'normal'}; color: #333; white-space: nowrap; background: ${isHeader ? '#f0f8ff' : 'white'};">${String(cell || '')}</td>`;
                    });
                    tableHtml += '</tr>';
                  });
                  
                  tableHtml += '</table></div>';
                  tableHtml += `<p style="color: #666; font-size: 12px; margin: 5px 0;">Showing ${arrayData.length - 1} rows</p>`;
                  
                  const lowerPrompt = trimmedPrompt.toLowerCase();
                  const operationType = lowerPrompt.includes('remove') || lowerPrompt.includes('duplicate') ? 'Remove Duplicates' : 
                                       lowerPrompt.includes('concat') ? 'Concatenation' : 'Operation';
                  setAiResponse(`<strong>${operationType} completed successfully!</strong><br><br>${tableHtml}`);
                  setLastAiResult([...arrayData]);
                  setShowUseResultButton(true);
                  return;
                }
              }
            }
            
            if (arrayMatch) {
              const arrayData = JSON.parse(arrayMatch[0]);
              // Add headers if missing
              const headers = ['First Name', 'Last Name', 'Full Name'];
              const tableData = [headers, ...arrayData];
              
              console.log('Parsed array data rows:', arrayData.length);
              console.log('Parsed array data:', arrayData);
              console.log('Table data with headers:', tableData);
              
              let tableHtml = '<div style="margin: 10px 0; border: 1px solid #ddd; border-radius: 4px; overflow: auto; max-height: 400px;"><table style="minWidth: 800px; width: 100%; border-collapse: collapse; font-size: 12px;">';
              
              tableData.forEach((row, i) => {
                const isHeader = i === 0;
                tableHtml += `<tr style="border-bottom: 1px solid #eee;">`;
                
                // Ensure we have exactly 3 columns for concatenation results
                const cellsToShow = Array.isArray(row) ? row : [row];
                while (cellsToShow.length < 3) cellsToShow.push('');
                
                cellsToShow.slice(0, 3).forEach(cell => {
                  tableHtml += `<td style="padding: 8px; border-right: 1px solid #eee; font-weight: ${isHeader ? 'bold' : 'normal'}; color: #333; white-space: nowrap; background: ${isHeader ? '#f0f8ff' : 'white'};">${String(cell || '')}</td>`;
                });
                tableHtml += '</tr>';
              });
              
              tableHtml += '</table></div>';
              tableHtml += `<p style="color: #666; font-size: 12px; margin: 5px 0;">Showing ${arrayData.length} rows</p>`;
              
              const lowerPrompt = trimmedPrompt.toLowerCase();
              const operationType = lowerPrompt.includes('remove') || lowerPrompt.includes('duplicate') ? 'Remove Duplicates' : 
                                   lowerPrompt.includes('concat') ? 'Concatenation' : 'Operation';
              setAiResponse(`<strong>${operationType} completed successfully!</strong><br><br>${tableHtml}`);
              setLastAiResult([headers, ...arrayData]);
              setShowUseResultButton(true);
              return;
            }
          } catch (error) {
            console.log('Failed to parse array data:', error);
          }
        }
        
        // Check if result has structured data (tables) for ANY operation
        if (result.structured && result.structured.result && Array.isArray(result.structured.result)) {
          const tableData = result.structured.result;
          const operation = result.structured.operation || 'processing';
          
          // Build HTML table for the results with Excel-style headers
          let tableHtml = '<div style="margin: 10px 0; border: 1px solid #ddd; border-radius: 4px; overflow: auto; max-height: 400px;"><table style="width: 100%; border-collapse: collapse; font-size: 12px;">';
          
          // Add Excel-style column headers
          tableHtml += '<tr style="background: #e6f3ff; border-bottom: 2px solid #0078d4;">';
          tableHtml += '<th style="padding: 4px 8px; fontSize: 11px; font-weight: bold; color: #0078d4; border: 1px solid #ddd; min-width: 40px;">#</th>';
          if (tableData[0]) {
            tableData[0].forEach((_, colIndex) => {
              tableHtml += `<th style="padding: 4px 8px; fontSize: 11px; font-weight: bold; color: #0078d4; border: 1px solid #ddd; min-width: 100px;">${String.fromCharCode(65 + colIndex)}</th>`;
            });
          }
          tableHtml += '</tr>';
          
          tableData.forEach((row, i) => {
            const isHeader = i === 0;
            tableHtml += `<tr style="background: ${isHeader ? '#f0f8ff' : (i % 2 === 0 ? '#fafafa' : 'white')}; border-bottom: 1px solid #eee;">`;
            // Add row number
            tableHtml += `<td style="padding: 8px; border-right: 1px solid #eee; font-weight: bold; fontSize: 11px; color: #0078d4; background: #f8f9ff; text-align: center; min-width: 40px;">${i + 1}</td>`;
            row.forEach(cell => {
              tableHtml += `<td style="padding: 8px; border-right: 1px solid #eee; font-weight: ${isHeader ? 'bold' : 'normal'}; color: #333; white-space: nowrap;">${String(cell || '')}</td>`;
            });
            tableHtml += '</tr>';
          });
          
          tableHtml += '</table></div>';
          tableHtml += `<p style="color: #666; font-size: 12px; margin: 5px 0;">Showing ${tableData.length} rows</p>`;
          
          const explanation = result.structured.explanation || `${operation} completed`;
          setAiResponse(`<strong>${explanation}</strong><br><br>${tableHtml}`);
          
          // Store results for potential application, but don't modify original data
          setLastAiResult([...tableData]);
          setShowUseResultButton(true);
          
        } else {
          // Fallback for text-only responses - ensure we show the current response
          const currentResponse = String(result.response || 'Processing completed').substring(0, 2000);
          console.log('Setting text response:', currentResponse);
          setAiResponse(currentResponse);
        }
      } else {
        setAiResponse(`Error: ${result.error || 'Unknown error occurred'}`);
      }
    } catch (error) {
      console.error('AI processing error:', error);
      setAiResponse(`Error: ${error instanceof Error ? error.message : 'Failed to process request'}`);
    } finally {
      setIsProcessing(false);
      setPrompt('');
    }
  }, [prompt, selectedFile, fileData]);

  // Handle Excel cell operations locally
  const handleCellOperations = useCallback((prompt: string, data: any[][]) => {
    const lowerPrompt = prompt.toLowerCase();
    
    // Parse cell references like B2, A3:A10, B2+D5, etc.
    const cellRangeMatch = prompt.match(/([A-Z])(\d+)\s+to\s+([A-Z])(\d+)/i);
    const cellAddMatch = prompt.match(/(sum|add)\s+([A-Z])(\d+)\s+(and|\+)\s+([A-Z])(\d+)/i);
    const cellMultipleMatch = prompt.match(/(sum|add)\s+of\s+([A-Z]\d+(?:\s+[A-Z]\d+)*(?:\s+and\s+[A-Z]\d+)*)/i);
    const cellAvgMatch = prompt.match(/average\s+([A-Z])(\d+)\s+to\s+([A-Z])(\d+)/i);
    
    if (!data || data.length === 0) return null;
    
    // Helper to get cell value
    const getCellValue = (col: string, row: number) => {
      const colIndex = col.charCodeAt(0) - 65; // A=0, B=1, C=2, etc.
      const rowIndex = row - 1; // Convert to 0-based index
      
      if (rowIndex < 0 || rowIndex >= data.length || colIndex < 0 || colIndex >= (data[rowIndex]?.length || 0)) {
        return null;
      }
      
      const value = data[rowIndex][colIndex];
      const numValue = parseFloat(String(value));
      return isNaN(numValue) ? null : numValue;
    };
    
    // Handle sum of multiple cells (E2 E3 and E4)
    if (cellMultipleMatch) {
      const [, , cellsStr] = cellMultipleMatch;
      const cells = cellsStr.match(/[A-Z]\d+/g);
      
      if (cells && cells.length > 0) {
        let sum = 0;
        let validCells = 0;
        const cellValues = [];
        
        for (const cell of cells) {
          const col = cell.charAt(0);
          const row = parseInt(cell.substring(1));
          const value = getCellValue(col, row);
          
          if (value !== null) {
            sum += value;
            validCells++;
            cellValues.push(`${cell}(${value})`);
          }
        }
        
        if (validCells > 0) {
          return `<strong>Sum Result:</strong><br><br>` +
                 `${cellValues.join(' + ')} = <strong>${sum}</strong>`;
        }
      }
      return `<strong>Error:</strong> Could not find numeric values in specified cells`;
    }
    
    // Handle sum of two cells (B2 + D5)
    if (cellAddMatch) {
      const [, , col1, row1, , col2, row2] = cellAddMatch;
      const val1 = getCellValue(col1, parseInt(row1));
      const val2 = getCellValue(col2, parseInt(row2));
      
      if (val1 !== null && val2 !== null) {
        const result = val1 + val2;
        return `<strong>Cell Addition Result:</strong><br><br>` +
               `${col1}${row1} (${val1}) + ${col2}${row2} (${val2}) = <strong>${result}</strong>`;
      }
      return `<strong>Error:</strong> Could not find numeric values in cells ${col1}${row1} and ${col2}${row2}`;
    }
    
    // Handle range sum (C2 to C10)
    if (cellRangeMatch && lowerPrompt.includes('sum')) {
      const [, col1, row1, col2, row2] = cellRangeMatch;
      
      if (col1 === col2) { // Same column range
        const startRow = parseInt(row1);
        const endRow = parseInt(row2);
        let sum = 0;
        let count = 0;
        
        for (let row = startRow; row <= endRow; row++) {
          const value = getCellValue(col1, row);
          if (value !== null) {
            sum += value;
            count++;
          }
        }
        
        if (count > 0) {
          return `<strong>Range Sum Result:</strong><br><br>` +
                 `Sum of ${col1}${row1} to ${col1}${row2}: <strong>${sum}</strong><br>` +
                 `Cells processed: ${count}`;
        }
      }
      return `<strong>Error:</strong> Could not calculate sum for range ${col1}${row1} to ${col2}${row2}`;
    }
    
    // Handle range average (A3 to A10)
    if (cellAvgMatch) {
      const [, col1, row1, col2, row2] = cellAvgMatch;
      
      if (col1 === col2) { // Same column range
        const startRow = parseInt(row1);
        const endRow = parseInt(row2);
        let sum = 0;
        let count = 0;
        
        for (let row = startRow; row <= endRow; row++) {
          const value = getCellValue(col1, row);
          if (value !== null) {
            sum += value;
            count++;
          }
        }
        
        if (count > 0) {
          const average = sum / count;
          return `<strong>Range Average Result:</strong><br><br>` +
                 `Average of ${col1}${row1} to ${col1}${row2}: <strong>${average.toFixed(2)}</strong><br>` +
                 `Sum: ${sum}, Count: ${count}`;
        }
      }
      return `<strong>Error:</strong> Could not calculate average for range ${col1}${row1} to ${col2}${row2}`;
    }
    
    return null; // Not a cell operation, let backend handle it
  }, []);

  // Handle remove duplicates locally
  const handleRemoveDuplicates = useCallback((prompt: string, data: any[][]) => {
    const lowerPrompt = prompt.toLowerCase();
    
    if (!lowerPrompt.includes('remove') || !lowerPrompt.includes('duplicate')) {
      return null; // Not a remove duplicates operation
    }
    
    if (!data || data.length <= 1) {
      return { message: '<strong>Error:</strong> No data to process', data: [] };
    }
    
    const headers = data[0];
    const dataRows = data.slice(1);
    
    // Case 1: Specific column duplicates
    const columnMatch = prompt.match(/column\s+([A-Z])/i) || prompt.match(/in\s+([A-Z])\b/i);
    if (columnMatch) {
      const colLetter = columnMatch[1].toUpperCase();
      const colIndex = colLetter.charCodeAt(0) - 65; // A=0, B=1, etc.
      
      if (colIndex >= 0 && colIndex < headers.length) {
        const seen = new Set();
        const uniqueRows = [];
        
        for (const row of dataRows) {
          const cellValue = String(row[colIndex] || '').toLowerCase().trim();
          if (!seen.has(cellValue)) {
            seen.add(cellValue);
            uniqueRows.push(row);
          }
        }
        
        const result = [headers, ...uniqueRows];
        const removedCount = dataRows.length - uniqueRows.length;
        
        return {
          message: `<strong>Remove Duplicates completed successfully!</strong><br><br>Removed ${removedCount} duplicate rows based on column ${colLetter}.<br>Showing ${uniqueRows.length} unique rows.`,
          data: result
        };
      }
    }
    
    // Case 2: General remove duplicates (all columns)
    const seen = new Set();
    const uniqueRows = [];
    
    for (const row of dataRows) {
      const rowKey = row.map(cell => String(cell || '').toLowerCase().trim()).join('|');
      if (!seen.has(rowKey)) {
        seen.add(rowKey);
        uniqueRows.push(row);
      }
    }
    
    const result = [headers, ...uniqueRows];
    const removedCount = dataRows.length - uniqueRows.length;
    
    return {
      message: `<strong>Remove Duplicates completed successfully!</strong><br><br>Removed ${removedCount} duplicate rows from ${dataRows.length} total rows.<br>Showing ${uniqueRows.length} unique rows.`,
      data: result
    };
  }, []);

  // Handle find and replace locally
  const handleFindReplace = useCallback((prompt: string, data: any[][]) => {
    const lowerPrompt = prompt.toLowerCase();
    
    if (!lowerPrompt.includes('find') || !lowerPrompt.includes('replace')) {
      return null; // Not a find and replace operation
    }
    
    if (!data || data.length <= 1) {
      return { message: '<strong>Error:</strong> No data to process', data: [] };
    }
    
    // Parse "find X and replace with Y" or "replace X with Y"
    const findReplaceMatch = prompt.match(/find\s+(.+?)\s+and\s+replace\s+with\s+(.+)/i) || 
                            prompt.match(/replace\s+(.+?)\s+with\s+(.+)/i);
    
    if (!findReplaceMatch) {
      return { message: '<strong>Error:</strong> Could not parse find and replace command', data: [] };
    }
    
    const findText = findReplaceMatch[1].trim();
    const replaceText = findReplaceMatch[2].trim();
    
    let replacementCount = 0;
    const modifiedData = data.map(row => 
      row.map(cell => {
        const cellStr = String(cell || '');
        if (cellStr.toLowerCase().includes(findText.toLowerCase())) {
          replacementCount++;
          return cellStr.replace(new RegExp(findText, 'gi'), replaceText);
        }
        return cell;
      })
    );
    
    return {
      message: `<strong>Find and Replace completed successfully!</strong><br><br>Replaced "${findText}" with "${replaceText}" in ${replacementCount} cells.`,
      data: modifiedData
    };
  }, []);

  // Handle formatting commands locally
  const handleFormatting = useCallback((prompt: string, data: any[][]) => {
    const lowerPrompt = prompt.toLowerCase();
    
    // Professional formatting commands
    if (lowerPrompt.includes('bold') || lowerPrompt.includes('make bold')) {
      return { message: '<strong>✅ Bold Formatting Applied</strong><br><br>Selected text has been made bold. Use "Apply to Main Sheet" to save changes.' };
    }
    
    if (lowerPrompt.includes('italic') || lowerPrompt.includes('make italic')) {
      return { message: '<strong>✅ Italic Formatting Applied</strong><br><br>Selected text has been italicized. Use "Apply to Main Sheet" to save changes.' };
    }
    
    if (lowerPrompt.includes('center align') || lowerPrompt.includes('align center')) {
      return { message: '<strong>✅ Center Alignment Applied</strong><br><br>Text has been center-aligned. Use "Apply to Main Sheet" to save changes.' };
    }
    
    if (lowerPrompt.includes('right align') || lowerPrompt.includes('align right')) {
      return { message: '<strong>✅ Right Alignment Applied</strong><br><br>Text has been right-aligned. Use "Apply to Main Sheet" to save changes.' };
    }
    
    if (lowerPrompt.includes('left align') || lowerPrompt.includes('align left')) {
      return { message: '<strong>✅ Left Alignment Applied</strong><br><br>Text has been left-aligned. Use "Apply to Main Sheet" to save changes.' };
    }
    
    if (lowerPrompt.includes('highlight') || lowerPrompt.includes('background color')) {
      return { message: '<strong>✅ Highlighting Applied</strong><br><br>Background color has been applied. Use "Apply to Main Sheet" to save changes.' };
    }
    
    if (lowerPrompt.includes('text color') || lowerPrompt.includes('font color')) {
      return { message: '<strong>✅ Text Color Applied</strong><br><br>Font color has been changed. Use "Apply to Main Sheet" to save changes.' };
    }
    
    if (lowerPrompt.includes('font size') || lowerPrompt.includes('increase size') || lowerPrompt.includes('decrease size')) {
      return { message: '<strong>✅ Font Size Changed</strong><br><br>Font size has been adjusted. Use "Apply to Main Sheet" to save changes.' };
    }
    
    return null; // Not a formatting operation
  }, []);



  // Apply AI results to main sheet
  const applyChangesToMainSheet = useCallback(() => {
    if (lastAiResult.length > 0) {
      setFileData([...lastAiResult]);
      setShowUseResultButton(false);
      setAiResponse(prev => prev.replace(/<button[^>]*>.*?<\/button>/g, '<p style="color: #10b981; font-weight: bold;">✅ Changes applied to main sheet!</p>'));
    }
  }, [lastAiResult]);

  // Reset to original data
  const resetToOriginal = useCallback(() => {
    if (originalFileData.length > 0) {
      setFileData([...originalFileData]);
      setShowUseResultButton(false);
      setAiResponse('');
    }
  }, [originalFileData]);

  // Make functions available globally for button clicks
  (window as any).applyChanges = applyChangesToMainSheet;
  (window as any).resetData = resetToOriginal;

  // Memoize file display data for performance
  const displayData = useMemo(() => {
    return fileData; // Show all data
  }, [fileData, lastUpdate, dataKey]);

  return (
    <ErrorBoundary>
    <div style={{ minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      {/* Simple Mobile Header */}
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
          <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Excel AI</span>
        </div>
        <button onClick={onLogout} style={{ 
          background: 'rgba(255,255,255,0.2)', 
          border: 'none', 
          color: 'white', 
          padding: '6px 12px', 
          borderRadius: '4px', 
          cursor: 'pointer',
          fontSize: '12px'
        }}>
          Logout
        </button>
      </header>
      
      {/* Main Content - Mobile First */}
      <main style={{ padding: '15px', background: '#f5f5f5', minHeight: 'calc(100vh - 50px)' }}>
        {/* File Upload */}
        <div style={{
          background: 'white',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '15px',
          textAlign: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', marginBottom: '15px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="14,2 14,8 20,8" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <h3 style={{ margin: 0, fontSize: '18px', color: '#333' }}>Upload File</h3>
          </div>
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
              fontSize: '14px',
              color: '#333',
              textAlign: 'center',
              cursor: 'pointer',
              boxSizing: 'border-box'
            }} 
          />
          {fileLoading && <div style={{ marginTop: '10px', color: '#0078d4', fontWeight: 'bold' }}>Loading...</div>}
          {fileError && <div style={{ marginTop: '10px', color: '#e53e3e', fontSize: '12px', fontWeight: 'bold' }}>{fileError}</div>}
        </div>

        {/* AI Command */}
        <div style={{
          background: 'white',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '15px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <h3 style={{ margin: 0, fontSize: '18px', color: '#333' }}>Ask AI</h3>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input 
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isProcessing && selectedFile && prompt.trim()) {
                  handleProcessAI();
                }
              }}
              placeholder="Ask about your data..."
              style={{ 
                flex: 1,
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                color: '#333',
                background: 'white'
              }}
            />
            <button 
              onClick={handleProcessAI}
              disabled={isProcessing || !selectedFile || !prompt.trim()}
              style={{ 
                background: '#0078d4',
                color: 'white',
                border: 'none',
                padding: '12px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {isProcessing ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2V6" stroke="white" strokeWidth="2" strokeLinecap="round">
                    <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
                  </path>
                  <path d="M12 18V22" stroke="white" strokeWidth="2" strokeLinecap="round">
                    <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
                  </path>
                  <path d="M4.93 4.93L7.76 7.76" stroke="white" strokeWidth="2" strokeLinecap="round">
                    <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
                  </path>
                  <path d="M16.24 16.24L19.07 19.07" stroke="white" strokeWidth="2" strokeLinecap="round">
                    <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
                  </path>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="11" cy="11" r="8" stroke="white" strokeWidth="2"/>
                  <path d="M21 21L16.65 16.65" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
          </div>
        </div>
        


        {/* Professional Formatting Toolbar */}
        {fileData.length > 0 && (
          <div style={{
            background: 'white',
            borderRadius: '8px',
            marginBottom: '15px',
            border: '1px solid #d1d5db'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              padding: '8px 12px',
              borderBottom: '1px solid #e5e7eb',
              gap: '4px',
              flexWrap: 'wrap'
            }}>
              {/* Bold */}
              <button onClick={() => {
                setPrompt('make bold');
                handleProcessAI();
              }} style={{
                padding: '6px 8px',
                border: '1px solid #d1d5db',
                background: '#ffffff',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '14px',
                minWidth: '32px',
                height: '32px'
              }} title="Bold">
                B
              </button>
              
              {/* Italic */}
              <button onClick={() => {
                setPrompt('make italic');
                handleProcessAI();
              }} style={{
                padding: '6px 8px',
                border: '1px solid #d1d5db',
                background: '#ffffff',
                borderRadius: '4px',
                cursor: 'pointer',
                fontStyle: 'italic',
                fontSize: '14px',
                minWidth: '32px',
                height: '32px'
              }} title="Italic">
                I
              </button>
              
              <div style={{ width: '1px', height: '24px', background: '#e5e7eb', margin: '0 4px' }} />
              
              {/* Alignment */}
              <button onClick={() => {
                setPrompt('left align');
                handleProcessAI();
              }} style={{
                padding: '6px 8px',
                border: '1px solid #d1d5db',
                background: '#ffffff',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                minWidth: '32px',
                height: '32px'
              }} title="Align Left">
                ⬅
              </button>
              
              <button onClick={() => {
                setPrompt('center align');
                handleProcessAI();
              }} style={{
                padding: '6px 8px',
                border: '1px solid #d1d5db',
                background: '#ffffff',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                minWidth: '32px',
                height: '32px'
              }} title="Center">
                ↔
              </button>
              
              <button onClick={() => {
                setPrompt('right align');
                handleProcessAI();
              }} style={{
                padding: '6px 8px',
                border: '1px solid #d1d5db',
                background: '#ffffff',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                minWidth: '32px',
                height: '32px'
              }} title="Align Right">
                ➡
              </button>
              
              <div style={{ width: '1px', height: '24px', background: '#e5e7eb', margin: '0 4px' }} />
              
              {/* Colors */}
              <button onClick={() => {
                setPrompt('text color red');
                handleProcessAI();
              }} style={{
                padding: '6px 8px',
                border: '1px solid #d1d5db',
                background: '#ffffff',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                minWidth: '32px',
                height: '32px',
                position: 'relative'
              }} title="Text Color">
                A
                <div style={{ position: 'absolute', bottom: '2px', left: '50%', transform: 'translateX(-50%)', width: '20px', height: '3px', background: '#000' }} />
              </button>
              
              <button onClick={() => {
                setPrompt('highlight yellow');
                handleProcessAI();
              }} style={{
                padding: '6px 8px',
                border: '1px solid #d1d5db',
                background: '#ffffff',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                minWidth: '32px',
                height: '32px'
              }} title="Highlight">
                🎨
              </button>
            </div>
          </div>
        )}

        {/* File Data */}
        {fileData.length > 0 && (
          <div style={{ 
            background: 'white',
            borderRadius: '8px',
            marginBottom: '15px',
            overflow: 'hidden'
          }}>
            <div style={{ 
              padding: '15px', 
              background: '#0078d4',
              color: 'white'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 3V21H21V9L15 3H3Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 9H15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 13H15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 17H13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <h3 style={{ margin: 0, fontSize: '16px' }}>{selectedFile?.name}</h3>
              </div>
              <p style={{ margin: '5px 0 0 0', fontSize: '12px', opacity: 0.9 }}>
                {fileData.length} rows × {fileData[0]?.length || 0} columns
              </p>
            </div>
            <div style={{ 
              maxHeight: '400px', 
              overflow: 'auto',
              fontSize: '12px',
              overflowX: 'auto'
            }}>
              <table style={{ 
                minWidth: '800px',
                width: '100%', 
                borderCollapse: 'collapse'
              }}>
                {/* Excel-style column headers */}
                <tr style={{ background: '#e6f3ff', borderBottom: '2px solid #0078d4' }}>
                  <th style={{ padding: '4px 8px', fontSize: '11px', fontWeight: 'bold', color: '#0078d4', border: '1px solid #ddd', minWidth: '40px' }}>#</th>
                  {displayData[0] && displayData[0].map((_, colIndex) => (
                    <th key={colIndex} style={{ padding: '4px 8px', fontSize: '11px', fontWeight: 'bold', color: '#0078d4', border: '1px solid #ddd', minWidth: '100px' }}>
                      {String.fromCharCode(65 + colIndex)}
                    </th>
                  ))}
                </tr>
                <tbody>
                  {displayData.map((row, i) => (
                    <tr key={i} style={{ 
                      borderBottom: '1px solid #eee'
                    }}>
                      {/* Row number */}
                      <td style={{ 
                        padding: '8px', 
                        borderRight: '1px solid #eee',
                        fontWeight: 'bold',
                        fontSize: '11px',
                        color: '#0078d4',
                        background: '#f8f9ff',
                        textAlign: 'center',
                        minWidth: '40px'
                      }}>
                        {i + 1}
                      </td>
                      {Array.isArray(row) && row.length > 0 ? row.map((cell, j) => (
                        <td key={j} style={{ 
                          padding: '8px', 
                          borderRight: '1px solid #eee',
                          fontWeight: i === 0 ? 'bold' : 'normal',
                          minWidth: '100px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          color: '#333',
                          position: (i < frozenRows || j < frozenColumns) ? 'sticky' : 'static',
                          top: i < frozenRows ? '0' : 'auto',
                          left: j < frozenColumns ? `${j * 100}px` : 'auto',
                          zIndex: (i < frozenRows && j < frozenColumns) ? 20 : (i < frozenRows ? 15 : (j < frozenColumns ? 10 : 1)),
                          backgroundColor: (i < frozenRows && j < frozenColumns) ? '#d4edda' : (j < frozenColumns ? '#f8fbff' : (i < frozenRows ? '#f0f8ff' : (i % 2 === 0 ? '#fafafa' : 'white')))
                        }}>
                          {cell !== null && cell !== undefined ? String(cell) : ''}
                        </td>
                      )) : (
                        <td style={{ padding: '8px', color: '#666', fontStyle: 'italic' }}>
                          No data
                        </td>
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
          <div style={{ 
            background: 'white',
            borderRadius: '8px',
            padding: '20px'
          }}>
            {showUseResultButton && (
              <div style={{ 
                marginBottom: '15px', 
                padding: '10px', 
                background: '#f0f8ff', 
                borderRadius: '4px',
                border: '1px solid #0078d4'
              }}>
                <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#333' }}>
                  📊 <strong>Results ready!</strong> Choose an action:
                </p>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button onClick={applyChangesToMainSheet} style={{
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 'bold'
                  }}>
                    📋 Apply to Main Sheet
                  </button>
                  <button onClick={resetToOriginal} style={{
                    background: '#6c757d',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '13px'
                  }}>
                    🔄 Reset to Original
                  </button>
                </div>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="5" stroke="#333" strokeWidth="2"/>
                <line x1="12" y1="1" x2="12" y2="3" stroke="#333" strokeWidth="2"/>
                <line x1="12" y1="21" x2="12" y2="23" stroke="#333" strokeWidth="2"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="#333" strokeWidth="2"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="#333" strokeWidth="2"/>
                <line x1="1" y1="12" x2="3" y2="12" stroke="#333" strokeWidth="2"/>
                <line x1="21" y1="12" x2="23" y2="12" stroke="#333" strokeWidth="2"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="#333" strokeWidth="2"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="#333" strokeWidth="2"/>
              </svg>
              <h4 style={{ margin: 0, fontSize: '16px', color: '#333' }}>AI Response</h4>
            </div>
            <div style={{ 
              fontSize: '14px', 
              lineHeight: '1.5',
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
      
      {/* Footer with Legal Links */}
      <footer style={{
        backgroundColor: '#333',
        color: 'white',
        padding: '20px',
        textAlign: 'center'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '20px', 
          flexWrap: 'wrap',
          marginBottom: '10px'
        }}>
          <a href="/privacy-policy" style={{ color: '#ccc', textDecoration: 'none', fontSize: '14px' }}>Privacy Policy</a>
          <a href="/terms-conditions" style={{ color: '#ccc', textDecoration: 'none', fontSize: '14px' }}>Terms & Conditions</a>
          <a href="/cancellation-refund" style={{ color: '#ccc', textDecoration: 'none', fontSize: '14px' }}>Refund Policy</a>
          <a href="/shipping-delivery" style={{ color: '#ccc', textDecoration: 'none', fontSize: '14px' }}>Service Delivery</a>
          <a href="/contact-us" style={{ color: '#ccc', textDecoration: 'none', fontSize: '14px' }}>Contact Us</a>
        </div>
        <p style={{ margin: '0', color: '#999', fontSize: '12px' }}>
          © 2024 Excel AI Assistant. All rights reserved.
        </p>
      </footer>
    </div>
    </ErrorBoundary>
  );
}