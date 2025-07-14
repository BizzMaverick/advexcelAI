import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import multer from 'multer';
import fs from 'fs';
import XLSX from 'xlsx';

dotenv.config();

const app = express();
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const upload = multer({ dest: 'uploads/', limits: { fileSize: 20 * 1024 * 1024 } });

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api/upload', upload.single('file'), async (req, res) => {
  console.log('GEMINI_API_KEY present:', !!process.env.GEMINI_API_KEY);
  const prompt = req.body.prompt;
  const filePath = req.file.path;
  
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    let spreadsheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    fs.unlinkSync(filePath);

    // Limit data size to prevent crashes
    const MAX_ROWS = 1000;
    const MAX_COLS = 50;
    
    if (spreadsheetData.length > MAX_ROWS) {
      console.log(`Large file detected: ${spreadsheetData.length} rows. Limiting to ${MAX_ROWS} rows.`);
      spreadsheetData = spreadsheetData.slice(0, MAX_ROWS);
    }
    
    if (spreadsheetData[0] && spreadsheetData[0].length > MAX_COLS) {
      console.log(`Wide file detected: ${spreadsheetData[0].length} columns. Limiting to ${MAX_COLS} columns.`);
      spreadsheetData = spreadsheetData.map(row => row.slice(0, MAX_COLS));
    }

    if (process.env.GEMINI_API_KEY) {
      console.log('About to call Gemini...');
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      const systemPrompt = `You are an Excel AI assistant. When the user asks for a change, you MUST return ONLY a valid JSON object with two keys: 'data' (the updated spreadsheet as an array of arrays) and 'formatting' (an array of arrays of formatting objects, matching the data structure, with keys like 'color', 'background', 'bold', 'italic'). Do not return any explanation, markdown, or extra text.

User request: "${prompt}"

Spreadsheet data: ${JSON.stringify(spreadsheetData)}

Return only the JSON object.`;

      try {
        const result = await model.generateContent(systemPrompt);
        const response = result.response.text();
        console.log('Raw Gemini response:', response);
        
        let aiResult = null;
        try {
          const match = response.match(/\{[\s\S]*\}/);
          if (match) {
            aiResult = JSON.parse(match[0]);
          }
        } catch (e) {
          console.error('Error parsing Gemini response JSON:', e);
        }
        
        if (!aiResult || !Array.isArray(aiResult.data)) {
          console.warn('Gemini did not return valid spreadsheet object.');
          return res.json({ 
            result: response, 
            data: spreadsheetData, 
            formatting: [], 
            aiError: 'AI did not return valid spreadsheet object.' 
          });
        }
        
        if (!Array.isArray(aiResult.formatting)) {
          aiResult.formatting = [];
        }
        
        return res.json({ 
          result: response, 
          data: aiResult.data, 
          formatting: aiResult.formatting 
        });
        
      } catch (geminiErr) {
        console.error('Error during Gemini API call:', geminiErr);
        return res.status(500).json({ 
          error: 'Gemini API call failed', 
          details: geminiErr.message 
        });
      }
    } else {
      return res.json({ 
        result: `Mock AI Response: I understand you want to "${prompt}".`, 
        newData: spreadsheetData 
      });
    }
  } catch (err) {
    console.error('Error in /api/upload handler:', err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Gemini proxy running on port ${PORT}`));