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

const upload = multer({ dest: 'uploads/' });

// File upload endpoint with real AI processing
app.post('/api/upload', upload.single('file'), async (req, res) => {
  const prompt = req.body.prompt;
  const filePath = req.file.path;
  try {
    // Read and parse the uploaded file
    const fileBuffer = fs.readFileSync(filePath);
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const spreadsheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    // Clean up the uploaded file
    fs.unlinkSync(filePath);

    // Use OpenAI if API key is present
    if (process.env.OPENAI_API_KEY) {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const systemPrompt = `You are an Excel AI assistant. Process the user's request and modify the spreadsheet data accordingly. Return the new spreadsheet as a JSON array of arrays.`;
      const userPrompt = `User request: "${prompt}"
\nCurrent spreadsheet data:\n${JSON.stringify(spreadsheetData, null, 2)}\n\nPlease perform the requested operation and return the new spreadsheet as a JSON array of arrays.`;
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.1,
        max_tokens: 2000
      });
      const response = completion.choices[0]?.message?.content;
      // Try to extract JSON from the response
      let newData = null;
      try {
        const match = response.match(/\[.*\]/s);
        if (match) {
          newData = JSON.parse(match[0]);
        }
      } catch (e) {}
      return res.json({ result: response, newData });
    } else {
      // Fallback mock response
      return res.json({ result: `Mock AI Response: I understand you want to "${prompt}". Here's what I would do with your spreadsheet data: ${JSON.stringify(spreadsheetData).substring(0, 100)}...`, newData: spreadsheetData });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/ai', async (req, res) => {
  const { prompt, spreadsheetData } = req.body;
  try {
    const mockResponse = `Mock AI Response: I understand you want to "${prompt}". Here's what I would do with your spreadsheet data: ${JSON.stringify(spreadsheetData).substring(0, 100)}...`;
    res.json({ result: mockResponse });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`OpenAI proxy running on port ${PORT}`)); 