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

  static async uploadSpreadsheetWithPrompt(file: File, prompt: string): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('prompt', prompt);

    const response = await fetch('http://localhost:5001/api/upload', {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      throw new Error('Upload failed');
    }
    return await response.json();
  }

  // private static _formatDataForAI(_data: any[][]): string {
  //   return 'Empty spreadsheet';
  // }
} 