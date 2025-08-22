import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface ChartComponentProps {
  data: (string | number | boolean | null | undefined)[][];
  type: 'bar' | 'line' | 'pie';
  title?: string;
}

export default function ChartComponent({ data, type, title }: ChartComponentProps) {
  if (!data || data.length < 2) {
    return (
      <div style={{ 
        padding: '40px', 
        textAlign: 'center', 
        color: '#666',
        border: '2px dashed #ddd',
        borderRadius: '8px',
        margin: '20px 0'
      }}>
        <p>Not enough data to create chart. Need at least 2 rows with headers.</p>
      </div>
    );
  }

  const headers = data[0].map(h => String(h || ''));
  const rows = data.slice(1);

  // Get numeric columns (more flexible detection)
  const numericColumns = headers.map((_, index) => {
    const values = rows.map(row => row[index]);
    const numericValues = values.filter(val => {
      const num = Number(val);
      return !isNaN(num) && val !== '' && val !== null && val !== undefined;
    });
    // Consider column numeric if at least 50% of values are numeric
    return numericValues.length >= Math.max(1, values.length * 0.5);
  });

  const labelColumn = 0; // First column as labels
  let dataColumns = numericColumns.map((isNumeric, index) => 
    isNumeric && index !== labelColumn ? index : -1
  ).filter(index => index !== -1);
  
  // If no numeric columns found, try to use all columns except first as potential data
  if (dataColumns.length === 0) {
    dataColumns = headers.slice(1).map((_, i) => i + 1);
  }

  if (dataColumns.length === 0) {
    return (
      <div style={{ 
        padding: '40px', 
        textAlign: 'center', 
        color: '#666',
        border: '2px dashed #ddd',
        borderRadius: '8px',
        margin: '20px 0'
      }}>
        <p>No numeric data found for charting.</p>
      </div>
    );
  }

  const labels = rows.map(row => String(row[labelColumn] || ''));
  
  const colors = [
    '#0078d4', '#107c10', '#d83b01', '#5c2d91', '#0078d4',
    '#00bcf2', '#40e0d0', '#ff6b6b', '#4ecdc4', '#45b7d1'
  ];

  const chartData = {
    labels,
    datasets: dataColumns.map((colIndex, i) => {
      const columnData = rows.map(row => {
        const val = row[colIndex];
        const num = Number(val);
        return !isNaN(num) ? num : 0;
      });
      
      return {
        label: headers[colIndex],
        data: columnData,
        backgroundColor: type === 'pie' 
          ? colors.slice(0, labels.length)
          : colors[i % colors.length] + '80',
        borderColor: colors[i % colors.length],
        borderWidth: 2,
      };
    })
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: !!title, text: title }
    },
    scales: type !== 'pie' ? {
      y: { beginAtZero: true }
    } : undefined
  };

  const ChartComponent = type === 'bar' ? Bar : type === 'line' ? Line : Pie;

  return (
    <div style={{ 
      background: 'white', 
      padding: '20px', 
      borderRadius: '8px', 
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      margin: '20px 0'
    }}>
      <ChartComponent data={chartData} options={options} />
    </div>
  );
}