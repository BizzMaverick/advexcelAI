import React, { useState } from 'react';

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
  const [showColorPicker, setShowColorPicker] = useState<'bg' | 'text' | null>(null);
  
  const colors = [
    '#ffffff', '#000000', '#e74c3c', '#27ae60', '#3498db', '#f39c12',
    '#9b59b6', '#1abc9c', '#34495e', '#95a5a6', '#f1c40f', '#e67e22'
  ];

  const handleBackgroundColor = (color: string) => {
    onFormatChange({ backgroundColor: color });
    setShowColorPicker(null);
  };

  const handleTextColor = (color: string) => {
    onFormatChange({ color: color });
    setShowColorPicker(null);
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
      gap: '1px',
      padding: '8px 12px',
      backgroundColor: '#f1f3f4',
      borderBottom: '1px solid #dadce0',
      fontSize: '14px',
      position: 'relative'
    }}>
      {/* Selection Info */}
      <div style={{ 
        fontSize: '11px', 
        color: '#202124', 
        marginRight: '16px',
        minWidth: '120px',
        fontWeight: '500'
      }}>
        {selectedCells.length > 0 ? `${selectedCells.length} selected` : 'Select cells'}
      </div>

      {/* Font Controls */}
      <div style={{ display: 'flex', marginRight: '12px' }}>
        <button
          onClick={handleBold}
          style={{
            width: '28px',
            height: '28px',
            border: '1px solid #d0d7de',
            backgroundColor: '#ffffff',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '14px',
            color: '#202124',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '3px 0 0 3px'
          }}
          title="Bold (Ctrl+B)"
        >
          B
        </button>
        <button
          onClick={handleItalic}
          style={{
            width: '28px',
            height: '28px',
            border: '1px solid #d0d7de',
            borderLeft: 'none',
            backgroundColor: '#ffffff',
            cursor: 'pointer',
            fontStyle: 'italic',
            fontSize: '14px',
            color: '#202124',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '0 3px 3px 0'
          }}
          title="Italic (Ctrl+I)"
        >
          I
        </button>
      </div>

      {/* Font Size */}
      <select
        onChange={(e) => handleFontSize(e.target.value)}
        style={{
          height: '28px',
          border: '1px solid #d0d7de',
          borderRadius: '3px',
          backgroundColor: '#ffffff',
          cursor: 'pointer',
          fontSize: '12px',
          color: '#202124',
          marginRight: '12px',
          minWidth: '60px'
        }}
        defaultValue=""
      >
        <option value="">Size</option>
        <option value="10px">10</option>
        <option value="12px">12</option>
        <option value="14px">14</option>
        <option value="16px">16</option>
        <option value="18px">18</option>
        <option value="20px">20</option>
      </select>

      {/* Color Controls */}
      <div style={{ display: 'flex', marginRight: '12px', position: 'relative' }}>
        <button
          onClick={() => setShowColorPicker(showColorPicker === 'bg' ? null : 'bg')}
          style={{
            width: '32px',
            height: '28px',
            border: '1px solid #d0d7de',
            backgroundColor: '#ffffff',
            cursor: 'pointer',
            borderRadius: '3px 0 0 3px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px'
          }}
          title="Fill Color"
        >
          🎨
          <div style={{ width: '20px', height: '3px', backgroundColor: '#ffeb3b', marginTop: '1px' }} />
        </button>
        <button
          onClick={() => setShowColorPicker(showColorPicker === 'text' ? null : 'text')}
          style={{
            width: '32px',
            height: '28px',
            border: '1px solid #d0d7de',
            borderLeft: 'none',
            backgroundColor: '#ffffff',
            cursor: 'pointer',
            borderRadius: '0 3px 3px 0',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px'
          }}
          title="Text Color"
        >
          A
          <div style={{ width: '20px', height: '3px', backgroundColor: '#f44336', marginTop: '1px' }} />
        </button>
        
        {/* Color Picker Dropdown */}
        {showColorPicker && (
          <div style={{
            position: 'absolute',
            top: '32px',
            left: '0',
            backgroundColor: '#ffffff',
            border: '1px solid #d0d7de',
            borderRadius: '4px',
            padding: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            zIndex: 1000,
            display: 'grid',
            gridTemplateColumns: 'repeat(6, 1fr)',
            gap: '4px',
            width: '120px'
          }}>
            {colors.map((color, index) => (
              <button
                key={index}
                onClick={() => showColorPicker === 'bg' ? handleBackgroundColor(color) : handleTextColor(color)}
                style={{
                  width: '16px',
                  height: '16px',
                  backgroundColor: color,
                  border: color === '#ffffff' ? '1px solid #d0d7de' : 'none',
                  cursor: 'pointer',
                  borderRadius: '2px'
                }}
                title={color}
              />
            ))}
          </div>
        )}
      </div>

      {/* Alignment */}
      <div style={{ display: 'flex', marginRight: '12px' }}>
        <button
          onClick={() => handleAlignment('left')}
          style={{
            width: '28px',
            height: '28px',
            border: '1px solid #d0d7de',
            backgroundColor: '#ffffff',
            cursor: 'pointer',
            borderRadius: '3px 0 0 3px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px'
          }}
          title="Align Left"
        >
          ≡
        </button>
        <button
          onClick={() => handleAlignment('center')}
          style={{
            width: '28px',
            height: '28px',
            border: '1px solid #d0d7de',
            borderLeft: 'none',
            backgroundColor: '#ffffff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px'
          }}
          title="Align Center"
        >
          ≣
        </button>
        <button
          onClick={() => handleAlignment('right')}
          style={{
            width: '28px',
            height: '28px',
            border: '1px solid #d0d7de',
            borderLeft: 'none',
            backgroundColor: '#ffffff',
            cursor: 'pointer',
            borderRadius: '0 3px 3px 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px'
          }}
          title="Align Right"
        >
          ≡
        </button>
      </div>

      {/* Clear Formatting */}
      <button
        onClick={onClearFormat}
        style={{
          height: '28px',
          padding: '0 12px',
          border: '1px solid #d0d7de',
          backgroundColor: '#ffffff',
          color: '#202124',
          cursor: 'pointer',
          borderRadius: '3px',
          fontSize: '11px',
          fontWeight: '500'
        }}
        title="Clear Formatting"
      >
        Clear
      </button>
    </div>
  );
};

export default FormattingToolbar;