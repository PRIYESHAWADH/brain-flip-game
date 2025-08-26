interface AnalyticsEvent {
  type: string;
  payload: Record<string, any>;
}

class AnalyticsManager {
  private events: AnalyticsEvent[] = [];
  private isEnabled: boolean = true;
  
  track(event: AnalyticsEvent): void {
    if (!this.isEnabled) return;
    
    // Add timestamp
    const enrichedEvent = {
      ...event,
      timestamp: Date.now(),
      sessionId: this.getSessionId()
    };
    
    this.events.push(enrichedEvent);
    
    // Keep only last 1000 events to prevent memory issues
    if (this.events.length > 1000) {
      this.events = this.events.slice(-1000);
    }
    
    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics]', enrichedEvent);
    }
  }
  
  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('brain-flip-session-id');
    if (!sessionId) {
      sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('brain-flip-session-id', sessionId);
    }
    return sessionId;
  }
  
  getEvents(): AnalyticsEvent[] {
    return [...this.events];
  }
  
  clearEvents(): void {
    this.events = [];
  }
  
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }
  
  // Game-specific tracking methods
  trackGameStart(mode: string): void {
    this.track({
      type: 'game_start',
      payload: { mode }
    });
  }
  
  trackGameEnd(score: number, level: number, streak: number, duration: number): void {
    this.track({
      type: 'game_end',
      payload: { score, level, streak, duration }
    });
  }
  
  trackAnswer(correct: boolean, reactionTime: number, instructionType: string): void {
    this.track({
      type: 'answer_submitted',
      payload: { correct, reactionTime, instructionType }
    });
  }
  
  trackAchievement(achievementId: string): void {
    this.track({
      type: 'achievement_unlocked',
      payload: { achievementId }
    });
  }
  
  trackLevelUp(newLevel: number): void {
    this.track({
      type: 'level_up',
      payload: { newLevel }
    });
  }
}

export const analytics = new AnalyticsManager();