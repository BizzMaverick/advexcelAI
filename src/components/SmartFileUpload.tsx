import { useRef, useState } from 'react';
import { DataDetectionService, DataStructure } from '../services/dataDetectionService';
import * as XLSX from 'xlsx';

interface SmartFileUploadProps {
  onFileProcessed: (file: File, data: any[][], structure: DataStructure) => void;
  isProcessing?: boolean;
}

export default function SmartFileUpload({ onFileProcessed, isProcessing = false }: SmartFileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [previewStructure, setPreviewStructure] = useState<DataStructure | null>(null);

  const processFile = async (file: File) => {
    setAnalyzing(true);
    setPreviewStructure(null);

    try {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        try {
          const data = evt.target?.result;
          if (!data) throw new Error('No data read from file');
          
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
          
          // Analyze data structure
          const structure = DataDetectionService.analyzeData(jsonData);
          setPreviewStructure(structure);
          
          // Call parent handler
          onFileProcessed(file, jsonData, structure);
        } catch (err) {
          console.error('Failed to process file:', err);
        } finally {
          setAnalyzing(false);
        }
      };
      reader.readAsBinaryString(file);
    } catch (err) {
      console.error('File processing error:', err);
      setAnalyzing(false);
    }
  };

  const handleFileSelect = (file: File) => {
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv'))) {
      processFile(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'financial': return '💰';
      case 'survey': return '📊';
      case 'inventory': return '📦';
      case 'analytics': return '📈';
      default: return '📋';
    }
  };

  const getQualityColor = (score: number) => {
    if (score >= 0.8) return '#107c10';
    if (score >= 0.6) return '#ff8c00';
    return '#d83b01';
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        style={{ display: 'none' }}
        onChange={(e) => {
          if (e.target.files?.[0]) {
            handleFileSelect(e.target.files[0]);
          }
        }}
      />
      
      {/* Upload Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${dragActive ? '#0078d4' : '#e0e0e0'}`,
          borderRadius: '8px',
          padding: '24px',
          textAlign: 'center',
          cursor: 'pointer',
          background: dragActive ? '#f0f8ff' : 'white',
          transition: 'all 0.2s',
          marginBottom: '16px'
        }}
      >
        {analyzing ? (
          <div>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔄</div>
            <div style={{ fontSize: '16px', fontWeight: '500', color: '#252525', marginBottom: '8px' }}>
              Analyzing your data...
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>
              Detecting structure, types, and patterns
            </div>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>📊</div>
            <div style={{ fontSize: '16px', fontWeight: '500', color: '#252525', marginBottom: '8px' }}>
              {dragActive ? 'Drop your file here' : 'Upload Excel or CSV file'}
            </div>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '12px' }}>
              Drag & drop or click to browse
            </div>
            <div style={{ fontSize: '12px', color: '#999' }}>
              Supports .xlsx, .xls, .csv files
            </div>
          </div>
        )}
      </div>

      {/* Quick Preview */}
      {previewStructure && (
        <div style={{
          background: '#f9f9f9',
          border: '1px solid #e0e0e0',
          borderRadius: '6px',
          padding: '16px',
          marginBottom: '16px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '12px'
          }}>
            <span style={{ fontSize: '16px' }}>🧠</span>
            <span style={{ fontWeight: '500', fontSize: '14px' }}>Smart Analysis Complete</span>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
            gap: '8px',
            marginBottom: '12px'
          }}>
            <div style={{
              background: 'white',
              padding: '8px',
              borderRadius: '4px',
              textAlign: 'center',
              fontSize: '12px'
            }}>
              <div style={{ fontWeight: '500' }}>{previewStructure.rowCount}</div>
              <div style={{ color: '#666' }}>Rows</div>
            </div>
            <div style={{
              background: 'white',
              padding: '8px',
              borderRadius: '4px',
              textAlign: 'center',
              fontSize: '12px'
            }}>
              <div style={{ fontWeight: '500' }}>{previewStructure.columnCount}</div>
              <div style={{ color: '#666' }}>Columns</div>
            </div>
            <div style={{
              background: 'white',
              padding: '8px',
              borderRadius: '4px',
              textAlign: 'center',
              fontSize: '12px'
            }}>
              <div style={{ fontWeight: '500' }}>
                {getFormatIcon(previewStructure.detectedFormat)}
              </div>
              <div style={{ color: '#666', textTransform: 'capitalize' }}>
                {previewStructure.detectedFormat}
              </div>
            </div>
            <div style={{
              background: 'white',
              padding: '8px',
              borderRadius: '4px',
              textAlign: 'center',
              fontSize: '12px'
            }}>
              <div style={{ 
                fontWeight: '500',
                color: getQualityColor(previewStructure.dataQuality.completeness)
              }}>
                {Math.round(previewStructure.dataQuality.completeness * 100)}%
              </div>
              <div style={{ color: '#666' }}>Quality</div>
            </div>
          </div>

          <div style={{ fontSize: '12px', color: '#666' }}>
            <strong>Detected:</strong> {previewStructure.columns.filter(c => c.type === 'number').length} numeric, {' '}
            {previewStructure.columns.filter(c => c.type === 'text').length} text, {' '}
            {previewStructure.columns.filter(c => c.type === 'date').length} date columns
          </div>
        </div>
      )}
    </div>
  );
}