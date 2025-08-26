import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { usePointsStore } from '@/store/pointsStore';
import { useCosmeticStore } from '@/store/cosmeticStore';

type Reward = { points: number; starCoins?: number; cosmeticId?: string };

function normalizeDateStr(d = new Date()): string {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).toDateString();
}

// Explicit milestone rewards per requirements
const MILESTONES: Record<number, Reward> = {
  1: { points: 20 },
  3: { points: 75 },
  7: { points: 300 },
  14: { points: 800 },
  30: { points: 2500, cosmeticId: 'avatar_exclusive_day30' },
};

function computeRewardForStreak(streak: number): Reward {
  if (MILESTONES[streak]) return MILESTONES[streak];
  // Exponential-ish base growth with soft cap
  // Add small SC every 10 days
  return { points, starCoins };
}

interface DailyRewardState {
  lastClaimDate?: string;
  streak: number; // calendar-day consecutive claim streak
  pendingReward?: Reward;
  hasPending: boolean;
  // actions
  evaluateToday: () => void;
  claimToday: () => Reward | null;
  reset: () => void;
}

export const useDailyRewardStore = create<DailyRewardState>()(
  persist(
    (set, get) => ({
      lastClaimDate: undefined,
      streak: 0,
      pendingReward: undefined,
      hasPending: false,

      evaluateToday: () => {
        const { lastClaimDate, streak } = get();
        if (lastClaimDate === today) {
          set({ hasPending: false, pendingReward: undefined });
          return;
        }
        // Determine streak continuity
        if (lastClaimDate) {
          nextStreak = lastClaimDate === yesterday ? streak + 1 : 1;
        }
        set({ hasPending: true, pendingReward: reward });
      },

      claimToday: () => {
        if (!state.hasPending || !state.pendingReward) return null;

        // Apply rewards
        points.addPoints(state.pendingReward.points, `Daily Reward (Day ${state.streak + 1})`);
        if (state.pendingReward.starCoins) {
          points.addStarCoins(state.pendingReward.starCoins, 'Daily Reward Bonus');
        }
        if (state.pendingReward.cosmeticId) {
          cos.addItems([{ id: state.pendingReward.cosmeticId, name: 'Exclusive Avatar', type: 'avatar', owned: true, limited: true }]);
        }
        set({
          lastClaimDate: today,
          streak: newStreak,
          hasPending: false,
          pendingReward: undefined,
        });
        return { points: state.pendingReward.points, starCoins: state.pendingReward.starCoins, cosmeticId: state.pendingReward.cosmeticId };
      },

      reset: () => set({ lastClaimDate: undefined, streak: 0, pendingReward: undefined, hasPending: false })
    }),
    { name: 'bf-daily-rewards', version: 1 }
  )
);
