import { useState } from 'react';

interface ExcelToolbarProps {
  onToolAction: (action: string, params?: any) => void;
}

export default function ExcelToolbar({ onToolAction }: ExcelToolbarProps) {
  const [activeTab, setActiveTab] = useState('AWS');
  
  // Professional color palette
  const colors = {
    primary: '#0078d4',       // Microsoft blue
    primaryLight: '#e6f2fa',  // Light blue for hover
    primaryDark: '#005a9e',   // Dark blue for active states
    text: '#252525',          // Dark gray for text
    textSecondary: '#505050', // Secondary text color
    border: '#e0e0e0',        // Light gray for borders
    background: '#ffffff',    // White background
    backgroundAlt: '#f9f9f9', // Alternate background
    success: '#107c10',       // Green for success states
    warning: '#d83b01',       // Orange for warnings
  };

  // Streamlined toolbar tabs with only essential functions
  const toolbarTabs = {
    AWS: [
      { name: 'Save to S3', icon: 'cloud', action: 'aws-save-s3' },
      { name: 'Share', icon: 'share', action: 'aws-share-link' },
      { name: 'Export', icon: 'download', action: 'aws-export' },
      { name: 'Import', icon: 'upload', action: 'aws-import' }
    ],
    Home: [
      { name: 'Table', icon: 'table', action: 'insert-table' },
      { name: 'Chart', icon: 'bar-chart', action: 'insert-chart' },
      { name: 'Sort', icon: 'sort', action: 'sort-asc' },
      { name: 'Filter', icon: 'filter', action: 'filter' }
    ],
    Data: [
      { name: 'Analysis', icon: 'analytics', action: 'data-analysis' },
      { name: 'Pivot', icon: 'pivot-table', action: 'insert-pivot' },
      { name: 'Clean', icon: 'cleanup', action: 'clean-data' },
      { name: 'Validate', icon: 'check-circle', action: 'data-validation' }
    ],
    Format: [
      { name: 'Styles', icon: 'format', action: 'cell-styles' },
      { name: 'Themes', icon: 'palette', action: 'page-themes' },
      { name: 'Conditional', icon: 'rules', action: 'conditional-format' },
      { name: 'Layout', icon: 'layout', action: 'page-layout' }
    ]
  };

  // SVG icons for a more professional look
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'cloud': return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12.5 6.5C12.5 4.01 10.49 2 8 2C5.51 2 3.5 4.01 3.5 6.5C2.12 6.5 1 7.62 1 9C1 10.38 2.12 11.5 3.5 11.5H12.5C13.88 11.5 15 10.38 15 9C15 7.62 13.88 6.5 12.5 6.5Z" fill="currentColor"/>
        </svg>
      );
      case 'share': return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 5.5C13.1046 5.5 14 4.60457 14 3.5C14 2.39543 13.1046 1.5 12 1.5C10.8954 1.5 10 2.39543 10 3.5C10 3.71922 10.0358 3.93037 10.1029 4.12597L6.20577 6.07422C5.82045 5.71892 5.3294 5.5 4.8 5.5C3.80589 5.5 3 6.30589 3 7.3C3 8.29411 3.80589 9.1 4.8 9.1C5.3294 9.1 5.82045 8.88108 6.20577 8.52578L10.1029 10.474C10.0358 10.6696 10 10.8808 10 11.1C10 12.2046 10.8954 13.1 12 13.1C13.1046 13.1 14 12.2046 14 11.1C14 9.99543 13.1046 9.1 12 9.1C11.4706 9.1 10.9796 9.31892 10.5942 9.67422L6.69712 7.72597C6.76418 7.53037 6.8 7.31922 6.8 7.1C6.8 6.88078 6.76418 6.66963 6.69712 6.47403L10.5942 4.52578C10.9796 4.88108 11.4706 5.1 12 5.1V5.5Z" fill="currentColor"/>
        </svg>
      );
      case 'download': return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 10V12.6667C14 13.0203 13.8595 13.3594 13.6095 13.6095C13.3594 13.8595 13.0203 14 12.6667 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M4.66699 6.66699L8.00033 10.0003L11.3337 6.66699" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8 10V2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
      case 'upload': return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 10V12.6667C14 13.0203 13.8595 13.3594 13.6095 13.6095C13.3594 13.8595 13.0203 14 12.6667 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M11.3337 5.33333L8.00033 2L4.66699 5.33333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8 2V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
      case 'table': return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 3C2 2.44772 2.44772 2 3 2H13C13.5523 2 14 2.44772 14 3V13C14 13.5523 13.5523 14 13 14H3C2.44772 14 2 13.5523 2 13V3Z" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M2 6H14" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M6 6V14" stroke="currentColor" strokeWidth="1.5"/>
        </svg>
      );
      case 'bar-chart': return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 13V6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M6 13V3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M10 13V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M14 13V5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      );
      default: return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/>
        </svg>
      );
    }
  };

  return (
    <div style={{
      background: colors.background,
      borderBottom: `1px solid ${colors.border}`,
      padding: '0',
      fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif',
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
              transition: 'all 0.2s',
              position: 'relative',
              top: '1px'
            }}
            onMouseOver={(e) => {
              if (activeTab !== tab) {
                e.currentTarget.style.background = colors.primaryLight;
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
              transition: 'all 0.2s',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = colors.primaryLight;
              e.currentTarget.style.borderColor = colors.primary;
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = colors.background;
              e.currentTarget.style.borderColor = colors.border;
            }}
          >
            <span style={{ color: colors.primary, marginBottom: '8px' }}>
              {getIcon(tool.icon)}
            </span>
            <span style={{ textAlign: 'center', lineHeight: '1.2', fontWeight: '500' }}>
              {tool.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}   {getIcon(tool.icon)}
            </span>
            <span style={{ textAlign: 'center', lineHeight: '1.2', fontWeight: '500' }}>
              {tool.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}