"use client";
import { usePointsStore } from '@/store/pointsStore';
import { motion } from 'framer-motion';

export default function PointsHUD() {
  const { balance, playerRank } = usePointsStore();
  return (
    <div className="flex gap-4 text-xs md:text-sm bg-glass-effect/60 rounded-lg px-3 py-2 backdrop-blur border border-white/10">
      <Stat label="GP" value={balance.gamePoints} color="text-neon-green" />
      <Stat label="SC" value={balance.starCoins} color="text-electric-blue" />
      <Stat label="ET" value={balance.eventTokens} color="text-hot-pink" />
      <div className="flex flex-col items-center min-w-[60px]">
        <span className="font-semibold text-cyber-yellow">Rank</span>
        <motion.span
          key={playerRank.tier}
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          className="font-bold text-xs"
          title={`Level ${playerRank.level} ${playerRank.tier}`}
        >
          {playerRank.tier}
        </motion.span>
      </div>
      <div className="flex flex-col items-center min-w-[50px]">
        <span className="font-semibold text-purple-400">XP</span>
        <motion.span
          key={balance.xp}
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          className="font-bold"
          title={`${playerRank.xpCurrent}/${playerRank.xpRequired} to next level`}
        >
          {balance.xp}
        </motion.span>
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex flex-col items-center min-w-[50px]">
      <span className={`font-semibold ${color}`}>{label}</span>
      <motion.span
        key={value}
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
        className="font-bold"
      >
        {value}
      </motion.span>
    </div>
  );
}
