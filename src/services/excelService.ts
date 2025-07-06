import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export interface ExcelFormula {
  cell: string;
  formula: string;
}

export interface ConditionalFormatting {
  range: string;
  condition: string;
  style: {
    fill?: { type: 'pattern'; pattern: 'solid'; fgColor: { argb: string } };
    font?: { color?: { argb: string }; bold?: boolean };
  };
}

export interface PivotTableConfig {
  sourceRange: string;
  rowFields: string[];
  valueFields: string[];
  filters?: string[];
}

export class ExcelService {
  static async createExcelFile(
    data: any[][],
    formulas?: ExcelFormula[],
    conditionalFormatting?: ConditionalFormatting[],
    pivotTable?: PivotTableConfig,
    filename: string = 'excel-ai-output.xlsx'
  ): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');

    // Add data
    data.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        const cellRef = this.getCellReference(rowIndex, colIndex);
        worksheet.getCell(cellRef).value = cell;
      });
    });

    // Add formulas
    if (formulas) {
      formulas.forEach(({ cell, formula }) => {
        worksheet.getCell(cell).formula = formula;
      });
    }

    // Add conditional formatting
    if (conditionalFormatting) {
      conditionalFormatting.forEach((format) => {
        worksheet.addConditionalFormatting({
          ref: format.range,
          rules: [
            {
              type: 'expression',
              formulae: [format.condition],
              style: format.style
            }
          ]
        });
      });
    }

    // Add pivot table
    if (pivotTable) {
      this.addPivotTable(worksheet, pivotTable);
    }

    // Generate and download file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, filename);
  }

  private static getCellReference(rowIndex: number, colIndex: number): string {
    const colLetter = String.fromCharCode(65 + colIndex);
    return `${colLetter}${rowIndex + 1}`;
  }

  private static addPivotTable(worksheet: ExcelJS.Worksheet, config: PivotTableConfig): void {
    // Create pivot table (simplified implementation)
    const pivotRange = worksheet.getCell('A1').address + ':' + 
                      worksheet.getCell(this.getCellReference(config.rowFields.length, config.valueFields.length)).address;
    
    worksheet.addTable({
      name: 'PivotTable',
      ref: pivotRange,
      columns: [
        { name: 'Category' },
        { name: 'Value' }
      ],
      rows: [
        ['Category 1', 100],
        ['Category 2', 200],
        ['Category 3', 300]
      ]
    });
  }

  static parseExcelFile(file: File): Promise<any[][]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const buffer = e.target?.result as ArrayBuffer;
          const workbook = new ExcelJS.Workbook();
          await workbook.xlsx.load(buffer);
          
          const worksheet = workbook.getWorksheet(1);
          const data: any[][] = [];
          
          worksheet.eachRow((row, rowNumber) => {
            const rowData: any[] = [];
            row.eachCell((cell, colNumber) => {
              rowData.push(cell.value);
            });
            data.push(rowData);
          });
          
          resolve(data);
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsArrayBuffer(file);
    });
  }

  static generateChartData(data: any[][], chartType: 'bar' | 'line' | 'pie' = 'bar'): any {
    if (!data.length || data.length < 2) return null;

    const headers = data[0];
    const chartData = {
      type: chartType,
      labels: [],
      datasets: []
    };

    // For bar/line charts, use first column as labels, second as data
    if (data.length > 1) {
      chartData.labels = data.slice(1).map(row => row[0]);
      chartData.datasets = [{
        label: headers[1] || 'Data',
        data: data.slice(1).map(row => Number(row[1]) || 0),
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }];
    }

    return chartData;
  }

  static applyConditionalFormatting(data: any[][], column: number, condition: string): ConditionalFormatting[] {
    const columnLetter = String.fromCharCode(65 + column);
    const range = `${columnLetter}2:${columnLetter}${data.length}`;
    
    let excelCondition = '';
    if (condition.includes('>')) {
      const value = condition.split('>')[1];
      excelCondition = `>${value}`;
    } else if (condition.includes('<')) {
      const value = condition.split('<')[1];
      excelCondition = `<${value}`;
    } else if (condition.includes('=')) {
      const value = condition.split('=')[1];
      excelCondition = `=${value}`;
    }

    return [{
      range,
      condition: excelCondition,
      style: {
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } },
        font: { color: { argb: 'FFFFFFFF' }, bold: true }
      }
    }];
  }

  static createXLookupFormula(lookupValue: string, lookupRange: string, returnRange: string): string {
    return `=XLOOKUP("${lookupValue}",${lookupRange},${returnRange},"Not Found")`;
  }

  static createVLookupFormula(lookupValue: string, tableRange: string, colIndex: number): string {
    return `=VLOOKUP("${lookupValue}",${tableRange},${colIndex},FALSE)`;
  }

  static createSumIfFormula(range: string, criteria: string, sumRange: string): string {
    return `=SUMIF(${range},"${criteria}",${sumRange})`;
  }

  static createIfFormula(condition: string, trueValue: string, falseValue: string): string {
    return `=IF(${condition},"${trueValue}","${falseValue}")`;
  }
} 