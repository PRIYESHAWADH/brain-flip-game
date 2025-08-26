"use client";
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDailyRewardStore } from '@/store/dailyRewardStore';

export default function DailyRewardModal() {
  const { hasPending, pendingReward, streak, evaluateToday, claimToday } = useDailyRewardStore();

  useEffect(() => {
    evaluateToday();
  }, [evaluateToday]);

  if (!hasPending || !pendingReward) return null;
    claimToday();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
        <motion.div className="absolute inset-0 bg-black/60" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative z-10 w-full max-w-md bg-bg-secondary border border-border-primary rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="p-6 text-center">
            <h3 className="text-2xl font-orbitron font-bold text-gradient mb-2">Daily Reward</h3>
            <p className="text-text-secondary mb-4">Day {streak + 1} Streak</p>
            <div className="glass-card p-4 mb-4">
              <div className="text-lg">
                +{pendingReward.points} points {pendingReward.starCoins ? ` • +${pendingReward.starCoins} SC` : ''}
              </div>
              {pendingReward.cosmeticId && (
                <div className="text-neon-yellow mt-1">Exclusive unlock!</div>
              )}
            </div>
            <div className="text-xs text-text-muted mb-4">{toGo} day(s) to next milestone at Day {nextMilestone}</div>
            <button onClick={close} className="btn-primary w-full py-2 font-medium">Claim</button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
