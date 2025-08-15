import { useEffect } from 'react';
import analyticsService from '../services/analyticsService';

export function useAnalytics(userId: string) {
  useEffect(() => {
    if (!userId) return;
    
    // Track page view only once
    analyticsService.trackEvent('page_view', userId, {
      page: window.location.pathname,
      timestamp: Date.now()
    });
  }, []); // Remove userId dependency to prevent re-running

  const trackAction = (action: string, data?: any) => {
    analyticsService.trackEvent(action, userId, data);
  };

  const trackError = (error: Error, context?: string) => {
    analyticsService.trackEvent('error', userId, {
      message: error.message,
      stack: error.stack,
      context
    });
  };

  const trackAIInteraction = (promptId: string, prompt: string, response: string) => {
    analyticsService.trackAIInteraction(promptId, userId, prompt, response);
  };

  return {
    trackAction,
    trackError,
    trackAIInteraction
  };
}