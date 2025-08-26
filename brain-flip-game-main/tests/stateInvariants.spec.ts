/**
 * Property-based tests for state machine invariants
 */

import { GameStateMachine } from '@/utils/stateMachine';
import { GameState, GameEvent, GameStateData } from '@/types/gameState';
import * as stateValidation from '@/utils/stateValidation';

describe('State Machine Invariants', () => {
  const PROPERTY_TEST_ITERATIONS = 1000;

  describe('Property-Based Invariant Testing', () => {
    it('should maintain all invariants across random state transitions', () => {
      let violationCount = 0;
      const violations: string[] = [];

      for (let i = 0; i < PROPERTY_TEST_ITERATIONS; i++) {
        const stateMachine = new GameStateMachine();
        const transitionSequence = generateRandomTransitionSequence(10 + Math.floor(Math.random() * 20));

        try {
          for (const { event, payload } of transitionSequence) {
            const result = stateMachine.transition(event, payload);
            
            if (result.success) {
              const stateData = stateMachine.getStateData();
              const validation = stateValidation.validateStateInvariants(stateData);
              
              if (!validation.valid) {
                violationCount++;
                violations.push(`Iteration ${i}, Event ${event}: ${validation.violations.join(', ')}`);
                break; // Stop this iteration on first violation
              }
            }
          }
        } catch (error) {
          violations.push(`Iteration ${i}: Exception - ${error}`);
          violationCount++;
        }
      }

      // Report results
      console.log(`Property-based test results:`);
      console.log(`Total iterations: ${PROPERTY_TEST_ITERATIONS}`);
      console.log(`Violations: ${violationCount}`);
      console.log(`Success rate: ${((PROPERTY_TEST_ITERATIONS - violationCount) / PROPERTY_TEST_ITERATIONS * 100).toFixed(2)}%`);

      if (violations.length > 0) {
        console.log(`First 10 violations:`, violations.slice(0, 10));
      }

      expect(violationCount).toBe(0);
    });

    it('should maintain critical invariants under rapid state changes', () => {
      const stateMachine = new GameStateMachine();
      let violationCount = 0;

      // Start game
      stateMachine.transition(GameEvent.START_GAME, { gameMode: 'classic' });
      stateMachine.transition(GameEvent.GAME_READY);

      // Rapid answer submissions
      for (let i = 0; i < 1000; i++) {
        const isCorrect = Math.random() > 0.3; // 70% correct answers
        const shouldEndGame = !isCorrect && Math.random() < 0.1; // 10% chance to end on wrong answer

        const result = stateMachine.transition(GameEvent.SUBMIT_ANSWER, {
          answer: isCorrect ? 'CORRECT' : 'WRONG',
          reactionTime: 200 + Math.random() * 1000,
          isCorrect,
          scoreGain: isCorrect ? Math.floor(Math.random() * 200) + 50 : 0,
          shouldEndGame
        });

        if (result.success) {
          const stateData = stateMachine.getStateData();
          if (!stateValidation.validateCriticalInvariants(stateData)) {
            violationCount++;
          }

          if (shouldEndGame) {
            break; // Game ended
          }
        }
      }

      expect(violationCount).toBe(0);
    });

    it('should handle pause/resume cycles without invariant violations', () => {
      const stateMachine = new GameStateMachine();
      
      // Start game
      stateMachine.transition(GameEvent.START_GAME, { gameMode: 'classic' });
      stateMachine.transition(GameEvent.GAME_READY);

      // Rapid pause/resume cycles
      for (let i = 0; i < 100; i++) {
        // Pause
        let result = stateMachine.transition(GameEvent.PAUSE_GAME);
        if (result.success) {
          const stateData = stateMachine.getStateData();
          const validation = stateValidation.validateStateInvariants(stateData);
          expect(validation.valid).toBe(true);
        }

        // Resume
        result = stateMachine.transition(GameEvent.RESUME_GAME);
        if (result.success) {
          const stateData = stateMachine.getStateData();
          const validation = stateValidation.validateStateInvariants(stateData);
          expect(validation.valid).toBe(true);
        }

        // Submit an answer
        stateMachine.transition(GameEvent.SUBMIT_ANSWER, {
          isCorrect: Math.random() > 0.5,
          scoreGain: 100,
          shouldEndGame: false
        });
      }
    });
  });

  describe('Specific Invariant Tests', () => {
    it('should never allow negative lives', () => {
      const stateMachine = new GameStateMachine();
      
      // Start game
      stateMachine.transition(GameEvent.START_GAME, { gameMode: 'sudden-death' }); // 1 life only
      stateMachine.transition(GameEvent.GAME_READY);

      // Make multiple wrong answers (should not go below 0 lives)
      for (let i = 0; i < 5; i++) {
        const result = stateMachine.transition(GameEvent.SUBMIT_ANSWER, {
          isCorrect: false,
          shouldEndGame: i === 0 // End game on first mistake in sudden death
        });

        if (result.success) {
          const stateData = stateMachine.getStateData();
          expect(stateData.mistakes).toBeGreaterThanOrEqual(0);
          expect(stateData.mistakes).toBeLessThanOrEqual(1); // Max 1 for sudden death
        }
      }
    });

    it('should never decrease score on correct answers', () => {
      const stateMachine = new GameStateMachine();
      
      // Start game
      stateMachine.transition(GameEvent.START_GAME, { gameMode: 'classic' });
      stateMachine.transition(GameEvent.GAME_READY);

      let previousScore = 0;

      // Submit many correct answers
      for (let i = 0; i < 50; i++) {
        const result = stateMachine.transition(GameEvent.SUBMIT_ANSWER, {
          isCorrect: true,
          scoreGain: Math.floor(Math.random() * 200) + 50,
          shouldEndGame: false
        });

        if (result.success) {
          const stateData = stateMachine.getStateData();
          expect(stateData.score).toBeGreaterThanOrEqual(previousScore);
          previousScore = stateData.score;
        }
      }
    });

    it('should reset streak consistently on mistakes', () => {
      const stateMachine = new GameStateMachine();
      
      // Start game
      stateMachine.transition(GameEvent.START_GAME, { gameMode: 'classic' });
      stateMachine.transition(GameEvent.GAME_READY);

      for (let cycle = 0; cycle < 10; cycle++) {
        // Build up streak
        const streakLength = Math.floor(Math.random() * 10) + 1;
        for (let i = 0; i < streakLength; i++) {
          stateMachine.transition(GameEvent.SUBMIT_ANSWER, {
            isCorrect: true,
            scoreGain: 100,
            shouldEndGame: false
          });
        }

        const stateBeforeMistake = stateMachine.getStateData();
        expect(stateBeforeMistake.streak).toBe(streakLength);

        // Make a mistake
        const result = stateMachine.transition(GameEvent.SUBMIT_ANSWER, {
          isCorrect: false,
          shouldEndGame: false
        });

        if (result.success) {
          const stateAfterMistake = stateMachine.getStateData();
          expect(stateAfterMistake.streak).toBe(0);
        }
      }
    });

    it('should maintain level progression', () => {
      const stateMachine = new GameStateMachine();
      
      // Start game
      stateMachine.transition(GameEvent.START_GAME, { gameMode: 'classic' });
      stateMachine.transition(GameEvent.GAME_READY);

      let previousLevel = 1;

      // Mix of correct and incorrect answers
      for (let i = 0; i < 30; i++) {
        const isCorrect = Math.random() > 0.3; // 70% correct
        
        const result = stateMachine.transition(GameEvent.SUBMIT_ANSWER, {
          isCorrect,
          scoreGain: isCorrect ? 100 : 0,
          shouldEndGame: false
        });

        if (result.success) {
          const stateData = stateMachine.getStateData();
          
          if (isCorrect) {
            // Level should increase on correct answers
            expect(stateData.level).toBeGreaterThan(previousLevel);
          }
          
          // Level should never decrease (except on reset)
          expect(stateData.level).toBeGreaterThanOrEqual(previousLevel);
          previousLevel = stateData.level;
        }
      }
    });

    it('should maintain game over state consistency', () => {
      const stateMachine = new GameStateMachine();
      
      // Start game
      stateMachine.transition(GameEvent.START_GAME, { gameMode: 'classic' });
      stateMachine.transition(GameEvent.GAME_READY);

      // Play until game over
      let gameEnded = false;
      for (let i = 0; i < 100 && !gameEnded; i++) {
        const shouldEndGame = Math.random() < 0.05; // 5% chance to end game
        
        const result = stateMachine.transition(GameEvent.SUBMIT_ANSWER, {
          isCorrect: !shouldEndGame,
          shouldEndGame
        });

        if (result.success && shouldEndGame) {
          // End the game
          stateMachine.transition(GameEvent.END_GAME);
          gameEnded = true;
          
          const stateData = stateMachine.getStateData();
          
          // Game over should imply inactive
          if (stateData.currentState === 'gameOver') {
            expect(stateData.isActive).toBe(false);
          }
        }
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid state transitions without corruption', () => {
      const stateMachine = new GameStateMachine();
      
      // Rapid fire transitions
      const transitions = [
        { event: GameEvent.START_GAME, payload: { gameMode: 'classic' } },
        { event: GameEvent.GAME_READY, payload: {} },
        { event: GameEvent.PAUSE_GAME, payload: {} },
        { event: GameEvent.RESUME_GAME, payload: {} },
        { event: GameEvent.PAUSE_GAME, payload: {} },
        { event: GameEvent.RESUME_GAME, payload: {} },
        { event: GameEvent.END_GAME, payload: {} },
        { event: GameEvent.RESET_GAME, payload: {} }
      ];

      for (const { event, payload } of transitions) {
        const result = stateMachine.transition(event, payload);
        
        if (result.success) {
          const stateData = stateMachine.getStateData();
          const validation = stateValidation.validateStateInvariants(stateData);
          expect(validation.valid).toBe(true);
        }
      }
    });

    it('should handle boundary values correctly', () => {
      const stateMachine = new GameStateMachine();
      
      // Start game
      stateMachine.transition(GameEvent.START_GAME, { gameMode: 'classic' });
      stateMachine.transition(GameEvent.GAME_READY);

      // Test with extreme values
      const extremePayloads = [
        { isCorrect: true, scoreGain: 0, shouldEndGame: false }, // Zero score gain
        { isCorrect: true, scoreGain: 999999, shouldEndGame: false }, // Very high score
        { isCorrect: false, reactionTime: 0, shouldEndGame: false }, // Zero reaction time
        { isCorrect: false, reactionTime: 10000, shouldEndGame: false }, // Very slow reaction
      ];

      for (const payload of extremePayloads) {
        const result = stateMachine.transition(GameEvent.SUBMIT_ANSWER, payload);
        
        if (result.success) {
          const stateData = stateMachine.getStateData();
          const validation = stateValidation.validateStateInvariants(stateData);
          expect(validation.valid).toBe(true);
        }
      }
    });
  });
});

// Helper function to generate random transition sequences
function generateRandomTransitionSequence(length: number): Array<{ event: GameEvent; payload: any }> {
  const sequence: Array<{ event: GameEvent; payload: any }> = [];
  let currentState = GameState.IDLE;

  for (let i = 0; i < length; i++) {
    const possibleEvents = getPossibleEvents(currentState);
    const event = possibleEvents[Math.floor(Math.random() * possibleEvents.length)];
    const payload = generatePayloadForEvent(event);

    sequence.push({ event, payload });

    // Update current state for next iteration
    currentState = getNextState(currentState, event);
  }

  return sequence;
}

function getPossibleEvents(state: GameState): GameEvent[] {
  switch (state) {
    case GameState.IDLE:
      return [GameEvent.START_GAME, GameEvent.ERROR_OCCURRED];
    case GameState.STARTING:
      return [GameEvent.GAME_READY, GameEvent.ERROR_OCCURRED];
    case GameState.ACTIVE:
      return [GameEvent.SUBMIT_ANSWER, GameEvent.PAUSE_GAME, GameEvent.END_GAME, GameEvent.TIME_UP, GameEvent.ERROR_OCCURRED];
    case GameState.PAUSED:
      return [GameEvent.RESUME_GAME, GameEvent.END_GAME, GameEvent.ERROR_OCCURRED];
    case GameState.ENDING:
      return [GameEvent.RESET_GAME, GameEvent.ERROR_OCCURRED];
    case GameState.GAME_OVER:
      return [GameEvent.RESET_GAME, GameEvent.ERROR_OCCURRED];
    case GameState.ERROR:
      return [GameEvent.RECOVER_FROM_ERROR];
    default:
      return [GameEvent.RESET_GAME];
  }
}

function getNextState(currentState: GameState, event: GameEvent): GameState {
  // Simplified state transition logic for test purposes
  switch (event) {
    case GameEvent.START_GAME:
      return GameState.STARTING;
    case GameEvent.GAME_READY:
      return GameState.ACTIVE;
    case GameEvent.PAUSE_GAME:
      return GameState.PAUSED;
    case GameEvent.RESUME_GAME:
      return GameState.ACTIVE;
    case GameEvent.SUBMIT_ANSWER:
      return currentState; // Usually stays in ACTIVE
    case GameEvent.END_GAME:
    case GameEvent.TIME_UP:
    case GameEvent.LIVES_EXHAUSTED:
      return GameState.ENDING;
    case GameEvent.RESET_GAME:
      return GameState.IDLE;
    case GameEvent.ERROR_OCCURRED:
      return GameState.ERROR;
    case GameEvent.RECOVER_FROM_ERROR:
      return GameState.IDLE;
    default:
      return currentState;
  }
}

function generatePayloadForEvent(event: GameEvent): any {
  switch (event) {
    case GameEvent.START_GAME:
      return { gameMode: ['classic', 'duel', 'sudden-death'][Math.floor(Math.random() * 3)] };
    case GameEvent.SUBMIT_ANSWER:
      return {
        answer: ['UP', 'DOWN', 'LEFT', 'RIGHT', 'RED', 'GREEN', 'BLUE', 'YELLOW'][Math.floor(Math.random() * 8)],
        reactionTime: Math.random() * 2000 + 100,
        isCorrect: Math.random() > 0.3,
        scoreGain: Math.floor(Math.random() * 200) + 50,
        shouldEndGame: Math.random() < 0.05
      };
    case GameEvent.END_GAME:
      return {
        finalScore: Math.floor(Math.random() * 10000),
        finalLevel: Math.floor(Math.random() * 30) + 1,
        finalStreak: Math.floor(Math.random() * 20)
      };
    case GameEvent.ERROR_OCCURRED:
      return { error: 'Random test error' };
    default:
      return {};
  }
}
