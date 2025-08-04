import * as XLSX from 'xlsx';

export interface CellFormat {
  backgroundColor?: string;
  color?: string;
  fontWeight?: string;
  fontStyle?: string;
  textAlign?: string;
  fontSize?: string;
}

export interface FormattedCell {
  value: any;
  format?: CellFormat;
}

export const downloadFormattedExcel = (
  data: any[][],
  formatting: { [key: string]: CellFormat },
  filename: string
) => {
  try {
    // Create a new workbook
    const wb = XLSX.utils.book_new();
    
    // Convert data to worksheet
    const ws = XLSX.utils.aoa_to_sheet(data);
    
    // Apply formatting (basic - XLSX has limited formatting support)
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    
    for (let row = range.s.r; row <= range.e.r; row++) {
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        const formatKey = `${row}-${col}`;
        
        if (formatting[formatKey] && ws[cellAddress]) {
          // XLSX.js has limited formatting support
          // We'll add basic cell styling where possible
          if (!ws[cellAddress].s) ws[cellAddress].s = {};
          
          const format = formatting[formatKey];
          
          // Font styling
          if (format.fontWeight === 'bold') {
            ws[cellAddress].s.font = { ...ws[cellAddress].s.font, bold: true };
          }
          
          if (format.fontStyle === 'italic') {
            ws[cellAddress].s.font = { ...ws[cellAddress].s.font, italic: true };
          }
          
          // Background color (limited support)
          if (format.backgroundColor) {
            ws[cellAddress].s.fill = {
              fgColor: { rgb: format.backgroundColor.replace('#', '') }
            };
          }
        }
      }
    }
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    
    // Generate filename
    const cleanFilename = filename.replace(/[<>:"/\\|?*]/g, '').replace(/\.[^/.]+$/, '');
    const finalFilename = `${cleanFilename}_formatted.xlsx`;
    
    // Download file
    XLSX.writeFile(wb, finalFilename);
    
    return true;
  } catch (error) {
    console.error('Error downloading Excel file:', error);
    return false;
  }
};

export const downloadCSV = (
  data: any[][],
  filename: string
) => {
  try {
    // Convert array to CSV
    const csvContent = data.map(row => 
      row.map(cell => {
        // Remove HTML tags for CSV export
        const cleanCell = String(cell).replace(/<[^>]*>/g, '');
        // Escape quotes and wrap in quotes if contains comma
        return cleanCell.includes(',') || cleanCell.includes('"') 
          ? `"${cleanCell.replace(/"/g, '""')}"` 
          : cleanCell;
      }).join(',')
    ).join('\n');
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename.replace(/\.[^/.]+$/, '')}_formatted.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    
    return true;
  } catch (error) {
    console.error('Error downloading CSV file:', error);
    return false;
  }
};