// Legacy placeholder to satisfy references; maps old reward concepts to new economy (GP, SC, ET)
import { PointsReward } from '@/types/points';

export interface LegacyPlacementRewardMap {
  [rank: number]: PointsReward[];
}

export const placementRewards: LegacyPlacementRewardMap = {
  1: [ { currency: 'GP', amount: 500 }, { currency: 'SC', amount: 5 } ],
  2: [ { currency: 'GP', amount: 300 }, { currency: 'SC', amount: 3 } ],
  3: [ { currency: 'GP', amount: 200 }, { currency: 'SC', amount: 2 } ],
  10: [ { currency: 'GP', amount: 100 } ],
};

export function getPlacementRewards(rank: number): PointsReward[] {
  // Find closest defined rank threshold >= rank
  for (const k of keys) {
    if (rank <= k) return placementRewards[k];
  }
  return [];
}