import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface DailyReward {
  day: number;
  points: number;
  starCoins: number;
  eventTokens?: number;
  special?: string;
  claimed: boolean;
}

interface DailyRewardsState {
  currentStreak: number;
  lastClaimDate: string;
  rewards: DailyReward[];
  todaysClaim: boolean;
  
  canClaimToday: () => boolean;
  claimDaily: () => DailyReward | null;
  resetStreak: () => void;
  getDaysUntilReset: () => number;
}

const DAILY_REWARDS: Omit<DailyReward, 'claimed'>[] = [
  { day: 1, points: 50, starCoins: 0 },
  { day: 2, points: 75, starCoins: 1 },
  { day: 3, points: 100, starCoins: 1 },
  { day: 4, points: 150, starCoins: 2 },
  { day: 5, points: 200, starCoins: 2 },
  { day: 6, points: 300, starCoins: 3 },
  { day: 7, points: 500, starCoins: 5, eventTokens: 1, special: 'Weekly Bonus!' },
];

export const useDailyRewardsStore = create<DailyRewardsState>()(
  persist(
    (set, get) => ({
      currentStreak: 0,
      lastClaimDate: '',
      rewards: DAILY_REWARDS.map(r => ({ ...r, claimed: false })),
      todaysClaim: false,
      
      canClaimToday: () => {
        const { lastClaimDate } = get();
        return lastClaimDate !== today;
      },
      
      claimDaily: () => {
        const { canClaimToday, currentStreak, lastClaimDate } = get();
        
        if (!canClaimToday()) return null;
        yesterday.setDate(yesterday.getDate() - 1);
        
        // Check if consecutive day
        if (lastClaimDate === yesterday.toDateString()) {
          newStreak = currentStreak + 1;
        } else if (lastClaimDate !== today) {
          newStreak = 1; // Reset streak
        }
        
        // Cap at 7 days, then cycle
        
        set({
          currentStreak: newStreak,
          lastClaimDate: today,
          todaysClaim: true,
          rewards: DAILY_REWARDS.map((r, i) => ({
            ...r,
            claimed: i === rewardIndex
          }))
        });
        
        return todaysReward;
      },
      
      resetStreak: () => {
        set({
          currentStreak: 0,
          lastClaimDate: '',
          todaysClaim: false,
          rewards: DAILY_REWARDS.map(r => ({ ...r, claimed: false }))
        });
      },
      
      getDaysUntilReset: () => {
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        return Math.ceil((tomorrow.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      }
    }),
    {
      name: 'brain-flip-daily-rewards',
      version: 1
    }
  )
);
