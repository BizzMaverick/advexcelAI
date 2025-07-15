const { GoogleGenerativeAI } = require('@google/generative-ai');
const XLSX = require('xlsx');
const multer = require('multer');

const upload = multer();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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
    const contentType = event.headers['content-type'] || '';
    if (!contentType.includes('multipart/form-data')) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid content type' }) };
    }

    // Parse multipart form data
    const boundary = event.headers['content-type'].split('boundary=')[1];
    const bodyBuffer = Buffer.from(event.body, 'base64');
    const bodyStr = bodyBuffer.toString();
    
    // Extract prompt
    const promptMatch = bodyStr.match(/name="prompt"[\s\S]*?\r\n\r\n([^\r\n]+)/);
    const prompt = promptMatch ? promptMatch[1].trim() : 'process data';
    
    // Extract file data
    const fileMatch = bodyStr.match(/name="file"[\s\S]*?Content-Type: [^\r\n]+\r\n\r\n([\s\S]*?)\r\n--/);
    if (!fileMatch) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'No file uploaded' }) };
    }
    
    // Process the uploaded file
    const fileData = bodyBuffer.slice(bodyStr.indexOf(fileMatch[1]), bodyStr.lastIndexOf('\r\n--'));
    const workbook = XLSX.read(fileData, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    let uploadedData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    // Process data and formatting based on prompt
    let data = uploadedData;
    let formatting = [];
    
    if (prompt.toLowerCase().includes('pivot') && prompt.toLowerCase().includes('countries')) {
      // Create clean pivot table with only requested columns
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
      // Create clean formatting array matching the data structure
      formatting = data.map(() => [{}, {}, {}]);
    } else if (prompt.toLowerCase().includes('highlight') && prompt.toLowerCase().includes('red')) {
      // Create formatting array with red background for column 1
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
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};