import { create } from 'zustand';
import type {
  PointsTransactionType,
  PointsBalance,
  PointsTransaction,
  Achievement,
  LeaderboardEntry,
  PlayerRank,
  PointsReward,
} from '@/types/points';
import { calculateDetailedScore, calculateCurrencyRewards, calculateRank, ACHIEVEMENTS } from '@/utils/scoring';

// Initial points balance for a new player
const initialBalance: PointsBalance = {
  gamePoints: 0,      // GP: main currency
  starCoins: 0,       // SC: premium currency
  eventTokens: 0,     // ET: event currency
  xp: 0,             // Experience points
  totalGamesPlayed: 0,
  totalPerfectRounds: 0,
  bestStreak: 0,
  lastUpdated: new Date().toISOString(),
};

export interface PointsStore {
  balance: PointsBalance;
  transactions: PointsTransaction[];
  achievements: Achievement[];
  unlockedAchievements: string[];
  leaderboard: LeaderboardEntry[];
  playerRank: PlayerRank;
  lastScoreBreakdown?: {
    score: unknown;
    points: unknown;
  };
  
  // Core currency operations
  addPoints: (amount: number, reason: string) => void;
  addStarCoins: (amount: number, reason: string) => void;
  addEventTokens: (amount: number, reason: string) => void;
  addXP: (amount: number, reason: string) => void;
  spendPoints: (amount: number, reason: string) => boolean;
  spendStarCoins: (amount: number, reason: string) => boolean;
  spendEventTokens: (amount: number, reason: string) => boolean;
  
  // Game integration
  recordGameResult: (reactionTime: number, streak: number, level: number, isGameOver: boolean) => void;
  checkAchievements: () => Achievement[];
  updateRank: () => void;
  
  // Utility
  logTransaction: (tx: PointsTransaction) => void;
  resetPoints: () => void;
}

export const usePointsStore = create<PointsStore>((set, get) => ({
  balance: initialBalance,
  transactions: [],
  achievements: ACHIEVEMENTS,
  unlockedAchievements: [],
  leaderboard: [],
  playerRank: {
    tier: 'Novice',
    level: 1,
    xpCurrent: 0,
    xpRequired: 1000,
    benefits: ['Basic customization'],
    dailyBonus: { gamePoints: 50, starCoins: 0 }
  },
  lastScoreBreakdown: undefined,
  
  addPoints: (amount, reason) => {
    set(state => {
      const newBalance = {
        ...state.balance,
        gamePoints: state.balance.gamePoints + amount,
        lastUpdated: new Date().toISOString(),
      };
      const tx: PointsTransaction = {
        id: crypto.randomUUID(),
        userId: 'local',
        type: 'earn_gameplay',
        amount,
        currency: 'GP',
        reason,
        timestamp: new Date().toISOString(),
      };
      return {
        ...state,
        balance: newBalance,
        transactions: [...state.transactions, tx],
      };
    });
  },
  
  addStarCoins: (amount, reason) => {
    set(state => {
      const newBalance = {
        ...state.balance,
        starCoins: state.balance.starCoins + amount,
        lastUpdated: new Date().toISOString(),
      };
      const tx: PointsTransaction = {
        id: crypto.randomUUID(),
        userId: 'local',
        type: 'earn_achievement',
        amount,
        currency: 'SC',
        reason,
        timestamp: new Date().toISOString(),
      };
      return {
        ...state,
        balance: newBalance,
        transactions: [...state.transactions, tx],
      };
    });
  },
  
  addEventTokens: (amount, reason) => {
    set(state => {
      const newBalance = {
        ...state.balance,
        eventTokens: state.balance.eventTokens + amount,
        lastUpdated: new Date().toISOString(),
      };
      const tx: PointsTransaction = {
        id: crypto.randomUUID(),
        userId: 'local',
        type: 'earn_challenge',
        amount,
        currency: 'ET',
        reason,
        timestamp: new Date().toISOString(),
      };
      return {
        ...state,
        balance: newBalance,
        transactions: [...state.transactions, tx],
      };
    });
  },
  
  addXP: (amount, reason) => {
    set(state => {
      const newBalance = {
        ...state.balance,
        xp: state.balance.xp + amount,
        lastUpdated: new Date().toISOString(),
      };
      return {
        ...state,
        balance: newBalance,
      };
    });
    get().updateRank();
  },
  
  recordGameResult: (reactionTime, streak, level, isGameOver) => {
    const { balance } = get();
    
    // Calculate detailed score breakdown
    const pointsBreakdown = calculatePointsBreakdown(reactionTime, streak, level, isGameOver);
    
    // Update statistics
    const updatedBalance: PointsBalance = {
      ...balance,
      gamePoints: balance.gamePoints + pointsBreakdown.gamePoints,
      starCoins: balance.starCoins + pointsBreakdown.starCoins,
      eventTokens: balance.eventTokens + pointsBreakdown.eventTokens,
      xp: balance.xp + pointsBreakdown.xp,
      totalGamesPlayed: isGameOver ? balance.totalGamesPlayed + 1 : balance.totalGamesPlayed,
      totalPerfectRounds: reactionTime < 500 ? balance.totalPerfectRounds + 1 : balance.totalPerfectRounds,
      bestStreak: Math.max(balance.bestStreak, streak),
      lastUpdated: new Date().toISOString(),
    };
    
    set(state => ({
      ...state,
      balance: updatedBalance,
      lastScoreBreakdown: {
        score: scoreBreakdown,
        points: pointsBreakdown
      }
    }));
    
    // Check for new achievements
    get().checkAchievements();
    get().updateRank();
  },
  
  checkAchievements: () => {
    const { balance, unlockedAchievements } = get();
    const newAchievements: Achievement[] = [];
    
    for (const achievement of ACHIEVEMENTS) {
      if (unlockedAchievements.includes(achievement.id)) continue;

      switch (achievement.requirement.type) {
        case 'games_played':
          unlocked = balance.totalGamesPlayed >= achievement.requirement.target;
          break;
        case 'streak':
          unlocked = balance.bestStreak >= achievement.requirement.target;
          break;
        case 'perfect_rounds':
          unlocked = balance.totalPerfectRounds >= achievement.requirement.target;
          break;
        case 'level':
          // This would need to be tracked separately per game
          break;
        case 'speed':
          // This would need to be tracked as best reaction time
          break;
        case 'score':
          // This would need to be tracked as best score
          break;
      }
      
      if (unlocked) {
        newAchievements.push(achievement);
        set(state => ({
          ...state,
          unlockedAchievements: [...state.unlockedAchievements, achievement.id]
        }));
        
        // Award achievement rewards
        if (achievement.reward.gamePoints) {
          get().addPoints(achievement.reward.gamePoints, `Achievement: ${achievement.name}`);
        }
        if (achievement.reward.starCoins) {
          get().addStarCoins(achievement.reward.starCoins, `Achievement: ${achievement.name}`);
        }
        if (achievement.reward.eventTokens) {
          get().addEventTokens(achievement.reward.eventTokens, `Achievement: ${achievement.name}`);
        }
      }
    }
    
    return newAchievements;
  },
  
  updateRank: () => {
    const { balance } = get();

    set(state => ({
      ...state,
      playerRank: newRank
    }));
  },
  
  spendPoints: (amount, reason) => {
    const { balance } = get();
    if (balance.gamePoints < amount) return false;
    set(state => {
      const newBalance = {
        ...state.balance,
        gamePoints: state.balance.gamePoints - amount,
        lastUpdated: new Date().toISOString(),
      };
      const tx: PointsTransaction = {
        id: crypto.randomUUID(),
        userId: 'local',
        type: 'spend_unlock',
        amount,
        currency: 'GP',
        reason,
        timestamp: new Date().toISOString(),
      };
      return {
        ...state,
        balance: newBalance,
        transactions: [...state.transactions, tx],
      };
    });
    return true;
  },
  
  spendStarCoins: (amount, reason) => {
    const { balance } = get();
    if (balance.starCoins < amount) return false;
    set(state => {
      const newBalance = {
        ...state.balance,
        starCoins: state.balance.starCoins - amount,
        lastUpdated: new Date().toISOString(),
      };
      const tx: PointsTransaction = {
        id: crypto.randomUUID(),
        userId: 'local',
        type: 'spend_cosmetic',
        amount,
        currency: 'SC',
        reason,
        timestamp: new Date().toISOString(),
      };
      return {
        ...state,
        balance: newBalance,
        transactions: [...state.transactions, tx],
      };
    });
    return true;
  },
  
  spendEventTokens: (amount, reason) => {
    const { balance } = get();
    if (balance.eventTokens < amount) return false;
    set(state => {
      const newBalance = {
        ...state.balance,
        eventTokens: state.balance.eventTokens - amount,
        lastUpdated: new Date().toISOString(),
      };
      const tx: PointsTransaction = {
        id: crypto.randomUUID(),
        userId: 'local',
        type: 'spend_boost',
        amount,
        currency: 'ET',
        reason,
        timestamp: new Date().toISOString(),
      };
      return {
        ...state,
        balance: newBalance,
        transactions: [...state.transactions, tx],
      };
    });
    return true;
  },
  
  logTransaction: (tx) => {
    set(state => ({
      ...state,
      transactions: [...state.transactions, tx],
    }));
  },
  
  resetPoints: () => {
    set({
      balance: initialBalance,
      transactions: [],
      achievements: ACHIEVEMENTS,
      unlockedAchievements: [],
      leaderboard: [],
      playerRank: {
        tier: 'Novice',
        level: 1,
        xpCurrent: 0,
        xpRequired: 1000,
        benefits: ['Basic customization'],
        dailyBonus: { gamePoints: 50, starCoins: 0 }
      },
      lastScoreBreakdown: undefined,
    });
  },
}));
