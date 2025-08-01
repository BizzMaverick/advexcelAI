// No imports needed for this component

interface ShortcutsHelpProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function ShortcutsHelp({ isVisible, onClose }: ShortcutsHelpProps) {
  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '24px',
        maxWidth: '600px',
        maxHeight: '80vh',
        overflow: 'auto',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h2 style={{ margin: 0, color: '#1f2937' }}>⌨️ Keyboard & Mouse Shortcuts</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#6b7280'
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <h3 style={{ color: '#1976d2', marginBottom: '12px' }}>📋 General</h3>
            <div style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
              <div><strong>Ctrl+N</strong> - New Sheet</div>
              <div><strong>Ctrl+S</strong> - Save (Auto-save)</div>
              <div><strong>Ctrl+Z</strong> - Undo</div>
              <div><strong>Ctrl+Y</strong> - Redo</div>
              <div><strong>F1</strong> - Help</div>
              <div><strong>F2</strong> - Edit Mode</div>
            </div>
          </div>

          <div>
            <h3 style={{ color: '#1976d2', marginBottom: '12px' }}>📝 Editing</h3>
            <div style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
              <div><strong>Click</strong> - Select Cell</div>
              <div><strong>Double-click</strong> - Edit Cell</div>
              <div><strong>Enter</strong> - Confirm Edit</div>
              <div><strong>Escape</strong> - Cancel Edit</div>
              <div><strong>Tab</strong> - Next Cell</div>
              <div><strong>Delete</strong> - Clear Cell</div>
            </div>
          </div>

          <div>
            <h3 style={{ color: '#1976d2', marginBottom: '12px' }}>📋 Clipboard</h3>
            <div style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
              <div><strong>Ctrl+C</strong> - Copy</div>
              <div><strong>Ctrl+V</strong> - Paste</div>
              <div><strong>Ctrl+X</strong> - Cut</div>
              <div><strong>Ctrl+A</strong> - Select All</div>
            </div>
          </div>

          <div>
            <h3 style={{ color: '#1976d2', marginBottom: '12px' }}>🔍 Data</h3>
            <div style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
              <div><strong>Ctrl+F</strong> - Add Filters</div>
              <div><strong>Alt+D+S</strong> - Sort Data</div>
              <div><strong>Alt+D+F</strong> - AutoFilter</div>
            </div>
          </div>
        </div>

        <div style={{
          marginTop: '20px',
          padding: '16px',
          background: '#f8f9fa',
          borderRadius: '8px',
          fontSize: '0.85rem',
          color: '#6b7280'
        }}>
          <strong>💡 Pro Tips:</strong>
          <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
            <li>Use Tab to quickly move between cells while editing</li>
            <li>Double-click any cell for instant editing</li>
            <li>Press F1 anytime for help and guidance</li>
            <li>All shortcuts work just like in Microsoft Excel</li>
          </ul>
        </div>
      </div>
    </div>
  );
}