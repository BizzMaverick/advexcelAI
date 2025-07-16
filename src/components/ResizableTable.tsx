import { useState, useEffect, useImperativeHandle, forwardRef } from 'react';

interface ResizableTableProps {
  data: (string | number | boolean | null | undefined)[][];
  headers: string[];
  formatting?: ({ color?: string; background?: string; bold?: boolean; italic?: boolean } | undefined)[][];
  title?: string;
  subtitle?: string;
  onCellEdit?: (row: number, col: number, value: string) => void;
  onCellFormat?: (row: number, col: number, fmt: any) => void;
}

interface ColumnWidths {
  [key: number]: number;
}



function evaluateFormula(formula: string): number | string {
  try {
    let expr = formula.slice(1).trim();
    if (/^(SUM|AVERAGE|MIN|MAX)\(/i.test(expr)) {
      return '#CALC';
    }
    return Function('return ' + expr.replace(/[A-Z]+\d+/gi, '0'))();
  } catch {
    return '#ERR';
  }
}

const ResizableTable = forwardRef<any, ResizableTableProps>(({
  data,
  headers,
  formatting,
  title = "Spreadsheet Data",
  subtitle,
  onCellEdit
}, ref) => {
  const [columnWidths, setColumnWidths] = useState<ColumnWidths>({});
  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null);
  const [editValue, setEditValue] = useState<string>('');


  useImperativeHandle(ref, () => ({
    setColumnWidth: (col: number, width: number) => {
      setColumnWidths(prev => ({ ...prev, [col]: width }));
    },
    setAllColumnsWidth: (width: number) => {
      const newWidths: ColumnWidths = {};
      headers.forEach((_, i) => { newWidths[i] = width; });
      setColumnWidths(newWidths);
    },
    setRowHeight: () => {},
    setAllRowsHeight: () => {},
    freezeFirstRow: () => {},
    hideColumn: () => {},
    showColumn: () => {},
    showGridlines: () => {},
    hideGridlines: () => {},
  }));

  useEffect(() => {
    const defaultWidths: ColumnWidths = {};
    headers.forEach((_, index) => {
      defaultWidths[index] = 150;
    });
    setColumnWidths(defaultWidths);
  }, [headers]);

  const getColumnWidth = (index: number) => columnWidths[index] || 150;

  const getCellStyle = (rowIndex: number, cellIndex: number) => {
    const fmt = formatting?.[rowIndex]?.[cellIndex] || {};
    
    // Debug: Log formatting to see what we're getting
    if (rowIndex === 0 && cellIndex === 0 && formatting) {
      console.log('Formatting received:', formatting);
    }
    
    return {
      padding: '8px 12px',
      color: fmt.color || '#1f2937',
      background: fmt.background || '#ffffff',
      fontWeight: fmt.bold ? 'bold' : 'normal',
      fontStyle: fmt.italic ? 'italic' : 'normal',
      border: '1px solid #e5e7eb',
      fontSize: '13px',
      width: `${getColumnWidth(cellIndex)}px`,
      minWidth: `${getColumnWidth(cellIndex)}px`,
      maxWidth: `${getColumnWidth(cellIndex)}px`,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      fontFamily: 'Calibri, "Segoe UI", Arial, sans-serif',
    } as React.CSSProperties;
  };

  return (
    <div style={{
      background: '#ffffff',
      borderRadius: '8px',
      padding: '24px',
      margin: '20px 0',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
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
        <h3 style={{
          fontSize: '1.5rem',
          fontWeight: 600,
          color: '#1f2937',
          margin: 0,
          fontFamily: 'Calibri, "Segoe UI", Arial, sans-serif'
        }}>{title}</h3>
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
        maxWidth: '100%',
        border: '1px solid #d1d5db',
        borderRadius: '6px'
      }}>
        <table style={{
          minWidth: '100%',
          borderCollapse: 'collapse',
          fontFamily: 'Calibri, "Segoe UI", Arial, sans-serif',
          fontSize: '13px'
        }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              {headers.map((header, index) => (
                <th key={index} style={{
                  padding: '12px 16px',
                  textAlign: 'left' as const,
                  color: '#1f2937',
                  fontWeight: 600,
                  border: '1px solid #d1d5db',
                  fontSize: '13px',
                  width: `${getColumnWidth(index)}px`,
                  minWidth: `${getColumnWidth(index)}px`,
                  maxWidth: `${getColumnWidth(index)}px`,
                  position: 'relative' as const,
                  background: '#f8fafc'
                }}>
                  {header}
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 0,
                      width: 8,
                      height: '100%',
                      cursor: 'col-resize',
                      zIndex: 2
                    }}
                    onMouseDown={e => {
                      e.preventDefault();
                      const startX = e.clientX;
                      const startWidth = getColumnWidth(index);
                      function onMouseMove(ev: globalThis.MouseEvent) {
                        const delta = ev.clientX - startX;
                        setColumnWidths(prev => ({ ...prev, [index]: Math.max(50, startWidth + delta) }));
                      }
                      function onMouseUp() {
                        document.removeEventListener('mousemove', onMouseMove);
                        document.removeEventListener('mouseup', onMouseUp);
                      }
                      document.addEventListener('mousemove', onMouseMove);
                      document.addEventListener('mouseup', onMouseUp);
                    }}
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.slice(0, 100).map((row, rowIndex) => (
              <tr key={rowIndex} style={{
                background: rowIndex % 2 === 0 ? '#ffffff' : '#f9fafb'
              }}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} style={getCellStyle(rowIndex, cellIndex)}>
                    {editingCell && editingCell.row === rowIndex && editingCell.col === cellIndex ? (
                      <input
                        value={editValue}
                        autoFocus
                        onChange={e => setEditValue(e.target.value)}
                        onBlur={() => {
                          if (onCellEdit) {
                            onCellEdit(rowIndex, cellIndex, editValue);
                          }
                          setEditingCell(null);
                        }}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            if (onCellEdit) {
                              onCellEdit(rowIndex, cellIndex, editValue);
                            }
                            setEditingCell(null);
                          } else if (e.key === 'Escape') {
                            setEditingCell(null);
                          }
                        }}
                        style={{ 
                          width: '100%', 
                          border: '2px solid #007bff', 
                          outline: 'none',
                          padding: '4px',
                          borderRadius: '2px'
                        }}
                      />
                    ) : (
                      <div
                        onClick={() => {
                          if (onCellEdit) {
                            setEditingCell({ row: rowIndex, col: cellIndex });
                            setEditValue(String(cell ?? ''));
                          }
                        }}
                        style={{ 
                          cursor: onCellEdit ? 'text' : 'default', 
                          display: 'block',
                          minHeight: '20px',
                          padding: '2px'
                        }}
                      >
                        {typeof cell === 'string' && cell.startsWith('=')
                          ? evaluateFormula(cell)
                          : (cell || '')}
                      </div>
                    )}
                  </td>
                ))}
              </tr>
            ))}
            {data.length > 100 && (
              <tr>
                <td colSpan={headers.length} style={{
                  padding: '16px',
                  textAlign: 'center',
                  color: '#6b7280',
                  fontStyle: 'italic',
                  background: '#f9fafb'
                }}>
                  Showing first 100 rows of {data.length} total rows. Large files are limited for performance.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
});

export default ResizableTable;