const { GoogleGenerativeAI } = require('@google/generative-ai');
const XLSX = require('xlsx');

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
    // Parse multipart form data
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
    
    // Keep original data size for processing
    // Only limit if extremely large
    if (data.length > 200) data = data.slice(0, 200);
    if (data[0] && data[0].length > 20) {
      data = data.map(row => row.slice(0, 20));
    }

    // Use AI to process the request
    if (process.env.GEMINI_API_KEY) {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        
        const systemPrompt = `You are an Excel AI assistant. Process this request and return ONLY valid JSON.

User Request: "${prompt}"
Excel Data: ${JSON.stringify(data)}

Instructions:
- Analyze the data and user request
- Create appropriate output based on the request
- For pivot tables, aggregate and summarize data
- For highlighting, return formatting info
- For calculations, perform the math
- Always return valid JSON in this format:
{
  "data": [["Header1", "Header2"], ["row1col1", "row1col2"]],
  "formatting": [[{}, {}], [{}, {}]]
}

Return ONLY the JSON object, no other text.`;

        const result = await model.generateContent(systemPrompt);
        const response = result.response.text();
        
        // Extract JSON from response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const aiResult = JSON.parse(jsonMatch[0]);
          if (aiResult.data && Array.isArray(aiResult.data)) {
            return {
              statusCode: 200,
              headers,
              body: JSON.stringify({
                result: `AI processed: ${prompt}`,
                data: aiResult.data,
                formatting: aiResult.formatting || []
              })
            };
          }
        }
        
        // Fallback if AI response is invalid
        throw new Error('Invalid AI response format');
        
      } catch (aiError) {
        console.error('AI Error:', aiError);
        // Fallback to basic processing
      }
    }
    
    // Fallback: Basic processing without AI
    let formatting = [];
    
    if (prompt.toLowerCase().includes('alphabetical') || prompt.toLowerCase().includes('sort')) {
      // Sort data alphabetically by first column (country name)
      const headers = data[0];
      const rows = data.slice(1);
      const sortedRows = rows.sort((a, b) => {
        const aVal = String(a[0] || '').toLowerCase();
        const bVal = String(b[0] || '').toLowerCase();
        return aVal.localeCompare(bVal);
      });
      data = [headers, ...sortedRows];
    } else if (prompt.toLowerCase().includes('highlight') && prompt.toLowerCase().includes('red')) {
      formatting = data.map((row) => 
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