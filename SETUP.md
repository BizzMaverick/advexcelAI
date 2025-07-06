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