// Analytics utilities for tracking engagement
interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  timestamp: number;
  sessionId: string;
}

class AnalyticsManager {
  private sessionId: string = Math.random().toString(36).substr(2, 9);
  private events: AnalyticsEvent[] = [];
  private sessionStart: number = Date.now();

  track(event: string, properties?: Record<string, any>): void {
    const analyticsEvent: AnalyticsEvent = {
      event,
      properties: properties || {},
      timestamp: Date.now(),
      sessionId: this.sessionId
    };

    this.events.push(analyticsEvent);
    
    // In a real app, send to analytics service
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics]', event, properties);
    }
  }

  // Game-specific tracking methods
  gameStarted(mode: string): void {
    this.track('game_started', { mode });
  }

  gameEnded(score: number, level: number, streak: number, duration: number): void {
    this.track('game_ended', { score, level, streak, duration });
  }

  achievementUnlocked(achievementId: string): void {
    this.track('achievement_unlocked', { achievementId });
  }

  dailyRewardClaimed(day: number, reward: unknown): void {
    this.track('daily_reward_claimed', { day, reward });
  }

  friendAdded(method: 'invite_code' | 'suggestion'): void {
    this.track('friend_added', { method });
  }

  luckyMultiplier(multiplier: number, baseScore: number): void {
    this.track('lucky_multiplier', { multiplier, baseScore });
  }

  goldenMoment(value: number): void {
    this.track('golden_moment', { value });
  }

  streakMilestone(streak: number): void {
    this.track('streak_milestone', { streak });
  }

  getSessionMetrics(): {
    sessionDuration: number;
    eventsCount: number;
    sessionId: string;
  } {
    return {
      sessionDuration: Date.now() - this.sessionStart,
      eventsCount: this.events.length,
      sessionId: this.sessionId
    };
  }
}

export const analytics = new AnalyticsManager();
