import OpenAI from 'openai';

// Initialize OpenAI client
const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

// Security check - don't expose API key in console logs
if (!apiKey) {
  console.warn('OpenAI API key not found. Please set VITE_OPENAI_API_KEY in your .env file');
}

const openai = new OpenAI({
  apiKey: apiKey,
  dangerouslyAllowBrowser: true // Note: In production, this should be handled server-side
});

export interface ExcelOperation {
  type: 'sum' | 'average' | 'filter' | 'sort' | 'formula' | 'format' | 'custom' | 'pivot' | 'lookup' | 'analytics' | 'chart';
  description: string;
  result?: any;
  formulas?: string[][];
  conditionalFormatting?: any[];
  pivotTable?: any;
  chartData?: any;
}

export interface AdvancedExcelResult {
  operation: ExcelOperation;
  newData: any[][];
  formulas?: string[][];
  conditionalFormatting?: any[];
  pivotTable?: any;
  chartData?: any;
  analytics?: any;
}

export class AIService {
  static async processExcelPrompt(
    prompt: string, 
    spreadsheetData: any[][], 
    currentData: any[][]
  ): Promise<AdvancedExcelResult> {
    
    try {
      // Convert spreadsheet data to a format that's easier for AI to understand
      const dataDescription = this.formatDataForAI(spreadsheetData);
      
      const systemPrompt = `You are an advanced Excel AI assistant with full Excel functionality. You can perform various operations on spreadsheet data.

Available operations:
- SUM: Sum values in a column or range
- AVERAGE: Calculate average of values
- FILTER: Filter rows based on conditions
- SORT: Sort data by columns
- FORMULA: Apply Excel formulas (XLOOKUP, VLOOKUP, IF, SUMIF, etc.)
- FORMAT: Apply conditional formatting rules
- PIVOT: Create pivot table summaries
- LOOKUP: Perform XLOOKUP, VLOOKUP, HLOOKUP operations
- ANALYTICS: Provide data analysis and insights
- CHART: Generate chart data and recommendations
- CUSTOM: Any other Excel operation

Current data structure: ${dataDescription}

IMPORTANT: Analyze the user's request carefully and identify the specific operation they want.
- If they mention formulas, return the actual Excel formula syntax
- If they want conditional formatting, specify the rules
- If they want pivot tables, provide the structure
- If they want lookups, use XLOOKUP or VLOOKUP as appropriate
- If they want analytics, provide comprehensive insights

Respond with a JSON object containing:
{
  "operation": {
    "type": "sum|average|filter|sort|formula|format|pivot|lookup|analytics|chart|custom",
    "description": "What operation was performed"
  },
  "instructions": "Step-by-step instructions for the user",
  "newData": [array of arrays representing the modified spreadsheet data],
  "formulas": [array of arrays with Excel formulas where applicable],
  "conditionalFormatting": [array of formatting rules],
  "pivotTable": {pivot table configuration if requested},
  "chartData": {chart configuration if requested},
  "analytics": {data analysis results if requested}
}

Only return valid JSON.`;

      const userPrompt = `User request: "${prompt}"

Current spreadsheet data:
${JSON.stringify(currentData, null, 2)}

Please perform the requested operation and return the result.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.1,
        max_tokens: 3000
      });

      const response = completion.choices[0]?.message?.content;
      
      if (!response) {
        throw new Error('No response from AI');
      }

      // Parse the AI response
      const result = JSON.parse(response);
      
      return {
        operation: result.operation,
        newData: result.newData || currentData,
        formulas: result.formulas,
        conditionalFormatting: result.conditionalFormatting,
        pivotTable: result.pivotTable,
        chartData: result.chartData,
        analytics: result.analytics
      };

    } catch (error) {
      console.error('AI processing error:', error);
      
      // Fallback: Try to handle common operations manually
      return this.handleCommonOperations(prompt, currentData);
    }
  }

  private static formatDataForAI(data: any[][]): string {
    if (!data.length) return 'Empty dataset';
    
    const headers = data[0] || [];
    const sampleRows = data.slice(1, 4);
    
    return `Headers: ${headers.join(', ')}
Sample data: ${sampleRows.map(row => row.join(', ')).join(' | ')}
Total rows: ${data.length}`;
  }

  private static handleCommonOperations(prompt: string, data: any[][]): AdvancedExcelResult {
    const lowerPrompt = prompt.toLowerCase();
    
    // Handle basic sum operations
    if (lowerPrompt.includes('sum')) {
      const columnMatch = prompt.match(/column\s+([A-Za-z])/i);
      if (columnMatch) {
        const columnIndex = this.letterToIndex(columnMatch[1]);
        const sum = data.slice(1).reduce((acc, row) => acc + (Number(row[columnIndex]) || 0), 0);
        
        return {
          operation: { type: 'sum', description: `Sum of column ${columnMatch[1]}: ${sum}` },
          newData: data,
          formulas: [[`=SUM(${columnMatch[1].toUpperCase()}:${columnMatch[1].toUpperCase()})`]]
        };
      }
    }
    
    // Handle basic average operations
    if (lowerPrompt.includes('average') || lowerPrompt.includes('avg')) {
      const columnMatch = prompt.match(/column\s+([A-Za-z])/i);
      if (columnMatch) {
        const columnIndex = this.letterToIndex(columnMatch[1]);
        const values = data.slice(1).map(row => Number(row[columnIndex])).filter(v => !isNaN(v));
        const avg = values.reduce((acc, val) => acc + val, 0) / values.length;
        
        return {
          operation: { type: 'average', description: `Average of column ${columnMatch[1]}: ${avg.toFixed(2)}` },
          newData: data,
          formulas: [[`=AVERAGE(${columnMatch[1].toUpperCase()}:${columnMatch[1].toUpperCase()})`]]
        };
      }
    }
    
    // Default fallback
    return {
      operation: { type: 'custom', description: 'Operation completed' },
      newData: data
    };
  }

  private static letterToIndex(letter: string): number {
    return letter.toUpperCase().charCodeAt(0) - 65;
  }

  // Advanced Excel operations
  static createXLookup(lookupValue: any, lookupArray: any[], returnArray: any[]): any {
    const index = lookupArray.indexOf(lookupValue);
    return index >= 0 ? returnArray[index] : null;
  }

  static createPivotTable(data: any[][], rowField: number, valueField: number): any {
    const pivot: { [key: string]: number } = {};
    
    data.slice(1).forEach(row => {
      const rowValue = row[rowField];
      const value = Number(row[valueField]) || 0;
      pivot[rowValue] = (pivot[rowValue] || 0) + value;
    });
    
    return {
      headers: ['Category', 'Total'],
      data: Object.entries(pivot).map(([key, value]) => [key, value])
    };
  }

  static applyConditionalFormatting(data: any[][], column: number, condition: string, style: any): any[] {
    return data.map((row, index) => {
      const value = row[column];
      let shouldFormat = false;
      
      if (condition.includes('>')) {
        const threshold = parseFloat(condition.split('>')[1]);
        shouldFormat = Number(value) > threshold;
      } else if (condition.includes('<')) {
        const threshold = parseFloat(condition.split('<')[1]);
        shouldFormat = Number(value) < threshold;
      }
      
      return shouldFormat ? { row: index, col: column, style } : null;
    }).filter(Boolean);
  }
} 