export interface AWSServiceResult {
  result: string;
  data: any[][];
  formatting?: any[][];
}

export interface AWSServiceInterface {
  uploadSpreadsheetWithPrompt(file: File, prompt: string): Promise<AWSServiceResult>;
  processPromptWithData(data: any[][], prompt: string): Promise<AWSServiceResult>;
}

export declare const AWSService: AWSServiceInterface;