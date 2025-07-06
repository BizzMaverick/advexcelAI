<<<<<<< HEAD
# 🤖 Advanced Excel AI Assistant

A powerful web application that combines the capabilities of Excel with AI to provide advanced spreadsheet functionality through natural language commands.

## ✨ Features

### 🎯 Core Functionality
- **AI-Powered Excel Operations**: Natural language processing for all Excel tasks
- **Advanced Spreadsheet Editor**: Full-featured spreadsheet with Handsontable
- **Multiple File Format Support**: `.xlsx`, `.xls`, `.csv`, `.xlsm`
- **Real-time Data Processing**: Instant AI responses and data manipulation

### 📊 Excel Features
- **Formulas**: XLOOKUP, VLOOKUP, SUMIF, IF, and more
- **Conditional Formatting**: Color coding based on values and conditions
- **Pivot Tables**: Data summarization and analysis
- **Data Analytics**: Statistical analysis and insights
- **Chart Generation**: Automatic chart data and recommendations

### 🔧 Technical Features
- **Modern React + TypeScript**: Built with latest web technologies
- **Handsontable Integration**: Professional-grade spreadsheet component
- **ExcelJS Support**: Full Excel file generation with formulas and formatting
- **OpenAI GPT-4 Integration**: Advanced AI processing capabilities
- **Responsive Design**: Works on desktop and mobile devices

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd advexcel-online-clean
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the project root:
   ```env
   VITE_OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 📖 Usage Guide

### 1. Upload Your Excel File
- Click "📁 Upload Excel/CSV File"
- Select your file (supports `.xlsx`, `.xls`, `.csv`, `.xlsm`)
- Choose the correct header row if prompted

### 2. AI-Powered Operations
Use natural language to perform Excel operations:

#### Basic Operations
```
"Sum column B"
"Calculate average of column C"
"Sort data by column A"
"Filter rows where column B > 100"
```

#### Advanced Formulas
```
"Create XLOOKUP formula to find value in column A"
"Add SUMIF formula for column B where column C equals 'Category'"
"Apply IF formula: if column A > 50 then 'High' else 'Low'"
```

#### Conditional Formatting
```
"Apply conditional formatting to column B where values > 100"
"Highlight cells in column C that contain 'Error'"
"Color code column A based on value ranges"
```

#### Pivot Tables & Analytics
```
"Create pivot table summarizing data by category"
"Generate analytics report for sales data"
"Show data insights and trends"
```

### 3. Download Results
- **Excel (.xlsx)**: Full Excel file with formulas and formatting
- **CSV**: Simple comma-separated values format

## 🔧 Advanced Configuration

### Environment Variables
```env
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

### Custom AI Prompts
The AI system supports various operation types:
- `sum`: Sum values in columns or ranges
- `average`: Calculate averages
- `filter`: Filter data based on conditions
- `sort`: Sort data by columns
- `formula`: Apply Excel formulas
- `format`: Apply conditional formatting
- `pivot`: Create pivot tables
- `lookup`: Perform lookup operations
- `analytics`: Data analysis and insights
- `chart`: Generate chart data

## 🛠️ Technical Architecture

### Frontend Stack
- **React 18**: Modern React with hooks
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and dev server
- **Handsontable**: Professional spreadsheet component
- **ExcelJS**: Excel file generation and parsing

### AI Integration
- **OpenAI GPT-4**: Advanced language model
- **Custom Prompts**: Optimized for Excel operations
- **Error Handling**: Graceful fallbacks for failed operations

### File Processing
- **Multiple Formats**: Excel, CSV, and more
- **Header Detection**: Automatic or manual header row selection
- **Data Validation**: Robust error handling for malformed files

## 📁 Project Structure

```
src/
├── components/
│   └── ApiKeyStatus.tsx      # API key validation component
├── services/
│   ├── aiService.ts          # AI processing service
│   └── excelService.ts       # Excel file operations
├── LandingPage.tsx           # Main application component
├── App.tsx                   # Root component
└── main.tsx                  # Application entry point
```

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Add environment variables in Vercel dashboard

### Deploy to Netlify
1. Build the project: `npm run build`
2. Upload `dist` folder to Netlify
3. Add environment variables in Netlify dashboard

## 🔒 Security Considerations

- **API Key Protection**: Never commit API keys to version control
- **Environment Variables**: Use `.env` files for sensitive data
- **Client-Side Security**: API keys are exposed in browser (use server-side in production)
- **File Validation**: Validate uploaded files for security

## 🐛 Troubleshooting

### Common Issues

1. **API Key Not Working**
   - Check `.env` file format (no spaces around `=`)
   - Restart development server after adding API key
   - Verify API key is valid in OpenAI dashboard

2. **File Upload Issues**
   - Ensure file format is supported (`.xlsx`, `.xls`, `.csv`, `.xlsm`)
   - Check file size (recommended < 10MB)
   - Verify file is not corrupted

3. **AI Processing Errors**
   - Check OpenAI API quota and billing
   - Verify internet connection
   - Try simpler prompts for complex operations

### Performance Tips
- Use smaller datasets for faster processing
- Break complex operations into smaller steps
- Clear browser cache if experiencing issues

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- OpenAI for GPT-4 API
- Handsontable for the spreadsheet component
- ExcelJS for Excel file processing
- React and Vite communities

## 📞 Support

For support and questions:
- **Email**: [contact@advexcel.online](mailto:contact@advexcel.online?subject=Excel AI Assistant Support)
- Create an issue in the repository
- Check the troubleshooting section
- Review the usage examples

### Contact Information
- **Email**: contact@advexcel.online
- **Subject**: Excel AI Assistant Support
- **Response Time**: Within 24 hours

---

**Made with ❤️ for Excel users who want AI-powered productivity** 
=======
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
>>>>>>> 21ae1af82d09521b87df252822dab1fb1422f456
