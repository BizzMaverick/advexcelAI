import { useState, useRef, useEffect } from 'react';
import { DataDetectionService } from '../services/dataDetectionService';
import { EnhancedAiService } from '../services/enhancedAiService';
import bedrockService from '../services/bedrockService';
import ChartComponent from './ChartComponent';

import * as XLSX from 'xlsx';
import emailjs from '@emailjs/browser';

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
  const [pivotPrompt, setPivotPrompt] = useState<string>('');
  const [aiResponse, setAiResponse] = useState<string>('');
  const [aiResultData, setAiResultData] = useState<any[][] | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie'>('bar');
  const [sortColumn, setSortColumn] = useState<number>(-1);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filterText, setFilterText] = useState('');
  const [showFeedbackBox, setShowFeedbackBox] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [legalContent, setLegalContent] = useState({ title: '', content: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    setSelectedFile(file);
    
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const data = evt.target?.result;
        if (!data) throw new Error('No data read from file');
        
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        
        setSpreadsheetData(jsonData);
        
        // Auto-analyze data structure
        try {
          const structure = DataDetectionService.analyzeData(jsonData);
          setDataStructure(structure);
          
          // Automatically trigger comprehensive AI analysis
          setTimeout(() => performAutoAnalysis(jsonData), 1000);
        } catch (err) {
          console.error('Data analysis failed:', err);
        }
      } catch (err) {
        console.error('Failed to process file:', err);
      }
    };
    reader.readAsBinaryString(file);
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

  const performAutoAnalysis = async (data: any[][]) => {
    setAiLoading(true);
    setAiResponse('🔄 Performing comprehensive data analysis...');
    
    try {
      const enhancedPrompt = `ANALYZE THIS DATA COMPLETELY. DO NOT just give a title. Provide FULL DETAILED ANALYSIS:

**MANDATORY SECTIONS - INCLUDE ALL:**

1. **DATA SUMMARY:**
   - Total rows: [number]
   - Total columns: [number]
   - Column names and data types
   - Missing values count

2. **STATISTICAL ANALYSIS:**
   - For EACH numeric column: min, max, average, median
   - Calculate totals and subtotals
   - Show percentage distributions

3. **KEY FINDINGS:**
   - Top 5 highest values
   - Top 5 lowest values
   - Most significant trends
   - Notable patterns

4. **INSIGHTS & RECOMMENDATIONS:**
   - What the data reveals
   - Actionable recommendations
   - Areas of concern
   - Opportunities identified

**CRITICAL: Provide actual numbers, calculations, and detailed analysis. Do NOT just give titles or summaries. Show the work and results.**`;
      
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
          
          // Generate pivot tables
          const pivots = generateAdvancedPivotTables(data);
          setPivotTables(pivots);
          
          fullAnalysis += `**📊 ANALYTICS OVERVIEW:**\n`;
          fullAnalysis += `• Top 5 average: ${topAvg.toFixed(2)} | Bottom 5 average: ${bottomAvg.toFixed(2)}\n`;
          fullAnalysis += `• Performance gap: ${ratio}x difference detected\n`;
          fullAnalysis += `• View detailed tables and charts below\n\n`;
        }
        
        // Key Insights
        fullAnalysis += `**💡 KEY INSIGHTS:**\n`;
        fullAnalysis += `• Data Range: ${analytics.range.toFixed(2)} (${analytics.min} to ${analytics.max})\n`;
        fullAnalysis += `• Data Quality: ${analytics.duplicates === 0 ? 'Excellent (No duplicates)' : `${analytics.duplicates} duplicates found`}\n`;
        fullAnalysis += `• Distribution: ${analytics.standardDeviation > analytics.mean ? 'High variability' : 'Low variability'}\n`;
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
          setAiResponse(`✅ **Pivot Table Created**\n\nYour pivot table "${prompt}" has been generated and is displayed below.`);
          setPrompt('');
          setAiLoading(false);
          return;
        }
      }
      
      // Try AWS service for other analysis
      try {
        const enhancedPrompt = dataStructure ? 
          EnhancedAiService.enhancePrompt(prompt, dataStructure) : 
          prompt;
        
        const result = await bedrockService.processExcelData(spreadsheetData, enhancedPrompt, selectedFile?.name || 'data');
        
        if (result.success && result.response) {
          setAiResponse(result.response);
        } else {
          throw new Error(result.error || 'Analysis failed');
        }
      } catch (apiError) {
        // Fallback: Provide helpful response based on prompt
        let response = `⚠️ **AI Service Temporarily Unavailable**\n\n`;
        
        if (lowerPrompt.includes('sum') || lowerPrompt.includes('total')) {
          response += `For sum calculations, you can:\n• Click on column headers to sort\n• Use the export feature to analyze in Excel\n• Manually review the numeric columns`;
        } else if (lowerPrompt.includes('chart') || lowerPrompt.includes('graph')) {
          response += `For charts:\n• Use the "Show Chart" button in Quick Actions\n• Switch between bar, line, and pie charts\n• Export data for external visualization`;
        } else if (lowerPrompt.includes('duplicate')) {
          response += `For duplicate detection:\n• Sort columns to identify similar values\n• Use manual review of the data\n• Export to Excel for advanced duplicate removal`;
        } else {
          response += `Your request: "${prompt}"\n\nWhile AI analysis is unavailable, you can:\n• Edit data directly in the table\n• Sort by clicking column headers\n• Create charts using Quick Actions\n• Export data for external analysis`;
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

  const generateAdvancedPivotTables = (data: any[][]) => {
    if (!data || data.length < 2) return [];
    
    const headers = data[0];
    const pivots = [
      {
        title: 'Country × Year Matrix',
        description: 'Countries as rows, years as columns',
        data: createCountryYearMatrix(data)
      },
      {
        title: 'Year × Category Breakdown',
        description: 'Years as rows, categories as columns',
        data: createYearCategoryMatrix(data)
      },
      {
        title: 'Regional Summary',
        description: 'Regions as rows, metrics as columns',
        data: createRegionalSummary(data)
      },
      {
        title: 'Top vs Bottom Analysis',
        description: 'Performance tiers as rows, metrics as columns',
        data: createPerformanceMatrix(data)
      },
      {
        title: 'Statistical Overview',
        description: 'Metrics as rows, calculations as columns',
        data: createStatisticalMatrix(data)
      },
      {
        title: 'Quarterly Trends',
        description: 'Quarters as rows, countries as columns',
        data: createQuarterlyMatrix(data)
      }
    ];
    
    return pivots.filter(pivot => pivot.data && pivot.data.length > 1);
  };
  
  const createCountryPivot = (data: any[][]) => {
    const headers = data[0];
    const rows = data.slice(1);
    
    const countryIndex = headers.findIndex((h: string) => 
      String(h).toLowerCase().includes('country') || 
      String(h).toLowerCase().includes('region') ||
      String(h).toLowerCase().includes('name')
    );
    
    const valueIndex = headers.findIndex((h: string) => 
      String(h).toLowerCase().includes('total') ||
      String(h).toLowerCase().includes('value') ||
      String(h).toLowerCase().includes('count')
    );
    
    if (countryIndex === -1 || valueIndex === -1) return null;
    
    const grouped = rows.reduce((acc: any, row) => {
      const country = row[countryIndex] || 'Unknown';
      const value = parseFloat(row[valueIndex]) || 0;
      acc[country] = (acc[country] || 0) + value;
      return acc;
    }, {});
    
    const result = [['Country/Region', 'Total Value']];
    Object.entries(grouped)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .forEach(([country, total]) => {
        result.push([country, (total as number).toFixed(2)]);
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
    
    if (lowerPrompt.includes('rank') && isNumeric) {
      result.push(['Rank', rowHeader, valueHeader]);
      pivotData.forEach((item, index) => {
        const displayValue = isNumeric ? parseFloat(String(item.value)).toFixed(2) : item.value;
        result.push([`#${index + 1}`, item.row, displayValue]);
      });
    } else {
      result.push([rowHeader, valueHeader]);
      pivotData.forEach(item => {
        const displayValue = isNumeric ? parseFloat(String(item.value)).toFixed(2) : item.value;
        result.push([item.row, displayValue]);
      });
    }
    
    return result;
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
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: '"Poppins", -apple-system, BlinkMacSystemFont, sans-serif',
      color: '#ffffff'
    }}>
      {/* Header */}
      <header style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        padding: '20px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <img src="/logo.png" alt="AdvExcel" style={{ height: '40px' }} />
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '600' }}>AdvExcel AI</h1>
            <p style={{ margin: 0, fontSize: '14px', opacity: 0.8 }}>Intelligent Data Analysis</p>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '14px'
          }}>
            Welcome, {user.name}
          </div>
          {(user.email === 'katragadda225@gmail.com' || user.email?.includes('@advexcel.online')) && (
            <button
              onClick={() => {
                localStorage.setItem('use_new_interface', 'false');
                window.location.reload();
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '25px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
              }}
            >
              Basic
            </button>
          )}
          <button
            onClick={onLogout}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '25px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ padding: '40px' }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr 2fr',
          gap: '40px',
          alignItems: 'stretch'
        }}>
          {/* Left Panel - Upload & AI */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            padding: '32px',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            {/* File Upload */}
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '600' }}>
                📁 Upload Your Data
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
              
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: `2px dashed ${dragActive ? '#4ecdc4' : 'rgba(255, 255, 255, 0.3)'}`,
                  borderRadius: '16px',
                  padding: '40px 20px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  background: dragActive ? 'rgba(78, 205, 196, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>
                  {dragActive ? '📥' : '📊'}
                </div>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600' }}>
                  {dragActive ? 'Drop your file here' : 'Drag & drop or click to upload'}
                </h4>
                <p style={{ margin: 0, fontSize: '14px', opacity: 0.7 }}>
                  Excel (.xlsx, .xls) or CSV files
                </p>
              </div>
            </div>

            {/* File Status */}
            {selectedFile && (
              <div style={{
                background: 'rgba(78, 205, 196, 0.2)',
                border: '1px solid rgba(78, 205, 196, 0.4)',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '32px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ fontSize: '20px' }}>✅</div>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '14px' }}>{selectedFile.name}</div>
                    <div style={{ fontSize: '12px', opacity: 0.8 }}>
                      {spreadsheetData.length} rows • {dataStructure?.detectedFormat || 'Processing...'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            {spreadsheetData.length > 0 && (
              <div style={{ marginBottom: '32px' }}>
                <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600' }}>
                  ⚡ Quick Actions
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button
                    onClick={() => setShowChart(!showChart)}
                    style={{
                      background: showChart ? 'linear-gradient(45deg, #ff6b6b, #4ecdc4)' : 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}
                  >
                    📊 {showChart ? 'Hide' : 'Show'} Chart
                  </button>
                  <div style={{ position: 'relative' }}>
                    <button
                      onClick={() => {
                        if (pivotTables.length === 0) {
                          const pivots = generateAdvancedPivotTables(spreadsheetData);
                          setPivotTables(pivots);
                        }
                        setShowPivotDropdown(!showPivotDropdown);
                      }}
                      style={{
                        background: pivotTables.length > 0 ? 'linear-gradient(45deg, #ff6b6b, #4ecdc4)' : 'rgba(255, 255, 255, 0.1)',
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
                        backdropFilter: 'blur(20px)',
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
                    onClick={() => downloadExcel(spreadsheetData, `${selectedFile?.name || 'data'}_export.xlsx`)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}
                  >
                    💾 Export
                  </button>
                </div>
              </div>
            )}

            {/* Analysis Actions */}
            {spreadsheetData.length > 0 && (
              <div style={{ marginBottom: '32px' }}>
                <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600' }}>
                  🔄 Analysis Actions
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button
                    onClick={() => performAutoAnalysis(spreadsheetData)}
                    disabled={aiLoading}
                    style={{
                      background: aiLoading ? 'rgba(255, 255, 255, 0.2)' : 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '12px',
                      padding: '12px 16px',
                      color: 'white',
                      cursor: aiLoading ? 'not-allowed' : 'pointer',
                      fontSize: '13px',
                      fontWeight: '500',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {aiLoading ? '🔄 Analyzing...' : '🧠 Re-run Full Analysis'}
                  </button>
                </div>
              </div>
            )}

            {/* Custom Analysis */}
            <div>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600' }}>
                📝 Custom Analysis
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ask for specific analysis or insights..."
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '12px',
                    padding: '16px',
                    color: 'white',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    minHeight: '80px',
                    outline: 'none'
                  }}
                />
                <button
                  onClick={handleCustomAnalysis}
                  disabled={!prompt.trim() || !spreadsheetData.length || aiLoading}
                  style={{
                    background: aiLoading ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '12px',
                    padding: '16px',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: aiLoading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    opacity: (!prompt.trim() || !spreadsheetData.length) ? 0.5 : 1
                  }}
                >
                  {aiLoading ? '🔄 Processing...' : '🔍 Custom Analysis'}
                </button>
              </div>
            </div>
            
            {/* Custom Pivot */}
            {spreadsheetData.length > 0 && (
              <div style={{ marginTop: '24px' }}>
                <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600' }}>
                  📋 Custom Pivot
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input
                    type="text"
                    value={pivotPrompt}
                    onChange={(e) => setPivotPrompt(e.target.value)}
                    placeholder="e.g., 'countries with economy', 'employees with salary', 'items with price'"
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '12px',
                      padding: '16px',
                      color: 'white',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                  <button
                    onClick={() => {
                      if (pivotPrompt.trim()) {
                        const localPivot = createCustomPivot(spreadsheetData, pivotPrompt);
                        if (localPivot) {
                          const customPivot = {
                            title: 'Custom Pivot',
                            description: pivotPrompt,
                            data: localPivot
                          };
                          setPivotTables([...pivotTables, customPivot]);
                          setSelectedPivot(pivotTables.length);
                          setPivotPrompt('');
                        } else {
                          setAiResponse('❌ Could not create pivot table. Please check column names and try again.');
                        }
                      }
                    }}
                    disabled={!pivotPrompt.trim()}
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '12px',
                      padding: '16px',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      opacity: !pivotPrompt.trim() ? 0.5 : 1
                    }}
                  >
                    ✨ Create Pivot
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Data Display Only */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            padding: '32px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            minHeight: '600px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            {spreadsheetData.length > 0 ? (
              <>
                <div style={{ marginBottom: '16px' }}>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '600' }}>
                    📊 Your Data
                  </h3>
                  <p style={{ margin: 0, fontSize: '14px', opacity: 0.7 }}>
                    {displayData.length - 1} rows × {displayData[0]?.length || 0} columns
                  </p>
                </div>
                
                <div style={{
                  background: 'rgba(255, 255, 255, 0.05)',
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
                      <tr style={{ background: 'rgba(255, 255, 255, 0.1)' }}>
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
            

            
            {/* AI Response in Right Panel */}
            {aiResponse && (
              <div style={{
                marginTop: '32px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '12px',
                padding: '24px'
              }}>
                <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600' }}>
                  💬 AI Analytics Report
                </h4>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '8px',
                  padding: '16px',
                  fontSize: '13px',
                  lineHeight: '1.6',
                  whiteSpace: 'nowrap',
                  overflow: 'auto',
                  maxHeight: '200px',
                  minWidth: '400px'
                }}>
                  <div dangerouslySetInnerHTML={{ __html: aiResponse.replace(/\n/g, '<br>') }} />
                </div>
              </div>
            )}
            
            {/* Top 5 Table */}
            {analyticsData?.top5 && (
              <div style={{
                marginTop: '32px',
                background: 'rgba(76, 205, 196, 0.1)',
                borderRadius: '12px',
                padding: '24px',
                border: '1px solid rgba(76, 205, 196, 0.3)'
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
                      background: 'linear-gradient(45deg, #4ecdc4, #44b3a8)',
                      border: 'none',
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
                background: 'rgba(255, 107, 107, 0.1)',
                borderRadius: '12px',
                padding: '24px',
                border: '1px solid rgba(255, 107, 107, 0.3)'
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
                      background: 'linear-gradient(45deg, #ff6b6b, #e55555)',
                      border: 'none',
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
                background: 'rgba(255, 255, 255, 0.05)',
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
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '12px',
                padding: '24px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>📋 {pivotTables[selectedPivot].title}</h4>
                    <p style={{ margin: '4px 0 0 0', fontSize: '12px', opacity: 0.7 }}>{pivotTables[selectedPivot].description}</p>
                  </div>
                  <button
                    onClick={() => downloadExcel(pivotTables[selectedPivot].data, `${pivotTables[selectedPivot].title.replace(/\s+/g, '_').toLowerCase()}_pivot.xlsx`)}
                    style={{
                      background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
                      border: 'none',
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
                <div style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '8px',
                  overflow: 'auto',
                  maxHeight: '500px',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                    <thead>
                      <tr style={{ background: 'rgba(255, 255, 255, 0.1)' }}>
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
                      {pivotTables[selectedPivot].data.slice(1).map((row: any[], rowIndex: number) => (
                        <tr key={rowIndex}>
                          {row.map((cell: any, cellIndex: number) => (
                            <td key={cellIndex} style={{
                              padding: '10px 16px',
                              fontSize: '12px',
                              borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                              whiteSpace: 'nowrap'
                            }}>
                              {String(cell || '')}
                            </td>
                          ))}
                        </tr>
                      ))}
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
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            padding: '32px',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
                📊 Data Visualization
              </h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                {(['bar', 'line', 'pie'] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => setChartType(type)}
                    style={{
                      background: chartType === type ? 'linear-gradient(45deg, #ff6b6b, #4ecdc4)' : 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '8px',
                      padding: '8px 16px',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '500',
                      textTransform: 'capitalize'
                    }}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', padding: '24px' }}>
              <ChartComponent 
                data={spreadsheetData} 
                type={chartType}
                title={`${selectedFile?.name || 'Data'} - ${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart`}
              />
            </div>
          </div>
        )}




      </main>
      
      {/* Footer with Legal Pages */}
      <footer style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.2)',
        color: 'white',
        padding: '40px',
        textAlign: 'center'
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', flexWrap: 'wrap', marginBottom: '20px' }}>
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
        <p style={{ margin: 0, fontSize: '14px', opacity: 0.7 }}>
          © 2024 AdvExcel AI. All rights reserved. | Powered by AWS
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
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            padding: '32px',
            maxWidth: '600px',
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
                  background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
                  color: 'white',
                  border: 'none',
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
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1))',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            color: 'white',
            cursor: 'pointer',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            const target = e.target as HTMLElement;
            target.style.transform = 'scale(1.1)';
            target.style.background = 'linear-gradient(145deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.2))';
          }}
          onMouseLeave={(e) => {
            const target = e.target as HTMLElement;
            target.style.transform = 'scale(1)';
            target.style.background = 'linear-gradient(145deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1))';
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
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            padding: '20px',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <h4 style={{ margin: '0 0 12px 0', color: '#333', fontSize: '16px', fontWeight: '600' }}>Send Feedback</h4>
            <textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Share your thoughts about AdvExcel..."
              style={{
                width: '100%',
                height: '80px',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '14px',
                fontFamily: 'inherit',
                resize: 'none',
                outline: 'none',
                boxSizing: 'border-box',
                background: 'rgba(255, 255, 255, 0.8)',
                color: '#333'
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
                  background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
                  color: 'white',
                  border: 'none',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.3s ease'
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
                  background: 'rgba(255, 255, 255, 0.8)',
                  color: '#333',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  transition: 'all 0.3s ease'
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