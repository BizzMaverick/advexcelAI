// Bedrock AI Service for Excel processing
interface BedrockResponse {
  success: boolean;
  response?: string;
  error?: string;
  fileName?: string;
}

class BedrockService {
  private apiEndpoint: string;

  constructor() {
    // This will be updated after AWS deployment
    this.apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'https://your-api-gateway-url.execute-api.us-east-1.amazonaws.com/prod';
  }

  async processExcelData(fileData: any[][], prompt: string, fileName: string): Promise<BedrockResponse> {
    try {
      console.log('Sending request to Bedrock API:', {
        endpoint: this.apiEndpoint,
        fileName,
        prompt,
        dataRows: fileData.length
      });

      const response = await fetch(`${this.apiEndpoint}/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileData,
          prompt,
          fileName
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: BedrockResponse = await response.json();
      console.log('Bedrock API response:', result);

      return result;
    } catch (error) {
      console.error('Bedrock API error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Test connection to API
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiEndpoint}/process`, {
        method: 'OPTIONS'
      });
      return response.ok;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }
}

export const bedrockService = new BedrockService();
export default bedrockService;