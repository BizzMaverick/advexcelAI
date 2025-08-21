// Simple CSS-based analytics charts
// Safe implementation that won't conflict with existing functionality

export const generateChart = (data, prompt) => {
  if (!data || data.length <= 1) {
    return '<strong>Error:</strong> No data available for chart generation.';
  }

  const headers = data[0];
  const dataRows = data.slice(1);
  const lowerPrompt = prompt.toLowerCase();

  // Detect chart type
  let chartType = 'bar';
  if (lowerPrompt.includes('line')) chartType = 'line';
  if (lowerPrompt.includes('pie')) chartType = 'pie';

  // Find data column (look for numeric data)
  let dataColumn = 1; // Default to second column
  let labelColumn = 0; // Default to first column

  // Try to find a column with numbers
  for (let col = 1; col < headers.length; col++) {
    let hasNumbers = false;
    for (let row = 1; row < Math.min(6, dataRows.length); row++) {
      if (!isNaN(parseFloat(dataRows[row][col]))) {
        hasNumbers = true;
        break;
      }
    }
    if (hasNumbers) {
      dataColumn = col;
      break;
    }
  }

  // Get chart data (limit to 10 items for readability)
  const chartData = [];
  const maxItems = Math.min(10, dataRows.length);
  
  for (let i = 0; i < maxItems; i++) {
    const label = String(dataRows[i][labelColumn] || `Item ${i + 1}`);
    const value = parseFloat(dataRows[i][dataColumn]) || 0;
    chartData.push({ label, value });
  }

  if (chartData.length === 0) {
    return '<strong>Error:</strong> No valid data found for chart generation.';
  }

  // Generate chart based on type
  if (chartType === 'bar') {
    return generateBarChart(chartData, headers[dataColumn] || 'Data');
  } else if (chartType === 'pie') {
    return generatePieChart(chartData, headers[dataColumn] || 'Data');
  } else {
    return generateLineChart(chartData, headers[dataColumn] || 'Data');
  }
};

const generateBarChart = (data, title) => {
  const maxValue = Math.max(...data.map(d => d.value));
  
  let html = `<strong>📊 ${title} - Bar Chart</strong><br><br>`;
  html += '<div style="max-width: 600px;">';
  
  data.forEach(item => {
    const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
    html += `
      <div style="margin-bottom: 8px;">
        <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 2px;">
          <span>${item.label}</span>
          <span><strong>${item.value}</strong></span>
        </div>
        <div style="background: #e0e0e0; height: 20px; border-radius: 10px; overflow: hidden;">
          <div style="background: #0078d4; height: 100%; width: ${percentage}%; border-radius: 10px; transition: width 0.5s ease;"></div>
        </div>
      </div>
    `;
  });
  
  html += '</div>';
  return html;
};

const generatePieChart = (data, title) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'];
  
  let html = `<strong>🥧 ${title} - Pie Chart</strong><br><br>`;
  html += '<div style="display: flex; gap: 20px; align-items: center; max-width: 600px;">';
  
  // SVG Pie Chart
  html += '<div style="position: relative; width: 200px; height: 200px;">';
  html += '<svg width="200" height="200" style="transform: rotate(-90deg);">';
  
  let currentAngle = 0;
  data.forEach((item, index) => {
    const angle = (item.value / total) * 360;
    const x1 = 100 + 80 * Math.cos((currentAngle * Math.PI) / 180);
    const y1 = 100 + 80 * Math.sin((currentAngle * Math.PI) / 180);
    const x2 = 100 + 80 * Math.cos(((currentAngle + angle) * Math.PI) / 180);
    const y2 = 100 + 80 * Math.sin(((currentAngle + angle) * Math.PI) / 180);
    const largeArc = angle > 180 ? 1 : 0;
    const pathData = `M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArc} 1 ${x2} ${y2} Z`;
    
    html += `<path d="${pathData}" fill="${colors[index % colors.length]}" stroke="white" stroke-width="2"></path>`;
    currentAngle += angle;
  });
  
  html += '</svg></div>';
  
  // Legend
  html += '<div>';
  data.forEach((item, index) => {
    const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
    html += `
      <div style="display: flex; align-items: center; margin-bottom: 5px;">
        <div style="width: 12px; height: 12px; background: ${colors[index % colors.length]}; margin-right: 8px; border-radius: 2px;"></div>
        <span style="font-size: 12px;">${item.label}: ${item.value} (${percentage}%)</span>
      </div>
    `;
  });
  html += '</div>';
  
  html += '</div>';
  return html;
};

const generateLineChart = (data, title) => {
  const maxValue = Math.max(...data.map(d => d.value));
  
  let html = `<strong>📈 ${title} - Line Chart</strong><br><br>`;
  html += '<div style="max-width: 600px;">';
  html += '<div style="display: flex; align-items: end; height: 200px; border: 1px solid #ddd; padding: 10px; gap: 5px;">';
  
  data.forEach(item => {
    const height = maxValue > 0 ? (item.value / maxValue) * 180 : 0;
    html += `
      <div style="flex: 1; display: flex; flex-direction: column; align-items: center;">
        <div style="background: #0078d4; width: 20px; height: ${height}px; margin-bottom: 5px; border-radius: 2px;"></div>
        <div style="font-size: 10px; text-align: center; word-break: break-word;">${item.label}</div>
        <div style="font-size: 10px; color: #666;">${item.value}</div>
      </div>
    `;
  });
  
  html += '</div></div>';
  return html;
};