import React from 'react';

interface TrialStatusProps {
  trialExpiryDate?: string;
  promptsRemaining: number;
  promptsUsed: number;
  onUpgrade: () => void;
  onRefresh: () => void;
}

export default function TrialStatus({ 
  trialExpiryDate, 
  promptsRemaining, 
  promptsUsed, 
  onUpgrade,
  onRefresh 
}: TrialStatusProps) {
  const getDaysRemaining = () => {
    if (!trialExpiryDate) return 0;
    const expiry = new Date(trialExpiryDate);
    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const daysRemaining = getDaysRemaining();

  return (
    <div style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '10px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: '12px'
    }}>
      {/* Mobile First - Stack everything vertically */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ marginBottom: '8px' }}>
          🎯 <strong>Trial:</strong> {daysRemaining} days | ⚡ <strong>{promptsRemaining}</strong> prompts left
        </div>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
          <button onClick={onRefresh} style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            color: 'white',
            padding: '6px 12px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px'
          }}>
            🔄 Refresh
          </button>
          <button onClick={onUpgrade} style={{
            background: '#10b981',
            border: 'none',
            color: 'white',
            padding: '6px 12px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px',
            fontWeight: '600'
          }}>
            🚀 Upgrade ₹249/mo
          </button>
        </div>
      </div>
    </div>
  );
}