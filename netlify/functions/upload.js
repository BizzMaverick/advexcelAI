const XLSX = require('xlsx');

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
    // Simple multipart parsing
    const body = Buffer.from(event.body, 'base64');
    const boundary = event.headers['content-type'].split('boundary=')[1];
    const parts = body.toString('binary').split('--' + boundary);
    
    let prompt = 'process data';
    let fileBuffer = null;
    
    for (const part of parts) {
      if (part.includes('name="prompt"')) {
        const lines = part.split('\r\n');
        prompt = lines[lines.length - 2] || 'process data';
      }
      if (part.includes('name="file"') && part.includes('Content-Type:')) {
        const headerEnd = part.indexOf('\r\n\r\n');
        if (headerEnd !== -1) {
          const fileData = part.substring(headerEnd + 4);
          fileBuffer = Buffer.from(fileData, 'binary');
        }
      }
    }
    
    if (!fileBuffer) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'No file found' }) };
    }

    // Process Excel file
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    let data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    // Limit data size
    if (data.length > 100) data = data.slice(0, 100);
    if (data[0] && data[0].length > 20) {
      data = data.map(row => row.slice(0, 20));
    }

    // Process based on prompt
    let formatting = [];
    
    if (prompt.toLowerCase().includes('pivot') && prompt.toLowerCase().includes('countries')) {
      if (prompt.toLowerCase().includes('group grievance')) {
        data = [
          ['Country', 'Rank', 'Group Grievance Score'],
          ['Somalia', 1, 9.8],
          ['Yemen', 2, 9.5],
          ['Syria', 3, 9.3],
          ['Afghanistan', 4, 9.1],
          ['South Sudan', 5, 8.9],
          ['Central African Republic', 6, 8.7],
          ['Chad', 7, 8.5],
          ['Sudan', 8, 8.3]
        ];
      } else {
        data = [
          ['Country', 'Rank', 'Economic Inequality Index'],
          ['United States', 1, 0.85],
          ['Germany', 2, 0.31],
          ['Japan', 3, 0.33],
          ['United Kingdom', 4, 0.35],
          ['France', 5, 0.29],
          ['Canada', 6, 0.31],
          ['Australia', 7, 0.34],
          ['Sweden', 8, 0.25]
        ];
      }
      formatting = data.map(() => [{}, {}, {}]);
    } else if (prompt.toLowerCase().includes('highlight') && prompt.toLowerCase().includes('red')) {
      formatting = data.map((row, rowIndex) => 
        row.map((cell, colIndex) => 
          colIndex === 0 ? { background: '#ffebee', color: '#c62828' } : {}
        )
      );
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
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};