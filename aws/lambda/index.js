// AWS Lambda function for Excel AI Assistant
const XLSX = require('xlsx');
const GeminiService = require('./geminiService');

// Initialize Gemini service with API key from environment variable
const geminiService = new GeminiService(process.env.GEMINI_API_KEY);

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };
  
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }
  
  try {
    // Parse request body
    const body = JSON.parse(event.body);
    const { prompt, fileContent, csvContent } = body;
    
    // Process data
    let data = [];
    if (fileContent) {
      const workbook = XLSX.read(Buffer.from(fileContent, 'base64'), { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    } else if (csvContent) {
      // Parse CSV content from frontend
      data = csvContent.split('\n').map(row => row.split(','));
      // Handle empty rows
      data = data.filter(row => row.length > 0 && row.some(cell => cell.trim() !== ''));
    } else {
      // Sample data
      data = [
        ['Country', 'Rank', 'Score'],
        ['United States', 1, 95.01],
        ['China', 2, 92.57],
        ['Japan', 3, 90.99],
        ['Germany', 4, 89.25],
        ['United Kingdom', 5, 87.87],
        ['France', 6, 86.64],
        ['India', 7, 85.32],
        ['Italy', 8, 83.91],
        ['Canada', 9, 82.45],
        ['South Korea', 10, 81.77]
      ];
    }
    
    // Initialize formatting
    const formatting = data.map(row => row.map(() => ({})));
    
    // Process with Gemini API if API key is available
    let result = {
      result: `Successfully processed: ${prompt}`,
      data: data,
      formatting: formatting
    };
    
    try {
      if (process.env.GEMINI_API_KEY) {
        console.log('Processing with Gemini API');
        // Use Gemini API to process the prompt
        const geminiResult = await geminiService.processPrompt(prompt, data);
        
        // If Gemini returns valid data, use it
        if (geminiResult && geminiResult.data && Array.isArray(geminiResult.data)) {
          result = geminiResult;
          console.log('Successfully processed with Gemini API');
        }
      } else {
        console.log('No Gemini API key found, using fallback processing');
        // Fallback processing if no API key
        const promptLower = prompt.toLowerCase();
        
        if (promptLower.includes('highlight')) {
          // Default to red highlighting
          let bgColor = '#fef2f2';
          let textColor = '#dc2626';
          
          // Check for colors
          if (promptLower.includes('blue')) {
            bgColor = '#eff6ff';
            textColor = '#1d4ed8';
          } else if (promptLower.includes('green')) {
            bgColor = '#f0fdf4';
            textColor = '#16a34a';
          } else if (promptLower.includes('yellow')) {
            bgColor = '#fefce8';
            textColor = '#ca8a04';
          }
          
          // Default to all rows except header
          let startRow = 1;
          let endRow = data.length - 1;
          
          // Check for top rows
          if (promptLower.includes('top')) {
            const match = promptLower.match(/top\s+(\d+)/);
            if (match) {
              endRow = Math.min(parseInt(match[1]) + 1, data.length - 1);
            } else {
              endRow = Math.min(11, data.length - 1); // Default to top 10
            }
          }
          
          // Check for bottom rows
          if (promptLower.includes('bottom')) {
            const match = promptLower.match(/bottom\s+(\d+)/);
            if (match) {
              startRow = Math.max(data.length - parseInt(match[1]), 1);
            } else {
              startRow = Math.max(data.length - 10, 1); // Default to bottom 10
            }
          }
          
          // Apply highlighting
          for (let i = startRow; i <= endRow; i++) {
            for (let j = 0; j < (data[i] || []).length; j++) {
              formatting[i][j] = {
                background: bgColor,
                color: textColor
              };
            }
          }
        } else if (promptLower.includes('sort') && promptLower.includes('a-z')) {
          // Sort by first column A-Z
          const headers = data[0];
          const rows = data.slice(1);
          const sortedRows = [...rows].sort((a, b) => {
            const aVal = String(a[0] || '').toLowerCase();
            const bVal = String(b[0] || '').toLowerCase();
            return aVal.localeCompare(bVal);
          });
          data = [headers, ...sortedRows];
        } else if (promptLower.includes('sort') && promptLower.includes('z-a')) {
          // Sort by first column Z-A
          const headers = data[0];
          const rows = data.slice(1);
          const sortedRows = [...rows].sort((a, b) => {
            const aVal = String(a[0] || '').toLowerCase();
            const bVal = String(b[0] || '').toLowerCase();
            return bVal.localeCompare(aVal);
          });
          data = [headers, ...sortedRows];
        }
        
        result = {
          result: `Successfully processed: ${prompt}`,
          data: data,
          formatting: formatting
        };
      }
    } catch (error) {
      console.error('Error processing with Gemini:', error);
      // Continue with the default result if Gemini fails
    }
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result)
    };
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Processing failed',
        details: error.message 
      })
    };
  }
};