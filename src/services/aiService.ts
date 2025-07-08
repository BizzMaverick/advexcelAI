const API_URL = import.meta.env.VITE_API_URL || '/api/upload';

export class AIService {
  static async uploadSpreadsheetWithPrompt(file: File, prompt: string): Promise<AIResult> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('prompt', prompt);

    const response = await fetch(API_URL, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      throw new Error('Upload failed');
    }
    return await response.json();
  }
}