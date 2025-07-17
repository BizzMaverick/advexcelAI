/**
 * AWS Service for Excel AI Assistant
 * Handles communication with AWS Lambda functions
 */

export const AWSService = {
  /**
   * Upload a spreadsheet with a prompt to AWS Lambda
   * @param {File} file - The Excel/CSV file
   * @param {string} prompt - The user's prompt
   * @returns {Promise<Object>} - The processed data and formatting
   */
  async uploadSpreadsheetWithPrompt(file, prompt) {
    try {
      // Convert file to base64
      const fileContent = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      
      // Call AWS Lambda function
      // Replace this URL with your actual API Gateway URL when deployed
      const response = await fetch('https://YOUR_API_GATEWAY_URL/prod/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt, fileContent })
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('AWS API Error:', error);
      throw error;
    }
  },
  
  /**
   * Process a prompt with current data
   * @param {Array} data - The current spreadsheet data
   * @param {string} prompt - The user's prompt
   * @returns {Promise<Object>} - The processed data and formatting
   */
  async processPromptWithData(data, prompt) {
    try {
      // Convert data to CSV
      const csvContent = data.map(row => row.join(',')).join('\\n');
      
      // Call AWS Lambda function
      const response = await fetch('https://YOUR_API_GATEWAY_URL/prod/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt, csvContent })
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('AWS API Error:', error);
      throw error;
    }
  }
};