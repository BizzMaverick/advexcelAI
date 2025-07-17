/**
 * Direct Highlighting Script
 * 
 * This script provides a direct way to highlight rows in red
 * without relying on the backend API.
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Add a button to the page
  const buttonContainer = document.createElement('div');
  buttonContainer.style.position = 'fixed';
  buttonContainer.style.top = '10px';
  buttonContainer.style.right = '10px';
  buttonContainer.style.zIndex = '1000';
  buttonContainer.style.display = 'flex';
  buttonContainer.style.flexDirection = 'column';
  buttonContainer.style.gap = '10px';
  
  // Create highlight button
  const highlightButton = document.createElement('button');
  highlightButton.textContent = '🔴 Highlight Rows in Red';
  highlightButton.style.padding = '10px 15px';
  highlightButton.style.backgroundColor = '#dc2626';
  highlightButton.style.color = 'white';
  highlightButton.style.border = 'none';
  highlightButton.style.borderRadius = '4px';
  highlightButton.style.cursor = 'pointer';
  
  // Create remove button
  const removeButton = document.createElement('button');
  removeButton.textContent = '⚪ Remove Highlighting';
  removeButton.style.padding = '10px 15px';
  removeButton.style.backgroundColor = '#6b7280';
  removeButton.style.color = 'white';
  removeButton.style.border = 'none';
  removeButton.style.borderRadius = '4px';
  removeButton.style.cursor = 'pointer';
  
  // Add buttons to container
  buttonContainer.appendChild(highlightButton);
  buttonContainer.appendChild(removeButton);
  
  // Add container to body
  document.body.appendChild(buttonContainer);
  
  // Add event listeners
  highlightButton.addEventListener('click', function() {
    applyRedHighlighting();
  });
  
  removeButton.addEventListener('click', function() {
    removeHighlighting();
  });
  
  // Function to apply red highlighting
  function applyRedHighlighting() {
    // Find all tables in the document
    const tables = document.querySelectorAll('table');
    
    tables.forEach(table => {
      // Get all rows except headers
      const rows = table.querySelectorAll('tbody tr');
      
      rows.forEach(row => {
        // Apply red styling to each cell
        const cells = row.querySelectorAll('td');
        cells.forEach(cell => {
          cell.style.backgroundColor = '#fef2f2';
          cell.style.color = '#dc2626';
        });
      });
    });
    
    console.log('Red highlighting applied to all tables');
  }
  
  // Function to remove highlighting
  function removeHighlighting() {
    // Find all tables in the document
    const tables = document.querySelectorAll('table');
    
    tables.forEach(table => {
      // Get all rows
      const rows = table.querySelectorAll('tr');
      
      rows.forEach(row => {
        // Remove styling from each cell
        const cells = row.querySelectorAll('td');
        cells.forEach(cell => {
          cell.style.backgroundColor = '';
          cell.style.color = '';
        });
      });
    });
    
    console.log('Highlighting removed from all tables');
  }
});