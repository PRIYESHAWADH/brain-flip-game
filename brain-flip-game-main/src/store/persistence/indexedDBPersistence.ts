/**
 * Ultimate Brain Flip Experience - IndexedDB Persistence
 * Advanced local storage with IndexedDB for complex data structures
 */

import { openDB, DBSchema, IDBPDatabase } from 'idb';

// Database schema
interface BrainFlipDB extends DBSchema {
  gameStates: {
    key: string;
    value: {
      id: string;
      userId: string;
      gameState: any;
      timestamp: number;
      version: number;
      synced: boolean;
    };
    indexes: { 'by-user': string; 'by-timestamp': number };
  };
  
  userProfiles: {
    key: string;
    value: {
      id: string;
      profile: any;
      timestamp: number;
      version: number;
      synced: boolean;
    };
  };
  
  achievements: {
    key: string;
    value: {
      id: string;
      userId: string;
      achievements: any[];
      timestamp: number;
      synced: boolean;
    };
    indexes: { 'by-user': string };
  };
  
  socialData: {
    key: string;
    value: {
      id: string;
      userId: string;
      data: any;
      timestamp: number;
      synced: boolean;
    };
    indexes: { 'by-user': string };
  };
  
  aiPersonalization: {
    key: string;
    value: {
      id: string;
      userId: string;
      cognitiveProfile: any;
      personalizationData: any;
      timestamp: number;
      synced: boolean;
    };
    indexes: { 'by-user': string };
  };
  
  performanceMetrics: {
    key: string;
    value: {
      id: string;
      userId: string;
      sessionId: string;
      metrics: any;
      timestamp: number;
      synced: boolean;
    };
    indexes: { 'by-user': string; 'by-session': string; 'by-timestamp': number };
  };
  
  offlineActions: {
    key: string;
    value: {
      id: string;
      action: any;
      timestamp: number;
      retryCount: number;
      maxRetries: number;
    };
    indexes: { 'by-timestamp': number };
  };
}

class IndexedDBPersistence {
  private db: IDBPDatabase<BrainFlipDB> | null = null;
  private dbName = 'BrainFlipUltimate';
  private dbVersion = 1;

  async initialize(): Promise<void> {
    try {
      this.db = await openDB<BrainFlipDB>(this.dbName, this.dbVersion, {
        upgrade(db) {
          // Game States store
          if (!db.objectStoreNames.contains('gameStates')) {
            const gameStatesStore = db.createObjectStore('gameStates', { keyPath: 'id' });
            gameStatesStore.createIndex('by-user', 'userId');
            gameStatesStore.createIndex('by-timestamp', 'timestamp');
          }

          // User Profiles store
          if (!db.objectStoreNames.contains('userProfiles')) {
            db.createObjectStore('userProfiles', { keyPath: 'id' });
          }

          // Achievements store
          if (!db.objectStoreNames.contains('achievements')) {
            const achievementsStore = db.createObjectStore('achievements', { keyPath: 'id' });
            achievementsStore.createIndex('by-user', 'userId');
          }

          // Social Data store
          if (!db.objectStoreNames.contains('socialData')) {
            const socialStore = db.createObjectStore('socialData', { keyPath: 'id' });
            socialStore.createIndex('by-user', 'userId');
          }

          // AI Personalization store
          if (!db.objectStoreNames.contains('aiPersonalization')) {
            const aiStore = db.createObjectStore('aiPersonalization', { keyPath: 'id' });
            aiStore.createIndex('by-user', 'userId');
          }

          // Performance Metrics store
          if (!db.objectStoreNames.contains('performanceMetrics')) {
            const metricsStore = db.createObjectStore('performanceMetrics', { keyPath: 'id' });
            metricsStore.createIndex('by-user', 'userId');
            metricsStore.createIndex('by-session', 'sessionId');
            metricsStore.createIndex('by-timestamp', 'timestamp');
          }

          // Offline Actions store
          if (!db.objectStoreNames.contains('offlineActions')) {
            const offlineStore = db.createObjectStore('offlineActions', { keyPath: 'id' });
            offlineStore.createIndex('by-timestamp', 'timestamp');
          }
        },
      });
    } catch (error) {
      console.error('Failed to initialize IndexedDB:', error);
      throw error;
    }
  }

  // Game State operations
  async saveGameState(userId: string, gameState: any): Promise<void> {
    if (!this.db) await this.initialize();
    
    const data = {
      id: `${userId}_${Date.now()}`,
      userId,
      gameState,
      timestamp: Date.now(),
      version: gameState.version || 1,
      synced: false,
    };

    await this.db!.put('gameStates', data);
  }

  async getLatestGameState(userId: string): Promise<any | null> {
    if (!this.db) await this.initialize();
    
    const tx = this.db!.transaction('gameStates', 'readonly');
    const index = tx.store.index('by-user');
    const states = await index.getAll(userId);
    
    if (states.length === 0) return null;
    
    // Return the most recent state
    return states.sort((a, b) => b.timestamp - a.timestamp)[0].gameState;
  }

  async getUnsyncedGameStates(userId: string): Promise<any[]> {
    if (!this.db) await this.initialize();
    
    const tx = this.db!.transaction('gameStates', 'readonly');
    const index = tx.store.index('by-user');
    const states = await index.getAll(userId);
    
    return states.filter(state => !state.synced);
  }

  async markGameStateSynced(stateId: string): Promise<void> {
    if (!this.db) await this.initialize();
    
    const state = await this.db!.get('gameStates', stateId);
    if (state) {
      state.synced = true;
      await this.db!.put('gameStates', state);
    }
  }

  // User Profile operations
  async saveUserProfile(userId: string, profile: any): Promise<void> {
    if (!this.db) await this.initialize();
    
    const data = {
      id: userId,
      profile,
      timestamp: Date.now(),
      version: profile.version || 1,
      synced: false,
    };

    await this.db!.put('userProfiles', data);
  }

  async getUserProfile(userId: string): Promise<any | null> {
    if (!this.db) await this.initialize();
    
    const data = await this.db!.get('userProfiles', userId);
    return data ? data.profile : null;
  }

  // Achievements operations
  async saveAchievements(userId: string, achievements: any[]): Promise<void> {
    if (!this.db) await this.initialize();
    
    const data = {
      id: userId,
      userId,
      achievements,
      timestamp: Date.now(),
      synced: false,
    };

    await this.db!.put('achievements', data);
  }

  async getAchievements(userId: string): Promise<any[]> {
    if (!this.db) await this.initialize();
    
    const data = await this.db!.get('achievements', userId);
    return data ? data.achievements : [];
  }

  // AI Personalization operations
  async saveAIPersonalization(userId: string, cognitiveProfile: any, personalizationData: any): Promise<void> {
    if (!this.db) await this.initialize();
    
    const data = {
      id: userId,
      userId,
      cognitiveProfile,
      personalizationData,
      timestamp: Date.now(),
      synced: false,
    };

    await this.db!.put('aiPersonalization', data);
  }

  async getAIPersonalization(userId: string): Promise<{ cognitiveProfile: any; personalizationData: any } | null> {
    if (!this.db) await this.initialize();
    
    const data = await this.db!.get('aiPersonalization', userId);
    return data ? { 
      cognitiveProfile: data.cognitiveProfile, 
      personalizationData: data.personalizationData 
    } : null;
  }

  // Performance Metrics operations
  async savePerformanceMetrics(userId: string, sessionId: string, metrics: any): Promise<void> {
    if (!this.db) await this.initialize();
    
    const data = {
      id: `${userId}_${sessionId}_${Date.now()}`,
      userId,
      sessionId,
      metrics,
      timestamp: Date.now(),
      synced: false,
    };

    await this.db!.put('performanceMetrics', data);
  }

  async getPerformanceMetrics(userId: string, limit: number = 100): Promise<any[]> {
    if (!this.db) await this.initialize();
    
    const tx = this.db!.transaction('performanceMetrics', 'readonly');
    const index = tx.store.index('by-user');
    const metrics = await index.getAll(userId);
    
    return metrics
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit)
      .map(m => m.metrics);
  }

  async getUnsyncedPerformanceMetrics(userId: string): Promise<any[]> {
    if (!this.db) await this.initialize();
    
    const tx = this.db!.transaction('performanceMetrics', 'readonly');
    const index = tx.store.index('by-user');
    const metrics = await index.getAll(userId);
    
    return metrics.filter(m => !m.synced);
  }

  // Offline Actions operations
  async saveOfflineAction(action: any, maxRetries: number = 3): Promise<void> {
    if (!this.db) await this.initialize();
    
    const data = {
      id: `${action.type}_${Date.now()}_${Math.random()}`,
      action,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries,
    };

    await this.db!.put('offlineActions', data);
  }

  async getOfflineActions(): Promise<any[]> {
    if (!this.db) await this.initialize();
    
    const tx = this.db!.transaction('offlineActions', 'readonly');
    const actions = await tx.store.getAll();
    
    return actions.sort((a, b) => a.timestamp - b.timestamp);
  }

  async removeOfflineAction(actionId: string): Promise<void> {
    if (!this.db) await this.initialize();
    
    await this.db!.delete('offlineActions', actionId);
  }

  async incrementOfflineActionRetry(actionId: string): Promise<boolean> {
    if (!this.db) await this.initialize();
    
    const action = await this.db!.get('offlineActions', actionId);
    if (action) {
      action.retryCount++;
      
      if (action.retryCount >= action.maxRetries) {
        await this.db!.delete('offlineActions', actionId);
        return false; // Max retries reached
      } else {
        await this.db!.put('offlineActions', action);
        return true; // Can retry
      }
    }
    
    return false;
  }

  // Utility operations
  async clearUserData(userId: string): Promise<void> {
    if (!this.db) await this.initialize();
    
    const tx = this.db!.transaction(['gameStates', 'achievements', 'socialData', 'aiPersonalization', 'performanceMetrics'], 'readwrite');
    
    // Clear game states
    const gameStatesIndex = tx.objectStore('gameStates').index('by-user');
    const gameStates = await gameStatesIndex.getAll(userId);
    for (const state of gameStates) {
      await tx.objectStore('gameStates').delete(state.id);
    }
    
    // Clear achievements
    await tx.objectStore('achievements').delete(userId);
    
    // Clear social data
    await tx.objectStore('socialData').delete(userId);
    
    // Clear AI personalization
    await tx.objectStore('aiPersonalization').delete(userId);
    
    // Clear performance metrics
    const metricsIndex = tx.objectStore('performanceMetrics').index('by-user');
    const metrics = await metricsIndex.getAll(userId);
    for (const metric of metrics) {
      await tx.objectStore('performanceMetrics').delete(metric.id);
    }
    
    await tx.done;
  }

  async getStorageUsage(): Promise<{ used: number; quota: number }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return {
        used: estimate.usage || 0,
        quota: estimate.quota || 0,
      };
    }
    
    return { used: 0, quota: 0 };
  }

  async cleanup(olderThanDays: number = 30): Promise<void> {
    if (!this.db) await this.initialize();
    
    const cutoffTime = Date.now() - (olderThanDays * 24 * 60 * 60 * 1000);
    
    // Clean up old game states
    const tx = this.db!.transaction(['gameStates', 'performanceMetrics'], 'readwrite');
    
    const gameStatesIndex = tx.objectStore('gameStates').index('by-timestamp');
    const oldGameStates = await gameStatesIndex.getAll(IDBKeyRange.upperBound(cutoffTime));
    for (const state of oldGameStates) {
      if (state.synced) { // Only delete synced data
        await tx.objectStore('gameStates').delete(state.id);
      }
    }
    
    // Clean up old performance metrics
    const metricsIndex = tx.objectStore('performanceMetrics').index('by-timestamp');
    const oldMetrics = await metricsIndex.getAll(IDBKeyRange.upperBound(cutoffTime));
    for (const metric of oldMetrics) {
      if (metric.synced) {
        await tx.objectStore('performanceMetrics').delete(metric.id);
      }
    }
    
    await tx.done;
  }
}

// Singleton instance
export const indexedDBPersistence = new IndexedDBPersistence();

// Initialize on module load
indexedDBPersistence.initialize().catch(console.error);

export default indexedDBPersistence;