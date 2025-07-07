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

// File upload endpoint with robust AI processing
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
    fs.unlinkSync(filePath);

    if (process.env.OPENAI_API_KEY) {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const systemPrompt = `You are an Excel AI assistant. When the user asks for a change, you MUST return ONLY a valid JSON object with two keys: 'data' (the updated spreadsheet as an array of arrays) and 'formatting' (an array of arrays of formatting objects, matching the data structure, with keys like 'color', 'background', 'bold', 'italic'). Do not return any explanation, markdown, or extra text. If the request is ambiguous or impossible, return the original spreadsheet as 'data' and an empty array for 'formatting'. Example: {"data": [["A", "B"], [1, 2]], "formatting": [[{"bold":true,"color":"red"},{"bold":false}], [{},{}]]}`;
      // Use the new prompt rewriting function
      const rewrittenPrompt = rewritePrompt(prompt, spreadsheetData);
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: rewrittenPrompt }
        ],
        temperature: 0.1,
        max_tokens: 2000
      });
      const response = completion.choices[0]?.message?.content;
      console.log('Raw OpenAI response:', response);
      // Try to extract JSON from the response
      let newData = null;
      let parseError = null;
      try {
        const match = response.match(/\[.*\]/s);
        if (match) {
          newData = JSON.parse(match[0]);
        }
      } catch (e) { parseError = e; }
      if (!Array.isArray(newData) || !Array.isArray(newData[0])) {
        return res.json({ result: response, newData: spreadsheetData, aiError: 'AI did not return a valid spreadsheet. Here is the raw response.', raw: response });
      }
      return res.json({ result: response, newData });
    } else {
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