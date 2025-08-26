import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface LoginReward {
  day: number;
  points: number;
  starCoins: number;
  special?: string; // Special reward like avatar piece
}

interface LoginStreakStore {
  currentStreak: number;
  lastLoginDate: string;
  totalLogins: number;
  claimedToday: boolean;
  
  // Actions
  checkDailyLogin: () => boolean; // Returns true if new day
  claimDailyReward: () => LoginReward | null;
  getStreakReward: (day: number) => LoginReward;
  resetStreak: () => void;
}

const DAILY_REWARDS: LoginReward[] = [
  { day: 1, points: 20, starCoins: 0 },
  { day: 2, points: 30, starCoins: 0 },
  { day: 3, points: 75, starCoins: 1 },
  { day: 4, points: 100, starCoins: 1 },
  { day: 5, points: 150, starCoins: 1 },
  { day: 6, points: 200, starCoins: 2 },
  { day: 7, points: 300, starCoins: 3, special: 'Weekly Champion Badge' },
  { day: 14, points: 800, starCoins: 5, special: 'Dedication Avatar' },
  { day: 30, points: 2500, starCoins: 10, special: 'Monthly Master Crown' }
];

export const useLoginStreakStore = create<LoginStreakStore>()(
  persist(
    (set, get) => ({
      currentStreak: 0,
      lastLoginDate: '',
      totalLogins: 0,
      claimedToday: false,
      
      checkDailyLogin: () => {
        const { lastLoginDate, currentStreak } = get();
        
        if (lastLoginDate === today) {
          return false; // Already logged in today
        }
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (lastLoginDate === yesterdayStr) {
          // Consecutive day
          set({ 
            currentStreak: currentStreak + 1,
            lastLoginDate: today,
            totalLogins: get().totalLogins + 1,
            claimedToday: false
          });
        } else {
          // Streak broken or first login
          set({ 
            currentStreak: 1,
            lastLoginDate: today,
            totalLogins: get().totalLogins + 1,
            claimedToday: false
          });
        }
        
        return true; // New day login
      },
      
      claimDailyReward: () => {
        const { currentStreak, claimedToday } = get();
        
        if (claimedToday) {
          return null; // Already claimed today
        }
        set({ claimedToday: true });
        
        return reward;
      },
      
      getStreakReward: (day) => {
        // Find the highest reward tier the player qualifies for
        
        for (const dailyReward of DAILY_REWARDS) {
          if (day >= dailyReward.day) {
            reward = dailyReward;
          }
        }
        
        return reward;
      },
      
      resetStreak: () => {
        set({ currentStreak: 0, claimedToday: false });
      }
    }),
    {
      name: 'brain-flip-login-streak',
      version: 1
    }
  )
);