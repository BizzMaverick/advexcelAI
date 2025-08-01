import { useState } from 'react';
import logo from '../assets/logo.png';

interface ExcelToolbarProps {
  onToolAction: (action: string, params?: any) => void;
}

export default function ExcelToolbar({ onToolAction }: ExcelToolbarProps) {
  const [activeTab, setActiveTab] = useState('AWS');
  
  // Professional color palette
  const colors = {
    primary: '#0078d4',
    primaryLight: '#e6f2fa',
    primaryDark: '#005a9e',
    border: '#e0e0e0',
    background: '#ffffff',
    text: '#252525',
    textSecondary: '#505050',
    hover: '#f5f5f5',
  };

  // Toolbar tabs with icons
  const toolbarTabs = {
    AWS: [
      { name: 'Save to S3', icon: '☁️', action: 'aws-save-s3' },
      { name: 'Share', icon: '🔗', action: 'aws-share-link' },
      { name: 'Export', icon: '📤', action: 'aws-export' },
      { name: 'Import', icon: '📥', action: 'aws-import' }
    ],
    Home: [
      { name: 'Table', icon: '📊', action: 'insert-table' },
      { name: 'Chart', icon: '📈', action: 'insert-chart' },
      { name: 'Sort', icon: '🔤', action: 'sort-asc' },
      { name: 'Filter', icon: '🔍', action: 'filter' }
    ],
    Data: [
      { name: 'Analysis', icon: '📊', action: 'data-analysis' },
      { name: 'Pivot', icon: '🔄', action: 'insert-pivot' },
      { name: 'Clean', icon: '🧹', action: 'clean-data' },
      { name: 'Validate', icon: '✓', action: 'data-validation' }
    ]
  };

  return (
    <div style={{
      background: colors.background,
      borderBottom: `1px solid ${colors.border}`,
      padding: '0',
      fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif',
    }}>
      {/* Logo and Tab Headers */}
      <div style={{
        display: 'flex',
        borderBottom: `1px solid ${colors.border}`,
        background: colors.background,
        alignItems: 'center'
      }}>
        {/* Logo */}
        <div style={{ 
          padding: '8px 16px', 
          display: 'flex', 
          alignItems: 'center',
          borderRight: `1px solid ${colors.border}`
        }}>
          <img 
            src={logo} 
            alt="Excel AI Assistant" 
            style={{ height: '28px' }}
          />
        </div>
        
        {/* Tabs */}
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
                e.currentTarget.style.background = colors.hover;
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
        padding: '12px 16px',
        gap: '8px',
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
              padding: '10px',
              border: `1px solid ${colors.border}`,
              borderRadius: '4px',
              background: colors.background,
              cursor: 'pointer',
              minWidth: '70px',
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
            <span style={{ fontSize: '1.2rem', marginBottom: '4px' }}>
              {tool.icon}
            </span>
            <span style={{ fontSize: '12px', textAlign: 'center' }}>
              {tool.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}