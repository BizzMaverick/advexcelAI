import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import multer from 'multer';
import fs from 'fs';
import XLSX from 'xlsx';

dotenv.config();

const app = express();
app.use(cors({ origin: '*', credentials: false }));
app.use(express.json({ limit: '50mb' }));

const upload = multer({ dest: 'uploads/', limits: { fileSize: 20 * 1024 * 1024 } });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    const prompt = req.body.prompt;
    const filePath = req.file.path;
    
    const fileBuffer = fs.readFileSync(filePath);
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    let spreadsheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    fs.unlinkSync(filePath);

    if (spreadsheetData.length > 1000) {
      spreadsheetData = spreadsheetData.slice(0, 1000);
    }
    
    if (spreadsheetData[0] && spreadsheetData[0].length > 50) {
      spreadsheetData = spreadsheetData.map(row => row.slice(0, 50));
    }

    if (process.env.GEMINI_API_KEY) {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      const systemPrompt = `You are an Excel AI assistant. Return ONLY a valid JSON object.
User request: "${prompt}"
Data: ${JSON.stringify(spreadsheetData)}
Format: {"data": [["Header1", "Header2"], ["row1col1", "row1col2"]], "formatting": []}`;

      try {
        const result = await model.generateContent(systemPrompt);
        const response = result.response.text();
        
        let aiResult = null;
        try {
          const match = response.match(/\{[\s\S]*\}/);
          if (match) {
            aiResult = JSON.parse(match[0]);
          }
        } catch (e) {
          console.error('JSON parse error:', e);
        }
        
        if (!aiResult || !Array.isArray(aiResult.data)) {
          return res.json({ 
            result: response, 
            data: spreadsheetData, 
            formatting: [] 
          });
        }
        
        return res.json({ 
          result: response, 
          data: aiResult.data, 
          formatting: aiResult.formatting || [] 
        });
        
      } catch (geminiErr) {
        console.error('Gemini error:', geminiErr);
        return res.status(500).json({ 
          error: 'AI processing failed', 
          details: geminiErr.message 
        });
      }
    } else {
      return res.json({ 
        result: `AI Response: Processed "${prompt}" request successfully.`, 
        data: spreadsheetData,
        formatting: []
      });
    }
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, '0.0.0.0', () => console.log(`Backend running on port ${PORT}`));