import React, { useEffect, useState } from 'react';

interface ApiKeyStatusProps {
  onValidKey?: () => void;
}

export const ApiKeyStatus: React.FC<ApiKeyStatusProps> = ({ onValidKey }) => {
  const [apiKeyStatus, setApiKeyStatus] = useState<'checking' | 'valid' | 'invalid' | 'missing'>('checking');

  useEffect(() => {
    checkApiKey();
  }, []);

  const checkApiKey = () => {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    
    if (!apiKey) {
      setApiKeyStatus('missing');
      return;
    }

    if (apiKey.length < 20) {
      setApiKeyStatus('invalid');
      return;
    }

    setApiKeyStatus('valid');
    onValidKey?.();
  };

  const getStatusColor = () => {
    switch (apiKeyStatus) {
      case 'valid':
        return '#28a745';
      case 'invalid':
        return '#dc3545';
      case 'missing':
        return '#ffc107';
      default:
        return '#6c757d';
    }
  };

  const getStatusText = () => {
    switch (apiKeyStatus) {
      case 'valid':
        return '✅ API Key Valid';
      case 'invalid':
        return '❌ API Key Invalid';
      case 'missing':
        return '⚠️ API Key Missing';
      default:
        return '⏳ Checking API Key...';
    }
  };

  const getStatusMessage = () => {
    switch (apiKeyStatus) {
      case 'valid':
        return 'Your OpenAI API key is configured and ready to use.';
      case 'invalid':
        return 'Please check your API key in the .env file.';
      case 'missing':
        return 'Please add VITE_OPENAI_API_KEY to your .env file.';
      default:
        return 'Verifying API key configuration...';
    }
  };

  return (
    <div style={{
      padding: '15px',
      borderRadius: '8px',
      border: `2px solid ${getStatusColor()}`,
      background: `${getStatusColor()}10`,
      marginBottom: '20px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
        <strong style={{ color: getStatusColor() }}>{getStatusText()}</strong>
      </div>
      <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
        {getStatusMessage()}
      </p>
      {apiKeyStatus === 'missing' && (
        <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
          <strong>Setup Instructions:</strong>
          <ol style={{ margin: '5px 0', paddingLeft: '20px' }}>
            <li>Create a <code>.env</code> file in your project root</li>
            <li>Add: <code>VITE_OPENAI_API_KEY=your_api_key_here</code></li>
            <li>Restart the development server</li>
          </ol>
        </div>
      )}
    </div>
  );
}; 