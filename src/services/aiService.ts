export type SpreadsheetData = (string | number | boolean | null | undefined)[][];
export type SpreadsheetFormatting = ({ color?: string; background?: string; bold?: boolean; italic?: boolean } | undefined)[][];

export interface ExcelOperation {
  type: 'sum' | 'average' | 'filter' | 'sort' | 'formula' | 'format' | 'custom';
  description: string;
  result?: unknown;
}

export interface ExcelResult {
  operation: ExcelOperation;
  newData: SpreadsheetData;
  instructions?: string;
}

export type AIResult = {
  result?: string;
  aiError?: string;
  data?: SpreadsheetData;
  newData?: SpreadsheetData;
  formatting?: SpreadsheetFormatting;
};

export class AIService {
  static async uploadSpreadsheetWithPrompt(file: File, prompt: string): Promise<AIResult> {
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