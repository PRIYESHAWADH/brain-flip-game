/**
 * Comprehensive scoring system with performance optimization
 */

import {
  ScoringInput,
  ScoringResult,
  ScoringComponents,
  ScoringBreakdown,
  ScoringMetadata,
  ScoringConfig,
  ScoringValidation,
  SpeedCategory,
  StreakTier,
  DEFAULT_SCORING_CONFIG,
  SPEED_THRESHOLDS,
  STREAK_THRESHOLDS,
  SCORING_INVARIANTS
} from '@/types/scoring';

// Performance optimization: lookup tables
let SPEED_MULTIPLIER_CACHE: Map<string, number> | null = null;
let STREAK_BONUS_CACHE: number[] | null = null;
let LEVEL_BONUS_CACHE: number[] | null = null;
let PERFECT_BONUS_CACHE: number[] | null = null;

// Configuration
let currentConfig: ScoringConfig = DEFAULT_SCORING_CONFIG;

// Performance tracking
let performanceStats = {
  totalCalculations: 0,
  totalTime: 0,
  cacheHits: 0,
  cacheMisses: 0
};

/**
 * Initialize the scoring system with configuration
 */
export function initializeScoring(config: Partial<ScoringConfig> = {}): void {
  currentConfig = { ...DEFAULT_SCORING_CONFIG, ...config };
  
  if (currentConfig.enableLookupTables) {
    initializeLookupTables();
  }
  
  // Reset performance stats
  performanceStats = {
    totalCalculations: 0,
    totalTime: 0,
    cacheHits: 0,
    cacheMisses: 0
  };
}

/**
 * Main scoring calculation function
 */
export function calculateScore(input: ScoringInput): ScoringResult {
  const startTime = getPerformance().now();
  
  try {
    // Sanitize inputs to avoid NaN/negative propagation
    const safeInput: ScoringInput = {
      ...input,
      reactionTime: Number.isFinite(input.reactionTime) ? Math.max(0, input.reactionTime) : 0,
      timeLimit: Number.isFinite(input.timeLimit) && input.timeLimit > 0 ? input.timeLimit : 3000,
      streak: Number.isFinite(input.streak) ? Math.max(0, input.streak) : 0,
      level: Number.isFinite(input.level) ? Math.max(1, input.level) : 1
    } as ScoringInput;
    // Calculate individual components
    const components = calculateScoringComponents(safeInput);
    
    // Create breakdown for UI display
    const breakdown = createScoringBreakdown(components);
    
    // Generate metadata
    const metadata = createScoringMetadata(safeInput, components);
    
    // Calculate final score
    const finalScore = Math.floor(breakdown.totalPoints);



    
    const result: ScoringResult = {
      finalScore,
      components,
      breakdown,
      metadata
    };
    
    // Track performance
    if (currentConfig.enablePerformanceTracking) {
      const duration = getPerformance().now() - startTime;
      performanceStats.totalCalculations++;
      performanceStats.totalTime += duration;
      result.metadata.calculationTime = duration;
    }
    
    return result;
    
  } catch (error) {
    // Fallback to basic scoring on error
    console.error('Scoring calculation error:', error);
    return createFallbackScore({
      reactionTime: 0,
      timeLimit: 3000,
      streak: 0,
      level: 1,
      graceWindow: 0,
      gameMode: 'classic'
    } as any);
  }
}

/**
 * Calculate individual scoring components
 */
function calculateScoringComponents(input: ScoringInput): ScoringComponents {
  const { reactionTime, timeLimit, streak, level, graceWindow, gameMode } = input;
  const effectiveTime = Math.max(0, reactionTime - (graceWindow || 0));
  const graceApplied = reactionTime <= (graceWindow || 0);
  
  return {
    baseScore: currentConfig.baseScore,
    speedMultiplier: calculateSpeedMultiplier(effectiveTime, input.timeLimit),
    streakBonus: calculateStreakBonus(input.streak),
    levelBonus: calculateLevelBonus(input.level),
    perfectBonus: input.isPerfectRound ? calculatePerfectBonus(input.level) : 0,
    gameModeMultiplier: calculateGameModeMultiplier(input.gameMode),
    graceApplied
  };
}

/**
 * Calculate speed multiplier based on reaction time
 */
export function calculateSpeedMultiplier(effectiveTime: number, timeLimit: number): number {
  if (timeLimit <= 0) return currentConfig.minSpeedMultiplier;
  const timeRatio = effectiveTime / timeLimit;
  let multiplier = 1.0;

  for (const [category, threshold] of Object.entries(SPEED_THRESHOLDS)) {
    if (timeRatio <= threshold.max) {
      multiplier = threshold.multiplier;
      break;
    }
  }
  return Math.max(currentConfig.minSpeedMultiplier, Math.min(currentConfig.maxSpeedMultiplier, multiplier));
}

/**
 * Calculate streak bonus
 */
export function calculateStreakBonus(streak: number): number {
  if (streak <= 0) return 0;
  
  // Use lookup table if available
  if (STREAK_BONUS_CACHE && streak < STREAK_BONUS_CACHE.length) {
    performanceStats.cacheHits++;
    return STREAK_BONUS_CACHE[streak];
  }
  
  performanceStats.cacheMisses++;
  
  // Calculate streak bonus with exponential growth and cap
  const bonus = Math.min(
    streak * currentConfig.streakMultiplier,
    currentConfig.maxStreakBonus
  );
  return Math.floor(bonus);
}

/**
 * Calculate level bonus
 */
export function calculateLevelBonus(level: number): number {
  if (level <= 0) return 0;
  
  // Use lookup table if available
  if (LEVEL_BONUS_CACHE && level < LEVEL_BONUS_CACHE.length) {
    performanceStats.cacheHits++;
    return LEVEL_BONUS_CACHE[level];
  }
  
  performanceStats.cacheMisses++;
  
  // Linear level bonus
  return level * currentConfig.levelMultiplier;
}

/**
 * Calculate perfect round bonus
 */
export function calculatePerfectBonus(level: number): number {
  if (level <= 0) return 0;
  
  // Use lookup table if available
  if (PERFECT_BONUS_CACHE && level < PERFECT_BONUS_CACHE.length) {
    performanceStats.cacheHits++;
    return PERFECT_BONUS_CACHE[level];
  }
  
  performanceStats.cacheMisses++;
  
  // Perfect bonus scales with level
  const bonus = currentConfig.perfectBonusBase + (level * 5);
  return Math.floor(bonus);
}

/**
 * Calculate game mode multiplier
 */
export function calculateGameModeMultiplier(gameMode?: string): number {
  if (!gameMode) return 1.0;
  
  return currentConfig.gameModeMultipliers[gameMode] || 1.0;
}

/**
 * Create scoring breakdown for UI display
 */
function createScoringBreakdown(components: ScoringComponents): ScoringBreakdown {
  const basePoints = Math.floor(components.baseScore * components.speedMultiplier);
  const streakPoints = components.streakBonus;
  const levelPoints = components.levelBonus;
  const perfectPoints = components.perfectBonus;
  const gameModePoints = Math.floor((basePoints + streakPoints + levelPoints + perfectPoints) * (components.gameModeMultiplier - 1));
  const totalPoints = Math.floor((basePoints + streakPoints + levelPoints + perfectPoints) * components.gameModeMultiplier);
  
  return {
    basePoints,
    streakPoints,
    levelPoints,
    perfectPoints,
    gameModePoints,
    totalPoints
  };
}

/**
 * Create scoring metadata
 */
function createScoringMetadata(input: ScoringInput, components: ScoringComponents): ScoringMetadata {
  const effectiveReactionTime = Math.max(0, input.reactionTime - (input.graceWindow || 0));
  const timeRatio = effectiveReactionTime / input.timeLimit;
  
  return {
    effectiveReactionTime,
    timeRatio,
    speedCategory: getSpeedCategory(timeRatio),
    streakTier: getStreakTier(input.streak),
    isOptimalPerformance: timeRatio <= 0.2 && input.streak >= 10, // Top 10% performance
  };
}

/**
 * Get speed category from time ratio
 */
function getSpeedCategory(timeRatio: number): SpeedCategory {
  for (const [category, threshold] of Object.entries(SPEED_THRESHOLDS)) {
    if (timeRatio <= threshold.max) {
      return category as SpeedCategory;
    }
  }
  return SpeedCategory.TOO_SLOW;
}

/**
 * Get streak tier from streak value
 */
function getStreakTier(streak: number): StreakTier {
  for (const [tier, threshold] of Object.entries(STREAK_THRESHOLDS)) {
    if (streak >= threshold.min && streak <= threshold.max) {
      return tier as StreakTier;
    }
  }
  return StreakTier.NONE;
}

/**
 * Validate scoring result
 */
export function validateScoring(result: ScoringResult, input: ScoringInput): ScoringValidation {
  const violations: string[] = [];
  const warnings: string[] = [];
  
  // Check all invariants
  for (const [name, invariant] of Object.entries(SCORING_INVARIANTS)) {
    try {
      if (!invariant(result, input)) {
        violations.push(name);
      }
    } catch (error) {
      violations.push(`${name} (error: ${error})`);
    }
  }
  
  // Check for warnings
  if (result.finalScore > 10000) {
    warnings.push('Unusually high score detected');
  }
  
  if (result.metadata.timeRatio > 2.0) {
    warnings.push('Reaction time significantly exceeds time limit');
  }
  
  if (input.streak > 100) {
    warnings.push('Unusually high streak detected');
  }
  
  return {
    isValid: violations.length === 0,
    violations,
    warnings
  };
}

/**
 * Initialize lookup tables for performance optimization
 */
function initializeLookupTables(): void {
  const initTime = getPerformance().now();
  
  // Speed multiplier cache
  SPEED_MULTIPLIER_CACHE = new Map();
  for (let time = 0; time <= 10000; time += 10) {
    for (let limit = 500; limit <= 5000; limit += 100) {
      const timeRatio = time / limit;
      let multiplier = 1.0;
      
      for (const threshold of Object.values(SPEED_THRESHOLDS)) {
        if (timeRatio <= threshold.max) {
          multiplier = threshold.multiplier;
          break;
        }
      }
      
      const key = `${time}_${limit}`;
      SPEED_MULTIPLIER_CACHE.set(key, multiplier);
    }
  }
  
  // Streak bonus cache
  STREAK_BONUS_CACHE = new Array(1001);
  for (let streak = 0; streak <= 1000; streak++) {
    STREAK_BONUS_CACHE[streak] = Math.min(
      streak * currentConfig.streakMultiplier,
      currentConfig.maxStreakBonus
    );
  }
  
  // Level bonus cache
  LEVEL_BONUS_CACHE = new Array(101);
  for (let level = 0; level <= 100; level++) {
    LEVEL_BONUS_CACHE[level] = level * currentConfig.levelMultiplier;
  }
  
  // Perfect bonus cache
  PERFECT_BONUS_CACHE = new Array(101);
  for (let level = 0; level <= 100; level++) {
    PERFECT_BONUS_CACHE[level] = currentConfig.perfectBonusBase + (level * 5);
  }

  // Log actual initialization duration instead of start timestamp
  const initDuration = getPerformance().now() - initTime;
  console.log(`Scoring lookup tables initialized in ${initDuration.toFixed(2)}ms`);
}

/**
 * Create fallback score on error
 */
function createFallbackScore(input: ScoringInput): ScoringResult {
  const components: ScoringComponents = {
    baseScore: 100,
    speedMultiplier: 1.0,
    streakBonus: Math.min(input.streak * 25, 500),
    levelBonus: input.level * 10,
    perfectBonus: 0,
    gameModeMultiplier: 1.0,
    graceApplied: false
  };

  const finalScore = Math.floor(
    components.baseScore * components.speedMultiplier +
    components.streakBonus +
    components.levelBonus
  );
  
  return {
    finalScore,
    components,
    breakdown: createScoringBreakdown(components),
    metadata: {
      effectiveReactionTime: input.reactionTime,
      timeRatio: input.reactionTime / input.timeLimit,
      speedCategory: SpeedCategory.NORMAL,
      streakTier: getStreakTier(input.streak),
      isOptimalPerformance: false
    }
  };
}

/**
 * Get performance statistics
 */
export function getScoringPerformance(): {
  calculationsPerSecond: number;
  averageCalculationTime: number;
  cacheHitRate: number;
  totalCalculations: number;
} {
  const totalTime = performanceStats.totalTime / 1000; // Convert to seconds
  const totalCacheAccess = performanceStats.cacheHits + performanceStats.cacheMisses;
  
  return {
    calculationsPerSecond: totalTime > 0 ? performanceStats.totalCalculations / totalTime : 0,
    averageCalculationTime: performanceStats.totalCalculations > 0 
      ? performanceStats.totalTime / performanceStats.totalCalculations 
      : 0,
    cacheHitRate: totalCacheAccess > 0 ? performanceStats.cacheHits / totalCacheAccess : 0,
    totalCalculations: performanceStats.totalCalculations
  };
}

/**
 * Reset performance statistics
 */
export function resetScoringPerformance(): void {
  performanceStats = {
    totalCalculations: 0,
    totalTime: 0,
    cacheHits: 0,
    cacheMisses: 0
  };
}

/**
 * Legacy compatibility function
 */
export function calculateScoreLegacy(reactionTime: number, streak: number, level: number): number {
  // Fast-path sanitize and inline minimal calc to avoid overhead in tight loops
  const rt = Math.max(0, Math.min(reactionTime, 10000));
  const st = Math.max(0, Math.min(streak, 100));
  const lv = Math.max(1, Math.min(level, 100));
  const DEFAULT_LIMIT = 3000;
  
  // Ensure lookup tables are initialized for performance
  if (!SPEED_MULTIPLIER_CACHE || !STREAK_BONUS_CACHE || !LEVEL_BONUS_CACHE) {
    initializeLookupTables();
  }
  if (SPEED_MULTIPLIER_CACHE && STREAK_BONUS_CACHE && LEVEL_BONUS_CACHE) {
    // Use quantized keys consistent with initialization ranges
    const quantizedTime = Math.floor(rt / 10) * 10; // 0..10000 by 10ms
    const key = `${quantizedTime}_${DEFAULT_LIMIT}`;
    const speedMultiplier = (SPEED_MULTIPLIER_CACHE instanceof Map)
      ? (SPEED_MULTIPLIER_CACHE.get(key) ?? calculateSpeedMultiplier(rt, DEFAULT_LIMIT))
      : calculateSpeedMultiplier(rt, DEFAULT_LIMIT);
    const streakBonus = STREAK_BONUS_CACHE[st] ?? 0;
    const levelBonus = LEVEL_BONUS_CACHE[lv] ?? 0;
    const score = Math.floor(speedMultiplier * 100 + streakBonus + levelBonus);
    
    // Monotonic tie-breaker: award up to ~50 extra points across the 0-10s range,
    // ensuring lower reaction times produce strictly higher scores even within the same bucket.
    const micro = Math.max(0, Math.floor((10000 - rt) / 200));
    
    return Math.max(0, (score + micro) | 0);
  }

  // Fallback to full calculation
  const result = calculateScore({
    reactionTime: rt,
    timeLimit: DEFAULT_LIMIT, // Default time limit
    streak: st,
    level: lv,
    graceWindow: 75
  });

  // Apply the same monotonic tie-breaker in the fallback path
  const micro = Math.max(0, Math.floor((10000 - rt) / 200));
  return Math.max(0, (result.finalScore + micro) | 0);
}

// Legacy compatibility functions for existing stores
export function calculateDetailedScore(reactionTime: number, streak: number, level: number) {
  const result = calculateScore({
    reactionTime,
    timeLimit: 3000, // Default time limit
    streak,
    level,
    graceWindow: 75
  });
  
  return {
    finalScore: result.finalScore,
    baseScore: result.components.baseScore,
    speedMultiplier: result.components.speedMultiplier,
    streakBonus: result.components.streakBonus,
    levelBonus: result.components.levelBonus,
    perfectBonus: result.components.perfectBonus,
    totalCoinsAwarded: Math.floor(result.finalScore / 10), // Simple conversion
    breakdown: result.breakdown,
    metadata: result.metadata
  };
}

export function calculateCurrencyRewards(scoreBreakdown: unknown, streak?: number, level?: number, isGameOver?: boolean) {
  // Simple currency reward calculation
  const baseReward = Math.floor((scoreBreakdown as any).finalScore / 10);
  
  return {
    gamePoints: baseReward,
    starCoins: (scoreBreakdown as any).finalScore >= 1000 ? Math.floor((scoreBreakdown as any).finalScore / 1000) : 0,
    eventTokens: isGameOver ? 1 : 0,
    xp: 50 + Math.floor((scoreBreakdown as any).finalScore * 0.1)
  };
}

export function calculateRank(xp: number) {
  const ranks = [
    { name: 'Novice' as const, xpRequired: 0, level: 1 },
    { name: 'Apprentice' as const, xpRequired: 1000, level: 2 },
    { name: 'Skilled' as const, xpRequired: 2500, level: 3 },
    { name: 'Expert' as const, xpRequired: 5000, level: 4 },
    { name: 'Master' as const, xpRequired: 10000, level: 5 },
    { name: 'Grandmaster' as const, xpRequired: 20000, level: 6 },
    { name: 'Neural' as const, xpRequired: 50000, level: 7 }
  ];

  let currentRank = ranks[0];
  let nextRank = ranks[1];
  
  for (let i = 0; i < ranks.length - 1; i++) {
    if (xp >= ranks[i].xpRequired && xp < ranks[i + 1].xpRequired) {
      currentRank = ranks[i];
      nextRank = ranks[i + 1];
      break;
    }
  }
  
  if (xp >= ranks[ranks.length - 1].xpRequired) {
    currentRank = ranks[ranks.length - 1];
    nextRank = currentRank;
  }
  
  return {
    tier: currentRank.name,
    level: currentRank.level,
    xpCurrent: xp,
    xpRequired: nextRank.xpRequired,
    benefits: [`${currentRank.name} rank benefits`],
    dailyBonus: {
      gamePoints: currentRank.level * 10,
      starCoins: Math.floor(currentRank.level / 2)
    }
  };
}

// Simple achievements for compatibility - matches pointsStore expectations
export const ACHIEVEMENTS = [
  {
    id: 'first_win',
    name: 'First Victory',
    description: 'Win your first game',
    icon: '🏆',
    tier: 'bronze' as const,
    requirement: { type: 'games_played' as const, target: 1 },
    reward: { gamePoints: 100 }
  },
  {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'React in under 200ms',
    icon: '⚡',
    tier: 'gold' as const,
    requirement: { type: 'speed' as const, target: 200 },
    reward: { gamePoints: 200, starCoins: 1 }
  },
  {
    id: 'streak_master',
    name: 'Streak Master',
    description: 'Achieve a 20+ streak',
    icon: '🔥',
    tier: 'silver' as const,
    requirement: { type: 'streak' as const, target: 20 },
    reward: { gamePoints: 300, starCoins: 2 }
  },
  {
    id: 'level_crusher',
    name: 'Level Crusher',
    description: 'Reach level 30',
    icon: '🚀',
    tier: 'diamond' as const,
    requirement: { type: 'level' as const, target: 30 },
    reward: { gamePoints: 500, starCoins: 5 }
  },
  {
    id: 'perfect_master',
    name: 'Perfect Master',
    description: 'Complete 10 perfect rounds',
    icon: '💎',
    tier: 'diamond' as const,
    requirement: { type: 'perfect_rounds' as const, target: 10 },
    reward: { gamePoints: 400, starCoins: 3, eventTokens: 2 }
  }
] as any; // Type assertion for compatibility

// Initialize scoring system on module load
initializeScoring();

// Cross-platform performance.now() wrapper
function getPerformance() {
  if (typeof window === 'undefined') {
    try {
      // Use dynamic require via eval to avoid bundling on the client
      const nodePerf: any = (eval('require')('perf_hooks')).performance;
      return nodePerf;
    } catch {
      return { now: () => Date.now() } as any;
    }
  } else if (typeof performance !== 'undefined') {
    return performance as any;
  } else {
    return { now: () => Date.now() } as any;
  }
}