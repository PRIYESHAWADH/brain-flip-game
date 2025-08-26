/**
 * Ultimate Brain Flip Experience - Game State Machine
 * XState implementation for formal state management
 */

import { createMachine, assign, interpret } from 'xstate';
import { GameState, GameEvent, GameStateData, createInitialState } from '@/types/gameState';
import { Instruction } from '@/types/game';
import { generateInstruction } from '@/utils/gameLogic';
import { calculateScore } from '@/utils/scoring';

// State machine context
interface GameContext extends GameStateData {
  error?: string;
  retryCount: number;
  lastTransition?: {
    from: GameState;
    to: GameState;
    timestamp: number;
  };
}

// State machine events
type GameMachineEvent =
  | { type: 'START_GAME'; gameMode: 'classic' | 'sudden-death' | 'duel' }
  | { type: 'GAME_READY' }
  | { type: 'PAUSE_GAME' }
  | { type: 'RESUME_GAME' }
  | { type: 'SUBMIT_ANSWER'; answer: string; reactionTime: number }
  | { type: 'TIME_UP' }
  | { type: 'LIVES_EXHAUSTED' }
  | { type: 'END_GAME' }
  | { type: 'RESET_GAME' }
  | { type: 'ERROR_OCCURRED'; error: string }
  | { type: 'RECOVER_FROM_ERROR' }
  | { type: 'GENERATE_INSTRUCTION' }
  | { type: 'UPDATE_TIMER'; timeLeft: number };

// Guards
const hasLivesRemaining = (context: GameContext) => {
  const maxLives = context.gameMode === 'sudden-death' ? 1 : 
                   context.gameMode === 'duel' ? 2 : 3;
  return context.mistakes < maxLives;
};

const hasTimeRemaining = (context: GameContext) => {
  return context.timeRemaining > 0;
};

const shouldEndGame = (context: GameContext) => {
  return !hasLivesRemaining(context) || !hasTimeRemaining(context);
};

// Actions
const initializeGame = assign<GameContext, GameMachineEvent>({
  ...createInitialState(),
  retryCount: 0,
  gameStartTime: () => performance.now(),
  updatedAt: () => performance.now(),
});

const setGameMode = assign<GameContext, GameMachineEvent>({
  gameMode: (_, event) => event.type === 'START_GAME' ? event.gameMode : 'classic',
});

const generateNewInstruction = assign<GameContext, GameMachineEvent>({
  currentInstruction: (context) => {
    try {
      const previousInstructions = context.currentInstruction ? [context.currentInstruction] : [];
      return generateInstruction(context.level, previousInstructions);
    } catch (error) {
      console.error('Error generating instruction:', error);
      return null;
    }
  },
  timeRemaining: (context) => context.roundTimeLimit,
  updatedAt: () => performance.now(),
});

const processAnswer = assign<GameContext, GameMachineEvent>((context, event) => {
  if (event.type !== 'SUBMIT_ANSWER' || !context.currentInstruction) {
    return context;
  }

  const { answer, reactionTime } = event;
  const instruction = context.currentInstruction;
  
  // Check if answer is correct
  const isCorrect = instruction.acceptableAnswers?.includes(answer) || false;
  const withinTimeLimit = reactionTime <= context.roundTimeLimit;
  const answerValid = isCorrect && withinTimeLimit;

  // Calculate new state
  const newStreak = answerValid ? context.streak + 1 : 0;
  const newMistakes = answerValid ? context.mistakes : context.mistakes + 1;
  const newLevel = answerValid ? Math.floor(context.level + (newStreak / 5)) : context.level;
  
  // Calculate score
  const scoreGain = answerValid ? calculateScore({
    reactionTime,
    timeLimit: context.roundTimeLimit,
    streak: newStreak,
    level: newLevel,
    graceWindow: 75
  }).finalScore : 0;

  const newScore = context.score + scoreGain;
  const newTotalReactionTime = context.totalReactionTime + reactionTime;

  return {
    ...context,
    score: newScore,
    streak: newStreak,
    level: newLevel,
    mistakes: newMistakes,
    totalReactionTime: newTotalReactionTime,
    lastReactionTime: reactionTime,
    lastFailReason: !isCorrect ? 'wrong' : !withinTimeLimit ? 'time' : undefined,
    lastFailDetail: !isCorrect 
      ? `Expected one of: ${instruction.acceptableAnswers?.join(', ')}` 
      : !withinTimeLimit ? `Too slow: ${Math.round(reactionTime)}ms` : undefined,
    updatedAt: performance.now(),
  };
});

const updateTimer = assign<GameContext, GameMachineEvent>({
  timeRemaining: (_, event) => event.type === 'UPDATE_TIMER' ? event.timeLeft : 0,
  updatedAt: () => performance.now(),
});

const setError = assign<GameContext, GameMachineEvent>({
  lastError: (_, event) => event.type === 'ERROR_OCCURRED' ? event.error : undefined,
  retryCount: (context) => context.retryCount + 1,
  updatedAt: () => performance.now(),
});

const clearError = assign<GameContext, GameMachineEvent>({
  lastError: undefined,
  retryCount: 0,
  updatedAt: () => performance.now(),
});

const recordTransition = assign<GameContext, GameMachineEvent>({
  lastTransition: (context, _, { state }) => ({
    from: context.currentState,
    to: state.value as GameState,
    timestamp: performance.now(),
  }),
  currentState: (_, __, { state }) => state.value as GameState,
  updatedAt: () => performance.now(),
});

// Game State Machine Definition
export const gameStateMachine = createMachine<GameContext, GameMachineEvent>(
  {
    id: 'brainFlipGame',
    initial: 'idle',
    context: {
      ...createInitialState(),
      retryCount: 0,
    } as GameContext,
    states: {
      idle: {
        entry: ['recordTransition'],
        on: {
          START_GAME: {
            target: 'starting',
            actions: ['initializeGame', 'setGameMode'],
          },
          ERROR_OCCURRED: {
            target: 'error',
            actions: ['setError'],
          },
        },
      },
      starting: {
        entry: ['recordTransition'],
        invoke: {
          id: 'initializeGameSession',
          src: 'initializeGameSession',
          onDone: {
            target: 'active',
            actions: ['generateNewInstruction'],
          },
          onError: {
            target: 'error',
            actions: ['setError'],
          },
        },
        on: {
          GAME_READY: {
            target: 'active',
            actions: ['generateNewInstruction'],
          },
          ERROR_OCCURRED: {
            target: 'error',
            actions: ['setError'],
          },
        },
      },
      active: {
        entry: ['recordTransition'],
        on: {
          SUBMIT_ANSWER: [
            {
              target: 'ending',
              cond: 'shouldEndGameAfterAnswer',
              actions: ['processAnswer'],
            },
            {
              target: 'active',
              actions: ['processAnswer', 'generateNewInstruction'],
            },
          ],
          PAUSE_GAME: {
            target: 'paused',
          },
          TIME_UP: {
            target: 'ending',
          },
          LIVES_EXHAUSTED: {
            target: 'ending',
          },
          END_GAME: {
            target: 'ending',
          },
          UPDATE_TIMER: {
            actions: ['updateTimer'],
          },
          GENERATE_INSTRUCTION: {
            actions: ['generateNewInstruction'],
          },
          ERROR_OCCURRED: {
            target: 'error',
            actions: ['setError'],
          },
        },
      },
      paused: {
        entry: ['recordTransition'],
        on: {
          RESUME_GAME: {
            target: 'active',
          },
          END_GAME: {
            target: 'ending',
          },
          ERROR_OCCURRED: {
            target: 'error',
            actions: ['setError'],
          },
        },
      },
      ending: {
        entry: ['recordTransition'],
        invoke: {
          id: 'finalizeGameSession',
          src: 'finalizeGameSession',
          onDone: {
            target: 'gameOver',
          },
          onError: {
            target: 'error',
            actions: ['setError'],
          },
        },
        on: {
          ERROR_OCCURRED: {
            target: 'error',
            actions: ['setError'],
          },
        },
      },
      gameOver: {
        entry: ['recordTransition'],
        on: {
          RESET_GAME: {
            target: 'idle',
            actions: ['initializeGame'],
          },
          START_GAME: {
            target: 'starting',
            actions: ['initializeGame', 'setGameMode'],
          },
          ERROR_OCCURRED: {
            target: 'error',
            actions: ['setError'],
          },
        },
      },
      error: {
        entry: ['recordTransition'],
        on: {
          RECOVER_FROM_ERROR: [
            {
              target: 'idle',
              cond: (context) => context.retryCount < 3,
              actions: ['clearError'],
            },
            {
              target: 'idle',
              actions: ['clearError', 'initializeGame'],
            },
          ],
          RESET_GAME: {
            target: 'idle',
            actions: ['clearError', 'initializeGame'],
          },
        },
      },
    },
  },
  {
    actions: {
      initializeGame,
      setGameMode,
      generateNewInstruction,
      processAnswer,
      updateTimer,
      setError,
      clearError,
      recordTransition,
    },
    guards: {
      hasLivesRemaining,
      hasTimeRemaining,
      shouldEndGame,
      shouldEndGameAfterAnswer: (context, event) => {
        if (event.type !== 'SUBMIT_ANSWER') return false;
        
        // Simulate processing the answer to check if game should end
        const instruction = context.currentInstruction;
        if (!instruction) return true;
        
        const isCorrect = instruction.acceptableAnswers?.includes(event.answer) || false;
        const withinTimeLimit = event.reactionTime <= context.roundTimeLimit;
        const answerValid = isCorrect && withinTimeLimit;
        
        const newMistakes = answerValid ? context.mistakes : context.mistakes + 1;
        const maxLives = context.gameMode === 'sudden-death' ? 1 : 
                        context.gameMode === 'duel' ? 2 : 3;
        
        return newMistakes >= maxLives;
      },
    },
    services: {
      initializeGameSession: async (context) => {
        // Initialize game session with AI personalization
        try {
          // This would typically make API calls to initialize the session
          await new Promise(resolve => setTimeout(resolve, 100));
          return { success: true };
        } catch (error) {
          throw new Error(`Failed to initialize game session: ${error}`);
        }
      },
      finalizeGameSession: async (context) => {
        // Finalize game session and save results
        try {
          // This would typically make API calls to save the session
          await new Promise(resolve => setTimeout(resolve, 100));
          return { success: true };
        } catch (error) {
          throw new Error(`Failed to finalize game session: ${error}`);
        }
      },
    },
  }
);

// State machine service
export const gameStateMachineService = interpret(gameStateMachine);

// Utility functions
export const startGameStateMachine = () => {
  if (!gameStateMachineService.initialized) {
    gameStateMachineService.start();
  }
  return gameStateMachineService;
};

export const stopGameStateMachine = () => {
  if (gameStateMachineService.initialized) {
    gameStateMachineService.stop();
  }
};

// Selectors
export const selectGameState = (state: any) => state.gameStateMachine;
export const selectCurrentGameState = (state: any) => state.gameStateMachine.value;
export const selectGameContext = (state: any) => state.gameStateMachine.context;
export const selectCanTransition = (state: any, event: string) => 
  state.gameStateMachine.can(event);

// Action creators for Redux integration
export const gameStateMachineActions = {
  startGame: (gameMode: 'classic' | 'sudden-death' | 'duel') => ({
    type: 'gameStateMachine/START_GAME' as const,
    payload: { gameMode },
  }),
  gameReady: () => ({
    type: 'gameStateMachine/GAME_READY' as const,
  }),
  pauseGame: () => ({
    type: 'gameStateMachine/PAUSE_GAME' as const,
  }),
  resumeGame: () => ({
    type: 'gameStateMachine/RESUME_GAME' as const,
  }),
  submitAnswer: (answer: string, reactionTime: number) => ({
    type: 'gameStateMachine/SUBMIT_ANSWER' as const,
    payload: { answer, reactionTime },
  }),
  updateTimer: (timeLeft: number) => ({
    type: 'gameStateMachine/UPDATE_TIMER' as const,
    payload: { timeLeft },
  }),
  endGame: () => ({
    type: 'gameStateMachine/END_GAME' as const,
  }),
  resetGame: () => ({
    type: 'gameStateMachine/RESET_GAME' as const,
  }),
  errorOccurred: (error: string) => ({
    type: 'gameStateMachine/ERROR_OCCURRED' as const,
    payload: { error },
  }),
  recoverFromError: () => ({
    type: 'gameStateMachine/RECOVER_FROM_ERROR' as const,
  }),
};