export interface ExcelOperation {
  type: 'sum' | 'average' | 'filter' | 'sort' | 'formula' | 'format' | 'custom';
  description: string;
  result?: any;
}

export interface ExcelResult {
  operation: ExcelOperation;
  newData: any[][];
  instructions?: string;
}

export class AIService {
  static async processExcelPrompt(prompt: string, spreadsheetData: any[][], currentData: any[][]): Promise<ExcelResult> {
    // Call backend proxy
    const response = await fetch('http://localhost:5001/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, spreadsheetData })
    });
    if (!response.ok) {
      throw new Error('AI backend error');
    }
    const data = await response.json();
    // For now, just return the instructions and keep the data unchanged
    return {
      operation: { type: 'custom', description: prompt },
      newData: currentData,
      instructions: data.result
    };
  }

  // private static _formatDataForAI(_data: any[][]): string {
  //   return 'Empty spreadsheet';
  // }

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

  // private static handleColumnSpecificOperation(prompt: string, data: any[][]): ExcelResult {
  //   // Extract column information
  //   const columnMatch = prompt.match(/column\s+([A-Za-z])/i) || prompt.match(/col\s+([A-Za-z])/i);
  //   
  //   if (columnMatch) {
  //     const columnLetter = columnMatch[1].toUpperCase();
  //     const columnIndex = this.letterToIndex(columnLetter);
  //     
  //     // Determine what operation to perform on the column
  //     if (prompt.includes('sum') || prompt.includes('total')) {
  //       return this.handleSumOperation(prompt, data);
  //     } else if (prompt.includes('average') || prompt.includes('avg')) {
  //       return this.handleAverageOperation(prompt, data);
  //     } else if (prompt.includes('sort')) {
  //       return this.handleSortOperation(prompt, data);
  //     }
  //   }
  //   
  //   // Default column operation
  //   return {
  //     operation: {
  //       type: 'custom',
  //       description: `Processed column operation: ${prompt}`
  //     },
  //     newData: data
  //   };
  // }

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