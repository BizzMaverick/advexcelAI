// openai-proxy.js
import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Temporarily comment out OpenAI for testing
// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post('/api/ai', async (req, res) => {
  const { prompt, spreadsheetData } = req.body;
  try {
    // Temporary mock response for testing
    const mockResponse = `Mock AI Response: I understand you want to "${prompt}". Here's what I would do with your spreadsheet data: ${JSON.stringify(spreadsheetData).substring(0, 100)}...`;
    
    res.json({ result: mockResponse });
    
    /* Original OpenAI code (uncomment when API key is ready):
    const systemPrompt = `You are an Excel AI assistant. Process the user's request and modify the spreadsheet data accordingly.`;
    const userPrompt = `User request: "${prompt}"
\nCurrent spreadsheet data:\n${JSON.stringify(spreadsheetData, null, 2)}\n\nPlease perform the requested operation and return the result.`;

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
    res.json({ result: response });
    */
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`OpenAI proxy running on port ${PORT}`)); 