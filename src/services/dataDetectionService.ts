/**
 * Data Detection Service - Intelligently analyzes spreadsheet data structure
 */

export interface DataColumn {
  index: number;
  name: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'mixed';
  samples: (string | number | boolean | null)[];
  nullCount: number;
  uniqueCount: number;
  pattern?: string;
}

export interface DataStructure {
  hasHeaders: boolean;
  rowCount: number;
  columnCount: number;
  columns: DataColumn[];
  dataQuality: {
    completeness: number; // 0-1
    consistency: number; // 0-1
    duplicateRows: number;
  };
  suggestedOperations: string[];
  detectedFormat: 'restaurant' | 'healthcare' | 'financial' | 'sports' | 'education' | 'hr' | 'ecommerce' | 'realestate' | 'manufacturing' | 'government' | 'media' | 'logistics' | 'survey' | 'analytics' | 'banking' | 'general';
}

export class DataDetectionService {
  /**
   * Analyze spreadsheet data and detect its structure
   */
  static analyzeData(data: (string | number | boolean | null | undefined)[][]): DataStructure {
    if (!data || data.length === 0) {
      throw new Error('No data provided for analysis');
    }

    const hasHeaders = this.detectHeaders(data);
    const startRow = hasHeaders ? 1 : 0;
    const dataRows = data.slice(startRow);
    
    const columns = this.analyzeColumns(data, hasHeaders);
    const dataQuality = this.assessDataQuality(dataRows);
    const detectedFormat = this.detectDataFormat(columns, data);
    const suggestedOperations = this.generateSuggestions(columns, detectedFormat, dataQuality);

    return {
      hasHeaders,
      rowCount: dataRows.length,
      columnCount: data[0]?.length || 0,
      columns,
      dataQuality,
      suggestedOperations,
      detectedFormat
    };
  }

  /**
   * Detect if first row contains headers
   */
  private static detectHeaders(data: (string | number | boolean | null | undefined)[][]): boolean {
    if (data.length < 2) return false;
    
    const firstRow = data[0];
    const secondRow = data[1];
    
    let textInFirst = 0;
    let numbersInSecond = 0;
    
    for (let i = 0; i < Math.min(firstRow.length, secondRow.length); i++) {
      // Check if first row has text
      if (typeof firstRow[i] === 'string' && isNaN(Number(firstRow[i]))) {
        textInFirst++;
      }
      
      // Check if second row has numbers
      if (typeof secondRow[i] === 'number' || !isNaN(Number(secondRow[i]))) {
        numbersInSecond++;
      }
    }
    
    // If first row is mostly text and second row has numbers, likely headers
    return textInFirst > firstRow.length * 0.6 && numbersInSecond > 0;
  }

  /**
   * Analyze each column's data type and characteristics
   */
  private static analyzeColumns(data: (string | number | boolean | null | undefined)[][], hasHeaders: boolean): DataColumn[] {
    if (!data[0]) return [];
    
    const columns: DataColumn[] = [];
    const headerRow = hasHeaders ? data[0] : null;
    const dataRows = data.slice(hasHeaders ? 1 : 0);
    
    for (let colIndex = 0; colIndex < data[0].length; colIndex++) {
      const columnData = dataRows.map(row => row[colIndex]);
      const nonNullData = columnData.filter(val => val !== null && val !== undefined && val !== '');
      
      const column: DataColumn = {
        index: colIndex,
        name: headerRow?.[colIndex]?.toString() || `Column ${colIndex + 1}`,
        type: this.detectColumnType(nonNullData),
        samples: nonNullData.slice(0, 5),
        nullCount: columnData.length - nonNullData.length,
        uniqueCount: new Set(nonNullData.map(v => String(v))).size
      };
      
      // Detect patterns for specific types
      if (column.type === 'text') {
        column.pattern = this.detectTextPattern(nonNullData);
      }
      
      columns.push(column);
    }
    
    return columns;
  }

  /**
   * Detect the data type of a column
   */
  private static detectColumnType(values: (string | number | boolean | null | undefined)[]): DataColumn['type'] {
    if (values.length === 0) return 'text';
    
    let numberCount = 0;
    let dateCount = 0;
    let booleanCount = 0;
    
    for (const value of values) {
      if (typeof value === 'number' || (!isNaN(Number(value)) && value !== '')) {
        numberCount++;
      } else if (this.isDate(value)) {
        dateCount++;
      } else if (this.isBoolean(value)) {
        booleanCount++;
      }
    }
    
    const total = values.length;
    
    if (numberCount / total > 0.8) return 'number';
    if (dateCount / total > 0.8) return 'date';
    if (booleanCount / total > 0.8) return 'boolean';
    if (numberCount > 0 && numberCount / total > 0.3) return 'mixed';
    
    return 'text';
  }

  /**
   * Check if a value could be a date
   */
  private static isDate(value: any): boolean {
    if (!value) return false;
    const dateStr = String(value);
    
    // Common date patterns
    const datePatterns = [
      /^\d{4}-\d{2}-\d{2}$/,           // YYYY-MM-DD
      /^\d{2}\/\d{2}\/\d{4}$/,        // MM/DD/YYYY
      /^\d{2}-\d{2}-\d{4}$/,          // MM-DD-YYYY
      /^\d{1,2}\/\d{1,2}\/\d{2,4}$/   // M/D/YY or MM/DD/YYYY
    ];
    
    return datePatterns.some(pattern => pattern.test(dateStr)) && !isNaN(Date.parse(dateStr));
  }

  /**
   * Check if a value is boolean-like
   */
  private static isBoolean(value: any): boolean {
    if (typeof value === 'boolean') return true;
    const str = String(value).toLowerCase();
    return ['true', 'false', 'yes', 'no', '1', '0', 'y', 'n'].includes(str);
  }

  /**
   * Detect text patterns (email, phone, etc.)
   */
  private static detectTextPattern(values: (string | number | boolean | null | undefined)[]): string | undefined {
    const samples = values.slice(0, 10).map(v => String(v));
    
    // Email pattern
    if (samples.some(s => /@/.test(s))) return 'email';
    
    // Phone pattern
    if (samples.some(s => /^\+?[\d\s\-\(\)]{10,}$/.test(s))) return 'phone';
    
    // URL pattern
    if (samples.some(s => /^https?:\/\//.test(s))) return 'url';
    
    // ID pattern (alphanumeric codes)
    if (samples.every(s => /^[A-Z0-9\-_]{3,}$/i.test(s))) return 'id';
    
    return undefined;
  }

  /**
   * Assess overall data quality
   */
  private static assessDataQuality(dataRows: (string | number | boolean | null | undefined)[][]): DataStructure['dataQuality'] {
    if (dataRows.length === 0) {
      return { completeness: 0, consistency: 0, duplicateRows: 0 };
    }
    
    const totalCells = dataRows.length * (dataRows[0]?.length || 0);
    const emptyCells = dataRows.flat().filter(cell => 
      cell === null || cell === undefined || cell === ''
    ).length;
    
    const completeness = totalCells > 0 ? (totalCells - emptyCells) / totalCells : 0;
    
    // Check for duplicate rows
    const rowStrings = dataRows.map(row => JSON.stringify(row));
    const uniqueRows = new Set(rowStrings);
    const duplicateRows = rowStrings.length - uniqueRows.size;
    
    // Consistency check (simplified)
    const consistency = completeness > 0.8 ? 0.9 : completeness * 0.7;
    
    return {
      completeness,
      consistency,
      duplicateRows
    };
  }

  /**
   * Detect the format/domain of the data with enhanced industry recognition
   */
  private static detectDataFormat(columns: DataColumn[], data: (string | number | boolean | null | undefined)[][]): DataStructure['detectedFormat'] {
    const columnNames = columns.map(c => c.name.toLowerCase());
    const hasNumbers = columns.some(c => c.type === 'number');
    
    // Restaurant/Hospitality
    if (columnNames.some(name => 
      ['menu', 'order', 'table', 'server', 'restaurant', 'food', 'beverage', 'covers', 'gst', 'invoice'].some(keyword => name.includes(keyword))
    )) {
      return 'restaurant';
    }
    
    // Healthcare/Medical
    if (columnNames.some(name => 
      ['patient', 'doctor', 'diagnosis', 'treatment', 'medical', 'hospital', 'clinic', 'prescription', 'symptoms'].some(keyword => name.includes(keyword))
    )) {
      return 'healthcare';
    }
    
    // Financial/Accounting
    if (columnNames.some(name => 
      ['amount', 'balance', 'transfer', 'payment', 'account', 'debit', 'credit', 'transaction', 'receivable'].some(keyword => name.includes(keyword))
    )) {
      return 'financial';
    }
    
    // Sports/Athletics
    if (columnNames.some(name => 
      ['score', 'points', 'goals', 'match', 'player', 'team', 'game', 'tournament', 'league', 'stats'].some(keyword => name.includes(keyword))
    )) {
      return 'sports';
    }
    
    // Education/Academic
    if (columnNames.some(name => 
      ['student', 'grade', 'marks', 'exam', 'subject', 'class', 'school', 'college', 'course', 'semester'].some(keyword => name.includes(keyword))
    )) {
      return 'education';
    }
    
    // HR/Employee Management
    if (columnNames.some(name => 
      ['employee', 'salary', 'department', 'designation', 'attendance', 'leave', 'performance', 'appraisal'].some(keyword => name.includes(keyword))
    )) {
      return 'hr';
    }
    
    // E-commerce/Retail
    if (columnNames.some(name => 
      ['product', 'sku', 'inventory', 'stock', 'price', 'discount', 'category', 'brand', 'sales'].some(keyword => name.includes(keyword))
    )) {
      return 'ecommerce';
    }
    
    // Real Estate
    if (columnNames.some(name => 
      ['property', 'rent', 'lease', 'tenant', 'landlord', 'area', 'location', 'broker', 'commission'].some(keyword => name.includes(keyword))
    )) {
      return 'realestate';
    }
    
    // Manufacturing
    if (columnNames.some(name => 
      ['production', 'manufacturing', 'quality', 'defect', 'batch', 'machine', 'operator', 'shift'].some(keyword => name.includes(keyword))
    )) {
      return 'manufacturing';
    }
    
    // Government/Public Sector
    if (columnNames.some(name => 
      ['citizen', 'government', 'public', 'policy', 'budget', 'tax', 'compliance', 'regulation'].some(keyword => name.includes(keyword))
    )) {
      return 'government';
    }
    
    // Media/News
    if (columnNames.some(name => 
      ['article', 'news', 'media', 'journalist', 'publication', 'views', 'engagement', 'social'].some(keyword => name.includes(keyword))
    )) {
      return 'media';
    }
    
    // Transportation/Logistics
    if (columnNames.some(name => 
      ['vehicle', 'driver', 'route', 'delivery', 'shipment', 'logistics', 'transport', 'fuel'].some(keyword => name.includes(keyword))
    )) {
      return 'logistics';
    }
    
    // Survey/Research
    if (columnNames.some(name => 
      ['survey', 'response', 'rating', 'feedback', 'satisfaction', 'research', 'questionnaire'].some(keyword => name.includes(keyword))
    )) {
      return 'survey';
    }
    
    // Digital Marketing/Analytics
    if (hasNumbers && columnNames.some(name => 
      ['views', 'clicks', 'conversion', 'traffic', 'users', 'sessions', 'ctr', 'impressions'].some(keyword => name.includes(keyword))
    )) {
      return 'analytics';
    }
    
    // Banking/Finance
    if (columnNames.some(name => 
      ['loan', 'interest', 'bank', 'credit', 'deposit', 'withdrawal', 'branch', 'customer'].some(keyword => name.includes(keyword))
    )) {
      return 'banking';
    }
    
    return 'general';
  }

  /**
   * Generate intelligent suggestions based on detected structure
   */
  private static generateSuggestions(columns: DataColumn[], format: DataStructure['detectedFormat'], quality: DataStructure['dataQuality']): string[] {
    const suggestions: string[] = [];
    
    // Data quality suggestions
    if (quality.completeness < 0.8) {
      suggestions.push('Clean missing data - remove or fill empty cells');
    }
    
    if (quality.duplicateRows > 0) {
      suggestions.push(`Remove ${quality.duplicateRows} duplicate rows`);
    }
    
    // Column-specific suggestions
    const numberColumns = columns.filter(c => c.type === 'number');
    const textColumns = columns.filter(c => c.type === 'text');
    
    if (numberColumns.length > 1) {
      suggestions.push('Create summary statistics (sum, average, min, max)');
      suggestions.push('Generate comparison charts between numeric columns');
    }
    
    if (textColumns.length > 0) {
      suggestions.push('Add filters to text columns for easy searching');
    }
    
    // Industry-specific suggestions
    switch (format) {
      case 'restaurant':
        suggestions.push('Analyze sales by menu items and time periods');
        suggestions.push('Calculate server performance and table turnover');
        suggestions.push('Generate GST and tax compliance reports');
        break;
        
      case 'healthcare':
        suggestions.push('Track patient outcomes and treatment effectiveness');
        suggestions.push('Analyze appointment patterns and resource utilization');
        suggestions.push('Generate medical compliance and billing reports');
        break;
        
      case 'financial':
        suggestions.push('Calculate cash flow and balance reconciliation');
        suggestions.push('Analyze payment patterns and receivables');
        suggestions.push('Generate financial health and risk assessments');
        break;
        
      case 'sports':
        suggestions.push('Calculate player statistics and team performance');
        suggestions.push('Analyze game patterns and winning strategies');
        suggestions.push('Generate league standings and tournament brackets');
        break;
        
      case 'education':
        suggestions.push('Analyze student performance and grade distributions');
        suggestions.push('Track attendance patterns and academic progress');
        suggestions.push('Generate report cards and academic analytics');
        break;
        
      case 'hr':
        suggestions.push('Analyze employee performance and satisfaction');
        suggestions.push('Track attendance, leave patterns, and productivity');
        suggestions.push('Generate payroll and benefits analysis');
        break;
        
      case 'ecommerce':
        suggestions.push('Analyze product performance and inventory turnover');
        suggestions.push('Track customer behavior and purchase patterns');
        suggestions.push('Generate sales forecasts and pricing optimization');
        break;
        
      case 'survey':
        suggestions.push('Calculate response distributions and satisfaction scores');
        suggestions.push('Analyze feedback patterns and sentiment trends');
        suggestions.push('Generate response rate and demographic analysis');
        break;
        
      case 'analytics':
        suggestions.push('Calculate conversion rates and user engagement');
        suggestions.push('Analyze traffic patterns and performance metrics');
        suggestions.push('Generate ROI and campaign effectiveness reports');
        break;
        
      default:
        if (numberColumns.length > 0) {
          suggestions.push('Sort data by numeric columns');
          suggestions.push('Create pivot table analysis');
        }
    }
    
    // Always suggest basic operations
    suggestions.push('Add conditional formatting to highlight important values');
    suggestions.push('Create data validation rules');
    
    return suggestions.slice(0, 6); // Limit to 6 suggestions
  }

  /**
   * Generate smart prompts based on detected data structure
   */
  static generateSmartPrompts(structure: DataStructure): string[] {
    const prompts: string[] = [];
    const { columns, detectedFormat } = structure;
    
    const numberColumns = columns.filter(c => c.type === 'number');
    const textColumns = columns.filter(c => c.type === 'text');
    
    // Format-specific prompts
    switch (detectedFormat) {
      case 'financial':
        prompts.push('analyze financial performance and trends');
        prompts.push('calculate profit margins and growth rates');
        prompts.push('identify top performing categories');
        break;
        
      case 'survey':
        prompts.push('analyze survey responses and satisfaction scores');
        prompts.push('identify response patterns and trends');
        prompts.push('calculate average ratings by category');
        break;
        
      case 'inventory':
        prompts.push('analyze inventory levels and turnover');
        prompts.push('identify low stock items');
        prompts.push('calculate reorder points and quantities');
        break;
        
      case 'analytics':
        prompts.push('analyze website traffic and user behavior');
        prompts.push('calculate conversion rates and performance metrics');
        prompts.push('identify top performing channels');
        break;
    }
    
    // Column-specific prompts
    if (numberColumns.length > 1) {
      const col1 = numberColumns[0].name;
      const col2 = numberColumns[1].name;
      prompts.push(`compare ${col1} vs ${col2} with charts`);
      prompts.push(`calculate correlation between ${col1} and ${col2}`);
    }
    
    if (textColumns.length > 0 && numberColumns.length > 0) {
      const textCol = textColumns[0].name;
      const numCol = numberColumns[0].name;
      prompts.push(`analyze ${numCol} by ${textCol} categories`);
      prompts.push(`create breakdown of ${numCol} across ${textCol}`);
    }
    
    // General prompts
    prompts.push('create summary statistics for all numeric data');
    prompts.push('highlight outliers and unusual values');
    prompts.push('generate data quality report');
    
    return prompts.slice(0, 8);
  }
}