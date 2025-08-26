/**
 * Comprehensive tests for the enhanced scoring system
 */

import {
  calculateScore,
  calculateSpeedMultiplier,
  calculateStreakBonus,
  calculateLevelBonus,
  calculatePerfectBonus,
  calculateGameModeMultiplier,
  validateScoring,
  initializeScoring,
  getScoringPerformance,
  resetScoringPerformance
} from '../src/utils/scoring';

import {
  ScoringInput,
  SpeedCategory,
  StreakTier,
  DEFAULT_SCORING_CONFIG
} from '../src/types/scoring';

describe('Enhanced Scoring System', () => {
  beforeEach(() => {
    initializeScoring();
    resetScoringPerformance();
  });

  describe('Core Scoring Function', () => {
    it('should calculate basic score correctly', () => {
      const input: ScoringInput = {
        reactionTime: 1000,
        timeLimit: 2000,
        streak: 5,
        level: 10,
        graceWindow: 75
      };

      const result = calculateScore(input);

      expect(result.finalScore).toBeGreaterThan(0);
      expect(result.components).toBeDefined();
      expect(result.breakdown).toBeDefined();
      expect(result.metadata).toBeDefined();
    });

    it('should handle zero and negative inputs gracefully', () => {
      const input: ScoringInput = {
        reactionTime: 0,
        timeLimit: 1000,
        streak: 0,
        level: 1,
        graceWindow: 0
      };

      const result = calculateScore(input);

      expect(result.finalScore).toBeGreaterThanOrEqual(0);
      expect(result.components.streakBonus).toBe(0);
    });

    it('should handle extreme inputs without crashing', () => {
      const extremeInputs: ScoringInput[] = [
        {
          reactionTime: 999999,
          timeLimit: 1000,
          streak: 1000,
          level: 100,
          graceWindow: 75
        },
        {
          reactionTime: 1,
          timeLimit: 10000,
          streak: 0,
          level: 1,
          graceWindow: 1000
        }
      ];

      extremeInputs.forEach(input => {
        expect(() => calculateScore(input)).not.toThrow();
        const result = calculateScore(input);
        expect(result.finalScore).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('Speed Multiplier Calculation', () => {
    it('should return maximum multiplier for lightning-fast reactions', () => {
      const multiplier = calculateSpeedMultiplier(100, 1000); // 10% of time limit
      expect(multiplier).toBe(2.0);
    });

    it('should return minimum multiplier for very slow reactions', () => {
      const multiplier = calculateSpeedMultiplier(2000, 1000); // 200% of time limit
      expect(multiplier).toBe(0.1);
    });

    it('should return normal multiplier for average reactions', () => {
      const multiplier = calculateSpeedMultiplier(700, 1000); // 70% of time limit
      expect(multiplier).toBe(1.0);
    });

    it('should handle edge cases', () => {
      expect(calculateSpeedMultiplier(0, 1000)).toBe(2.0);
      expect(calculateSpeedMultiplier(1000, 0)).toBe(0.1);
      expect(calculateSpeedMultiplier(-100, 1000)).toBe(2.0); // Negative time treated as 0
    });

    it('should be consistent across multiple calls', () => {
      const time = 500;
      const limit = 1000;
      const multiplier1 = calculateSpeedMultiplier(time, limit);
      const multiplier2 = calculateSpeedMultiplier(time, limit);
      expect(multiplier1).toBe(multiplier2);
    });
  });

  describe('Streak Bonus Calculation', () => {
    it('should return zero for no streak', () => {
      expect(calculateStreakBonus(0)).toBe(0);
    });

    it('should increase linearly with streak', () => {
      expect(calculateStreakBonus(1)).toBe(25);
      expect(calculateStreakBonus(2)).toBe(50);
      expect(calculateStreakBonus(4)).toBe(100);
    });

    it('should cap at maximum bonus', () => {
      const maxStreak = Math.ceil(DEFAULT_SCORING_CONFIG.maxStreakBonus / DEFAULT_SCORING_CONFIG.streakMultiplier);
      expect(calculateStreakBonus(maxStreak)).toBe(DEFAULT_SCORING_CONFIG.maxStreakBonus);
      expect(calculateStreakBonus(maxStreak + 10)).toBe(DEFAULT_SCORING_CONFIG.maxStreakBonus);
    });

    it('should handle negative streaks', () => {
      expect(calculateStreakBonus(-5)).toBe(0);
    });
  });

  describe('Level Bonus Calculation', () => {
    it('should return zero for level zero or negative', () => {
      expect(calculateLevelBonus(0)).toBe(0);
      expect(calculateLevelBonus(-1)).toBe(0);
    });

    it('should increase linearly with level', () => {
      expect(calculateLevelBonus(1)).toBe(10);
      expect(calculateLevelBonus(5)).toBe(50);
      expect(calculateLevelBonus(10)).toBe(100);
    });

    it('should handle high levels', () => {
      expect(calculateLevelBonus(100)).toBe(1000);
    });
  });

  describe('Perfect Bonus Calculation', () => {
    it('should return base bonus for level 1', () => {
      const bonus = calculatePerfectBonus(1);
      expect(bonus).toBe(DEFAULT_SCORING_CONFIG.perfectBonusBase + 5);
    });

    it('should increase with level', () => {
      const bonus1 = calculatePerfectBonus(1);
      const bonus5 = calculatePerfectBonus(5);
      expect(bonus5).toBeGreaterThan(bonus1);
    });

    it('should return zero for invalid levels', () => {
      expect(calculatePerfectBonus(0)).toBe(0);
      expect(calculatePerfectBonus(-1)).toBe(0);
    });
  });

  describe('Game Mode Multiplier', () => {
    it('should return 1.0 for classic mode', () => {
      expect(calculateGameModeMultiplier('classic')).toBe(1.0);
    });

    it('should return higher multiplier for duel mode', () => {
      expect(calculateGameModeMultiplier('duel')).toBe(1.2);
    });

    it('should return highest multiplier for sudden-death mode', () => {
      expect(calculateGameModeMultiplier('sudden-death')).toBe(1.5);
    });

    it('should return 1.0 for unknown modes', () => {
      expect(calculateGameModeMultiplier('unknown')).toBe(1.0);
      expect(calculateGameModeMultiplier(undefined)).toBe(1.0);
    });
  });

  describe('Scoring Metadata', () => {
    it('should correctly categorize speed performance', () => {
      const inputs = [
        { reactionTime: 100, timeLimit: 1000, expectedCategory: SpeedCategory.LIGHTNING },
        { reactionTime: 300, timeLimit: 1000, expectedCategory: SpeedCategory.VERY_FAST },
        { reactionTime: 500, timeLimit: 1000, expectedCategory: SpeedCategory.FAST },
        { reactionTime: 700, timeLimit: 1000, expectedCategory: SpeedCategory.NORMAL },
        { reactionTime: 900, timeLimit: 1000, expectedCategory: SpeedCategory.SLOW },
        { reactionTime: 1200, timeLimit: 1000, expectedCategory: SpeedCategory.TOO_SLOW }
      ];

      inputs.forEach(({ reactionTime, timeLimit, expectedCategory }) => {
        const result = calculateScore({
          reactionTime,
          timeLimit,
          streak: 0,
          level: 1,
          graceWindow: 0
        });

        expect(result.metadata.speedCategory).toBe(expectedCategory);
      });
    });

    it('should correctly categorize streak tiers', () => {
      const streaks = [
        { streak: 0, expectedTier: StreakTier.NONE },
        { streak: 3, expectedTier: StreakTier.BUILDING },
        { streak: 7, expectedTier: StreakTier.GOOD },
        { streak: 15, expectedTier: StreakTier.GREAT },
        { streak: 25, expectedTier: StreakTier.AMAZING }
      ];

      streaks.forEach(({ streak, expectedTier }) => {
        const result = calculateScore({
          reactionTime: 500,
          timeLimit: 1000,
          streak,
          level: 1,
          graceWindow: 75
        });

        expect(result.metadata.streakTier).toBe(expectedTier);
      });
    });

    it('should identify optimal performance', () => {
      const result = calculateScore({
        reactionTime: 150, // Very fast (15% of time limit)
        timeLimit: 1000,
        streak: 15, // High streak
        level: 10,
        graceWindow: 75
      });

      expect(result.metadata.isOptimalPerformance).toBe(true);
    });
  });

  describe('Scoring Validation', () => {
    it('should validate correct scoring results', () => {
      const input: ScoringInput = {
        reactionTime: 500,
        timeLimit: 1000,
        streak: 5,
        level: 10,
        graceWindow: 75
      };

      const result = calculateScore(input);
      const validation = validateScoring(result, input);

      expect(validation.isValid).toBe(true);
      expect(validation.violations).toHaveLength(0);
    });

    it('should detect scoring violations', () => {
      const input: ScoringInput = {
        reactionTime: 500,
        timeLimit: 1000,
        streak: 5,
        level: 10,
        graceWindow: 75
      };

      const result = calculateScore(input);
      
      // Manually corrupt the result to test validation
      result.components.speedMultiplier = 5.0; // Invalid: exceeds max
      result.finalScore = -100; // Invalid: negative score

      const validation = validateScoring(result, input);

      expect(validation.isValid).toBe(false);
      expect(validation.violations.length).toBeGreaterThan(0);
    });

    it('should generate warnings for unusual values', () => {
      const input: ScoringInput = {
        reactionTime: 5000, // Very slow
        timeLimit: 1000,
        streak: 150, // Very high streak
        level: 10,
        graceWindow: 75
      };

      const result = calculateScore(input);
      const validation = validateScoring(result, input);

      expect(validation.warnings.length).toBeGreaterThan(0);
    });
  });

  describe('Performance Optimization', () => {
    it('should use lookup tables for common calculations', () => {
      // Initialize with lookup tables enabled
      initializeScoring({ enableLookupTables: true, enablePerformanceTracking: true });

      const input: ScoringInput = {
        reactionTime: 500,
        timeLimit: 1000,
        streak: 5,
        level: 10,
        graceWindow: 75
      };

      // Calculate multiple times to test caching
      for (let i = 0; i < 10; i++) {
        calculateScore(input);
      }

      const performance = getScoringPerformance();
      expect(performance.totalCalculations).toBe(10);
      expect(performance.cacheHitRate).toBeGreaterThan(0);
    });

    it('should complete calculations quickly', () => {
      initializeScoring({ enablePerformanceTracking: true });

      const input: ScoringInput = {
        reactionTime: 500,
        timeLimit: 1000,
        streak: 5,
        level: 10,
        graceWindow: 75
      };

      const startTime = performance.now();
      
      // Calculate many scores
      for (let i = 0; i < 1000; i++) {
        calculateScore({
          ...input,
          reactionTime: 400 + i, // Vary reaction time
          streak: i % 20,
          level: (i % 30) + 1
        });
      }

      const endTime = performance.now();
      const totalTime = endTime - startTime;
      const averageTime = totalTime / 1000;

      expect(averageTime).toBeLessThan(0.1); // Less than 0.1ms per calculation
    });
  });

  describe('Boundary Testing', () => {
    it('should handle minimum boundary values', () => {
      const input: ScoringInput = {
        reactionTime: 0,
        timeLimit: 1,
        streak: 0,
        level: 1,
        graceWindow: 0
      };

      expect(() => calculateScore(input)).not.toThrow();
      const result = calculateScore(input);
      expect(result.finalScore).toBeGreaterThanOrEqual(0);
    });

    it('should handle maximum boundary values', () => {
      const input: ScoringInput = {
        reactionTime: 10000,
        timeLimit: 10000,
        streak: 1000,
        level: 100,
        graceWindow: 1000
      };

      expect(() => calculateScore(input)).not.toThrow();
      const result = calculateScore(input);
      expect(result.finalScore).toBeGreaterThanOrEqual(0);
    });

    it('should handle edge cases around thresholds', () => {
      const thresholdTests = [
        { reactionTime: 199, timeLimit: 1000 }, // Just under 20% threshold
        { reactionTime: 201, timeLimit: 1000 }, // Just over 20% threshold
        { reactionTime: 399, timeLimit: 1000 }, // Just under 40% threshold
        { reactionTime: 401, timeLimit: 1000 }, // Just over 40% threshold
      ];

      thresholdTests.forEach(test => {
        const result = calculateScore({
          ...test,
          streak: 5,
          level: 10,
          graceWindow: 75
        });

        expect(result.finalScore).toBeGreaterThanOrEqual(0);
        expect(result.components.speedMultiplier).toBeGreaterThanOrEqual(0.1);
        expect(result.components.speedMultiplier).toBeLessThanOrEqual(2.0);
      });
    });
  });

  describe('Mathematical Consistency', () => {
    it('should maintain mathematical relationships', () => {
      const baseInput: ScoringInput = {
        reactionTime: 500,
        timeLimit: 1000,
        streak: 5,
        level: 10,
        graceWindow: 75
      };

      // Faster reaction should yield higher score
      const fasterResult = calculateScore({ ...baseInput, reactionTime: 300 });
      const slowerResult = calculateScore({ ...baseInput, reactionTime: 700 });
      expect(fasterResult.finalScore).toBeGreaterThan(slowerResult.finalScore);

      // Higher streak should yield higher score
      const higherStreakResult = calculateScore({ ...baseInput, streak: 10 });
      const lowerStreakResult = calculateScore({ ...baseInput, streak: 2 });
      expect(higherStreakResult.finalScore).toBeGreaterThan(lowerStreakResult.finalScore);

      // Higher level should yield higher score
      const higherLevelResult = calculateScore({ ...baseInput, level: 20 });
      const lowerLevelResult = calculateScore({ ...baseInput, level: 5 });
      expect(higherLevelResult.finalScore).toBeGreaterThan(lowerLevelResult.finalScore);
    });

    it('should maintain component independence', () => {
      const baseInput: ScoringInput = {
        reactionTime: 500,
        timeLimit: 1000,
        streak: 5,
        level: 10,
        graceWindow: 75
      };

      const baseResult = calculateScore(baseInput);

      // Changing only streak should only affect streak bonus
      const streakResult = calculateScore({ ...baseInput, streak: 10 });
      expect(streakResult.components.speedMultiplier).toBe(baseResult.components.speedMultiplier);
      expect(streakResult.components.levelBonus).toBe(baseResult.components.levelBonus);
      expect(streakResult.components.streakBonus).toBeGreaterThan(baseResult.components.streakBonus);
    });
  });
});