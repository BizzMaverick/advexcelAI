// openai-proxy.js
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post('/api/ai', async (req, res) => {
  const { prompt, spreadsheetData } = req.body;
  try {
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
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`OpenAI proxy running on port ${PORT}`)); 