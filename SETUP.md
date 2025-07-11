<<<<<<< HEAD
# 🚀 Quick Setup Guide - Advanced Excel AI Assistant

## Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- OpenAI API key

## Step-by-Step Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
Create a `.env` file in the project root:
```env
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

**Important:** Replace `your_openai_api_key_here` with your actual OpenAI API key.

### 3. Start Development Server
```bash
npm run dev
```

### 4. Access the Application
Open your browser and navigate to: `http://localhost:5173`

## 🎯 Getting Started

### First Time Setup
1. **Upload an Excel File**: Click "📁 Upload Excel/CSV File" and select your file
2. **Select Header Row**: Choose which row contains your column headers
3. **Check API Status**: Ensure your OpenAI API key is valid
4. **Start Using AI**: Type natural language commands in the AI processing section

### Example Commands to Try
```
"Sum column B"
"Calculate average of column C"
"Create XLOOKUP formula to find value in column A"
"Apply conditional formatting to column B where values > 100"
"Create pivot table summarizing data by category"
"Generate analytics report for sales data"
```

## 🔧 Troubleshooting

### Common Issues

**API Key Not Working**
- Check `.env` file format (no spaces around `=`)
- Restart development server after adding API key
- Verify API key is valid in OpenAI dashboard

**File Upload Issues**
- Ensure file format is supported (`.xlsx`, `.xls`, `.csv`, `.xlsm`)
- Check file size (recommended < 10MB)
- Verify file is not corrupted

**AI Processing Errors**
- Check OpenAI API quota and billing
- Verify internet connection
- Try simpler prompts for complex operations

### Performance Tips
- Use smaller datasets for faster processing
- Break complex operations into smaller steps
- Clear browser cache if experiencing issues

## 📊 Supported Features

### Excel Operations
- ✅ Basic calculations (SUM, AVERAGE, COUNT)
- ✅ Advanced formulas (XLOOKUP, VLOOKUP, SUMIF, IF)
- ✅ Conditional formatting
- ✅ Pivot tables
- ✅ Data analytics
- ✅ Sorting and filtering
- ✅ Data validation

### File Formats
- ✅ Excel (.xlsx)
- ✅ Excel (.xls)
- ✅ CSV (.csv)
- ✅ Excel Macro (.xlsm)

### Export Options
- ✅ Download as Excel (.xlsx) with formulas
- ✅ Download as CSV
- ✅ Preserve formatting and formulas

## 🎨 UI Features

### Modern Interface
- Responsive design for all devices
- Professional spreadsheet editor
- Real-time data updates
- Intuitive navigation

### AI Integration
- Natural language processing
- Instant operation feedback
- Error handling and fallbacks
- Operation history tracking

## 🔒 Security Notes

- API keys are stored in environment variables
- No data is stored on servers
- All processing happens in your browser
- Files are processed locally

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Review the console for error messages
3. Ensure all dependencies are installed
4. Verify your OpenAI API key is valid

### Contact Support
- **Email**: [contact@advexcel.online](mailto:contact@advexcel.online?subject=Excel AI Assistant Support)
- **Response Time**: Within 24 hours
- **Subject**: Excel AI Assistant Support

---

**Your Advanced Excel AI Assistant is now ready to use! 🎉** 
=======
# OpenAI API Setup Guide

## Quick Setup

1. **Get an OpenAI API Key**
   - Visit [OpenAI Platform](https://platform.openai.com/api-keys)
   - Sign up or log in to your account
   - Click "Create new secret key"
   - Copy the generated API key

2. **Configure Environment Variable**
   - In the project root directory, edit the `.env` file
   - Replace `your_openai_api_key_here` with your actual API key:
   ```
   VITE_OPENAI_API_KEY=sk-your-actual-api-key-here
   ```

3. **Restart Development Server**
   ```bash
   npm run dev
   ```

4. **Verify Setup**
   - The app will show a green "✅ OpenAI API key configured and ready" message
   - If you see a warning, click "Test API Key" to verify

## Troubleshooting

### "API Key Required" Error
- Make sure your `.env` file is in the project root directory
- Ensure the variable name is exactly `VITE_OPENAI_API_KEY`
- Restart the development server after making changes

### "Invalid API Key" Error
- Check that your API key is correct and not expired
- Ensure you have sufficient credits in your OpenAI account
- Try testing the key on the OpenAI platform

### Network Errors
- Check your internet connection
- Ensure you can access `api.openai.com`
- Some corporate networks may block API access

## Security Notes

⚠️ **Important**: This demo runs client-side for simplicity. In production:
- Never expose API keys in client-side code
- Use a backend server to handle API calls
- Implement proper authentication and rate limiting

## Cost Considerations

- OpenAI API usage incurs costs based on token usage
- Monitor your usage in the [OpenAI Dashboard](https://platform.openai.com/usage)
- Set up billing alerts to avoid unexpected charges 
>>>>>>> 21ae1af82d09521b87df252822dab1fb1422f456
