/**
 * Gemini API Service for Excel AI Assistant
 */

const https = require('https');

class GeminiService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
  }

  /**
   * Process a prompt with Gemini API
   * @param {string} prompt - The user's prompt
   * @param {Array} data - The spreadsheet data
   * @returns {Promise<Object>} - The processed response
   */
  async processPrompt(prompt, data) {
    try {
      // Create a simple text representation of the data
      const dataText = data.map(row => row.join(',')).join('\n');
      
      // Create the request payload
      const payload = {
        contents: [
          {
            parts: [
              {
                text: `I have a spreadsheet with the following data:\n${dataText}\n\nThe user wants to: ${prompt}\n\nPlease provide a response in JSON format with the following structure:\n{\n  "result": "Brief description of what was done",\n  "data": [Array of arrays representing the modified data],\n  "formatting": [Array of arrays representing cell formatting]\n}\n\nFor formatting, each cell should have a structure like: { "background": "#fef2f2", "color": "#dc2626" } for red highlighting.`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 8192
        }
      };

      // Make the API request
      const response = await this.makeRequest(payload);
      
      // Parse and process the response
      const text = response.candidates[0].content.parts[0].text;
      
      // Extract JSON from the response
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || 
                        text.match(/```([\s\S]*?)```/) || 
                        text.match(/{[\s\S]*}/);
                        
      let jsonText = jsonMatch ? jsonMatch[1] || jsonMatch[0] : text;
      
      // Clean up the JSON text
      jsonText = jsonText.replace(/^{/g, '{').replace(/}$/g, '}');
      
      try {
        // Parse the JSON
        const result = JSON.parse(jsonText);
        return result;
      } catch (parseError) {
        console.error('Failed to parse JSON from Gemini response:', parseError);
        console.log('Raw response text:', text);
        
        // Return a fallback result
        return {
          result: `Processed with fallback: ${prompt}`,
          data: data,
          formatting: data.map(row => row.map(() => ({})))
        };
      }
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error(`Gemini API Error: ${error.message}`);
    }
  }

  /**
   * Make a request to the Gemini API
   * @param {Object} payload - The request payload
   * @returns {Promise<Object>} - The API response
   */
  makeRequest(payload) {
    return new Promise((resolve, reject) => {
      const url = `${this.endpoint}?key=${this.apiKey}`;
      
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      };
      
      const req = https.request(url, options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              const parsedData = JSON.parse(data);
              resolve(parsedData);
            } catch (error) {
              reject(new Error(`Failed to parse response: ${error.message}`));
            }
          } else {
            reject(new Error(`API request failed with status code ${res.statusCode}: ${data}`));
          }
        });
      });
      
      req.on('error', (error) => {
        reject(error);
      });
      
      req.write(JSON.stringify(payload));
      req.end();
    });
  }
}

module.exports = GeminiService;