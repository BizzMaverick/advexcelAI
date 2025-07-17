import { useState } from 'react';

interface ExcelToolbarProps {
  onToolAction: (action: string, params?: any) => void;
}

export default function ExcelToolbar({ onToolAction }: ExcelToolbarProps) {
  const [activeTab, setActiveTab] = useState('AWS');
  
  // Professional color palette
  const colors = {
    primary: '#0078d4',
    primaryLight: '#e6f2fa',
    text: '#252525',
    textSecondary: '#505050',
    border: '#e0e0e0',
    background: '#ffffff',
    backgroundAlt: '#f9f9f9',
  };

  // Simplified toolbar tabs
  const toolbarTabs = {
    AWS: [
      { name: 'Save to S3', action: 'aws-save-s3' },
      { name: 'Share', action: 'aws-share-link' },
      { name: 'Export', action: 'aws-export' },
      { name: 'Import', action: 'aws-import' }
    ],
    Home: [
      { name: 'Table', action: 'insert-table' },
      { name: 'Chart', action: 'insert-chart' },
      { name: 'Sort', action: 'sort-asc' },
      { name: 'Filter', action: 'filter' }
    ],
    Data: [
      { name: 'Analysis', action: 'data-analysis' },
      { name: 'Pivot', action: 'insert-pivot' },
      { name: 'Clean', action: 'clean-data' },
      { name: 'Validate', action: 'data-validation' }
    ]
  };

  return (
    <div style={{
      background: colors.background,
      borderBottom: `1px solid ${colors.border}`,
      padding: '0',
      fontFamily: '"Segoe UI", sans-serif',
    }}>
      {/* Tab Headers */}
      <div style={{
        display: 'flex',
        borderBottom: `1px solid ${colors.border}`,
        background: colors.background,
        padding: '0 16px'
      }}>
        {Object.keys(toolbarTabs).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '12px 20px',
              border: 'none',
              background: 'transparent',
              color: activeTab === tab ? colors.primary : colors.textSecondary,
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: activeTab === tab ? '600' : '400',
              borderBottom: activeTab === tab ? `2px solid ${colors.primary}` : '2px solid transparent',
              transition: 'all 0.2s'
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
        gap: '8px',
        padding: '16px',
        background: colors.background
      }}>
        {toolbarTabs[activeTab as keyof typeof toolbarTabs].map((tool) => (
          <button
            key={tool.action}
            onClick={() => onToolAction(tool.action)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '12px',
              border: `1px solid ${colors.border}`,
              borderRadius: '6px',
              background: colors.background,
              cursor: 'pointer',
              minWidth: '84px',
              fontSize: '12px',
              color: colors.text,
              transition: 'all 0.2s'
            }}
          >
            {tool.name}
          </button>
        ))}
      </div>
    </div>
  );
}