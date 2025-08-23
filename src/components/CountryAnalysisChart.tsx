import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface CountryAnalysisChartProps {
  data: (string | number | boolean | null | undefined)[][];
  countryName: string;
}

export default function CountryAnalysisChart({ data, countryName }: CountryAnalysisChartProps) {
  if (!data || data.length < 2) return null;

  const headers = data[0].map(h => String(h || ''));
  const countryRow = data.find(row => 
    row[0] && row[0].toString().toLowerCase().includes(countryName.toLowerCase())
  );

  if (!countryRow) return null;

  // Get all numeric values for the country (skip first column which is country name)
  const metrics = [];
  const values = [];
  
  for (let i = 1; i < headers.length; i++) {
    const value = Number(countryRow[i]);
    if (!isNaN(value) && value > 0) {
      metrics.push(headers[i]);
      values.push(value);
    }
  }

  const chartData = {
    labels: metrics,
    datasets: [{
      label: `${countryName} Metrics`,
      data: values,
      backgroundColor: [
        '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57',
        '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43',
        '#10ac84', '#ee5253', '#0abde3', '#3742fa', '#2f3542'
      ],
      borderColor: '#333',
      borderWidth: 1,
    }]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { 
        display: true, 
        text: `${countryName} - Detailed Analysis`,
        font: { size: 16 }
      }
    },
    scales: {
      y: { 
        beginAtZero: true,
        title: { display: true, text: 'Score' }
      },
      x: {
        ticks: { maxRotation: 45 }
      }
    }
  };

  return (
    <div style={{ 
      background: 'white', 
      padding: '20px', 
      borderRadius: '8px', 
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      margin: '20px 0'
    }}>
      <Bar data={chartData} options={options} />
    </div>
  );
}