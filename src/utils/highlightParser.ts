/**
 * Intelligent highlighting parser
 * Analyzes natural language prompts to determine highlighting parameters
 */

// Color mapping for common color names
const colorMap: Record<string, {bg: string, text: string}> = {
  red: { bg: '#fef2f2', text: '#dc2626' },
  blue: { bg: '#eff6ff', text: '#1d4ed8' },
  green: { bg: '#f0fdf4', text: '#16a34a' },
  yellow: { bg: '#fefce8', text: '#ca8a04' },
  orange: { bg: '#fff7ed', text: '#ea580c' },
  purple: { bg: '#faf5ff', text: '#7e22ce' },
  pink: { bg: '#fdf2f8', text: '#be185d' },
  gray: { bg: '#f9fafb', text: '#4b5563' },
  black: { bg: '#f3f4f6', text: '#111827' },
};

/**
 * Parse a natural language prompt and apply highlighting to data
 * @param prompt The user's natural language prompt
 * @param data The data grid to highlight
 * @returns Formatting grid or null if not a highlighting request
 */
export function parseHighlightingPrompt(
  prompt: string,
  data: any[][]
): ({ color?: string; background?: string; bold?: boolean; italic?: boolean } | undefined)[][] | null {
  const promptLower = prompt.toLowerCase();
  
  // If not a highlighting request, return null
  if (!promptLower.includes('highlight')) {
    return null;
  }
  
  // Create empty formatting grid
  const formatting = data.map(row => row.map(() => ({})));
  
  // Determine color
  let bgColor = '#fef2f2'; // Default light red
  let textColor = '#dc2626'; // Default red text
  
  for (const [colorName, colorValues] of Object.entries(colorMap)) {
    if (promptLower.includes(colorName)) {
      bgColor = colorValues.bg;
      textColor = colorValues.text;
      break;
    }
  }
  
  // Determine row selection
  let startRow = 1; // Skip header by default
  let endRow = data.length - 1;
  
  if (promptLower.includes('top')) {
    const match = promptLower.match(/top\s+(\d+)/);
    const count = match ? parseInt(match[1]) : 10;
    endRow = Math.min(count, data.length - 1);
  } else if (promptLower.includes('bottom')) {
    const match = promptLower.match(/bottom\s+(\d+)/);
    const count = match ? parseInt(match[1]) : 10;
    startRow = Math.max(data.length - count, 1);
  } else if (promptLower.includes('odd')) {
    // Apply to odd rows only
    for (let i = 1; i < data.length; i += 2) {
      for (let j = 0; j < data[i].length; j++) {
        formatting[i][j] = { background: bgColor, color: textColor };
      }
    }
    return formatting;
  } else if (promptLower.includes('even')) {
    // Apply to even rows only
    for (let i = 2; i < data.length; i += 2) {
      for (let j = 0; j < data[i].length; j++) {
        formatting[i][j] = { background: bgColor, color: textColor };
      }
    }
    return formatting;
  } else if (promptLower.match(/rows?\s+(\d+)/)) {
    // Specific row
    const match = promptLower.match(/rows?\s+(\d+)/);
    if (match) {
      const rowNum = parseInt(match[1]);
      if (rowNum > 0 && rowNum < data.length) {
        for (let j = 0; j < data[rowNum].length; j++) {
          formatting[rowNum][j] = { background: bgColor, color: textColor };
        }
      }
      return formatting;
    }
  } else if (promptLower.match(/rows?\s+(\d+)\s*-\s*(\d+)/)) {
    // Range of rows
    const match = promptLower.match(/rows?\s+(\d+)\s*-\s*(\d+)/);
    if (match) {
      startRow = Math.max(parseInt(match[1]), 1);
      endRow = Math.min(parseInt(match[2]), data.length - 1);
    }
  }
  
  // Determine column selection
  let startCol = 0;
  let endCol = (data[0]?.length || 0) - 1;
  let specificColumns: number[] | null = null;
  
  if (promptLower.includes('column')) {
    if (promptLower.match(/columns?\s+([a-z])/i)) {
      // Specific column
      const match = promptLower.match(/columns?\s+([a-z])/i);
      if (match) {
        const colIndex = match[1].toUpperCase().charCodeAt(0) - 65; // Convert A->0, B->1, etc.
        if (colIndex >= 0 && colIndex < (data[0]?.length || 0)) {
          specificColumns = [colIndex];
        }
      }
    } else if (promptLower.match(/columns?\s+([a-z])\s*-\s*([a-z])/i)) {
      // Range of columns
      const match = promptLower.match(/columns?\s+([a-z])\s*-\s*([a-z])/i);
      if (match) {
        startCol = match[1].toUpperCase().charCodeAt(0) - 65;
        endCol = match[2].toUpperCase().charCodeAt(0) - 65;
        startCol = Math.max(startCol, 0);
        endCol = Math.min(endCol, (data[0]?.length || 0) - 1);
      }
    }
  }
  
  // Apply highlighting
  if (specificColumns) {
    // Highlight specific columns
    for (let i = startRow; i <= endRow; i++) {
      for (const col of specificColumns) {
        if (col >= 0 && col < (data[i]?.length || 0)) {
          formatting[i][col] = { background: bgColor, color: textColor };
        }
      }
    }
  } else {
    // Highlight range of columns
    for (let i = startRow; i <= endRow; i++) {
      for (let j = startCol; j <= endCol; j++) {
        if (j >= 0 && j < (data[i]?.length || 0)) {
          formatting[i][j] = { background: bgColor, color: textColor };
        }
      }
    }
  }
  
  return formatting;
}