// World-Class Coin System for Brain Flip Game
// Designed for future crypto integration and maximum user engagement

export interface CoinBalance {
  // Primary Gaming Currency
  gameCoins: number;           // Main coins earned through gameplay
  
  // Premium Currencies
  starTokens: number;          // Premium currency for special features
  diamondShards: number;       // Ultra-rare currency for exclusive items
  
  // Experience & Progression
  experiencePoints: number;    // XP for leveling up
  skillPoints: number;         // Points for skill tree progression
  
  // Special Currencies
  trophyCoins: number;         // Earned from achievements
  dailyTokens: number;         // Daily login and activity rewards
  
  // Metadata
  totalCoinsEarned: number;    // Lifetime coins earned
  totalGamesPlayed: number;    // Total games completed
  perfectStreakRecord: number; // Best perfect streak
  lastUpdated: string;         // ISO timestamp
}

export interface CoinTransaction {
  id: string;
  userId: string;
  type: 'earn' | 'spend' | 'bonus' | 'achievement' | 'daily' | 'penalty';
  amount: number;
  coinType: 'gameCoins' | 'starTokens' | 'diamondShards' | 'experiencePoints' | 'skillPoints' | 'trophyCoins' | 'dailyTokens';
  reason: string;
  gameData?: {
    score: number;
    level: number;
    streak: number;
    reactionTime: number;
    gameMode: string;
  };
  timestamp: string;
  balanceAfter: number;
}

export interface ScoreBreakdown {
  // Base scoring components
  baseScore: number;           // Base points (100)
  speedMultiplier: number;     // Speed-based multiplier (1.0 - 3.0)
  streakBonus: number;         // Consecutive correct answers
  levelBonus: number;          // Level progression bonus
  perfectBonus: number;        // Perfect timing bonus (<300ms)
  
  // Advanced bonuses
  comboMultiplier: number;     // Multi-combo bonus
  difficultyBonus: number;     // Game mode difficulty bonus
  consistencyBonus: number;    // Consistent performance bonus
  
  // Final calculations
  subtotal: number;            // Before multipliers
  finalScore: number;          // After all multipliers
  
  // Coin conversions
  gameCoinsEarned: number;     // Primary coins from score
  bonusCoinsEarned: number;    // Bonus coins from achievements
  totalCoinsAwarded: number;   // Total coins this game
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Diamond' | 'Legendary';
  category: 'gameplay' | 'streak' | 'speed' | 'progression' | 'special';
  
  requirement: {
    type: 'score' | 'streak' | 'games' | 'speed' | 'perfect' | 'combo';
    target: number;
    gameMode?: string;
  };
  
  reward: {
    gameCoins: number;
    starTokens: number;
    diamondShards: number;
    experiencePoints: number;
    trophyCoins: number;
    title?: string;
    cosmetic?: string;
  };
  
  isUnlocked: boolean;
  unlockedAt?: string;
  progress?: number;
}

export interface PlayerRank {
  id: string;
  name: string;
  tier: number;                // 1-20 tiers
  xpRequired: number;          // XP needed for this rank
  xpForNext: number;           // XP needed for next rank
  
  benefits: {
    dailyCoins: number;        // Daily coin bonus
    starTokens: number;        // Daily star token bonus
    coinMultiplier: number;    // Earning multiplier (1.0 - 2.5)
    exclusiveFeatures: string[]; // Unlocked features
    cosmetics: string[];       // Unlocked cosmetics
    specialAbilities: string[]; // Game bonuses
  };
  
  prestige: {
    level: number;             // Prestige level (after max rank)
    bonusMultiplier: number;   // Additional multiplier
    exclusiveRewards: string[]; // Prestige-only rewards
  };
}

export interface DailyRewards {
  day: number;                 // Day in cycle (1-7, then special bonuses)
  coins: number;
  starTokens: number;
  bonusMultiplier: number;     // Temporary boost
  specialReward?: {
    type: 'cosmetic' | 'boost' | 'currency';
    item: string;
    duration?: number;         // For temporary boosts
  };
}

export interface GameResult {
  score: number;
  level: number;
  streak: number;
  perfectRounds: number;
  averageReactionTime: number;
  gameMode: string;
  duration: number;
  isNewRecord: boolean;
  achievements: string[];      // Achievement IDs unlocked this game
}

// Coin earning formulas and constants
export const COIN_FORMULAS = {
  // Base coin earning: 1 coin per 50 score points
  BASE_COIN_RATE: 0.02,
  
  // Bonus multipliers
  SPEED_MULTIPLIER_MAX: 2.0,     // Up to 2x for lightning speed
  STREAK_MULTIPLIER_MAX: 3.0,    // Up to 3x for long streaks
  PERFECT_BONUS: 50,             // Flat bonus for perfect rounds
  
  // Star token earning (premium currency)
  STAR_TOKEN_THRESHOLD: 1000,    // Score needed for 1 star token
  DAILY_STAR_TOKENS: 5,          // Daily login bonus
  
  // Diamond shard earning (ultra-rare)
  DIAMOND_SHARD_THRESHOLD: 5000, // Score needed for 1 diamond shard
  ACHIEVEMENT_DIAMOND_SHARDS: 1, // Per major achievement
  
  // Experience points
  XP_PER_GAME: 10,               // Base XP per game
  XP_SCORE_MULTIPLIER: 0.1,      // Additional XP from score
  
  // Penalty for poor performance
  MINIMUM_COINS_PER_GAME: 1,     // Always earn at least 1 coin
};

export const RANK_THRESHOLDS = [
  { name: 'Beginner', xp: 0, tier: 1 },
  { name: 'Novice', xp: 100, tier: 2 },
  { name: 'Learner', xp: 300, tier: 3 },
  { name: 'Student', xp: 600, tier: 4 },
  { name: 'Apprentice', xp: 1000, tier: 5 },
  { name: 'Skilled', xp: 1500, tier: 6 },
  { name: 'Talented', xp: 2200, tier: 7 },
  { name: 'Expert', xp: 3000, tier: 8 },
  { name: 'Specialist', xp: 4000, tier: 9 },
  { name: 'Master', xp: 5500, tier: 10 },
  { name: 'Grandmaster', xp: 7500, tier: 11 },
  { name: 'Champion', xp: 10000, tier: 12 },
  { name: 'Legend', xp: 13500, tier: 13 },
  { name: 'Mythic', xp: 18000, tier: 14 },
  { name: 'Immortal', xp: 24000, tier: 15 },
  { name: 'Divine', xp: 32000, tier: 16 },
  { name: 'Celestial', xp: 42000, tier: 17 },
  { name: 'Transcendent', xp: 55000, tier: 18 },
  { name: 'Omniscient', xp: 75000, tier: 19 },
  { name: 'Neural Emperor', xp: 100000, tier: 20 },
];
