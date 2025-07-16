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
    // Parse multipart form data properly
    const contentType = event.headers['content-type'] || '';
    if (!contentType.includes('multipart/form-data')) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid content type' }) };
    }

    const boundary = contentType.split('boundary=')[1];
    const body = Buffer.from(event.body, 'base64');
    const parts = body.toString('binary').split('--' + boundary);
    
    let prompt = '';
    let fileBuffer = null;
    
    // Extract prompt and file from multipart data
    for (const part of parts) {
      if (part.includes('name="prompt"')) {
        const lines = part.split('\r\n');
        for (let i = 0; i < lines.length; i++) {
          if (lines[i] === '' && i + 1 < lines.length) {
            prompt = lines[i + 1].trim();
            break;
          }
        }
      }
      
      if (part.includes('name="file"') && part.includes('Content-Type:')) {
        const headerEnd = part.indexOf('\r\n\r\n');
        if (headerEnd !== -1) {
          const fileStart = headerEnd + 4;
          const fileEnd = part.lastIndexOf('\r\n--');
          const fileContent = part.substring(fileStart, fileEnd > 0 ? fileEnd : undefined);
          fileBuffer = Buffer.from(fileContent, 'binary');
        }
      }
    }

    if (!fileBuffer) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'No file uploaded' }) };
    }

    // Process the actual uploaded Excel file
    let data;
    try {
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    } catch (error) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Failed to parse Excel file' }) };
    }

    if (!data || data.length === 0) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'No data in file' }) };
    }

    let formatting = [];
    const promptLower = prompt.toLowerCase();

    // Process based on actual prompt
    if (promptLower.includes('highlight') && promptLower.includes('red')) {
      // Highlight all rows in red
      formatting = data.map((row, rowIndex) => 
        row.map(() => ({
          background: rowIndex > 0 ? '#fef2f2' : '#ffffff',
          color: rowIndex > 0 ? '#dc2626' : '#1f2937'
        }))
      );
    } else if (promptLower.includes('sort') || promptLower.includes('alphabetical')) {
      // Sort by first column
      const headers = data[0];
      const rows = data.slice(1);
      const sortedRows = rows.sort((a, b) => {
        const aVal = String(a[0] || '').toLowerCase();
        const bVal = String(b[0] || '').toLowerCase();
        return aVal.localeCompare(bVal);
      });
      data = [headers, ...sortedRows];
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        result: `Successfully processed: ${prompt}`,
        data: data,
        formatting: formatting
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