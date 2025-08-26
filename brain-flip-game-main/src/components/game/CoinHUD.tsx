'use client';

import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';

// Unified single coins display: mirrors the live score as coins
const CoinHUD = () => {
  const { score } = useGameStore();

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-40 bg-gray-900/90 backdrop-blur-sm rounded-xl px-5 py-3 text-white shadow-2xl border border-gray-700"
    >
      <div className="flex items-center gap-2">
        <span className="text-xl">🪙</span>
        <span className="text-xs text-gray-300">Coins</span>
        <span className="font-extrabold text-blue-400 text-lg ml-2">{score.toLocaleString()}</span>
      </div>
    </motion.div>
  );
};

export default CoinHUD;
