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
      padding: '8px 12px',
      color: fmt.color || '#1f2937',
      background: fmt.background || '#ffffff',
      fontWeight: fmt.bold ? 'bold' : 'normal',
      fontStyle: fmt.italic ? 'italic' : 'normal',
      borderRight: '1px solid #e5e7eb',
      borderBottom: '1px solid #e5e7eb',
      fontSize: '13px',
      height: `${getRowHeight(rowIndex)}px`,
      width: `${getColumnWidth(cellIndex)}px`,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      fontFamily: 'Calibri, "Segoe UI", Arial, sans-serif',
      lineHeight: '1.4'
    } as React.CSSProperties;
  };

  const getHeaderStyle = (index: number) => {
    return {
      padding: '12px 16px',
      textAlign: 'left' as const,
      color: '#1f2937',
      fontWeight: 600,
      borderRight: '1px solid #d1d5db',
      borderBottom: '2px solid #374151',
      fontSize: '13px',
      width: `${getColumnWidth(index)}px`,
      position: 'relative' as const,
      background: '#f8fafc',
      fontFamily: 'Calibri, "Segoe UI", Arial, sans-serif',
      lineHeight: '1.4'
    } as React.CSSProperties;
  };

  return (
    <div style={{
      background: '#ffffff',
      borderRadius: '8px',
      padding: '24px',
      margin: '20px 0',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      border: '1px solid #e5e7eb'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        paddingBottom: '16px',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <div>
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: 600,
            color: '#1f2937',
            margin: 0,
            fontFamily: 'Calibri, "Segoe UI", Arial, sans-serif'
          }}>{title}</h3>
          <div style={{
            fontSize: '0.875rem',
            color: '#6b7280',
            marginTop: '4px',
            fontFamily: 'Calibri, "Segoe UI", Arial, sans-serif'
          }}>
            💡 Drag column edges to resize width • Drag row edges to resize height
          </div>
        </div>
        <span style={{
          color: '#6b7280',
          fontSize: '0.875rem',
          fontWeight: 500,
          fontFamily: 'Calibri, "Segoe UI", Arial, sans-serif'
        }}>{subtitle || `Rows: ${data.length} | Columns: ${headers.length}`}</span>
      </div>
      
      <div style={{
        overflow: 'auto',
        maxHeight: '500px',
        borderRadius: '6px',
        border: '1px solid #d1d5db',
        background: '#ffffff'
      }}>
        <table 
          ref={tableRef}
          className={`resizable-table ${isResizing ? (resizeType === 'column' ? 'resizing' : 'resizing-row') : ''}`}
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontFamily: 'Calibri, "Segoe UI", Arial, sans-serif',
            fontSize: '13px',
            tableLayout: 'fixed',
            background: '#ffffff'
          }}
        >
          <thead>
            <tr style={{
              background: '#f8fafc',
              borderBottom: '2px solid #374151'
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
                      width: '6px',
                      background: 'transparent',
                      cursor: 'col-resize',
                      zIndex: 10,
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#3b82f6';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} style={{
                borderBottom: '1px solid #e5e7eb',
                background: rowIndex % 2 === 0 ? '#ffffff' : '#f9fafb',
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
                    height: '6px',
                    background: 'transparent',
                    cursor: 'row-resize',
                    zIndex: 10,
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#3b82f6';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
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