/**
 * Direct API service for Excel AI Assistant
 * This service bypasses the AIService and directly calls the Netlify function
 */

export const directApi = {
  /**
   * Process a spreadsheet with a prompt
   * @param {File} file - The spreadsheet file
   * @param {string} prompt - The prompt to process
   * @returns {Promise<Object>} - The processed data
   */
  async processSpreadsheet(file, prompt) {
    try {
      // Create form data
      const formData = new FormData();
      formData.append('prompt', prompt);
      formData.append('file', file);
      
      // Call the Netlify function
      const response = await fetch('/.netlify/functions/upload', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },
  
  /**
   * Process current data with a prompt
   * @param {Array} data - The current spreadsheet data
   * @param {string} prompt - The prompt to process
   * @returns {Promise<Object>} - The processed data
   */
  async processCurrentData(data, prompt) {
    try {
      // Convert data to CSV
      const csvContent = data.map(row => row.join(',')).join('\n');
      const csvFile = new File([csvContent], 'current-data.csv', { type: 'text/csv' });
      
      return await this.processSpreadsheet(csvFile, prompt);
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },
  
  /**
   * Apply direct formatting without backend
   * @param {Array} data - The spreadsheet data
   * @param {string} action - The formatting action
   * @returns {Array} - The formatting array
   */
  applyDirectFormatting(data, action) {
    // Initialize formatting array
    const formatting = data.map(row => row.map(() => ({})));
    
    switch (action) {
      case 'highlight-red':
        // Highlight all rows in red
        for (let row = 0; row < data.length; row++) {
          for (let col = 0; col < data[row].length; col++) {
            if (row > 0) { // Skip header row
              formatting[row][col] = { 
                background: '#fef2f2', 
                color: '#dc2626' 
              };
            }
          }
        }
        break;
        
      case 'highlight-top-10':
        // Highlight top 10 rows in blue
        for (let row = 1; row <= Math.min(10, data.length - 1); row++) {
          for (let col = 0; col < data[row].length; col++) {
            formatting[row][col] = { 
              background: '#eff6ff', 
              color: '#1d4ed8' 
            };
          }
        }
        break;
    }
    
    return formatting;
  }
};