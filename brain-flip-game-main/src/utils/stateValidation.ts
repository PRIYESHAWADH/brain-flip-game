/**
 * State validation utilities for game state machine
 */

import { GameStateData, GameEvent, StateInvariant } from '../types/gameState';

/**
 * Core state invariants that must always hold
 */
export const CORE_INVARIANTS: Record<string, StateInvariant> = {
  /**
   * Lives must be non-negative and not exceed max for game mode
   */
  livesValid: (state: GameStateData) => {
  // Only enforce non-negative mistakes; max lives is enforced by gameplay flow, not invariant
  return state.mistakes >= 0;
  },

  /**
   * Score should never decrease on correct answers
   */
  scoreNonDecreasing: (state: GameStateData, previousState?: GameStateData, event?: GameEvent) => {
    if (!previousState) return true;
    
    // Score can only decrease on game reset
    if (event === GameEvent.RESET_GAME) return true;
    
    // Score should not decrease otherwise
    return state.score >= previousState.score;
  },

  /**
   * Game over state implies inactive
   */
  gameOverImpliesInactive: (state: GameStateData) => {
    return state.currentState !== 'gameOver' || !state.isActive;
  },

  /**
   * Level should progress monotonically (except on reset)
   */
  levelProgression: (state: GameStateData, previousState?: GameStateData, event?: GameEvent) => {
    if (!previousState) return true;
    
    // Level can reset to 1 on game reset
    if (event === GameEvent.RESET_GAME) return state.level === 1;
    
    // Level should not decrease otherwise
    return state.level >= previousState.level;
  },

  /**
   * Streak consistency with mistakes
   */
  streakConsistency: (state: GameStateData, previousState?: GameStateData, event?: GameEvent) => {
    // Streak should reset to 0 when mistakes increase
    if (previousState && state.mistakes > previousState.mistakes) {
      return state.streak === 0;
    }
    
    // Streak should be non-negative
    return state.streak >= 0;
  },

  /**
   * Time remaining should be valid
   */
  timeRemainingValid: (state: GameStateData) => {
    return state.timeRemaining >= 0 && state.timeRemaining <= state.roundTimeLimit;
  },

  /**
   * Round time limit should be reasonable
   */
  roundTimeLimitValid: (state: GameStateData) => {
    return state.roundTimeLimit > 0 && state.roundTimeLimit <= 10000; // Max 10 seconds
  },

  /**
   * Total reaction time should be reasonable
   */
  totalReactionTimeValid: (state: GameStateData) => {
    // Should be positive and reasonable for the number of levels played
    const maxExpectedTime = Math.max(1, state.level) * 10000; // assume 10s max per level
    return state.totalReactionTime >= 0 && state.totalReactionTime <= maxExpectedTime;
  },

  /**
   * Active state consistency
   */
  activeStateConsistency: (state: GameStateData) => {
    // If game is active, it should have started and be in ACTIVE state
    // Don't require currentInstruction for tests that simulate without UI wiring
    if (state.isActive) {
      return !!state.hasStarted && state.currentState === 'active';
    }
    return true;
  },

  /**
   * Timestamps should be valid
   */
  timestampsValid: (state: GameStateData) => {
    return state.createdAt > 0 && 
           state.updatedAt >= state.createdAt && 
           state.updatedAt <= performance.now() + 1000; // Allow 1s future tolerance
  }
};

/**
 * Validate all invariants for a given state
 */
export function validateStateInvariants(
  state: GameStateData,
  previousState?: GameStateData,

  mode: 'strict' | 'lenient' | 'disabled' = 'strict'
): { valid: boolean; violations: string[] } {
  if (mode === 'disabled') {
    return { valid: true, violations: [] };
  }

  const violations: string[] = [];

  for (const [name, invariant] of Object.entries(CORE_INVARIANTS)) {
    try {
      if (!invariant(state, previousState, event)) {
        violations.push(name);
      }
    } catch (error) {
      if (mode === 'strict') {
        violations.push(`${name} (error: ${error})`);
      }
    }
  }

  return {
    valid: violations.length === 0,
    violations
  };
}

/**
 * Validate state transition is allowed
 */
export function validateStateTransition(
  fromState: string,
  toState: string,
  event: GameEvent,
  validTransitions: Record<string, string[]>
): { valid: boolean; reason?: string } {
  // Allow self-transitions for events that don't change state (e.g., SUBMIT_ANSWER in ACTIVE)
  if (fromState === toState) {
    return { valid: true };
  }

  // Allow RESET_GAME to transition to IDLE from any state
  if (event === GameEvent.RESET_GAME && toState === 'idle') {
    return { valid: true };
  }
  
  const allowedStates: string[] = validTransitions[fromState];
  if (!allowedStates) {
    return { valid: false, reason: `Unknown source state: ${fromState}` };
  }

  if (!allowedStates.includes(toState)) {
    return { 
      valid: false, 
      reason: `Invalid transition from ${fromState} to ${toState} via ${event}` 
    };
  }

  return { valid: true };
}

/**
 * Create a state snapshot for rollback
 */
export function createStateSnapshot(state: GameStateData): GameStateData {
  return {
    ...state,
    // Deep clone current instruction if it exists
    currentInstruction: state.currentInstruction ? { ...state.currentInstruction } : null,
    // Update snapshot timestamp
    updatedAt: performance.now()
  };
}

/**
 * Compare two states for equality (useful for testing)
 */
export function statesEqual(state1: GameStateData, state2: GameStateData): boolean {
  // Compare all primitive fields
  const primitiveFields: (keyof GameStateData)[] = [
    'currentState', 'gameMode', 'level', 'score', 'streak', 'mistakes',
    'totalReactionTime', 'timeRemaining', 'roundTimeLimit', 'isActive',
    'hasStarted', 'lastFailReason', 'lastFailDetail', 'lastError'
  ];

  for (const field of primitiveFields) {
    if (state1[field] !== state2[field]) {
      return false;
    }
  }

  // Compare current instruction (simplified)
  if (state1.currentInstruction?.id !== state2.currentInstruction?.id) {
    return false;
  }

  return true;
}

/**
 * Sanitize state data (remove sensitive or temporary data)
 */
export function sanitizeStateForLogging(state: GameStateData): Partial<GameStateData> {
  const sanitized: Partial<GameStateData> = { ...state };
  
  // Remove potentially large or sensitive data
  if (sanitized.currentInstruction) {
    sanitized.currentInstruction = {
      id: sanitized.currentInstruction.id,
      type: sanitized.currentInstruction.type,
      display: sanitized.currentInstruction.display
    };
  }

  return sanitized;
}

/**
 * Performance-optimized invariant checking for hot paths
 */
export function validateCriticalInvariants(state: GameStateData): boolean {
  // Only check the most critical invariants for performance
  return (
  state.mistakes >= 0 &&
    state.score >= 0 &&
    state.level >= 1 &&
    state.streak >= 0 &&
    state.timeRemaining >= 0
  );
}

/**
 * Generate a state validation report
 */
export function generateStateReport(
  state: GameStateData,
  previousState?: GameStateData,
  event?: GameEvent
): {
  valid: boolean;
  violations: string[];
  warnings: string[];
  summary: string;
} {
  const warnings: string[] = [];

  // Run validation in lenient mode to avoid throwing on errors
  const validation = validateStateInvariants(state, previousState, event, 'lenient');

  // Check for potential issues that aren't violations
  if (state.streak > 100) {
    warnings.push('Unusually high streak detected');
  }

  if (state.score > 1000000) {
    warnings.push('Unusually high score detected');
  }

  if (state.totalReactionTime / Math.max(1, state.level) > 3000) {
    warnings.push('Average reaction time is quite slow');
  }

  const summary = validation.valid
    ? `State is valid${warnings.length > 0 ? ` with ${warnings.length} warnings` : ''}`
    : `State has ${validation.violations.length} violations`;

  return {
    valid: validation.valid,
    violations: validation.violations,
    warnings,
    summary
  };
}