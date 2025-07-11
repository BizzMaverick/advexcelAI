import { useState, useRef, useEffect, MouseEvent } from 'react';

interface ResizableTableProps {
  data: (string | number | boolean | null | undefined)[][];
  headers: string[];
  formatting?: ({ color?: string; background?: string; bold?: boolean; italic?: boolean } | undefined)[][];
  title?: string;
  subtitle?: string;
}

interface ColumnWidths {
  [key: number]: number;
}

interface RowHeights {
  [key: number]: number;
}

const ResizableTable: React.FC<ResizableTableProps> = ({ 
  data, 
  headers, 
  formatting, 
  title = "Spreadsheet Data",
  subtitle 
}) => {
  const [columnWidths, setColumnWidths] = useState<ColumnWidths>({});
  const [rowHeights, setRowHeights] = useState<RowHeights>({});
  const [isResizing, setIsResizing] = useState(false);
  const [resizeType, setResizeType] = useState<'column' | 'row' | null>(null);
  
  const tableRef = useRef<HTMLTableElement>(null);
  const isResizingRef = useRef(false);
  const startPosRef = useRef(0);
  const startSizeRef = useRef(0);
  const resizeTypeRef = useRef<'column' | 'row' | null>(null);
  const resizeIndexRef = useRef(-1);

  // Initialize default column widths
  useEffect(() => {
    const defaultWidths: ColumnWidths = {};
    headers.forEach((_, index) => {
      defaultWidths[index] = 150; // Default column width
    });
    setColumnWidths(defaultWidths);
  }, [headers]);

  // Initialize default row heights
  useEffect(() => {
    const defaultHeights: RowHeights = {};
    data.forEach((_, index) => {
      defaultHeights[index] = 40; // Default row height
    });
    setRowHeights(defaultHeights);
  }, [data]);

  const handleMouseDown = (e: MouseEvent, type: 'column' | 'row', index: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Mouse down:', type, index);
    
    isResizingRef.current = true;
    resizeTypeRef.current = type;
    resizeIndexRef.current = index;
    startPosRef.current = type === 'column' ? e.clientX : e.clientY;
    startSizeRef.current = type === 'column' ? columnWidths[index] || 150 : rowHeights[index] || 40;
    
    setIsResizing(true);
    setResizeType(type);
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: globalThis.MouseEvent) => {
    if (!isResizingRef.current || !resizeTypeRef.current || resizeIndexRef.current === -1) return;

    e.preventDefault();
    
    const currentPos = resizeTypeRef.current === 'column' ? e.clientX : e.clientY;
    const delta = currentPos - startPosRef.current;
    const newSize = Math.max(50, startSizeRef.current + delta);

    console.log('Mouse move:', currentPos, delta, newSize);

    if (resizeTypeRef.current === 'column') {
      setColumnWidths(prev => ({
        ...prev,
        [resizeIndexRef.current]: newSize
      }));
    } else {
      setRowHeights(prev => ({
        ...prev,
        [resizeIndexRef.current]: newSize
      }));
    }
  };

  const handleMouseUp = () => {
    console.log('Mouse up');
    isResizingRef.current = false;
    resizeTypeRef.current = null;
    resizeIndexRef.current = -1;
    
    setIsResizing(false);
    setResizeType(null);
    
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  const getColumnWidth = (index: number) => {
    return columnWidths[index] || 150;
  };

  const getRowHeight = (index: number) => {
    return rowHeights[index] || 40;
  };

  const getCellStyle = (rowIndex: number, cellIndex: number) => {
    const fmt = formatting && formatting[rowIndex] && formatting[rowIndex][cellIndex] ? formatting[rowIndex][cellIndex] : {};
    return {
      padding: '8px',
      color: fmt.color || '#e0f2fe',
      background: fmt.background || 'transparent',
      fontWeight: fmt.bold ? 'bold' : 'normal',
      fontStyle: fmt.italic ? 'italic' : 'normal',
      borderRight: '1px solid rgba(255, 255, 255, 0.05)',
      fontSize: '0.8rem',
      height: `${getRowHeight(rowIndex)}px`,
      width: `${getColumnWidth(cellIndex)}px`,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    } as React.CSSProperties;
  };

  const getHeaderStyle = (index: number) => {
    return {
      padding: '12px 8px',
      textAlign: 'left' as const,
      color: '#ffffff',
      fontWeight: 600,
      borderRight: '1px solid rgba(255, 255, 255, 0.1)',
      fontSize: '0.85rem',
      width: `${getColumnWidth(index)}px`,
      position: 'relative' as const
    } as React.CSSProperties;
  };

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '12px',
      padding: '20px',
      margin: '20px 0',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        paddingBottom: '15px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div>
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: 600,
            color: '#ffffff',
            margin: 0,
            textShadow: '0 2px 8px rgba(30, 58, 138, 0.5)'
          }}>{title}</h3>
          <div style={{
            fontSize: '0.8rem',
            color: '#bfdbfe',
            marginTop: '4px',
            opacity: 0.8
          }}>
            💡 Drag column edges to resize width • Drag row edges to resize height
          </div>
        </div>
        <span style={{
          color: '#bfdbfe',
          fontSize: '0.9rem',
          fontWeight: 400
        }}>{subtitle || `Rows: ${data.length} | Columns: ${headers.length}`}</span>
      </div>
      
      <div style={{
        overflow: 'auto',
        maxHeight: '500px',
        borderRadius: '8px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        position: 'relative'
      }}>
        <table 
          ref={tableRef}
          className={`resizable-table ${isResizing ? (resizeType === 'column' ? 'resizing' : 'resizing-row') : ''}`}
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontFamily: 'Hammersmith One, "Segoe UI", "Roboto", "Helvetica Neue", "Arial", sans-serif',
            fontSize: '0.9rem',
            tableLayout: 'fixed'
          }}
        >
          <thead>
            <tr style={{
              background: 'rgba(59, 130, 246, 0.2)',
              borderBottom: '2px solid rgba(59, 130, 246, 0.3)'
            }}>
              {headers.map((header, index) => (
                <th key={index} style={getHeaderStyle(index)}>
                  {header || `Column ${index + 1}`}
                  <div
                    className="resize-handle column"
                    onMouseDown={(e) => handleMouseDown(e, 'column', index)}
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 0,
                      bottom: 0,
                      width: '8px',
                      background: 'rgba(255, 255, 255, 0.3)',
                      cursor: 'col-resize',
                      zIndex: 10,
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.6)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                    }}
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} style={{
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                background: rowIndex % 2 === 0 ? 'rgba(255, 255, 255, 0.02)' : 'transparent',
                height: `${getRowHeight(rowIndex)}px`,
                position: 'relative'
              }}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} style={getCellStyle(rowIndex, cellIndex)}>
                    {cell === null || cell === undefined ? '' : String(cell)}
                  </td>
                ))}
                {/* Row resize handle */}
                <div
                  className="resize-handle row"
                  onMouseDown={(e) => handleMouseDown(e, 'row', rowIndex)}
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '8px',
                    background: 'rgba(255, 255, 255, 0.3)',
                    cursor: 'row-resize',
                    zIndex: 10,
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.6)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                  }}
                />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResizableTable; 