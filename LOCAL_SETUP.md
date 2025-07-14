# 🏠 Local Development Setup

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Backend Server
```bash
npm start          # OpenAI backend (port 5001)
# OR
npm run start:gemini  # Gemini backend (port 5001)
```

### 3. Start Frontend (New Terminal)
```bash
npm run dev        # Frontend (port 5173)
```

### 4. Open Browser
Navigate to: http://localhost:5173

## 🔑 API Keys

Add your API key to `.env` file:
- **OpenAI**: Update `OPENAI_API_KEY`
- **Gemini**: Update `GEMINI_API_KEY`

## ✅ That's It!

Your Excel AI Assistant runs completely locally:
- ✅ No cloud deployment needed
- ✅ No external dependencies
- ✅ Fast local processing
- ✅ Free development environment

## 🧪 Test with Sample Data

Use the included `test-data.csv` file to test:
1. Upload the CSV file
2. Try prompts like:
   - "highlight row 1 in red"
   - "sum the salary column"
   - "make excellent performers bold"