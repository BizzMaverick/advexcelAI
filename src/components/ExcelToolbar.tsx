import React, { useState } from 'react';
import logo from '../assets/logo.png';

interface ExcelToolbarProps {
  onToolAction: (action: string, params?: any) => void;
}

export default function ExcelToolbar({ onToolAction }: ExcelToolbarProps) {
  const [activeTab, setActiveTab] = useState('AWS');
  
  // Simple color palette
  const colors = {
    primary: '#0078d4',
    border: '#e0e0e0',
    background: '#ffffff',
    text: '#252525',
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
      padding: '0'
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
          padding: '5px 16px', 
          display: 'flex', 
          alignItems: 'center',
          borderRight: `1px solid ${colors.border}`
        }}>
          <img 
            src={logo} 
            alt="Excel AI Assistant" 
            style={{ height: '24px' }}
          />
        </div>
        
        {/* Tabs */}
        {Object.keys(toolbarTabs).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px 16px',
              border: 'none',
              background: 'transparent',
              color: activeTab === tab ? colors.primary : colors.text,
              cursor: 'pointer',
              fontWeight: activeTab === tab ? 'bold' : 'normal',
              borderBottom: activeTab === tab ? `2px solid ${colors.primary}` : 'none'
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
        padding: '10px',
        gap: '5px'
      }}>
        {toolbarTabs[activeTab as keyof typeof toolbarTabs].map((tool) => (
          <button
            key={tool.action}
            onClick={() => onToolAction(tool.action)}
            style={{
              padding: '8px 12px',
              border: `1px solid ${colors.border}`,
              borderRadius: '4px',
              background: colors.background,
              cursor: 'pointer'
            }}
          >
            {tool.name}
          </button>
        ))}
      </div>
    </div>
  );
}