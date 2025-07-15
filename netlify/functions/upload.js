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

    // Parse the request to get prompt
    const body = event.body;
    let prompt = 'highlight column 1 in red'; // Default for testing
    
    // Mock data
    const mockData = [
      ['Name', 'Age', 'City'],
      ['John', 25, 'New York'],
      ['Jane', 30, 'Los Angeles'],
      ['Bob', 35, 'Chicago']
    ];

    // Process formatting based on prompt
    let formatting = [];
    if (prompt.toLowerCase().includes('highlight') && prompt.toLowerCase().includes('red')) {
      // Create formatting array with red background for column 1
      formatting = mockData.map((row, rowIndex) => 
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
        data: mockData,
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