import React, { useState, useRef, useEffect, MouseEvent } from 'react';

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
  const [resizeIndex, setResizeIndex] = useState<number>(-1);
  const [startPos, setStartPos] = useState<number>(0);
  const [startSize, setStartSize] = useState<number>(0);
  
  const tableRef = useRef<HTMLTableElement>(null);

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
    setIsResizing(true);
    setResizeType(type);
    setResizeIndex(index);
    setStartPos(type === 'column' ? e.clientX : e.clientY);
    setStartSize(type === 'column' ? columnWidths[index] || 150 : rowHeights[index] || 40);
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: globalThis.MouseEvent) => {
    if (!isResizing || resizeType === null || resizeIndex === -1) return;

    const currentPos = resizeType === 'column' ? e.clientX : e.clientY;
    const delta = currentPos - startPos;
    const newSize = Math.max(50, startSize + delta); // Minimum size of 50px

    if (resizeType === 'column') {
      setColumnWidths(prev => ({
        ...prev,
        [resizeIndex]: newSize
      }));
    } else {
      setRowHeights(prev => ({
        ...prev,
        [resizeIndex]: newSize
      }));
    }
  };

  const handleMouseUp = () => {
    setIsResizing(false);
    setResizeType(null);
    setResizeIndex(-1);
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
                     style={{
                       position: 'absolute',
                       right: 0,
                       top: 0,
                       bottom: 0,
                       width: '6px',
                       background: 'rgba(255, 255, 255, 0.3)',
                       cursor: 'col-resize',
                       zIndex: 10,
                       transition: 'background-color 0.2s ease'
                     }}
                     onMouseDown={(e) => handleMouseDown(e, 'column', index)}
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
                   style={{
                     position: 'absolute',
                     bottom: 0,
                     left: 0,
                     right: 0,
                     height: '6px',
                     background: 'rgba(255, 255, 255, 0.3)',
                     cursor: 'row-resize',
                     zIndex: 10,
                     transition: 'background-color 0.2s ease'
                   }}
                   onMouseDown={(e) => handleMouseDown(e, 'row', rowIndex)}
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