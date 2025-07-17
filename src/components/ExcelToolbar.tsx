import React from 'react';

interface ExcelToolbarProps {
  onToolAction: (action: string, params?: any) => void;
}

export default function ExcelToolbar({ onToolAction }: ExcelToolbarProps) {
  return (
    <div style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
      <button onClick={() => onToolAction('aws-save-s3')} style={{ margin: '5px' }}>
        Save to S3
      </button>
      <button onClick={() => onToolAction('insert-table')} style={{ margin: '5px' }}>
        Table
      </button>
      <button onClick={() => onToolAction('insert-chart')} style={{ margin: '5px' }}>
        Chart
      </button>
      <button onClick={() => onToolAction('filter')} style={{ margin: '5px' }}>
        Filter
      </button>
    </div>
  );
}