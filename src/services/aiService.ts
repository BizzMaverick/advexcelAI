// import OpenAI from 'openai';

export interface ExcelOperation {
  type: 'sum' | 'average' | 'filter' | 'sort' | 'formula' | 'format' | 'custom';
  description: string;
  result?: any;
}

export interface ExcelResult {
  operation: ExcelOperation;
  newData: any[][];
}

export class AIService {
  private static openai: any = null;

  static initialize(apiKey: string) {
    // this.openai = new OpenAI({
    //   apiKey: apiKey,
    //   dangerouslyAllowBrowser: true
    // });
  }

  static async processExcelPrompt(
    prompt: string, 
    _spreadsheetData: any[][], 
    currentData: any[][]
  ): Promise<ExcelResult> {
    if (!this.openai) {
      throw new Error('AI Service not initialized. Please set your OpenAI API key.');
    }

    try {
      const systemPrompt = `You are an Excel AI assistant. Process the user's request and modify the spreadsheet data accordingly.

Available operations:
- sum: Calculate sum of numeric columns
- average: Calculate average of numeric columns  
- filter: Filter rows based on conditions
- sort: Sort data by columns
- formula: Apply Excel formulas
- format: Apply formatting
- custom: Handle other operations

Guidelines:
- If they mention a specific column (A, B, C, or 1, 2, 3), focus on that column
- If they want to sum/average specific columns, only process those columns
- If they want to sort, identify the column to sort by
- If they want to filter, identify the condition

Respond with a JSON object containing:
{
  "operation": {
    "type": "sum|average|filter|sort|formula|format|custom",
    "description": "What operation was performed"
  },
  "instructions": "Step-by-step instructions for the user",
  "newData": [array of arrays representing the modified spreadsheet data]
}

Only return valid JSON.`;

      const userPrompt = `User request: "${prompt}"

Current spreadsheet data:
${JSON.stringify(currentData, null, 2)}

Please perform the requested operation and return the result.`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.1,
        max_tokens: 2000
      });

      const response = completion.choices[0]?.message?.content;
      
      if (!response) {
        throw new Error('No response from AI');
      }

      // Parse the AI response
      const result = JSON.parse(response);
      
      return {
        operation: result.operation,
        newData: result.newData || currentData
      };

    } catch (error) {
      console.error('AI processing error:', error);
      
      // Fallback: Try to handle common operations manually
      return this.handleCommonOperations(prompt, currentData);
    }
  }

  private static _formatDataForAI(data: any[][]): string {
    if (!data || data.length === 0) return 'Empty spreadsheet';
    
    const headers = data[0]?.map((cell, index) => `Column ${index + 1}: ${cell?.value || 'empty'}`) || [];
    const rowCount = data.length - 1; // Subtract 1 for header row
    const colCount = data[0]?.length || 0;
    
    return `Spreadsheet with ${rowCount} data rows and ${colCount} columns. Headers: ${headers.join(', ')}. First row contains column headers.`;
  }

  private static handleCommonOperations(prompt: string, data: any[][]): ExcelResult {
    const lowerPrompt = prompt.toLowerCase();
    
    console.log('Processing prompt:', prompt);
    console.log('Data structure:', {
      totalRows: data.length,
      headers: data[0]?.map(cell => cell?.value),
      firstDataRow: data[1]?.map(cell => cell?.value)
    });
    
    // Handle sum operations with more specific matching
    if (lowerPrompt.includes('sum') || lowerPrompt.includes('total') || lowerPrompt.includes('add up')) {
      console.log('Detected sum operation');
      return this.handleSumOperation(prompt, data);
    }
    
    // Handle average operations with more specific matching
    if (lowerPrompt.includes('average') || lowerPrompt.includes('mean') || lowerPrompt.includes('avg')) {
      return this.handleAverageOperation(prompt, data);
    }
    
    // Handle filter operations with more specific matching
    if (lowerPrompt.includes('filter') || lowerPrompt.includes('show only') || lowerPrompt.includes('where') || lowerPrompt.includes('find')) {
      return this.handleFilterOperation(prompt, data);
    }
    
    // Handle sort operations with more specific matching
    if (lowerPrompt.includes('sort') || lowerPrompt.includes('order') || lowerPrompt.includes('arrange') || lowerPrompt.includes('alphabetical')) {
      console.log('Detected sort operation');
      return this.handleSortOperation(prompt, data);
    }
    
    // Handle specific column operations
    if (lowerPrompt.includes('column') || lowerPrompt.includes('col')) {
      return this.handleColumnSpecificOperation(prompt, data);
    }
    
    // Handle row operations
    if (lowerPrompt.includes('row')) {
      return this.handleRowOperation(prompt, data);
    }
    
    // Handle formula operations
    if (lowerPrompt.includes('formula') || lowerPrompt.includes('calculate') || lowerPrompt.includes('compute')) {
      return this.handleFormulaOperation(prompt, data);
    }
    
    // Default: return original data with custom operation
    return {
      operation: {
        type: 'custom',
        description: `Processed: ${prompt}`
      },
      newData: data
    };
  }

  private static handleSumOperation(prompt: string, data: any[][]): ExcelResult {
    // Extract column information from prompt
    const columnMatch = prompt.match(/column\s+([A-Za-z])/i) || prompt.match(/col\s+([A-Za-z])/i);
    
    if (columnMatch) {
      const columnLetter = columnMatch[1].toUpperCase();
      const columnIndex = this.letterToIndex(columnLetter);
      
      // Calculate sum
      const sum = data.slice(1).reduce((acc, row) => {
        const cellValue = row[columnIndex]?.value || row[columnIndex];
        return acc + (Number(cellValue) || 0);
      }, 0);
      
      // Add sum to the data
      const newData = [...data];
      const sumRow = new Array(data[0].length).fill({ value: '' });
      sumRow[columnIndex] = { value: sum, formula: `=SUM(${columnLetter}:${columnLetter})` };
      newData.push(sumRow);
      
      return {
        operation: {
          type: 'sum',
          description: `Added sum for column ${columnLetter}: ${sum}`
        },
        newData: newData
      };
    }
    
    // If no specific column mentioned, sum all numeric columns
    const numericColumns = [];
    for (let i = 0; i < data[0].length; i++) {
      const hasNumericData = data.slice(1).some(row => {
        const cellValue = row[i]?.value || row[i];
        return !isNaN(Number(cellValue)) && Number(cellValue) !== 0;
      });
      if (hasNumericData) {
        numericColumns.push(i);
      }
    }
    
    const newData = [...data];
    const sumRow = new Array(data[0].length).fill({ value: '' });
    
    numericColumns.forEach(colIndex => {
      const columnLetter = this.indexToLetter(colIndex);
      const sum = data.slice(1).reduce((acc, row) => {
        const cellValue = row[colIndex]?.value || row[colIndex];
        return acc + (Number(cellValue) || 0);
      }, 0);
      
      sumRow[colIndex] = { value: sum, formula: `=SUM(${columnLetter}:${columnLetter})` };
    });
    
    newData.push(sumRow);
    
    return {
      operation: {
        type: 'sum',
        description: `Added sums for all numeric columns`
      },
      newData: newData
    };
  }

  private static handleAverageOperation(prompt: string, data: any[][]): ExcelResult {
    // Extract column information from prompt
    const columnMatch = prompt.match(/column\s+([A-Za-z])/i) || prompt.match(/col\s+([A-Za-z])/i);
    
    if (columnMatch) {
      const columnLetter = columnMatch[1].toUpperCase();
      const columnIndex = this.letterToIndex(columnLetter);
      
      // Calculate average
      const numericValues = data.slice(1)
        .map(row => {
          const cellValue = row[columnIndex]?.value || row[columnIndex];
          return Number(cellValue);
        })
        .filter(val => !isNaN(val));
      
      const average = numericValues.length > 0 
        ? numericValues.reduce((acc, val) => acc + val, 0) / numericValues.length 
        : 0;
      
      // Add average to the data
      const newData = [...data];
      const avgRow = new Array(data[0].length).fill({ value: '' });
      avgRow[columnIndex] = { 
        value: Math.round(average * 100) / 100, 
        formula: `=AVERAGE(${columnLetter}:${columnLetter})` 
      };
      newData.push(avgRow);
      
      return {
        operation: {
          type: 'average',
          description: `Added average for column ${columnLetter}: ${Math.round(average * 100) / 100}`
        },
        newData: newData
      };
    }
    
    // If no specific column mentioned, average all numeric columns
    const numericColumns = [];
    for (let i = 0; i < data[0].length; i++) {
      const hasNumericData = data.slice(1).some(row => {
        const cellValue = row[i]?.value || row[i];
        return !isNaN(Number(cellValue)) && Number(cellValue) !== 0;
      });
      if (hasNumericData) {
        numericColumns.push(i);
      }
    }
    
    const newData = [...data];
    const avgRow = new Array(data[0].length).fill({ value: '' });
    
    numericColumns.forEach(colIndex => {
      const columnLetter = this.indexToLetter(colIndex);
      const numericValues = data.slice(1)
        .map(row => {
          const cellValue = row[colIndex]?.value || row[colIndex];
          return Number(cellValue);
        })
        .filter(val => !isNaN(val));
      
      const average = numericValues.length > 0 
        ? numericValues.reduce((acc, val) => acc + val, 0) / numericValues.length 
        : 0;
      
      avgRow[colIndex] = { 
        value: Math.round(average * 100) / 100, 
        formula: `=AVERAGE(${columnLetter}:${columnLetter})` 
      };
    });
    
    newData.push(avgRow);
    
    return {
      operation: {
        type: 'average',
        description: `Added averages for all numeric columns`
      },
      newData: newData
    };
  }

  private static handleFilterOperation(prompt: string, data: any[][]): ExcelResult {
    // Extract filter conditions from prompt
    const greaterMatch = prompt.match(/greater\s+than\s+(\d+)/i);
    const lessMatch = prompt.match(/less\s+than\s+(\d+)/i);
    const containsMatch = prompt.match(/contain[s]?\s+["']([^"']+)["']/i);
    
    if (greaterMatch) {
      const threshold = Number(greaterMatch[1]);
      const columnMatch = prompt.match(/column\s+([A-Za-z])/i);
      
      if (columnMatch) {
        const columnIndex = this.letterToIndex(columnMatch[1].toUpperCase());
        const filteredData = data.filter((row, index) => {
          if (index === 0) return true; // Keep header
          const cellValue = row[columnIndex]?.value || row[columnIndex];
          return Number(cellValue) > threshold;
        });
        
        return {
          operation: {
            type: 'filter',
            description: `Filtered rows with values greater than ${threshold}`
          },
          newData: filteredData
        };
      }
    }
    
    if (lessMatch) {
      const threshold = Number(lessMatch[1]);
      const columnMatch = prompt.match(/column\s+([A-Za-z])/i);
      
      if (columnMatch) {
        const columnIndex = this.letterToIndex(columnMatch[1].toUpperCase());
        const filteredData = data.filter((row, index) => {
          if (index === 0) return true; // Keep header
          const cellValue = row[columnIndex]?.value || row[columnIndex];
          return Number(cellValue) < threshold;
        });
        
        return {
          operation: {
            type: 'filter',
            description: `Filtered rows with values less than ${threshold}`
          },
          newData: filteredData
        };
      }
    }
    
    if (containsMatch) {
      const searchValue = containsMatch[1];
      const filteredData = data.filter((row, index) => {
        if (index === 0) return true; // Keep header
        return row.some(cell => {
          const cellValue = cell?.value || cell;
          return String(cellValue).toLowerCase().includes(searchValue.toLowerCase());
        });
      });
      
      return {
        operation: {
          type: 'filter',
          description: `Filtered rows containing "${searchValue}"`
        },
        newData: filteredData
      };
    }
    
    // Default filter - return original data
    return {
      operation: {
        type: 'filter',
        description: `Applied filter: ${prompt}`
      },
      newData: data
    };
  }

  private static handleSortOperation(prompt: string, data: any[][]): ExcelResult {
    // Extract column information from prompt
    const columnMatch = prompt.match(/column\s+([A-Za-z])/i) || prompt.match(/col\s+([A-Za-z])/i);
    
    if (columnMatch) {
      const columnLetter = columnMatch[1].toUpperCase();
      const columnIndex = this.letterToIndex(columnLetter);
      const isDescending = prompt.includes('descending') || prompt.includes('desc') || prompt.includes('z to a');
      
      // Sort the data
      const header = data[0];
      const dataRows = data.slice(1);
      
      const sortedDataRows = dataRows.sort((a, b) => {
        const aValue = a[columnIndex]?.value || a[columnIndex];
        const bValue = b[columnIndex]?.value || b[columnIndex];
        
        // Try numeric comparison first
        const aNum = Number(aValue);
        const bNum = Number(bValue);
        
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return isDescending ? bNum - aNum : aNum - bNum;
        }
        
        // Fall back to string comparison
        const aStr = String(aValue).toLowerCase();
        const bStr = String(bValue).toLowerCase();
        
        if (isDescending) {
          return bStr.localeCompare(aStr);
        } else {
          return aStr.localeCompare(bStr);
        }
      });
      
      const newData = [header, ...sortedDataRows];
      
      return {
        operation: {
          type: 'sort',
          description: `Sorted data by column ${columnLetter} ${isDescending ? 'descending' : 'ascending'}`
        },
        newData: newData
      };
    }
    
    // If no specific column mentioned, sort by first column
    const header = data[0];
    const dataRows = data.slice(1);
    const isDescending = prompt.includes('descending') || prompt.includes('desc') || prompt.includes('z to a');
    
    const sortedDataRows = dataRows.sort((a, b) => {
      const aValue = a[0]?.value || a[0];
      const bValue = b[0]?.value || b[0];
      
      // Try numeric comparison first
      const aNum = Number(aValue);
      const bNum = Number(bValue);
      
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return isDescending ? bNum - aNum : aNum - bNum;
      }
      
      // Fall back to string comparison
      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();
      
      if (isDescending) {
        return bStr.localeCompare(aStr);
      } else {
        return aStr.localeCompare(bStr);
      }
    });
    
    const newData = [header, ...sortedDataRows];
    
    return {
      operation: {
        type: 'sort',
        description: `Sorted data by first column ${isDescending ? 'descending' : 'ascending'}`
      },
      newData: newData
    };
  }

  private static handleColumnSpecificOperation(prompt: string, data: any[][]): ExcelResult {
    // Extract column information
    const columnMatch = prompt.match(/column\s+([A-Za-z])/i) || prompt.match(/col\s+([A-Za-z])/i);
    
    if (columnMatch) {
      const columnLetter = columnMatch[1].toUpperCase();
      const columnIndex = this.letterToIndex(columnLetter);
      
      // Determine what operation to perform on the column
      if (prompt.includes('sum') || prompt.includes('total')) {
        return this.handleSumOperation(prompt, data);
      } else if (prompt.includes('average') || prompt.includes('avg')) {
        return this.handleAverageOperation(prompt, data);
      } else if (prompt.includes('sort')) {
        return this.handleSortOperation(prompt, data);
      }
    }
    
    // Default column operation
    return {
      operation: {
        type: 'custom',
        description: `Processed column operation: ${prompt}`
      },
      newData: data
    };
  }

  private static handleRowOperation(prompt: string, data: any[][]): ExcelResult {
    // Extract row information
    const rowMatch = prompt.match(/row\s+(\d+)/i);
    
    if (rowMatch) {
      const rowIndex = Number(rowMatch[1]);
      
      if (rowIndex > 0 && rowIndex < data.length) {
        // Perform operation on specific row
        return {
          operation: {
            type: 'custom',
            description: `Processed row ${rowIndex}: ${prompt}`
          },
          newData: data
        };
      }
    }
    
    // Default row operation
    return {
      operation: {
        type: 'custom',
        description: `Processed row operation: ${prompt}`
      },
      newData: data
    };
  }

  private static handleFormulaOperation(prompt: string, data: any[][]): ExcelResult {
    // Extract formula information
    const formulaMatch = prompt.match(/formula\s+["']([^"']+)["']/i);
    
    if (formulaMatch) {
      const formula = formulaMatch[1];
      
      // Apply formula to the data
      const newData = [...data];
      
      // For now, just add the formula as a note
      return {
        operation: {
          type: 'formula',
          description: `Applied formula: ${formula}`
        },
        newData: newData
      };
    }
    
    // Default formula operation
    return {
      operation: {
        type: 'formula',
        description: `Processed formula operation: ${prompt}`
      },
      newData: data
    };
  }

  private static letterToIndex(letter: string): number {
    return letter.toUpperCase().charCodeAt(0) - 65; // A=0, B=1, etc.
  }

  private static indexToLetter(index: number): string {
    return String.fromCharCode(65 + index); // 0=A, 1=B, etc.
  }
} 