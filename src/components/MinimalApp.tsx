import { useState } from 'react';
import React from 'react';
import * as XLSX from 'xlsx';
import emailjs from '@emailjs/browser';
import logo from '../assets/logo.png';
import bedrockService from '../services/bedrockService';
import PaymentService from '../services/paymentService';
import ErrorBoundary from './ErrorBoundary';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  BarController,
  LineController,
  PieController,
  ScatterController
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  BarController,
  LineController,
  PieController,
  ScatterController
);

// Enhanced chart generation with all chart types
const generateAnalysisChart = (data: any[][], prompt: string): string => {
  if (!data || data.length < 2) {
    return '<strong>📊 Chart Error:</strong><br><br>Not enough data to create chart. Need at least 2 rows with headers.';
  }

  const headers = data[0].map(h => String(h || ''));
  const rows = data.slice(1);
  const chartId = `chart-${Date.now()}`;
  
  // Detect chart type from prompt
  let chartType = 'bar';
  if (prompt.match(/\b(pie|donut)\b/i)) chartType = 'pie';
  else if (prompt.match(/\b(line|trend)\b/i)) chartType = 'line';
  else if (prompt.match(/\b(scatter)\b/i)) chartType = 'scatter';
  
  // Check for specific data analysis
  const entityMatch = prompt.match(/\b(somalia|yemen|afghanistan|syria|south sudan|congo|sudan|chad|haiti|zimbabwe|[A-Z][a-z]+)\b/i);
  
  if (entityMatch) {
    const entityName = entityMatch[0];
    const entityRow = rows.find(row => 
      row[0] && row[0].toString().toLowerCase().includes(entityName.toLowerCase())
    );
    
    if (entityRow) {
      let chartHtml = `<strong>📊 ${entityName} Analysis</strong><br><br>`;
      chartHtml += '<div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">';
      chartHtml += `<canvas id="${chartId}" width="600" height="400"></canvas>`;
      chartHtml += '</div>';
      
      setTimeout(() => {
        const canvas = document.getElementById(chartId) as HTMLCanvasElement;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            const labels = [];
            const values = [];
            
            for (let i = 1; i < headers.length; i++) {
              const value = Number(entityRow[i]);
              if (!isNaN(value) && value !== 0) {
                labels.push(headers[i]);
                values.push(value);
              }
            }
            
            const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];
            
            new ChartJS(ctx, {
              type: chartType,
              data: {
                labels: labels.slice(0, 10),
                datasets: [{
                  label: `${entityName} Data`,
                  data: values.slice(0, 10),
                  backgroundColor: chartType === 'pie' ? colors : colors[0],
                  borderColor: chartType === 'line' ? colors[0] : '#fff',
                  borderWidth: 2,
                  fill: chartType === 'line' ? false : true
                }]
              },
              options: {
                responsive: true,
                plugins: {
                  legend: { display: chartType === 'pie' },
                  title: { display: true, text: `${entityName} - ${chartType.toUpperCase()} Chart` }
                },
                scales: chartType === 'pie' ? {} : { y: { beginAtZero: true } }
              }
            });
          }
        }
      }, 100);
      
      return chartHtml;
    }
  }
  
  // General data chart
  let chartHtml = '<strong>📊 Data Visualization</strong><br><br>';
  chartHtml += '<div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">';
  chartHtml += `<canvas id="${chartId}" width="600" height="400"></canvas>`;
  chartHtml += '</div>';
  
  setTimeout(() => {
    const canvas = document.getElementById(chartId) as HTMLCanvasElement;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Auto-detect columns for charting
        let labelColumn = 0;
        let valueColumn = 1;
        
        // Find first numeric column
        for (let i = 1; i < headers.length; i++) {
          const hasNumericData = rows.some(row => !isNaN(Number(row[i])) && row[i] !== '');
          if (hasNumericData) {
            valueColumn = i;
            break;
          }
        }
        
        const labels = rows.slice(0, 15).map(row => String(row[labelColumn] || ''));
        const values = rows.slice(0, 15).map(row => {
          const val = Number(row[valueColumn]);
          return isNaN(val) ? 0 : val;
        });
        
        const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];
        
        new ChartJS(ctx, {
          type: chartType,
          data: {
            labels: labels,
            datasets: [{
              label: headers[valueColumn],
              data: values,
              backgroundColor: chartType === 'pie' ? colors : colors[0],
              borderColor: chartType === 'line' ? colors[0] : '#fff',
              borderWidth: 2,
              fill: chartType === 'line' ? false : true
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: { display: chartType === 'pie' },
              title: { display: true, text: `${chartType.toUpperCase()} Chart - ${headers[valueColumn]}` }
            },
            scales: chartType === 'pie' ? {} : { y: { beginAtZero: true } }
          }
        });
      }
    }
  }, 100);
  
  return chartHtml;
};

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
  const [workbook, setWorkbook] = useState<any>(null);
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
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
  const [showChart, setShowChart] = useState(false);
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie'>('bar');
  const [analysisCountry, setAnalysisCountry] = useState<string>('');
  const [promptHistory, setPromptHistory] = useState<string[]>([]);
  const [showPromptDropdown, setShowPromptDropdown] = useState(false);
  const [lastPromptResult, setLastPromptResult] = useState<string>('');

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
        if (file.name.endsWith('.csv')) {
          const text = e.target?.result as string;
          const parsedData = text.split('\n')
            .map(row => row.split(',').map(cell => cell.trim()))
            .filter(row => row.some(cell => cell.length > 0));
          
          if (parsedData.length > 1000) {
            parsedData.splice(1000);
            setFileError('File truncated to 1000 rows for performance');
          }
          
          setFileData(parsedData);
          setOriginalFileData([...parsedData]);
          setSheetNames([]);
          setSelectedSheet('');
          setWorkbook(null);
        } else {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const wb = XLSX.read(data, { type: 'array' });
          setWorkbook(wb);
          setSheetNames(wb.SheetNames);
          
          // Load first sheet by default
          const firstSheetName = wb.SheetNames[0];
          setSelectedSheet(firstSheetName);
          loadSheetData(wb, firstSheetName);
        }
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

  const loadSheetData = (wb: any, sheetName: string) => {
    const sheet = wb.Sheets[sheetName];
    let parsedData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
    
    // Auto-detect header row for CA sheets that don't start with headers
    if (parsedData.length > 1) {
      let headerRowIndex = 0;
      let maxTextColumns = 0;
      
      // Check first 10 rows to find the row with most text (likely headers)
      for (let i = 0; i < Math.min(10, parsedData.length); i++) {
        const row = parsedData[i];
        const textColumns = row.filter(cell => {
          const str = String(cell || '').trim();
          return str.length > 0 && isNaN(Number(str));
        }).length;
        
        if (textColumns > maxTextColumns) {
          maxTextColumns = textColumns;
          headerRowIndex = i;
        }
      }
      
      // If headers found in a different row, reorganize data
      if (headerRowIndex > 0) {
        const headers = parsedData[headerRowIndex];
        const dataRows = parsedData.slice(headerRowIndex + 1);
        parsedData = [headers, ...dataRows];
        setFileError(`Headers detected at row ${headerRowIndex + 1}, data reorganized`);
      }
    }
    
    if (parsedData.length > 1000) {
      parsedData = parsedData.slice(0, 1000);
      setFileError('Sheet truncated to 1000 rows for performance');
    }
    
    setFileData(parsedData);
    setOriginalFileData([...parsedData]);
  };

  const handleSheetChange = (sheetName: string) => {
    if (workbook && sheetName) {
      setSelectedSheet(sheetName);
      loadSheetData(workbook, sheetName);
      setFileError('');
    }
  };

  const handleColumnSum = (prompt: string, data: any[][]) => {
    // Handle range format like C2:C10 or C2 to C10
    const rangeMatch = prompt.match(/sum\s+(?:of\s+)?([A-Z])(\d+)(?:\s*(?:to|:)\s*([A-Z])(\d+))?/i);
    const columnMatch = prompt.match(/sum\s+(?:of\s+)?column\s+([A-Z])/i);
    
    if (!data || data.length <= 1) return null;
    
    let colIndex, startRow, endRow, colLetter;
    
    if (rangeMatch) {
      // Handle range like C2:C10
      colLetter = rangeMatch[1].toUpperCase();
      colIndex = colLetter.charCodeAt(0) - 65;
      startRow = parseInt(rangeMatch[2]) - 1; // Convert to 0-based index
      endRow = rangeMatch[4] ? parseInt(rangeMatch[4]) - 1 : startRow;
    } else if (columnMatch) {
      // Handle column format
      colLetter = columnMatch[1].toUpperCase();
      colIndex = colLetter.charCodeAt(0) - 65;
      startRow = 1; // Skip header
      endRow = data.length - 1;
    } else {
      return null;
    }
    
    if (colIndex < 0 || colIndex >= (data[0]?.length || 0)) {
      return `<strong>Error:</strong> Column ${colLetter} does not exist`;
    }
    
    const columnName = data[0][colIndex] || `Column ${colLetter}`;
    let sum = 0;
    let count = 0;
    
    // Sum the specified range
    for (let i = Math.max(startRow, 0); i <= Math.min(endRow, data.length - 1); i++) {
      const cellValue = data[i][colIndex];
      const numValue = parseFloat(String(cellValue));
      if (!isNaN(numValue)) {
        sum += numValue;
        count++;
      }
    }
    
    if (count === 0) {
      return `<strong>Sum Result:</strong><br><br>No numeric values found in specified range`;
    }
    
    // Create result data with sum added to next row
    const resultData = [...data];
    const newRow = new Array(data[0].length).fill('');
    newRow[colIndex] = sum;
    resultData.push(newRow);
    setLastAiResult(resultData);
    setShowUseResultButton(true);
    
    const rangeText = rangeMatch ? `${colLetter}${startRow + 1}:${colLetter}${endRow + 1}` : `Column ${colLetter}`;
    return `<strong>Sum Result:</strong><br><br>Sum of ${rangeText}: <strong>${sum.toLocaleString()}</strong><br>Cells processed: ${count}`;
  };

  const handleMathOperations = (prompt: string, data: any[][]) => {
    if (!data || data.length <= 1) return null;
    
    const lowerPrompt = prompt.toLowerCase();
    const headers = data[0];
    
    // Find column by name or letter
    const getColumnIndex = (columnRef: string) => {
      if (/^[A-Z]$/i.test(columnRef)) {
        return columnRef.toUpperCase().charCodeAt(0) - 65;
      }
      // Enhanced fuzzy matching for column names
      const searchTerm = columnRef.toLowerCase();
      return headers.findIndex(h => {
        const headerStr = String(h || '').toLowerCase();
        return headerStr.includes(searchTerm) || 
               searchTerm.includes(headerStr) ||
               headerStr.replace(/[^a-z]/g, '').includes(searchTerm.replace(/[^a-z]/g, ''));
      });
    };
    
    // Get numeric values from column
    const getColumnValues = (colIndex: number) => {
      if (colIndex < 0 || colIndex >= headers.length) return [];
      return data.slice(1).map(row => parseFloat(String(row[colIndex] || ''))).filter(n => !isNaN(n));
    };
    
    // SUMIF function - Enhanced pattern matching
    const sumifPatterns = [
      /sumif\s+([a-z0-9]+)\s+([><=!]+)\s*([^\s]+)\s+([a-z0-9]+)/i,
      /sumif\s+([a-z0-9]+)\s*([><=!]+)\s*([^\s]+)/i,
      /sum\s+(?:of\s+)?(?:column\s+)?([a-z0-9]+)\s+(?:where|if)\s+([a-z0-9]+)\s+([><=!]+)\s*([^\s]+)/i
    ];
    
    for (const pattern of sumifPatterns) {
      const sumifMatch = prompt.match(pattern);
      if (sumifMatch) {
        let criteriaCol, operator, criteriaValue, sumCol;
        
        if (sumifMatch.length === 5) {
          // Pattern: SUMIF A > 7 B
          [, criteriaCol, operator, criteriaValue, sumCol] = sumifMatch;
        } else if (sumifMatch.length === 4) {
          // Pattern: SUMIF E>7 or SUMIF E >7 (sum same column)
          [, criteriaCol, operator, criteriaValue] = sumifMatch;
          sumCol = criteriaCol;
        } else {
          // Pattern: sum column B where A > 7
          [, sumCol, criteriaCol, operator, criteriaValue] = sumifMatch;
        }
        
        const criteriaIndex = getColumnIndex(criteriaCol);
        const sumIndex = getColumnIndex(sumCol);
        
        if (criteriaIndex >= 0 && sumIndex >= 0) {
          let sum = 0;
          let count = 0;
          data.slice(1).forEach(row => {
            const criteriaCell = String(row[criteriaIndex] || '');
            const sumCell = parseFloat(String(row[sumIndex] || ''));
            
            let matches = false;
            const numCriteria = parseFloat(criteriaValue);
            const numCell = parseFloat(criteriaCell);
            
            if (!isNaN(numCriteria) && !isNaN(numCell)) {
              switch (operator) {
                case '>': matches = numCell > numCriteria; break;
                case '<': matches = numCell < numCriteria; break;
                case '>=': matches = numCell >= numCriteria; break;
                case '<=': matches = numCell <= numCriteria; break;
                case '=': matches = numCell === numCriteria; break;
                case '!=': matches = numCell !== numCriteria; break;
              }
            } else {
              matches = criteriaCell.toLowerCase().includes(criteriaValue.toLowerCase());
            }
            
            if (matches && !isNaN(sumCell)) {
              sum += sumCell;
              count++;
            }
          });
          
          // Create result data with sum added to next row
          const resultData = [...data];
          const newRow = new Array(data[0].length).fill('');
          newRow[sumIndex] = sum;
          resultData.push(newRow);
          setLastAiResult(resultData);
          setShowUseResultButton(true);
          
          return `<strong>SUMIF Result:</strong><br><br>Sum where ${headers[criteriaIndex]} ${operator} ${criteriaValue}: <strong>${sum.toFixed(2)}</strong><br>Matching rows: ${count}`;
        }
        break;
      }
    }
    
    // COUNTIF function - handle both spaced and non-spaced formats
    const countifMatch = prompt.match(/countif\s+([a-z0-9]+)\s*([><=!]+)\s*([^\s]+)/i);
    if (countifMatch) {
      const [, criteriaCol, operator, criteriaValue] = countifMatch;
      const criteriaIndex = getColumnIndex(criteriaCol);
      
      if (criteriaIndex >= 0) {
        let count = 0;
        data.slice(1).forEach(row => {
          const criteriaCell = String(row[criteriaIndex] || '');
          const numCriteria = parseFloat(criteriaValue);
          const numCell = parseFloat(criteriaCell);
          
          let matches = false;
          if (!isNaN(numCriteria) && !isNaN(numCell)) {
            switch (operator) {
              case '>': matches = numCell > numCriteria; break;
              case '<': matches = numCell < numCriteria; break;
              case '>=': matches = numCell >= numCriteria; break;
              case '<=': matches = numCell <= numCriteria; break;
              case '=': matches = numCell === numCriteria; break;
              case '!=': matches = numCell !== numCriteria; break;
            }
          } else {
            matches = criteriaCell.toLowerCase().includes(criteriaValue.toLowerCase());
          }
          
          if (matches) count++;
        });
        
        // Create result data with count added to next row
        const resultData = [...data];
        const newRow = new Array(data[0].length).fill('');
        newRow[criteriaIndex] = count;
        resultData.push(newRow);
        setLastAiResult(resultData);
        setShowUseResultButton(true);
        
        return `<strong>COUNTIF Result:</strong><br><br>Count where ${headers[criteriaIndex]} ${operator} ${criteriaValue}: <strong>${count}</strong>`;
      }
    }
    
    // AVERAGEIF function - handle both spaced and non-spaced formats
    const averageifMatch = prompt.match(/averageif\s+([a-z0-9]+)\s*([><=!]+)\s*([^\s]+)\s+([a-z0-9]+)/i);
    if (averageifMatch) {
      const [, criteriaCol, operator, criteriaValue, avgCol] = averageifMatch;
      const criteriaIndex = getColumnIndex(criteriaCol);
      const avgIndex = getColumnIndex(avgCol);
      
      if (criteriaIndex >= 0 && avgIndex >= 0) {
        let sum = 0;
        let count = 0;
        data.slice(1).forEach(row => {
          const criteriaCell = String(row[criteriaIndex] || '');
          const avgCell = parseFloat(String(row[avgIndex] || ''));
          
          let matches = false;
          const numCriteria = parseFloat(criteriaValue);
          const numCell = parseFloat(criteriaCell);
          
          if (!isNaN(numCriteria) && !isNaN(numCell)) {
            switch (operator) {
              case '>': matches = numCell > numCriteria; break;
              case '<': matches = numCell < numCriteria; break;
              case '>=': matches = numCell >= numCriteria; break;
              case '<=': matches = numCell <= numCriteria; break;
              case '=': matches = numCell === numCriteria; break;
              case '!=': matches = numCell !== numCriteria; break;
            }
          } else {
            matches = criteriaCell.toLowerCase().includes(criteriaValue.toLowerCase());
          }
          
          if (matches && !isNaN(avgCell)) {
            sum += avgCell;
            count++;
          }
        });
        
        const avg = count > 0 ? sum / count : 0;
        // Create result data with average added to next row
        const resultData = [...data];
        const newRow = new Array(data[0].length).fill('');
        newRow[avgIndex] = avg;
        resultData.push(newRow);
        setLastAiResult(resultData);
        setShowUseResultButton(true);
        
        return `<strong>AVERAGEIF Result:</strong><br><br>Average where ${headers[criteriaIndex]} ${operator} ${criteriaValue}: <strong>${avg.toFixed(2)}</strong><br>Matching rows: ${count}`;
      }
    }
    
    // ROUND function
    const roundMatch = prompt.match(/round\s+([A-Z])(\d+)\s+(\d+)/i);
    if (roundMatch) {
      const [, col, row, decimals] = roundMatch;
      const colIndex = col.charCodeAt(0) - 65;
      const rowIndex = parseInt(row) - 1;
      const decimalPlaces = parseInt(decimals);
      
      if (rowIndex >= 0 && rowIndex < data.length && colIndex >= 0 && colIndex < (data[rowIndex]?.length || 0)) {
        const value = parseFloat(String(data[rowIndex][colIndex]));
        if (!isNaN(value)) {
          const rounded = Math.round(value * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces);
          // Create result data with rounded value added to next row
          const resultData = [...data];
          const newRow = new Array(data[0].length).fill('');
          newRow[colIndex] = rounded;
          resultData.push(newRow);
          setLastAiResult(resultData);
          setShowUseResultButton(true);
          
          return `<strong>ROUND Result:</strong><br><br>ROUND(${col}${row}, ${decimals}) = ${rounded}`;
        }
      }
    }
    
    // ABS function
    const absMatch = prompt.match(/abs\s+([A-Z])(\d+)/i);
    if (absMatch) {
      const [, col, row] = absMatch;
      const colIndex = col.charCodeAt(0) - 65;
      const rowIndex = parseInt(row) - 1;
      
      if (rowIndex >= 0 && rowIndex < data.length && colIndex >= 0 && colIndex < (data[rowIndex]?.length || 0)) {
        const value = parseFloat(String(data[rowIndex][colIndex]));
        if (!isNaN(value)) {
          const absolute = Math.abs(value);
          // Create result data with absolute value added to next row
          const resultData = [...data];
          const newRow = new Array(data[0].length).fill('');
          newRow[colIndex] = absolute;
          resultData.push(newRow);
          setLastAiResult(resultData);
          setShowUseResultButton(true);
          
          return `<strong>ABS Result:</strong><br><br>ABS(${col}${row}) = ${absolute}`;
        }
      }
    }
    
    // Text functions
    const concatenateMatch = prompt.match(/concatenate\s+([A-Z])(\d+)\s+([A-Z])(\d+)/i);
    if (concatenateMatch) {
      const [, col1, row1, col2, row2] = concatenateMatch;
      const colIndex1 = col1.charCodeAt(0) - 65;
      const colIndex2 = col2.charCodeAt(0) - 65;
      const rowIndex1 = parseInt(row1) - 1;
      const rowIndex2 = parseInt(row2) - 1;
      
      if (rowIndex1 >= 0 && rowIndex1 < data.length && colIndex1 >= 0 && colIndex1 < (data[rowIndex1]?.length || 0) &&
          rowIndex2 >= 0 && rowIndex2 < data.length && colIndex2 >= 0 && colIndex2 < (data[rowIndex2]?.length || 0)) {
        const val1 = String(data[rowIndex1][colIndex1] || '');
        const val2 = String(data[rowIndex2][colIndex2] || '');
        const result = val1 + val2;
        // Create result data with concatenated value added to next row
        const resultData = [...data];
        const newRow = new Array(data[0].length).fill('');
        newRow[colIndex1] = result;
        resultData.push(newRow);
        setLastAiResult(resultData);
        setShowUseResultButton(true);
        
        return `<strong>CONCATENATE Result:</strong><br><br>CONCATENATE(${col1}${row1}, ${col2}${row2}) = "${result}"`;
      }
    }
    
    // LEFT function
    const leftMatch = prompt.match(/left\s+([A-Z])(\d+)\s+(\d+)/i);
    if (leftMatch) {
      const [, col, row, length] = leftMatch;
      const colIndex = col.charCodeAt(0) - 65;
      const rowIndex = parseInt(row) - 1;
      const numChars = parseInt(length);
      
      if (rowIndex >= 0 && rowIndex < data.length && colIndex >= 0 && colIndex < (data[rowIndex]?.length || 0)) {
        const text = String(data[rowIndex][colIndex] || '');
        const result = text.substring(0, numChars);
        // Create result data with LEFT result added to next row
        const resultData = [...data];
        const newRow = new Array(data[0].length).fill('');
        newRow[colIndex] = result;
        resultData.push(newRow);
        setLastAiResult(resultData);
        setShowUseResultButton(true);
        
        return `<strong>LEFT Result:</strong><br><br>LEFT(${col}${row}, ${length}) = "${result}"`;
      }
    }
    
    // RIGHT function
    const rightMatch = prompt.match(/right\s+([A-Z])(\d+)\s+(\d+)/i);
    if (rightMatch) {
      const [, col, row, length] = rightMatch;
      const colIndex = col.charCodeAt(0) - 65;
      const rowIndex = parseInt(row) - 1;
      const numChars = parseInt(length);
      
      if (rowIndex >= 0 && rowIndex < data.length && colIndex >= 0 && colIndex < (data[rowIndex]?.length || 0)) {
        const text = String(data[rowIndex][colIndex] || '');
        const result = text.substring(text.length - numChars);
        // Create result data with RIGHT result added to next row
        const resultData = [...data];
        const newRow = new Array(data[0].length).fill('');
        newRow[colIndex] = result;
        resultData.push(newRow);
        setLastAiResult(resultData);
        setShowUseResultButton(true);
        
        return `<strong>RIGHT Result:</strong><br><br>RIGHT(${col}${row}, ${length}) = "${result}"`;
      }
    }
    
    // MID function
    const midMatch = prompt.match(/mid\s+([A-Z])(\d+)\s+(\d+)\s+(\d+)/i);
    if (midMatch) {
      const [, col, row, start, length] = midMatch;
      const colIndex = col.charCodeAt(0) - 65;
      const rowIndex = parseInt(row) - 1;
      const startPos = parseInt(start) - 1;
      const numChars = parseInt(length);
      
      if (rowIndex >= 0 && rowIndex < data.length && colIndex >= 0 && colIndex < (data[rowIndex]?.length || 0)) {
        const text = String(data[rowIndex][colIndex] || '');
        const result = text.substring(startPos, startPos + numChars);
        // Create result data with MID result added to next row
        const resultData = [...data];
        const newRow = new Array(data[0].length).fill('');
        newRow[colIndex] = result;
        resultData.push(newRow);
        setLastAiResult(resultData);
        setShowUseResultButton(true);
        
        return `<strong>MID Result:</strong><br><br>MID(${col}${row}, ${start}, ${length}) = "${result}"`;
      }
    }
    
    // UPPER function
    const upperMatch = prompt.match(/upper\s+([A-Z])(\d+)/i);
    if (upperMatch) {
      const [, col, row] = upperMatch;
      const colIndex = col.charCodeAt(0) - 65;
      const rowIndex = parseInt(row) - 1;
      
      if (rowIndex >= 0 && rowIndex < data.length && colIndex >= 0 && colIndex < (data[rowIndex]?.length || 0)) {
        const text = String(data[rowIndex][colIndex] || '');
        const result = text.toUpperCase();
        // Create result data with UPPER result added to next row
        const resultData = [...data];
        const newRow = new Array(data[0].length).fill('');
        newRow[colIndex] = result;
        resultData.push(newRow);
        setLastAiResult(resultData);
        setShowUseResultButton(true);
        
        return `<strong>UPPER Result:</strong><br><br>UPPER(${col}${row}) = "${result}"`;
      }
    }
    
    // LOWER function
    const lowerMatch = prompt.match(/lower\s+([A-Z])(\d+)/i);
    if (lowerMatch) {
      const [, col, row] = lowerMatch;
      const colIndex = col.charCodeAt(0) - 65;
      const rowIndex = parseInt(row) - 1;
      
      if (rowIndex >= 0 && rowIndex < data.length && colIndex >= 0 && colIndex < (data[rowIndex]?.length || 0)) {
        const text = String(data[rowIndex][colIndex] || '');
        const result = text.toLowerCase();
        // Create result data with LOWER result added to next row
        const resultData = [...data];
        const newRow = new Array(data[0].length).fill('');
        newRow[colIndex] = result;
        resultData.push(newRow);
        setLastAiResult(resultData);
        setShowUseResultButton(true);
        
        return `<strong>LOWER Result:</strong><br><br>LOWER(${col}${row}) = "${result}"`;
      }
    }
    
    // PROPER function
    const properMatch = prompt.match(/proper\s+([A-Z])(\d+)/i);
    if (properMatch) {
      const [, col, row] = properMatch;
      const colIndex = col.charCodeAt(0) - 65;
      const rowIndex = parseInt(row) - 1;
      
      if (rowIndex >= 0 && rowIndex < data.length && colIndex >= 0 && colIndex < (data[rowIndex]?.length || 0)) {
        const text = String(data[rowIndex][colIndex] || '');
        const result = text.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
        // Create result data with PROPER result added to next row
        const resultData = [...data];
        const newRow = new Array(data[0].length).fill('');
        newRow[colIndex] = result;
        resultData.push(newRow);
        setLastAiResult(resultData);
        setShowUseResultButton(true);
        
        return `<strong>PROPER Result:</strong><br><br>PROPER(${col}${row}) = "${result}"`;
      }
    }
    
    // TRIM function
    const trimMatch = prompt.match(/trim\s+([A-Z])(\d+)/i);
    if (trimMatch) {
      const [, col, row] = trimMatch;
      const colIndex = col.charCodeAt(0) - 65;
      const rowIndex = parseInt(row) - 1;
      
      if (rowIndex >= 0 && rowIndex < data.length && colIndex >= 0 && colIndex < (data[rowIndex]?.length || 0)) {
        const text = String(data[rowIndex][colIndex] || '');
        const result = text.trim();
        // Create result data with TRIM result added to next row
        const resultData = [...data];
        const newRow = new Array(data[0].length).fill('');
        newRow[colIndex] = result;
        resultData.push(newRow);
        setLastAiResult(resultData);
        setShowUseResultButton(true);
        
        return `<strong>TRIM Result:</strong><br><br>TRIM(${col}${row}) = "${result}"`;
      }
    }
    
    // Date functions
    const todayMatch = prompt.match(/today/i);
    if (todayMatch) {
      const today = new Date().toLocaleDateString();
      // Create result data with TODAY result added to next row
      const resultData = [...data];
      const newRow = new Array(data[0].length).fill('');
      newRow[0] = today; // Add to first column
      resultData.push(newRow);
      setLastAiResult(resultData);
      setShowUseResultButton(true);
      
      return `<strong>TODAY Result:</strong><br><br>TODAY() = ${today}`;
    }
    
    const nowMatch = prompt.match(/now/i);
    if (nowMatch) {
      const now = new Date().toLocaleString();
      // Create result data with NOW result added to next row
      const resultData = [...data];
      const newRow = new Array(data[0].length).fill('');
      newRow[0] = now; // Add to first column
      resultData.push(newRow);
      setLastAiResult(resultData);
      setShowUseResultButton(true);
      
      return `<strong>NOW Result:</strong><br><br>NOW() = ${now}`;
    }
    
    const yearMatch = prompt.match(/year\s+([A-Z])(\d+)/i);
    if (yearMatch) {
      const [, col, row] = yearMatch;
      const colIndex = col.charCodeAt(0) - 65;
      const rowIndex = parseInt(row) - 1;
      
      if (rowIndex >= 0 && rowIndex < data.length && colIndex >= 0 && colIndex < (data[rowIndex]?.length || 0)) {
        const dateStr = String(data[rowIndex][colIndex] || '');
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          const year = date.getFullYear();
          // Create result data with YEAR result added to next row
          const resultData = [...data];
          const newRow = new Array(data[0].length).fill('');
          newRow[colIndex] = year;
          resultData.push(newRow);
          setLastAiResult(resultData);
          setShowUseResultButton(true);
          
          return `<strong>YEAR Result:</strong><br><br>YEAR(${col}${row}) = ${year}`;
        }
      }
    }
    
    const monthMatch = prompt.match(/month\s+([A-Z])(\d+)/i);
    if (monthMatch) {
      const [, col, row] = monthMatch;
      const colIndex = col.charCodeAt(0) - 65;
      const rowIndex = parseInt(row) - 1;
      
      if (rowIndex >= 0 && rowIndex < data.length && colIndex >= 0 && colIndex < (data[rowIndex]?.length || 0)) {
        const dateStr = String(data[rowIndex][colIndex] || '');
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          const month = date.getMonth() + 1;
          // Create result data with MONTH result added to next row
          const resultData = [...data];
          const newRow = new Array(data[0].length).fill('');
          newRow[colIndex] = month;
          resultData.push(newRow);
          setLastAiResult(resultData);
          setShowUseResultButton(true);
          
          return `<strong>MONTH Result:</strong><br><br>MONTH(${col}${row}) = ${month}`;
        }
      }
    }
    
    const dayMatch = prompt.match(/day\s+([A-Z])(\d+)/i);
    if (dayMatch) {
      const [, col, row] = dayMatch;
      const colIndex = col.charCodeAt(0) - 65;
      const rowIndex = parseInt(row) - 1;
      
      if (rowIndex >= 0 && rowIndex < data.length && colIndex >= 0 && colIndex < (data[rowIndex]?.length || 0)) {
        const dateStr = String(data[rowIndex][colIndex] || '');
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          const day = date.getDate();
          // Create result data with DAY result added to next row
          const resultData = [...data];
          const newRow = new Array(data[0].length).fill('');
          newRow[colIndex] = day;
          resultData.push(newRow);
          setLastAiResult(resultData);
          setShowUseResultButton(true);
          
          return `<strong>DAY Result:</strong><br><br>DAY(${col}${row}) = ${day}`;
        }
      }
    }
    
    // Basic math operations (existing code)
    if (lowerPrompt.includes('average')) {
      const colMatch = lowerPrompt.match(/average\s+(?:of\s+)?(?:column\s+)?([a-z0-9:]+)/i);
      if (colMatch) {
        const colIndex = getColumnIndex(colMatch[1]);
        const values = getColumnValues(colIndex);
        if (values.length > 0) {
          const avg = values.reduce((a, b) => a + b, 0) / values.length;
            // Create result data with average added to next row
          const resultData = [...data];
          const newRow = new Array(data[0].length).fill('');
          newRow[colIndex] = avg;
          resultData.push(newRow);
          setLastAiResult(resultData);
          setShowUseResultButton(true);
          
          return `<strong>Average Result:</strong><br><br>Average of ${headers[colIndex]}: <strong>${avg.toFixed(2)}</strong><br>Values processed: ${values.length}`;
        }
      }
    }
    
    if (lowerPrompt.includes('count')) {
      const colMatch = lowerPrompt.match(/count\s+(?:of\s+)?(?:column\s+)?([a-z0-9:]+)/i);
      if (colMatch) {
        const colIndex = getColumnIndex(colMatch[1]);
        const values = getColumnValues(colIndex);
        // Create result data with count added to next row
        const resultData = [...data];
        const newRow = new Array(data[0].length).fill('');
        newRow[colIndex] = values.length;
        resultData.push(newRow);
        setLastAiResult(resultData);
        setShowUseResultButton(true);
        
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
            // Create result data with max added to next row
          const resultData = [...data];
          const newRow = new Array(data[0].length).fill('');
          newRow[colIndex] = max;
          resultData.push(newRow);
          setLastAiResult(resultData);
          setShowUseResultButton(true);
          
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
            // Create result data with min added to next row
          const resultData = [...data];
          const newRow = new Array(data[0].length).fill('');
          newRow[colIndex] = min;
          resultData.push(newRow);
          setLastAiResult(resultData);
          setShowUseResultButton(true);
          
          return `<strong>Minimum Result:</strong><br><br>Minimum value in ${headers[colIndex]}: <strong>${min}</strong>`;
        }
      }
    }
    
    // Cell operations (existing code)
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
          // Create result data with calculation result added to next row
          const resultData = [...data];
          const newRow = new Array(data[0].length).fill('');
          newRow[colIndex1] = result;
          resultData.push(newRow);
          setLastAiResult(resultData);
          setShowUseResultButton(true);
          
          return `${col1}${row1} ${symbol} ${col2}${row2} = ${val1} ${symbol} ${val2} = ${result}`;
        }
      }
      return `Error: Could not find numeric values in specified cells`;
    };
    
    if (cellAddMatch) return performCellOperation(cellAddMatch, 'add', '+');
    if (cellSubMatch) return performCellOperation(cellSubMatch, 'subtract', '-');
    if (cellMulMatch) return performCellOperation(cellMulMatch, 'multiply', '*');
    if (cellDivMatch) return performCellOperation(cellDivMatch, 'divide', '/');
    
    // Handle "sum of numbers in column X which are greater than Y" pattern and SUMIF E>5 format
    const conditionalSumMatch = prompt.match(/(?:sum\s+(?:of\s+)?(?:numbers\s+in\s+)?column\s+([a-z])\s+(?:which\s+are\s+|that\s+are\s+)?([><=!]+)\s*([0-9.]+)|sumif\s+([a-z])\s*([><=!]+)\s*([0-9.]+))/i);
    if (conditionalSumMatch) {
      // Handle both patterns: "sum column E > 5" and "sumif E>5"
      const column = conditionalSumMatch[1] || conditionalSumMatch[4];
      const operator = conditionalSumMatch[2] || conditionalSumMatch[5];
      const value = conditionalSumMatch[3] || conditionalSumMatch[6];
      
      const colIndex = getColumnIndex(column);
      const values = getColumnValues(colIndex);
      
      if (values.length > 0) {
        let sum = 0;
        let count = 0;
        const numValue = parseFloat(value);
        
        values.forEach(val => {
          let matches = false;
          switch (operator) {
            case '>': matches = val > numValue; break;
            case '<': matches = val < numValue; break;
            case '>=': matches = val >= numValue; break;
            case '<=': matches = val <= numValue; break;
            case '=': matches = val === numValue; break;
            case '!=': matches = val !== numValue; break;
          }
          if (matches) {
            sum += val;
            count++;
          }
        });
        
        // Create result data with sum added to next row
        const resultData = [...data];
        const newRow = new Array(data[0].length).fill('');
        newRow[colIndex] = sum;
        resultData.push(newRow);
        setLastAiResult(resultData);
        setShowUseResultButton(true);
        
        return `<strong>Conditional Sum Result:</strong><br><br>Sum of values in ${headers[colIndex]} where value ${operator} ${value}: <strong>${sum.toFixed(2)}</strong><br>Matching values: ${count}`;
      }
    }
    
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

    // Add to prompt history
    if (!promptHistory.includes(trimmedPrompt)) {
      setPromptHistory(prev => [trimmedPrompt, ...prev.slice(0, 9)]); // Keep last 10 prompts
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
    
    // Handle local operations first - check SUMIF patterns early
    if (trimmedPrompt.toLowerCase().includes('sumif')) {
      const cellOperationResult = handleCellOperations(trimmedPrompt, fileData);
      if (cellOperationResult) {
        setAiResponse(cellOperationResult);
        setPrompt('');
        return;
      }
    }
    
    // Enhanced column sum with fuzzy matching
    const enhancedColumnSum = (prompt: string, data: any[][]) => {
      if (!data || data.length <= 1) return null;
      
      const headers = data[0];
      const lowerPrompt = prompt.toLowerCase();
      
      // Match patterns like "sum tax amount", "sum of tax", "total tax"
      const sumPatterns = [
        /(?:sum|total)\s+(?:of\s+)?(.+)/i,
        /(.+)\s+(?:sum|total)/i
      ];
      
      for (const pattern of sumPatterns) {
        const match = prompt.match(pattern);
        if (match) {
          const searchTerm = match[1].trim().toLowerCase();
          
          // Find matching column
          const colIndex = headers.findIndex(h => {
            const headerStr = String(h || '').toLowerCase();
            return headerStr.includes(searchTerm) || 
                   searchTerm.includes(headerStr) ||
                   headerStr.replace(/[^a-z]/g, '').includes(searchTerm.replace(/[^a-z]/g, ''));
          });
          
          if (colIndex >= 0) {
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
            
            if (count > 0) {
              const resultData = [...data];
              const newRow = new Array(data[0].length).fill('');
              newRow[colIndex] = sum;
              resultData.push(newRow);
              setLastAiResult(resultData);
              setShowUseResultButton(true);
              
              return `<strong>Sum Result:</strong><br><br>Sum of ${headers[colIndex]}: <strong>${sum.toLocaleString()}</strong><br>Cells processed: ${count}`;
            } else {
              return `<strong>No Data Found:</strong><br><br>Column "${headers[colIndex]}" contains no numeric values to sum.`;
            }
          }
        }
      }
      return null;
    };
    
    const enhancedSum = enhancedColumnSum(trimmedPrompt, fileData);
    if (enhancedSum) {
      setAiResponse(enhancedSum);
      setPrompt('');
      return;
    }
    
    const columnSumResult = handleColumnSum(trimmedPrompt, fileData);
    if (columnSumResult) {
      setAiResponse(columnSumResult);
      setLastPromptResult(trimmedPrompt);
      setPrompt('');
      return;
    }

    const cellOperationResult = handleCellOperations(trimmedPrompt, fileData);
    if (cellOperationResult) {
      setAiResponse(cellOperationResult);
      setPrompt('');
      return;
    }
    
    // Handle conditional sum patterns that might bypass SUMIF
    const conditionalSumPatterns = [
      /sum\s+(?:of\s+)?(?:numbers\s+in\s+)?column\s+([a-z])\s+(?:which\s+are\s+|that\s+are\s+)?([><=!]+)\s*([0-9.]+)/i,
      /sum\s+(?:all\s+)?(?:values\s+in\s+)?([a-z])\s+(?:where\s+|if\s+)([a-z])\s+([><=!]+)\s*([0-9.]+)/i,
      /sumif\s+([a-z])\s*([><=!]+)\s*([0-9.]+)/i
    ];
    
    for (const pattern of conditionalSumPatterns) {
      const match = trimmedPrompt.match(pattern);
      if (match) {
        const mathResult = handleMathOperations(trimmedPrompt, fileData);
        if (mathResult) {
          setAiResponse(mathResult);
          setPrompt('');
          return;
        }
        break;
      }
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
      response += '<table style="width: 100%; border-collapse: collapse;">';
      response += '<thead>';
      response += '<tr style="background: #e6f3ff; border-bottom: 2px solid #0078d4;">';
      response += '<th style="padding: 8px; font-size: 11px; font-weight: bold; color: #0078d4; border: 1px solid #ddd;">#</th>';
      headers.forEach((header, index) => {
        const colLetter = String.fromCharCode(65 + index);
        response += `<th style="padding: 8px; font-size: 11px; font-weight: bold; color: #0078d4; border: 1px solid #ddd;">${colLetter}</th>`;
      });
      response += '</tr></thead><tbody>';
      response += '<tr>';
      response += '<td style="padding: 8px; border-right: 1px solid #eee; font-weight: bold; font-size: 11px; color: #0078d4; background: #f8f9ff; text-align: center;">1</td>';
      headers.forEach(header => {
        response += `<td style="padding: 8px; border-right: 1px solid #eee; font-weight: bold; color: #333;">${header}</td>`;
      });
      response += '</tr>';
      dataRows.forEach((row, index) => {
        response += '<tr>';
        response += `<td style="padding: 8px; border-right: 1px solid #eee; font-weight: bold; font-size: 11px; color: #0078d4; background: #f8f9ff; text-align: center;">${index + 2}</td>`;
        row.forEach(cell => {
          response += `<td style="padding: 8px; border-right: 1px solid #eee; color: #333;">${cell || 'N/A'}</td>`;
        });
        response += '</tr>';
      });
      response += '</tbody></table>';

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
        response += '<table style="width: 100%; border-collapse: collapse;">';
        response += '<thead>';
        response += '<tr style="background: #e6f3ff; border-bottom: 2px solid #0078d4;">';
        response += '<th style="padding: 8px; font-size: 11px; font-weight: bold; color: #0078d4; border: 1px solid #ddd;">#</th>';
        headers.forEach((header, index) => {
          const colLetter = String.fromCharCode(65 + index);
          response += `<th style="padding: 8px; font-size: 11px; font-weight: bold; color: #0078d4; border: 1px solid #ddd;">${colLetter}</th>`;
        });
        response += '</tr></thead><tbody>';
        response += '<tr>';
        response += '<td style="padding: 8px; border-right: 1px solid #eee; font-weight: bold; font-size: 11px; color: #0078d4; background: #f8f9ff; text-align: center;">1</td>';
        headers.forEach(header => {
          response += `<td style="padding: 8px; border-right: 1px solid #eee; font-weight: bold; color: #333;">${header}</td>`;
        });
        response += '</tr>';
        duplicates.forEach((row, index) => {
          response += '<tr>';
          response += `<td style="padding: 8px; border-right: 1px solid #eee; font-weight: bold; font-size: 11px; color: #0078d4; background: #f8f9ff; text-align: center;">${index + 2}</td>`;
          row.forEach(cell => {
            response += `<td style="padding: 8px; border-right: 1px solid #eee; color: #333;">${cell || 'N/A'}</td>`;
          });
          response += '</tr>';
        });
        response += '</tbody></table>';
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



    
    // Handle simple lookup commands
    const lowerPrompt = trimmedPrompt.toLowerCase();
    if (lowerPrompt.includes('lookup')) {
      // Extract multiple search terms (supports "lookup somalia and yemen" or "lookup somalia yemen")
      const lookupMatch = trimmedPrompt.match(/lookup\s+(.+)/i);
      if (lookupMatch) {
        const searchText = lookupMatch[1];
        // Split by "and", "or", "," or spaces to get multiple terms
        const searchTerms = searchText.split(/\s+(?:and|or|,)\s+|\s+/)
          .map(term => term.trim().toLowerCase())
          .filter(term => term.length > 0 && !['and', 'or'].includes(term));
        
        const headers = fileData[0];
        const dataRows = fileData.slice(1);
        
        // Find all rows containing any of the search terms
        const matchingRows = dataRows.filter(row => 
          searchTerms.some(searchTerm =>
            row.some(cell => 
              String(cell || '').toLowerCase().includes(searchTerm)
            )
          )
        );
        
        if (matchingRows.length > 0) {
          const result = [headers, ...matchingRows];
          setLastAiResult(result);
          setShowUseResultButton(true);
          
          const searchDisplay = searchTerms.length > 1 ? searchTerms.join(', ') : searchTerms[0];
          let response = `<strong>Lookup results for '${searchDisplay}' - Found ${matchingRows.length} matches:</strong><br><br>`;
          response += '<table style="width: 100%; border-collapse: collapse;">';
          response += '<thead>';
          response += '<tr style="background: #e6f3ff; border-bottom: 2px solid #0078d4;">';
          response += '<th style="padding: 8px; font-size: 11px; font-weight: bold; color: #0078d4; border: 1px solid #ddd;">#</th>';
          headers.forEach((header, index) => {
            const colLetter = String.fromCharCode(65 + index);
            response += `<th style="padding: 8px; font-size: 11px; font-weight: bold; color: #0078d4; border: 1px solid #ddd;">${colLetter}</th>`;
          });
          response += '</tr></thead><tbody>';
          response += '<tr>';
          response += '<td style="padding: 8px; border-right: 1px solid #eee; font-weight: bold; font-size: 11px; color: #0078d4; background: #f8f9ff; text-align: center;">1</td>';
          headers.forEach(header => {
            response += `<td style="padding: 8px; border-right: 1px solid #eee; font-weight: bold; color: #333;">${header}</td>`;
          });
          response += '</tr>';
          matchingRows.forEach((row, index) => {
            response += '<tr>';
            response += `<td style="padding: 8px; border-right: 1px solid #eee; font-weight: bold; font-size: 11px; color: #0078d4; background: #f8f9ff; text-align: center;">${index + 2}</td>`;
            row.forEach(cell => {
              response += `<td style="padding: 8px; border-right: 1px solid #eee; color: #333;">${cell || 'N/A'}</td>`;
            });
            response += '</tr>';
          });
          response += '</tbody></table>';
          
          setAiResponse(response);
          setPrompt('');
          return;
        } else {
          const searchDisplay = searchTerms.length > 1 ? searchTerms.join(', ') : searchTerms[0];
          setAiResponse(`<strong>No matches found for '${searchDisplay}'</strong>`);
          setPrompt('');
          return;
        }
      }
    }
    
    // Smart lookup - auto-detect data structure
    if (lowerPrompt.includes('show') || lowerPrompt.includes('get') || lowerPrompt.includes('find')) {
      
      // Smart header detection - find row with most text columns
      let headerRowIndex = 0;
      let maxTextColumns = 0;
      
      for (let i = 0; i < Math.min(10, fileData.length); i++) {
        const row = fileData[i];
        const textColumns = row.filter(cell => {
          const str = String(cell || '').trim();
          return str.length > 0 && isNaN(Number(str));
        }).length;
        
        if (textColumns > maxTextColumns) {
          maxTextColumns = textColumns;
          headerRowIndex = i;
        }
      }
      
      const headers = fileData[headerRowIndex];
      const dataRows = fileData.slice(headerRowIndex + 1);
      
      // Parse query patterns
      const showMatch = trimmedPrompt.match(/show\s+(\w+)\s+for\s+(\w+)\s+(\w+)/i);
      const getMatch = trimmedPrompt.match(/get\s+(\w+)\s+(?:where|for)\s+(\w+)\s+(?:is|=|equals?)\s*(\w+)/i);
      
      if (showMatch || getMatch) {
        const [, targetColumn, filterColumn, filterValue] = showMatch || getMatch;
        
        // Smart column detection - fuzzy match
        const findColumn = (searchTerm) => {
          return headers.findIndex(h => {
            const headerStr = String(h || '').toLowerCase();
            const searchStr = searchTerm.toLowerCase();
            return headerStr.includes(searchStr) || searchStr.includes(headerStr);
          });
        };
        
        const targetColIndex = findColumn(targetColumn);
        const filterColIndex = findColumn(filterColumn);
        
        if (targetColIndex === -1 || filterColIndex === -1) {
          setAiResponse(`<strong>Columns not found.</strong> Available columns: ${headers.map(h => String(h)).join(', ')}`);
          setPrompt('');
          return;
        }
        
        // Smart filtering - partial match
        const matchingValues = new Set();
        const matchingRows = [];
        
        dataRows.forEach(row => {
          const cellValue = String(row[filterColIndex] || '').toLowerCase();
          if (cellValue.includes(filterValue.toLowerCase()) || filterValue.toLowerCase().includes(cellValue)) {
            const targetValue = row[targetColIndex];
            if (targetValue && String(targetValue).trim()) {
              matchingValues.add(targetValue);
              matchingRows.push(row);
            }
          }
        });
        
        if (matchingValues.size > 0) {
          const result = [headers, ...matchingRows];
          setLastAiResult(result);
          setShowUseResultButton(true);
          
          let response = `<strong>Lookup results for '${filterValue}' - Found ${matchingRows.length} matches:</strong><br><br>`;
          response += '<table style="width: 100%; border-collapse: collapse;">';
          response += '<thead>';
          response += '<tr style="background: #e6f3ff; border-bottom: 2px solid #0078d4;">';
          response += '<th style="padding: 8px; font-size: 11px; font-weight: bold; color: #0078d4; border: 1px solid #ddd;">#</th>';
          headers.forEach((header, index) => {
            const colLetter = String.fromCharCode(65 + index);
            response += `<th style="padding: 8px; font-size: 11px; font-weight: bold; color: #0078d4; border: 1px solid #ddd;">${colLetter}</th>`;
          });
          response += '</tr></thead><tbody>';
          response += '<tr>';
          response += '<td style="padding: 8px; border-right: 1px solid #eee; font-weight: bold; font-size: 11px; color: #0078d4; background: #f8f9ff; text-align: center;">1</td>';
          headers.forEach(header => {
            response += `<td style="padding: 8px; border-right: 1px solid #eee; font-weight: bold; color: #333;">${header}</td>`;
          });
          response += '</tr>';
          matchingRows.forEach((row, index) => {
            response += '<tr>';
            response += `<td style="padding: 8px; border-right: 1px solid #eee; font-weight: bold; font-size: 11px; color: #0078d4; background: #f8f9ff; text-align: center;">${index + 2}</td>`;
            row.forEach(cell => {
              response += `<td style="padding: 8px; border-right: 1px solid #eee; color: #333;">${cell || 'N/A'}</td>`;
            });
            response += '</tr>';
          });
          response += '</tbody></table>';
          
          setAiResponse(response);
          setPrompt('');
          return;
        } else {
          setAiResponse(`<strong>No matches found for "${filterValue}" in ${headers[filterColIndex]}</strong>`);
          setPrompt('');
          return;
        }
      }
    }

    // Handle chart generation (Phase 1 - Redirect to Advanced)
    if (lowerPrompt.includes('chart') || lowerPrompt.includes('graph') || lowerPrompt.includes('plot')) {
      const hasAdvancedAccess = (trialStatus?.hasValidPayment && !trialStatus?.inTrial) || trialStatus?.isAdmin;
      const hasBasicPaid = trialStatus?.hasValidPayment && !trialStatus?.inTrial;
      const inTrial = trialStatus?.inTrial;
      
      if (hasAdvancedAccess) {
        setAiResponse(`
          <strong>📊 Chart Feature Available in Advanced Version</strong><br><br>
          Charts and graphs are available in the Advanced interface.<br><br>
          <button 
            onclick="localStorage.setItem('use_new_interface', 'true'); window.location.reload();"
            style="background: #0078d4; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500;"
          >
            🚀 Switch to Advanced Interface
          </button>
        `);
      } else if (hasBasicPaid) {
        setAiResponse(`
          <strong>📊 Chart Feature - Advanced Upgrade</strong><br><br>
          You have Basic access (₹49). Upgrade to Advanced for charts and analytics.<br><br>
          <button 
            onclick="window.open('https://buy.stripe.com/advanced-upgrade-179', '_blank')"
            style="background: #10b981; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500; margin-right: 10px;"
          >
            💳 Upgrade to Advanced (₹179)
          </button>
          <button 
            onclick="alert('Advanced features: Charts, Pivot Tables, Statistical Analysis, Predictive Analytics, AI Insights')"
            style="background: #6c757d; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 14px;"
          >
            ℹ️ Learn More
          </button>
        `);
      } else if (inTrial) {
        setAiResponse(`
          <strong>🎉 Chart Feature - Trial User</strong><br><br>
          You have 5 free advanced prompts. Upgrade for unlimited charts!<br><br>
          <button 
            onclick="window.open('https://buy.stripe.com/basic-49', '_blank')"
            style="background: #0078d4; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500; margin-right: 10px;"
          >
            💼 Basic Plan (₹49)
          </button>
          <button 
            onclick="window.open('https://buy.stripe.com/full-199', '_blank')"
            style="background: #10b981; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500;"
          >
            🚀 Full Plan (₹199) - Best Value!
          </button>
        `);
      } else {
        setAiResponse(`
          <strong>📊 Chart Feature - Subscription Required</strong><br><br>
          Choose your plan to access charts and advanced features:<br><br>
          <button 
            onclick="window.open('https://buy.stripe.com/basic-49', '_blank')"
            style="background: #0078d4; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500; margin-right: 10px;"
          >
            💼 Basic Plan (₹49)
          </button>
          <button 
            onclick="window.open('https://buy.stripe.com/full-199', '_blank')"
            style="background: #10b981; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500;"
          >
            🚀 Full Plan (₹199) - Save ₹29!
          </button>
        `);
      }
      setPrompt('');
      return;
    }

    // HANDLE ANALYSIS REQUESTS - Redirect to Advanced
    const analysisKeywords = ['analysis', 'analyze', 'compare', 'comparison', 'visualize', 'display'];
    const isAnalysisRequest = analysisKeywords.some(keyword => lowerPrompt.includes(keyword));
    
    if (isAnalysisRequest) {
      const hasAdvancedAccess = (trialStatus?.hasValidPayment && !trialStatus?.inTrial) || trialStatus?.isAdmin;
      const hasBasicPaid = trialStatus?.hasValidPayment && !trialStatus?.inTrial;
      const inTrial = trialStatus?.inTrial;
      
      if (hasAdvancedAccess) {
        setAiResponse(`
          <strong>🔬 Advanced Analytics Available</strong><br><br>
          Advanced analysis features are available in the Advanced interface.<br><br>
          <button 
            onclick="localStorage.setItem('use_new_interface', 'true'); window.location.reload();"
            style="background: #0078d4; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500;"
          >
            🚀 Switch to Advanced Interface
          </button>
        `);
      } else if (hasBasicPaid) {
        setAiResponse(`
          <strong>🔬 Advanced Analytics - Upgrade Required</strong><br><br>
          You have Basic access. Upgrade to Advanced for analytics and AI insights.<br><br>
          <button 
            onclick="window.open('https://buy.stripe.com/advanced-upgrade-179', '_blank')"
            style="background: #10b981; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500;"
          >
            💳 Upgrade to Advanced (₹179)
          </button>
        `);
      } else if (inTrial) {
        setAiResponse(`
          <strong>🎉 Advanced Analytics - Trial User</strong><br><br>
          You have 5 free advanced prompts. Upgrade for unlimited analytics!<br><br>
          <button 
            onclick="window.open('https://buy.stripe.com/basic-49', '_blank')"
            style="background: #0078d4; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500; margin-right: 10px;"
          >
            💼 Basic Plan (₹49)
          </button>
          <button 
            onclick="window.open('https://buy.stripe.com/full-199', '_blank')"
            style="background: #10b981; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500;"
          >
            🚀 Full Plan (₹199) - Best Value!
          </button>
        `);
      } else {
        setAiResponse(`
          <strong>🔬 Advanced Analytics - Subscription Required</strong><br><br>
          Choose your plan to access advanced analytics:<br><br>
          <button 
            onclick="window.open('https://buy.stripe.com/basic-49', '_blank')"
            style="background: #0078d4; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500; margin-right: 10px;"
          >
            💼 Basic Plan (₹49)
          </button>
          <button 
            onclick="window.open('https://buy.stripe.com/full-199', '_blank')"
            style="background: #10b981; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500;"
          >
            🚀 Full Plan (₹199) - Best Value!
          </button>
        `);
      }
      setPrompt('');
      return;
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
      // Find the result row and add function description
      const resultData = [...lastAiResult];
      const lastRowIndex = resultData.length - 1;
      const lastRow = resultData[lastRowIndex];
      
      // Find the column with the result value
      const resultColIndex = lastRow.findIndex(cell => cell !== '');
      if (resultColIndex >= 0 && lastPromptResult) {
        // Replace just the value with function description + value
        const value = lastRow[resultColIndex];
        resultData[lastRowIndex][resultColIndex] = `${lastPromptResult}: ${value}`;
      }
      
      setFileData(resultData);
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
      <div className="page-transition" style={{ 
        minHeight: '100vh', 
        fontFamily: 'system-ui, -apple-system, sans-serif',
        background: 'url("/basic-bg.gif") center center / cover no-repeat fixed',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0, 0, 0, 0.4)',
          zIndex: 1
        }} />
        <header style={{ 
          background: 'transparent',
          color: 'white', 
          padding: '10px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          position: 'relative',
          zIndex: 1000,
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img src={logo} alt="Logo" style={{ height: '24px' }} />
            <span style={{ fontSize: '16px', fontWeight: '600' }}>AdvExcel</span>
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <span style={{ fontSize: '14px' }}>Welcome, {user.name} {trialStatus?.hasValidPayment && !trialStatus?.inTrial ? '(Paid)' : trialStatus?.inTrial ? '(Free Trial)' : '(Free)'}</span>
            <button
              onClick={() => {
                if (trialStatus?.hasValidPayment || trialStatus?.isAdmin || user.email === 'katragadda225@gmail.com' || user.email?.includes('@advexcel.online')) {
                  localStorage.setItem('use_new_interface', 'true');
                  window.location.reload();
                } else {
                  window.location.href = '/payment';
                }
              }}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                color: 'white',
                padding: '6px 12px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Advanced
            </button>
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
          </div>
        </header>
        

        <main style={{ padding: '20px', background: 'transparent', minHeight: 'calc(100vh - 50px)', position: 'relative', zIndex: 100 }}>
          {/* File Upload */}
          <div className="section-animate card-animate" style={{ background: 'white', borderRadius: '8px', padding: '20px', marginBottom: '20px', color: '#333' }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src="/upload.gif" alt="Upload" style={{ width: '64px', height: '64px', background: 'transparent' }} />
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
            {fileLoading && <div style={{ marginTop: '10px', color: '#0078d4', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}><img src="/refresh-new.gif" alt="Loading" style={{ width: '20px', height: '20px' }} />Loading...</div>}
            {fileError && <div style={{ marginTop: '10px', color: '#e53e3e', fontSize: '12px', fontWeight: 'bold' }}>{fileError}</div>}
            
            {/* Sheet Selector for Excel files */}
            {sheetNames.length > 1 && (
              <div style={{ marginTop: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
                  📊 Select Sheet ({sheetNames.length} sheets available):
                </label>
                <select
                  value={selectedSheet}
                  onChange={(e) => handleSheetChange(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px',
                    backgroundColor: '#ffffff',
                    color: '#333'
                  }}
                >
                  {sheetNames.map((name, index) => (
                    <option key={index} value={name}>
                      {name} {index === 0 ? '(Default)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '500', color: '#232f3e', minWidth: '70px' }}>Text Style</span>
                  <button onClick={() => {
                    if (selectedCells.length === 0) return;
                    saveToUndoStack(cellFormatting);
                    const newFormatting = { ...cellFormatting };
                    selectedCells.forEach(cellId => {
                      const currentWeight = newFormatting[cellId]?.fontWeight;
                      newFormatting[cellId] = { ...newFormatting[cellId], fontWeight: currentWeight === 'bold' ? 'normal' : 'bold' };
                    });
                    setCellFormatting(newFormatting);
                  }} style={{ background: '#ffffff', color: '#232f3e', border: '1px solid #d5d9d9', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>Bold</button>
                  <button onClick={() => {
                    if (selectedCells.length === 0) return;
                    saveToUndoStack(cellFormatting);
                    const newFormatting = { ...cellFormatting };
                    selectedCells.forEach(cellId => {
                      const currentStyle = newFormatting[cellId]?.fontStyle;
                      newFormatting[cellId] = { ...newFormatting[cellId], fontStyle: currentStyle === 'italic' ? 'normal' : 'italic' };
                    });
                    setCellFormatting(newFormatting);
                  }} style={{ background: '#ffffff', color: '#232f3e', border: '1px solid #d5d9d9', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>Italic</button>
                  <button onClick={handleUndo} disabled={undoStack.length === 0} style={{ background: undoStack.length > 0 ? '#ffffff' : '#f5f5f5', color: undoStack.length > 0 ? '#232f3e' : '#999', border: '1px solid #d5d9d9', padding: '8px 12px', borderRadius: '6px', cursor: undoStack.length > 0 ? 'pointer' : 'not-allowed', fontSize: '16px' }} title="Undo">↶</button>
                  <button onClick={handleRedo} disabled={redoStack.length === 0} style={{ background: redoStack.length > 0 ? '#ffffff' : '#f5f5f5', color: redoStack.length > 0 ? '#232f3e' : '#999', border: '1px solid #d5d9d9', padding: '8px 12px', borderRadius: '6px', cursor: redoStack.length > 0 ? 'pointer' : 'not-allowed', fontSize: '16px' }} title="Redo">↷</button>
                  <button onClick={() => {
                    if (!formatPainterActive) {
                      if (selectedCells.length === 1) {
                        const cellId = selectedCells[0];
                        const format = cellFormatting[cellId] || {};
                        setCopiedFormat(format);
                        setFormatPainterActive(true);
                      }
                    } else {
                      setFormatPainterActive(false);
                      setCopiedFormat(null);
                    }
                  }} style={{ background: formatPainterActive ? '#e7f3ff' : '#ffffff', color: '#232f3e', border: formatPainterActive ? '2px solid #007185' : '1px solid #d5d9d9', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '16px' }} title={formatPainterActive ? 'Click cells to apply format' : 'Format Painter'}>🖌️</button>
                </div>
                <div style={{ width: '1px', height: '32px', background: '#e7e7e7' }}></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '500', color: '#232f3e', minWidth: '70px' }}>Text Color</span>
                  <select onChange={(e) => {
                    if (selectedCells.length === 0) return;
                    saveToUndoStack(cellFormatting);
                    const color = e.target.value;
                    const newFormatting = { ...cellFormatting };
                    selectedCells.forEach(cellId => { newFormatting[cellId] = { ...newFormatting[cellId], color }; });
                    setCellFormatting(newFormatting);
                  }} style={{ background: '#ffffff', color: '#232f3e', border: '1px solid #d5d9d9', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', minWidth: '120px' }}>
                    <option value="">Text Color</option>
                    <option value="#000000">⬛ Black</option>
                    <option value="#e74c3c">🟥 Red</option>
                    <option value="#3498db">🟦 Blue</option>
                    <option value="#2ecc71">🟩 Green</option>
                  </select>
                </div>
                <div style={{ width: '1px', height: '32px', background: '#e7e7e7' }}></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '500', color: '#232f3e', minWidth: '70px' }}>Cell Color</span>
                  <select onChange={(e) => {
                    if (selectedCells.length === 0) return;
                    saveToUndoStack(cellFormatting);
                    const backgroundColor = e.target.value;
                    const newFormatting = { ...cellFormatting };
                    selectedCells.forEach(cellId => { newFormatting[cellId] = { ...newFormatting[cellId], backgroundColor }; });
                    setCellFormatting(newFormatting);
                  }} style={{ background: '#ffffff', color: '#232f3e', border: '1px solid #d5d9d9', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', minWidth: '120px' }}>
                    <option value="">Cell Color</option>
                    <option value="#ffffff">⬜ White</option>
                    <option value="#e74c3c">🟥 Red</option>
                    <option value="#3498db">🟦 Blue</option>
                    <option value="#2ecc71">🟩 Green</option>
                  </select>
                </div>
                <div style={{ width: '1px', height: '32px', background: '#e7e7e7' }}></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '500', color: '#232f3e', minWidth: '70px' }}>Alignment</span>
                  <select onChange={(e) => {
                    if (selectedCells.length === 0) return;
                    saveToUndoStack(cellFormatting);
                    const align = e.target.value;
                    const newFormatting = { ...cellFormatting };
                    selectedCells.forEach(cellId => { newFormatting[cellId] = { ...newFormatting[cellId], textAlign: align }; });
                    setCellFormatting(newFormatting);
                  }} style={{ background: '#ffffff', color: '#232f3e', border: '1px solid #d5d9d9', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', minWidth: '120px' }}>
                    <option value="">Choose Align</option>
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </div>
                <div style={{ marginLeft: 'auto', fontSize: '13px', color: '#565959', background: selectedCells.length > 0 ? '#e7f3ff' : '#f7f8f8', padding: '8px 12px', borderRadius: '6px', border: '1px solid ' + (selectedCells.length > 0 ? '#007185' : '#e7e7e7'), fontWeight: '500' }}>
                  {selectedCells.length > 0 ? `${selectedCells.length} cell${selectedCells.length > 1 ? 's' : ''} selected` : 'Select cells to format'}
                </div>
              </div>
            </div>
          )}

          {/* File Data */}
          {fileData.length > 0 && (
            <div style={{ background: 'white', borderRadius: '8px', marginBottom: '20px', overflow: 'hidden' }}>
              <div style={{ padding: '15px', background: '#0078d4', color: 'white' }}>
                <h3 style={{ margin: 0, fontSize: '16px' }}>
                  {selectedFile?.name}{selectedSheet && ` - ${selectedSheet}`}
                </h3>
                <p style={{ margin: '5px 0 0 0', fontSize: '12px', opacity: 0.9 }}>
                  {fileData.length} rows × {fileData[0]?.length || 0} columns
                  {sheetNames.length > 1 && ` | Sheet ${sheetNames.indexOf(selectedSheet) + 1} of ${sheetNames.length}`}
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
                  Trial: {trialStatus.promptsRemaining || 25} prompts left today
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <input 
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onFocus={() => setShowPromptDropdown(true)}
                  onBlur={() => setTimeout(() => setShowPromptDropdown(false), 200)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (!isProcessing && selectedFile && prompt.trim()) {
                        handleProcessAI();
                      }
                    }
                  }}
                  placeholder="Try: SUMIF A > 100 B, sum column A, lookup data, sort by column B..."
                  style={{ 
                    width: '100%', 
                    padding: '12px', 
                    border: '1px solid #ddd', 
                    borderRadius: '6px',
                    color: '#333',
                    backgroundColor: '#ffffff',
                    boxSizing: 'border-box'
                  }}
                />
                {showPromptDropdown && promptHistory.length > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    background: 'white',
                    border: '1px solid #ddd',
                    borderTop: 'none',
                    borderRadius: '0 0 6px 6px',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    zIndex: 1000,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    {promptHistory.map((historyPrompt, index) => (
                      <div
                        key={index}
                        onClick={() => {
                          setPrompt(historyPrompt);
                          setShowPromptDropdown(false);
                        }}
                        style={{
                          padding: '8px 12px',
                          cursor: 'pointer',
                          borderBottom: index < promptHistory.length - 1 ? '1px solid #eee' : 'none',
                          fontSize: '14px',
                          color: '#333'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                      >
                        {historyPrompt}
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
                  cursor: 'pointer',
                  flexShrink: 0,
                  minWidth: 'auto'
                }}
              >
                {isProcessing ? <><img src="/refresh-new.gif" alt="Processing" style={{ width: '16px', height: '16px', marginRight: '8px' }} />Processing...</> : 'Submit'}
              </button>
            </div>
          </div>

          
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
              <div style={{ maxHeight: '400px', overflow: 'auto', padding: '20px', color: '#333' }}>
                <div dangerouslySetInnerHTML={{ __html: aiResponse.includes('<table') ? aiResponse.split('<br><br>').slice(1).join('<br><br>') : aiResponse.split('<br><br>').slice(1).join('<br><br>') || aiResponse }} />
              </div>
            </div>
          )}
        </main>
        
        {/* Footer with Legal Pages */}
        <footer style={{
          background: 'transparent',
          color: '#ffffff',
          padding: '20px',
          textAlign: 'center',
          borderTop: '1px solid rgba(255, 255, 255, 0.2)',
          position: 'relative',
          zIndex: 1000
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap', marginBottom: '12px' }}>
            <a onClick={() => {
              setLegalContent({ 
                title: 'About Us', 
                content: `About the Creator:

Yadunandan Katragadda is a full-stack developer and AI enthusiast passionate about creating intelligent solutions that simplify complex data analysis. With expertise in cloud technologies and machine learning, he built AdvExcel AI to democratize advanced data analytics for everyone.

As an AWS Solutions Architect and AI/ML Engineer, Yadunandan combines deep technical knowledge with a user-centric approach to deliver powerful yet accessible tools for data professionals and business users alike.

His vision is to make advanced data analytics as simple as having a conversation, enabling anyone to unlock insights from their data without requiring technical expertise.

About AdvExcel AI:

AdvExcel AI is an intelligent data analysis platform that transforms how you work with Excel and CSV files. Powered by Amazon Web Services and advanced AI, it brings enterprise-level analytics to your fingertips.

Our platform uses natural language processing to let you ask questions in plain English, get insights, create charts, and analyze patterns without complex formulas or technical expertise.

Built on AWS infrastructure for reliability, security, and scalability, AdvExcel AI processes your data securely and never permanently stores your sensitive information.

Key Features:
• AI-powered natural language processing for plain English queries
• Advanced pivot tables and statistical analysis
• Beautiful charts and data visualizations
• Predictive insights and trend analysis
• Data quality assessment and cleaning suggestions
• Multi-sheet Excel workbook support
• Secure cloud processing with AWS infrastructure

Our Mission:

To democratize advanced data analytics by making AI-powered insights accessible to everyone, regardless of technical background.

We believe that powerful data analysis shouldn't require years of training or expensive software. AdvExcel AI empowers businesses and individuals to make data-driven decisions effortlessly.

Technology Stack:
• Amazon Web Services (AWS) for cloud infrastructure
• AWS Bedrock for AI and machine learning capabilities
• React and TypeScript for the user interface
• AWS Cognito for secure user authentication
• Razorpay for secure payment processing

Contact Us:
Have questions or feedback? We'd love to hear from you! Contact us at contact@advexcel.online` 
              });
              setShowLegalModal(true);
            }} style={{ color: '#ffffff', textDecoration: 'none', fontSize: '14px', cursor: 'pointer' }}>About Us</a>
            <a onClick={() => window.location.href = '/payments'} style={{ color: '#ffffff', textDecoration: 'none', fontSize: '14px', cursor: 'pointer' }}>Pricing</a>
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
              width: '80px',
              height: '80px',
              background: 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              transition: 'all 0.3s ease',
              backgroundImage: 'url(/feedback.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
            onMouseEnter={(e) => {
              const target = e.target as HTMLElement;
              target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              const target = e.target as HTMLElement;
              target.style.transform = 'translateY(0)';
            }}
            title="Give Feedback"
          >
          </div>
          
          {showFeedbackBox && (
            <div style={{
              position: 'absolute',
              bottom: '70px',
              right: '0',
              width: '300px',
              background: 'white',
              borderRadius: '8px',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
              padding: '20px',
              border: '1px solid #ddd'
            }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#333', fontSize: '16px' }}>Send Feedback</h4>
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Share your thoughts about AdvExcel..."
                style={{
                  width: '100%',
                  height: '80px',
                  border: '1px solid #d5d9d9',
                  borderRadius: '6px',
                  padding: '8px',
                  fontSize: '14px',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  resize: 'none',
                  outline: 'none',
                  boxSizing: 'border-box'
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
                    background: '#0078d4',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '4px',
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
                    border: '1px solid #ddd',
                    padding: '8px 16px',
                    borderRadius: '4px',
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
        

      </div>
    </ErrorBoundary>
  );
}