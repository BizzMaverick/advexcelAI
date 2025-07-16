const { GoogleGenerativeAI } = require('@google/generative-ai');
const XLSX = require('xlsx');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Simple multipart parser
function parseMultipart(body, boundary) {
  const parts = body.split('--' + boundary);
  const result = {};
  
  for (const part of parts) {
    if (part.includes('Content-Disposition: form-data')) {
      const nameMatch = part.match(/name="([^"]+)"/);
      if (nameMatch) {
        const name = nameMatch[1];
        if (name === 'prompt') {
          const lines = part.split('\r\n');
          result.prompt = lines[lines.length - 2] || '';
        } else if (name === 'file') {
          const headerEnd = part.indexOf('\r\n\r\n');
          if (headerEnd !== -1) {
            const fileContent = part.substring(headerEnd + 4);
            // Remove trailing boundary markers
            const cleanContent = fileContent.replace(/\r\n--.*$/, '');
            result.fileBuffer = Buffer.from(cleanContent, 'binary');
          }
        }
      }
    }
  }
  
  return result;
}

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
    // Parse form data
    const contentType = event.headers['content-type'] || '';
    if (!contentType.includes('multipart/form-data')) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid content type' }) };
    }

    const boundary = contentType.split('boundary=')[1];
    if (!boundary) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'No boundary found' }) };
    }

    const body = Buffer.from(event.body, 'base64').toString('binary');
    const parsed = parseMultipart(body, boundary);
    
    if (!parsed.fileBuffer || !parsed.prompt) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing file or prompt' }) };
    }

    // Process Excel file
    let data;
    try {
      const workbook = XLSX.read(parsed.fileBuffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    } catch (xlsxError) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Failed to parse Excel file' }) };
    }

    if (!data || data.length === 0) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'No data found in file' }) };
    }

    const prompt = parsed.prompt.toLowerCase().trim();
    let formatting = [];

    // Process based on prompt - RELIABLE LOGIC
    if (prompt.includes('alphabetical') || prompt.includes('sort')) {
      // Sort alphabetically by first column
      const headers = data[0];
      const rows = data.slice(1);
      const sortedRows = rows.sort((a, b) => {
        const aVal = String(a[0] || '').toLowerCase();
        const bVal = String(b[0] || '').toLowerCase();
        return aVal.localeCompare(bVal);
      });
      data = [headers, ...sortedRows];
      
    } else if (prompt.includes('highlight') && prompt.includes('top')) {
      // Highlight top rows
      const numToHighlight = prompt.includes('10') ? 10 : 5;
      formatting = data.map((row, rowIndex) => 
        row.map(() => 
          rowIndex > 0 && rowIndex <= numToHighlight 
            ? { background: '#fef2f2', color: '#dc2626' } 
            : {}
        )
      );
      
    } else if (prompt.includes('filter') && prompt.includes('africa')) {
      // Filter African countries
      const headers = data[0];
      const africanCountries = ['Algeria', 'Angola', 'Benin', 'Botswana', 'Burkina Faso', 'Burundi', 'Cameroon', 'Cape Verde', 'Central African Republic', 'Chad', 'Comoros', 'Congo', 'Djibouti', 'Egypt', 'Equatorial Guinea', 'Eritrea', 'Ethiopia', 'Gabon', 'Gambia', 'Ghana', 'Guinea', 'Guinea Bissau', 'Ivory Coast', 'Kenya', 'Lesotho', 'Liberia', 'Libya', 'Madagascar', 'Malawi', 'Mali', 'Mauritania', 'Mauritius', 'Morocco', 'Mozambique', 'Namibia', 'Niger', 'Nigeria', 'Rwanda', 'Sao Tome and Principe', 'Senegal', 'Seychelles', 'Sierra Leone', 'Somalia', 'South Africa', 'South Sudan', 'Sudan', 'Swaziland', 'Tanzania', 'Togo', 'Tunisia', 'Uganda', 'Zambia', 'Zimbabwe'];
      
      const filteredRows = data.slice(1).filter(row => {
        const country = String(row[0] || '').toLowerCase();
        return africanCountries.some(ac => country.includes(ac.toLowerCase()));
      });
      data = [headers, ...filteredRows];
      
    } else if (prompt.includes('average') || prompt.includes('calculate')) {
      // Calculate averages for numeric columns
      const headers = data[0];
      const rows = data.slice(1);
      const averages = [];
      
      for (let col = 0; col < headers.length; col++) {
        const values = rows.map(row => parseFloat(row[col])).filter(v => !isNaN(v));
        if (values.length > 0) {
          const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
          averages.push(avg.toFixed(2));
        } else {
          averages.push('N/A');
        }
      }
      
      data = [headers, ['AVERAGES', ...averages.slice(1)], ...rows];
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        result: `Successfully processed: ${parsed.prompt}`,
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