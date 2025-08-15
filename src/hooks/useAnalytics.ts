import { useEffect } from 'react';
import analyticsService from '../services/analyticsService';

export function useAnalytics(userId: string) {
  useEffect(() => {
    // Track page view
    analyticsService.trackEvent('page_view', userId, {
      page: window.location.pathname,
      timestamp: Date.now()
    });

    // Track page abandon on beforeunload
    const handleBeforeUnload = () => {
      analyticsService.trackEvent('page_abandon', userId, {
        page: window.location.pathname,
        timeSpent: Date.now() - performance.now()
      });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [userId]);

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