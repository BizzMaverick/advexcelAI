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
    this.apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'https://z64bxyj98g.execute-api.us-east-1.amazonaws.com/prod/process';
  }

  async processExcelData(fileData: any[][], prompt: string, fileName: string): Promise<BedrockResponse> {
    try {
      // Enhance prompt with Excel function context
      const enhancedPrompt = this.enhancePromptWithExcelFunctions(prompt);
      
      console.log('Sending request to Bedrock API:', {
        endpoint: this.apiEndpoint,
        fileName,
        originalPrompt: prompt,
        enhancedPrompt,
        promptChanged: prompt !== enhancedPrompt,
        dataRows: fileData.length,
        dataColumns: fileData[0]?.length || 0,
        sampleData: fileData.slice(0, 3) // Show first 3 rows for debugging
      });

      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileData,
          prompt: enhancedPrompt,
          fileName,
          maxTokens: 4000, // Request longer response
          dataInfo: {
            totalRows: fileData.length,
            totalColumns: fileData[0]?.length || 0,
            headers: fileData[0] || []
          }
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

  // Enhance prompts with intelligent context understanding
  private enhancePromptWithExcelFunctions(prompt: string): string {
    const lowerPrompt = prompt.toLowerCase();
    
    // Keep enhancements simple to avoid AI confusion
    if (lowerPrompt.includes('sort') || lowerPrompt.includes('order') || lowerPrompt.includes('arrange')) {
      return prompt; // No enhancement for sort
    }
    
    // Replace takes priority over find/lookup
    if (lowerPrompt.includes('replace') || lowerPrompt.includes('substitute')) {
      return `${prompt}. ACTUALLY replace the text and return the modified dataset. Do not explain how.`;
    }
    
    if (lowerPrompt.includes('lookup') || lowerPrompt.includes('find') || lowerPrompt.includes('search')) {
      // Only enhance for multiple terms (contains 'and') and NOT replace operations
      if (lowerPrompt.includes(' and ') && !lowerPrompt.includes('replace')) {
        return `${prompt}. Search for ALL mentioned countries/terms and return matching rows.`;
      }
      return prompt; // No enhancement for single lookup
    }
    
    if (lowerPrompt.includes('sum') || lowerPrompt.includes('average') || lowerPrompt.includes('total') || lowerPrompt.includes('mean')) {
      // Check if user is referencing specific columns or rows
      const hasColumnRefs = /\b[A-Z]\d*\b/.test(prompt) || /\b[A-Z]\s+(and|to)\s+[A-Z]/.test(prompt);
      const hasRowRefs = /\brow\s+\d+/.test(prompt) || /\brows\s+\d+/.test(prompt);
      
      console.log('Sum operation detected:', { hasColumnRefs, hasRowRefs, prompt });
      
      if (hasColumnRefs || hasRowRefs) {
        return `${prompt}. Return ONLY the final calculated result as a single number. No explanations, no tables, no verbose text. Just the answer.`;
      }
      return `${prompt}. Calculate the requested statistics.`;
    }
    
    // Text function enhancements - ACTUALLY DO THE WORK
    if (lowerPrompt.includes('uppercase') || lowerPrompt.includes('upper case')) {
      return `${prompt}. ACTUALLY convert the text to uppercase and return the modified dataset. Do not explain how.`;
    }
    
    if (lowerPrompt.includes('lowercase') || lowerPrompt.includes('lower case')) {
      return `${prompt}. ACTUALLY convert the text to lowercase and return the modified dataset. Do not explain how.`;
    }
    
    if (lowerPrompt.includes('proper case') || lowerPrompt.includes('title case')) {
      return `${prompt}. ACTUALLY convert text to proper case and return the modified dataset. Do not explain how.`;
    }
    
    if (lowerPrompt.includes('concatenate') || lowerPrompt.includes('combine') || lowerPrompt.includes('merge') || lowerPrompt.includes('concat')) {
      return `${prompt}. ACTUALLY combine the columns and return the complete dataset with new combined column. Do not explain how.`;
    }
    
    if (lowerPrompt.includes('extract') || lowerPrompt.includes('substring') || lowerPrompt.includes('left') || lowerPrompt.includes('right') || lowerPrompt.includes('mid')) {
      return `${prompt}. ACTUALLY extract the specified text parts and return the modified dataset. Do not explain how.`;
    }
    
    if (lowerPrompt.includes('length') || lowerPrompt.includes('len')) {
      return `${prompt}. ACTUALLY calculate text length and return the modified dataset. Do not explain how.`;
    }
    
    if (lowerPrompt.includes('trim') || lowerPrompt.includes('remove spaces')) {
      return `${prompt}. ACTUALLY remove extra spaces and return the cleaned dataset. Do not explain how.`;
    }
    
    // Date/Time function enhancements - ACTUALLY DO THE WORK
    if (lowerPrompt.includes('age') || lowerPrompt.includes('years old')) {
      return `${prompt}. ACTUALLY calculate ages and return the modified dataset. Do not explain how.`;
    }
    
    if (lowerPrompt.includes('year') || lowerPrompt.includes('extract year')) {
      return `${prompt}. ACTUALLY extract years from dates and return the modified dataset. Do not explain how.`;
    }
    
    if (lowerPrompt.includes('month') || lowerPrompt.includes('extract month')) {
      return `${prompt}. ACTUALLY extract months from dates and return the modified dataset. Do not explain how.`;
    }
    
    if (lowerPrompt.includes('day') || lowerPrompt.includes('extract day')) {
      return `${prompt}. ACTUALLY extract days from dates and return the modified dataset. Do not explain how.`;
    }
    
    if (lowerPrompt.includes('weekday') || lowerPrompt.includes('day of week')) {
      return `${prompt}. ACTUALLY get day of week and return the modified dataset. Do not explain how.`;
    }
    
    if (lowerPrompt.includes('format date') || lowerPrompt.includes('date format')) {
      return `${prompt}. ACTUALLY format the dates and return the modified dataset. Do not explain how.`;
    }
    
    if (lowerPrompt.includes('days between') || lowerPrompt.includes('date difference')) {
      return `${prompt}. ACTUALLY calculate date differences and return the modified dataset. Do not explain how.`;
    }
    
    if (lowerPrompt.includes('today') || lowerPrompt.includes('current date')) {
      return `${prompt}. ACTUALLY work with current date and return relevant data. Do not explain how.`;
    }
    
    if (lowerPrompt.includes('now') || lowerPrompt.includes('current time')) {
      return `${prompt}. ACTUALLY work with current date/time and return relevant data. Do not explain how.`;
    }
    
    // Math function enhancements - ACTUALLY DO THE WORK
    if (lowerPrompt.includes('round') || lowerPrompt.includes('rounding')) {
      return `${prompt}. ACTUALLY round the numbers and return the modified dataset. Do not explain how.`;
    }
    
    if (lowerPrompt.includes('absolute') || lowerPrompt.includes('abs')) {
      return `${prompt}. ACTUALLY get absolute values and return the modified dataset. Do not explain how.`;
    }
    
    // This is now handled by intelligent operation detection above
    
    // Freeze functionality is now handled locally in the frontend
    
    if (lowerPrompt.includes('unique') || lowerPrompt.includes('distinct') || lowerPrompt.includes('remove duplicates')) {
      console.log('REMOVE DUPLICATES DETECTED:', prompt);
      return `${prompt}. ACTUALLY remove duplicate rows from the data and return the cleaned dataset with only unique records. Do not explain how to do it.`;
    }
    
    // Return original prompt for all other cases
    return prompt;
  }
  
  // Helper method to detect operations in natural language
  private containsOperation(prompt: string, keywords: string[]): boolean {
    return keywords.some(keyword => {
      // Check for exact word matches, not just substring matches
      const regex = new RegExp(`\\b${keyword}\\b`, 'i');
      return regex.test(prompt);
    });
  }

  // Test connection to API
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(this.apiEndpoint, {
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