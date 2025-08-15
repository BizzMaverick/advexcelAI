// Pivot table operations for reliable data analysis
export interface PivotResult {
  message: string;
  data: any[][];
}

export class PivotOperations {
  // Group by single column with aggregation
  static groupBy(data: any[][], groupColumn: string, valueColumn: string, operation: 'sum' | 'count' | 'average'): PivotResult {
    if (!data || data.length <= 1) {
      return { message: 'Error: No data to process', data: [] };
    }

    const headers = data[0];
    const groupColIndex = this.findColumnIndex(headers, groupColumn);
    const valueColIndex = this.findColumnIndex(headers, valueColumn);

    if (groupColIndex === -1) {
      return { message: `Error: Column "${groupColumn}" not found`, data: [] };
    }

    const groups: { [key: string]: number[] } = {};
    
    // Group data
    for (let i = 1; i < data.length; i++) {
      const groupValue = String(data[i][groupColIndex] || '').trim();
      const numValue = parseFloat(String(data[i][valueColIndex] || '0'));
      
      if (!groups[groupValue]) groups[groupValue] = [];
      if (!isNaN(numValue)) groups[groupValue].push(numValue);
    }

    // Calculate results
    const resultData = [['Group', operation === 'count' ? 'Count' : (operation === 'sum' ? 'Total' : 'Average')]];
    
    Object.entries(groups).forEach(([group, values]) => {
      let result = 0;
      if (operation === 'sum') result = values.reduce((a, b) => a + b, 0);
      else if (operation === 'count') result = values.length;
      else if (operation === 'average') result = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
      
      resultData.push([group, result]);
    });

    return {
      message: `<strong>Group by ${groupColumn} completed!</strong><br><br>Showing ${operation} by ${groupColumn}`,
      data: resultData
    };
  }

  // Group by two columns (like region and month)
  static groupByTwo(data: any[][], col1: string, col2: string, valueCol: string, operation: 'sum' | 'count' | 'average'): PivotResult {
    if (!data || data.length <= 1) {
      return { message: 'Error: No data to process', data: [] };
    }

    const headers = data[0];
    const col1Index = this.findColumnIndex(headers, col1);
    const col2Index = this.findColumnIndex(headers, col2);
    const valueIndex = this.findColumnIndex(headers, valueCol);

    if (col1Index === -1 || col2Index === -1) {
      return { message: `Error: Columns not found`, data: [] };
    }

    const groups: { [key: string]: number[] } = {};
    
    // Group data by combination
    for (let i = 1; i < data.length; i++) {
      const val1 = String(data[i][col1Index] || '').trim();
      const val2 = String(data[i][col2Index] || '').trim();
      const groupKey = `${val1} - ${val2}`;
      const numValue = parseFloat(String(data[i][valueIndex] || '0'));
      
      if (!groups[groupKey]) groups[groupKey] = [];
      if (!isNaN(numValue)) groups[groupKey].push(numValue);
    }

    // Calculate results
    const resultData = [[`${col1} - ${col2}`, operation === 'count' ? 'Count' : (operation === 'sum' ? 'Total' : 'Average')]];
    
    Object.entries(groups).forEach(([group, values]) => {
      let result = 0;
      if (operation === 'sum') result = values.reduce((a, b) => a + b, 0);
      else if (operation === 'count') result = values.length;
      else if (operation === 'average') result = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
      
      resultData.push([group, result]);
    });

    return {
      message: `<strong>Group by ${col1} and ${col2} completed!</strong><br><br>Showing ${operation} by ${col1} and ${col2}`,
      data: resultData
    };
  }

  // Calculate percentage breakdown
  static percentageBreakdown(data: any[][], groupColumn: string): PivotResult {
    if (!data || data.length <= 1) {
      return { message: 'Error: No data to process', data: [] };
    }

    const headers = data[0];
    const groupColIndex = this.findColumnIndex(headers, groupColumn);

    if (groupColIndex === -1) {
      return { message: `Error: Column "${groupColumn}" not found`, data: [] };
    }

    const counts: { [key: string]: number } = {};
    let total = 0;
    
    // Count occurrences
    for (let i = 1; i < data.length; i++) {
      const groupValue = String(data[i][groupColIndex] || '').trim();
      counts[groupValue] = (counts[groupValue] || 0) + 1;
      total++;
    }

    // Calculate percentages
    const resultData = [['Category', 'Count', 'Percentage']];
    
    Object.entries(counts).forEach(([group, count]) => {
      const percentage = total > 0 ? ((count / total) * 100).toFixed(1) + '%' : '0%';
      resultData.push([group, count, percentage]);
    });

    return {
      message: `<strong>Percentage breakdown by ${groupColumn} completed!</strong><br><br>Showing distribution across ${Object.keys(counts).length} categories`,
      data: resultData
    };
  }

  // Helper to find column index by name (flexible matching)
  private static findColumnIndex(headers: any[], columnName: string): number {
    const searchTerm = columnName.toLowerCase();
    
    for (let i = 0; i < headers.length; i++) {
      const header = String(headers[i] || '').toLowerCase();
      if (header.includes(searchTerm) || searchTerm.includes(header)) {
        return i;
      }
    }
    
    return -1;
  }
}