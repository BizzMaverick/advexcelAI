exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    // For now, return working mock data based on common prompts
    const mockCountryData = [
      ['Country', 'Rank', 'Score'],
      ['Afghanistan', 6, 106.6],
      ['Algeria', 83, 70.0],
      ['Angola', 39, 86.9],
      ['Bangladesh', 41, 85.2],
      ['Brazil', 71, 74.5],
      ['Canada', 6, 31.0],
      ['Chad', 9, 104.6],
      ['Egypt', 50, 81.6],
      ['France', 5, 29.0],
      ['Germany', 2, 31.0],
      ['Haiti', 10, 102.9],
      ['India', 73, 74.1],
      ['Japan', 3, 33.0],
      ['Kenya', 35, 87.8],
      ['Libya', 17, 96.1],
      ['Mali', 13, 99.5],
      ['Nigeria', 15, 98.0],
      ['Pakistan', 32, 89.9],
      ['Somalia', 1, 111.9],
      ['Sudan', 7, 106.2],
      ['Syria', 5, 107.1],
      ['Uganda', 26, 91.5],
      ['United Kingdom', 4, 35.0],
      ['United States', 1, 85.0],
      ['Yemen', 2, 108.9],
      ['Zimbabwe', 16, 96.9]
    ];

    // Simple prompt detection
    const body = event.body || '';
    let prompt = 'process data';
    
    // Try to extract prompt from body (simple approach)
    if (body.includes('prompt')) {
      const promptMatch = body.match(/prompt[^a-zA-Z]*([^&\r\n]+)/);
      if (promptMatch) {
        prompt = promptMatch[1].trim().replace(/[+]/g, ' ');
      }
    }

    let data = [...mockCountryData];
    let formatting = [];

    // Process based on prompt
    if (prompt.toLowerCase().includes('alphabetical') || prompt.toLowerCase().includes('sort')) {
      // Sort by country name
      const headers = data[0];
      const rows = data.slice(1);
      const sortedRows = rows.sort((a, b) => a[0].localeCompare(b[0]));
      data = [headers, ...sortedRows];
      
    } else if (prompt.toLowerCase().includes('highlight') && prompt.toLowerCase().includes('top')) {
      // Highlight top 10
      formatting = data.map((row, rowIndex) => 
        row.map(() => 
          rowIndex > 0 && rowIndex <= 10 
            ? { background: '#fef2f2', color: '#dc2626' } 
            : {}
        )
      );
      
    } else if (prompt.toLowerCase().includes('africa')) {
      // Filter African countries
      const headers = data[0];
      const africanCountries = ['Algeria', 'Angola', 'Chad', 'Egypt', 'Kenya', 'Libya', 'Mali', 'Nigeria', 'Somalia', 'Sudan', 'Uganda', 'Zimbabwe'];
      const filteredRows = data.slice(1).filter(row => 
        africanCountries.includes(row[0])
      );
      data = [headers, ...filteredRows];
      
    } else if (prompt.toLowerCase().includes('average')) {
      // Add average row
      const headers = data[0];
      const rows = data.slice(1);
      const avgScore = rows.reduce((sum, row) => sum + row[2], 0) / rows.length;
      data = [headers, ['AVERAGE', '-', avgScore.toFixed(1)], ...rows];
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        result: `Processed: ${prompt}`,
        data: data,
        formatting: formatting
      })
    };

  } catch (error) {
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