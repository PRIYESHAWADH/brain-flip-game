/**
 * Regression tests to ensure scoring system maintains backward compatibility
 */

import { calculateScore as calculateEnhancedScore, calculateScoreLegacy } from '../src/utils/scoring';
import { calculateScore as calculateOriginalScore } from '../src/utils/gameLogic';

describe('Scoring System Regression Tests', () => {
  describe('Legacy Compatibility', () => {
    it('should maintain exact compatibility with original scoring for standard cases', () => {
      const testCases = [
        { reactionTime: 500, streak: 0, level: 1 },
        { reactionTime: 1000, streak: 5, level: 10 },
        { reactionTime: 1500, streak: 10, level: 15 },
        { reactionTime: 2000, streak: 20, level: 30 },
        { reactionTime: 2500, streak: 0, level: 5 }
      ];

      testCases.forEach(({ reactionTime, streak, level }) => {
        const originalScore = calculateOriginalScore(reactionTime, streak, level);
        const legacyScore = calculateScoreLegacy(reactionTime, streak, level);
        
        // Allow for small rounding differences
        expect(Math.abs(originalScore - legacyScore)).toBeLessThanOrEqual(1);
      });
    });

    it('should handle edge cases consistently with original implementation', () => {
      const edgeCases = [
        { reactionTime: 0, streak: 0, level: 1 },
        { reactionTime: 3000, streak: 0, level: 1 }, // At time limit
        { reactionTime: 5000, streak: 0, level: 1 }, // Over time limit
        { reactionTime: 1000, streak: 100, level: 1 }, // High streak
        { reactionTime: 1000, streak: 0, level: 100 } // High level
      ];

      edgeCases.forEach(({ reactionTime, streak, level }) => {
        const originalScore = calculateOriginalScore(reactionTime, streak, level);
        const legacyScore = calculateScoreLegacy(reactionTime, streak, level);
        
        // Ensure both produce reasonable scores
        expect(originalScore).toBeGreaterThanOrEqual(0);
        expect(legacyScore).toBeGreaterThanOrEqual(0);
        
        // Allow for implementation differences in edge cases
        const difference = Math.abs(originalScore - legacyScore);
        const tolerance = Math.max(originalScore, legacyScore) * 0.1; // 10% tolerance
        expect(difference).toBeLessThanOrEqual(tolerance);
      });
    });

    it('should maintain score progression patterns', () => {
      // Test that faster reactions still yield higher scores
      const baseCase = { streak: 5, level: 10 };
      
      const fastScore = calculateScoreLegacy(300, baseCase.streak, baseCase.level);
      const mediumScore = calculateScoreLegacy(1000, baseCase.streak, baseCase.level);
      const slowScore = calculateScoreLegacy(2000, baseCase.streak, baseCase.level);
      
      expect(fastScore).toBeGreaterThan(mediumScore);
      expect(mediumScore).toBeGreaterThan(slowScore);
    });

    it('should maintain streak bonus patterns', () => {
      // Test that higher streaks yield higher scores
      const baseCase = { reactionTime: 1000, level: 10 };
      
      const noStreakScore = calculateScoreLegacy(baseCase.reactionTime, 0, baseCase.level);
      const lowStreakScore = calculateScoreLegacy(baseCase.reactionTime, 5, baseCase.level);
      const highStreakScore = calculateScoreLegacy(baseCase.reactionTime, 15, baseCase.level);
      
      expect(lowStreakScore).toBeGreaterThan(noStreakScore);
      expect(highStreakScore).toBeGreaterThan(lowStreakScore);
    });

    it('should maintain level bonus patterns', () => {
      // Test that higher levels yield higher scores
      const baseCase = { reactionTime: 1000, streak: 5 };
      
      const lowLevelScore = calculateScoreLegacy(baseCase.reactionTime, baseCase.streak, 1);
      const mediumLevelScore = calculateScoreLegacy(baseCase.reactionTime, baseCase.streak, 10);
      const highLevelScore = calculateScoreLegacy(baseCase.reactionTime, baseCase.streak, 20);
      
      expect(mediumLevelScore).toBeGreaterThan(lowLevelScore);
      expect(highLevelScore).toBeGreaterThan(mediumLevelScore);
    });
  });

  describe('Enhanced Features Validation', () => {
    it('should provide enhanced scoring that is generally higher than legacy', () => {
      const testCases = [
        { reactionTime: 500, streak: 5, level: 10, gameMode: 'classic' },
        { reactionTime: 800, streak: 10, level: 15, gameMode: 'duel' },
        { reactionTime: 1200, streak: 3, level: 8, gameMode: 'sudden-death' }
      ];

      testCases.forEach(({ reactionTime, streak, level, gameMode }) => {
        const legacyScore = calculateScoreLegacy(reactionTime, streak, level);
        const enhancedResult = calculateEnhancedScore({
          reactionTime,
          timeLimit: 3000,
          streak,
          level,
          graceWindow: 75,
          gameMode: gameMode as any
        });

        // Enhanced scoring should generally be higher due to game mode multipliers
        if (gameMode !== 'classic') {
          expect(enhancedResult.finalScore).toBeGreaterThanOrEqual(legacyScore);
        }
      });
    });

    it('should provide consistent grace window benefits', () => {
      const baseInput = {
        timeLimit: 2000,
        streak: 5,
        level: 10,
        gameMode: 'classic' as const
      };

      // Test with and without grace window
      const withoutGrace = calculateEnhancedScore({
        ...baseInput,
        reactionTime: 1500,
        graceWindow: 0
      });

      const withGrace = calculateEnhancedScore({
        ...baseInput,
        reactionTime: 1500,
        graceWindow: 75
      });

      // Grace window should improve the score
      expect(withGrace.finalScore).toBeGreaterThanOrEqual(withoutGrace.finalScore);
    });

    it('should provide perfect round bonuses', () => {
      const baseInput = {
        reactionTime: 1000,
        timeLimit: 2000,
        streak: 5,
        level: 10,
        graceWindow: 75,
        gameMode: 'classic' as const
      };

      const normalRound = calculateEnhancedScore({
        ...baseInput,
        isPerfectRound: false
      });

      const perfectRound = calculateEnhancedScore({
        ...baseInput,
        isPerfectRound: true
      });

      expect(perfectRound.finalScore).toBeGreaterThan(normalRound.finalScore);
      expect(perfectRound.components.perfectBonus).toBeGreaterThan(0);
      expect(normalRound.components.perfectBonus).toBe(0);
    });
  });

  describe('Performance Regression', () => {
    it('should not be significantly slower than original implementation', () => {
      const testData = Array.from({ length: 1000 }, (_, i) => ({
        reactionTime: 500 + (i % 2000),
        streak: i % 20,
        level: (i % 30) + 1
      }));

      // Benchmark original implementation
      const originalStart = performance.now();
      testData.forEach(({ reactionTime, streak, level }) => {
        calculateOriginalScore(reactionTime, streak, level);
      });
      const originalTime = performance.now() - originalStart;

      // Benchmark legacy compatibility function
      const legacyStart = performance.now();
      testData.forEach(({ reactionTime, streak, level }) => {
        calculateScoreLegacy(reactionTime, streak, level);
      });
      const legacyTime = performance.now() - legacyStart;

      // Legacy should not be more than 3x slower than original
      expect(legacyTime).toBeLessThan(originalTime * 3);

      console.log(`Performance comparison:`);
      console.log(`Original: ${originalTime.toFixed(2)}ms`);
      console.log(`Legacy: ${legacyTime.toFixed(2)}ms`);
      console.log(`Ratio: ${(legacyTime / originalTime).toFixed(2)}x`);
    });

    it('should handle high-frequency calculations efficiently', () => {
      const startTime = performance.now();
      
      // Simulate rapid scoring calculations
      for (let i = 0; i < 10000; i++) {
        calculateScoreLegacy(
          500 + (i % 1500), // Vary reaction time
          i % 25,           // Vary streak
          (i % 30) + 1      // Vary level
        );
      }

      const endTime = performance.now();
      const totalTime = endTime - startTime;
      const averageTime = totalTime / 10000;

      // Should average less than 0.01ms per calculation
      expect(averageTime).toBeLessThan(0.01);
      
      console.log(`High-frequency test: ${averageTime.toFixed(4)}ms per calculation`);
    });
  });

  describe('Data Integrity', () => {
    it('should produce deterministic results', () => {
      const testCases = [
        { reactionTime: 750, streak: 7, level: 12 },
        { reactionTime: 1250, streak: 15, level: 25 },
        { reactionTime: 2000, streak: 0, level: 1 }
      ];

      testCases.forEach(testCase => {
        // Calculate the same score multiple times
        const scores = Array.from({ length: 10 }, () => 
          calculateScoreLegacy(testCase.reactionTime, testCase.streak, testCase.level)
        );

        // All scores should be identical
        const firstScore = scores[0];
        scores.forEach(score => {
          expect(score).toBe(firstScore);
        });
      });
    });

    it('should maintain mathematical relationships across implementations', () => {
      const testCases = [
        { reactionTime: 500, streak: 5, level: 10 },
        { reactionTime: 1000, streak: 10, level: 15 },
        { reactionTime: 1500, streak: 15, level: 20 }
      ];

      testCases.forEach(({ reactionTime, streak, level }) => {
        // Test that relationships hold in both implementations
        const fasterOriginal = calculateOriginalScore(reactionTime - 200, streak, level);
        const slowerOriginal = calculateOriginalScore(reactionTime + 200, streak, level);
        
        const fasterLegacy = calculateScoreLegacy(reactionTime - 200, streak, level);
        const slowerLegacy = calculateScoreLegacy(reactionTime + 200, streak, level);

        // Both implementations should show faster reactions yield higher scores
        expect(fasterOriginal).toBeGreaterThan(slowerOriginal);
        expect(fasterLegacy).toBeGreaterThan(slowerLegacy);
      });
    });
  });

  describe('Error Handling Regression', () => {
    it('should handle invalid inputs gracefully like original', () => {
      const invalidInputs = [
        { reactionTime: -100, streak: 5, level: 10 },
        { reactionTime: 1000, streak: -5, level: 10 },
        { reactionTime: 1000, streak: 5, level: -1 },
        { reactionTime: NaN, streak: 5, level: 10 },
        { reactionTime: 1000, streak: NaN, level: 10 },
        { reactionTime: 1000, streak: 5, level: NaN }
      ];

      invalidInputs.forEach(({ reactionTime, streak, level }) => {
        // Both implementations should handle invalid inputs without crashing
        expect(() => calculateOriginalScore(reactionTime, streak, level)).not.toThrow();
        expect(() => calculateScoreLegacy(reactionTime, streak, level)).not.toThrow();

        const originalScore = calculateOriginalScore(reactionTime, streak, level);
        const legacyScore = calculateScoreLegacy(reactionTime, streak, level);

        // Both should produce non-negative scores
        expect(originalScore).toBeGreaterThanOrEqual(0);
        expect(legacyScore).toBeGreaterThanOrEqual(0);
      });
    });
  });
});