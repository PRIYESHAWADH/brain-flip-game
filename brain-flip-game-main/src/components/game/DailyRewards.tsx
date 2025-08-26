"use client";
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';

export default function DailyRewards() {
  const { dailyStreak, lastDailyClaimDate, claimDailyReward } = useGameStore();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (canClaim) setOpen(true);
  }, [canClaim]);

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 glass-card px-4 py-3 flex items-center gap-3"
      >
        <div className="text-2xl">📅</div>
        <div>
          <div className="text-sm text-text-muted">Daily Streak</div>
          <div className="font-bold text-neon-yellow">{dailyStreak} days</div>
        </div>
        <button
          className="btn-primary ml-3"
          onClick={() => { claimDailyReward(); setOpen(false); }}
        >
          Claim
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
