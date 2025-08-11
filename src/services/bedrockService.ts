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
        dataRows: fileData.length
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

  // Enhance prompts with Excel function context
  private enhancePromptWithExcelFunctions(prompt: string): string {
    const lowerPrompt = prompt.toLowerCase();
    
    // Text function enhancements
    if (lowerPrompt.includes('uppercase') || lowerPrompt.includes('upper case')) {
      return `${prompt}. Use Excel UPPER() function logic to convert text to uppercase. Return the modified data with uppercase text.`;
    }
    
    if (lowerPrompt.includes('lowercase') || lowerPrompt.includes('lower case')) {
      return `${prompt}. Use Excel LOWER() function logic to convert text to lowercase. Return the modified data with lowercase text.`;
    }
    
    if (lowerPrompt.includes('proper case') || lowerPrompt.includes('title case')) {
      return `${prompt}. Use Excel PROPER() function logic to convert text to proper case (first letter of each word capitalized). Return the modified data.`;
    }
    
    if (lowerPrompt.includes('concatenate') || lowerPrompt.includes('combine') || lowerPrompt.includes('merge')) {
      return `${prompt}. Use Excel CONCATENATE() or & operator logic to combine text from multiple columns. Return the data with combined columns.`;
    }
    
    if (lowerPrompt.includes('extract') || lowerPrompt.includes('substring') || lowerPrompt.includes('left') || lowerPrompt.includes('right') || lowerPrompt.includes('mid')) {
      return `${prompt}. Use Excel LEFT(), RIGHT(), or MID() function logic to extract specific parts of text. Return the data with extracted text.`;
    }
    
    if (lowerPrompt.includes('length') || lowerPrompt.includes('len')) {
      return `${prompt}. Use Excel LEN() function logic to calculate text length. Return the data with text lengths.`;
    }
    
    if (lowerPrompt.includes('trim') || lowerPrompt.includes('remove spaces')) {
      return `${prompt}. Use Excel TRIM() function logic to remove extra spaces. Return the cleaned data.`;
    }
    
    if (lowerPrompt.includes('find') || lowerPrompt.includes('search') || lowerPrompt.includes('contains')) {
      return `${prompt}. Use Excel FIND() or SEARCH() function logic to locate text. Return matching rows or positions.`;
    }
    
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
    
    // Filter function enhancements
    if (lowerPrompt.includes('filter') || lowerPrompt.includes('show only') || lowerPrompt.includes('where')) {
      return `${prompt}. Use Excel FILTER() function logic to filter data based on criteria. Return only the rows that match the specified conditions in a table format.`;
    }
    
    // Freeze functionality - return immediate confirmation
    if (lowerPrompt.includes('freeze') || lowerPrompt.includes('freeze panes')) {
      return 'FREEZE_APPLIED: The first row (headers) is now frozen and will remain visible while scrolling through the data.';
    }
    
    if (lowerPrompt.includes('unique') || lowerPrompt.includes('distinct') || lowerPrompt.includes('remove duplicates')) {
      return `${prompt}. Use Excel UNIQUE() function logic to remove duplicate rows. Return only unique/distinct records.`;
    }
    
    // Return original prompt if no enhancements needed
    return prompt;
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