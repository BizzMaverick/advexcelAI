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
        dataRows: fileData.length,
        dataColumns: fileData[0]?.length || 0
      });

      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileData,
          prompt: enhancedPrompt,
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

  // Enhance prompts with intelligent context understanding
  private enhancePromptWithExcelFunctions(prompt: string): string {
    const lowerPrompt = prompt.toLowerCase();
    
    // Create comprehensive context for AI to understand mixed prompts
    const contextualPrompt = `
CONTEXT: You are an Excel AI assistant. The user's request may contain:
1. GENERAL TERMS (please, can you, I need, show me, etc.) - These are conversational
2. EXCEL FUNCTIONS (lookup, filter, sort, calculate, etc.) - These indicate the operation
3. DATA TERMS (specific values from the dataset) - These are the targets

USER REQUEST: "${prompt}"

INSTRUCTIONS: Analyze the entire request intelligently. Identify the Excel operation needed and the data terms to work with. ACTUALLY PERFORM the operation on the data - DO NOT just explain how to do it. Return the modified/processed data in a structured table format that shows the actual results.

`;
    
    // Intelligent operation detection with context
    if (this.containsOperation(lowerPrompt, ['lookup', 'find', 'search', 'show', 'get', 'need', 'want'])) {
      return `${contextualPrompt}OPERATION: LOOKUP/SEARCH - Find and return all rows that contain any of the data terms mentioned in the user's request. If multiple terms are mentioned, return ALL matching rows.`;
    }
    
    if (this.containsOperation(lowerPrompt, ['filter', 'where', 'only', 'matching'])) {
      return `${contextualPrompt}OPERATION: FILTER - Filter the data based on the criteria mentioned. Return only rows that match the specified conditions.`;
    }
    
    if (this.containsOperation(lowerPrompt, ['sort', 'order', 'arrange', 'rank'])) {
      return `${contextualPrompt}OPERATION: SORT - Sort the data based on the column or criteria mentioned in the request.`;
    }
    
    if (this.containsOperation(lowerPrompt, ['calculate', 'sum', 'average', 'count', 'total', 'mean'])) {
      return `${contextualPrompt}OPERATION: CALCULATE - Perform the mathematical operation mentioned on the relevant data.`;
    }
    
    if (this.containsOperation(lowerPrompt, ['group', 'pivot', 'summarize', 'aggregate'])) {
      return `${contextualPrompt}OPERATION: GROUP/PIVOT - Group or summarize the data as requested.`;
    }
    
    // Text function enhancements
    if (lowerPrompt.includes('uppercase') || lowerPrompt.includes('upper case')) {
      return `${contextualPrompt}OPERATION: UPPERCASE - ACTUALLY CONVERT the specified text to uppercase. DO NOT explain how to do it. MODIFY the data and return the complete dataset with uppercase text applied. Show actual results, not instructions.`;
    }
    
    if (lowerPrompt.includes('lowercase') || lowerPrompt.includes('lower case')) {
      return `${prompt}. Use Excel LOWER() function logic to convert text to lowercase. Return the modified data with lowercase text.`;
    }
    
    if (lowerPrompt.includes('proper case') || lowerPrompt.includes('title case')) {
      return `${prompt}. Use Excel PROPER() function logic to convert text to proper case (first letter of each word capitalized). Return the modified data.`;
    }
    
    if (lowerPrompt.includes('concatenate') || lowerPrompt.includes('combine') || lowerPrompt.includes('merge')) {
      return `${contextualPrompt}OPERATION: CONCATENATE - ACTUALLY PERFORM the concatenation operation on the data. DO NOT explain how to do it. MODIFY the data by combining the specified columns and return the complete modified dataset with the new combined column. Show the actual results, not instructions.`;
    }
    
    if (lowerPrompt.includes('extract') || lowerPrompt.includes('substring') || lowerPrompt.includes('left') || lowerPrompt.includes('right') || lowerPrompt.includes('mid')) {
      return `${contextualPrompt}OPERATION: TEXT EXTRACTION - ACTUALLY EXTRACT the specified parts of text from the data. DO NOT explain how to do it. MODIFY the data and return the complete dataset with extracted text. Show actual results, not instructions.`;
    }
    
    if (lowerPrompt.includes('length') || lowerPrompt.includes('len')) {
      return `${prompt}. Use Excel LEN() function logic to calculate text length. Return the data with text lengths.`;
    }
    
    if (lowerPrompt.includes('trim') || lowerPrompt.includes('remove spaces')) {
      return `${prompt}. Use Excel TRIM() function logic to remove extra spaces. Return the cleaned data.`;
    }
    
    // This is now handled by intelligent operation detection above
    
    if (lowerPrompt.includes('replace') || lowerPrompt.includes('substitute')) {
      return `${prompt}. Use Excel SUBSTITUTE() or REPLACE() function logic to replace text. Return the data with replaced text.`;
    }
    
    // Date/Time function enhancements
    if (lowerPrompt.includes('age') || lowerPrompt.includes('years old')) {
      return `${prompt}. Calculate age using Excel DATEDIF() function logic (current date minus birth date). Return the data with calculated ages.`;
    }
    
    if (lowerPrompt.includes('year') || lowerPrompt.includes('extract year')) {
      return `${prompt}. Use Excel YEAR() function logic to extract year from dates. Return the data with extracted years.`;
    }
    
    if (lowerPrompt.includes('month') || lowerPrompt.includes('extract month')) {
      return `${prompt}. Use Excel MONTH() function logic to extract month from dates. Return the data with extracted months.`;
    }
    
    if (lowerPrompt.includes('day') || lowerPrompt.includes('extract day')) {
      return `${prompt}. Use Excel DAY() function logic to extract day from dates. Return the data with extracted days.`;
    }
    
    if (lowerPrompt.includes('weekday') || lowerPrompt.includes('day of week')) {
      return `${prompt}. Use Excel WEEKDAY() function logic to get day of week. Return the data with weekday information.`;
    }
    
    if (lowerPrompt.includes('format date') || lowerPrompt.includes('date format')) {
      return `${prompt}. Use Excel date formatting logic to change date display format. Return the data with formatted dates.`;
    }
    
    if (lowerPrompt.includes('days between') || lowerPrompt.includes('date difference')) {
      return `${prompt}. Calculate difference between dates using Excel date arithmetic. Return the data with calculated differences.`;
    }
    
    if (lowerPrompt.includes('today') || lowerPrompt.includes('current date')) {
      return `${prompt}. Use Excel TODAY() function logic to work with current date. Return relevant data based on today's date.`;
    }
    
    if (lowerPrompt.includes('now') || lowerPrompt.includes('current time')) {
      return `${prompt}. Use Excel NOW() function logic to work with current date and time. Return relevant data.`;
    }
    
    // Math function enhancements
    if (lowerPrompt.includes('round') || lowerPrompt.includes('rounding')) {
      return `${prompt}. Use Excel ROUND() function logic to round numbers to specified decimal places. Return the data with rounded values.`;
    }
    
    if (lowerPrompt.includes('absolute') || lowerPrompt.includes('abs')) {
      return `${prompt}. Use Excel ABS() function logic to get absolute values. Return the data with absolute values.`;
    }
    
    // This is now handled by intelligent operation detection above
    
    // Freeze functionality is now handled locally in the frontend
    
    if (lowerPrompt.includes('unique') || lowerPrompt.includes('distinct') || lowerPrompt.includes('remove duplicates')) {
      return `${prompt}. Use Excel UNIQUE() function logic to remove duplicate rows. Return only unique/distinct records.`;
    }
    
    // If no specific operation detected, provide general intelligent context
    return `${contextualPrompt}OPERATION: GENERAL - Analyze the user's request and determine the most appropriate action based on the context and data terms mentioned.`;
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