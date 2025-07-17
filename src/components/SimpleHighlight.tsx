import React, { useState } from 'react';

interface SimpleHighlightProps {
  data: any[][];
}

const SimpleHighlight: React.FC<SimpleHighlightProps> = ({ data }) => {
  const [highlighted, setHighlighted] = useState(false);
  
  const toggleHighlight = () => {
    setHighlighted(!highlighted);
  };
  
  return (
    <div style={{ 
      padding: '20px',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      margin: '20px 0'
    }}>
      <h3>Simple Highlight Test</h3>
      <button 
        onClick={toggleHighlight}
        style={{
          padding: '8px 16px',
          background: highlighted ? '#dc2626' : '#2563eb',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginBottom: '16px'
        }}
      >
        {highlighted ? 'Remove Red Highlight' : 'Apply Red Highlight'}
      </button>
      
      <div style={{ overflowX: 'auto' }}>
        <table style={{ 
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '14px'
        }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              {data[0]?.map((header, i) => (
                <th key={i} style={{ 
                  padding: '12px',
                  textAlign: 'left',
                  borderBottom: '2px solid #e5e7eb'
                }}>
                  {String(header || `Column ${i+1}`)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.slice(1).map((row, rowIndex) => (
              <tr key={rowIndex} style={{ 
                background: highlighted ? '#fef2f2' : (rowIndex % 2 === 0 ? '#ffffff' : '#f9fafb'),
                color: highlighted ? '#dc2626' : 'inherit'
              }}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} style={{ 
                    padding: '12px',
                    borderBottom: '1px solid #e5e7eb'
                  }}>
                    {String(cell || '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SimpleHighlight;