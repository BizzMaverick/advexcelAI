# advexcel.online

AI-powered Excel automation and analytics for everyone.

## 🚀 Features

- **Excel File Upload** - Upload and view Excel files in a web interface
- **AI-Powered Operations** - Use natural language to perform Excel operations
- **Real-time Editing** - Edit your data directly in the browser
- **Smart Analytics** - Get instant insights from your data

## 🤖 AI Integration Setup

To enable AI functionality, you need to set up an OpenAI API key:

1. **Get an API Key**: Visit [OpenAI Platform](https://platform.openai.com/api-keys) and create a new API key
2. **Set Environment Variable**: Create a `.env` file in the root directory with:
   ```
   VITE_OPENAI_API_KEY=your_openai_api_key_here
   ```
3. **Restart the Development Server**: The app will automatically pick up the new environment variable

## 🎯 AI Commands You Can Try

- "Sum all columns"
- "Calculate average of column B"
- "Sort by first column"
- "Filter rows where value > 100"
- "Add a total row"
- "Format header row as bold"

## ⚠️ Security Note

For production use, the OpenAI API calls should be handled server-side to protect your API key. This demo version runs client-side for simplicity.

## 🛠️ Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 📦 Technologies Used

- React + TypeScript
- Vite
- react-spreadsheet
- OpenAI API
- xlsx library
