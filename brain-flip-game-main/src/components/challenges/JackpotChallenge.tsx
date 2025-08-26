'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDailyChallengeStore } from '@/store/dailyChallengeStore';
import { useGameStore } from '@/store/gameStore';

const JackpotChallenge: React.FC = () => {
  const { globalJackpot, lastJackpotWinner, claimJackpot } = useDailyChallengeStore();
  const { addPoints } = useGameStore();
  const [isSpinning, setIsSpinning] = useState(false);
  const [showWin, setShowWin] = useState(false);
  const [wonAmount, setWonAmount] = useState(0);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const handleJackpotSpin = () => {
    // Jackpot is not available for manual spinning
    // It only triggers automatically based on exceptional performance
    return;
  };

  return (
    <div className="relative">
      {/* Jackpot Display */}
      <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl p-6 text-center">
        <motion.div
          animate={{ 
            scale: isSpinning ? [1, 1.05, 1] : 1,
            rotate: isSpinning ? [0, 5, -5, 0] : 0
          }}
          transition={{ 
            duration: 0.5, 
            repeat: isSpinning ? Infinity : 0 
          }}
        >
          <h3 className="text-2xl font-bold text-yellow-400 mb-2 flex items-center justify-center gap-2">
            🎰 Global Jackpot
          </h3>
          <div className="text-4xl font-bold text-white mb-4">
            {formatNumber(globalJackpot)} pts
          </div>
        </motion.div>

        <div className="bg-gray-800/50 rounded-lg p-4 mt-4">
          <p className="text-gray-300 text-sm text-center">
            🎯 Jackpot triggers automatically when you achieve exceptional performance!
          </p>
          <p className="text-gray-500 text-xs text-center mt-2">
            Score 50,000+ points with 25+ streak and 10+ perfect rounds in one game
          </p>
        </div>

        {/* Last Winner */}
        {lastJackpotWinner && (
          <div className="mt-4 text-xs text-gray-400 bg-gray-800/50 rounded-lg p-3">
            <div className="font-semibold text-yellow-400">Last Winner:</div>
            <div>{lastJackpotWinner.playerName}</div>
            <div>{formatNumber(lastJackpotWinner.amount)} points</div>
            <div>{new Date(lastJackpotWinner.date).toLocaleDateString()}</div>
          </div>
        )}
      </div>

      {/* Win Animation */}
      <AnimatePresence>
        {showWin && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="absolute inset-0 flex items-center justify-center bg-black/80 rounded-xl z-10"
          >
            <div className="text-center">
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ 
                  duration: 0.5, 
                  repeat: Infinity 
                }}
                className="text-6xl mb-4"
              >
                🎉
              </motion.div>
              <div className="text-3xl font-bold text-yellow-400 mb-2">
                JACKPOT!
              </div>
              <div className="text-2xl font-bold text-white">
                +{formatNumber(wonAmount)} Points!
              </div>
              <div className="text-sm text-gray-300 mt-2">
                Congratulations! You hit the jackpot!
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default JackpotChallenge;