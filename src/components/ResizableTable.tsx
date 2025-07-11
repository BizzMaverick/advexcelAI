import { useState, useRef, useEffect, MouseEvent, KeyboardEvent, useImperativeHandle, forwardRef } from 'react';
import { FixedSizeList as List } from 'react-window';
import { ListChildComponentProps } from 'react-window';

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

interface RowHeights {
  [key: number]: number;
}

// Add formula evaluation utilities at the top of the file
function cellRefToIndexes(ref: string): [number, number] | null {
  const match = ref.match(/^([A-Z]+)(\d+)$/i);
  if (!match) return null;
  const col = match[1].toUpperCase().split('').reduce((acc, char) => acc * 26 + (char.charCodeAt(0) - 64), 0) - 1;
  const row = parseInt(match[2], 10) - 1;
  return [row, col];
}

function getCellValue(data: any[][], ref: string): number {
  const idx = cellRefToIndexes(ref);
  if (!idx) return NaN;
  const [row, col] = idx;
  const val = data[row]?.[col];
  if (typeof val === 'number') return val;
  if (typeof val === 'string' && val.trim() !== '' && !isNaN(Number(val))) return Number(val);
  return NaN;
}

function evaluateFormula(formula: string, data: any[][]): number | string {
  try {
    // Remove '='
    let expr = formula.slice(1).trim();
    // SUM, AVERAGE, MIN, MAX
    if (/^(SUM|AVERAGE|MIN|MAX)\(/i.test(expr)) {
      const fn = expr.match(/^(SUM|AVERAGE|MIN|MAX)/i)?.[0].toUpperCase();
      const range = expr.match(/\(([^)]+)\)/)?.[1];
      if (range) {
        const [start, end] = range.split(':');
        const startIdx = cellRefToIndexes(start.trim());
        const endIdx = cellRefToIndexes(end.trim());
        if (startIdx && endIdx) {
          const values: number[] = [];
          for (let r = startIdx[0]; r <= endIdx[0]; r++) {
            for (let c = startIdx[1]; c <= endIdx[1]; c++) {
              const v = data[r]?.[c];
              if (typeof v === 'number') values.push(v);
              else if (typeof v === 'string' && v.trim() !== '' && !isNaN(Number(v))) values.push(Number(v));
            }
          }
          if (fn === 'SUM') return values.reduce((a, b) => a + b, 0);
          if (fn === 'AVERAGE') return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
          if (fn === 'MIN') return values.length ? Math.min(...values) : 0;
          if (fn === 'MAX') return values.length ? Math.max(...values) : 0;
        }
      }
    }
    // Simple math with cell refs (e.g., =A1+B2)
    expr = expr.replace(/([A-Z]+\d+)/gi, (ref) => {
      const v = getCellValue(data, ref);
      return isNaN(v) ? '0' : String(v);
    });
    // eslint-disable-next-line no-eval
    return Function('return ' + expr)();
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
  onCellEdit,
  onCellFormat
}, ref) => {
  const [columnWidths, setColumnWidths] = useState<ColumnWidths>({});
  const [rowHeights, setRowHeights] = useState<RowHeights>({});
  const [isResizing, setIsResizing] = useState(false);
  const [resizeType, setResizeType] = useState<'column' | 'row' | null>(null);
  const [showDimensionInput, setShowDimensionInput] = useState(false);
  const [dimensionInput, setDimensionInput] = useState('');
  const [activeDimension, setActiveDimension] = useState<{ type: 'column' | 'row', index: number } | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hiddenColumns, setHiddenColumns] = useState<Set<number>>(new Set());
  const [showGrid, setShowGrid] = useState(true);
  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  // Add state for selectedCell
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  // Add state for sorting and filtering
  const [sortConfig, setSortConfig] = useState<{ col: number; direction: 'asc' | 'desc' } | null>(null);
  const [filters, setFilters] = useState<{ [col: number]: string }>({});

  const tableRef = useRef<HTMLTableElement>(null);
  const isResizingRef = useRef(false);
  const startPosRef = useRef(0);
  const startSizeRef = useRef(0);
  const resizeTypeRef = useRef<'column' | 'row' | null>(null);
  const resizeIndexRef = useRef(-1);

  // Expose UI control methods to parent via ref
  useImperativeHandle(ref, () => ({
    setColumnWidth: (col: number, width: number) => {
      setColumnWidths(prev => ({ ...prev, [col]: width }));
    },
    setAllColumnsWidth: (width: number) => {
      const newWidths: ColumnWidths = {};
      headers.forEach((_, i) => { newWidths[i] = width; });
      setColumnWidths(newWidths);
    },
    setRowHeight: (row: number, height: number) => {
      setRowHeights(prev => ({ ...prev, [row]: height }));
    },
    setAllRowsHeight: (height: number) => {
      const newHeights: RowHeights = {};
      data.forEach((_, i) => { newHeights[i] = height; });
      setRowHeights(newHeights);
    },
    freezeFirstRow: () => {
      // setFrozenRows(1); // This line was removed as per the edit hint.
    },
    hideColumn: (col: number) => {
      setHiddenColumns(prev => new Set([...prev, col]));
    },
    showColumn: (col: number) => {
      setHiddenColumns(prev => {
        const next = new Set([...prev]);
        next.delete(col);
        return next;
      });
    },
    showGridlines: () => setShowGrid(true),
    hideGridlines: () => setShowGrid(false),
  }));

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
    setShowDimensionInput(true);
    setActiveDimension({ type, index });
    
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

    // Update mouse position for dimension display
    setMousePosition({ x: e.clientX, y: e.clientY });

    if (resizeTypeRef.current === 'column') {
      setColumnWidths(prev => ({
        ...prev,
        [resizeIndexRef.current]: newSize
      }));
      setDimensionInput(newSize.toString());
    } else {
      setRowHeights(prev => ({
        ...prev,
        [resizeIndexRef.current]: newSize
      }));
      setDimensionInput(newSize.toString());
    }
  };

  const handleMouseUp = () => {
    console.log('Mouse up');
    isResizingRef.current = false;
    resizeTypeRef.current = null;
    resizeIndexRef.current = -1;
    
    setIsResizing(false);
    setResizeType(null);
    setShowDimensionInput(false);
    setActiveDimension(null);
    
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  const handleDimensionInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDimensionInput(e.target.value);
  };

  const handleDimensionInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && activeDimension) {
      const newSize = parseInt(dimensionInput);
      if (!isNaN(newSize) && newSize >= 50) {
        if (activeDimension.type === 'column') {
          setColumnWidths(prev => ({
            ...prev,
            [activeDimension.index]: newSize
          }));
        } else {
          setRowHeights(prev => ({
            ...prev,
            [activeDimension.index]: newSize
          }));
        }
        setShowDimensionInput(false);
        setActiveDimension(null);
      }
    } else if (e.key === 'Escape') {
      setShowDimensionInput(false);
      setActiveDimension(null);
    }
  };

  const handleDimensionInputBlur = () => {
    if (activeDimension) {
      const newSize = parseInt(dimensionInput);
      if (!isNaN(newSize) && newSize >= 50) {
        if (activeDimension.type === 'column') {
          setColumnWidths(prev => ({
            ...prev,
            [activeDimension.index]: newSize
          }));
        } else {
          setRowHeights(prev => ({
            ...prev,
            [activeDimension.index]: newSize
          }));
        }
      }
    }
    setShowDimensionInput(false);
    setActiveDimension(null);
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

  // Helper to filter columns
  const visibleHeaders = headers.filter((_, i) => !hiddenColumns.has(i));
  const visibleData = data.map(row => row.filter((_, i) => !hiddenColumns.has(i)));

  // Update visibleData to apply filtering
  let filteredData = visibleData;
  Object.entries(filters).forEach(([col, value]) => {
    if (value) {
      filteredData = filteredData.filter(row => String(row[Number(col)] ?? '').toLowerCase().includes(value.toLowerCase()));
    }
  });
  // Apply sorting
  if (sortConfig) {
    filteredData = [...filteredData].sort((a, b) => {
      const aVal = a[sortConfig.col];
      const bVal = b[sortConfig.col];
      if (aVal === bVal) return 0;
      if (aVal === undefined || aVal === null) return 1;
      if (bVal === undefined || bVal === null) return -1;
      if (sortConfig.direction === 'asc') return String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
      return String(bVal).localeCompare(String(aVal), undefined, { numeric: true });
    });
  }

  // Helper to get visible column index
  const getVisibleColIndex = (visibleIndex: number) => {
    let count = -1;
    for (let i = 0; i < headers.length; ++i) {
      if (!hiddenColumns.has(i)) count++;
      if (count === visibleIndex) return i;
    }
    return -1;
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
            💡 Drag column edges to resize width • Drag row edges to resize height • Double-click to enter exact dimensions
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
        background: '#ffffff',
        position: 'relative'
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
            background: '#ffffff',
            border: showGrid ? '1px solid #e5e7eb' : 'none'
          }}
        >
          <thead>
            <tr style={{
              background: '#f8fafc',
              borderBottom: '2px solid #374151'
            }}>
              {visibleHeaders.map((header, index) => (
                <th key={index} style={getHeaderStyle(getVisibleColIndex(index))}>
                  <span style={{ cursor: 'pointer' }} onClick={() => {
                    setSortConfig(prev => prev && prev.col === getVisibleColIndex(index) ? { col: getVisibleColIndex(index), direction: prev.direction === 'asc' ? 'desc' : 'asc' } : { col: getVisibleColIndex(index), direction: 'asc' });
                  }}>
                    {header}
                    {sortConfig?.col === getVisibleColIndex(index) && (sortConfig.direction === 'asc' ? ' ▲' : ' ▼')}
                  </span>
                  <span style={{ marginLeft: 8 }}>
                    <input
                      type="text"
                      value={filters[getVisibleColIndex(index)] || ''}
                      onChange={e => setFilters(f => ({ ...f, [getVisibleColIndex(index)]: e.target.value }))}
                      placeholder="Filter"
                      style={{ width: 60, fontSize: 12, border: '1px solid #d1d5db', borderRadius: 4, padding: '2px 4px' }}
                    />
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <List
              height={500}
              itemCount={filteredData.length}
              itemSize={40}
              width="100%"
              style={{ overflowX: 'hidden' }}
            >
              {({ index, style }: ListChildComponentProps) => (
                <tr
                  key={index}
                  style={{
                    ...style,
                    display: 'table-row',
                    borderBottom: '1px solid #e5e7eb',
                    background: index % 2 === 0 ? '#ffffff' : '#f9fafb',
                    height: `${getRowHeight(index)}px`,
                    position: 'relative'
                  }}
                >
                  {filteredData[index].map((cell, cellIndex) => (
                    <td key={cellIndex} style={getCellStyle(index, cellIndex)}>
                      {editingCell && editingCell.row === index && editingCell.col === cellIndex ? (
                        <input
                          value={editValue}
                          autoFocus
                          onChange={e => setEditValue(e.target.value)}
                          onBlur={() => {
                            if (onCellEdit) onCellEdit(index, cellIndex, editValue);
                            setEditingCell(null);
                          }}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              if (onCellEdit) onCellEdit(index, cellIndex, editValue);
                              setEditingCell(null);
                            } else if (e.key === 'Escape') {
                              setEditingCell(null);
                            }
                          }}
                          style={{ width: '100%' }}
                        />
                      ) : (
                        <span
                          onClick={() => {
                            setEditingCell({ row: index, col: cellIndex });
                            setEditValue(String(cell ?? ''));
                            setSelectedCell({ row: index, col: cellIndex });
                          }}
                          style={{
                            cursor: 'pointer',
                            display: 'block',
                            minHeight: 24,
                            fontWeight: formatting?.[index]?.[cellIndex]?.bold ? 'bold' : undefined,
                            fontStyle: formatting?.[index]?.[cellIndex]?.italic ? 'italic' : undefined,
                            color: formatting?.[index]?.[cellIndex]?.color,
                            background: formatting?.[index]?.[cellIndex]?.background
                          }}
                        >
                          {typeof cell === 'string' && cell.startsWith('=')
                            ? evaluateFormula(cell, data)
                            : cell}
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              )}
            </List>
          </tbody>
        </table>

        {/* Dimension Display and Input */}
        {showDimensionInput && (
          <div style={{
            position: 'fixed',
            left: mousePosition.x + 10,
            top: mousePosition.y - 30,
            background: '#1f2937',
            color: '#ffffff',
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '12px',
            fontFamily: 'Calibri, "Segoe UI", Arial, sans-serif',
            zIndex: 1000,
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            border: '1px solid #374151'
          }}>
            {activeDimension?.type === 'column' ? (
              <div>
                <div>Column Width: {getColumnWidth(activeDimension.index)}px</div>
                <input
                  type="number"
                  value={dimensionInput}
                  onChange={handleDimensionInputChange}
                  onKeyDown={handleDimensionInputKeyDown}
                  onBlur={handleDimensionInputBlur}
                  style={{
                    width: '60px',
                    padding: '2px 4px',
                    fontSize: '11px',
                    border: '1px solid #6b7280',
                    borderRadius: '2px',
                    background: '#ffffff',
                    color: '#1f2937',
                    marginTop: '4px'
                  }}
                  placeholder="Enter width"
                  min="50"
                />
              </div>
            ) : (
              <div>
                <div>Row Height: {getRowHeight(activeDimension?.index || 0)}px</div>
                <input
                  type="number"
                  value={dimensionInput}
                  onChange={handleDimensionInputChange}
                  onKeyDown={handleDimensionInputKeyDown}
                  onBlur={handleDimensionInputBlur}
                  style={{
                    width: '60px',
                    padding: '2px 4px',
                    fontSize: '11px',
                    border: '1px solid #6b7280',
                    borderRadius: '2px',
                    background: '#ffffff',
                    color: '#1f2937',
                    marginTop: '4px'
                  }}
                  placeholder="Enter height"
                  min="50"
                />
              </div>
            )}
          </div>
        )}

        {/* Floating Formatting Toolbar */}
        {selectedCell && (
          <div
            style={{
              position: 'fixed',
              left: selectedCell.col * (columnWidths[selectedCell.col] || 150) + 10,
              top: selectedCell.row * (rowHeights[selectedCell.row] || 40) + 10,
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '4px',
              padding: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              zIndex: 1000,
              display: 'flex',
              gap: '8px',
              flexDirection: 'column'
            }}
          >
            <button
              onClick={() => onCellFormat?.(selectedCell.row, selectedCell.col, { bold: true })}
              style={{
                padding: '4px 8px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                background: formatting?.[selectedCell.row]?.[selectedCell.col]?.bold ? '#3b82f6' : '#ffffff',
                color: formatting?.[selectedCell.row]?.[selectedCell.col]?.bold ? '#ffffff' : '#1f2937',
                fontWeight: formatting?.[selectedCell.row]?.[selectedCell.col]?.bold ? 'bold' : 'normal',
                fontStyle: 'normal',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bold"><path d="M11 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9" /><path d="M18 11H6" /><path d="M18 18H6" /></svg>
              Bold
            </button>
            <button
              onClick={() => onCellFormat?.(selectedCell.row, selectedCell.col, { italic: true })}
              style={{
                padding: '4px 8px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                background: formatting?.[selectedCell.row]?.[selectedCell.col]?.italic ? '#3b82f6' : '#ffffff',
                color: formatting?.[selectedCell.row]?.[selectedCell.col]?.italic ? '#ffffff' : '#1f2937',
                fontWeight: 'normal',
                fontStyle: formatting?.[selectedCell.row]?.[selectedCell.col]?.italic ? 'italic' : 'normal',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-italic"><path d="M11 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9" /><path d="M18 11H6" /><path d="M18 18H6" /></svg>
              Italic
            </button>
            <button
              onClick={() => onCellFormat?.(selectedCell.row, selectedCell.col, { color: '#3b82f6' })}
              style={{
                padding: '4px 8px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                background: formatting?.[selectedCell.row]?.[selectedCell.col]?.color === '#3b82f6' ? '#3b82f6' : '#ffffff',
                color: formatting?.[selectedCell.row]?.[selectedCell.col]?.color === '#3b82f6' ? '#ffffff' : '#1f2937',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-text-color"><path d="M11 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9" /><path d="M18 11H6" /><path d="M18 18H6" /></svg>
              Text Color
            </button>
            <button
              onClick={() => onCellFormat?.(selectedCell.row, selectedCell.col, { background: '#3b82f6' })}
              style={{
                padding: '4px 8px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                background: formatting?.[selectedCell.row]?.[selectedCell.col]?.background === '#3b82f6' ? '#3b82f6' : '#ffffff',
                color: formatting?.[selectedCell.row]?.[selectedCell.col]?.background === '#3b82f6' ? '#ffffff' : '#1f2937',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-background-color"><path d="M11 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9" /><path d="M18 11H6" /><path d="M18 18H6" /></svg>
              Background Color
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

export default ResizableTable; 