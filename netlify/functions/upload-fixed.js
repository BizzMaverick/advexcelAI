// Simple mock backend that always works
exports.handler = async (event, context) => {
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
    let prompt = '';
    let data = [];
    
    try {
      // Try to extract prompt from request
      if (event.body) {
        const body = Buffer.from(event.body, 'base64').toString();
        if (body.includes('prompt')) {
          const promptMatch = body.match(/prompt[^a-zA-Z]*([^&\r\n]+)/);
          if (promptMatch) {
            prompt = decodeURIComponent(promptMatch[1].trim().replace(/[+]/g, ' '));
          }
        }
      }
      
      // Create mock data if no data provided
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
        ['South Korea', 10, 81.77],
        ['Russia', 11, 80.59],
        ['Australia', 12, 79.86],
        ['Spain', 13, 78.34],
        ['Mexico', 14, 77.22],
        ['Indonesia', 15, 76.11]
      ];
    } catch (error) {
      console.error('Error parsing request:', error);
    }

    // Process based on prompt
    let result = {
      data: data,
      formatting: []
    };
    
    // Initialize formatting array
    result.formatting = data.map(row => row.map(() => ({})));
    
    // Apply formatting based on prompt
    const promptLower = prompt.toLowerCase();
    
    if (promptLower.includes('highlight') && promptLower.includes('red')) {
      // Highlight all rows in red
      result.formatting = data.map((row, rowIndex) => 
        row.map(() => ({
          background: rowIndex > 0 ? '#fef2f2' : '#ffffff',
          color: rowIndex > 0 ? '#dc2626' : '#1f2937'
        }))
      );
      console.log('Applied red highlighting');
    } 
    else if (promptLower.includes('sort') && promptLower.includes('a-z')) {
      // Sort by first column A-Z
      const headers = data[0];
      const rows = data.slice(1);
      const sortedRows = [...rows].sort((a, b) => {
        const aVal = String(a[0] || '').toLowerCase();
        const bVal = String(b[0] || '').toLowerCase();
        return aVal.localeCompare(bVal);
      });
      result.data = [headers, ...sortedRows];
      console.log('Applied A-Z sorting');
    }
    else if (promptLower.includes('sort') && promptLower.includes('z-a')) {
      // Sort by first column Z-A
      const headers = data[0];
      const rows = data.slice(1);
      const sortedRows = [...rows].sort((a, b) => {
        const aVal = String(a[0] || '').toLowerCase();
        const bVal = String(b[0] || '').toLowerCase();
        return bVal.localeCompare(aVal);
      });
      result.data = [headers, ...sortedRows];
      console.log('Applied Z-A sorting');
    }
    else if (promptLower.includes('top') && promptLower.includes('10')) {
      // Highlight top 10 rows
      result.formatting = data.map((row, rowIndex) => 
        row.map(() => ({
          background: rowIndex > 0 && rowIndex <= 10 ? '#eff6ff' : '#ffffff',
          color: rowIndex > 0 && rowIndex <= 10 ? '#1d4ed8' : '#1f2937'
        }))
      );
      console.log('Applied top 10 highlighting');
    }
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        result: `Successfully processed: ${prompt}`,
        data: result.data,
        formatting: result.formatting
      })
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