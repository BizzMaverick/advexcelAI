import React from 'react';

interface FormattingToolbarProps {
  onFormatChange: (format: FormatStyle) => void;
  onClearFormat: () => void;
  selectedCells: string[];
}

export interface FormatStyle {
  backgroundColor?: string;
  color?: string;
  fontWeight?: string;
  fontStyle?: string;
  textAlign?: string;
  fontSize?: string;
}

const FormattingToolbar: React.FC<FormattingToolbarProps> = ({
  onFormatChange,
  onClearFormat,
  selectedCells
}) => {
  const colors = [
    { name: 'Red', value: '#ff4444' },
    { name: 'Green', value: '#44ff44' },
    { name: 'Blue', value: '#4444ff' },
    { name: 'Yellow', value: '#ffff44' },
    { name: 'Orange', value: '#ff8844' },
    { name: 'Purple', value: '#8844ff' },
    { name: 'Pink', value: '#ff44ff' },
    { name: 'Cyan', value: '#44ffff' }
  ];

  const handleBackgroundColor = (color: string) => {
    onFormatChange({ backgroundColor: color });
  };

  const handleTextColor = (color: string) => {
    onFormatChange({ color: color });
  };

  const handleBold = () => {
    onFormatChange({ fontWeight: 'bold' });
  };

  const handleItalic = () => {
    onFormatChange({ fontStyle: 'italic' });
  };

  const handleAlignment = (align: string) => {
    onFormatChange({ textAlign: align });
  };

  const handleFontSize = (size: string) => {
    onFormatChange({ fontSize: size });
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '10px',
      backgroundColor: '#f8f9fa',
      border: '1px solid #dee2e6',
      borderRadius: '4px',
      marginBottom: '10px',
      flexWrap: 'wrap'
    }}>
      {/* Selection Info */}
      <div style={{ fontSize: '12px', color: '#666', marginRight: '10px' }}>
        {selectedCells.length > 0 ? `${selectedCells.length} cells selected` : 'Select cells to format'}
      </div>

      {/* Font Formatting */}
      <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
        <button
          onClick={handleBold}
          style={{
            padding: '5px 10px',
            border: '1px solid #ccc',
            backgroundColor: 'white',
            cursor: 'pointer',
            fontWeight: 'bold',
            borderRadius: '3px'
          }}
          title="Bold"
        >
          B
        </button>
        <button
          onClick={handleItalic}
          style={{
            padding: '5px 10px',
            border: '1px solid #ccc',
            backgroundColor: 'white',
            cursor: 'pointer',
            fontStyle: 'italic',
            borderRadius: '3px'
          }}
          title="Italic"
        >
          I
        </button>
      </div>

      {/* Font Size */}
      <select
        onChange={(e) => handleFontSize(e.target.value)}
        style={{
          padding: '5px',
          border: '1px solid #ccc',
          borderRadius: '3px',
          cursor: 'pointer'
        }}
        title="Font Size"
      >
        <option value="">Size</option>
        <option value="12px">Small</option>
        <option value="14px">Medium</option>
        <option value="16px">Large</option>
        <option value="18px">X-Large</option>
      </select>

      {/* Text Alignment */}
      <div style={{ display: 'flex', gap: '2px' }}>
        <button
          onClick={() => handleAlignment('left')}
          style={{
            padding: '5px 8px',
            border: '1px solid #ccc',
            backgroundColor: 'white',
            cursor: 'pointer',
            borderRadius: '3px 0 0 3px'
          }}
          title="Align Left"
        >
          ⬅
        </button>
        <button
          onClick={() => handleAlignment('center')}
          style={{
            padding: '5px 8px',
            border: '1px solid #ccc',
            backgroundColor: 'white',
            cursor: 'pointer',
            borderLeft: 'none',
            borderRight: 'none'
          }}
          title="Align Center"
        >
          ↔
        </button>
        <button
          onClick={() => handleAlignment('right')}
          style={{
            padding: '5px 8px',
            border: '1px solid #ccc',
            backgroundColor: 'white',
            cursor: 'pointer',
            borderRadius: '0 3px 3px 0'
          }}
          title="Align Right"
        >
          ➡
        </button>
      </div>

      {/* Background Colors */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
        <span style={{ fontSize: '12px', color: '#666' }}>Background:</span>
        {colors.map((color) => (
          <button
            key={color.name}
            onClick={() => handleBackgroundColor(color.value)}
            style={{
              width: '20px',
              height: '20px',
              backgroundColor: color.value,
              border: '1px solid #ccc',
              cursor: 'pointer',
              borderRadius: '3px'
            }}
            title={`Background ${color.name}`}
          />
        ))}
      </div>

      {/* Text Colors */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
        <span style={{ fontSize: '12px', color: '#666' }}>Text:</span>
        {colors.map((color) => (
          <button
            key={color.name}
            onClick={() => handleTextColor(color.value)}
            style={{
              width: '20px',
              height: '20px',
              backgroundColor: 'white',
              border: `2px solid ${color.value}`,
              cursor: 'pointer',
              borderRadius: '3px'
            }}
            title={`Text ${color.name}`}
          />
        ))}
      </div>

      {/* Clear Formatting */}
      <button
        onClick={onClearFormat}
        style={{
          padding: '5px 10px',
          border: '1px solid #dc3545',
          backgroundColor: '#dc3545',
          color: 'white',
          cursor: 'pointer',
          borderRadius: '3px',
          fontSize: '12px'
        }}
        title="Clear Formatting"
      >
        Clear Format
      </button>
    </div>
  );
};

export default FormattingToolbar;