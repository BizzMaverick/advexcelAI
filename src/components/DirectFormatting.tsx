import React from 'react';

interface DirectFormattingProps {
  onApplyFormatting: (action: string) => void;
}

const DirectFormatting: React.FC<DirectFormattingProps> = ({ onApplyFormatting }) => {
  return (
    <div style={{ marginTop: '20px' }}>
      <h4 style={{ margin: '0 0 8px 0', color: '#333' }}>🎨 Direct Formatting</h4>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button
          onClick={() => onApplyFormatting('highlight-all-red')}
          style={{
            padding: '8px',
            background: '#fef2f2',
            color: '#dc2626',
            border: '1px solid #fecaca',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.85rem',
            textAlign: 'left'
          }}
        >
          🔴 Highlight All Rows
        </button>
        
        <button
          onClick={() => onApplyFormatting('highlight-top-10')}
          style={{
            padding: '8px',
            background: '#eff6ff',
            color: '#1d4ed8',
            border: '1px solid #bfdbfe',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.85rem',
            textAlign: 'left'
          }}
        >
          🔵 Highlight Top 10
        </button>
        
        <button
          onClick={() => onApplyFormatting('highlight-bottom-10')}
          style={{
            padding: '8px',
            background: '#f0fdf4',
            color: '#16a34a',
            border: '1px solid #bbf7d0',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.85rem',
            textAlign: 'left'
          }}
        >
          🟢 Highlight Bottom 10
        </button>
        
        <button
          onClick={() => onApplyFormatting('alternate-rows')}
          style={{
            padding: '8px',
            background: '#f9fafb',
            color: '#4b5563',
            border: '1px solid #e5e7eb',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.85rem',
            textAlign: 'left'
          }}
        >
          🔄 Alternate Row Colors
        </button>
        
        <button
          onClick={() => onApplyFormatting('bold-headers')}
          style={{
            padding: '8px',
            background: '#f8fafc',
            color: '#0f172a',
            border: '1px solid #e2e8f0',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.85rem',
            textAlign: 'left',
            fontWeight: 'bold'
          }}
        >
          📋 Bold Headers
        </button>
        
        <button
          onClick={() => onApplyFormatting('clear-formatting')}
          style={{
            padding: '8px',
            background: '#ffffff',
            color: '#6b7280',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.85rem',
            textAlign: 'left'
          }}
        >
          🧹 Clear Formatting
        </button>
      </div>
    </div>
  );
};

export default DirectFormatting;