/**
 * Simple highlighting utility
 * Provides basic highlighting functionality without complex parsing
 */

/**
 * Apply highlighting based on a prompt
 * @param {string} prompt - The user's prompt
 * @param {Array} data - The data grid
 * @returns {Array} - Formatting grid
 */
export function applyHighlighting(prompt, data) {
  // Create empty formatting grid
  const formatting = [];
  for (let i = 0; i < data.length; i++) {
    const row = [];
    for (let j = 0; j < (data[i] || []).length; j++) {
      row.push({});
    }
    formatting.push(row);
  }
  
  // Default to red highlighting
  let bgColor = '#fef2f2';
  let textColor = '#dc2626';
  
  // Check for colors
  if (prompt.includes('blue')) {
    bgColor = '#eff6ff';
    textColor = '#1d4ed8';
  } else if (prompt.includes('green')) {
    bgColor = '#f0fdf4';
    textColor = '#16a34a';
  } else if (prompt.includes('yellow')) {
    bgColor = '#fefce8';
    textColor = '#ca8a04';
  }
  
  // Default to all rows except header
  let startRow = 1;
  let endRow = data.length - 1;
  
  // Check for top rows
  if (prompt.includes('top')) {
    const match = prompt.match(/top\s+(\d+)/);
    if (match) {
      endRow = Math.min(parseInt(match[1]) + 1, data.length - 1);
    } else {
      endRow = Math.min(11, data.length - 1); // Default to top 10
    }
  }
  
  // Check for bottom rows
  if (prompt.includes('bottom')) {
    const match = prompt.match(/bottom\s+(\d+)/);
    if (match) {
      startRow = Math.max(data.length - parseInt(match[1]), 1);
    } else {
      startRow = Math.max(data.length - 10, 1); // Default to bottom 10
    }
  }
  
  // Apply highlighting
  for (let i = startRow; i <= endRow; i++) {
    for (let j = 0; j < (data[i] || []).length; j++) {
      formatting[i][j] = {
        background: bgColor,
        color: textColor
      };
    }
  }
  
  return formatting;
}