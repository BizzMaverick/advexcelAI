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
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: '14px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <div className="trial-banner" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div className="trial-info" style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2"/>
              <polyline points="12,6 12,12 16,14" stroke="white" strokeWidth="2"/>
            </svg>
            <span><strong>Free Trial:</strong> {daysRemaining} days remaining</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2" stroke="white" strokeWidth="2" fill="white"/>
            </svg>
            <span><strong>Today:</strong> {promptsRemaining} prompts left</span>
          </div>
        </div>

        <div className="trial-buttons" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

          

        </div>
      </div>
      
      {/* Mobile responsive styles */}
      <style>
        {`
          @media (max-width: 768px) {
            .trial-banner {
              flex-direction: column !important;
              text-align: center !important;
            }
            .trial-info {
              flex-direction: column !important;
              gap: 8px !important;
            }
            .trial-buttons {
              width: 100% !important;
              justify-content: center !important;
            }
          }
        `}
      </style>
    </div>
  );
}