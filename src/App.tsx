import React, { useState, useEffect } from 'react';
import WelcomePage from './components/WelcomePage';
import LandingPage from './LandingPage';
import ExcelViewer from './components/ExcelViewer';
import { authService } from './services/authService';
import * as XLSX from 'xlsx';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('welcome');
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [uploadedFile, setUploadedFile] = useState<any>(null);

  // Remove auto-login check to always start with welcome page

  const handleLogin = (userData: { name: string; email: string }) => {
    console.log('Login successful:', userData);
    setUser(userData);
    setCurrentView('upload');
  };

  const handleFileUpload = (fileData: any) => {
    setUploadedFile(fileData);
    setCurrentView('viewer');
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setUploadedFile(null);
    setCurrentView('welcome');
  };

  return (
    <div className="App">
      {currentView === 'welcome' && (
        <WelcomePage onProceed={() => setCurrentView('auth')} />
      )}
      {currentView === 'auth' && (
        <LandingPage onLogin={handleLogin} />
      )}
      {currentView === 'upload' && user && (
        <FileUploadPage 
          user={user} 
          onFileUpload={handleFileUpload}
          onLogout={handleLogout}
        />
      )}
      {currentView === 'viewer' && uploadedFile && user && (
        <ExcelViewer 
          fileData={uploadedFile}
          user={user}
          onBack={() => setCurrentView('upload')}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}

// File Upload Component
interface FileUploadPageProps {
  user: { name: string; email: string };
  onFileUpload: (fileData: any) => void;
  onLogout: () => void;
}

const FileUploadPage: React.FC<FileUploadPageProps> = ({ user, onFileUpload, onLogout }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);

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
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleFile = async (file: File) => {
    if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
      alert('Please upload only Excel files (.xlsx, .xls) or CSV files');
      return;
    }

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        const sheets: { [key: string]: any[][] } = {};
        workbook.SheetNames.forEach(sheetName => {
          const worksheet = workbook.Sheets[sheetName];
          sheets[sheetName] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        });

        onFileUpload({
          fileName: file.name,
          sheets: sheets,
          sheetNames: workbook.SheetNames
        });
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      alert('Error reading file: ' + (error as Error).message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ background: 'white', borderRadius: '20px', padding: '40px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <h1 style={{ color: '#333', margin: 0 }}>Welcome, {user.name}! 📊</h1>
            <button onClick={onLogout} style={{ background: '#ff4757', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer' }}>Logout</button>
          </div>
          
          <h2 style={{ color: '#666', marginBottom: '40px' }}>Upload Your Excel File</h2>
          
          <div 
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            style={{
              border: dragActive ? '3px dashed #667eea' : '3px dashed #ddd',
              borderRadius: '20px',
              padding: '60px 20px',
              background: dragActive ? '#f8f9ff' : '#fafafa',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
          >
            <div style={{ fontSize: '60px', marginBottom: '20px' }}>📁</div>
            <h3 style={{ color: '#333', marginBottom: '10px' }}>Drag & Drop Your Excel File Here</h3>
            <p style={{ color: '#666', marginBottom: '20px' }}>or click to browse</p>
            <input 
              type="file" 
              accept=".xlsx,.xls,.csv"
              onChange={handleFileInput}
              style={{ display: 'none' }}
              id="fileInput"
            />
            <label 
              htmlFor="fileInput" 
              style={{
                background: '#667eea',
                color: 'white',
                padding: '15px 30px',
                borderRadius: '10px',
                cursor: 'pointer',
                display: 'inline-block',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              {uploading ? 'Processing...' : 'Choose File'}
            </label>
          </div>
          
          <div style={{ marginTop: '30px', color: '#666' }}>
            <p>✅ Supports: .xlsx, .xls, .csv files</p>
            <p>✅ Single sheet or multiple sheet workbooks</p>
            <p>✅ Automatic data parsing and display</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;