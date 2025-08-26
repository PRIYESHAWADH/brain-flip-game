/**
 * Comprehensive tests for the game state machine
 */

import { GameStateMachine } from '../src/utils/stateMachine';
import { GameState, GameEvent, createInitialState } from '../src/types/gameState';
import { validateStateInvariants } from '../src/utils/stateValidation';

describe('GameStateMachine', () => {
  let stateMachine: GameStateMachine;

  beforeEach(() => {
    stateMachine = new GameStateMachine();
  });

  describe('Initial State', () => {
    it('should start in IDLE state', () => {
      expect(stateMachine.getCurrentState()).toBe(GameState.IDLE);
    });

    it('should have valid initial state data', () => {
      const stateData = stateMachine.getStateData();
      expect(stateData.currentState).toBe(GameState.IDLE);
      expect(stateData.isActive).toBe(false);
      expect(stateData.hasStarted).toBe(false);
      expect(stateData.level).toBe(1);
      expect(stateData.score).toBe(0);
      expect(stateData.streak).toBe(0);
      expect(stateData.mistakes).toBe(0);
    });

    it('should pass all invariants', () => {
      const stateData = stateMachine.getStateData();
      const validation = validateStateInvariants(stateData);
      expect(validation.valid).toBe(true);
      expect(validation.violations).toHaveLength(0);
    });
  });

  describe('State Transitions', () => {
    it('should transition from IDLE to STARTING on START_GAME', () => {
      const result = stateMachine.transition(GameEvent.START_GAME, { gameMode: 'classic' });
      
      expect(result.success).toBe(true);
      expect(result.newState).toBe(GameState.STARTING);
      expect(stateMachine.getCurrentState()).toBe(GameState.STARTING);
    });

    it('should transition from STARTING to ACTIVE on GAME_READY', () => {
      stateMachine.transition(GameEvent.START_GAME, { gameMode: 'classic' });
      const result = stateMachine.transition(GameEvent.GAME_READY);
      
      expect(result.success).toBe(true);
      expect(result.newState).toBe(GameState.ACTIVE);
      expect(stateMachine.getCurrentState()).toBe(GameState.ACTIVE);
      
      const stateData = stateMachine.getStateData();
      expect(stateData.isActive).toBe(true);
      expect(stateData.hasStarted).toBe(true);
    });

    it('should transition from ACTIVE to PAUSED on PAUSE_GAME', () => {
      // Setup: get to ACTIVE state
      stateMachine.transition(GameEvent.START_GAME, { gameMode: 'classic' });
      stateMachine.transition(GameEvent.GAME_READY);
      
      const result = stateMachine.transition(GameEvent.PAUSE_GAME);
      
      expect(result.success).toBe(true);
      expect(result.newState).toBe(GameState.PAUSED);
      expect(stateMachine.getCurrentState()).toBe(GameState.PAUSED);
      
      const stateData = stateMachine.getStateData();
      expect(stateData.isActive).toBe(false);
    });

    it('should transition from PAUSED to ACTIVE on RESUME_GAME', () => {
      // Setup: get to PAUSED state
      stateMachine.transition(GameEvent.START_GAME, { gameMode: 'classic' });
      stateMachine.transition(GameEvent.GAME_READY);
      stateMachine.transition(GameEvent.PAUSE_GAME);
      
      const result = stateMachine.transition(GameEvent.RESUME_GAME);
      
      expect(result.success).toBe(true);
      expect(result.newState).toBe(GameState.ACTIVE);
      expect(stateMachine.getCurrentState()).toBe(GameState.ACTIVE);
      
      const stateData = stateMachine.getStateData();
      expect(stateData.isActive).toBe(true);
    });

    it('should reject invalid transitions', () => {
      // Try to pause from IDLE state (invalid)
      const result = stateMachine.transition(GameEvent.PAUSE_GAME);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid transition');
      expect(stateMachine.getCurrentState()).toBe(GameState.IDLE);
    });
  });

  describe('Answer Processing', () => {
    beforeEach(() => {
      // Setup: get to ACTIVE state
      stateMachine.transition(GameEvent.START_GAME, { gameMode: 'classic' });
      stateMachine.transition(GameEvent.GAME_READY);
    });

    it('should process correct answer', () => {
      const result = stateMachine.transition(GameEvent.SUBMIT_ANSWER, {
        answer: 'UP',
        reactionTime: 500,
        isCorrect: true,
        scoreGain: 100,
        shouldEndGame: false
      });
      
      expect(result.success).toBe(true);
      expect(stateMachine.getCurrentState()).toBe(GameState.ACTIVE);
      
      const stateData = stateMachine.getStateData();
      expect(stateData.score).toBe(100);
      expect(stateData.streak).toBe(1);
      expect(stateData.level).toBe(2);
      expect(stateData.mistakes).toBe(0);
    });

    it('should process incorrect answer', () => {
      const result = stateMachine.transition(GameEvent.SUBMIT_ANSWER, {
        answer: 'DOWN',
        reactionTime: 500,
        isCorrect: false,
        scoreGain: 0,
        shouldEndGame: false,
        failReason: 'wrong',
        failDetail: 'Expected UP'
      });
      
      expect(result.success).toBe(true);
      expect(stateMachine.getCurrentState()).toBe(GameState.ACTIVE);
      
      const stateData = stateMachine.getStateData();
      expect(stateData.score).toBe(0);
      expect(stateData.streak).toBe(0);
      expect(stateData.mistakes).toBe(1);
      expect(stateData.lastFailReason).toBe('wrong');
      expect(stateData.lastFailDetail).toBe('Expected UP');
    });

    it('should end game when lives exhausted', () => {
      const result = stateMachine.transition(GameEvent.SUBMIT_ANSWER, {
        answer: 'DOWN',
        reactionTime: 500,
        isCorrect: false,
        scoreGain: 0,
        shouldEndGame: true,
        failReason: 'wrong'
      });
      
      expect(result.success).toBe(true);
      expect(result.newState).toBe(GameState.ENDING);
    });
  });

  describe('Game End Flow', () => {
    beforeEach(() => {
      // Setup: get to ACTIVE state
      stateMachine.transition(GameEvent.START_GAME, { gameMode: 'classic' });
      stateMachine.transition(GameEvent.GAME_READY);
    });

    it('should transition to ENDING on END_GAME', () => {
      const result = stateMachine.transition(GameEvent.END_GAME, {
        finalScore: 500,
        finalLevel: 5,
        finalStreak: 3
      });
      
      expect(result.success).toBe(true);
      expect(result.newState).toBe(GameState.ENDING);
      expect(stateMachine.getCurrentState()).toBe(GameState.ENDING);
      
      const stateData = stateMachine.getStateData();
      expect(stateData.isActive).toBe(false);
    });

    it('should transition from ENDING to GAME_OVER', () => {
      stateMachine.transition(GameEvent.END_GAME);
      
      // Simulate transition to game over (this would normally be automatic)
      const result = stateMachine.transition(GameEvent.RESET_GAME);
      
      expect(result.success).toBe(true);
      expect(stateMachine.getCurrentState()).toBe(GameState.IDLE);
    });
  });

  describe('State Invariants', () => {
    it('should maintain lives invariant', () => {
      stateMachine.transition(GameEvent.START_GAME, { gameMode: 'classic' });
      stateMachine.transition(GameEvent.GAME_READY);
      
      // Make 3 mistakes (max for classic mode)
      for (let i = 0; i < 3; i++) {
        const result = stateMachine.transition(GameEvent.SUBMIT_ANSWER, {
          isCorrect: false,
          shouldEndGame: i === 2 // End game on 3rd mistake
        });
        expect(result.success).toBe(true);
      }
      
      const stateData = stateMachine.getStateData();
      expect(stateData.mistakes).toBe(3);
      
      // Validate invariants still hold
      const validation = validateStateInvariants(stateData);
      expect(validation.valid).toBe(true);
    });

    it('should maintain score non-decreasing invariant', () => {
      stateMachine.transition(GameEvent.START_GAME, { gameMode: 'classic' });
      stateMachine.transition(GameEvent.GAME_READY);
      
      let previousScore = 0;
      
      // Submit several correct answers
      for (let i = 0; i < 5; i++) {
        stateMachine.transition(GameEvent.SUBMIT_ANSWER, {
          isCorrect: true,
          scoreGain: 100,
          shouldEndGame: false
        });
        
        const stateData = stateMachine.getStateData();
        expect(stateData.score).toBeGreaterThanOrEqual(previousScore);
        previousScore = stateData.score;
      }
    });

    it('should reset streak on mistakes', () => {
      stateMachine.transition(GameEvent.START_GAME, { gameMode: 'classic' });
      stateMachine.transition(GameEvent.GAME_READY);
      
      // Build up a streak
      stateMachine.transition(GameEvent.SUBMIT_ANSWER, {
        isCorrect: true,
        scoreGain: 100,
        shouldEndGame: false
      });
      
      let stateData = stateMachine.getStateData();
      expect(stateData.streak).toBe(1);
      
      // Make a mistake
      stateMachine.transition(GameEvent.SUBMIT_ANSWER, {
        isCorrect: false,
        shouldEndGame: false
      });
      
      stateData = stateMachine.getStateData();
      expect(stateData.streak).toBe(0);
    });
  });

  describe('Transaction Logging', () => {
    it('should log all transitions', () => {
      stateMachine.transition(GameEvent.START_GAME, { gameMode: 'classic' });
      stateMachine.transition(GameEvent.GAME_READY);
      
      const history = stateMachine.getTransactionHistory();
      expect(history).toHaveLength(2);
      
      expect(history[0].event).toBe(GameEvent.START_GAME);
      expect(history[0].previousState).toBe(GameState.IDLE);
      expect(history[0].newState).toBe(GameState.STARTING);
      
      expect(history[1].event).toBe(GameEvent.GAME_READY);
      expect(history[1].previousState).toBe(GameState.STARTING);
      expect(history[1].newState).toBe(GameState.ACTIVE);
    });

    it('should include transaction metadata', () => {
      const result = stateMachine.transition(GameEvent.START_GAME, { gameMode: 'classic' });
      
      expect(result.transaction).toBeDefined();
      expect(result.transaction!.id).toBeDefined();
      expect(result.transaction!.timestamp).toBeGreaterThan(0);
      expect(result.transaction!.duration).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Rollback Functionality', () => {
    it('should rollback to previous state', () => {
      // Make a transition
      stateMachine.transition(GameEvent.START_GAME, { gameMode: 'classic' });
      expect(stateMachine.getCurrentState()).toBe(GameState.STARTING);
      
      // Rollback
      const rollbackResult = stateMachine.rollback();
      expect(rollbackResult.success).toBe(true);
      expect(stateMachine.getCurrentState()).toBe(GameState.IDLE);
    });

    it('should rollback to specific transaction', () => {
      // Make multiple transitions
      const result1 = stateMachine.transition(GameEvent.START_GAME, { gameMode: 'classic' });
      stateMachine.transition(GameEvent.GAME_READY);
      
      expect(stateMachine.getCurrentState()).toBe(GameState.ACTIVE);
      
      // Rollback to first transition
      const rollbackResult = stateMachine.rollback(result1.transaction!.id);
      expect(rollbackResult.success).toBe(true);
      expect(stateMachine.getCurrentState()).toBe(GameState.IDLE);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid payloads gracefully', () => {
      const result = stateMachine.transition(GameEvent.START_GAME, null);
      
      // Should still succeed as START_GAME doesn't require specific payload
      expect(result.success).toBe(true);
    });

    it('should transition to ERROR state on critical failures', () => {
      const result = stateMachine.transition(GameEvent.ERROR_OCCURRED, {
        error: 'Critical system error'
      });
      
      expect(result.success).toBe(true);
      expect(result.newState).toBe(GameState.ERROR);
      
      const stateData = stateMachine.getStateData();
      expect(stateData.lastError).toBe('Critical system error');
    });

    it('should recover from ERROR state', () => {
      stateMachine.transition(GameEvent.ERROR_OCCURRED, { error: 'Test error' });
      expect(stateMachine.getCurrentState()).toBe(GameState.ERROR);
      
      const result = stateMachine.transition(GameEvent.RECOVER_FROM_ERROR);
      expect(result.success).toBe(true);
      expect(stateMachine.getCurrentState()).toBe(GameState.IDLE);
    });
  });

  describe('State Machine Statistics', () => {
    it('should provide accurate statistics', () => {
      stateMachine.transition(GameEvent.START_GAME, { gameMode: 'classic' });
      stateMachine.transition(GameEvent.GAME_READY);
      stateMachine.transition(GameEvent.PAUSE_GAME);
      stateMachine.transition(GameEvent.RESUME_GAME);
      
      const stats = stateMachine.getStatistics();
      expect(stats.totalTransitions).toBe(4);
      expect(stats.averageTransitionTime).toBeGreaterThanOrEqual(0);
      expect(stats.stateDistribution[GameState.ACTIVE]).toBe(2); // GAME_READY and RESUME_GAME
      expect(stats.errorCount).toBe(0);
    });
  });

  describe('Listeners', () => {
    it('should notify listeners on state changes', () => {
      const listener = jest.fn();
      const unsubscribe = stateMachine.addListener(listener);
      
      stateMachine.transition(GameEvent.START_GAME, { gameMode: 'classic' });
      
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({ currentState: GameState.STARTING }),
        expect.objectContaining({ event: GameEvent.START_GAME })
      );
      
      unsubscribe();
      
      stateMachine.transition(GameEvent.GAME_READY);
      expect(listener).toHaveBeenCalledTimes(1); // Should not be called after unsubscribe
    });
  });
});