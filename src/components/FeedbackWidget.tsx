import { useState } from 'react';
import analyticsService from '../services/analyticsService';

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
          background: '#0078d4',
          color: 'white',
          border: 'none',
          borderRadius: '50px',
          padding: '12px 20px',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          fontSize: '14px',
          fontWeight: '500'
        }}
      >
        💬 Feedback
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: 'white',
      border: '1px solid #ddd',
      borderRadius: '12px',
      padding: '20px',
      width: '300px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
      zIndex: 1000
    }}>
      {submitted ? (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>✅</div>
          <p style={{ margin: 0, color: '#107c10' }}>Thank you for your feedback!</p>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ margin: 0, fontSize: '16px' }}>How was your experience?</h3>
            <button
              onClick={() => setIsOpen(false)}
              style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}
            >
              ×
            </button>
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <p style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Rate this response:</p>
            <div style={{ display: 'flex', gap: '5px' }}>
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '20px',
                    cursor: 'pointer',
                    color: star <= rating ? '#ffd700' : '#ddd'
                  }}
                >
                  ⭐
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
              height: '80px',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '14px',
              resize: 'none',
              boxSizing: 'border-box'
            }}
          />
          
          <button
            onClick={handleSubmit}
            disabled={rating === 0}
            style={{
              width: '100%',
              padding: '10px',
              background: rating > 0 ? '#0078d4' : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: rating > 0 ? 'pointer' : 'not-allowed',
              marginTop: '10px',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Submit Feedback
          </button>
        </>
      )}
    </div>
  );
}