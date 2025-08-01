interface SimpleTableProps {
  data: any[][];
  headers: string[];
  formatting?: any[][];
  title?: string;
  subtitle?: string;
  onCellEdit?: (row: number, col: number, value: string) => void;
}

export default function SimpleTable({ data, headers, title = "Data", subtitle }: SimpleTableProps) {
  return (
    <div style={{ margin: '20px 0', padding: '20px', background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <h3 style={{ margin: '0 0 16px 0' }}>{title}</h3>
      {subtitle && <p style={{ margin: '0 0 16px 0', color: '#666' }}>{subtitle}</p>}
      <div style={{ overflow: 'auto', maxHeight: '400px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f5f5f5' }}>
              {headers.map((header, i) => (
                <th key={i} style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.slice(0, 50).map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <td key={j} style={{ padding: '8px', border: '1px solid #ddd' }}>
                    {cell || ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}