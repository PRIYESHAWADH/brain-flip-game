/**
 * Ultimate Brain Flip Experience - Optimistic Updates Middleware
 * Handles optimistic updates with conflict resolution
 */

import { Middleware, isAnyOf } from '@reduxjs/toolkit';
import { RootState } from '../index';

// Types for optimistic updates
interface OptimisticUpdate {
  id: string;
  action: any;
  timestamp: number;
  rollbackAction?: any;
  confirmed: boolean;
  retryCount: number;
}

// Optimistic updates store
class OptimisticUpdatesManager {
  private updates = new Map<string, OptimisticUpdate>();
  private maxRetries = 3;
  private confirmationTimeout = 5000; // 5 seconds

  addUpdate(id: string, action: any, rollbackAction?: any): void {
    this.updates.set(id, {
      id,
      action,
      timestamp: Date.now(),
      rollbackAction,
      confirmed: false,
      retryCount: 0,
    });

    // Auto-cleanup after timeout
    setTimeout(() => {
      if (!this.updates.get(id)?.confirmed) {
        this.removeUpdate(id);
      }
    }, this.confirmationTimeout);
  }

  confirmUpdate(id: string): boolean {
    const update = this.updates.get(id);
    if (update) {
      update.confirmed = true;
      this.updates.delete(id);
      return true;
    }
    return false;
  }

  rollbackUpdate(id: string): any {
    const update = this.updates.get(id);
    if (update) {
      this.updates.delete(id);
      return update.rollbackAction;
    }
    return null;
  }

  retryUpdate(id: string): OptimisticUpdate | null {
    const update = this.updates.get(id);
    if (update && update.retryCount < this.maxRetries) {
      update.retryCount++;
      update.timestamp = Date.now();
      return update;
    }
    return null;
  }

  removeUpdate(id: string): void {
    this.updates.delete(id);
  }

  getPendingUpdates(): OptimisticUpdate[] {
    return Array.from(this.updates.values()).filter(update => !update.confirmed);
  }

  clear(): void {
    this.updates.clear();
  }
}

const optimisticManager = new OptimisticUpdatesManager();

// Actions that support optimistic updates
const optimisticActions = [
  'game/submitAnswer',
  'game/updateScore',
  'game/updateLevel',
  'battle/submitBattleAnswer',
  'social/likePost',
  'social/followUser',
  'achievements/unlockAchievement',
  'neuralAvatar/updateAvatar',
];

// Actions that confirm optimistic updates
const confirmationActions = [
  'gameApi/endpoints/updateGameSession/matchFulfilled',
  'gameApi/endpoints/completeGameSession/matchFulfilled',
  'battleApi/endpoints/submitAnswer/matchFulfilled',
  'socialApi/endpoints/likePost/matchFulfilled',
  'socialApi/endpoints/followUser/matchFulfilled',
];

// Actions that should rollback optimistic updates
const rollbackActions = [
  'gameApi/endpoints/updateGameSession/matchRejected',
  'gameApi/endpoints/completeGameSession/matchRejected',
  'battleApi/endpoints/submitAnswer/matchRejected',
  'socialApi/endpoints/likePost/matchRejected',
  'socialApi/endpoints/followUser/matchRejected',
];

export const optimisticUpdatesMiddleware: Middleware<{}, RootState> = 
  (store) => (next) => (action) => {
    const state = store.getState();
    
    // Handle optimistic updates
    if (optimisticActions.some(actionType => action.type.startsWith(actionType))) {
      const optimisticId = `${action.type}_${Date.now()}_${Math.random()}`;
      
      // Create rollback action
      const rollbackAction = createRollbackAction(action, state);
      
      // Add to optimistic updates
      optimisticManager.addUpdate(optimisticId, action, rollbackAction);
      
      // Add optimistic metadata to action
      const optimisticAction = {
        ...action,
        meta: {
          ...action.meta,
          optimistic: true,
          optimisticId,
          timestamp: Date.now(),
        },
      };
      
      // Dispatch optimistic action
      const result = next(optimisticAction);
      
      // Schedule API call for confirmation
      scheduleConfirmation(store, optimisticAction, optimisticId);
      
      return result;
    }
    
    // Handle confirmations
    if (isAnyOf(...confirmationActions.map(type => ({ type })))(action)) {
      const optimisticId = action.meta?.optimisticId;
      if (optimisticId) {
        optimisticManager.confirmUpdate(optimisticId);
      }
    }
    
    // Handle rollbacks
    if (isAnyOf(...rollbackActions.map(type => ({ type })))(action)) {
      const optimisticId = action.meta?.optimisticId;
      if (optimisticId) {
        const rollbackAction = optimisticManager.rollbackUpdate(optimisticId);
        if (rollbackAction) {
          // Dispatch rollback action
          store.dispatch({
            ...rollbackAction,
            meta: {
              ...rollbackAction.meta,
              rollback: true,
              originalOptimisticId: optimisticId,
            },
          });
        }
      }
    }
    
    return next(action);
  };

// Create rollback action based on the original action
function createRollbackAction(action: any, state: RootState): any {
  switch (action.type) {
    case 'game/submitAnswer':
      return {
        type: 'game/rollbackAnswer',
        payload: {
          previousScore: state.game.score,
          previousStreak: state.game.streak,
          previousLevel: state.game.level,
          previousMistakes: state.game.mistakes,
        },
      };
      
    case 'game/updateScore':
      return {
        type: 'game/rollbackScore',
        payload: {
          previousScore: state.game.score,
        },
      };
      
    case 'battle/submitBattleAnswer':
      return {
        type: 'battle/rollbackBattleAnswer',
        payload: {
          previousScore: state.battle.currentBattle?.playerScore || 0,
          previousAnswers: state.battle.currentBattle?.playerAnswers || [],
        },
      };
      
    case 'social/likePost':
      return {
        type: 'social/rollbackLikePost',
        payload: {
          postId: action.payload.postId,
          previousLiked: state.social.posts.find(p => p.id === action.payload.postId)?.liked || false,
          previousLikesCount: state.social.posts.find(p => p.id === action.payload.postId)?.likesCount || 0,
        },
      };
      
    case 'achievements/unlockAchievement':
      return {
        type: 'achievements/rollbackUnlockAchievement',
        payload: {
          achievementId: action.payload.achievementId,
        },
      };
      
    default:
      return null;
  }
}

// Schedule confirmation API call
function scheduleConfirmation(store: any, action: any, optimisticId: string): void {
  // This would typically trigger the appropriate API call
  // For now, we'll simulate with a timeout
  setTimeout(() => {
    // Simulate API success/failure
    const success = Math.random() > 0.1; // 90% success rate
    
    if (success) {
      optimisticManager.confirmUpdate(optimisticId);
    } else {
      // Retry logic
      const update = optimisticManager.retryUpdate(optimisticId);
      if (update) {
        // Retry the update
        scheduleConfirmation(store, update.action, optimisticId);
      } else {
        // Max retries reached, rollback
        const rollbackAction = optimisticManager.rollbackUpdate(optimisticId);
        if (rollbackAction) {
          store.dispatch({
            ...rollbackAction,
            meta: {
              ...rollbackAction.meta,
              rollback: true,
              reason: 'max_retries_exceeded',
            },
          });
        }
      }
    }
  }, 1000 + Math.random() * 2000); // 1-3 second delay
}

// Utility functions for components
export const optimisticUpdatesUtils = {
  getPendingUpdates: () => optimisticManager.getPendingUpdates(),
  
  hasPendingUpdate: (actionType: string) => {
    return optimisticManager.getPendingUpdates().some(
      update => update.action.type.startsWith(actionType)
    );
  },
  
  clearPendingUpdates: () => optimisticManager.clear(),
  
  getUpdateStatus: (optimisticId: string) => {
    const updates = optimisticManager.getPendingUpdates();
    const update = updates.find(u => u.id === optimisticId);
    
    if (!update) return 'confirmed';
    if (update.retryCount > 0) return 'retrying';
    return 'pending';
  },
};

export default optimisticUpdatesMiddleware;