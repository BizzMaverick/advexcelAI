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

  private static letterToIndex(letter: string): number {
    return letter.toUpperCase().charCodeAt(0) - 65; // A=0, B=1, etc.
  }

  private static indexToLetter(index: number): string {
    return String.fromCharCode(65 + index); // 0=A, 1=B, etc.
  }
} 