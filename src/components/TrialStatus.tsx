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
      padding: '12px 20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: '14px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '16px' }}>🎯</span>
          <span><strong>Free Trial:</strong> {daysRemaining} days remaining</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '16px' }}>⚡</span>
          <span><strong>Today:</strong> {promptsRemaining} prompts left ({promptsUsed}/25 used)</span>
        </div>
        
        <div style={{
          background: 'rgba(255,255,255,0.2)',
          borderRadius: '10px',
          padding: '4px',
          width: '100px',
          height: '8px',
          position: 'relative'
        }}>
          <div style={{
            background: promptsRemaining > 10 ? '#10b981' : promptsRemaining > 5 ? '#f59e0b' : '#ef4444',
            borderRadius: '6px',
            height: '100%',
            width: `${(promptsRemaining / 25) * 100}%`,
            transition: 'all 0.3s ease'
          }} />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={onRefresh}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: '1px solid rgba(255,255,255,0.3)',
            color: 'white',
            padding: '6px 12px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          🔄 Refresh
        </button>
        
        <button
          onClick={onUpgrade}
          style={{
            background: '#10b981',
            border: 'none',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}
        >
          🚀 Upgrade to Pro - ₹249/month
        </button>
      </div>
    </div>
  );
}