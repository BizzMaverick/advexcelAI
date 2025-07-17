import React from 'react';

interface DirectFormattingProps {
  onApplyFormatting: (action: string) => void;
}

const DirectFormatting: React.FC<DirectFormattingProps> = ({ onApplyFormatting }) => {
  const formattingOptions = [
    { name: 'Highlight All Rows', action: 'highlight-all-red', color: '#fef2f2', textColor: '#dc2626' },
    { name: 'Highlight Top 10', action: 'highlight-top-10', color: '#eff6ff', textColor: '#1d4ed8' },
    { name: 'Highlight Bottom 10', action: 'highlight-bottom-10', color: '#f0fdf4', textColor: '#16a34a' },
    { name: 'Bold Headers', action: 'bold-headers', icon: 'B' },
    { name: 'Alternate Row Colors', action: 'alternate-rows', icon: '⟺' },
    { name: 'Clear Formatting', action: 'clear-formatting', icon: '✓' }
  ];

  return (
    <div style={{
      padding: '12px',
      background: '#f8f9fa',
      borderRadius: '8px',
      marginBottom: '16px',
      border: '1px solid #e9ecef'
    }}>
      <h3 style={{ margin: '0 0 12px 0', fontSize: '1rem', color: '#1f2937' }}>
        Direct Formatting
      </h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {formattingOptions.map((option) => (
          <button
            key={option.action}
            onClick={() => onApplyFormatting(option.action)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              border: '1px solid #e9ecef',
              borderRadius: '4px',
              background: '#ffffff',
              cursor: 'pointer',
              fontSize: '0.85rem',
              color: '#333',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#f8f9fa';
              e.currentTarget.style.borderColor = '#007bff';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = '#ffffff';
              e.currentTarget.style.borderColor = '#e9ecef';
            }}
          >
            {option.color && (
              <span style={{ 
                width: '16px', 
                height: '16px', 
                background: option.color,
                border: `1px solid ${option.textColor}`,
                borderRadius: '3px'
              }}></span>
            )}
            {option.icon && (
              <span style={{ 
                width: '16px', 
                height: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold'
              }}>{option.icon}</span>
            )}
            {option.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DirectFormatting;