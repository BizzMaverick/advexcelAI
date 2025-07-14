import React from 'react';

interface HelpPanelProps {
  isVisible: boolean;
  onClose: () => void;
}

const HelpPanel: React.FC<HelpPanelProps> = ({ isVisible, onClose }) => {
  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      width: '400px',
      height: '100vh',
      background: 'white',
      boxShadow: '-4px 0 12px rgba(0,0,0,0.1)',
      zIndex: 1000,
      overflow: 'auto',
      padding: '20px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, color: '#1f2937' }}>💡 How to Use</h2>
        <button onClick={onClose} style={{
          background: 'none',
          border: 'none',
          fontSize: '24px',
          cursor: 'pointer',
          color: '#6b7280'
        }}>×</button>
      </div>

      <div style={{ lineHeight: '1.6', color: '#374151' }}>
        <h3 style={{ color: '#1f2937', marginTop: '0' }}>🚀 Quick Start</h3>
        <ol style={{ paddingLeft: '20px' }}>
          <li><strong>Upload</strong> your Excel/CSV file</li>
          <li><strong>Type</strong> what you want to do in plain English</li>
          <li><strong>Press Enter</strong> or click "Go"</li>
          <li><strong>Download</strong> your results</li>
        </ol>

        <h3 style={{ color: '#1f2937' }}>💬 Example Commands</h3>
        
        <h4 style={{ color: '#3b82f6', marginBottom: '8px' }}>📊 Data Analysis</h4>
        <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
          <li>"sum the salary column"</li>
          <li>"calculate average age"</li>
          <li>"count how many engineers"</li>
        </ul>

        <h4 style={{ color: '#10b981', marginBottom: '8px' }}>🎨 Formatting</h4>
        <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
          <li>"highlight row 1 in red"</li>
          <li>"make all managers bold"</li>
          <li>"color engineering department blue"</li>
        </ul>

        <h4 style={{ color: '#f59e0b', marginBottom: '8px' }}>🔍 Filtering & Sorting</h4>
        <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
          <li>"show only employees under 30"</li>
          <li>"filter salary greater than 70000"</li>
          <li>"sort by age ascending"</li>
        </ul>

        <h4 style={{ color: '#8b5cf6', marginBottom: '8px' }}>📈 Advanced</h4>
        <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
          <li>"create pivot table by department"</li>
          <li>"add VLOOKUP formula"</li>
          <li>"generate sales report"</li>
        </ul>

        <h3 style={{ color: '#1f2937' }}>⚡ Tips</h3>
        <ul style={{ paddingLeft: '20px' }}>
          <li><strong>Be specific:</strong> "highlight excellent performers" vs "highlight column 1"</li>
          <li><strong>Use numbers:</strong> "salary > 50000" vs "high salary"</li>
          <li><strong>Wait between requests:</strong> Free AI has 15 requests/minute limit</li>
          <li><strong>Keep files under 5MB</strong> for best performance</li>
        </ul>

        <div style={{
          background: '#fef3c7',
          border: '1px solid #f59e0b',
          borderRadius: '8px',
          padding: '12px',
          marginTop: '20px'
        }}>
          <strong>💡 Pro Tip:</strong> Start with simple commands like "sum column B" to test, then try more complex operations!
        </div>
      </div>
    </div>
  );
};

export default HelpPanel;