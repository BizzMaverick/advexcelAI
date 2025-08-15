import { useState } from 'react';
import analyticsService from '../services/analyticsService';
import { typography } from '../styles/typography';

interface FeedbackWidgetProps {
  promptId?: string;
  onClose?: () => void;
}

export default function FeedbackWidget({ promptId, onClose }: FeedbackWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (promptId) {
      analyticsService.rateAIResponse(promptId, rating, feedback);
    }
    
    analyticsService.trackEvent('feedback_submitted', 'user', {
      rating,
      feedback,
      promptId
    });
    
    setSubmitted(true);
    setTimeout(() => {
      setIsOpen(false);
      setSubmitted(false);
      onClose?.();
    }, 2000);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          background: '#232f3e',
          color: 'white',
          border: '1px solid #37475a',
          borderRadius: '4px',
          padding: '8px 16px',
          cursor: 'pointer',
          boxShadow: '0 2px 5px rgba(15,17,17,.15)',
          fontSize: typography.sizes.sm,
          fontWeight: typography.weights.normal,
          fontFamily: typography.fontFamily,
          transition: 'all 0.15s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#37475a';
          e.currentTarget.style.boxShadow = '0 4px 8px rgba(15,17,17,.25)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = '#232f3e';
          e.currentTarget.style.boxShadow = '0 2px 5px rgba(15,17,17,.15)';
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Feedback
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: 'white',
      border: '1px solid #d5d9d9',
      borderRadius: '4px',
      padding: '16px',
      width: '320px',
      boxShadow: '0 4px 8px rgba(15,17,17,.15), 0 8px 16px rgba(15,17,17,.15)',
      zIndex: 1000,
      fontFamily: typography.fontFamily
    }}>
      {submitted ? (
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            borderRadius: '50%', 
            background: '#067d62', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 12px',
            color: 'white',
            fontSize: '18px'
          }}>✓</div>
          <p style={{ margin: 0, color: '#0f1111', fontSize: typography.sizes.base, fontWeight: typography.weights.normal, fontFamily: typography.fontFamily }}>Thank you for your feedback!</p>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: typography.sizes.lg, color: '#0f1111', fontWeight: typography.weights.bold, fontFamily: typography.fontFamily }}>How was your experience?</h3>
            <button
              onClick={() => setIsOpen(false)}
              style={{ 
                background: 'none', 
                border: 'none', 
                fontSize: '16px', 
                cursor: 'pointer',
                color: '#565959',
                padding: '4px',
                borderRadius: '2px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f0f2f2'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
            >
              ×
            </button>
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <p style={{ margin: '0 0 8px 0', fontSize: typography.sizes.sm, color: '#0f1111', fontWeight: typography.weights.normal, fontFamily: typography.fontFamily }}>Rate this response:</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '28px',
                    cursor: 'pointer',
                    color: star <= rating ? '#ff9900' : '#ddd',
                    padding: '8px',
                    borderRadius: '4px',
                    transition: 'all 0.15s ease',
                    flex: 1,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                  onMouseEnter={(e) => {
                    if (star > rating) e.currentTarget.style.color = '#ff9900';
                    e.currentTarget.style.background = '#f7f8f8';
                  }}
                  onMouseLeave={(e) => {
                    if (star > rating) e.currentTarget.style.color = '#ddd';
                    e.currentTarget.style.background = 'none';
                  }}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
          
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Tell us more about your experience..."
            style={{
              width: '100%',
              height: '70px',
              padding: '8px',
              border: '1px solid #d5d9d9',
              borderRadius: '4px',
              fontSize: typography.sizes.sm,
              resize: 'none',
              boxSizing: 'border-box',
              fontFamily: typography.fontFamily,
              outline: 'none'
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = '#007eb9'}
            onBlur={(e) => e.currentTarget.style.borderColor = '#d5d9d9'}
          />
          
          <button
            onClick={handleSubmit}
            disabled={rating === 0}
            style={{
              width: '100%',
              padding: '8px 16px',
              background: rating > 0 ? '#ff9900' : '#e7e9ec',
              color: rating > 0 ? '#0f1111' : '#565959',
              border: '1px solid ' + (rating > 0 ? '#ff9900' : '#d5d9d9'),
              borderRadius: '4px',
              cursor: rating > 0 ? 'pointer' : 'not-allowed',
              marginTop: '12px',
              fontSize: typography.sizes.sm,
              fontWeight: typography.weights.normal,
              fontFamily: typography.fontFamily,
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              if (rating > 0) {
                e.currentTarget.style.background = '#e47911';
                e.currentTarget.style.borderColor = '#e47911';
              }
            }}
            onMouseLeave={(e) => {
              if (rating > 0) {
                e.currentTarget.style.background = '#ff9900';
                e.currentTarget.style.borderColor = '#ff9900';
              }
            }}
          >
            Submit feedback
          </button>
        </>
      )}
    </div>
  );
}