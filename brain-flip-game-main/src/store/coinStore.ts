import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  CoinBalance, 
  CoinTransaction, 
  Achievement, 
  PlayerRank,
  GameResult,
  ScoreBreakdown 
} from '@/types/coins';
import { 
  calculateGameScore, 
  calculateCurrencyRewards, 
  calculatePlayerRank,
  checkAchievements,
  WORLD_CLASS_ACHIEVEMENTS 
} from '@/utils/coinSystem';

// Initial coin balance for new players
const initialCoinBalance: CoinBalance = {
  gameCoins: 100,              // Starting coins for first purchases
  starTokens: 0,
  diamondShards: 0,
  experiencePoints: 0,
  skillPoints: 0,
  trophyCoins: 0,
  dailyTokens: 5,              // Welcome bonus
  totalCoinsEarned: 100,
  totalGamesPlayed: 0,
  perfectStreakRecord: 0,
  lastUpdated: new Date().toISOString()
};

interface CoinStore {
  // State
  balance: CoinBalance;
  transactions: CoinTransaction[];
  achievements: Achievement[];
  unlockedAchievements: string[];
  playerRank: PlayerRank;
  lastScoreBreakdown: ScoreBreakdown | null;
  newlyUnlockedAchievements: Achievement[];
  dailyLoginStreak: number;
  lastDailyLogin: string | null;
  
  // Core currency operations
  addCoins: (amount: number, type: 'gameCoins' | 'starTokens' | 'diamondShards' | 'experiencePoints' | 'skillPoints' | 'trophyCoins' | 'dailyTokens', reason: string, gameData?: unknown) => void;
  spendCoins: (amount: number, type: 'gameCoins' | 'starTokens' | 'diamondShards' | 'experiencePoints' | 'skillPoints' | 'trophyCoins' | 'dailyTokens', reason: string) => boolean;
  
  // Game integration
  recordGameResult: (gameResult: GameResult) => ScoreBreakdown;
  
  // Daily systems
  claimDailyReward: () => boolean;
  
  // Achievement system
  unlockAchievement: (achievementId: string) => void;
  clearNewAchievements: () => void;
  
  // Rank system
  updatePlayerRank: () => void;
  
  // Utility functions
  getTransactionHistory: (limit?: number) => CoinTransaction[];
  getCoinEarningRate: () => number;
  resetCoins: () => void;
}

export const useCoinStore = create<CoinStore>()(
  persist(
    (set, get) => ({
      // Initial state
      balance: initialCoinBalance,
      transactions: [],
      achievements: WORLD_CLASS_ACHIEVEMENTS,
      unlockedAchievements: [],
      playerRank: calculatePlayerRank(0),
      lastScoreBreakdown: null,
      newlyUnlockedAchievements: [],
      dailyLoginStreak: 0,
      lastDailyLogin: null,
      
      // Add coins to balance
      addCoins: (amount, type, reason, gameData) => {
        set(state => {
          const currentAmount = state.balance[type] || 0;
          const newBalance = {
            ...state.balance,
            [type]: currentAmount + amount,
            totalCoinsEarned: state.balance.totalCoinsEarned + (type === 'gameCoins' ? amount : 0),
            lastUpdated: new Date().toISOString()
          };
          
          const transaction: CoinTransaction = {
            id: crypto.randomUUID(),
            userId: 'local-player',
            type: gameData ? 'earn' : 'bonus',
            amount,
            coinType: type as 'gameCoins' | 'starTokens' | 'diamondShards' | 'experiencePoints' | 'skillPoints' | 'trophyCoins' | 'dailyTokens',
            reason,
            gameData,
            timestamp: new Date().toISOString(),
            balanceAfter: Number(newBalance[type]) || 0
          };
          
          return {
            ...state,
            balance: newBalance,
            transactions: [transaction, ...state.transactions].slice(0, 1000) // Keep last 1000 transactions
          };
        });
      },
      
      // Spend coins from balance
      spendCoins: (amount, type, reason) => {
        const currentAmount = state.balance[type] || 0;
        if (currentAmount < amount) {
          return false; // Insufficient funds
        }
        
        set(currentState => {
          const currentTypeAmount = currentState.balance[type] || 0;
          const newBalance = {
            ...currentState.balance,
            [type]: currentTypeAmount - amount,
            lastUpdated: new Date().toISOString()
          };
          
          const transaction: CoinTransaction = {
            id: crypto.randomUUID(),
            userId: 'local-player',
            type: 'spend',
            amount: -amount,
            coinType: type as 'gameCoins' | 'starTokens' | 'diamondShards' | 'experiencePoints' | 'skillPoints' | 'trophyCoins' | 'dailyTokens',
            reason,
            timestamp: new Date().toISOString(),
            balanceAfter: Number(newBalance[type]) || 0
          };
          
          return {
            ...currentState,
            balance: newBalance,
            transactions: [transaction, ...currentState.transactions].slice(0, 1000)
          };
        });
        
        return true;
      },
      
      // Record game result and award single-currency coins equal to score
      recordGameResult: (gameResult) => {
        // Single currency: coins earned equals raw score of the run
        const coinsEarned = gameResult.score;
        
        // Update totals
        const newTotalGames = state.totalGamesPlayed + 1;
        const newTotalPerfect = state.totalPerfectRounds + (gameResult.perfectRounds || 0);
        const newBestStreak = Math.max(state.bestStreak, gameResult.streak || 0);
        
        // Check achievements (we only award their coin rewards)
        const newAchievements = checkAchievements(
          gameResult,
          newTotalGames,
          newTotalPerfect,
          newBestStreak,
          state.unlockedAchievements
        );

        let achievementCoins = 0;
        newAchievements.forEach(achievement => {
          achievementCoins += achievement.reward.gameCoins;
        });

        // Minimal breakdown aligned to single-coin system
        const breakdown = {
          baseScore: 0,
          speedMultiplier: 1,
          streakBonus: 0,
          levelBonus: 0,
          perfectBonus: 0,
          comboMultiplier: 1,
          difficultyBonus: 0,
          consistencyBonus: 0,
          subtotal: gameResult.score,
          finalScore: gameResult.score,
          gameCoinsEarned: coinsEarned,
          bonusCoinsEarned: achievementCoins,
          totalCoinsAwarded: coinsEarned + achievementCoins,
        } as ScoreBreakdown;

        // Update state with only coin changes
        set(currentState => {
          const newBalance = {
            ...currentState.balance,
            gameCoins: currentState.balance.gameCoins + coinsEarned + achievementCoins,
            totalCoinsEarned: currentState.balance.totalCoinsEarned + coinsEarned + achievementCoins,
            totalGamesPlayed: newTotalGames,
            perfectStreakRecord: newBestStreak,
            lastUpdated: new Date().toISOString()
          };

          const gameTransaction: CoinTransaction = {
            id: crypto.randomUUID(),
            userId: 'local-player',
            type: 'earn',
            amount: coinsEarned,
            coinType: 'gameCoins',
            reason: `Game completed - ${gameResult.gameMode}`,
            gameData: {
              score: scoreBreakdown.finalScore,
              level: gameResult.level,
              streak: gameResult.streak,
              reactionTime: gameResult.averageReactionTime,
              gameMode: gameResult.gameMode
            },
            timestamp: new Date().toISOString(),
            balanceAfter: updatedBalance.gameCoins
          };

          const newTransactions: CoinTransaction[] = [gameTransaction];

          // Add achievement coin transactions
          newAchievements.forEach(achievement => {
            if (achievement.reward.gameCoins > 0) {
              newTransactions.push({
                id: crypto.randomUUID(),
                userId: 'local-player',
                type: 'achievement',
                amount: achievement.reward.gameCoins,
                coinType: 'gameCoins',
                reason: `Achievement: ${achievement.name}`,
                timestamp: new Date().toISOString(),
                balanceAfter: updatedBalance.gameCoins
              });
            }
          });

          return {
            ...currentState,
            balance: updatedBalance,
            lastScoreBreakdown: scoreBreakdown,
            newlyUnlockedAchievements: newAchievements,
            unlockedAchievements: [...currentState.unlockedAchievements, ...newAchievements.map(a => a.id)],
            transactions: [...newTransactions, ...currentState.transactions].slice(0, 1000)
          };
        });

        // Rank update can still be based on existing XP (unchanged)
        get().updatePlayerRank();

        return scoreBreakdown;
      },
      
      // Daily reward system
      claimDailyReward: () => {


        
        if (state.lastDailyLogin === today) {
          return false; // Already claimed today
        }


        
        // Calculate daily rewards



        
        set(currentState => {
          const newBalance = {
            ...currentState.balance,
            gameCoins: Number(currentState.balance.gameCoins) + baseCoins + bonusCoins,
            starTokens: Number(currentState.balance.starTokens) + starTokens,
            dailyTokens: Number(currentState.balance.dailyTokens) + 1,
            lastUpdated: new Date().toISOString()
          };
          
          const newTransaction: CoinTransaction = {
            id: crypto.randomUUID(),
            userId: 'local-player',
            type: 'daily',
            amount: baseCoins + bonusCoins,
            coinType: 'gameCoins',
            reason: `Daily login streak ${newStreak}`,
            timestamp: new Date().toISOString(),
            balanceAfter: newBalance.gameCoins
          };
          
          return {
            ...currentState,
            balance: newBalance,
            dailyLoginStreak: newStreak,
            lastDailyLogin: today,
            transactions: [newTransaction, ...currentState.transactions].slice(0, 1000)
          };
        });
        
        return true;
      },
      
      // Achievement management
      unlockAchievement: (achievementId) => {
        set(state => {
          if (state.unlockedAchievements.includes(achievementId)) return state;

          if (!achievement) return state;
          
          return {
            ...state,
            unlockedAchievements: [...state.unlockedAchievements, achievementId],
            newlyUnlockedAchievements: [...state.newlyUnlockedAchievements, achievement]
          };
        });
      },
      
      clearNewAchievements: () => {
        set(state => ({
          ...state,
          newlyUnlockedAchievements: []
        }));
      },
      
      // Update player rank based on XP
      updatePlayerRank: () => {
        set(state => ({
          ...state,
          playerRank: calculatePlayerRank(state.balance.experiencePoints)
        }));
      },
      
      // Utility functions
      getTransactionHistory: (limit = 100) => {
        return get().transactions.slice(0, limit);
      },
      
      getCoinEarningRate: () => {

        return state.playerRank.benefits.coinMultiplier;
      },
      
      resetCoins: () => {
        set({
          balance: initialCoinBalance,
          transactions: [],
          unlockedAchievements: [],
          newlyUnlockedAchievements: [],
          playerRank: calculatePlayerRank(0),
          lastScoreBreakdown: null,
          dailyLoginStreak: 0,
          lastDailyLogin: null
        });
      }
    }),
    {
      name: 'brain-flip-coins',
      version: 1
    }
  )
);

// Legacy export for compatibility
export const usePointsStore = useCoinStore;
