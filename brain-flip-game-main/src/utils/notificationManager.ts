// Notification utilities for Brain Flip
export interface GameNotification {
  id: string;
  type: 'achievement' | 'daily' | 'friend' | 'challenge' | 'system';
  title: string;
  message: string;
  icon?: string;
  action?: () => void;
  timestamp: number;
  duration?: number;
}

class NotificationManager {
  private notifications: Map<string, GameNotification> = new Map();
  private listeners: Set<(notifications: GameNotification[]) => void> = new Set();

  show(notification: Omit<GameNotification, 'id' | 'timestamp'>): string {
    const fullNotification: GameNotification = {
      ...notification,
      id,
      timestamp: Date.now(),
      duration: notification.duration || 4000
    };

    this.notifications.set(id, fullNotification);
    this.notifyListeners();

    // Auto-remove after duration
    if (fullNotification.duration > 0) {
      setTimeout(() => this.remove(id), fullNotification.duration);
    }

    return id;
  }

  remove(id: string): void {
    if (this.notifications.delete(id)) {
      this.notifyListeners();
    }
  }

  clear(): void {
    this.notifications.clear();
    this.notifyListeners();
  }

  getAll(): GameNotification[] {
    return Array.from(this.notifications.values()).sort((a, b) => b.timestamp - a.timestamp);
  }

  subscribe(listener: (notifications: GameNotification[]) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(notifications));
  }

  // Convenience methods for common notification types
  achievement(title: string, message: string, icon = '🏆'): string {
    return this.show({ type: 'achievement', title, message, icon });
  }

  dailyReward(title: string, message: string, icon = '🎁'): string {
    return this.show({ type: 'daily', title, message, icon });
  }

  friend(title: string, message: string, icon = '👋'): string {
    return this.show({ type: 'friend', title, message, icon });
  }

  challenge(title: string, message: string, icon = '⚡'): string {
    return this.show({ type: 'challenge', title, message, icon });
  }

  system(title: string, message: string, icon = 'ℹ️'): string {
    return this.show({ type: 'system', title, message, icon });
  }
}

export const notifications = new NotificationManager();

// React hook for notifications
import { useState, useEffect } from 'react';

export function useNotifications() {
  const [notificationList, setNotificationList] = useState<GameNotification[]>([]);

  useEffect(() => {
    return notifications.subscribe(setNotificationList);
  }, []);

  return {
    notifications: notificationList,
    show: notifications.show.bind(notifications),
    remove: notifications.remove.bind(notifications),
    clear: notifications.clear.bind(notifications),
    achievement: notifications.achievement.bind(notifications),
    dailyReward: notifications.dailyReward.bind(notifications),
    friend: notifications.friend.bind(notifications),
    challenge: notifications.challenge.bind(notifications),
    system: notifications.system.bind(notifications)
  };
}
