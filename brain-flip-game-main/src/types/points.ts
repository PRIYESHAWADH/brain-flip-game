// Game Points System Types (pure game-oriented)
export interface PointsBalance {
  gamePoints: number;        // GP main currency
  starCoins: number;         // SC premium currency
  eventTokens: number;       // ET event currency
  xp: number;               // Experience points for progression
  totalGamesPlayed: number; // Game statistics
  totalPerfectRounds: number; // Perfect reaction count
  bestStreak: number;       // Personal best streak
  lastUpdated: string;
}

export type PointsTransactionType =
  | 'earn_gameplay'
  | 'earn_streak'
  | 'earn_perfect_round'
  | 'earn_daily_bonus'
  | 'earn_achievement'
  | 'earn_challenge'
  | 'earn_referral'
  | 'spend_unlock'
  | 'spend_boost'
  | 'spend_cosmetic'
  | 'daily_reset'
  | 'level_milestone';

export interface PointsTransaction {
  id: string;
  userId: string;
  type: PointsTransactionType;
  amount: number;
  currency: 'GP' | 'SC' | 'ET';
  reason: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: 'bronze' | 'silver' | 'gold' | 'diamond' | 'neural';
  requirement: {
    type: 'streak' | 'level' | 'speed' | 'score' | 'games_played' | 'perfect_rounds';
    target: number;
  };
  reward: {
    gamePoints?: number;
    starCoins?: number;
    eventTokens?: number;
    title?: string;
  };
}

export interface AchievementRequirement {
  type: 'total_score' | 'streak' | 'perfect_rounds' | 'daily_streak' | 'level_reached' | 'reaction_time' | 'custom';
  target: number;
  timeframe?: 'session' | 'daily' | 'weekly' | 'all_time';
}

export interface PointsReward {
  currency: 'GP' | 'SC' | 'ET';
  amount: number;
  multiplier?: number;
}

export interface DailyChallenge {
  id: string;
  name: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
  requirements: AchievementRequirement;
  rewards: PointsReward[];
  expiresAt: string;
  completedBy: string[]; // userIds
}

export interface PlayerRank {
  tier: 'Novice' | 'Apprentice' | 'Skilled' | 'Expert' | 'Master' | 'Grandmaster' | 'Neural';
  level: number;
  xpCurrent: number;
  xpRequired: number;
  benefits: string[];
  dailyBonus: {
    gamePoints: number;
    starCoins: number;
  };
}

export interface StreakBonus {
  day: number;
  multiplier: number;
  bonusPoints: number;
  specialReward?: PointsReward;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  rank: number;
  totalGamePoints: number;
  weeklyPoints: number;
  monthlyPoints: number;
  seasonPoints: number;
  playerRank: PlayerRank;
  achievements: Achievement[];
  lastActive: string;
}
