interface UserEvent {
  event: string;
  userId: string;
  timestamp: number;
  data?: any;
}

interface AIAccuracyMetric {
  promptId: string;
  userId: string;
  prompt: string;
  response: string;
  rating?: number;
  feedback?: string;
  timestamp: number;
}

class AnalyticsService {
  private events: UserEvent[] = [];
  private aiMetrics: AIAccuracyMetric[] = [];

  // Track user behavior
  trackEvent(event: string, userId: string, data?: any) {
    const eventData: UserEvent = {
      event,
      userId,
      timestamp: Date.now(),
      data
    };
    
    this.events.push(eventData);
    this.sendToAnalytics(eventData);
  }

  // Track AI interactions
  trackAIInteraction(promptId: string, userId: string, prompt: string, response: string) {
    const metric: AIAccuracyMetric = {
      promptId,
      userId,
      prompt,
      response,
      timestamp: Date.now()
    };
    
    this.aiMetrics.push(metric);
  }

  // Rate AI response accuracy
  rateAIResponse(promptId: string, rating: number, feedback?: string) {
    const metric = this.aiMetrics.find(m => m.promptId === promptId);
    if (metric) {
      metric.rating = rating;
      metric.feedback = feedback;
      this.sendAIMetric(metric);
    }
  }

  // Get pain points analysis
  getPainPoints() {
    const errorEvents = this.events.filter(e => e.event.includes('error'));
    const abandonmentEvents = this.events.filter(e => e.event === 'page_abandon');
    
    return {
      errors: errorEvents.length,
      abandonments: abandonmentEvents.length,
      commonErrors: this.getCommonErrors(errorEvents)
    };
  }

  private getCommonErrors(errorEvents: UserEvent[]) {
    const errorCounts: { [key: string]: number } = {};
    errorEvents.forEach(event => {
      const errorType = event.data?.errorType || 'unknown';
      errorCounts[errorType] = (errorCounts[errorType] || 0) + 1;
    });
    return errorCounts;
  }

  private sendToAnalytics(event: UserEvent) {
    // Send to your analytics service (Google Analytics, AWS CloudWatch, etc.)
    console.log('Analytics Event:', event);
  }

  private sendAIMetric(metric: AIAccuracyMetric) {
    // Send to your monitoring service
    console.log('AI Metric:', metric);
  }
}

export default new AnalyticsService();