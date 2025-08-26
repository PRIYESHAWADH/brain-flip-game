/**
 * Enhanced game state types for formal state machine
 */

// Game state enumeration
export enum GameState {
  IDLE = 'idle',           // Not started, menu visible
  STARTING = 'starting',   // Initializing game
  ACTIVE = 'active',       // Playing, instruction visible
  PAUSED = 'paused',       // Game paused
  ENDING = 'ending',       // Processing game end
  GAME_OVER = 'gameOver',  // Game finished, results shown
  ERROR = 'error'          // Error state for recovery
}

// Game events that trigger state transitions
export enum GameEvent {
  START_GAME = 'START_GAME',
  GAME_READY = 'GAME_READY',
  PAUSE_GAME = 'PAUSE_GAME',
  RESUME_GAME = 'RESUME_GAME',
  SUBMIT_ANSWER = 'SUBMIT_ANSWER',
  TIME_UP = 'TIME_UP',
  LIVES_EXHAUSTED = 'LIVES_EXHAUSTED',
  END_GAME = 'END_GAME',
  RESET_GAME = 'RESET_GAME',
  ERROR_OCCURRED = 'ERROR_OCCURRED',
  RECOVER_FROM_ERROR = 'RECOVER_FROM_ERROR'
}

// Enhanced game state data
export interface GameStateData {
  // Core game state
  currentState: GameState;
  gameMode: 'classic' | 'sudden-death' | 'duel';
  
  // Game progress
  level: number;
  score: number;
  streak: number;
  mistakes: number;
  totalReactionTime: number;
  
  // Timing
  timeRemaining: number;
  roundTimeLimit: number;
  gameStartTime?: number;
  
  // Current instruction
  currentInstruction: unknown | null; // Using any for now to avoid circular dependency
  
  // Game state flags
  isActive: boolean;
  hasStarted: boolean;
  
  // Error handling
  lastFailReason?: 'time' | 'wrong';
  lastFailDetail?: string;
  lastError?: string;
  
  // Metadata
  createdAt: number;
  updatedAt: number;
}

// State transition result
export interface StateTransitionResult {
  success: boolean;
  newState?: GameState;
  transaction?: StateTransaction;
  error?: string;
  rollbackData?: GameStateData;
}

// State transaction for logging and rollback
export interface StateTransaction {
  id: string;
  timestamp: number;
  event: GameEvent;
  payload?: unknown;
  previousState: GameState;
  newState: GameState;
  previousData: GameStateData;
  newData: GameStateData;
  rollbackData?: GameStateData;
  duration?: number; // Time taken for transition
}

// State machine configuration
export interface StateMachineConfig {
  enableLogging: boolean;
  enableValidation: boolean;
  maxTransactionHistory: number;
  enableRollback: boolean;
  validationMode: 'strict' | 'lenient' | 'disabled';
}

// State invariant function type
export type StateInvariant = (
  state: GameStateData, 
  previousState?: GameStateData, 
  event?: GameEvent
) => boolean;

// State guard function type (determines if transition is allowed)
export type StateGuard = (
  currentState: GameState,
  event: GameEvent,
  payload?: unknown,
  stateData?: GameStateData
) => boolean;

// State action function type (executes during transition)
export type StateAction = (
  event: GameEvent,
  payload?: unknown,
  currentData?: GameStateData
) => Partial<GameStateData>;

// Valid state transitions matrix
export const VALID_TRANSITIONS: Record<GameState, GameState[]> = {
  [GameState.IDLE]: [GameState.STARTING, GameState.ERROR],
  [GameState.STARTING]: [GameState.ACTIVE, GameState.ERROR],
  [GameState.ACTIVE]: [GameState.PAUSED, GameState.ENDING, GameState.ERROR],
  [GameState.PAUSED]: [GameState.ACTIVE, GameState.ENDING, GameState.ERROR],
  [GameState.ENDING]: [GameState.GAME_OVER, GameState.ERROR],
  [GameState.GAME_OVER]: [GameState.IDLE, GameState.ERROR],
  [GameState.ERROR]: [GameState.IDLE, GameState.ACTIVE, GameState.PAUSED]
};

// Event to state mapping
export const EVENT_STATE_MAP: Record<GameEvent, GameState> = {
  [GameEvent.START_GAME]: GameState.STARTING,
  [GameEvent.GAME_READY]: GameState.ACTIVE,
  [GameEvent.PAUSE_GAME]: GameState.PAUSED,
  [GameEvent.RESUME_GAME]: GameState.ACTIVE,
  [GameEvent.SUBMIT_ANSWER]: GameState.ACTIVE, // Usually stays active
  [GameEvent.TIME_UP]: GameState.ENDING,
  [GameEvent.LIVES_EXHAUSTED]: GameState.ENDING,
  [GameEvent.END_GAME]: GameState.ENDING,
  [GameEvent.RESET_GAME]: GameState.IDLE,
  [GameEvent.ERROR_OCCURRED]: GameState.ERROR,
  [GameEvent.RECOVER_FROM_ERROR]: GameState.IDLE
};

// Default state machine configuration
export const DEFAULT_STATE_MACHINE_CONFIG: StateMachineConfig = {
  enableLogging: true,
  enableValidation: true,
  maxTransactionHistory: 1000,
  enableRollback: true,
  validationMode: 'strict'
};

// Helper function to get max lives for game mode
export function getMaxLivesForMode(gameMode: GameStateData['gameMode']): number {
  switch (gameMode) {
    case 'sudden-death': return 1;
    case 'duel': return 2;
    case 'classic': return 3;
    default: return 3;
  }
}

// Helper function to create initial state
export function createInitialState(gameMode?: GameStateData['gameMode']): GameStateData {
  const now = performance.now();
  return {
    currentState: GameState.IDLE,
    gameMode: gameMode || 'classic',
    level: 1,
    score: 0,
    streak: 0,
    mistakes: 0,
    totalReactionTime: 0,
    timeRemaining: 3000,
    roundTimeLimit: 3000,
    currentInstruction: null,
    isActive: false,
    hasStarted: false,
    createdAt: now,
    updatedAt: now
  };
}