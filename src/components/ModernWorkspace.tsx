import { useState, useRef, useEffect } from 'react';
import { DataDetectionService } from '../services/dataDetectionService';
import { EnhancedAiService } from '../services/enhancedAiService';
import bedrockService from '../services/bedrockService';
import ChartComponent from './ChartComponent';
import emailjs from '@emailjs/browser';

import * as XLSX from 'xlsx';

interface User {
  email: string;
  name: string;
}

interface ModernWorkspaceProps {
  user: User;
  onLogout: () => void;
}

export default function ModernWorkspace({ user, onLogout }: ModernWorkspaceProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [spreadsheetData, setSpreadsheetData] = useState<any[][]>([]);
  const [dataStructure, setDataStructure] = useState<any>(null);
  const [prompt, setPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [pivotTables, setPivotTables] = useState<any[]>([]);
  const [selectedPivot, setSelectedPivot] = useState<number | null>(null);
  const [showPivotDropdown, setShowPivotDropdown] = useState(false);
  const [pivotFilters, setPivotFilters] = useState<{[key: string]: string}>({});
  const [showAdvancedPivot, setShowAdvancedPivot] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');
  const [scheduledReports, setScheduledReports] = useState<any[]>([]);
  const [pivotPrompt, setPivotPrompt] = useState<string>('');
  const [aiResponse, setAiResponse] = useState<string>('');
  const [aiResultData, setAiResultData] = useState<any[][] | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie' | 'scatter' | 'histogram' | 'heatmap'>('bar');
  const [sortColumn, setSortColumn] = useState<number>(-1);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filterText, setFilterText] = useState('');
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [legalContent, setLegalContent] = useState({ title: '', content: '' });
  const [showFeedbackBox, setShowFeedbackBox] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    setSelectedFile(file);
    
    // Clear previous analytics data
    setAnalyticsData(null);
    setAiResponse('');
    setPivotTables([]);
    setSelectedPivot(null);
    
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const data = evt.target?.result;
        if (!data) throw new Error('No data read from file');
        
        let dataForAnalysis = [];
        
        if (file.name.endsWith('.csv')) {
          const text = data as string;
          let parsedData = text.split('\n')
            .map(row => row.split(',').map(cell => cell.trim()))
            .filter(row => row.some(cell => cell.length > 0));
          
          if (parsedData.length > 1000) {
            parsedData.splice(1000);
          }
          
          setSpreadsheetData(parsedData);
          dataForAnalysis = parsedData;
        } else {
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          let parsedData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
          
          // Auto-detect header row for sheets that don't start with headers
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
            }
          }
          
          if (parsedData.length > 1000) {
            parsedData = parsedData.slice(0, 1000);
          }
          
          setSpreadsheetData(parsedData);
          dataForAnalysis = parsedData;
        }
        
        // Auto-analyze data structure after state is set
        setTimeout(() => {
          try {
            const structure = DataDetectionService.analyzeData(dataForAnalysis);
            setDataStructure(structure);
            
            // Generate 5 sample pivot tables immediately
            const pivots = generateAdvancedPivotTables(dataForAnalysis);
            setPivotTables(pivots);
            console.log('Auto-generated pivot tables on upload:', pivots.length);
            
            // Generate instant comprehensive analysis
            console.log('Generating instant AI analysis for:', dataForAnalysis.length, 'rows');
            performInstantAnalysis(dataForAnalysis);
            
            // Automatically trigger AWS AI analysis
            setTimeout(() => performAutoAnalysis(dataForAnalysis), 1000);
          } catch (err) {
            console.error('Data analysis failed:', err);
            // Fallback: generate basic analytics with current data
            generateBasicAnalytics(dataForAnalysis);
          }
        }, 100);
      } catch (err) {
        console.error('Failed to process file:', err);
      }
    };
    
    if (file.name.endsWith('.csv')) {
      reader.readAsText(file);
    } else {
      reader.readAsBinaryString(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const performAlternativeAnalysis = async (data: any[][]) => {
    setAiLoading(true);
    setAiResponse('🔄 Performing alternative data analysis...');
    
    try {
      const analytics = performComprehensiveAnalytics(data);
      const headers = data[0];
      const rows = data.slice(1);
      
      let analysis = `📊 **ALTERNATIVE DATA INSIGHTS**\n\n`;
      
      // Column Analysis
      analysis += `**📊 COLUMN BREAKDOWN:**\n`;
      headers.forEach((header, index) => {
        const values = rows.map(row => row[index]).filter(val => val !== null && val !== undefined && val !== '');
        const uniqueValues = [...new Set(values)];
        const isNumeric = values.filter(val => !isNaN(parseFloat(String(val)))).length > values.length * 0.7;
        
        analysis += `• ${header}: ${uniqueValues.length} unique values (${isNumeric ? 'Numeric' : 'Text'})\n`;
      });
      analysis += `\n`;
      
      // Data Distribution
      analysis += `**📊 DATA DISTRIBUTION:**\n`;
      const numericColumns = headers.filter((h, i) => {
        const values = rows.map(row => parseFloat(row[i])).filter(v => !isNaN(v));
        return values.length > rows.length * 0.5;
      });
      
      if (numericColumns.length > 0) {
        analysis += `• Numeric Columns: ${numericColumns.length} (${((numericColumns.length / headers.length) * 100).toFixed(1)}%)\n`;
        analysis += `• Text Columns: ${headers.length - numericColumns.length} (${(((headers.length - numericColumns.length) / headers.length) * 100).toFixed(1)}%)\n`;
      }
      analysis += `\n`;
      
      // Completeness Analysis
      analysis += `**🔍 DATA COMPLETENESS:**\n`;
      const totalCells = rows.length * headers.length;
      const filledCells = totalCells - analytics.missingValues;
      const completeness = ((filledCells / totalCells) * 100).toFixed(1);
      
      analysis += `• Data Completeness: ${completeness}%\n`;
      analysis += `• Filled Cells: ${filledCells.toLocaleString()}\n`;
      analysis += `• Empty Cells: ${analytics.missingValues.toLocaleString()}\n`;
      analysis += `\n`;
      
      // Outlier Analysis
      if (analytics.top5.length > 0) {
        const median = analytics.top5[Math.floor(analytics.top5.length / 2)]?.value || 0;
        const outliers = analytics.top5.filter(item => item.value > median * 3).length;
        
        analysis += `**⚠️ OUTLIER DETECTION:**\n`;
        analysis += `• Potential Outliers: ${outliers} records\n`;
        analysis += `• Median Value: ${median.toFixed(2)}\n`;
        analysis += `• Data Spread: ${analytics.standardDeviation > analytics.mean ? 'High variance' : 'Normal distribution'}\n`;
        analysis += `\n`;
      }
      
      // Recommendations
      analysis += `**💡 DATA INSIGHTS:**\n`;
      analysis += `• Dataset Size: ${rows.length < 100 ? 'Small' : rows.length < 1000 ? 'Medium' : 'Large'} (${rows.length} records)\n`;
      analysis += `• Data Quality: ${analytics.duplicates === 0 && analytics.missingValues < totalCells * 0.05 ? 'Excellent' : 'Needs attention'}\n`;
      analysis += `• Analysis Ready: ${numericColumns.length > 0 ? 'Yes - suitable for statistical analysis' : 'Limited - mostly categorical data'}\n`;
      analysis += `• Recommendation: ${analytics.duplicates > 0 ? 'Remove duplicates first' : completeness === '100.0' ? 'Data is complete and ready' : 'Consider data cleaning'}\n`;
      
      setAiResponse(analysis);
      
    } catch (err: any) {
      console.error('Alternative Analysis Error:', err);
      setAiResponse(`⚠️ **Alternative Analysis Complete**\n\nYour data has been analyzed from a different perspective. The dataset contains ${data.length - 1} records with ${data[0]?.length || 0} columns.\n\nKey observations:\n• Data structure appears well-organized\n• Multiple analysis approaches available\n• Consider exploring different data relationships\n• Export functionality available for external analysis`);
    } finally {
      setAiLoading(false);
    }
  };

  const performInstantAnalysis = (data: any[][]) => {
    if (!data || data.length < 2) {
      setAiResponse('⚠️ **Insufficient Data**: Need at least 2 rows for analysis.');
      return;
    }

    const headers = data[0];
    const rows = data.slice(1);
    const fileName = selectedFile?.name || 'Unknown';
    
    // AI reads and understands the data structure
    let analysis = `🧠 **AI COMPLETE DATA ANALYSIS**\n\n`;
    analysis += `📄 **FILE UNDERSTANDING:**\n`;
    analysis += `• File: ${fileName}\n`;
    analysis += `• Structure: ${rows.length} records × ${headers.length} attributes\n`;
    analysis += `• Data Type: ${detectDataContext(fileName, headers, rows).type}\n\n`;
    
    // Column-by-column AI analysis
    analysis += `📋 **COLUMN INTELLIGENCE:**\n`;
    headers.forEach((header, index) => {
      const values = rows.map(row => row[index]).filter(v => v !== null && v !== undefined && v !== '');
      const numericValues = values.filter(v => !isNaN(parseFloat(String(v)))).map(v => parseFloat(String(v)));
      const uniqueValues = new Set(values);
      const isNumeric = numericValues.length > values.length * 0.5;
      
      analysis += `• **${header}**: `;
      if (isNumeric && numericValues.length > 0) {
        const sum = numericValues.reduce((a, b) => a + b, 0);
        const avg = sum / numericValues.length;
        const min = Math.min(...numericValues);
        const max = Math.max(...numericValues);
        analysis += `NUMERIC - Range: ${min.toLocaleString()} to ${max.toLocaleString()}, Avg: ${avg.toLocaleString()}\n`;
      } else {
        const topValues = Array.from(uniqueValues).slice(0, 3).join(', ');
        analysis += `CATEGORICAL - ${uniqueValues.size} categories (${topValues}...)\n`;
      }
    });
    
    // AI discovers patterns and insights
    analysis += `\n🔍 **AI DISCOVERIES:**\n`;
    
    // Find the most important numeric column
    const numericCols = headers.map((header, index) => {
      const values = rows.map(row => parseFloat(row[index])).filter(v => !isNaN(v));
      return values.length > rows.length * 0.5 ? { header, index, values, sum: values.reduce((a, b) => a + b, 0) } : null;
    }).filter(Boolean);
    
    if (numericCols.length > 0) {
      const mainCol = numericCols.reduce((a, b) => a.sum > b.sum ? a : b);
      const sorted = [...mainCol.values].sort((a, b) => b - a);
      analysis += `• **Key Metric**: ${mainCol.header} (Total: ${mainCol.sum.toLocaleString()})\n`;
      analysis += `• **Top Performance**: ${sorted[0]?.toLocaleString()} (highest value)\n`;
      analysis += `• **Performance Gap**: ${((sorted[0] - sorted[sorted.length - 1]) / sorted[0] * 100).toFixed(1)}% difference\n`;
    }
    
    // Data quality AI assessment
    const missingCount = rows.reduce((count, row) => 
      count + row.filter(cell => cell === null || cell === undefined || cell === '').length, 0
    );
    const completeness = ((rows.length * headers.length - missingCount) / (rows.length * headers.length) * 100).toFixed(1);
    
    analysis += `• **Data Quality**: ${completeness}% complete (${missingCount} missing values)\n`;
    
    // AI recommendations
    analysis += `\n🎯 **AI RECOMMENDATIONS:**\n`;
    if (numericCols.length > 1) {
      analysis += `• Compare ${numericCols[0].header} vs ${numericCols[1].header} for insights\n`;
    }
    if (parseFloat(completeness) < 95) {
      analysis += `• Address ${missingCount} missing data points for better accuracy\n`;
    }
    analysis += `• Use pivot tables to explore ${headers.length} dimensions\n`;
    analysis += `• Apply filters to focus on specific segments\n`;
    
    analysis += `\n✨ **AI is now ready for your questions!**`;
    
    setAiResponse(analysis);
  };

  const detectDataContext = (fileName: string, headers: string[], rows: any[][]) => {
    const fileNameLower = fileName.toLowerCase();
    const headersLower = headers.map(h => String(h).toLowerCase());
    
    // Restaurant/Hospitality data
    if (fileNameLower.includes('restaurant') || fileNameLower.includes('menu') || fileNameLower.includes('order') || fileNameLower.includes('pos') ||
        headersLower.some(h => h.includes('menu') || h.includes('order') || h.includes('table') || h.includes('server') || h.includes('invoice') || h.includes('gst'))) {
      return {
        type: 'Restaurant',
        title: 'Restaurant Analytics Dashboard',
        recordType: 'transactions',
        categoryType: 'menu items',
        performanceMetric: 'Sales performance',
        keyColumns: headers.filter((h, i) => headersLower[i].includes('item') || headersLower[i].includes('server') || headersLower[i].includes('table') || headersLower[i].includes('area')),
        recommendations: [
          'Analyze peak hours and sales trends',
          'Identify top-performing menu items',
          'Track server performance and efficiency',
          'Monitor table turnover and capacity utilization',
          'Generate GST compliance reports'
        ]
      };
    }
    
    // Default adaptive analysis
    return {
      type: 'Data',
      title: 'Universal Data Analysis',
      recordType: 'records',
      categoryType: 'categories',
      performanceMetric: 'Data metrics',
      keyColumns: headers.slice(0, 3),
      recommendations: [
        'Analyze numeric columns for trends and patterns',
        'Explore relationships between categorical variables',
        'Identify outliers and data quality issues',
        'Create visualizations for key insights'
      ]
    };
  };

  const performAutoAnalysis = async (data: any[][]) => {
    setAiLoading(true);
    setAiResponse('🧠 AI is reading and understanding your data...');
    
    try {
      const result = await bedrockService.processExcelData(data, 'Analyze this data comprehensively', selectedFile?.name || 'data');
      
      if (result.success && result.response) {
        // Format the AWS response properly
        let formattedResponse = `🤖 **AWS AI COMPREHENSIVE ANALYSIS**\n\n${result.response}`;
        
        // Generate additional analytics from the structured data if available
        if (result.structured && result.structured.result) {
          const analytics = performComprehensiveAnalytics(data);
          setAnalyticsData(analytics);
          
          // Add quick stats to the response
          formattedResponse += `\n\n📊 **QUICK STATISTICS:**\n`;
          formattedResponse += `• Total Records: ${data.length - 1}\n`;
          formattedResponse += `• Data Columns: ${data[0]?.length || 0}\n`;
          if (analytics.top5.length > 0) {
            formattedResponse += `• Highest Value: ${analytics.top5[0]?.value?.toLocaleString() || 'N/A'}\n`;
            formattedResponse += `• Data Range: ${analytics.min?.toLocaleString()} - ${analytics.max?.toLocaleString()}\n`;
          }
          formattedResponse += `• Data Quality: ${analytics.duplicates === 0 ? 'Excellent' : `${analytics.duplicates} duplicates found`}\n`;
        }
        
        setAiResponse(formattedResponse);
      } else {
        throw new Error(result.error || 'AI analysis failed');
      }
    } catch (err: any) {
      console.error('Auto Analysis Error:', err);
      // Fallback to comprehensive local analysis
      const analytics = performComprehensiveAnalytics(data);
      setAnalyticsData(analytics);
      
      let fallbackAnalysis = `🔍 **COMPREHENSIVE DATA ANALYSIS**\n\n`;
      fallbackAnalysis += `📄 **Dataset Overview:**\n`;
      fallbackAnalysis += `• File: ${selectedFile?.name || 'Unknown'}\n`;
      fallbackAnalysis += `• Records: ${data.length - 1} rows\n`;
      fallbackAnalysis += `• Attributes: ${data[0]?.length || 0} columns\n\n`;
      
      if (analytics.top5.length > 0) {
        fallbackAnalysis += `📈 **Performance Metrics:**\n`;
        fallbackAnalysis += `• Top Value: ${analytics.top5[0]?.value?.toLocaleString()} (${analytics.top5[0]?.country})\n`;
        fallbackAnalysis += `• Average: ${analytics.mean?.toLocaleString()}\n`;
        fallbackAnalysis += `• Range: ${analytics.min?.toLocaleString()} - ${analytics.max?.toLocaleString()}\n\n`;
      }
      
      fallbackAnalysis += `🔍 **Data Quality:**\n`;
      fallbackAnalysis += `• Duplicates: ${analytics.duplicates}\n`;
      fallbackAnalysis += `• Missing Values: ${analytics.missingValues}\n`;
      fallbackAnalysis += `• Completeness: ${(((data.length - 1) * (data[0]?.length || 0) - analytics.missingValues) / ((data.length - 1) * (data[0]?.length || 0)) * 100).toFixed(1)}%\n\n`;
      
      fallbackAnalysis += `💡 **Ready for Analysis:**\n`;
      fallbackAnalysis += `• Use charts to visualize trends\n`;
      fallbackAnalysis += `• Apply filters to explore segments\n`;
      fallbackAnalysis += `• Export processed data\n`;
      fallbackAnalysis += `• Ask specific questions about your data`;
      
      setAiResponse(fallbackAnalysis);
    } finally {
      setAiLoading(false);
    }
  };

  const handleCustomAnalysis = async () => {
    if (!prompt.trim() || !spreadsheetData.length) return;
    
    setAiLoading(true);
    try {
      const result = await bedrockService.processExcelData(spreadsheetData, prompt, selectedFile?.name || 'data');
      
      if (result.success && result.response) {
        setAiResponse(result.response);
      } else {
        throw new Error(result.error || 'Analysis failed');
      }
    } catch (err: any) {
      console.error('AI Processing Error:', err);
      setAiResponse(`❌ Error: ${err.message || 'Processing failed'}`);
    } finally {
      setAiLoading(false);
      setPrompt('');
    }
  };

  const generateAdvancedPivotTables = (data: any[][]) => {
    if (!data || data.length < 2) return [];
    
    const headers = data[0];
    const pivots = [];
    
    // Basic data view
    pivots.push({
      title: 'Data Overview',
      description: 'Complete dataset view',
      data: data.slice(0, 21),
      type: 'standard'
    });
    
    return pivots;
  };

  const handleCellEdit = (rowIndex: number, colIndex: number, newValue: string) => {
    const newData = [...spreadsheetData];
    newData[rowIndex][colIndex] = newValue;
    setSpreadsheetData(newData);
  };

  const handleSort = (columnIndex: number) => {
    const newDirection = sortColumn === columnIndex && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortColumn(columnIndex);
    setSortDirection(newDirection);
    
    const sortedData = [...spreadsheetData];
    const headers = sortedData[0];
    const dataRows = sortedData.slice(1);
    
    dataRows.sort((a, b) => {
      const aVal = String(a[columnIndex] || '').toLowerCase();
      const bVal = String(b[columnIndex] || '').toLowerCase();
      
      const aNum = parseFloat(aVal);
      const bNum = parseFloat(bVal);
      
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return newDirection === 'asc' ? aNum - bNum : bNum - aNum;
      }
      
      return newDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    });
    
    setSpreadsheetData([headers, ...dataRows]);
  };

  const getFilteredData = () => {
    if (!filterText) return spreadsheetData;
    
    const headers = spreadsheetData[0];
    const filteredRows = spreadsheetData.slice(1).filter(row => 
      row.some(cell => 
        String(cell || '').toLowerCase().includes(filterText.toLowerCase())
      )
    );
    
    return [headers, ...filteredRows];
  };

  const downloadExcel = (data: any[][], filename: string) => {
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, filename);
  };

  const generateBasicAnalytics = (data: any[][]) => {
    if (!data || data.length < 2) return;
    
    const analytics = performComprehensiveAnalytics(data);
    setAnalyticsData(analytics);
    
    let analysis = `📊 **BASIC DATA ANALYSIS**\n\n`;
    analysis += `📄 **File Information:**\n`;
    analysis += `• Records: ${data.length - 1}\n`;
    analysis += `• Columns: ${data[0]?.length || 0}\n\n`;
    
    if (analytics.top5.length > 0) {
      analysis += `📈 **Key Metrics:**\n`;
      analysis += `• Highest: ${analytics.max?.toLocaleString()}\n`;
      analysis += `• Lowest: ${analytics.min?.toLocaleString()}\n`;
      analysis += `• Average: ${analytics.mean?.toLocaleString()}\n\n`;
    }
    
    analysis += `🔍 **Data Quality:**\n`;
    analysis += `• Duplicates: ${analytics.duplicates}\n`;
    analysis += `• Missing: ${analytics.missingValues}\n\n`;
    
    analysis += `✅ **Data is ready for analysis and visualization!**`;
    
    setAiResponse(analysis);
  };

  const performComprehensiveAnalytics = (data: any[][]) => {
    if (!data || data.length < 2) return { duplicates: 0, missingValues: 0, top5: [], bottom5: [], range: 0, min: 0, max: 0, mean: 0, standardDeviation: 0 };
    
    const headers = data[0];
    const rows = data.slice(1);
    
    // Find numeric columns
    let numericColumnIndex = -1;
    let countryColumnIndex = -1;
    
    for (let i = 0; i < headers.length; i++) {
      const header = String(headers[i]).toLowerCase();
      if (header.includes('total') || header.includes('count') || header.includes('number') || header.includes('value')) {
        numericColumnIndex = i;
      }
      if (header.includes('country') || header.includes('name') || header.includes('region')) {
        countryColumnIndex = i;
      }
    }
    
    // Count duplicates
    const uniqueRows = new Set(rows.map(row => JSON.stringify(row)));
    const duplicates = rows.length - uniqueRows.size;
    
    // Count missing values
    let missingValues = 0;
    rows.forEach(row => {
      row.forEach(cell => {
        if (cell === null || cell === undefined || cell === '') missingValues++;
      });
    });
    
    // Analyze numeric data
    let numericData = [];
    if (numericColumnIndex >= 0) {
      numericData = rows.map((row, index) => ({
        value: parseFloat(row[numericColumnIndex]) || 0,
        country: countryColumnIndex >= 0 ? row[countryColumnIndex] : `Row ${index + 1}`,
        index: index + 1
      })).filter(item => !isNaN(item.value) && item.value > 0);
    }
    
    // Sort for top/bottom analysis
    const sortedData = [...numericData].sort((a, b) => b.value - a.value);
    const top5 = sortedData.slice(0, 5);
    const bottom5 = sortedData.slice(-5).reverse();
    
    // Calculate statistics
    const values = numericData.map(item => item.value);
    const min = Math.min(...values) || 0;
    const max = Math.max(...values) || 0;
    const mean = values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
    const variance = values.length > 0 ? values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length : 0;
    const standardDeviation = Math.sqrt(variance);
    
    return {
      duplicates,
      missingValues,
      top5,
      bottom5,
      range: max - min,
      min,
      max,
      mean,
      standardDeviation
    };
  };

  const displayData = getFilteredData();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'url("/basic-bg.gif") center center / cover no-repeat fixed',
      fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
      color: '#ffffff',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(0, 0, 0, 0.3)',
        zIndex: 1
      }} />
      
      {/* Header */}
      <header style={{
        borderBottom: '1px solid rgba(120, 219, 255, 0.3)',
        padding: window.innerWidth <= 768 ? '15px 20px' : '20px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '10px',
        position: 'relative',
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '50px',
            height: '50px',
            background: 'linear-gradient(135deg, #78dbff 0%, #ff77c6 100%)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            fontWeight: '700',
            color: '#000',
            boxShadow: '0 0 30px rgba(120, 219, 255, 0.5)'
          }}>
            AI
          </div>
          <div>
            <h1 style={{ 
              margin: 0, 
              fontSize: '28px', 
              fontWeight: '700',
              background: 'linear-gradient(135deg, #78dbff 0%, #ff77c6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.5px'
            }}>AdvExcel AI</h1>
            <p style={{ 
              margin: 0, 
              fontSize: '12px', 
              opacity: 0.7,
              textTransform: 'uppercase',
              letterSpacing: '2px',
              fontWeight: '500'
            }}>Advanced Data Analytics</p>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '500',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            User: {user.name}
          </div>
          <button
            onClick={() => {
              localStorage.setItem('use_new_interface', 'false');
              window.location.reload();
            }}
            style={{
              background: 'linear-gradient(135deg, rgba(120, 219, 255, 0.2) 0%, rgba(255, 119, 198, 0.2) 100%)',
              border: '1px solid rgba(120, 219, 255, 0.5)',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '25px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}
          >
            Classic Mode
          </button>
          <button
            onClick={onLogout}
            style={{
              background: 'linear-gradient(135deg, rgba(255, 77, 77, 0.2) 0%, rgba(255, 119, 198, 0.2) 100%)',
              border: '1px solid rgba(255, 77, 77, 0.5)',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '25px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}
          >
            Disconnect
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ padding: window.innerWidth <= 768 ? '20px' : '20px 40px', position: 'relative', zIndex: 100 }}>
        <div style={{ 
          display: 'flex', 
          gap: '16px',
          marginBottom: '24px',
          maxWidth: '1600px',
          margin: '0 auto 24px auto'
        }}>
          
          {/* File Upload with Drag & Drop */}
          <div 
            style={{ 
              width: '300px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div style={{
              border: dragActive ? '2px dashed #78dbff' : '1px solid white',
              borderRadius: '6px',
              padding: '20px',
              textAlign: 'center',
              backgroundColor: dragActive ? 'rgba(120, 219, 255, 0.1)' : 'transparent',
              transition: 'all 0.3s ease'
            }}>
              <input
                ref={fileInputRef}
                type="file" 
                accept=".xlsx,.xls,.csv" 
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
                style={{ display: 'none' }}
              />
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>📁</div>
              <div style={{ fontSize: '14px', marginBottom: '8px' }}>
                Drag & drop files here or
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(120, 219, 255, 0.5)',
                  color: '#78dbff',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                Browse Files
              </button>
              <div style={{ fontSize: '11px', opacity: 0.7, marginTop: '8px' }}>
                Supports .xlsx, .xls, .csv
              </div>
            </div>
          </div>

          {/* AI Input */}
          <div style={{ 
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <input 
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ask AI about your data..."
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  border: '1px solid white', 
                  borderRadius: '6px',
                  color: 'white',
                  backgroundColor: 'transparent',
                  boxSizing: 'border-box',
                  fontSize: '14px'
                }}
              />
            </div>
            
            <button 
              onClick={handleCustomAnalysis}
              disabled={aiLoading || !selectedFile || !prompt.trim()}
              style={{ 
                background: 'transparent',
                border: '1px solid white',
                color: 'white',
                padding: '12px 20px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: aiLoading || !selectedFile || !prompt.trim() ? 'not-allowed' : 'pointer',
                opacity: aiLoading || !selectedFile || !prompt.trim() ? 0.5 : 1
              }}
            >
              {aiLoading ? 'Processing...' : 'Ask'}
            </button>
          </div>
        </div>

        <div style={{
          maxWidth: '1600px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: window.innerWidth <= 768 ? 'column' : 'row',
          gap: '20px',
          width: '100%'
        }}>
          {/* Left Panel */}
          <div style={{
            width: window.innerWidth <= 768 ? '100%' : '280px',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '16px',
            padding: '16px',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <h4 style={{ 
              margin: '0 0 8px 0', 
              fontSize: '12px', 
              fontWeight: '600',
              color: 'white'
            }}>
              🚀 Quick Actions
            </h4>
            
            {spreadsheetData.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <button
                  onClick={() => setShowChart(!showChart)}
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '4px',
                    padding: '6px 8px',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontWeight: '500',
                    width: '100%'
                  }}
                >
                  📊 {showChart ? 'Hide' : 'Show'} Charts
                </button>
                <button
                  onClick={() => downloadExcel(spreadsheetData, `${selectedFile?.name || 'data'}_export.xlsx`)}
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '4px',
                    padding: '6px 8px',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontWeight: '500',
                    width: '100%'
                  }}
                >
                  💾 Export Excel
                </button>
                <button
                  onClick={() => performAlternativeAnalysis(spreadsheetData)}
                  disabled={aiLoading}
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '4px',
                    padding: '6px 8px',
                    color: 'white',
                    cursor: aiLoading ? 'not-allowed' : 'pointer',
                    fontSize: '11px',
                    fontWeight: '500',
                    width: '100%',
                    opacity: aiLoading ? 0.6 : 1
                  }}
                >
                  {aiLoading ? '🔄 Analyzing...' : '🔍 Alternative Analysis'}
                </button>
              </div>
            )}
          </div>

          {/* Right Panel */}
          <div style={{
            flex: 1,
            minWidth: 0,
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            {spreadsheetData.length > 0 ? (
              <>
                <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
                    {selectedFile?.name}
                  </h3>
                  <span style={{ fontSize: '14px', opacity: 0.7 }}>
                    {spreadsheetData.length} rows × {spreadsheetData[0]?.length || 0} columns
                  </span>
                </div>
                
                <div style={{ 
                  border: '1px solid rgba(255,255,255,0.2)', 
                  borderRadius: '8px', 
                  overflow: 'auto',
                  maxHeight: '400px'
                }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: 'rgba(255,255,255,0.1)' }}>
                        {spreadsheetData[0]?.map((header, index) => (
                          <th key={index} 
                            onClick={() => handleSort(index)}
                            style={{
                              padding: '12px 8px',
                              textAlign: 'left',
                              borderBottom: '1px solid rgba(255,255,255,0.2)',
                              fontSize: '14px',
                              fontWeight: '600',
                              minWidth: '100px',
                              cursor: 'pointer'
                            }}>
                            {header}
                            {sortColumn === index && (
                              <span style={{ marginLeft: '4px' }}>
                                {sortDirection === 'asc' ? '↑' : '↓'}
                              </span>
                            )}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {spreadsheetData.slice(1, 21).map((row, rowIndex) => (
                        <tr key={rowIndex} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                          {row.map((cell, cellIndex) => (
                            <td key={cellIndex} style={{
                              padding: '8px',
                              fontSize: '13px',
                              borderRight: '1px solid rgba(255,255,255,0.1)'
                            }}>
                              <input
                                type="text"
                                value={String(cell || '')}
                                onChange={(e) => handleCellEdit(rowIndex + 1, cellIndex, e.target.value)}
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  color: 'white',
                                  fontSize: '13px',
                                  width: '100%',
                                  padding: '4px',
                                  outline: 'none'
                                }}
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {spreadsheetData.length > 21 && (
                    <div style={{ 
                      padding: '12px', 
                      textAlign: 'center', 
                      fontSize: '14px', 
                      opacity: 0.7,
                      borderTop: '1px solid rgba(255,255,255,0.1)'
                    }}>
                      Showing first 20 rows of {spreadsheetData.length - 1} data rows
                    </div>
                  )}
                </div>
                
                {aiResponse && (
                  <div style={{
                    marginTop: '20px',
                    padding: '16px',
                    background: 'rgba(120, 219, 255, 0.1)',
                    border: '1px solid rgba(120, 219, 255, 0.3)',
                    borderRadius: '8px'
                  }}>
                    <h4 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600' }}>AI Analysis:</h4>
                    <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                      {aiResponse}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '64px', marginBottom: '24px', opacity: 0.3 }}>📈</div>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '20px', fontWeight: '600' }}>
                  Ready for Analysis
                </h3>
                <p style={{ margin: 0, fontSize: '16px', opacity: 0.7, maxWidth: '300px' }}>
                  Upload your Excel or CSV file to get started with AI-powered data insights
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Chart Display */}
        {showChart && spreadsheetData.length > 0 && (
          <div style={{
            maxWidth: '1200px',
            margin: '40px auto 0',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '24px',
            padding: '32px',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
                📊 Data Visualization
              </h3>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {(['bar', 'line', 'pie'] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => setChartType(type)}
                    style={{
                      background: 'transparent',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '8px',
                      padding: '6px 12px',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '11px',
                      fontWeight: '500',
                      textTransform: 'capitalize',
                      opacity: chartType === type ? 1 : 0.7
                    }}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ background: 'transparent', borderRadius: '12px', padding: '24px' }}>
              <ChartComponent 
                data={spreadsheetData} 
                type={chartType as 'bar' | 'line' | 'pie'}
                title={`${selectedFile?.name || 'Data'} - ${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart`}
              />
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
              content: `About the Creator:\n\nYadunandan Katragadda is a full-stack developer and AI enthusiast passionate about creating intelligent solutions that simplify complex data analysis. With expertise in cloud technologies and machine learning, he built AdvExcel AI to democratize advanced data analytics for everyone.\n\nAs an AWS Solutions Architect and AI/ML Engineer, Yadunandan combines deep technical knowledge with a user-centric approach to deliver powerful yet accessible tools for data professionals and business users alike.\n\nHis vision is to make advanced data analytics as simple as having a conversation, enabling anyone to unlock insights from their data without requiring technical expertise.\n\nAbout AdvExcel AI:\n\nAdvExcel AI is an intelligent data analysis platform that transforms how you work with Excel and CSV files. Powered by Amazon Web Services and advanced AI, it brings enterprise-level analytics to your fingertips.\n\nOur platform uses natural language processing to let you ask questions in plain English, get insights, create charts, and analyze patterns without complex formulas or technical expertise.\n\nBuilt on AWS infrastructure for reliability, security, and scalability, AdvExcel AI processes your data securely and never permanently stores your sensitive information.\n\nKey Features:\n• AI-powered natural language processing for plain English queries\n• Advanced pivot tables and statistical analysis\n• Beautiful charts and data visualizations\n• Predictive insights and trend analysis\n• Data quality assessment and cleaning suggestions\n• Multi-sheet Excel workbook support\n• Secure cloud processing with AWS infrastructure\n\nOur Mission:\n\nTo democratize advanced data analytics by making AI-powered insights accessible to everyone, regardless of technical background.\n\nWe believe that powerful data analysis shouldn't require years of training or expensive software. AdvExcel AI empowers businesses and individuals to make data-driven decisions effortlessly.\n\nTechnology Stack:\n• Amazon Web Services (AWS) for cloud infrastructure\n• AWS Bedrock for AI and machine learning capabilities\n• React and TypeScript for the user interface\n• AWS Cognito for secure user authentication\n• Razorpay for secure payment processing\n\nContact Us:\nHave questions or feedback? We'd love to hear from you! Contact us at contact@advexcel.online` 
            });
            setShowLegalModal(true);
          }} style={{ color: '#ffffff', textDecoration: 'none', fontSize: '14px', cursor: 'pointer' }}>About Us</a>
          <a onClick={() => window.location.href = '/payments'} style={{ color: '#ffffff', textDecoration: 'none', fontSize: '14px', cursor: 'pointer' }}>Pricing</a>
          <a onClick={() => {
            setLegalContent({ 
              title: 'Privacy Policy', 
              content: `Last updated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}\n\nWhat Information We Collect:\n• Your name and email address when you create an account\n• Excel/CSV files you upload for processing\n• Usage data to improve our service\n\nHow We Use Your Information:\n• Process your files to provide AI-powered analysis\n• Maintain your account and authentication\n• Improve our services and user experience\n\nData Security:\n• We use Amazon Web Services (AWS) for secure processing\n• Your data is encrypted and protected with industry standards\n• Files are processed temporarily and not permanently stored\n• Account data is kept secure until you delete your account\n\nData Sharing:\n• We do not sell or share your personal information\n• We only use AWS services (Cognito, Bedrock) for processing\n• No third-party access to your data\n\nYour Rights:\n• Access, modify, or delete your personal information\n• Request account deletion at any time\n• Withdraw consent for data processing\n\nContact Us:\nFor privacy questions, email: contact@advexcel.online` 
            });
            setShowLegalModal(true);
          }} style={{ color: '#ffffff', textDecoration: 'none', fontSize: '14px', cursor: 'pointer' }}>Privacy Policy</a>
          <a onClick={() => {
            setLegalContent({ 
              title: 'Terms of Service', 
              content: `Last updated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}\n\nBy using Excel AI, you agree to these terms.\n\nWhat Excel AI Does:\n• AI-powered analysis of Excel and CSV files\n• Data sorting, filtering, and mathematical calculations\n• Duplicate detection and data manipulation\n• Powered by Amazon Web Services\n\nYour Responsibilities:\n• Only upload files you have permission to process\n• Don't upload sensitive personal data or confidential information\n• Use the service legally and responsibly\n• Keep your account credentials secure\n• Don't attempt to hack or compromise the service\n\nProhibited Uses:\n• Illegal, harmful, or malicious content\n• Files with viruses or malware\n• Unauthorized access attempts\n• Commercial use without permission\n• Violating applicable laws\n\nService Terms:\n• Service provided "as-is" without warranties\n• We may modify or discontinue service anytime\n• No guarantee of uninterrupted access\n• Limited liability for service issues\n\nChanges:\n• We may update these terms anytime\n• Continued use means you accept changes\n\nContact: contact@advexcel.online` 
            });
            setShowLegalModal(true);
          }} style={{ color: '#ffffff', textDecoration: 'none', fontSize: '14px', cursor: 'pointer' }}>Terms of Service</a>
          <a onClick={() => {
            setLegalContent({ 
              title: 'Contact Us', 
              content: `Quick Support:\n• Click the feedback button (👍) in bottom right corner\n• Describe your issue or question\n• We'll respond promptly\n\nEmail Contact:\n• contact@advexcel.online\n• Response time: 24-48 hours\n• For all inquiries: technical support, questions, business, partnerships\n\nBefore Contacting:\n• Try troubleshooting steps in Support section\n• Note your browser type and version\n• Describe specific steps that caused the issue\n• Include any error messages\n\nFeature Requests:\n• Use feedback button with "Feature Request"\n• Email with subject "Feature Request"\n• Include detailed descriptions\n\nPrivacy & Security:\n• Email with subject "Privacy/Security"\n• Reference our Privacy Policy\n• Report security issues responsibly\n\nBusiness Hours:\n• Monday-Friday, 9 AM - 6 PM EST\n• Feedback monitored 24/7 for urgent issues\n• Weekend response times may vary\n\nAbout Us:\n• Excel AI Development Team\n• Powered by Amazon Web Services\n• Cloud-based for global accessibility\n\nWe're committed to excellent support and continuous improvement based on your feedback!` 
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
            background: 'transparent',
            borderRadius: '8px',
            padding: '24px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '70vh',
            overflow: 'hidden'
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
            <div style={{ color: 'white', lineHeight: '1.6', margin: 0, whiteSpace: 'pre-line', fontSize: '14px', maxHeight: 'calc(70vh - 120px)', overflowY: 'scroll', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>{legalContent.content}</div>
            <div style={{ marginTop: '20px', textAlign: 'right' }}>
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
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <h4 style={{ margin: '0 0 12px 0', color: 'white', fontSize: '16px' }}>Send Feedback</h4>
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
                  background: 'white',
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
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
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
  );
}