import { useState } from 'react';

interface ExcelToolbarProps {
  onToolAction: (action: string, params?: any) => void;
}

export default function ExcelToolbar({ onToolAction }: ExcelToolbarProps) {
  const [activeTab, setActiveTab] = useState('AWS');

  const toolbarTabs = {
    AWS: [
      { name: 'Save to S3', icon: '☁️', action: 'aws-save-s3' },
      { name: 'Share Link', icon: '🔗', action: 'aws-share-link' },
      { name: 'Export', icon: '📤', action: 'aws-export' },
      { name: 'Import', icon: '📥', action: 'aws-import' },
      { name: 'Sync', icon: '🔄', action: 'aws-sync' },
      { name: 'Settings', icon: '⚙️', action: 'aws-settings' }
    ],
    Insert: [
      { name: 'Table', icon: '📊', action: 'insert-table' },
      { name: 'Chart', icon: '📈', action: 'insert-chart' },
      { name: 'Pivot Table', icon: '🔄', action: 'insert-pivot' },
      { name: 'Image', icon: '🖼️', action: 'insert-image' },
      { name: 'Shape', icon: '🔷', action: 'insert-shape' },
      { name: 'Text Box', icon: '📝', action: 'insert-textbox' }
    ],
    'Page Layout': [
      { name: 'Margins', icon: '📏', action: 'page-margins' },
      { name: 'Orientation', icon: '🔄', action: 'page-orientation' },
      { name: 'Size', icon: '📄', action: 'page-size' },
      { name: 'Print Area', icon: '🖨️', action: 'print-area' },
      { name: 'Background', icon: '🎨', action: 'page-background' },
      { name: 'Themes', icon: '🎭', action: 'page-themes' }
    ],
    Formulas: [
      { name: 'Insert Function', icon: 'ƒx', action: 'insert-function' },
      { name: 'AutoSum', icon: '∑', action: 'autosum' },
      { name: 'Recently Used', icon: '🕐', action: 'recent-functions' },
      { name: 'Financial', icon: '💰', action: 'financial-functions' },
      { name: 'Logical', icon: '🔗', action: 'logical-functions' },
      { name: 'Text', icon: '📝', action: 'text-functions' }
    ],
    Data: [
      { name: 'Sort A-Z', icon: '🔤', action: 'sort-asc' },
      { name: 'Sort Z-A', icon: '🔤', action: 'sort-desc' },
      { name: 'Filter', icon: '🔽', action: 'filter' },
      { name: 'Remove Duplicates', icon: '🗑️', action: 'remove-duplicates' },
      { name: 'Text to Columns', icon: '📊', action: 'text-to-columns' },
      { name: 'Data Validation', icon: '✅', action: 'data-validation' }
    ],
    Developer: [
      { name: 'Visual Basic', icon: '💻', action: 'visual-basic' },
      { name: 'Macros', icon: '⚡', action: 'macros' },
      { name: 'Add-ins', icon: '🔌', action: 'add-ins' },
      { name: 'Controls', icon: '🎛️', action: 'controls' },
      { name: 'XML', icon: '📋', action: 'xml' },
      { name: 'Properties', icon: '⚙️', action: 'properties' }
    ],
    Help: [
      { name: 'Help', icon: '❓', action: 'help' },
      { name: 'What\'s New', icon: '✨', action: 'whats-new' },
      { name: 'Contact Support', icon: '📞', action: 'contact-support' },
      { name: 'Feedback', icon: '💬', action: 'feedback' },
      { name: 'About', icon: 'ℹ️', action: 'about' },
      { name: 'Updates', icon: '🔄', action: 'updates' }
    ]
  };

  return (
    <div style={{
      background: '#f8f9fa',
      borderBottom: '1px solid #e9ecef',
      padding: '0'
    }}>
      {/* Tab Headers */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid #e9ecef',
        background: '#ffffff'
      }}>
        {Object.keys(toolbarTabs).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '8px 16px',
              border: 'none',
              background: activeTab === tab ? '#e3f2fd' : 'transparent',
              color: activeTab === tab ? '#1976d2' : '#666',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: activeTab === tab ? '600' : '400',
              borderBottom: activeTab === tab ? '2px solid #1976d2' : '2px solid transparent',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              if (activeTab !== tab) {
                e.currentTarget.style.background = '#f5f5f5';
              }
            }}
            onMouseOut={(e) => {
              if (activeTab !== tab) {
                e.currentTarget.style.background = 'transparent';
              }
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tool Buttons */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '4px',
        padding: '8px 12px',
        background: '#ffffff'
      }}>
        {toolbarTabs[activeTab as keyof typeof toolbarTabs].map((tool) => (
          <button
            key={tool.action}
            onClick={() => onToolAction(tool.action)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '8px 12px',
              border: '1px solid #e9ecef',
              borderRadius: '4px',
              background: '#ffffff',
              cursor: 'pointer',
              minWidth: '70px',
              fontSize: '0.75rem',
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
            <span style={{ fontSize: '1.2rem', marginBottom: '2px' }}>
              {tool.icon}
            </span>
            <span style={{ textAlign: 'center', lineHeight: '1.2' }}>
              {tool.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}