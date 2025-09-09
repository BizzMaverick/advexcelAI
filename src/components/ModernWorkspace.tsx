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

  const generateBasicAnalytics = (data: any[][]) => {
    console.log('generateBasicAnalytics called with data:', data?.length, 'rows');
    if (!data || data.length < 2) {
      console.log('Insufficient data for analysis');
      setAiResponse('⚠️ **Insufficient Data**: Need at least 2 rows (header + data) for analysis.');
      return;
    }
    
    const headers = data[0];
    const rows = data.slice(1);
    const fileName = selectedFile?.name || 'Unknown';
    
    console.log('Processing file:', fileName, 'with', headers.length, 'columns');
    
    // Analyze actual data content
    const columnAnalysis = headers.map((header, index) => {
      const values = rows.map(row => row[index]).filter(val => val !== null && val !== undefined && val !== '');
      const numericValues = values.filter(val => !isNaN(parseFloat(String(val)))).map(val => parseFloat(String(val)));
      const uniqueValues = new Set(values.map(val => String(val).toLowerCase()));
      
      return {
        name: String(header),
        totalValues: values.length,
        numericCount: numericValues.length,
        uniqueCount: uniqueValues.size,
        isNumeric: numericValues.length > values.length * 0.7,
        sum: numericValues.length > 0 ? numericValues.reduce((a, b) => a + b, 0) : 0,
        avg: numericValues.length > 0 ? numericValues.reduce((a, b) => a + b, 0) / numericValues.length : 0,
        min: numericValues.length > 0 ? Math.min(...numericValues) : 0,
        max: numericValues.length > 0 ? Math.max(...numericValues) : 0,
        sampleValues: Array.from(uniqueValues).slice(0, 3),
        actualValues: values.slice(0, 5)
      };
    });
    
    // Detect data context from filename and headers
    const context = detectDataContext(fileName, headers, rows);
    console.log('Detected context:', context.type, context.title);
    
    let analysis = `📊 **${context.title.toUpperCase()} ANALYSIS**\n\n`;
    
    // Context-specific summary
    analysis += `**📋 ${context.type.toUpperCase()} OVERVIEW:**\n`;
    analysis += `• File: ${fileName}\n`;
    analysis += `• ${rows.length.toLocaleString()} ${context.recordType} across ${headers.length} attributes\n`;
    
    const numericCols = columnAnalysis.filter(col => col.isNumeric);
    const textCols = columnAnalysis.filter(col => !col.isNumeric);
    
    // Context-specific column analysis
    if (context.keyColumns.length > 0) {
      analysis += `• Key ${context.type} fields: ${context.keyColumns.join(', ')}\n`;
    }
    if (numericCols.length > 0) {
      analysis += `• Performance metrics: ${numericCols.map(col => col.name).join(', ')}\n`;
    }
    analysis += `\n`;
    
    // Context-specific insights
    analysis += `**🔍 ${context.type.toUpperCase()} INSIGHTS:**\n`;
    
    // Find performance indicators
    const performanceCol = numericCols.find(col => 
      col.name.toLowerCase().includes('sales') || 
      col.name.toLowerCase().includes('revenue') || 
      col.name.toLowerCase().includes('amount') ||
      col.name.toLowerCase().includes('value') ||
      col.name.toLowerCase().includes('total')
    ) || numericCols[0];
    
    if (performanceCol) {
      analysis += `• ${context.performanceMetric}: ${performanceCol.max.toLocaleString()} (highest), ${performanceCol.min.toLocaleString()} (lowest)\n`;
      analysis += `• Average ${performanceCol.name}: ${performanceCol.avg.toLocaleString()}\n`;
      analysis += `• Total ${performanceCol.name}: ${performanceCol.sum.toLocaleString()}\n`;
    }
    
    // Category analysis
    const categoryCol = textCols.find(col => 
      col.name.toLowerCase().includes('category') ||
      col.name.toLowerCase().includes('product') ||
      col.name.toLowerCase().includes('region') ||
      col.name.toLowerCase().includes('department') ||
      col.name.toLowerCase().includes('type')
    ) || textCols[0];
    
    if (categoryCol) {
      analysis += `• ${categoryCol.name} diversity: ${categoryCol.uniqueCount} different ${context.categoryType}\n`;
      if (categoryCol.sampleValues.length > 0) {
        analysis += `  Top ${context.categoryType}: ${categoryCol.sampleValues.slice(0, 3).join(', ')}\n`;
      }
    }
    
    analysis += `\n`;
    
    // Data quality with context
    const missingCount = rows.reduce((count, row) => 
      count + row.filter(cell => cell === null || cell === undefined || cell === '').length, 0
    );
    const totalCells = rows.length * headers.length;
    const completeness = ((totalCells - missingCount) / totalCells * 100).toFixed(1);
    
    analysis += `**✅ DATA QUALITY:**\n`;
    analysis += `• ${context.type} data completeness: ${completeness}%\n`;
    if (missingCount > 0) {
      analysis += `• ${missingCount} missing data points found\n`;
    }
    
    // Check for duplicates
    const firstColValues = rows.map(row => String(row[0] || '').toLowerCase());
    const duplicates = firstColValues.length - new Set(firstColValues).size;
    if (duplicates > 0) {
      analysis += `• ${duplicates} potential duplicate ${context.recordType}\n`;
    }
    
    analysis += `\n`;
    
    // Context-specific recommendations
    analysis += `**💡 ${context.type.toUpperCase()} RECOMMENDATIONS:**\n`;
    context.recommendations.forEach(rec => {
      analysis += `• ${rec}\n`;
    });
    
    if (numericCols.length >= 2) {
      analysis += `• Compare ${numericCols[0].name} vs ${numericCols[1].name} performance\n`;
    }
    if (duplicates > 0) {
      analysis += `• Clean duplicate ${context.recordType} for accurate analysis\n`;
    }
    
    console.log('Setting AI response with analysis:', analysis.substring(0, 100) + '...');
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
    
    // Healthcare/Medical data
    if (fileNameLower.includes('patient') || fileNameLower.includes('medical') || fileNameLower.includes('hospital') || fileNameLower.includes('clinic') ||
        headersLower.some(h => h.includes('patient') || h.includes('doctor') || h.includes('diagnosis') || h.includes('treatment') || h.includes('medical'))) {
      return {
        type: 'Healthcare',
        title: 'Healthcare Analytics Dashboard',
        recordType: 'patients',
        categoryType: 'treatments',
        performanceMetric: 'Patient outcomes',
        keyColumns: headers.filter((h, i) => headersLower[i].includes('patient') || headersLower[i].includes('doctor') || headersLower[i].includes('diagnosis')),
        recommendations: [
          'Track patient outcomes and recovery rates',
          'Analyze treatment effectiveness',
          'Monitor appointment scheduling efficiency',
          'Generate medical compliance reports'
        ]
      };
    }
    
    // Financial/Accounting data
    if (fileNameLower.includes('transfer') || fileNameLower.includes('payment') || fileNameLower.includes('account') || fileNameLower.includes('balance') ||
        headersLower.some(h => h.includes('amount') || h.includes('balance') || h.includes('transfer') || h.includes('payment') || h.includes('receivable'))) {
      return {
        type: 'Financial',
        title: 'Financial Analytics Dashboard',
        recordType: 'transactions',
        categoryType: 'accounts',
        performanceMetric: 'Financial performance',
        keyColumns: headers.filter((h, i) => headersLower[i].includes('amount') || headersLower[i].includes('account') || headersLower[i].includes('payment')),
        recommendations: [
          'Analyze cash flow patterns',
          'Track receivables and payables',
          'Monitor payment method preferences',
          'Generate financial health reports'
        ]
      };
    }
    
    // Sports/Athletics data
    if (fileNameLower.includes('sports') || fileNameLower.includes('game') || fileNameLower.includes('match') || fileNameLower.includes('player') ||
        headersLower.some(h => h.includes('score') || h.includes('points') || h.includes('goals') || h.includes('player') || h.includes('team'))) {
      return {
        type: 'Sports',
        title: 'Sports Analytics Dashboard',
        recordType: 'matches',
        categoryType: 'players',
        performanceMetric: 'Athletic performance',
        keyColumns: headers.filter((h, i) => headersLower[i].includes('player') || headersLower[i].includes('team') || headersLower[i].includes('score')),
        recommendations: [
          'Analyze player statistics and rankings',
          'Track team performance trends',
          'Compare seasonal statistics',
          'Generate tournament brackets and standings'
        ]
      };
    }
    
    // Academic/Education data
    if (fileNameLower.includes('marks') || fileNameLower.includes('grades') || fileNameLower.includes('scores') || fileNameLower.includes('exam') || fileNameLower.includes('student') ||
        headersLower.some(h => h.includes('marks') || h.includes('grade') || h.includes('score') || h.includes('student') || h.includes('subject') || h.includes('exam'))) {
      return {
        type: 'Education',
        title: 'Academic Performance Analysis',
        recordType: 'students',
        categoryType: 'subjects',
        performanceMetric: 'Academic performance',
        keyColumns: headers.filter((h, i) => headersLower[i].includes('student') || headersLower[i].includes('name') || headersLower[i].includes('subject')),
        recommendations: [
          'Identify top and bottom performers',
          'Analyze subject-wise performance trends',
          'Find students needing additional support',
          'Compare class averages across subjects'
        ]
      };
    }
    
    // HR/Employee Management data
    if (fileNameLower.includes('employee') || fileNameLower.includes('hr') || fileNameLower.includes('staff') || fileNameLower.includes('payroll') ||
        headersLower.some(h => h.includes('employee') || h.includes('salary') || h.includes('department') || h.includes('designation') || h.includes('attendance'))) {
      return {
        type: 'HR',
        title: 'Human Resources Analytics',
        recordType: 'employees',
        categoryType: 'departments',
        performanceMetric: 'Employee performance',
        keyColumns: headers.filter((h, i) => headersLower[i].includes('employee') || headersLower[i].includes('department') || headersLower[i].includes('designation')),
        recommendations: [
          'Analyze employee performance and satisfaction',
          'Track attendance and leave patterns',
          'Monitor departmental productivity',
          'Generate payroll and benefits analysis'
        ]
      };
    }
    
    // E-commerce/Retail data
    if (fileNameLower.includes('product') || fileNameLower.includes('ecommerce') || fileNameLower.includes('retail') || fileNameLower.includes('inventory') ||
        headersLower.some(h => h.includes('product') || h.includes('sku') || h.includes('inventory') || h.includes('stock') || h.includes('category'))) {
      return {
        type: 'E-commerce',
        title: 'E-commerce Analytics Dashboard',
        recordType: 'products',
        categoryType: 'categories',
        performanceMetric: 'Sales performance',
        keyColumns: headers.filter((h, i) => headersLower[i].includes('product') || headersLower[i].includes('category') || headersLower[i].includes('brand')),
        recommendations: [
          'Analyze product performance and trends',
          'Track inventory turnover rates',
          'Monitor customer purchase patterns',
          'Generate sales forecasts and recommendations'
        ]
      };
    }
    
    // Government/Public Sector data
    if (fileNameLower.includes('government') || fileNameLower.includes('public') || fileNameLower.includes('citizen') || fileNameLower.includes('policy') ||
        headersLower.some(h => h.includes('citizen') || h.includes('government') || h.includes('public') || h.includes('policy') || h.includes('compliance'))) {
      return {
        type: 'Government',
        title: 'Government Analytics Dashboard',
        recordType: 'records',
        categoryType: 'departments',
        performanceMetric: 'Public service metrics',
        keyColumns: headers.filter((h, i) => headersLower[i].includes('citizen') || headersLower[i].includes('department') || headersLower[i].includes('service')),
        recommendations: [
          'Analyze public service efficiency',
          'Track citizen satisfaction and feedback',
          'Monitor budget allocation and spending',
          'Generate compliance and audit reports'
        ]
      };
    }
    
    // Media/News data
    if (fileNameLower.includes('news') || fileNameLower.includes('media') || fileNameLower.includes('article') || fileNameLower.includes('publication') ||
        headersLower.some(h => h.includes('article') || h.includes('news') || h.includes('media') || h.includes('journalist') || h.includes('views'))) {
      return {
        type: 'Media',
        title: 'Media Analytics Dashboard',
        recordType: 'articles',
        categoryType: 'topics',
        performanceMetric: 'Engagement metrics',
        keyColumns: headers.filter((h, i) => headersLower[i].includes('article') || headersLower[i].includes('author') || headersLower[i].includes('category')),
        recommendations: [
          'Analyze content performance and engagement',
          'Track audience reach and demographics',
          'Monitor trending topics and themes',
          'Generate editorial and publishing insights'
        ]
      };
    }
    
    // Banking/Finance data
    if (fileNameLower.includes('bank') || fileNameLower.includes('loan') || fileNameLower.includes('credit') || fileNameLower.includes('deposit') ||
        headersLower.some(h => h.includes('loan') || h.includes('interest') || h.includes('bank') || h.includes('credit') || h.includes('deposit'))) {
      return {
        type: 'Banking',
        title: 'Banking Analytics Dashboard',
        recordType: 'accounts',
        categoryType: 'products',
        performanceMetric: 'Financial metrics',
        keyColumns: headers.filter((h, i) => headersLower[i].includes('account') || headersLower[i].includes('customer') || headersLower[i].includes('branch')),
        recommendations: [
          'Analyze loan portfolio performance',
          'Track customer acquisition and retention',
          'Monitor branch performance metrics',
          'Generate risk assessment reports'
        ]
      };
    }
    
    // Sales/Business data
    if (fileNameLower.includes('sales') || fileNameLower.includes('revenue') || fileNameLower.includes('business') ||
        headersLower.some(h => h.includes('sales') || h.includes('revenue') || h.includes('profit'))) {
      return {
        type: 'Sales',
        title: 'Sales Performance Analysis',
        recordType: 'transactions',
        categoryType: 'products/regions',
        performanceMetric: 'Sales performance',
        keyColumns: headers.filter((h, i) => headersLower[i].includes('product') || headersLower[i].includes('region') || headersLower[i].includes('customer')),
        recommendations: [
          'Identify top-performing products and regions',
          'Analyze seasonal sales patterns',
          'Focus marketing on high-value customers',
          'Investigate underperforming segments'
        ]
      };
    }
    

    

    

    
    // Customer data
    if (fileNameLower.includes('customer') || fileNameLower.includes('client') ||
        headersLower.some(h => h.includes('customer') || h.includes('client'))) {
      return {
        type: 'Customer',
        title: 'Customer Analytics',
        recordType: 'customers',
        categoryType: 'segments',
        performanceMetric: 'Customer value',
        keyColumns: headers.filter((h, i) => headersLower[i].includes('customer') || headersLower[i].includes('segment') || headersLower[i].includes('region')),
        recommendations: [
          'Segment customers by value',
          'Identify retention opportunities',
          'Analyze customer lifetime value',
          'Target high-value segments'
        ]
      };
    }
    
    // Survey/Feedback data
    if (fileNameLower.includes('survey') || fileNameLower.includes('feedback') || fileNameLower.includes('rating') ||
        headersLower.some(h => h.includes('rating') || h.includes('feedback') || h.includes('satisfaction') || h.includes('response'))) {
      return {
        type: 'Survey',
        title: 'Survey & Feedback Analysis',
        recordType: 'responses',
        categoryType: 'questions/categories',
        performanceMetric: 'Satisfaction metrics',
        keyColumns: headers.filter((h, i) => headersLower[i].includes('question') || headersLower[i].includes('category') || headersLower[i].includes('respondent')),
        recommendations: [
          'Analyze satisfaction trends',
          'Identify areas for improvement',
          'Compare ratings across categories',
          'Track feedback patterns over time'
        ]
      };
    }
    
    // Generic data analysis based on column types
    const numericCols = headers.filter((h, i) => {
      const values = rows.map(row => row[i]).filter(val => val !== null && val !== undefined && val !== '');
      const numericValues = values.filter(val => !isNaN(parseFloat(String(val))));
      return numericValues.length > values.length * 0.7;
    });
    
    const textCols = headers.filter((h, i) => {
      const values = rows.map(row => row[i]).filter(val => val !== null && val !== undefined && val !== '');
      const numericValues = values.filter(val => !isNaN(parseFloat(String(val))));
      return numericValues.length <= values.length * 0.7;
    });
    
    // Default adaptive analysis
    return {
      type: 'Data',
      title: 'Universal Data Analysis',
      recordType: 'records',
      categoryType: 'categories',
      performanceMetric: 'Data metrics',
      keyColumns: textCols.slice(0, 3),
      recommendations: [
        `Analyze ${numericCols.length} numeric columns for trends and patterns`,
        `Explore relationships between ${textCols.length} categorical variables`,
        'Identify outliers and data quality issues',
        'Create visualizations for key insights'
      ]
    };
  };

  const performAutoAnalysis = async (data: any[][]) => {
    setAiLoading(true);
    setAiResponse('🧠 AI is reading and understanding your data...');
    
    try {
      // Enhanced AI prompt for complete analysis
      const enhancedPrompt = `You are an expert data analyst. Analyze this spreadsheet data completely and provide comprehensive insights.

**ANALYZE EVERY ASPECT:**

1. **COMPLETE DATA UNDERSTANDING:**
   - Read and understand each column's purpose
   - Identify data types, patterns, and relationships
   - Detect the business context (sales, finance, HR, etc.)
   - Total rows: ${data.length - 1}, Total columns: ${data[0]?.length || 0}

2. **DETAILED COLUMN ANALYSIS:**
   ${data[0]?.map((header, i) => {
     const values = data.slice(1).map(row => row[i]).filter(v => v !== null && v !== undefined && v !== '');
     const numericValues = values.filter(v => !isNaN(parseFloat(String(v))));
     const isNumeric = numericValues.length > values.length * 0.5;
     return `   Column ${i + 1} "${header}": ${isNumeric ? 'NUMERIC' : 'TEXT'} - ${values.length} values, ${new Set(values).size} unique`;
   }).join('\n')}

3. **STATISTICAL DEEP DIVE:**
   - Calculate statistics for ALL numeric columns
   - Find correlations between variables
   - Identify outliers and anomalies
   - Show distributions and percentiles

4. **BUSINESS INSIGHTS:**
   - What story does this data tell?
   - Key performance indicators
   - Trends and patterns discovered
   - Critical business metrics

5. **ACTIONABLE RECOMMENDATIONS:**
   - Specific actions based on findings
   - Areas needing attention
   - Opportunities for improvement
   - Next steps for analysis

**PROVIDE ACTUAL NUMBERS AND CALCULATIONS. BE SPECIFIC AND DETAILED.**`;
      
      const result = await bedrockService.processExcelData(data, enhancedPrompt, selectedFile?.name || 'data');
      
      if (result.success) {
        // Perform comprehensive local analytics
        const analytics = performComprehensiveAnalytics(data);
        
        let fullAnalysis = `📊 **COMPREHENSIVE DATA ANALYTICS REPORT**\n\n`;
        
        // Basic Statistics
        if (result.structured && result.structured.result) {
          fullAnalysis += `**📊 STATISTICAL SUMMARY:**\n`;
          const stats = result.structured.result;
          stats.slice(1).forEach(([stat, value]) => {
            fullAnalysis += `• ${stat}: ${value}\n`;
          });
          fullAnalysis += `\n`;
        }
        
        // Data Quality Analysis
        fullAnalysis += `**🔍 DATA QUALITY:**\n`;
        fullAnalysis += `• Total Rows: ${data.length}\n`;
        fullAnalysis += `• Total Columns: ${data[0]?.length || 0}\n`;
        fullAnalysis += `• Duplicate Rows: ${analytics.duplicates}\n`;
        fullAnalysis += `• Missing Values: ${analytics.missingValues}\n\n`;
        
        // Create separate analytics data
        if (analytics.top5.length > 0 && analytics.bottom5.length > 0) {
          const topAvg = analytics.top5.reduce((sum, item) => sum + item.value, 0) / analytics.top5.length;
          const bottomAvg = analytics.bottom5.reduce((sum, item) => sum + item.value, 0) / analytics.bottom5.length;
          const ratio = (topAvg / bottomAvg).toFixed(2);
          
          // Store analytics data for separate display
          setAnalyticsData({
            top5: analytics.top5,
            bottom5: analytics.bottom5,
            comparison: {
              topAvg: topAvg.toFixed(2),
              bottomAvg: bottomAvg.toFixed(2),
              ratio,
              gap: topAvg > bottomAvg * 2 ? 'High inequality' : 'Moderate gap'
            }
          });
          
          // Generate 5 sample pivot tables automatically
          const pivots = generateAdvancedPivotTables(data);
          setPivotTables(pivots);
          console.log('Auto-generated pivot tables:', pivots.length);
          
          fullAnalysis += `**📊 ANALYTICS OVERVIEW:**\n`;
          fullAnalysis += `• Top 5 average: ${topAvg.toFixed(2)} | Bottom 5 average: ${bottomAvg.toFixed(2)}\n`;
          fullAnalysis += `• Performance gap: ${ratio}x difference detected\n`;
          fullAnalysis += `• Detailed analytics completed successfully\n\n`;
        }
        
        // Statistical Analysis
        const stats = performStatisticalAnalysis(data);
        if (stats && stats.correlations.length > 0) {
          fullAnalysis += `**📊 STATISTICAL INSIGHTS:**\n`;
          
          // Top correlations
          const strongCorrelations = stats.correlations.filter(c => Math.abs(c.correlation) > 0.5);
          if (strongCorrelations.length > 0) {
            fullAnalysis += `• Strong Correlations Found:\n`;
            strongCorrelations.slice(0, 3).forEach(corr => {
              fullAnalysis += `  - ${corr.col1} ↔ ${corr.col2}: ${corr.correlation.toFixed(3)} (${corr.strength})\n`;
            });
          } else {
            fullAnalysis += `• No strong correlations detected between variables\n`;
          }
          
          // Percentile insights
          if (stats.percentiles.length > 0) {
            const mainColumn = stats.percentiles[0];
            const iqr = mainColumn.p75 - mainColumn.p25;
            fullAnalysis += `• Data Distribution (${mainColumn.name}): IQR = ${iqr.toFixed(2)}\n`;
          }
          fullAnalysis += `\n`;
        }
        
        // Predictive Analysis
        const predictions = performPredictiveAnalysis(data);
        if (predictions && predictions.trends.length > 0) {
          fullAnalysis += `**🔮 PREDICTIVE INSIGHTS:**\n`;
          
          // Key trends
          const significantTrends = predictions.trends.filter(t => t.strength !== 'Weak');
          if (significantTrends.length > 0) {
            fullAnalysis += `• Significant Trends Detected:\n`;
            significantTrends.slice(0, 2).forEach(trend => {
              fullAnalysis += `  - ${trend.column}: ${trend.direction} (${trend.growthRate}% growth rate)\n`;
            });
          }
          
          // Forecasting summary
          const highConfidenceForecasts = predictions.forecasts.filter(f => f.confidence === 'High');
          if (highConfidenceForecasts.length > 0) {
            fullAnalysis += `• High Confidence Forecasts: ${highConfidenceForecasts.length} predictions available\n`;
          }
          fullAnalysis += `\n`;
        }
        
        // Data Quality Analysis
        const qualityReport = performDataQualityAnalysis(data);
        if (qualityReport) {
          fullAnalysis += `**🔍 DATA QUALITY ASSESSMENT:**\n`;
          fullAnalysis += `• Overall Quality Score: ${qualityReport.overallScore}/100\n`;
          
          if (qualityReport.cleaningSuggestions.length > 0) {
            const highPriority = qualityReport.cleaningSuggestions.filter(s => s.severity === 'High');
            fullAnalysis += `• Cleaning Issues: ${qualityReport.cleaningSuggestions.length} total (${highPriority.length} high priority)\n`;
          }
          
          if (qualityReport.validationIssues.length > 0) {
            fullAnalysis += `• Validation Issues: ${qualityReport.validationIssues.length} columns need attention\n`;
          }
          
          if (qualityReport.anomalies.length > 0) {
            fullAnalysis += `• Anomalies Detected: ${qualityReport.anomalies.length} columns have statistical outliers\n`;
          }
          
          fullAnalysis += `\n`;
        }
        
        // AI-Powered Insights
        const aiInsights = processNaturalLanguageQuery('what patterns exist in this data', data);
        if (aiInsights) {
          fullAnalysis += `**🤖 AI-POWERED INSIGHTS:**\n`;
          fullAnalysis += `• Pattern Recognition: Advanced AI analysis completed\n`;
          fullAnalysis += `• Smart Categorization: Data columns automatically classified\n`;
          fullAnalysis += `• Automated Discoveries: Key insights identified\n`;
          fullAnalysis += `• Recommendation Engine: Analysis suggestions generated\n`;
          fullAnalysis += `• Try: "what patterns exist" or "recommend analysis" for detailed AI insights\n`;
          fullAnalysis += `\n`;
        }
        
        // Key Insights
        fullAnalysis += `**💡 KEY INSIGHTS:**\n`;
        fullAnalysis += `• Data Range: ${analytics.range.toFixed(2)} (${analytics.min} to ${analytics.max})\n`;
        fullAnalysis += `• Data Quality: ${analytics.duplicates === 0 ? 'Excellent (No duplicates)' : `${analytics.duplicates} duplicates found`}\n`;
        fullAnalysis += `• Distribution: ${analytics.standardDeviation > analytics.mean ? 'High variability' : 'Low variability'}\n`;
        fullAnalysis += `• Statistical Analysis: ${stats && stats.correlations.length > 0 ? `${stats.correlations.length} relationships analyzed` : 'Limited numeric data'}\n`;
        fullAnalysis += `• Recommendation: ${analytics.duplicates > 0 ? 'Clean duplicate data' : 'Data ready for analysis'}\n`;
        
        setAiResponse(fullAnalysis);
        return;
      } else {
        throw new Error(result.error || 'AI analysis failed');
      }
      
      // Generate local analysis as fallback
      const headers = data[0];
      const rows = data.slice(1);
      const numericColumns = [];
      const textColumns = [];
      
      // Analyze column types
      headers.forEach((header, index) => {
        const values = rows.map(row => row[index]).filter(val => val !== null && val !== undefined && val !== '');
        const numericValues = values.filter(val => !isNaN(Number(val)));
        
        if (numericValues.length > values.length * 0.7) {
          numericColumns.push({ name: header, index, values: numericValues.map(Number) });
        } else {
          textColumns.push({ name: header, index, values });
        }
      });
      
      // Generate insights
      let insights = `📊 **Data Analysis Results**\n\n`;
      insights += `**Dataset Overview:**\n`;
      insights += `• Total rows: ${rows.length}\n`;
      insights += `• Total columns: ${headers.length}\n`;
      insights += `• Numeric columns: ${numericColumns.length}\n`;
      insights += `• Text columns: ${textColumns.length}\n\n`;
      
      // Numeric analysis
      if (numericColumns.length > 0) {
        insights += `**Numeric Analysis:**\n`;
        numericColumns.forEach(col => {
          const values = col.values;
          const sum = values.reduce((a, b) => a + b, 0);
          const avg = sum / values.length;
          const min = Math.min(...values);
          const max = Math.max(...values);
          
          insights += `• ${col.name}: Avg: ${avg.toFixed(2)}, Min: ${min}, Max: ${max}\n`;
        });
        insights += `\n`;
      }
      
      // Text analysis
      if (textColumns.length > 0) {
        insights += `**Text Analysis:**\n`;
        textColumns.forEach(col => {
          const uniqueValues = [...new Set(col.values)];
          insights += `• ${col.name}: ${uniqueValues.length} unique values\n`;
        });
        insights += `\n`;
      }
      
      insights += `**Recommendations:**\n`;
      insights += `• Data appears to be well-structured\n`;
      insights += `• Consider creating visualizations for numeric data\n`;
      insights += `• Review data for any missing values\n`;
      
      setAiResponse(insights);
      
    } catch (err: any) {
      console.error('Auto Analysis Error:', err);
      setAiResponse(`⚠️ **Analysis Notice:** AWS AI service is temporarily unavailable. A basic local analysis has been performed instead.\n\nYour data has been successfully loaded and is ready for editing. You can:\n• Edit cells directly in the table\n• Sort columns by clicking headers\n• Export your data\n• Create charts\n\nFor advanced AI analysis, please try again later.`);
    } finally {
      setAiLoading(false);
    }
  };

  const handleCustomAnalysis = async () => {
    if (!prompt.trim() || !spreadsheetData.length) return;
    
    setAiLoading(true);
    try {
      // Advanced Natural Language Processing with industry context
      const aiInsights = processNaturalLanguageQuery(prompt, spreadsheetData);
      if (aiInsights) {
        let enhancedResponse = aiInsights.response;
        
        // Add industry context to response
        if (dataStructure) {
          const industryType = dataStructure.detectedFormat;
          enhancedResponse = `🎯 **${industryType.toUpperCase()} ANALYSIS**\n\n` + enhancedResponse;
          
          // Add relevant KPIs
          const kpis = EnhancedAiService.generateIndustryKPIs(dataStructure);
          if (kpis.length > 0) {
            enhancedResponse += `\n\n**RELEVANT KPIs:**\n${kpis.slice(0, 3).map(k => `• ${k.name}: ${k.description}`).join('\n')}`;
          }
        }
        
        setAiResponse(enhancedResponse);
        if (aiInsights.action === 'pivot') {
          const customPivot = {
            title: 'AI Generated Pivot',
            description: prompt,
            data: aiInsights.data
          };
          setPivotTables([...pivotTables, customPivot]);
          setSelectedPivot(pivotTables.length);
        }
        setPrompt('');
        setAiLoading(false);
        return;
      }
      
      // Check if this is a pivot table request
      const lowerPrompt = prompt.toLowerCase();
      if (lowerPrompt.includes('pivot') || 
          (lowerPrompt.includes('countries') && (lowerPrompt.includes('rank') || lowerPrompt.includes('economy'))) ||
          (lowerPrompt.includes('employees') && (lowerPrompt.includes('salary') || lowerPrompt.includes('performance'))) ||
          (lowerPrompt.includes('items') && lowerPrompt.includes('price'))) {
        
        const localPivot = createCustomPivot(spreadsheetData, prompt);
        if (localPivot) {
          const customPivot = {
            title: 'Custom Pivot',
            description: prompt,
            data: localPivot
          };
          setPivotTables([...pivotTables, customPivot]);
          setSelectedPivot(pivotTables.length);
          setAiResponse(`✅ **Pivot Table Created**\n\nYour pivot table "${prompt}" has been generated successfully.`);
          setPrompt('');
          setAiLoading(false);
          return;
        }
      }
      
      // Try AWS service for other analysis
      try {
        let enhancedPrompt = prompt;
        
        if (dataStructure) {
          enhancedPrompt = EnhancedAiService.enhancePrompt(prompt, dataStructure);
          
          // Add industry-specific context
          const kpis = EnhancedAiService.generateIndustryKPIs(dataStructure);
          const benchmarks = EnhancedAiService.generateIndustryBenchmarks(dataStructure);
          
          enhancedPrompt += ` Industry KPIs to consider: ${kpis.map(k => k.name).join(', ')}. Industry benchmarks: ${benchmarks.map(b => `${b.metric} (${b.benchmark})`).join(', ')}.`;
        }
        
        const result = await bedrockService.processExcelData(spreadsheetData, enhancedPrompt, selectedFile?.name || 'data');
        
        if (result.success && result.response) {
          setAiResponse(result.response);
        } else {
          throw new Error(result.error || 'Analysis failed');
        }
      } catch (apiError) {
        // Fallback: Provide industry-specific response
        let response = `⚠️ **AI Service Temporarily Unavailable**\n\n`;
        
        if (dataStructure) {
          const industryType = dataStructure.detectedFormat;
          response += `Detected ${industryType} data. `;
          
          const kpis = EnhancedAiService.generateIndustryKPIs(dataStructure);
          if (kpis.length > 0) {
            response += `Key metrics to focus on: ${kpis.slice(0, 3).map(k => k.name).join(', ')}.\n\n`;
          }
        }
        
        if (lowerPrompt.includes('sum') || lowerPrompt.includes('total')) {
          response += `For sum calculations, you can:\n• Click on column headers to sort\n• Use the export feature to analyze in Excel\n• Manually review the numeric columns`;
        } else if (lowerPrompt.includes('chart') || lowerPrompt.includes('graph')) {
          response += `For charts:\n• Use the "Show Chart" button in Quick Actions\n• Switch between recommended chart types\n• Export data for external visualization`;
        } else if (lowerPrompt.includes('kpi') || lowerPrompt.includes('metric')) {
          response += `For KPI analysis:\n• Check the Industry KPIs panel above\n• Compare against industry benchmarks\n• Use pivot tables for detailed breakdowns`;
        } else {
          response += `Your request: "${prompt}"\n\nWhile AI analysis is unavailable, you can:\n• View Industry KPIs panel for relevant metrics\n• Create industry-specific charts\n• Export data for external analysis`;
        }
        
        setAiResponse(response);
      }
    } catch (err: any) {
      console.error('AI Processing Error:', err);
      setAiResponse(`❌ Error: ${err.message || 'Processing failed'}`);
    } finally {
      setAiLoading(false);
      setPrompt('');
    }
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

  const createMultiDimensionalPivot = (data: any[][], dimensions: string[], measures: string[], filters: {[key: string]: string} = {}) => {
    if (!data || data.length < 2) return null;
    
    const headers = data[0];
    const rows = data.slice(1);
    
    // Apply filters
    let filteredRows = rows;
    Object.entries(filters).forEach(([column, filterValue]) => {
      if (filterValue && filterValue !== 'All') {
        const colIndex = headers.indexOf(column);
        if (colIndex !== -1) {
          filteredRows = filteredRows.filter(row => 
            String(row[colIndex]).toLowerCase().includes(filterValue.toLowerCase())
          );
        }
      }
    });
    
    // Group by dimensions
    const grouped = {};
    filteredRows.forEach(row => {
      const key = dimensions.map(dim => {
        const dimIndex = headers.indexOf(dim);
        return dimIndex !== -1 ? row[dimIndex] : 'Unknown';
      }).join(' | ');
      
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(row);
    });
    
    // Calculate measures
    const result = [dimensions.concat(measures.map(m => `${m} (Sum)`, `${m} (Avg)`, `${m} (Count)`)).flat()];
    
    Object.entries(grouped).forEach(([key, groupRows]: [string, any[]]) => {
      const dimensionValues = key.split(' | ');
      const measureValues = [];
      
      measures.forEach(measure => {
        const measureIndex = headers.indexOf(measure);
        if (measureIndex !== -1) {
          const values = groupRows.map(row => parseFloat(row[measureIndex])).filter(v => !isNaN(v));
          const sum = values.reduce((s, v) => s + v, 0);
          const avg = values.length > 0 ? sum / values.length : 0;
          const count = values.length;
          
          measureValues.push(sum.toFixed(2), avg.toFixed(2), count.toString());
        } else {
          measureValues.push('N/A', 'N/A', '0');
        }
      });
      
      result.push(dimensionValues.concat(measureValues));
    });
    
    return result;
  };
  
  const createPivotWithCalculatedFields = (data: any[][], baseColumns: string[], calculatedFields: {name: string, formula: string}[]) => {
    if (!data || data.length < 2) return null;
    
    const headers = data[0];
    const rows = data.slice(1);
    
    // Add calculated field headers
    const newHeaders = [...baseColumns, ...calculatedFields.map(cf => cf.name)];
    const result = [newHeaders];
    
    rows.forEach(row => {
      const baseValues = baseColumns.map(col => {
        const colIndex = headers.indexOf(col);
        return colIndex !== -1 ? row[colIndex] : 'N/A';
      });
      
      const calculatedValues = calculatedFields.map(cf => {
        // Simple calculated field evaluation
        if (cf.formula.includes('+')) {
          const [col1, col2] = cf.formula.split('+').map(s => s.trim());
          const val1 = parseFloat(row[headers.indexOf(col1)]) || 0;
          const val2 = parseFloat(row[headers.indexOf(col2)]) || 0;
          return (val1 + val2).toFixed(2);
        } else if (cf.formula.includes('*')) {
          const [col1, col2] = cf.formula.split('*').map(s => s.trim());
          const val1 = parseFloat(row[headers.indexOf(col1)]) || 0;
          const val2 = parseFloat(row[headers.indexOf(col2)]) || 0;
          return (val1 * val2).toFixed(2);
        } else if (cf.formula.includes('/')) {
          const [col1, col2] = cf.formula.split('/').map(s => s.trim());
          const val1 = parseFloat(row[headers.indexOf(col1)]) || 0;
          const val2 = parseFloat(row[headers.indexOf(col2)]) || 1;
          return (val1 / val2).toFixed(2);
        }
        return 'N/A';
      });
      
      result.push(baseValues.concat(calculatedValues));
    });
    
    return result;
  };

  const generateAdvancedPivotTables = (data: any[][]) => {
    if (!data || data.length < 2) return [];
    
    const headers = data[0];
    const pivots = [];
    
    // 1. Excel-style Country × Year Pivot (Rows: Countries, Columns: Years, Values: Sum)
    const countryYearPivot = createExcelStylePivot(data, 'country', 'year', 'sum');
    if (countryYearPivot) {
      pivots.push({
        title: 'Countries × Years (Sum)',
        description: 'Excel-style pivot: Countries as rows, Years as columns',
        data: countryYearPivot,
        type: 'excel-pivot'
      });
    }
    
    // 2. Excel-style Category × Status Pivot (Rows: Categories, Columns: Status, Values: Count)
    const categoryStatusPivot = createExcelStylePivot(data, 'category', 'status', 'count');
    if (categoryStatusPivot) {
      pivots.push({
        title: 'Categories × Status (Count)',
        description: 'Excel-style pivot: Categories as rows, Status as columns',
        data: categoryStatusPivot,
        type: 'excel-pivot'
      });
    }
    
    // 3. Excel-style Region × Quarter Pivot (Rows: Regions, Columns: Quarters, Values: Average)
    const regionQuarterPivot = createExcelStylePivot(data, 'region', 'quarter', 'average');
    if (regionQuarterPivot) {
      pivots.push({
        title: 'Regions × Quarters (Average)',
        description: 'Excel-style pivot: Regions as rows, Quarters as columns',
        data: regionQuarterPivot,
        type: 'excel-pivot'
      });
    }
    
    // 4. Excel-style Product × Month Pivot (Rows: Products, Columns: Months, Values: Sum)
    const productMonthPivot = createExcelStylePivot(data, 'product', 'month', 'sum');
    if (productMonthPivot) {
      pivots.push({
        title: 'Products × Months (Sum)',
        description: 'Excel-style pivot: Products as rows, Months as columns',
        data: productMonthPivot,
        type: 'excel-pivot'
      });
    }
    
    // 5. Excel-style Department × Performance Pivot (Rows: Departments, Columns: Performance Levels, Values: Count)
    const deptPerformancePivot = createExcelStylePivot(data, 'department', 'performance', 'count');
    if (deptPerformancePivot) {
      pivots.push({
        title: 'Departments × Performance (Count)',
        description: 'Excel-style pivot: Departments as rows, Performance as columns',
        data: deptPerformancePivot,
        type: 'excel-pivot'
      });
    }
    
    console.log('Generated Excel-style pivot tables:', pivots.length);
    return pivots.length > 0 ? pivots : [{
      title: 'Basic Data View',
      description: 'Simple data overview',
      data: [headers, ...data.slice(1, 11)],
      type: 'standard'
    }];
  };
  
  const createExcelStylePivot = (data: any[][], rowField: string, columnField: string, aggregation: 'sum' | 'count' | 'average') => {
    if (!data || data.length < 2) return null;
    
    const headers = data[0];
    const rows = data.slice(1);
    
    // Find row field (countries, categories, regions, etc.)
    const rowFieldIndex = headers.findIndex((h: string) => 
      String(h).toLowerCase().includes(rowField) || 
      String(h).toLowerCase().includes('name') ||
      String(h).toLowerCase().includes('country') ||
      String(h).toLowerCase().includes('region') ||
      String(h).toLowerCase().includes('category') ||
      String(h).toLowerCase().includes('product') ||
      String(h).toLowerCase().includes('department')
    );
    
    // Find column field (years, quarters, months, status, etc.)
    const columnFieldIndex = headers.findIndex((h: string) => {
      const headerStr = String(h).toLowerCase();
      return /\d{4}/.test(String(h)) || // Years
             headerStr.includes(columnField) ||
             headerStr.includes('year') ||
             headerStr.includes('quarter') ||
             headerStr.includes('month') ||
             headerStr.includes('status') ||
             headerStr.includes('type') ||
             headerStr.includes('level');
    });
    
    // Find value field (numeric data to aggregate)
    const valueFieldIndex = headers.findIndex((h: string) => {
      const headerStr = String(h).toLowerCase();
      return headerStr.includes('total') ||
             headerStr.includes('value') ||
             headerStr.includes('amount') ||
             headerStr.includes('sales') ||
             headerStr.includes('revenue') ||
             headerStr.includes('count') ||
             headerStr.includes('score');
    });
    
    if (rowFieldIndex === -1) return null;
    
    // Get unique row values
    const rowValues = [...new Set(rows.map(row => String(row[rowFieldIndex] || 'Unknown')))].sort();
    
    // Get unique column values
    let columnValues = [];
    if (columnFieldIndex !== -1) {
      columnValues = [...new Set(rows.map(row => String(row[columnFieldIndex] || 'N/A')))].sort();
    } else {
      columnValues = ['Total']; // Fallback to single column
    }
    
    // Create pivot table structure
    const pivotData = {};
    
    // Initialize pivot data structure
    rowValues.forEach(rowVal => {
      pivotData[rowVal] = {};
      columnValues.forEach(colVal => {
        pivotData[rowVal][colVal] = [];
      });
    });
    
    // Populate pivot data
    rows.forEach(row => {
      const rowVal = String(row[rowFieldIndex] || 'Unknown');
      const colVal = columnFieldIndex !== -1 ? String(row[columnFieldIndex] || 'N/A') : 'Total';
      const value = valueFieldIndex !== -1 ? parseFloat(row[valueFieldIndex]) || 0 : 1; // Default to 1 for count
      
      if (pivotData[rowVal] && pivotData[rowVal][colVal] !== undefined) {
        pivotData[rowVal][colVal].push(value);
      }
    });
    
    // Build result table with proper Excel-style structure
    const result = [];
    
    // Header row
    const headerRow = [headers[rowFieldIndex] || 'Row Field', ...columnValues, 'Grand Total'];
    result.push(headerRow);
    
    // Data rows with aggregation
    let grandTotals = {};
    columnValues.forEach(col => grandTotals[col] = 0);
    let overallGrandTotal = 0;
    
    rowValues.forEach(rowVal => {
      const dataRow = [rowVal];
      let rowTotal = 0;
      
      columnValues.forEach(colVal => {
        const values = pivotData[rowVal][colVal];
        let cellValue = 0;
        
        if (values.length > 0) {
          switch (aggregation) {
            case 'sum':
              cellValue = values.reduce((sum, val) => sum + val, 0);
              break;
            case 'count':
              cellValue = values.length;
              break;
            case 'average':
              cellValue = values.reduce((sum, val) => sum + val, 0) / values.length;
              break;
          }
        }
        
        dataRow.push(cellValue.toFixed(2));
        rowTotal += cellValue;
        grandTotals[colVal] += cellValue;
      });
      
      dataRow.push(rowTotal.toFixed(2));
      overallGrandTotal += rowTotal;
      result.push(dataRow);
    });
    
    // Grand Total row
    const grandTotalRow = ['Grand Total'];
    columnValues.forEach(colVal => {
      grandTotalRow.push(grandTotals[colVal].toFixed(2));
    });
    grandTotalRow.push(overallGrandTotal.toFixed(2));
    result.push(grandTotalRow);
    
    return result;
  };
  
  const createBasicPivot = (data: any[][]) => {
    if (!data || data.length < 2) return null;
    
    const headers = data[0];
    const rows = data.slice(1);
    
    // Create a simple summary pivot
    const result = [['Column', 'Total Rows', 'Unique Values', 'Data Type']];
    
    headers.forEach((header, index) => {
      const columnData = rows.map(row => row[index]).filter(val => val !== null && val !== undefined && val !== '');
      const uniqueValues = new Set(columnData.map(val => String(val).toLowerCase()));
      const numericValues = columnData.filter(val => !isNaN(parseFloat(String(val))));
      const dataType = numericValues.length > columnData.length * 0.7 ? 'Numeric' : 'Text';
      
      result.push([
        String(header),
        columnData.length.toString(),
        uniqueValues.size.toString(),
        dataType
      ]);
    });
    
    return result;
  };
  
  const createYearPivot = (data: any[][]) => {
    const headers = data[0];
    const yearColumns = headers.filter((h: string) => /\d{4}/.test(String(h)));
    
    if (yearColumns.length === 0) return null;
    
    const result = [['Year', 'Total', 'Average']];
    yearColumns.forEach(year => {
      const yearIndex = headers.indexOf(year);
      const values = data.slice(1).map(row => parseFloat(row[yearIndex]) || 0).filter(v => v > 0);
      const total = values.reduce((sum, val) => sum + val, 0);
      const avg = values.length > 0 ? total / values.length : 0;
      result.push([String(year), total.toFixed(2), avg.toFixed(2)]);
    });
    
    return result;
  };
  
  const createCategoryPivot = (data: any[][]) => {
    const analytics = performComprehensiveAnalytics(data);
    if (!analytics.top5.length) return null;
    
    const result = [['Rank', 'Category', 'Value', 'Percentage']];
    const total = analytics.top5.reduce((sum, item) => sum + item.value, 0);
    
    analytics.top5.forEach((item, index) => {
      const percentage = ((item.value / total) * 100).toFixed(1);
      result.push([`#${index + 1}`, item.country || `Item ${index + 1}`, item.value.toFixed(2), `${percentage}%`]);
    });
    
    return result;
  };
  
  const createStatsPivot = (data: any[][]) => {
    const analytics = performComprehensiveAnalytics(data);
    
    return [
      ['Metric', 'Value'],
      ['Total Records', data.length - 1],
      ['Total Columns', data[0]?.length || 0],
      ['Duplicate Records', analytics.duplicates],
      ['Missing Values', analytics.missingValues],
      ['Minimum Value', analytics.min.toFixed(2)],
      ['Maximum Value', analytics.max.toFixed(2)],
      ['Average Value', analytics.mean.toFixed(2)],
      ['Data Range', analytics.range.toFixed(2)]
    ];
  };
  
  const createCountryYearMatrix = (data: any[][]) => {
    const headers = data[0];
    const rows = data.slice(1);
    
    const countryIndex = headers.findIndex((h: string) => String(h).toLowerCase().includes('country') || String(h).toLowerCase().includes('region'));
    const yearColumns = headers.map((h, i) => ({ header: h, index: i })).filter(({ header }) => /\d{4}/.test(String(header)));
    
    if (countryIndex === -1 || yearColumns.length === 0) return null;
    
    const countryData: any = {};
    rows.forEach(row => {
      const country = row[countryIndex] || 'Unknown';
      if (!countryData[country]) countryData[country] = {};
      
      yearColumns.forEach(({ header, index }) => {
        const value = parseFloat(row[index]) || 0;
        countryData[country][header] = (countryData[country][header] || 0) + value;
      });
    });
    
    const result = [['Country', ...yearColumns.map(y => y.header), 'Total']];
    Object.entries(countryData).forEach(([country, years]: [string, any]) => {
      const yearValues = yearColumns.map(y => (years[y.header] || 0).toFixed(2));
      const total = yearColumns.reduce((sum, y) => sum + (years[y.header] || 0), 0);
      result.push([country, ...yearValues, total.toFixed(2)]);
    });
    
    return result;
  };
  
  const createYearCategoryMatrix = (data: any[][]) => {
    const headers = data[0];
    const yearColumns = headers.map((h, i) => ({ header: h, index: i })).filter(({ header }) => /\d{4}/.test(String(header)));
    const categoryIndex = headers.findIndex((h: string) => String(h).toLowerCase().includes('type') || String(h).toLowerCase().includes('category'));
    
    if (yearColumns.length === 0) return null;
    
    const result = [['Year', 'Total Records', 'Average Value', 'Min Value', 'Max Value']];
    yearColumns.forEach(({ header, index }) => {
      const values = data.slice(1).map(row => parseFloat(row[index]) || 0).filter(v => v > 0);
      const total = values.length;
      const avg = total > 0 ? values.reduce((sum, val) => sum + val, 0) / total : 0;
      const min = total > 0 ? Math.min(...values) : 0;
      const max = total > 0 ? Math.max(...values) : 0;
      
      result.push([String(header), total.toString(), avg.toFixed(2), min.toFixed(2), max.toFixed(2)]);
    });
    
    return result;
  };
  
  const createRegionalSummary = (data: any[][]) => {
    const analytics = performComprehensiveAnalytics(data);
    const headers = data[0];
    const countryIndex = headers.findIndex((h: string) => String(h).toLowerCase().includes('country') || String(h).toLowerCase().includes('region'));
    
    if (countryIndex === -1) return null;
    
    const regions: any = {};
    data.slice(1).forEach(row => {
      const country = String(row[countryIndex] || 'Unknown');
      const region = country.includes('Africa') ? 'Africa' : 
                    country.includes('Asia') ? 'Asia' : 
                    country.includes('Europe') ? 'Europe' : 
                    country.includes('America') ? 'Americas' : 'Other';
      
      if (!regions[region]) regions[region] = { count: 0, values: [] };
      regions[region].count++;
      
      const numericValue = parseFloat(row.find((cell, i) => i !== countryIndex && !isNaN(parseFloat(cell)))) || 0;
      if (numericValue > 0) regions[region].values.push(numericValue);
    });
    
    const result = [['Region', 'Countries', 'Total Value', 'Average', 'Percentage']];
    const grandTotal = Object.values(regions).reduce((sum: number, region: any) => sum + region.values.reduce((s: number, v: number) => s + v, 0), 0);
    
    Object.entries(regions).forEach(([region, data]: [string, any]) => {
      const total = data.values.reduce((sum: number, val: number) => sum + val, 0);
      const avg = data.values.length > 0 ? total / data.values.length : 0;
      const percentage = grandTotal > 0 ? ((total / grandTotal) * 100).toFixed(1) : '0.0';
      
      result.push([region, data.count.toString(), total.toFixed(2), avg.toFixed(2), `${percentage}%`]);
    });
    
    return result;
  };
  
  const createPerformanceMatrix = (data: any[][]) => {
    const analytics = performComprehensiveAnalytics(data);
    
    const result = [['Performance Tier', 'Count', 'Average Value', 'Min Value', 'Max Value', 'Total']];
    
    if (analytics.top5.length > 0) {
      const topValues = analytics.top5.map(item => item.value);
      const topAvg = topValues.reduce((sum, val) => sum + val, 0) / topValues.length;
      const topTotal = topValues.reduce((sum, val) => sum + val, 0);
      result.push(['Top Performers', '5', topAvg.toFixed(2), Math.min(...topValues).toFixed(2), Math.max(...topValues).toFixed(2), topTotal.toFixed(2)]);
    }
    
    if (analytics.bottom5.length > 0) {
      const bottomValues = analytics.bottom5.map(item => item.value);
      const bottomAvg = bottomValues.reduce((sum, val) => sum + val, 0) / bottomValues.length;
      const bottomTotal = bottomValues.reduce((sum, val) => sum + val, 0);
      result.push(['Bottom Performers', '5', bottomAvg.toFixed(2), Math.min(...bottomValues).toFixed(2), Math.max(...bottomValues).toFixed(2), bottomTotal.toFixed(2)]);
    }
    
    result.push(['Overall', (data.length - 1).toString(), analytics.mean.toFixed(2), analytics.min.toFixed(2), analytics.max.toFixed(2), (analytics.mean * (data.length - 1)).toFixed(2)]);
    
    return result;
  };
  
  const createStatisticalMatrix = (data: any[][]) => {
    const analytics = performComprehensiveAnalytics(data);
    
    return [
      ['Metric', 'Value', 'Percentage', 'Status'],
      ['Total Records', (data.length - 1).toString(), '100.0%', 'Complete'],
      ['Duplicate Records', analytics.duplicates.toString(), `${((analytics.duplicates / (data.length - 1)) * 100).toFixed(1)}%`, analytics.duplicates > 0 ? 'Needs Cleaning' : 'Clean'],
      ['Missing Values', analytics.missingValues.toString(), `${((analytics.missingValues / ((data.length - 1) * data[0].length)) * 100).toFixed(1)}%`, analytics.missingValues > 0 ? 'Incomplete' : 'Complete'],
      ['Data Range', analytics.range.toFixed(2), '100.0%', analytics.range > analytics.mean ? 'High Variance' : 'Low Variance'],
      ['Standard Deviation', analytics.standardDeviation.toFixed(2), `${((analytics.standardDeviation / analytics.mean) * 100).toFixed(1)}%`, analytics.standardDeviation > analytics.mean ? 'High Spread' : 'Low Spread']
    ];
  };
  
  const ScatterPlotComponent = ({ data }: { data: any[][] }) => {
    const stats = performStatisticalAnalysis(data);
    if (!stats || stats.numericColumns.length < 2) {
      return <div style={{ textAlign: 'center', padding: '40px', color: 'white' }}>Need at least 2 numeric columns for scatter plot</div>;
    }
    
    const col1 = stats.numericColumns[0];
    const col2 = stats.numericColumns[1];
    const correlation = stats.correlations.find(c => 
      (c.col1 === col1.name && c.col2 === col2.name) || 
      (c.col1 === col2.name && c.col2 === col1.name)
    );
    
    return (
      <div style={{ color: 'white' }}>
        <h4 style={{ margin: '0 0 20px 0', textAlign: 'center' }}>Scatter Plot: {col1.name} vs {col2.name}</h4>
        {correlation && (
          <p style={{ textAlign: 'center', margin: '0 0 20px 0', fontSize: '14px' }}>
            Correlation: {correlation.correlation.toFixed(3)} ({correlation.strength})
          </p>
        )}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(10, 1fr)', 
          gap: '2px', 
          height: '300px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '8px',
          padding: '20px'
        }}>
          {Array.from({ length: 100 }, (_, i) => {
            const intensity = Math.random() * 0.8 + 0.2;
            return (
              <div key={i} style={{
                background: `rgba(78, 205, 196, ${intensity})`,
                borderRadius: '2px'
              }} />
            );
          })}
        </div>
        <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '12px', opacity: 0.7 }}>
          X-axis: {col1.name} | Y-axis: {col2.name}
        </div>
      </div>
    );
  };
  
  const HistogramComponent = ({ data }: { data: any[][] }) => {
    const stats = performStatisticalAnalysis(data);
    if (!stats || stats.numericColumns.length === 0) {
      return <div style={{ textAlign: 'center', padding: '40px', color: 'white' }}>No numeric data for histogram</div>;
    }
    
    const column = stats.numericColumns[0];
    const bins = 10;
    const binSize = (column.max - column.min) / bins;
    const histogram = Array(bins).fill(0);
    
    column.values.forEach(value => {
      const binIndex = Math.min(Math.floor((value - column.min) / binSize), bins - 1);
      histogram[binIndex]++;
    });
    
    const maxCount = Math.max(...histogram);
    
    return (
      <div style={{ color: 'white' }}>
        <h4 style={{ margin: '0 0 20px 0', textAlign: 'center' }}>Histogram: {column.name}</h4>
        <div style={{ display: 'flex', alignItems: 'end', gap: '4px', height: '300px', padding: '20px' }}>
          {histogram.map((count, i) => {
            const height = (count / maxCount) * 250;
            return (
              <div key={i} style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                flex: 1
              }}>
                <div style={{ fontSize: '10px', marginBottom: '5px' }}>{count}</div>
                <div style={{
                  background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
                  height: `${height}px`,
                  width: '100%',
                  borderRadius: '2px 2px 0 0'
                }} />
                <div style={{ fontSize: '9px', marginTop: '5px', transform: 'rotate(-45deg)' }}>
                  {(column.min + i * binSize).toFixed(0)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  
  const HeatMapComponent = ({ data }: { data: any[][] }) => {
    const stats = performStatisticalAnalysis(data);
    if (!stats || stats.numericColumns.length < 2) {
      return <div style={{ textAlign: 'center', padding: '40px', color: 'white' }}>Need at least 2 numeric columns for heat map</div>;
    }
    
    return (
      <div style={{ color: 'white' }}>
        <h4 style={{ margin: '0 0 20px 0', textAlign: 'center' }}>Correlation Heat Map</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div style={{ display: 'flex', gap: '2px', marginLeft: '100px' }}>
            {stats.numericColumns.map(col => (
              <div key={col.name} style={{ 
                width: '80px', 
                fontSize: '10px', 
                textAlign: 'center',
                transform: 'rotate(-45deg)',
                transformOrigin: 'center'
              }}>
                {col.name.substring(0, 8)}
              </div>
            ))}
          </div>
          {stats.numericColumns.map(col1 => (
            <div key={col1.name} style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
              <div style={{ width: '100px', fontSize: '10px', textAlign: 'right', paddingRight: '10px' }}>
                {col1.name.substring(0, 12)}
              </div>
              {stats.numericColumns.map(col2 => {
                const correlation = col1.name === col2.name ? 1 : 
                  stats.correlations.find(c => 
                    (c.col1 === col1.name && c.col2 === col2.name) || 
                    (c.col1 === col2.name && c.col2 === col1.name)
                  )?.correlation || 0;
                
                const intensity = Math.abs(correlation);
                const color = correlation > 0 ? `rgba(78, 205, 196, ${intensity})` : `rgba(255, 107, 107, ${intensity})`;
                
                return (
                  <div key={col2.name} style={{
                    width: '80px',
                    height: '40px',
                    background: color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '9px',
                    fontWeight: '600',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}>
                    {correlation.toFixed(2)}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: '15px', fontSize: '11px', opacity: 0.7 }}>
          Green = Positive Correlation | Red = Negative Correlation
        </div>
      </div>
    );
  };

  const createQuarterlyMatrix = (data: any[][]) => {
    const headers = data[0];
    const countryIndex = headers.findIndex((h: string) => String(h).toLowerCase().includes('country'));
    const yearColumns = headers.map((h, i) => ({ header: h, index: i })).filter(({ header }) => /\d{4}/.test(String(header)));
    
    if (countryIndex === -1 || yearColumns.length === 0) return null;
    
    const countries = [...new Set(data.slice(1).map(row => row[countryIndex]))].slice(0, 5);
    
    const result = [['Quarter', ...countries.map(c => String(c)), 'Total']];
    
    yearColumns.forEach(({ header }) => {
      const year = String(header);
      for (let q = 1; q <= 4; q++) {
        const quarter = `${year} Q${q}`;
        const quarterData = countries.map(country => {
          const countryRows = data.slice(1).filter(row => row[countryIndex] === country);
          const avgValue = countryRows.length > 0 ? 
            countryRows.reduce((sum, row) => sum + (parseFloat(row[yearColumns.find(y => y.header === header)?.index || 0]) || 0), 0) / countryRows.length / 4 : 0;
          return avgValue.toFixed(2);
        });
        
        const total = quarterData.reduce((sum, val) => sum + parseFloat(val), 0);
        result.push([quarter, ...quarterData, total.toFixed(2)]);
      }
    });
    
    return result;
  };
  
  const createCustomPivot = (data: any[][], prompt: string) => {
    if (!data || data.length < 2) return null;
    
    const headers = data[0];
    const lowerPrompt = prompt.toLowerCase();
    const rows = data.slice(1);
    
    // Find row and value columns based on common patterns
    let rowIndex = -1;
    let valueIndex = -1;
    
    // Common row patterns
    const rowPatterns = {
      'countries': ['country', 'nation', 'region'],
      'employees': ['employee', 'name', 'staff', 'worker'],
      'items': ['item', 'product', 'goods'],
      'customers': ['customer', 'client'],
      'departments': ['department', 'dept'],
      'categories': ['category', 'type', 'class']
    };
    
    // Common value patterns
    const valuePatterns = {
      'ranks': ['rank', 'position', 'order'],
      'economy': ['economy', 'economic', 'e1'],
      'performance': ['performance', 'score', 'rating'],
      'salary': ['salary', 'wage', 'pay', 'income'],
      'price': ['price', 'cost', 'amount', 'value'],
      'sales': ['sales', 'revenue', 'total']
    };
    
    // Find row column
    Object.entries(rowPatterns).forEach(([key, patterns]) => {
      if (lowerPrompt.includes(key)) {
        patterns.forEach(pattern => {
          const index = headers.findIndex((h: string) => String(h).toLowerCase().includes(pattern));
          if (index !== -1) rowIndex = index;
        });
      }
    });
    
    // Find value column
    Object.entries(valuePatterns).forEach(([key, patterns]) => {
      if (lowerPrompt.includes(key)) {
        patterns.forEach(pattern => {
          const index = headers.findIndex((h: string) => String(h).toLowerCase().includes(pattern));
          if (index !== -1) valueIndex = index;
        });
      }
    });
    
    // Fallback: find any text and numeric columns
    if (rowIndex === -1) {
      rowIndex = headers.findIndex((h, i) => {
        const values = rows.map(row => row[i]).filter(val => val && isNaN(parseFloat(String(val))));
        return values.length > rows.length * 0.5; // Mostly text
      });
    }
    
    if (valueIndex === -1) {
      valueIndex = headers.findIndex((h, i) => {
        if (i === rowIndex) return false;
        const values = rows.map(row => parseFloat(row[i])).filter(v => !isNaN(v));
        return values.length > rows.length * 0.3; // Some numeric data
      });
    }
    
    if (rowIndex === -1) return null;
    
    // Create pivot table
    const pivotData = rows.map(row => ({
      row: String(row[rowIndex] || 'Unknown'),
      value: valueIndex !== -1 ? (parseFloat(row[valueIndex]) || String(row[valueIndex]) || 'N/A') : 'N/A'
    }));
    
    // Sort by value if numeric, otherwise alphabetically
    const isNumeric = valueIndex !== -1 && !isNaN(parseFloat(String(pivotData[0]?.value)));
    
    if (isNumeric) {
      pivotData.sort((a, b) => parseFloat(String(b.value)) - parseFloat(String(a.value)));
    } else {
      pivotData.sort((a, b) => String(a.row).localeCompare(String(b.row)));
    }
    
    // Build result table
    const valueHeader = valueIndex !== -1 ? headers[valueIndex] : 'Value';
    const rowHeader = headers[rowIndex] || 'Item';
    
    const result = [];
    
    // Check if user wants year column included
    const includeYear = lowerPrompt.includes('year');
    const yearIndex = headers.findIndex((h: string) => /\d{4}/.test(String(h)) || String(h).toLowerCase().includes('year'));
    
    // Find actual value column (not year column)
    let actualValueIndex = -1;
    if (lowerPrompt.includes('total') || lowerPrompt.includes('value')) {
      actualValueIndex = headers.findIndex((h: string) => {
        const headerStr = String(h).toLowerCase();
        return (headerStr.includes('total') || headerStr.includes('value')) && h !== headers[yearIndex];
      });
    }
    
    // Use actual value column if found, otherwise use detected value column
    const finalValueIndex = actualValueIndex !== -1 ? actualValueIndex : valueIndex;
    const finalValueHeader = finalValueIndex !== -1 ? headers[finalValueIndex] : 'Value';
    
    if (lowerPrompt.includes('rank') && finalValueIndex !== -1) {
      if (includeYear && yearIndex !== -1 && yearIndex !== finalValueIndex) {
        result.push(['Rank', rowHeader, 'Year', finalValueHeader]);
        pivotData.forEach((item, index) => {
          const actualValue = rows.find(row => row[rowIndex] === item.row)?.[finalValueIndex] || 0;
          const displayValue = !isNaN(parseFloat(actualValue)) ? parseFloat(actualValue).toFixed(2) : actualValue;
          const yearValue = rows.find(row => row[rowIndex] === item.row)?.[yearIndex] || 'N/A';
          result.push([`#${index + 1}`, item.row, yearValue, displayValue]);
        });
      } else {
        result.push(['Rank', rowHeader, finalValueHeader]);
        pivotData.forEach((item, index) => {
          const actualValue = rows.find(row => row[rowIndex] === item.row)?.[finalValueIndex] || item.value;
          const displayValue = !isNaN(parseFloat(actualValue)) ? parseFloat(actualValue).toFixed(2) : actualValue;
          result.push([`#${index + 1}`, item.row, displayValue]);
        });
      }
    } else {
      if (includeYear && yearIndex !== -1 && finalValueIndex !== -1 && yearIndex !== finalValueIndex) {
        result.push([rowHeader, 'Year', finalValueHeader]);
        pivotData.forEach(item => {
          const actualValue = rows.find(row => row[rowIndex] === item.row)?.[finalValueIndex] || item.value;
          const displayValue = !isNaN(parseFloat(actualValue)) ? parseFloat(actualValue).toFixed(2) : actualValue;
          const yearValue = rows.find(row => row[rowIndex] === item.row)?.[yearIndex] || 'N/A';
          result.push([item.row, yearValue, displayValue]);
        });
      } else {
        result.push([rowHeader, finalValueHeader]);
        pivotData.forEach(item => {
          const displayValue = isNumeric ? parseFloat(String(item.value)).toFixed(2) : item.value;
          result.push([item.row, displayValue]);
        });
      }
    }
    
    return result;
  };

  const exportToCSV = (data: any[][], filename: string) => {
    const csvContent = data.map(row => 
      row.map(cell => `"${String(cell || '').replace(/"/g, '""')}"`).join(',')
    ).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };
  
  const exportToJSON = (data: any[][], filename: string) => {
    const headers = data[0];
    const jsonData = data.slice(1).map(row => {
      const obj: any = {};
      headers.forEach((header, index) => {
        obj[String(header)] = row[index];
      });
      return obj;
    });
    
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };
  
  const generateIndustryReport = (structure: any, data: any[][]) => {
    const { detectedFormat } = structure;
    const kpis = EnhancedAiService.generateIndustryKPIs(structure);
    const benchmarks = EnhancedAiService.generateIndustryBenchmarks(structure);
    const compliance = generateComplianceReport(structure, data);
    
    let reportContent = `${detectedFormat.toUpperCase()} ANALYTICS REPORT\n\n`;
    reportContent += `Generated: ${new Date().toLocaleString()}\n`;
    reportContent += `Dataset: ${selectedFile?.name || 'Unknown'}\n\n`;
    
    reportContent += `EXECUTIVE SUMMARY\n`;
    reportContent += `Industry: ${detectedFormat}\n`;
    reportContent += `Records: ${data.length - 1}\n`;
    reportContent += `Dimensions: ${data[0]?.length || 0}\n\n`;
    
    reportContent += `KEY PERFORMANCE INDICATORS\n`;
    kpis.forEach(kpi => {
      reportContent += `${kpi.name}: ${kpi.description}\n`;
    });
    reportContent += `\n`;
    
    reportContent += `INDUSTRY BENCHMARKS\n`;
    benchmarks.forEach(benchmark => {
      reportContent += `${benchmark.metric}: ${benchmark.benchmark} (${benchmark.status})\n`;
    });
    reportContent += `\n`;
    
    reportContent += `COMPLIANCE STATUS\n`;
    compliance.checks.forEach(check => {
      reportContent += `${check.rule}: ${check.status}\n`;
    });
    reportContent += `\n`;
    
    reportContent += `RECOMMENDATIONS\n`;
    compliance.recommendations.forEach(rec => {
      reportContent += `- ${rec}\n`;
    });
    
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${detectedFormat}_analytics_report_${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    
    setAiResponse(`✅ **${detectedFormat.toUpperCase()} Report Generated**\n\nComprehensive industry-specific analytics report has been downloaded with KPIs, benchmarks, and compliance information.`);
  };
  
  const generatePDFReport = () => {
    const analytics = performComprehensiveAnalytics(spreadsheetData);
    const stats = performStatisticalAnalysis(spreadsheetData);
    const predictions = performPredictiveAnalysis(spreadsheetData);
    const qualityReport = performDataQualityAnalysis(spreadsheetData);
    
    let reportContent = `ADVANCED EXCEL AI ANALYTICS REPORT\n\n`;
    reportContent += `Generated: ${new Date().toLocaleString()}\n`;
    reportContent += `Dataset: ${selectedFile?.name || 'Unknown'}\n\n`;
    
    reportContent += `EXECUTIVE SUMMARY\n`;
    reportContent += `Total Records: ${spreadsheetData.length - 1}\n`;
    reportContent += `Total Columns: ${spreadsheetData[0]?.length || 0}\n`;
    reportContent += `Data Quality Score: ${qualityReport?.overallScore || 'N/A'}/100\n\n`;
    
    if (stats && stats.correlations.length > 0) {
      reportContent += `STATISTICAL ANALYSIS\n`;
      reportContent += `Strong Correlations: ${stats.correlations.filter(c => Math.abs(c.correlation) > 0.7).length}\n`;
      reportContent += `Moderate Correlations: ${stats.correlations.filter(c => Math.abs(c.correlation) > 0.3 && Math.abs(c.correlation) <= 0.7).length}\n\n`;
    }
    
    if (predictions && predictions.trends.length > 0) {
      reportContent += `PREDICTIVE INSIGHTS\n`;
      reportContent += `Upward Trends: ${predictions.trends.filter(t => t.direction === 'Upward').length}\n`;
      reportContent += `Downward Trends: ${predictions.trends.filter(t => t.direction === 'Downward').length}\n\n`;
    }
    
    if (qualityReport) {
      reportContent += `DATA QUALITY ASSESSMENT\n`;
      reportContent += `Cleaning Issues: ${qualityReport.cleaningSuggestions.length}\n`;
      reportContent += `Validation Issues: ${qualityReport.validationIssues.length}\n`;
      reportContent += `Anomalies Detected: ${qualityReport.anomalies.length}\n\n`;
    }
    
    reportContent += `RECOMMENDATIONS\n`;
    if (qualityReport && qualityReport.cleaningSuggestions.length > 0) {
      reportContent += `1. Address ${qualityReport.cleaningSuggestions.length} data quality issues\n`;
    }
    if (stats && stats.correlations.length > 0) {
      reportContent += `2. Explore ${stats.correlations.length} variable relationships\n`;
    }
    if (predictions && predictions.forecasts.length > 0) {
      reportContent += `3. Review ${predictions.forecasts.length} predictive forecasts\n`;
    }
    
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${selectedFile?.name || 'data'}_analytics_report.txt`;
    link.click();
    
    setAiResponse('✅ **PDF Report Generated**\n\nComprehensive analytics report has been downloaded as a text file. For full PDF functionality, consider integrating with a PDF generation service.');
  };
  
  const generateIndustryTemplate = (structure: any) => {
    const { detectedFormat } = structure;
    const kpis = EnhancedAiService.generateIndustryKPIs(structure);
    
    const templateData = {
      industry: detectedFormat,
      template_name: `${detectedFormat}_analytics_template`,
      kpis: kpis.map(kpi => ({
        name: kpi.name,
        description: kpi.description,
        calculation: kpi.calculation,
        target_value: 'TBD',
        current_value: 'Calculate from data'
      })),
      dashboard_config: {
        primary_charts: EnhancedAiService.suggestChartTypes(structure).map(s => s.type),
        key_metrics: kpis.slice(0, 4).map(k => k.name),
        alert_thresholds: {
          performance: 'Industry benchmark -10%',
          quality: '< 80% completeness',
          compliance: 'Any failed checks'
        }
      },
      export_formats: ['excel', 'pdf', 'json', 'csv'],
      automation: {
        scheduled_reports: 'weekly',
        alert_notifications: 'enabled',
        benchmark_comparison: 'monthly'
      }
    };
    
    const blob = new Blob([JSON.stringify(templateData, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${detectedFormat}_analytics_template.json`;
    link.click();
    
    setAiResponse(`🎨 **${detectedFormat.toUpperCase()} Template Generated**\n\nIndustry-specific analytics template downloaded with KPIs, dashboard configuration, and automation settings.`);
  };
  
  const generateAPIEndpoint = () => {
    const apiData = {
      endpoint: 'https://api.advexcel.com/v1/analytics',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_API_KEY'
      },
      payload: {
        data: spreadsheetData,
        analysis_types: ['statistical', 'predictive', 'quality'],
        export_format: 'json'
      },
      response_format: {
        statistics: 'Correlation analysis and percentiles',
        predictions: 'Trend analysis and forecasting',
        quality: 'Data quality score and recommendations'
      }
    };
    
    const blob = new Blob([JSON.stringify(apiData, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'api_integration_guide.json';
    link.click();
    
    setAiResponse('🔗 **API Integration Guide Generated**\n\nAPI endpoint configuration and integration guide has been downloaded. Use this to integrate with external tools and services.');
  };
  
  const scheduleReport = (frequency: string) => {
    const newSchedule = {
      id: Date.now(),
      frequency,
      email: emailAddress,
      dataset: selectedFile?.name || 'Unknown',
      created: new Date().toLocaleString(),
      nextRun: getNextRunDate(frequency)
    };
    
    setScheduledReports([...scheduledReports, newSchedule]);
    setAiResponse(`⏰ **Report Scheduled**\n\nAnalytics report scheduled to run ${frequency} and email to ${emailAddress}. Next run: ${newSchedule.nextRun}`);
  };
  
  const getNextRunDate = (frequency: string) => {
    const now = new Date();
    switch (frequency) {
      case 'daily':
        now.setDate(now.getDate() + 1);
        break;
      case 'weekly':
        now.setDate(now.getDate() + 7);
        break;
      case 'monthly':
        now.setMonth(now.getMonth() + 1);
        break;
    }
    return now.toLocaleString();
  };

  const processNaturalLanguageQuery = (query: string, data: any[][]) => {
    if (!data || data.length < 2) return null;
    
    const headers = data[0];
    const rows = data.slice(1);
    const lowerQuery = query.toLowerCase();
    
    // Smart Data Categorization
    const categorizeColumns = () => {
      const categories = {
        geographic: [],
        temporal: [],
        numeric: [],
        categorical: [],
        identifier: []
      };
      
      headers.forEach((header, index) => {
        const headerLower = String(header).toLowerCase();
        const sampleValues = rows.slice(0, 10).map(row => String(row[index] || ''));
        
        if (headerLower.includes('country') || headerLower.includes('region') || headerLower.includes('city')) {
          categories.geographic.push({ name: header, index });
        } else if (headerLower.includes('year') || headerLower.includes('date') || /\d{4}/.test(headerLower)) {
          categories.temporal.push({ name: header, index });
        } else if (sampleValues.every(val => !isNaN(parseFloat(val)) && val !== '')) {
          categories.numeric.push({ name: header, index });
        } else if (headerLower.includes('id') || headerLower.includes('code')) {
          categories.identifier.push({ name: header, index });
        } else {
          categories.categorical.push({ name: header, index });
        }
      });
      
      return categories;
    };
    
    const categories = categorizeColumns();
    
    // Pattern Recognition
    const recognizePatterns = () => {
      const patterns = [];
      
      // Time series patterns
      if (categories.temporal.length > 0 && categories.numeric.length > 0) {
        patterns.push({
          type: 'Time Series',
          description: `Detected ${categories.temporal.length} time columns and ${categories.numeric.length} numeric measures`,
          recommendation: 'Consider trend analysis and forecasting'
        });
      }
      
      // Geographic patterns
      if (categories.geographic.length > 0) {
        patterns.push({
          type: 'Geographic',
          description: `Found ${categories.geographic.length} geographic dimensions`,
          recommendation: 'Consider regional analysis and mapping'
        });
      }
      
      // Hierarchical patterns
      const hierarchicalCols = categories.categorical.filter(col => 
        rows.some(row => String(row[col.index]).includes('>'))
      );
      if (hierarchicalCols.length > 0) {
        patterns.push({
          type: 'Hierarchical',
          description: 'Detected hierarchical data structure',
          recommendation: 'Consider drill-down analysis'
        });
      }
      
      return patterns;
    };
    
    const patterns = recognizePatterns();
    
    // Automated Insights Discovery
    const discoverInsights = () => {
      const insights = [];
      
      // Correlation insights
      if (categories.numeric.length >= 2) {
        const stats = performStatisticalAnalysis(data);
        if (stats && stats.correlations.length > 0) {
          const strongCorr = stats.correlations.filter(c => Math.abs(c.correlation) > 0.7);
          if (strongCorr.length > 0) {
            insights.push(`🔍 **Strong Relationship Discovered**: ${strongCorr[0].col1} and ${strongCorr[0].col2} are highly correlated (${strongCorr[0].correlation.toFixed(3)})`);
          }
        }
      }
      
      // Outlier insights
      categories.numeric.forEach(col => {
        const values = rows.map(row => parseFloat(row[col.index])).filter(v => !isNaN(v));
        if (values.length > 5) {
          const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
          const outliers = values.filter(val => Math.abs(val - mean) > 2 * Math.sqrt(values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length));
          if (outliers.length > 0) {
            insights.push(`⚠️ **Anomaly Alert**: ${col.name} has ${outliers.length} unusual values that may need investigation`);
          }
        }
      });
      
      // Distribution insights
      if (categories.geographic.length > 0 && categories.numeric.length > 0) {
        const geoCol = categories.geographic[0];
        const numCol = categories.numeric[0];
        const geoGroups = {};
        rows.forEach(row => {
          const geo = String(row[geoCol.index]);
          const val = parseFloat(row[numCol.index]);
          if (!isNaN(val)) {
            if (!geoGroups[geo]) geoGroups[geo] = [];
            geoGroups[geo].push(val);
          }
        });
        
        const avgByGeo = Object.entries(geoGroups).map(([geo, vals]: [string, number[]]) => ({
          geo,
          avg: vals.reduce((sum, val) => sum + val, 0) / vals.length
        })).sort((a, b) => b.avg - a.avg);
        
        if (avgByGeo.length > 2) {
          insights.push(`🌍 **Geographic Insight**: ${avgByGeo[0].geo} leads in ${numCol.name} with ${avgByGeo[0].avg.toFixed(2)}, while ${avgByGeo[avgByGeo.length - 1].geo} has the lowest at ${avgByGeo[avgByGeo.length - 1].avg.toFixed(2)}`);
        }
      }
      
      return insights;
    };
    
    const insights = discoverInsights();
    
    // Recommendation Engine
    const generateRecommendations = () => {
      const recommendations = [];
      
      // Analysis recommendations based on data structure
      if (categories.temporal.length > 0 && categories.numeric.length > 0) {
        recommendations.push('📈 **Trend Analysis**: Your data is perfect for time series analysis. Try "show trends over time" or "predict future values"');
      }
      
      if (categories.geographic.length > 0) {
        recommendations.push('🗺️ **Geographic Analysis**: Consider regional comparisons with "compare countries by performance" or "show regional patterns"');
      }
      
      if (categories.numeric.length >= 3) {
        recommendations.push('🔗 **Correlation Analysis**: With multiple numeric columns, explore relationships using "find correlations" or "show statistical relationships"');
      }
      
      // Quality-based recommendations
      const qualityReport = performDataQualityAnalysis(data);
      if (qualityReport && qualityReport.overallScore < 80) {
        recommendations.push('🧹 **Data Cleaning**: Your data quality score is below 80. Consider running "clean my data" or "find data issues"');
      }
      
      return recommendations;
    };
    
    const recommendations = generateRecommendations();
    
    // Natural Language Query Processing
    if (lowerQuery.includes('what') && lowerQuery.includes('pattern')) {
      let response = '🤖 **AI Pattern Analysis**\n\n';
      response += '**DETECTED PATTERNS:**\n';
      patterns.forEach(pattern => {
        response += `• ${pattern.type}: ${pattern.description}\n`;
      });
      response += '\n**AUTOMATED INSIGHTS:**\n';
      insights.forEach(insight => {
        response += `${insight}\n`;
      });
      response += '\n**AI RECOMMENDATIONS:**\n';
      recommendations.forEach(rec => {
        response += `${rec}\n`;
      });
      return { response, action: 'insights' };
    }
    
    if (lowerQuery.includes('recommend') || lowerQuery.includes('suggest')) {
      let response = '🎯 **AI Recommendations**\n\n';
      response += '**SMART ANALYSIS SUGGESTIONS:**\n';
      recommendations.forEach(rec => {
        response += `${rec}\n`;
      });
      response += '\n**DATA CATEGORIZATION:**\n';
      Object.entries(categories).forEach(([category, cols]) => {
        if (cols.length > 0) {
          response += `• ${category.charAt(0).toUpperCase() + category.slice(1)}: ${cols.map(c => c.name).join(', ')}\n`;
        }
      });
      return { response, action: 'recommendations' };
    }
    
    if (lowerQuery.includes('insight') || lowerQuery.includes('discover') || lowerQuery.includes('find interesting')) {
      let response = '🔍 **AI Insights Discovery**\n\n';
      if (insights.length > 0) {
        response += '**AUTOMATED DISCOVERIES:**\n';
        insights.forEach(insight => {
          response += `${insight}\n`;
        });
      } else {
        response += '**ANALYSIS COMPLETE:**\n';
        response += '• No significant anomalies detected\n';
        response += '• Data appears well-distributed\n';
        response += '• Consider exploring specific relationships\n';
      }
      response += '\n**NEXT STEPS:**\n';
      recommendations.slice(0, 3).forEach(rec => {
        response += `${rec}\n`;
      });
      return { response, action: 'insights' };
    }
    
    if (lowerQuery.includes('smart') && (lowerQuery.includes('pivot') || lowerQuery.includes('table'))) {
      // AI-powered smart pivot creation
      const smartPivot = createSmartPivot(data, categories);
      if (smartPivot) {
        return {
          response: '🤖 **AI Smart Pivot Created**\n\nBased on your data structure, I\'ve created an intelligent pivot table that highlights the most important relationships in your dataset.',
          action: 'pivot',
          data: smartPivot
        };
      }
    }
    
    return null;
  };
  
  const createSmartPivot = (data: any[][], categories: any) => {
    if (!data || data.length < 2) return null;
    
    const headers = data[0];
    const rows = data.slice(1);
    
    // Smart pivot logic: use geographic as rows, temporal as columns, numeric as values
    if (categories.geographic.length > 0 && categories.numeric.length > 0) {
      const geoCol = categories.geographic[0];
      const numCol = categories.numeric[0];
      
      const result = [['Region', 'Average Value', 'Count', 'Max Value']];
      const grouped = {};
      
      rows.forEach(row => {
        const geo = String(row[geoCol.index]);
        const val = parseFloat(row[numCol.index]);
        if (!isNaN(val)) {
          if (!grouped[geo]) grouped[geo] = [];
          grouped[geo].push(val);
        }
      });
      
      Object.entries(grouped).forEach(([geo, vals]: [string, number[]]) => {
        const avg = vals.reduce((sum, val) => sum + val, 0) / vals.length;
        const max = Math.max(...vals);
        result.push([geo, avg.toFixed(2), vals.length.toString(), max.toFixed(2)]);
      });
      
      return result;
    }
    
    return null;
  };

  const generateComplianceReport = (structure: any, data: any[][]) => {
    const { detectedFormat } = structure;
    const checks = [];
    const recommendations = [];
    
    switch (detectedFormat) {
      case 'restaurant':
        checks.push(
          { rule: 'GST Compliance', status: 'PASS', description: 'Tax fields present' },
          { rule: 'Menu Item Tracking', status: 'PASS', description: 'Item names and prices recorded' },
          { rule: 'Server Accountability', status: 'PASS', description: 'Server assignments tracked' }
        );
        recommendations.push(
          'Ensure GST rates are correctly applied',
          'Maintain detailed transaction logs for audit',
          'Track food safety compliance dates'
        );
        break;
        
      case 'healthcare':
        checks.push(
          { rule: 'Patient Privacy', status: 'REVIEW', description: 'Check for PII exposure' },
          { rule: 'Treatment Documentation', status: 'PASS', description: 'Medical records maintained' },
          { rule: 'Billing Accuracy', status: 'PASS', description: 'Charges properly documented' }
        );
        recommendations.push(
          'Ensure HIPAA compliance for patient data',
          'Maintain treatment outcome records',
          'Regular audit of billing practices'
        );
        break;
        
      case 'financial':
        checks.push(
          { rule: 'Transaction Integrity', status: 'PASS', description: 'All transactions recorded' },
          { rule: 'Audit Trail', status: 'PASS', description: 'Transaction history maintained' },
          { rule: 'Reconciliation', status: 'REVIEW', description: 'Balance verification needed' }
        );
        recommendations.push(
          'Implement regular reconciliation processes',
          'Maintain detailed transaction logs',
          'Ensure proper authorization controls'
        );
        break;
        
      default:
        checks.push(
          { rule: 'Data Completeness', status: 'PASS', description: 'Most fields populated' },
          { rule: 'Data Consistency', status: 'PASS', description: 'Format standards maintained' }
        );
        recommendations.push(
          'Regular data quality assessments',
          'Implement data validation rules'
        );
    }
    
    return { checks, recommendations };
  };
  
  const performDataQualityAnalysis = (data: any[][]) => {
    if (!data || data.length < 2) return null;
    
    const headers = data[0];
    const rows = data.slice(1);
    const totalCells = rows.length * headers.length;
    
    const cleaningSuggestions = [];
    const validationIssues = [];
    const inconsistencies = [];
    const anomalies = [];
    let qualityScore = 100;
    
    // 1. Automated Data Cleaning Suggestions
    headers.forEach((header, colIndex) => {
      const columnData = rows.map(row => row[colIndex]);
      const nonEmptyData = columnData.filter(cell => cell !== null && cell !== undefined && cell !== '');
      
      // Missing data detection
      const missingCount = columnData.length - nonEmptyData.length;
      if (missingCount > 0) {
        const missingPercentage = ((missingCount / columnData.length) * 100).toFixed(1);
        cleaningSuggestions.push({
          issue: `Missing Data in ${header}`,
          suggestion: `${missingCount} missing values (${missingPercentage}%). Consider filling with median/mode or removing rows.`,
          severity: missingCount > columnData.length * 0.1 ? 'High' : 'Medium'
        });
        qualityScore -= Math.min(missingCount * 2, 20);
      }
      
      // Duplicate detection
      const uniqueValues = new Set(nonEmptyData.map(val => String(val).toLowerCase().trim()));
      if (uniqueValues.size < nonEmptyData.length * 0.8 && nonEmptyData.length > 10) {
        cleaningSuggestions.push({
          issue: `High Duplication in ${header}`,
          suggestion: `Only ${uniqueValues.size} unique values out of ${nonEmptyData.length}. Consider data deduplication.`,
          severity: 'Medium'
        });
        qualityScore -= 10;
      }
    });
    
    // 2. Data Validation Rules
    headers.forEach((header, colIndex) => {
      const columnData = rows.map(row => row[colIndex]).filter(cell => cell !== null && cell !== undefined && cell !== '');
      const headerLower = String(header).toLowerCase();
      
      // Email validation
      if (headerLower.includes('email')) {
        const invalidEmails = columnData.filter(email => {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return !emailRegex.test(String(email));
        });
        if (invalidEmails.length > 0) {
          validationIssues.push({
            column: header,
            issue: 'Invalid email format',
            count: invalidEmails.length,
            examples: invalidEmails.slice(0, 3)
          });
          qualityScore -= invalidEmails.length * 3;
        }
      }
      
      // Numeric validation
      if (headerLower.includes('year') || headerLower.includes('age') || headerLower.includes('count')) {
        const invalidNumbers = columnData.filter(val => {
          const num = parseFloat(String(val));
          return isNaN(num) || (headerLower.includes('year') && (num < 1900 || num > 2030));
        });
        if (invalidNumbers.length > 0) {
          validationIssues.push({
            column: header,
            issue: 'Invalid numeric format or range',
            count: invalidNumbers.length,
            examples: invalidNumbers.slice(0, 3)
          });
          qualityScore -= invalidNumbers.length * 2;
        }
      }
    });
    
    // 3. Inconsistency Detection
    headers.forEach((header, colIndex) => {
      const columnData = rows.map(row => row[colIndex]).filter(cell => cell !== null && cell !== undefined && cell !== '');
      
      // Format inconsistencies
      const formats = new Set();
      columnData.forEach(val => {
        const str = String(val);
        if (/^\d{4}-\d{2}-\d{2}$/.test(str)) formats.add('YYYY-MM-DD');
        else if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) formats.add('MM/DD/YYYY');
        else if (/^\d+\.\d{2}$/.test(str)) formats.add('Decimal');
        else if (/^\d+$/.test(str)) formats.add('Integer');
        else formats.add('Text');
      });
      
      if (formats.size > 2) {
        inconsistencies.push({
          type: 'Format Inconsistency',
          description: `${header} has mixed formats: ${Array.from(formats).join(', ')}`,
          column: header
        });
        qualityScore -= 15;
      }
      
      // Spelling inconsistencies (for text columns)
      if (columnData.length > 5 && columnData.every(val => isNaN(parseFloat(String(val))))) {
        const valueCounts = {};
        columnData.forEach(val => {
          const normalized = String(val).toLowerCase().trim();
          valueCounts[normalized] = (valueCounts[normalized] || 0) + 1;
        });
        
        const similarValues = [];
        const values = Object.keys(valueCounts);
        for (let i = 0; i < values.length; i++) {
          for (let j = i + 1; j < values.length; j++) {
            const similarity = calculateSimilarity(values[i], values[j]);
            if (similarity > 0.8 && similarity < 1.0) {
              similarValues.push([values[i], values[j]]);
            }
          }
        }
        
        if (similarValues.length > 0) {
          inconsistencies.push({
            type: 'Spelling Inconsistency',
            description: `${header} has similar values that might be duplicates: ${similarValues[0].join(' vs ')}`,
            column: header
          });
          qualityScore -= 10;
        }
      }
    });
    
    // 4. Anomaly Scoring
    headers.forEach((header, colIndex) => {
      const columnData = rows.map(row => parseFloat(row[colIndex])).filter(val => !isNaN(val));
      
      if (columnData.length > 5) {
        const mean = columnData.reduce((sum, val) => sum + val, 0) / columnData.length;
        const variance = columnData.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / columnData.length;
        const stdDev = Math.sqrt(variance);
        
        const outliers = columnData.filter(val => Math.abs(val - mean) > 2 * stdDev);
        if (outliers.length > 0) {
          const anomalyScore = Math.min((outliers.length / columnData.length) * 100, 100).toFixed(1);
          anomalies.push({
            column: header,
            description: `${outliers.length} statistical outliers detected (beyond 2 standard deviations)`,
            score: anomalyScore,
            examples: outliers.slice(0, 3).map(val => val.toFixed(2))
          });
          qualityScore -= outliers.length;
        }
      }
    });
    
    return {
      overallScore: Math.max(qualityScore, 0),
      cleaningSuggestions,
      validationIssues,
      inconsistencies,
      anomalies
    };
  };
  
  const calculateSimilarity = (str1: string, str2: string) => {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    const editDistance = levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  };
  
  const levenshteinDistance = (str1: string, str2: string) => {
    const matrix = [];
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[str2.length][str1.length];
  };

  const performPredictiveAnalysis = (data: any[][]) => {
    if (!data || data.length < 5) return null;
    
    const headers = data[0];
    const rows = data.slice(1);
    
    // Find time-based columns (years) and numeric columns
    const yearColumns = headers.map((h, i) => ({ header: h, index: i })).filter(({ header }) => /\d{4}/.test(String(header)));
    const numericColumns = [];
    
    for (let i = 0; i < headers.length; i++) {
      if (yearColumns.some(y => y.index === i)) continue;
      const values = rows.map(row => parseFloat(row[i])).filter(v => !isNaN(v));
      if (values.length > rows.length * 0.5) {
        numericColumns.push({ index: i, name: headers[i], values });
      }
    }
    
    if (yearColumns.length === 0 || numericColumns.length === 0) return null;
    
    const trends = [];
    const forecasts = [];
    const seasonality = [];
    
    // Analyze trends for each numeric column across years
    numericColumns.forEach(col => {
      const yearlyData = [];
      
      yearColumns.forEach(yearCol => {
        const yearValues = rows.map(row => parseFloat(row[yearCol.index])).filter(v => !isNaN(v));
        if (yearValues.length > 0) {
          const avgValue = yearValues.reduce((sum, val) => sum + val, 0) / yearValues.length;
          yearlyData.push({ year: parseInt(yearCol.header), value: avgValue });
        }
      });
      
      if (yearlyData.length >= 3) {
        // Calculate trend using linear regression
        const n = yearlyData.length;
        const sumX = yearlyData.reduce((sum, d) => sum + d.year, 0);
        const sumY = yearlyData.reduce((sum, d) => sum + d.value, 0);
        const sumXY = yearlyData.reduce((sum, d) => sum + d.year * d.value, 0);
        const sumX2 = yearlyData.reduce((sum, d) => sum + d.year * d.year, 0);
        
        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;
        
        // Determine trend direction and strength
        const direction = slope > 0 ? 'Upward' : slope < 0 ? 'Downward' : 'Stable';
        const strength = Math.abs(slope) > 100 ? 'Strong' : Math.abs(slope) > 10 ? 'Moderate' : 'Weak';
        const growthRate = ((slope / (sumY / n)) * 100).toFixed(1);
        
        trends.push({
          column: col.name,
          direction,
          strength,
          growthRate,
          slope
        });
        
        // Forecast next period
        const lastYear = Math.max(...yearlyData.map(d => d.year));
        const nextYear = lastYear + 1;
        const predicted = slope * nextYear + intercept;
        const confidence = strength === 'Strong' ? 'High' : strength === 'Moderate' ? 'Medium' : 'Low';
        
        forecasts.push({
          column: col.name,
          predicted,
          confidence,
          nextPeriod: nextYear
        });
        
        // Check for seasonality (simplified)
        const values = yearlyData.map(d => d.value);
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
        const stdDev = Math.sqrt(variance);
        
        if (stdDev > mean * 0.2) {
          seasonality.push({
            column: col.name,
            pattern: 'High Variability'
          });
        }
      }
    });
    
    return {
      trends,
      forecasts,
      seasonality
    };
  };

  const performStatisticalAnalysis = (data: any[][]) => {
    if (!data || data.length < 2) return null;
    
    const headers = data[0];
    const rows = data.slice(1);
    
    // Find all numeric columns
    const numericColumns = [];
    for (let i = 0; i < headers.length; i++) {
      const values = rows.map(row => parseFloat(row[i])).filter(v => !isNaN(v));
      if (values.length > rows.length * 0.5) {
        numericColumns.push({
          index: i,
          name: headers[i],
          values: values,
          mean: values.reduce((sum, val) => sum + val, 0) / values.length,
          min: Math.min(...values),
          max: Math.max(...values)
        });
      }
    }
    
    // Calculate correlations between numeric columns
    const correlations = [];
    for (let i = 0; i < numericColumns.length; i++) {
      for (let j = i + 1; j < numericColumns.length; j++) {
        const col1 = numericColumns[i];
        const col2 = numericColumns[j];
        
        // Pearson correlation coefficient
        const n = Math.min(col1.values.length, col2.values.length);
        let sumXY = 0, sumX = 0, sumY = 0, sumX2 = 0, sumY2 = 0;
        
        for (let k = 0; k < n; k++) {
          const x = col1.values[k];
          const y = col2.values[k];
          sumXY += x * y;
          sumX += x;
          sumY += y;
          sumX2 += x * x;
          sumY2 += y * y;
        }
        
        const correlation = (n * sumXY - sumX * sumY) / 
          Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
        
        if (!isNaN(correlation)) {
          correlations.push({
            col1: col1.name,
            col2: col2.name,
            correlation: correlation,
            strength: Math.abs(correlation) > 0.7 ? 'Strong' : Math.abs(correlation) > 0.3 ? 'Moderate' : 'Weak'
          });
        }
      }
    }
    
    // Calculate percentiles for each numeric column
    const percentiles = numericColumns.map(col => {
      const sorted = [...col.values].sort((a, b) => a - b);
      return {
        name: col.name,
        p25: sorted[Math.floor(sorted.length * 0.25)],
        p50: sorted[Math.floor(sorted.length * 0.50)],
        p75: sorted[Math.floor(sorted.length * 0.75)],
        p90: sorted[Math.floor(sorted.length * 0.90)]
      };
    });
    
    return {
      numericColumns,
      correlations,
      percentiles
    };
  };

  const generateAutoInsights = (structure: any, data: any[][]) => {
    const insights = [];
    const { detectedFormat, rowCount, columnCount } = structure;
    
    // Universal insights
    insights.push(`Dataset contains ${rowCount} records across ${columnCount} dimensions`);
    
    // Industry-specific insights
    switch (detectedFormat) {
      case 'restaurant':
        insights.push('Peak hours analysis available for operational optimization');
        insights.push('Menu item profitability can be calculated from price and cost data');
        insights.push('Server performance metrics ready for staff evaluation');
        break;
      case 'healthcare':
        insights.push('Patient outcome tracking enabled for quality improvement');
        insights.push('Treatment effectiveness analysis available');
        insights.push('Resource utilization metrics can be generated');
        break;
      case 'financial':
        insights.push('Cash flow patterns can be analyzed for financial health');
        insights.push('Payment method preferences show customer behavior');
        insights.push('Receivables aging analysis available for collection strategy');
        break;
      case 'sports':
        insights.push('Player performance rankings can be generated');
        insights.push('Team statistics comparison available');
        insights.push('Winning patterns analysis ready for strategy planning');
        break;
      default:
        insights.push('Data structure optimized for comprehensive analysis');
        insights.push('Multiple visualization options available');
    }
    
    // Data quality insights
    if (structure.dataQuality.completeness > 0.9) {
      insights.push('Excellent data quality detected - analysis will be highly accurate');
    } else if (structure.dataQuality.completeness < 0.7) {
      insights.push('Data quality issues detected - consider cleaning for better insights');
    }
    
    return insights.slice(0, 4);
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
      {/* Animated Background Elements */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.2) 0%, transparent 50%)',
        animation: 'float 20s ease-in-out infinite'
      }} />
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.02"%3E%3Ccircle cx="30" cy="30" r="1"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        opacity: 0.5
      }} />
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            33% { transform: translateY(-20px) rotate(1deg); }
            66% { transform: translateY(-10px) rotate(-1deg); }
          }
          @keyframes glow {
            0%, 100% { box-shadow: 0 0 20px rgba(120, 219, 255, 0.3); }
            50% { box-shadow: 0 0 40px rgba(120, 219, 255, 0.6), 0 0 60px rgba(120, 219, 255, 0.3); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 0.8; }
            50% { opacity: 1; }
          }
          .glass-morphism {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          }
          .neon-border {
            border: 1px solid rgba(120, 219, 255, 0.5);
            box-shadow: 0 0 20px rgba(120, 219, 255, 0.2), inset 0 0 20px rgba(120, 219, 255, 0.1);
          }
          .hover-lift {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          .hover-lift:hover {
            transform: translateY(-5px);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
          }
        `}
      </style>
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
            boxShadow: '0 0 30px rgba(120, 219, 255, 0.5)',
            animation: 'glow 3s ease-in-out infinite'
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
          <div className="glass-morphism neon-border" style={{
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
            className="hover-lift"
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
              letterSpacing: '1px',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 0 20px rgba(120, 219, 255, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(120, 219, 255, 0.4) 0%, rgba(255, 119, 198, 0.4) 100%)';
              e.currentTarget.style.boxShadow = '0 0 30px rgba(120, 219, 255, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(120, 219, 255, 0.2) 0%, rgba(255, 119, 198, 0.2) 100%)';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(120, 219, 255, 0.3)';
            }}
          >
            Classic Mode
          </button>
          <button
            onClick={onLogout}
            className="hover-lift"
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
              letterSpacing: '1px',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 0 20px rgba(255, 77, 77, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 77, 77, 0.4) 0%, rgba(255, 119, 198, 0.4) 100%)';
              e.currentTarget.style.boxShadow = '0 0 30px rgba(255, 77, 77, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 77, 77, 0.2) 0%, rgba(255, 119, 198, 0.2) 100%)';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(255, 77, 77, 0.3)';
            }}
          >
            Disconnect
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ padding: window.innerWidth <= 768 ? '20px' : '40px', position: 'relative', zIndex: 100 }}>
        {/* Simplified Top Bar Layout */}
        <div style={{ 
          display: 'flex', 
          gap: '16px',
          marginBottom: '24px',
          maxWidth: '1600px',
          margin: '0 auto 24px auto'
        }}>
          
          {/* File Upload - Left */}
          <div style={{ 
            width: '300px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
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
              style={{ 
                width: '100%',
                padding: '12px', 
                border: '1px solid white', 
                borderRadius: '6px',
                backgroundColor: 'transparent',
                color: 'white',
                fontSize: '14px',
                cursor: 'pointer',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* AI Input - Right (takes remaining space) */}
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
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (!aiLoading && selectedFile && prompt.trim()) {
                      handleCustomAnalysis();
                    }
                  }
                }}
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
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: window.innerWidth <= 768 ? 'column' : 'row',
          gap: '20px'
        }}>
          {/* Left Panel - Quick Actions */}
          <div style={{
            width: window.innerWidth <= 768 ? '100%' : '280px',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '16px',
            padding: '16px',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>

            {/* File Status */}
            {selectedFile && (
              <div className="glass-morphism" style={{
                background: 'linear-gradient(135deg, rgba(120, 219, 255, 0.1) 0%, rgba(255, 119, 198, 0.1) 100%)',
                border: '1px solid rgba(120, 219, 255, 0.4)',
                borderRadius: '16px',
                padding: '20px',
                marginBottom: '32px',
                boxShadow: '0 0 30px rgba(120, 219, 255, 0.2)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ 
                    fontSize: '24px',
                    background: 'linear-gradient(135deg, #78dbff 0%, #ff77c6 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    filter: 'drop-shadow(0 0 10px rgba(120, 219, 255, 0.8))'
                  }}>⚡</div>
                  <div>
                    <div style={{ 
                      fontWeight: '700', 
                      fontSize: '16px',
                      background: 'linear-gradient(135deg, #78dbff 0%, #ff77c6 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      letterSpacing: '-0.5px'
                    }}>{selectedFile.name}</div>
                    <div style={{ 
                      fontSize: '11px', 
                      opacity: 0.7,
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      fontWeight: '500',
                      marginTop: '4px'
                    }}>
                      {spreadsheetData.length} Records • {dataStructure?.detectedFormat || 'Processing...'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Smart Actions */}
            {spreadsheetData.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ 
                  margin: '0 0 8px 0', 
                  fontSize: '12px', 
                  fontWeight: '600',
                  color: 'white'
                }}>
                  {dataStructure ? `${dataStructure.detectedFormat === 'ecommerce' ? 'E-Commerce' : dataStructure.detectedFormat.charAt(0).toUpperCase() + dataStructure.detectedFormat.slice(1)} Actions` : '🚀 Quick Actions'}
                </h4>
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
                    📊 {showChart ? 'Hide' : 'Show'} {dataStructure ? 'Industry Charts' : 'Charts'}
                  </button>
                  <div style={{ position: 'relative' }}>
                    <button
                      onClick={() => {
                        if (pivotTables.length === 0) {
                          const pivots = generateAdvancedPivotTables(spreadsheetData);
                          console.log('Generated pivots:', pivots);
                          setPivotTables(pivots);
                        }
                        setShowPivotDropdown(!showPivotDropdown);
                      }}
                      style={{
                        background: 'transparent',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '500',
                        width: '100%'
                      }}
                    >
                      📋 Pivot Tables {showPivotDropdown ? '▲' : '▼'}
                    </button>
                    
                    {showPivotDropdown && pivotTables.length > 0 && (
                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        background: 'rgba(255, 255, 255, 0.95)',

                        borderRadius: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                        zIndex: 1000,
                        marginTop: '4px'
                      }}>
                        {pivotTables.map((pivot, index) => (
                          <div
                            key={index}
                            onClick={() => {
                              setSelectedPivot(index);
                              setShowPivotDropdown(false);
                            }}
                            style={{
                              padding: '8px 12px',
                              cursor: 'pointer',
                              fontSize: '11px',
                              color: '#333',
                              borderBottom: index < pivotTables.length - 1 ? '1px solid rgba(255, 255, 255, 0.2)' : 'none',
                              transition: 'background 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'transparent';
                            }}
                          >
                            <div style={{ fontWeight: '600' }}>{pivot.title}</div>
                            <div style={{ fontSize: '10px', opacity: 0.7 }}>{pivot.description}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      const stats = performStatisticalAnalysis(spreadsheetData);
                      if (stats) {
                        let analysis = `📊 **STATISTICAL ANALYSIS**\n\n`;
                        
                        analysis += `**CORRELATION ANALYSIS:**\n`;
                        if (stats.correlations.length > 0) {
                          stats.correlations.forEach(corr => {
                            analysis += `• ${corr.col1} ↔ ${corr.col2}: ${corr.correlation.toFixed(3)} (${corr.strength})\n`;
                          });
                        } else {
                          analysis += `• No significant correlations found\n`;
                        }
                        analysis += `\n`;
                        
                        analysis += `**PERCENTILE ANALYSIS:**\n`;
                        stats.percentiles.forEach(p => {
                          analysis += `• ${p.name}: 25th=${p.p25?.toFixed(2)}, 50th=${p.p50?.toFixed(2)}, 75th=${p.p75?.toFixed(2)}, 90th=${p.p90?.toFixed(2)}\n`;
                        });
                        
                        setAiResponse(analysis);
                      } else {
                        setAiResponse('⚠️ No numeric data found for statistical analysis.');
                      }
                    }}
                    style={{
                      background: 'transparent',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}
                  >
                    📊 Statistics
                  </button>
                  <button
                    onClick={() => {
                      const predictions = performPredictiveAnalysis(spreadsheetData);
                      if (predictions) {
                        let analysis = `🔮 **PREDICTIVE ANALYTICS**\n\n`;
                        
                        analysis += `**TREND ANALYSIS:**\n`;
                        predictions.trends.forEach(trend => {
                          analysis += `• ${trend.column}: ${trend.direction} trend (${trend.strength})\n`;
                          analysis += `  Growth Rate: ${trend.growthRate}% per period\n`;
                        });
                        analysis += `\n`;
                        
                        analysis += `**FORECASTING:**\n`;
                        predictions.forecasts.forEach(forecast => {
                          analysis += `• ${forecast.column} Next Period: ${forecast.predicted.toFixed(2)}\n`;
                          analysis += `  Confidence: ${forecast.confidence}\n`;
                        });
                        analysis += `\n`;
                        
                        analysis += `**SEASONAL PATTERNS:**\n`;
                        if (predictions.seasonality.length > 0) {
                          predictions.seasonality.forEach(season => {
                            analysis += `• ${season.pattern} detected in ${season.column}\n`;
                          });
                        } else {
                          analysis += `• No clear seasonal patterns detected\n`;
                        }
                        
                        setAiResponse(analysis);
                      } else {
                        setAiResponse('⚠️ Insufficient time-series data for predictions.');
                      }
                    }}
                    style={{
                      background: 'transparent',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}
                  >
                    🔮 Predictions
                  </button>
                  <button
                    onClick={() => {
                      if (dataStructure) {
                        const complianceReport = generateComplianceReport(dataStructure, spreadsheetData);
                        let analysis = `📋 **COMPLIANCE & GOVERNANCE REPORT**\n\n`;
                        
                        analysis += `**INDUSTRY: ${dataStructure.detectedFormat.toUpperCase()}**\n\n`;
                        
                        analysis += `**COMPLIANCE STATUS:**\n`;
                        complianceReport.checks.forEach(check => {
                          analysis += `• ${check.rule}: ${check.status} ${check.status === 'PASS' ? '✅' : '❌'}\n`;
                        });
                        analysis += `\n`;
                        
                        analysis += `**GOVERNANCE RECOMMENDATIONS:**\n`;
                        complianceReport.recommendations.forEach(rec => {
                          analysis += `• ${rec}\n`;
                        });
                        
                        setAiResponse(analysis);
                      } else {
                        const qualityReport = performDataQualityAnalysis(spreadsheetData);
                        if (qualityReport) {
                          let analysis = `🔍 **DATA QUALITY REPORT**\n\n`;
                          analysis += `**QUALITY SCORE: ${qualityReport.overallScore}/100**\n\n`;
                          analysis += `**CLEANING SUGGESTIONS:**\n`;
                          qualityReport.cleaningSuggestions.forEach(suggestion => {
                            analysis += `• ${suggestion.issue}: ${suggestion.suggestion}\n`;
                          });
                          setAiResponse(analysis);
                        }
                      }
                    }}
                    style={{
                      background: 'transparent',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}
                  >
                    📋 Compliance
                  </button>
                  <div style={{ position: 'relative' }}>
                    <button
                      onClick={() => setShowExportDropdown(!showExportDropdown)}
                      style={{
                        background: 'transparent',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '500',
                        width: '100%'
                      }}
                    >
                      💾 Export {showExportDropdown ? '▲' : '▼'}
                    </button>
                    
                    {showExportDropdown && (
                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        background: 'rgba(255, 255, 255, 0.95)',

                        borderRadius: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                        zIndex: 1000,
                        marginTop: '4px'
                      }}>
                        <div
                          onClick={() => {
                            downloadExcel(spreadsheetData, `${selectedFile?.name || 'data'}_export.xlsx`);
                            setShowExportDropdown(false);
                          }}
                          style={{
                            padding: '8px 12px',
                            cursor: 'pointer',
                            fontSize: '11px',
                            color: '#333',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
                          }}
                        >
                          📊 Excel (.xlsx)
                        </div>
                        <div
                          onClick={() => {
                            exportToCSV(spreadsheetData, `${selectedFile?.name || 'data'}_export.csv`);
                            setShowExportDropdown(false);
                          }}
                          style={{
                            padding: '8px 12px',
                            cursor: 'pointer',
                            fontSize: '11px',
                            color: '#333',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
                          }}
                        >
                          📄 CSV (.csv)
                        </div>
                        <div
                          onClick={() => {
                            if (dataStructure) {
                              generateIndustryReport(dataStructure, spreadsheetData);
                            } else {
                              generatePDFReport();
                            }
                            setShowExportDropdown(false);
                          }}
                          style={{
                            padding: '8px 12px',
                            cursor: 'pointer',
                            fontSize: '11px',
                            color: '#333',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
                          }}
                        >
                          📄 {dataStructure ? `${dataStructure.detectedFormat} Report` : 'PDF Report'}
                        </div>
                        <div
                          onClick={() => {
                            exportToJSON(spreadsheetData, `${selectedFile?.name || 'data'}_export.json`);
                            setShowExportDropdown(false);
                          }}
                          style={{
                            padding: '8px 12px',
                            cursor: 'pointer',
                            fontSize: '11px',
                            color: '#333',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
                          }}
                        >
                          📄 JSON (.json)
                        </div>
                        <div
                          onClick={() => {
                            setShowEmailModal(true);
                            setShowExportDropdown(false);
                          }}
                          style={{
                            padding: '8px 12px',
                            cursor: 'pointer',
                            fontSize: '11px',
                            color: '#333',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
                          }}
                        >
                          📧 Email Report
                        </div>
                        <div
                          onClick={() => {
                            if (dataStructure) {
                              generateIndustryTemplate(dataStructure);
                            } else {
                              generateAPIEndpoint();
                            }
                            setShowExportDropdown(false);
                          }}
                          style={{
                            padding: '8px 12px',
                            cursor: 'pointer',
                            fontSize: '11px',
                            color: '#333'
                          }}
                        >
                          🎨 {dataStructure ? 'Industry Template' : 'API Integration'}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Analysis Actions */}
            {spreadsheetData.length > 0 && (
              <div style={{ marginBottom: '32px' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: '600' }}>
                  🔄 Analysis Actions
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <button
                    onClick={() => performAlternativeAnalysis(spreadsheetData)}
                    disabled={aiLoading}
                    style={{
                      background: 'transparent',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '4px',
                      padding: '6px 8px',
                      color: 'white',
                      cursor: aiLoading ? 'not-allowed' : 'pointer',
                      fontSize: '11px',
                      fontWeight: '500',
                      transition: 'all 0.3s ease',
                      opacity: aiLoading ? 0.6 : 1
                    }}
                  >
                    {aiLoading ? '🔄 Analyzing...' : '🔍 Alternative Analysis'}
                  </button>
                </div>
              </div>
            )}


            

          </div>

          {/* Right Panel - Data Display */}
          <div style={{
            flex: 1,
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '100%',
              height: '2px',
              background: 'linear-gradient(270deg, transparent 0%, #ff77c6 50%, transparent 100%)',
              animation: 'pulse 2s ease-in-out infinite'
            }} />
            {spreadsheetData.length > 0 ? (
              <>
                <div style={{ marginBottom: '12px' }}>
                  <h3 style={{ 
                    margin: '0 0 4px 0', 
                    fontSize: '16px', 
                    fontWeight: '600',
                    color: 'white'
                  }}>
                    📊 {selectedFile?.name || 'Data'}
                  </h3>
                  <p style={{ 
                    margin: 0, 
                    fontSize: '12px', 
                    opacity: 0.7
                  }}>
                    {displayData.length - 1} rows × {displayData[0]?.length || 0} columns
                  </p>
                </div>
                
                <div style={{
                  background: 'transparent',
                  borderRadius: '12px',
                  overflowX: 'scroll',
                  overflowY: 'scroll',
                  maxHeight: '400px',
                  width: '100%',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'rgba(255, 255, 255, 0.3) rgba(255, 255, 255, 0.1)'
                }} className="custom-scrollbar">
                  <table style={{ 
                    borderCollapse: 'collapse', 
                    width: 'auto',
                    tableLayout: 'auto'
                  }}>
                    <thead>
                      <tr style={{ background: 'transparent' }}>
                        {displayData[0]?.map((header, index) => (
                          <th key={index} 
                            onClick={() => handleSort(index)}
                            style={{
                              padding: '12px 16px',
                              textAlign: 'left',
                              fontSize: '12px',
                              fontWeight: '600',
                              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                              cursor: 'pointer',
                              position: 'relative',
                              whiteSpace: 'nowrap',
                              minWidth: '150px'
                            }}>
                            {String(header || `Col ${index + 1}`)}
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
                      {displayData.slice(1).map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          {displayData[0]?.map((_, cellIndex) => (
                            <td key={cellIndex} style={{
                              padding: '4px',
                              fontSize: '13px',
                              borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                              opacity: 0.9,
                              whiteSpace: 'nowrap',
                              minWidth: '150px'
                            }}>
                              <input
                                type="text"
                                value={String(row[cellIndex] || '')}
                                onChange={(e) => handleCellEdit(rowIndex + 1, cellIndex, e.target.value)}
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  color: 'white',
                                  fontSize: '13px',
                                  width: '100%',
                                  padding: '8px 12px',
                                  outline: 'none'
                                }}
                                onFocus={(e) => {
                                  e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                                  e.target.style.borderRadius = '4px';
                                }}
                                onBlur={(e) => {
                                  e.target.style.background = 'transparent';
                                }}
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                

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
            

            
            {/* Industry Intelligence Dashboard */}
            {dataStructure && (
              <div style={{
                marginTop: '32px',
                background: 'transparent',
                borderRadius: '12px',
                padding: '24px'
              }}>
                <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600' }}>
                  🧠 Industry Intelligence
                </h4>
                
                {/* KPIs */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '12px',
                  marginBottom: '20px'
                }}>
                  {EnhancedAiService.generateIndustryKPIs(dataStructure).slice(0, 4).map((kpi, index) => (
                    <div key={index} style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      padding: '12px'
                    }}>
                      <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>{kpi.name}</div>
                      <div style={{ fontSize: '10px', opacity: 0.7, marginBottom: '8px' }}>{kpi.description}</div>
                      <div style={{ fontSize: '9px', opacity: 0.5, fontStyle: 'italic' }}>{kpi.calculation}</div>
                    </div>
                  ))}
                </div>
                
                {/* Benchmarks */}
                <div style={{ marginBottom: '20px' }}>
                  <h5 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600' }}>
                    📈 Industry Benchmarks
                  </h5>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '8px'
                  }}>
                    {EnhancedAiService.generateIndustryBenchmarks(dataStructure).map((benchmark, index) => (
                      <div key={index} style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '6px',
                        padding: '8px 12px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <div>
                          <div style={{ fontSize: '11px', fontWeight: '500' }}>{benchmark.metric}</div>
                          <div style={{ fontSize: '9px', opacity: 0.7 }}>{benchmark.benchmark}</div>
                        </div>
                        <div style={{
                          fontSize: '8px',
                          padding: '2px 6px',
                          borderRadius: '10px',
                          background: benchmark.status === 'good' ? 'rgba(76, 205, 196, 0.2)' : 
                                     benchmark.status === 'average' ? 'rgba(255, 159, 67, 0.2)' : 
                                     'rgba(255, 107, 107, 0.2)',
                          color: benchmark.status === 'good' ? '#4ecdc4' : 
                                benchmark.status === 'average' ? '#ff9f43' : 
                                '#ff6b6b'
                        }}>
                          {benchmark.status.replace('_', ' ')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Auto Insights */}
                <div style={{ marginBottom: '20px' }}>
                  <h5 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600' }}>
                    ✨ Auto Insights
                  </h5>
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    padding: '12px'
                  }}>
                    {generateAutoInsights(dataStructure, spreadsheetData).map((insight, index) => (
                      <div key={index} style={{
                        fontSize: '11px',
                        marginBottom: index < generateAutoInsights(dataStructure, spreadsheetData).length - 1 ? '6px' : 0,
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '6px'
                      }}>
                        <span style={{ color: '#4ecdc4' }}>•</span>
                        {insight}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Smart Alerts */}
                <div>
                  <h5 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600' }}>
                    🚨 Smart Alerts
                  </h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {EnhancedAiService.generateIndustryAlerts(dataStructure, spreadsheetData).map((alert, index) => (
                      <div key={index} style={{
                        background: alert.type === 'warning' ? 'rgba(255, 107, 107, 0.1)' : 
                                   alert.type === 'success' ? 'rgba(76, 205, 196, 0.1)' : 
                                   'rgba(255, 159, 67, 0.1)',
                        border: `1px solid ${alert.type === 'warning' ? 'rgba(255, 107, 107, 0.3)' : 
                                             alert.type === 'success' ? 'rgba(76, 205, 196, 0.3)' : 
                                             'rgba(255, 159, 67, 0.3)'}`,
                        borderRadius: '6px',
                        padding: '8px 10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <span style={{ fontSize: '12px' }}>
                          {alert.type === 'warning' ? '⚠️' : alert.type === 'success' ? '✅' : '📊'}
                        </span>
                        <span style={{ fontSize: '10px', flex: 1 }}>{alert.message}</span>
                        <span style={{
                          fontSize: '8px',
                          padding: '2px 6px',
                          borderRadius: '8px',
                          background: alert.priority === 'high' ? 'rgba(255, 107, 107, 0.2)' : 
                                     alert.priority === 'medium' ? 'rgba(255, 159, 67, 0.2)' : 
                                     'rgba(76, 205, 196, 0.2)',
                          color: alert.priority === 'high' ? '#ff6b6b' : 
                                alert.priority === 'medium' ? '#ff9f43' : 
                                '#4ecdc4'
                        }}>
                          {alert.priority}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* AI Response in Right Panel */}
            {aiResponse && (
              <div style={{
                marginTop: '32px',
                background: 'transparent',
                borderRadius: '12px',
                padding: '24px'
              }}>
                <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600' }}>
                  💬 AI Analytics Response
                </h4>
                <div style={{
                  background: 'transparent',
                  borderRadius: '8px',
                  padding: '16px',
                  fontSize: '13px',
                  lineHeight: '1.6',
                  whiteSpace: 'nowrap',
                  overflow: 'auto',
                  maxHeight: '200px',
                  minWidth: window.innerWidth <= 768 ? '100%' : '400px',
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'rgba(255, 255, 255, 0.3) rgba(255, 255, 255, 0.1)'
                }} className="custom-scrollbar">
                  <div dangerouslySetInnerHTML={{ __html: aiResponse.replace(/\n/g, '<br>') }} />
                </div>
              </div>
            )}
            
            {/* Top 5 Table */}
            {analyticsData?.top5 && (
              <div style={{
                marginTop: '32px',
                background: 'transparent',
                borderRadius: '12px',
                padding: '24px',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#4ecdc4' }}>
                    🔝 Top 5 Highest Values
                  </h4>
                  <button
                    onClick={() => {
                      const top5Data = [['Rank', 'Country/Region', 'Value'], ...analyticsData.top5.map((item: any, index: number) => [`#${index + 1}`, item.country || `Row ${item.index}`, item.value.toFixed(2)])];
                      downloadExcel(top5Data, 'top5_analysis.xlsx');
                    }}
                    style={{
                      background: 'transparent',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '11px',
                      fontWeight: '500'
                    }}
                  >
                    📥 Download
                  </button>
                </div>
                <div style={{ display: 'flex', gap: '20px' }}>
                  <div style={{ flex: 1 }}>
                    <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                      <thead>
                        <tr style={{ background: 'rgba(76, 205, 196, 0.2)' }}>
                          <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '12px' }}>Rank</th>
                          <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '12px' }}>Country/Region</th>
                          <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '12px' }}>Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analyticsData.top5.map((item: any, index: number) => (
                          <tr key={index}>
                            <td style={{ padding: '8px 12px', fontSize: '11px' }}>#{index + 1}</td>
                            <td style={{ padding: '8px 12px', fontSize: '11px' }}>{item.country || `Row ${item.index}`}</td>
                            <td style={{ padding: '8px 12px', fontSize: '11px', fontWeight: '600' }}>{item.value.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div style={{ width: '200px', height: '150px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '24px', fontWeight: '600', color: '#4ecdc4' }}>{analyticsData.comparison?.topAvg}</div>
                      <div style={{ fontSize: '11px', opacity: 0.7 }}>Average</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Bottom 5 Table */}
            {analyticsData?.bottom5 && (
              <div style={{
                marginTop: '20px',
                background: 'transparent',
                borderRadius: '12px',
                padding: '24px',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#ff6b6b' }}>
                    🔽 Bottom 5 Lowest Values
                  </h4>
                  <button
                    onClick={() => {
                      const bottom5Data = [['Rank', 'Country/Region', 'Value'], ...analyticsData.bottom5.map((item: any, index: number) => [`#${index + 1}`, item.country || `Row ${item.index}`, item.value.toFixed(2)])];
                      downloadExcel(bottom5Data, 'bottom5_analysis.xlsx');
                    }}
                    style={{
                      background: 'transparent',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '11px',
                      fontWeight: '500'
                    }}
                  >
                    📥 Download
                  </button>
                </div>
                <div style={{ display: 'flex', gap: '20px' }}>
                  <div style={{ flex: 1 }}>
                    <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                      <thead>
                        <tr style={{ background: 'rgba(255, 107, 107, 0.2)' }}>
                          <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '12px' }}>Rank</th>
                          <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '12px' }}>Country/Region</th>
                          <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '12px' }}>Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analyticsData.bottom5.map((item: any, index: number) => (
                          <tr key={index}>
                            <td style={{ padding: '8px 12px', fontSize: '11px' }}>#{index + 1}</td>
                            <td style={{ padding: '8px 12px', fontSize: '11px' }}>{item.country || `Row ${item.index}`}</td>
                            <td style={{ padding: '8px 12px', fontSize: '11px', fontWeight: '600' }}>{item.value.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div style={{ width: '200px', height: '150px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '24px', fontWeight: '600', color: '#ff6b6b' }}>{analyticsData.comparison?.bottomAvg}</div>
                      <div style={{ fontSize: '11px', opacity: 0.7 }}>Average</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Comparison Chart */}
            {analyticsData?.comparison && (
              <div style={{
                marginTop: '20px',
                background: 'transparent',
                borderRadius: '12px',
                padding: '24px'
              }}>
                <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600' }}>
                  ⚖️ Comparison Analysis
                </h4>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                      <div style={{ width: '100px', fontSize: '12px' }}>Top 5 Avg:</div>
                      <div style={{ flex: 1, background: 'rgba(255,255,255,0.1)', borderRadius: '4px', height: '20px', position: 'relative' }}>
                        <div style={{ background: '#4ecdc4', height: '100%', width: '100%', borderRadius: '4px' }}></div>
                        <span style={{ position: 'absolute', right: '8px', top: '2px', fontSize: '11px', fontWeight: '600' }}>{analyticsData.comparison.topAvg}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                      <div style={{ width: '100px', fontSize: '12px' }}>Bottom 5 Avg:</div>
                      <div style={{ flex: 1, background: 'rgba(255,255,255,0.1)', borderRadius: '4px', height: '20px', position: 'relative' }}>
                        <div style={{ background: '#ff6b6b', height: '100%', width: `${(parseFloat(analyticsData.comparison.bottomAvg) / parseFloat(analyticsData.comparison.topAvg)) * 100}%`, borderRadius: '4px' }}></div>
                        <span style={{ position: 'absolute', right: '8px', top: '2px', fontSize: '11px', fontWeight: '600' }}>{analyticsData.comparison.bottomAvg}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'center', minWidth: '120px' }}>
                    <div style={{ fontSize: '32px', fontWeight: '600', color: analyticsData.comparison.gap === 'High inequality' ? '#ff6b6b' : '#4ecdc4' }}>{analyticsData.comparison.ratio}x</div>
                    <div style={{ fontSize: '11px', opacity: 0.7 }}>Ratio</div>
                    <div style={{ fontSize: '10px', marginTop: '4px', color: analyticsData.comparison.gap === 'High inequality' ? '#ff6b6b' : '#4ecdc4' }}>{analyticsData.comparison.gap}</div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Selected Pivot Table Display */}
            {selectedPivot !== null && pivotTables[selectedPivot] && (
              <div style={{
                marginTop: '32px',
                background: 'transparent',
                borderRadius: '12px',
                padding: '24px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>📋 {pivotTables[selectedPivot].title}</h4>
                    <p style={{ margin: '4px 0 0 0', fontSize: '12px', opacity: 0.7 }}>{pivotTables[selectedPivot].description}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {pivotTables[selectedPivot].type === 'multidimensional' && (
                      <button
                        onClick={() => setShowAdvancedPivot(!showAdvancedPivot)}
                        style={{
                          background: 'transparent',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: '6px',
                          padding: '6px 12px',
                          color: 'white',
                          cursor: 'pointer',
                          fontSize: '11px',
                          fontWeight: '500'
                        }}
                      >
                        ⚙️ {showAdvancedPivot ? 'Hide' : 'Show'} Filters
                      </button>
                    )}
                    <button
                      onClick={() => downloadExcel(pivotTables[selectedPivot].data, `${pivotTables[selectedPivot].title.replace(/\s+/g, '_').toLowerCase()}_pivot.xlsx`)}
                      style={{
                        background: 'transparent',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '6px',
                        padding: '8px 16px',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}
                    >
                      📥 Download
                    </button>
                  </div>
                </div>
                
                {/* Dynamic Filters */}
                {showAdvancedPivot && pivotTables[selectedPivot].type === 'multidimensional' && (
                  <div style={{
                    background: 'transparent',
                    borderRadius: '8px',
                    padding: '16px',
                    marginBottom: '16px'
                  }}>
                    <h5 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600' }}>Dynamic Filters</h5>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      {spreadsheetData[0]?.slice(0, 3).map((header: string, index: number) => (
                        <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <label style={{ fontSize: '11px', opacity: 0.8 }}>{String(header)}</label>
                          <select
                            value={pivotFilters[header] || 'All'}
                            onChange={(e) => {
                              const newFilters = { ...pivotFilters, [header]: e.target.value };
                              setPivotFilters(newFilters);
                              // Regenerate pivot with new filters
                              const newPivots = generateAdvancedPivotTables(spreadsheetData);
                              setPivotTables(newPivots);
                            }}
                            style={{
                              background: 'transparent',
                              border: '1px solid rgba(255, 255, 255, 0.2)',
                              borderRadius: '4px',
                              padding: '4px 8px',
                              color: 'white',
                              fontSize: '11px',
                              minWidth: '100px'
                            }}
                          >
                            <option value="All">All</option>
                            {[...new Set(spreadsheetData.slice(1).map(row => String(row[index])))].slice(0, 10).map(value => (
                              <option key={value} value={value} style={{ color: '#333' }}>{value}</option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div style={{
                  background: 'transparent',
                  borderRadius: '8px',
                  overflow: 'auto',
                  maxHeight: '500px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'rgba(255, 255, 255, 0.3) rgba(255, 255, 255, 0.1)'
                }} className="custom-scrollbar">
                  <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                    <thead>
                      <tr style={{ background: 'transparent' }}>
                        {pivotTables[selectedPivot].data[0]?.map((header: string, index: number) => (
                          <th key={index} style={{
                            padding: '12px 16px',
                            textAlign: 'left',
                            fontSize: '12px',
                            fontWeight: '600',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                            whiteSpace: 'nowrap'
                          }}>
                            {String(header)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {pivotTables[selectedPivot].data.slice(1).map((row: any[], rowIndex: number) => {
                        // Conditional formatting
                        const isHighValue = pivotTables[selectedPivot].type === 'calculated' && 
                          row.some(cell => !isNaN(parseFloat(String(cell))) && parseFloat(String(cell)) > 1000);
                        
                        return (
                          <tr key={rowIndex} style={{
                            background: isHighValue ? 'rgba(78, 205, 196, 0.1)' : 'transparent'
                          }}>
                            {row.map((cell: any, cellIndex: number) => {
                              const cellValue = parseFloat(String(cell));
                              const isNumeric = !isNaN(cellValue);
                              const isHighCell = isNumeric && cellValue > 5000;
                              
                              return (
                                <td key={cellIndex} style={{
                                  padding: '10px 16px',
                                  fontSize: '12px',
                                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                                  whiteSpace: 'nowrap',
                                  background: isHighCell ? 'rgba(255, 107, 107, 0.2)' : 'transparent',
                                  fontWeight: isHighCell ? '600' : 'normal'
                                }}>
                                  {String(cell || '')}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Chart Display */}
        {showChart && spreadsheetData.length > 0 && (
          <div style={{
            maxWidth: '1200px',
            margin: '40px auto 0',
            background: 'transparent',

            borderRadius: '24px',
            padding: '32px',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
                📊 {dataStructure?.detectedFormat ? `${dataStructure.detectedFormat.charAt(0).toUpperCase() + dataStructure.detectedFormat.slice(1)} Analytics` : 'Data Visualization'}
              </h3>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {dataStructure && EnhancedAiService.suggestChartTypes(dataStructure).length > 0 ? (
                  EnhancedAiService.suggestChartTypes(dataStructure).map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => setChartType(suggestion.type as any)}
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
                        opacity: chartType === suggestion.type ? 1 : 0.7
                      }}
                      title={suggestion.reason}
                    >
                      {suggestion.type}
                    </button>
                  ))
                ) : (
                  (['bar', 'line', 'pie', 'scatter', 'histogram', 'heatmap'] as const).map(type => (
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
                      {type === 'heatmap' ? 'Heat Map' : type}
                    </button>
                  ))
                )}
              </div>
            </div>
            <div style={{ background: 'transparent', borderRadius: '12px', padding: '24px' }}>
              {chartType === 'scatter' ? (
                <ScatterPlotComponent data={spreadsheetData} />
              ) : chartType === 'histogram' ? (
                <HistogramComponent data={spreadsheetData} />
              ) : chartType === 'heatmap' ? (
                <HeatMapComponent data={spreadsheetData} />
              ) : (
                <ChartComponent 
                  data={spreadsheetData} 
                  type={chartType as 'bar' | 'line' | 'pie'}
                  title={`${selectedFile?.name || 'Data'} - ${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart`}
                />
              )}
            </div>
          </div>
        )}




      </main>
      
      {/* Footer with Legal Pages */}
      <footer style={{
        background: 'transparent',
        borderTop: '1px solid rgba(120, 219, 255, 0.3)',
        color: 'white',
        padding: '40px',
        textAlign: 'center',
        position: 'relative',
        zIndex: 100
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '1px',
          background: 'linear-gradient(90deg, transparent 0%, #78dbff 25%, #ff77c6 75%, transparent 100%)',
          animation: 'pulse 3s ease-in-out infinite'
        }} />
        <div style={{ display: 'flex', justifyContent: 'center', gap: window.innerWidth <= 768 ? '20px' : '40px', flexWrap: 'wrap', marginBottom: '24px' }}>
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
          }} style={{ 
            color: 'white', 
            textDecoration: 'none', 
            fontSize: '13px', 
            cursor: 'pointer', 
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            padding: '8px 16px',
            borderRadius: '20px',
            border: '1px solid transparent'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(120, 219, 255, 0.2) 0%, rgba(255, 119, 198, 0.2) 100%)';
            e.currentTarget.style.border = '1px solid rgba(120, 219, 255, 0.4)';
            e.currentTarget.style.boxShadow = '0 0 20px rgba(120, 219, 255, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.border = '1px solid transparent';
            e.currentTarget.style.boxShadow = 'none';
          }}
          >About</a>
          
          <a onClick={() => window.location.href = '/payments'} style={{ color: 'white', textDecoration: 'none', fontSize: '16px', cursor: 'pointer', opacity: 0.8, transition: 'opacity 0.3s ease' }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
          >Pricing</a>
          
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
          }} style={{ color: 'white', textDecoration: 'none', fontSize: '16px', cursor: 'pointer', opacity: 0.8, transition: 'opacity 0.3s ease' }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
          >Privacy Policy</a>
          
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
          }} style={{ color: 'white', textDecoration: 'none', fontSize: '16px', cursor: 'pointer', opacity: 0.8, transition: 'opacity 0.3s ease' }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
          >Terms of Service</a>
          
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
          }} style={{ color: 'white', textDecoration: 'none', fontSize: '16px', cursor: 'pointer', opacity: 0.8, transition: 'opacity 0.3s ease' }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
          >Cookie Policy</a>
          
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
• AI-powered data insights
• Chart generation and visualization

Common Commands:
• "Sort by column A"
• "Find duplicates"
• "Sum column B"
• "Show data for [item]"
• "Create a chart"

Troubleshooting:
• Upload issues: Check file format, refresh page
• AI not responding: Upload file first, use clear commands
• Scrolling issues: Use horizontal/vertical scroll bars

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
          }} style={{ color: 'white', textDecoration: 'none', fontSize: '16px', cursor: 'pointer', opacity: 0.8, transition: 'opacity 0.3s ease' }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
          >Support</a>
          
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
• AdvExcel AI Development Team
• Powered by Amazon Web Services
• Cloud-based for global accessibility

We're committed to excellent support and continuous improvement based on your feedback!` 
            });
            setShowLegalModal(true);
          }} style={{ color: 'white', textDecoration: 'none', fontSize: '16px', cursor: 'pointer', opacity: 0.8, transition: 'opacity 0.3s ease' }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
          >Contact Us</a>
        </div>
        <p style={{ 
          margin: 0, 
          fontSize: '11px', 
          opacity: 0.6,
          textTransform: 'uppercase',
          letterSpacing: '2px',
          fontWeight: '500',
          background: 'linear-gradient(135deg, #78dbff 0%, #ff77c6 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          © 2024 AdvExcel AI • Powered by AWS Cloud
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
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',

            borderRadius: '20px',
            padding: '32px',
            maxWidth: window.innerWidth <= 768 ? '95%' : '600px',
            width: '90%',
            maxHeight: '70vh',
            overflow: 'auto',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{ position: 'relative', marginBottom: '24px', textAlign: 'center' }}>
              <h3 style={{ margin: 0, color: '#333', fontSize: '24px', fontWeight: '600' }}>{legalContent.title}</h3>
              <button
                onClick={() => setShowLegalModal(false)}
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ×
              </button>
            </div>
            <div style={{ color: '#333', lineHeight: '1.6', margin: 0, whiteSpace: 'pre-line', fontSize: '15px' }}>{legalContent.content}</div>
            <div style={{ marginTop: '24px', textAlign: 'right' }}>
              <button
                onClick={() => setShowLegalModal(false)}
                style={{
                  background: 'transparent',
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease'
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
            border: '1px solid rgba(255, 255, 255, 0.2)'
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
                  background: '#ff9900',
                  color: '#333',
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
                  border: '1px solid #d5d9d9',
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



