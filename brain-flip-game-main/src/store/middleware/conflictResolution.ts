/**
 * Ultimate Brain Flip Experience - Conflict Resolution Middleware
 * Handles data conflicts between local and server state
 */

import { Middleware, isAnyOf } from '@reduxjs/toolkit';
import { RootState } from '../index';

// Conflict resolution strategies
enum ConflictResolutionStrategy {
  CLIENT_WINS = 'client_wins',
  SERVER_WINS = 'server_wins',
  MERGE = 'merge',
  MANUAL = 'manual',
  TIMESTAMP = 'timestamp',
  VERSION = 'version',
}

// Conflict types
interface DataConflict {
  id: string;
  type: 'game_state' | 'user_profile' | 'achievements' | 'social_data';
  localData: any;
  serverData: any;
  localTimestamp: number;
  serverTimestamp: number;
  localVersion?: number;
  serverVersion?: number;
  strategy: ConflictResolutionStrategy;
  resolved: boolean;
  resolution?: any;
}

// Conflict resolution manager
class ConflictResolutionManager {
  private conflicts = new Map<string, DataConflict>();
  private resolutionStrategies = new Map<string, ConflictResolutionStrategy>();

  constructor() {
    // Default strategies for different data types
    this.resolutionStrategies.set('game_state', ConflictResolutionStrategy.TIMESTAMP);
    this.resolutionStrategies.set('user_profile', ConflictResolutionStrategy.MERGE);
    this.resolutionStrategies.set('achievements', ConflictResolutionStrategy.SERVER_WINS);
    this.resolutionStrategies.set('social_data', ConflictResolutionStrategy.TIMESTAMP);
  }

  detectConflict(
    type: string,
    localData: any,
    serverData: any,
    localTimestamp: number,
    serverTimestamp: number,
    localVersion?: number,
    serverVersion?: number
  ): DataConflict | null {
    // Check if there's actually a conflict
    if (this.isDataEqual(localData, serverData)) {
      return null;
    }

    // Check version-based conflicts
    if (localVersion !== undefined && serverVersion !== undefined) {
      if (localVersion === serverVersion) {
        return null; // Same version, no conflict
      }
    }

    // Check timestamp-based conflicts
    const timeDiff = Math.abs(localTimestamp - serverTimestamp);
    if (timeDiff < 1000) { // Less than 1 second difference
      return null; // Too close to be a real conflict
    }

    const conflictId = `${type}_${Date.now()}_${Math.random()}`;
    const strategy = this.resolutionStrategies.get(type) || ConflictResolutionStrategy.TIMESTAMP;

    const conflict: DataConflict = {
      id: conflictId,
      type: type as any,
      localData,
      serverData,
      localTimestamp,
      serverTimestamp,
      localVersion,
      serverVersion,
      strategy,
      resolved: false,
    };

    this.conflicts.set(conflictId, conflict);
    return conflict;
  }

  resolveConflict(conflictId: string): any {
    const conflict = this.conflicts.get(conflictId);
    if (!conflict || conflict.resolved) {
      return null;
    }

    let resolution: any;

    switch (conflict.strategy) {
      case ConflictResolutionStrategy.CLIENT_WINS:
        resolution = conflict.localData;
        break;

      case ConflictResolutionStrategy.SERVER_WINS:
        resolution = conflict.serverData;
        break;

      case ConflictResolutionStrategy.TIMESTAMP:
        resolution = conflict.localTimestamp > conflict.serverTimestamp 
          ? conflict.localData 
          : conflict.serverData;
        break;

      case ConflictResolutionStrategy.VERSION:
        if (conflict.localVersion !== undefined && conflict.serverVersion !== undefined) {
          resolution = conflict.localVersion > conflict.serverVersion 
            ? conflict.localData 
            : conflict.serverData;
        } else {
          // Fallback to timestamp
          resolution = conflict.localTimestamp > conflict.serverTimestamp 
            ? conflict.localData 
            : conflict.serverData;
        }
        break;

      case ConflictResolutionStrategy.MERGE:
        resolution = this.mergeData(conflict.localData, conflict.serverData, conflict.type);
        break;

      case ConflictResolutionStrategy.MANUAL:
        // Return conflict for manual resolution
        return conflict;

      default:
        resolution = conflict.serverData; // Default to server
    }

    conflict.resolved = true;
    conflict.resolution = resolution;
    this.conflicts.set(conflictId, conflict);

    return resolution;
  }

  private isDataEqual(data1: any, data2: any): boolean {
    try {
      return JSON.stringify(data1) === JSON.stringify(data2);
    } catch {
      return data1 === data2;
    }
  }

  private mergeData(localData: any, serverData: any, type: string): any {
    switch (type) {
      case 'user_profile':
        return this.mergeUserProfile(localData, serverData);
      
      case 'game_state':
        return this.mergeGameState(localData, serverData);
      
      case 'achievements':
        return this.mergeAchievements(localData, serverData);
      
      case 'social_data':
        return this.mergeSocialData(localData, serverData);
      
      default:
        // Default merge strategy: prefer server data but keep local timestamps if newer
        return {
          ...serverData,
          ...Object.keys(localData).reduce((acc, key) => {
            if (key.includes('timestamp') || key.includes('updatedAt')) {
              const localTime = new Date(localData[key]).getTime();
              const serverTime = new Date(serverData[key]).getTime();
              acc[key] = localTime > serverTime ? localData[key] : serverData[key];
            }
            return acc;
          }, {} as any),
        };
    }
  }

  private mergeUserProfile(local: any, server: any): any {
    return {
      ...server,
      // Prefer local data for user preferences
      preferences: {
        ...server.preferences,
        ...local.preferences,
      },
      // Prefer server data for stats but merge arrays
      achievements: [...new Set([...(server.achievements || []), ...(local.achievements || [])])],
      // Use latest timestamps
      lastPlayDate: new Date(Math.max(
        new Date(local.lastPlayDate || 0).getTime(),
        new Date(server.lastPlayDate || 0).getTime()
      )).toISOString(),
    };
  }

  private mergeGameState(local: any, server: any): any {
    // For game state, prefer the most recent complete session
    if (local.isCompleted && !server.isCompleted) {
      return local;
    }
    if (!local.isCompleted && server.isCompleted) {
      return server;
    }
    
    // Both completed or both incomplete, use highest score
    return local.score > server.score ? local : server;
  }

  private mergeAchievements(local: any, server: any): any {
    // Merge achievement arrays, preferring server data but including local unlocks
    const localAchievements = Array.isArray(local) ? local : local.achievements || [];
    const serverAchievements = Array.isArray(server) ? server : server.achievements || [];
    
    const merged = new Map();
    
    // Add server achievements
    serverAchievements.forEach((achievement: any) => {
      merged.set(achievement.id, achievement);
    });
    
    // Add local achievements that might not be on server yet
    localAchievements.forEach((achievement: any) => {
      if (!merged.has(achievement.id)) {
        merged.set(achievement.id, achievement);
      }
    });
    
    return Array.from(merged.values());
  }

  private mergeSocialData(local: any, server: any): any {
    return {
      ...server,
      // Merge posts arrays
      posts: this.mergePosts(local.posts || [], server.posts || []),
      // Merge friends arrays
      friends: this.mergeFriends(local.friends || [], server.friends || []),
      // Use latest interaction timestamps
      lastInteraction: new Date(Math.max(
        new Date(local.lastInteraction || 0).getTime(),
        new Date(server.lastInteraction || 0).getTime()
      )).toISOString(),
    };
  }

  private mergePosts(localPosts: any[], serverPosts: any[]): any[] {
    const merged = new Map();
    
    // Add server posts
    serverPosts.forEach(post => merged.set(post.id, post));
    
    // Add local posts that might not be on server
    localPosts.forEach(post => {
      if (!merged.has(post.id)) {
        merged.set(post.id, post);
      } else {
        // Merge post data, preferring server but keeping local interactions
        const serverPost = merged.get(post.id);
        merged.set(post.id, {
          ...serverPost,
          liked: post.liked !== undefined ? post.liked : serverPost.liked,
          localLikesCount: post.likesCount,
        });
      }
    });
    
    return Array.from(merged.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  private mergeFriends(localFriends: any[], serverFriends: any[]): any[] {
    const merged = new Map();
    
    serverFriends.forEach(friend => merged.set(friend.id, friend));
    localFriends.forEach(friend => {
      if (!merged.has(friend.id)) {
        merged.set(friend.id, friend);
      }
    });
    
    return Array.from(merged.values());
  }

  getConflicts(): DataConflict[] {
    return Array.from(this.conflicts.values());
  }

  getUnresolvedConflicts(): DataConflict[] {
    return Array.from(this.conflicts.values()).filter(c => !c.resolved);
  }

  removeConflict(conflictId: string): void {
    this.conflicts.delete(conflictId);
  }

  setStrategy(dataType: string, strategy: ConflictResolutionStrategy): void {
    this.resolutionStrategies.set(dataType, strategy);
  }
}

const conflictManager = new ConflictResolutionManager();

// Middleware
export const conflictResolutionMiddleware: Middleware<{}, RootState> = 
  (store) => (next) => (action) => {
    // Handle data sync actions that might have conflicts
    if (action.type.includes('fulfilled') && action.payload) {
      const state = store.getState();
      
      // Check for conflicts based on action type
      if (action.type.includes('gameApi')) {
        handleGameDataConflict(action, state);
      } else if (action.type.includes('userApi')) {
        handleUserDataConflict(action, state);
      } else if (action.type.includes('socialApi')) {
        handleSocialDataConflict(action, state);
      }
    }
    
    // Handle conflict resolution actions
    if (action.type === 'conflicts/resolve') {
      const { conflictId } = action.payload;
      const resolution = conflictManager.resolveConflict(conflictId);
      
      if (resolution && typeof resolution === 'object' && !resolution.id) {
        // Auto-resolved, dispatch update action
        store.dispatch({
          type: 'conflicts/resolved',
          payload: { conflictId, resolution },
        });
      }
    }
    
    return next(action);
  };

function handleGameDataConflict(action: any, state: RootState): void {
  const serverData = action.payload;
  const localData = state.game;
  
  const conflict = conflictManager.detectConflict(
    'game_state',
    localData,
    serverData,
    localData.updatedAt || Date.now(),
    new Date(serverData.updatedAt || Date.now()).getTime(),
    localData.version,
    serverData.version
  );
  
  if (conflict) {
    // Dispatch conflict detected action
    store.dispatch({
      type: 'conflicts/detected',
      payload: conflict,
    });
  }
}

function handleUserDataConflict(action: any, state: RootState): void {
  const serverData = action.payload;
  const localData = state.user;
  
  const conflict = conflictManager.detectConflict(
    'user_profile',
    localData,
    serverData,
    localData.updatedAt || Date.now(),
    new Date(serverData.updatedAt || Date.now()).getTime()
  );
  
  if (conflict) {
    store.dispatch({
      type: 'conflicts/detected',
      payload: conflict,
    });
  }
}

function handleSocialDataConflict(action: any, state: RootState): void {
  const serverData = action.payload;
  const localData = state.social;
  
  const conflict = conflictManager.detectConflict(
    'social_data',
    localData,
    serverData,
    localData.lastInteraction || Date.now(),
    new Date(serverData.lastInteraction || Date.now()).getTime()
  );
  
  if (conflict) {
    store.dispatch({
      type: 'conflicts/detected',
      payload: conflict,
    });
  }
}

// Export utilities
export const conflictResolutionUtils = {
  getConflicts: () => conflictManager.getConflicts(),
  getUnresolvedConflicts: () => conflictManager.getUnresolvedConflicts(),
  resolveConflict: (conflictId: string) => conflictManager.resolveConflict(conflictId),
  setStrategy: (dataType: string, strategy: ConflictResolutionStrategy) => 
    conflictManager.setStrategy(dataType, strategy),
};

export { ConflictResolutionStrategy };
export default conflictResolutionMiddleware;