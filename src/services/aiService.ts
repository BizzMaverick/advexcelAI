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