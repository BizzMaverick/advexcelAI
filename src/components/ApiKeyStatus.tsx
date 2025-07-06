import { useState, useEffect } from 'react';

interface ApiKeyStatusProps {
  onValidKey?: () => void;
}

export const ApiKeyStatus: React.FC<ApiKeyStatusProps> = ({ onValidKey }) => {
  const [apiKeyStatus, setApiKeyStatus] = useState<'checking' | 'valid' | 'missing' | 'invalid'>('checking');
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    checkApiKeyStatus();
  }, []);

  const checkApiKeyStatus = () => {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey || apiKey === 'your_openai_api_key_here') {
      setApiKeyStatus('missing');
    } else {
      setApiKeyStatus('valid');
      onValidKey?.();
    }
  };

  const testApiKey = async () => {
    setIsTesting(true);
    try {
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        setApiKeyStatus('valid');
        onValidKey?.();
      } else {
        setApiKeyStatus('invalid');
      }
    } catch (error) {
      setApiKeyStatus('invalid');
    } finally {
      setIsTesting(false);
    }
  };

  if (apiKeyStatus === 'checking') {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <div style={{ 
          display: 'inline-block',
          width: 20,
          height: 20,
          border: '2px solid #7f53ff',
          borderTop: '2px solid transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ color: '#bfc4d1', marginTop: 10 }}>Checking API key...</p>
      </div>
    );
  }

  if (apiKeyStatus === 'missing') {
    return (
      <div style={{
        background: 'rgba(255, 193, 7, 0.1)',
        border: '1px solid #ffc107',
        borderRadius: 8,
        padding: '16px',
        margin: '16px 0',
        color: '#ffc107'
      }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: 16 }}>⚠️ OpenAI API Key Required</h3>
        <p style={{ margin: '0 0 12px 0', fontSize: 14 }}>
          To use AI features, you need to configure your OpenAI API key:
        </p>
        <ol style={{ margin: '0 0 12px 0', paddingLeft: '20px', fontSize: 14 }}>
          <li>Get an API key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" style={{ color: '#7f53ff' }}>OpenAI Platform</a></li>
          <li>Create a <code>.env</code> file in the project root</li>
          <li>Add: <code>VITE_OPENAI_API_KEY=your_actual_api_key</code></li>
          <li>Restart the development server</li>
        </ol>
        <button
          onClick={checkApiKeyStatus}
          style={{
            background: '#ffc107',
            color: '#000',
            border: 'none',
            borderRadius: 4,
            padding: '8px 16px',
            cursor: 'pointer',
            fontSize: 14
          }}
        >
          Check Again
        </button>
      </div>
    );
  }

  if (apiKeyStatus === 'invalid') {
    return (
      <div style={{
        background: 'rgba(220, 53, 69, 0.1)',
        border: '1px solid #dc3545',
        borderRadius: 8,
        padding: '16px',
        margin: '16px 0',
        color: '#dc3545'
      }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: 16 }}>❌ Invalid API Key</h3>
        <p style={{ margin: '0 0 12px 0', fontSize: 14 }}>
          The OpenAI API key appears to be invalid. Please check your key and try again.
        </p>
        <button
          onClick={testApiKey}
          disabled={isTesting}
          style={{
            background: '#dc3545',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            padding: '8px 16px',
            cursor: isTesting ? 'not-allowed' : 'pointer',
            fontSize: 14,
            opacity: isTesting ? 0.7 : 1
          }}
        >
          {isTesting ? 'Testing...' : 'Test API Key'}
        </button>
      </div>
    );
  }

  return (
    <div style={{
      background: 'rgba(40, 167, 69, 0.1)',
      border: '1px solid #28a745',
      borderRadius: 8,
      padding: '12px 16px',
      margin: '8px 0',
      color: '#28a745',
      fontSize: 14
    }}>
      ✅ OpenAI API key configured and ready
    </div>
  );
}; 