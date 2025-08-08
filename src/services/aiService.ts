const API_URL = import.meta.env.PROD 
  ? '/.netlify/functions/upload'
  : 'http://localhost:5001/api/upload';

type SpreadsheetData = (string | number | boolean | null | undefined)[][];
type SpreadsheetFormatting = ({ color?: string; background?: string; bold?: boolean; italic?: boolean } | undefined)[][];

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
    // Enhance prompt for better formatting
    const enhancedPrompt = prompt + '\n\nPlease format your response in a clean, readable table format. Do not show raw CSV data. Present comparisons in a structured table with clear headers and organized rows.';
    formData.append('prompt', enhancedPrompt);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error:', response.status, errorText);
        
        if (response.status === 500) {
          throw new Error(`Server error: ${response.status}. Please check if the backend server is running on port 5001.`);
        } else if (response.status === 404) {
          throw new Error('API endpoint not found. Please check the server configuration.');
        } else {
          throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
        }
      }
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('AI Service error:', error);
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to the server. Please check if the backend server is running.');
      }
      
      throw error;
    }
  }
}