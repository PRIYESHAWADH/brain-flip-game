/**
 * Comprehensive scoring system types
 */

// Core scoring input parameters
export interface ScoringInput {
  reactionTime: number;
  timeLimit: number;
  streak: number;
  level: number;
  isPerfectRound?: boolean;
  graceWindow?: number;
  gameMode?: 'classic' | 'duel' | 'sudden-death';
}

// Individual scoring components
export interface ScoringComponents {
  baseScore: number;
  speedMultiplier: number;
  streakBonus: number;
  levelBonus: number;
  perfectBonus: number;
  gameModeMultiplier: number;
  graceApplied: boolean;
}

// Detailed scoring breakdown for UI display
export interface ScoringBreakdown {
  basePoints: number;           // baseScore * speedMultiplier
  streakPoints: number;         // streakBonus
  levelPoints: number;          // levelBonus
  perfectPoints: number;        // perfectBonus
  gameModePoints: number;       // gameMode bonus/penalty
  totalPoints: number;          // final calculated score
}

// Scoring metadata for analysis
export interface ScoringMetadata {
  effectiveReactionTime: number;  // reactionTime - graceWindow
  timeRatio: number;              // effectiveTime / timeLimit
  speedCategory: SpeedCategory;
  streakTier: StreakTier;
  isOptimalPerformance: boolean;  // top 10% performance
  calculationTime?: number;       // performance tracking
}

// Speed performance categories
export enum SpeedCategory {
  LIGHTNING = 'lightning',    // ≤ 20% of time limit
  VERY_FAST = 'very_fast',   // ≤ 40% of time limit
  FAST = 'fast',             // ≤ 60% of time limit
  NORMAL = 'normal',         // ≤ 80% of time limit
  SLOW = 'slow',             // ≤ 100% of time limit
  TOO_SLOW = 'too_slow'      // > 100% of time limit
}

// Streak performance tiers
export enum StreakTier {
  NONE = 'none',           // 0 streak
  BUILDING = 'building',   // 1-4 streak
  GOOD = 'good',          // 5-9 streak
  GREAT = 'great',        // 10-19 streak
  AMAZING = 'amazing',    // 20+ streak
}

// Complete scoring result
export interface ScoringResult {
  finalScore: number;
  components: ScoringComponents;
  breakdown: ScoringBreakdown;
  metadata: ScoringMetadata;
}

// Scoring configuration
export interface ScoringConfig {
  baseScore: number;
  maxSpeedMultiplier: number;
  minSpeedMultiplier: number;
  maxStreakBonus: number;
  streakMultiplier: number;
  levelMultiplier: number;
  perfectBonusBase: number;
  gameModeMultipliers: Record<string, number>;
  enableLookupTables: boolean;
  enablePerformanceTracking: boolean;
}

// Scoring validation result
export interface ScoringValidation {
  isValid: boolean;
  violations: string[];
  warnings: string[];
}

// Performance tracking
export interface ScoringPerformance {
  calculationsPerSecond: number;
  averageCalculationTime: number;
  lookupTableHitRate: number;
  memoryUsage: number;
}

// Default scoring configuration
export const DEFAULT_SCORING_CONFIG: ScoringConfig = {
  baseScore: 100,
  maxSpeedMultiplier: 2.0,
  minSpeedMultiplier: 0.1,
  maxStreakBonus: 500,
  streakMultiplier: 25,
  levelMultiplier: 10,
  perfectBonusBase: 50,
  gameModeMultipliers: {
    'classic': 1.0,
    'duel': 1.2,        // 20% bonus for faster pace
    'sudden-death': 1.5  // 50% bonus for high risk
  },
  enableLookupTables: true,
  enablePerformanceTracking: false
};

// Speed multiplier thresholds
export const SPEED_THRESHOLDS = {
  [SpeedCategory.LIGHTNING]: { max: 0.2, multiplier: 2.0 },
  [SpeedCategory.VERY_FAST]: { max: 0.4, multiplier: 1.5 },
  [SpeedCategory.FAST]: { max: 0.6, multiplier: 1.2 },
  [SpeedCategory.NORMAL]: { max: 0.8, multiplier: 1.0 },
  [SpeedCategory.SLOW]: { max: 1.0, multiplier: 0.5 },
  [SpeedCategory.TOO_SLOW]: { max: Infinity, multiplier: 0.1 }
};

// Streak tier thresholds
export const STREAK_THRESHOLDS = {
  [StreakTier.NONE]: { min: 0, max: 0 },
  [StreakTier.BUILDING]: { min: 1, max: 4 },
  [StreakTier.GOOD]: { min: 5, max: 9 },
  [StreakTier.GREAT]: { min: 10, max: 19 },
  [StreakTier.AMAZING]: { min: 20, max: Infinity }
};

// Scoring invariants for validation
export type ScoringInvariant = (result: ScoringResult, input: ScoringInput) => boolean;

export const SCORING_INVARIANTS: Record<string, ScoringInvariant> = {
  scoreNonNegative: (result) => result.finalScore >= 0,
  speedMultiplierBounds: (result) => 
    result.components.speedMultiplier >= 0.1 && result.components.speedMultiplier <= 2.0,
  streakBonusCapped: (result) => result.components.streakBonus <= 500,
  levelBonusProgressive: (result, input) => 
    result.components.levelBonus === input.level * 10,
  mathematicalConsistency: (result) => {
    const calculated = Math.floor(
      result.components.baseScore * result.components.speedMultiplier +
      result.components.streakBonus +
      result.components.levelBonus +
      result.components.perfectBonus
    ) * result.components.gameModeMultiplier;
    return Math.abs(calculated - result.finalScore) <= 1; // Allow for rounding
  },
  graceWindowConsistency: (result, input) => {
    const expectedGraceApplied = input.reactionTime <= input.graceWindow;
    return result.components.graceApplied === expectedGraceApplied;
  }
};