// openai-proxy.js
import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import multer from 'multer';
import fs from 'fs';
import XLSX from 'xlsx';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const upload = multer({ dest: 'uploads/', limits: { fileSize: 100 * 1024 * 1024 } });

// --- Prompt Rewriting Function ---
function rewritePrompt(userPrompt, spreadsheetData) {
  // Basic rule-based template for now; can be expanded for more complex logic
  return `You are an AI assistant for Excel. The user has uploaded a spreadsheet and made the following request: "${userPrompt}"\n\nSpreadsheet data (as JSON array of arrays):\n${JSON.stringify(spreadsheetData, null, 2)}\n\nYour task:\n- Perform the user's requested operation on the spreadsheet.\n- Output ONLY the updated spreadsheet as a valid JSON array of arrays.\n- Do NOT include any explanation, markdown, or extra text.\n- If the request is ambiguous or impossible, return the original spreadsheet as a JSON array of arrays.\n- Never return anything except the JSON array of arrays.`;
}

// --- Prompt Classifier Function ---
function classifyPrompt(prompt) {
  const p = prompt.toLowerCase();
  if (p.includes('highlight 1st row') || p.includes('highlight first row') || p.includes('color first row')) return 'highlight_first_row';
  if (p.includes('sort by') || p.includes('order by')) return 'sort';
  if (p.includes('filter') || p.includes('where')) return 'filter';
  if (p.includes('pivot')) return 'pivot';
  if (p.match(/sum|average|count|min|max/)) return 'aggregate';
  if (p.match(/formula|explain|how to/)) return 'openai';
  // Default: try OpenAI for ambiguous cases
  return 'openai';
}

// --- Backend Data Operations (Stubs) ---
function sortData(data, prompt) {
  // Example: "sort by sales descending"
  // For now, just return data unchanged and log
  console.log('Sorting data (stub):', prompt);
  return data;
}

function filterData(data, prompt) {
  // Example: "filter where region is 'West'"
  console.log('Filtering data (stub):', prompt);
  return data;
}

function pivotData(data, prompt) {
  // Example: "pivot sales by region"
  console.log('Pivoting data (stub):', prompt);
  return data;
}

function highlightFirstRowFormatting(data) {
  // Apply red background to the first row
  if (!Array.isArray(data) || data.length === 0) return [];
  const formatting = [];
  for (let i = 0; i < data.length; i++) {
    if (i === 0) {
      formatting.push(data[0].map(() => ({ background: 'red' })));
    } else {
      formatting.push(data[i].map(() => ({})));
    }
  }
  return formatting;
}

// --- Generalized Prompt Parser ---
function parseFormattingPrompt(prompt) {
  // Lowercase for easier matching
  const p = prompt.toLowerCase();
  // Patterns for row/column/cell
  const rowMatch = p.match(/(row|line)\s*(\d+|first|second|third|fourth|fifth|last)/);
  const colMatch = p.match(/(column|col)\s*(\d+|first|second|third|fourth|fifth|last|[a-z]+)/);
  const cellMatch = p.match(/cell\s*([a-z]+)(\d+)/);
  // Patterns for properties
  const colorMatch = p.match(/(red|green|blue|yellow|orange|purple|pink|gray|grey|black|white|cyan|magenta)/);
  const bold = /bold/.test(p);
  const italic = /italic/.test(p);
  const underline = /underline/.test(p);
  const fontSizeMatch = p.match(/font size\s*(\d+)/);
  const widthMatch = p.match(/width\s*(\d+)/);
  const alignMatch = p.match(/align(?:ment)?\s*(left|center|right|justify)/);
  const rowHeightMatch = p.match(/row height\s*(\d+)|reduce row height|increase row height/);
  const colWidthMatch = p.match(/column width\s*(\d+)|reduce column width|increase column width/);

  // Helper to convert words to numbers
  function wordToNumber(word) {
    const map = { first: 1, second: 2, third: 3, fourth: 4, fifth: 5, last: -1 };
    return map[word] || parseInt(word);
  }

  let target = null, index = null, property = {}, type = null;

  if (rowMatch) {
    type = 'row';
    index = wordToNumber(rowMatch[2]);
  } else if (colMatch) {
    type = 'column';
    index = isNaN(colMatch[2]) ? (colMatch[2].charCodeAt(0) - 96) : wordToNumber(colMatch[2]);
  } else if (cellMatch) {
    type = 'cell';
    // Convert column letter to index (A=1)
    index = [cellMatch[1].charCodeAt(0) - 97 + 1, parseInt(cellMatch[2])];
  }

  if (colorMatch) property.background = colorMatch[1];
  if (bold) property.bold = true;
  if (italic) property.italic = true;
  if (underline) property.underline = true;
  if (fontSizeMatch) property.fontSize = fontSizeMatch[1] + 'px';
  if (widthMatch) property.width = widthMatch[1] + 'px';
  if (alignMatch) property.align = alignMatch[1];
  if (rowHeightMatch) property.height = rowHeightMatch[1] ? rowHeightMatch[1] + 'px' : (p.includes('reduce') ? '16px' : '32px');
  if (colWidthMatch) property.width = colWidthMatch[1] ? colWidthMatch[1] + 'px' : (p.includes('reduce') ? '60px' : '200px');

  if ((type || rowHeightMatch || colWidthMatch) && Object.keys(property).length > 0) {
    // If row/col height/width is requested but no specific row/col, apply to all
    if (!type && rowHeightMatch) {
      type = 'allRows';
    }
    if (!type && colWidthMatch) {
      type = 'allCols';
    }
    return { type, index, property };
  }
  return null;
}

function applyFormatting(data, formatting, parsed) {
  if (!parsed) return formatting;
  const { type, index, property } = parsed;
  if (!Array.isArray(data) || data.length === 0) return formatting;
  // Clone formatting
  const fmt = formatting.map(row => row.map(cell => ({ ...cell })));
  if (type === 'row') {
    let rowIdx = index === -1 ? data.length - 1 : index - 1;
    if (rowIdx >= 0 && rowIdx < data.length) {
      for (let j = 0; j < data[rowIdx].length; j++) {
        fmt[rowIdx][j] = { ...fmt[rowIdx][j], ...property };
      }
    }
  } else if (type === 'column') {
    let colIdx = index === -1 ? data[0].length - 1 : index - 1;
    if (colIdx >= 0 && colIdx < data[0].length) {
      for (let i = 0; i < data.length; i++) {
        fmt[i][colIdx] = { ...fmt[i][colIdx], ...property };
      }
    }
  } else if (type === 'cell') {
    let colIdx = parsed.index[0] - 1;
    let rowIdx = parsed.index[1] - 1;
    if (rowIdx >= 0 && rowIdx < data.length && colIdx >= 0 && colIdx < data[0].length) {
      fmt[rowIdx][colIdx] = { ...fmt[rowIdx][colIdx], ...property };
    }
  } else if (type === 'allRows') {
    for (let i = 0; i < data.length; i++) {
      for (let j = 0; j < data[i].length; j++) {
        fmt[i][j] = { ...fmt[i][j], ...property };
      }
    }
  } else if (type === 'allCols') {
    for (let j = 0; j < data[0].length; j++) {
      for (let i = 0; i < data.length; i++) {
        fmt[i][j] = { ...fmt[i][j], ...property };
      }
    }
  }
  return fmt;
}

// File upload endpoint with robust AI processing
app.post('/api/upload', upload.single('file'), async (req, res) => {
  console.log('OPENAI_API_KEY present:', !!process.env.OPENAI_API_KEY);
  const prompt = req.body.prompt;
  const filePath = req.file.path;
  try {
    // Read and parse the uploaded file
    const fileBuffer = fs.readFileSync(filePath);
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const spreadsheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    fs.unlinkSync(filePath);

    const operation = classifyPrompt(prompt);
    let processedData = spreadsheetData;
    let usedOpenAI = false;
    if (operation === 'sort') {
      processedData = sortData(spreadsheetData, prompt);
    } else if (operation === 'filter') {
      processedData = filterData(spreadsheetData, prompt);
    } else if (operation === 'pivot') {
      processedData = pivotData(spreadsheetData, prompt);
    } else if (operation === 'highlight_first_row') {
      // Apply formatting to first row in backend
      const formatting = highlightFirstRowFormatting(spreadsheetData);
      return res.json({ result: 'First row highlighted in red (backend)', data: spreadsheetData, formatting });
    } else {
      usedOpenAI = true;
      if (process.env.OPENAI_API_KEY) {
        console.log('About to call OpenAI...');
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const systemPrompt = `You are an Excel AI assistant. When the user asks for a change, you MUST return ONLY a valid JSON object with two keys: 'data' (the updated spreadsheet as an array of arrays) and 'formatting' (an array of arrays of formatting objects, matching the data structure, with keys like 'color', 'background', 'bold', 'italic'). Do not return any explanation, markdown, or extra text. If the request is ambiguous or impossible, return the original spreadsheet as 'data' and an empty array for 'formatting'. Example: {"data": [["A", "B"], [1, 2]], "formatting": [[{"bold":true,"color":"red"},{"bold":false}], [{},{}]]]}`;
        // Use the new prompt rewriting function
        const rewrittenPrompt = rewritePrompt(prompt, spreadsheetData);
        try {
          console.log('Calling OpenAI API with prompt:', rewrittenPrompt.slice(0, 500));
          // Helper function for timeout
          function withTimeout(promise, ms) {
            const timeout = new Promise((_, reject) =>
              setTimeout(() => reject(new Error('OpenAI API call timed out')), ms)
            );
            return Promise.race([promise, timeout]);
          }
          try {
            const completion = await withTimeout(
              openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                  { role: "system", content: systemPrompt },
                  { role: "user", content: rewrittenPrompt }
                ],
                temperature: 0.1,
                max_tokens: 2000
              }),
              15000 // 15 seconds
            );
            console.log('OpenAI API call succeeded.');
            const response = completion.choices[0]?.message?.content;
            console.log('Raw OpenAI response:', response);
            // Try to extract JSON object with data and formatting
            let aiResult = null;
            let parseError = null;
            try {
              // Try to find the first JSON object in the response
              const match = response.match(/\{[\s\S]*\}/);
              if (match) {
                aiResult = JSON.parse(match[0]);
              }
            } catch (e) {
              parseError = e;
              console.error('Error parsing AI response JSON:', e);
            }
            // Validate structure
            if (!aiResult || !Array.isArray(aiResult.data) || !Array.isArray(aiResult.data[0])) {
              console.warn('AI did not return a valid spreadsheet object. Returning fallback.');
              return res.json({ result: response, data: spreadsheetData, formatting: [], aiError: 'AI did not return a valid spreadsheet object. Here is the raw response.', raw: response });
            }
            // If formatting is missing, provide empty formatting array
            if (!Array.isArray(aiResult.formatting)) {
              aiResult.formatting = [];
            }
            return res.json({ result: response, data: aiResult.data, formatting: aiResult.formatting });
          } catch (openaiErr) {
            console.error('Error during OpenAI API call:', openaiErr);
            return res.status(500).json({ error: 'OpenAI API call failed', details: openaiErr.message });
          }
        } catch (openaiErr) {
          console.error('Error during OpenAI API call:', openaiErr);
          return res.status(500).json({ error: 'OpenAI API call failed', details: openaiErr.message });
        }
      } else {
        console.log('Returning mock response!');
        return res.json({ result: `Mock AI Response: I understand you want to "${prompt}". Here's what I would do with your spreadsheet data: ${JSON.stringify(spreadsheetData).substring(0, 100)}...`, newData: spreadsheetData });
      }
    }
    if (!usedOpenAI) {
      // Initialize empty formatting array
      let formatting = spreadsheetData.map(row => row.map(() => ({})));
      // Try to parse formatting prompt
      const parsed = parseFormattingPrompt(prompt);
      if (parsed) {
        formatting = applyFormatting(spreadsheetData, formatting, parsed);
        return res.json({ result: 'Formatting applied (backend)', data: spreadsheetData, formatting });
      }
      // Fallback to OpenAI: only send a sample of the data
      const sampleData = spreadsheetData.slice(0, 10);
      const rewrittenPrompt = rewritePrompt(prompt, sampleData);
      if (process.env.OPENAI_API_KEY) {
        console.log('About to call OpenAI...');
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const systemPrompt = `You are an Excel AI assistant. When the user asks for a change, you MUST return ONLY a valid JSON object with two keys: 'data' (the updated spreadsheet as an array of arrays) and 'formatting' (an array of arrays of formatting objects, matching the data structure, with keys like 'color', 'background', 'bold', 'italic'). Do not return any explanation, markdown, or extra text. If the request is ambiguous or impossible, return the original spreadsheet as 'data' and an empty array for 'formatting'. Example: {"data": [["A", "B"], [1, 2]], "formatting": [[{"bold":true,"color":"red"},{"bold":false}], [{},{}]]]}`;
        try {
          console.log('Calling OpenAI API with prompt:', rewrittenPrompt.slice(0, 500));
          // Helper function for timeout
          function withTimeout(promise, ms) {
            const timeout = new Promise((_, reject) =>
              setTimeout(() => reject(new Error('OpenAI API call timed out')), ms)
            );
            return Promise.race([promise, timeout]);
          }
          try {
            const completion = await withTimeout(
              openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                  { role: "system", content: systemPrompt },
                  { role: "user", content: rewrittenPrompt }
                ],
                temperature: 0.1,
                max_tokens: 2000
              }),
              15000 // 15 seconds
            );
            console.log('OpenAI API call succeeded.');
            const response = completion.choices[0]?.message?.content;
            console.log('Raw OpenAI response:', response);
            // Try to extract JSON object with data and formatting
            let aiResult = null;
            let parseError = null;
            try {
              // Try to find the first JSON object in the response
              const match = response.match(/\{[\s\S]*\}/);
              if (match) {
                aiResult = JSON.parse(match[0]);
              }
            } catch (e) {
              parseError = e;
              console.error('Error parsing AI response JSON:', e);
            }
            // Validate structure
            if (!aiResult || !Array.isArray(aiResult.data) || !Array.isArray(aiResult.data[0])) {
              console.warn('AI did not return a valid spreadsheet object. Returning fallback.');
              return res.json({ result: response, data: spreadsheetData, formatting: [], aiError: 'AI did not return a valid spreadsheet object. Here is the raw response.', raw: response });
            }
            // If formatting is missing, provide empty formatting array
            if (!Array.isArray(aiResult.formatting)) {
              aiResult.formatting = [];
            }
            return res.json({ result: response, data: aiResult.data, formatting: aiResult.formatting });
          } catch (openaiErr) {
            console.error('Error during OpenAI API call:', openaiErr);
            return res.status(500).json({ error: 'OpenAI API call failed', details: openaiErr.message });
          }
        } catch (openaiErr) {
          console.error('Error during OpenAI API call:', openaiErr);
          return res.status(500).json({ error: 'OpenAI API call failed', details: openaiErr.message });
        }
      }
    }
  } catch (err) {
    console.error('Error in /api/upload handler:', err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`OpenAI proxy running on port ${PORT}`)); 