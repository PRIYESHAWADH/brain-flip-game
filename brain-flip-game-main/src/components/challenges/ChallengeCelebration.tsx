'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { DailyChallenge } from '@/store/dailyChallengeStore';

interface ChallengeCelebrationProps {
  challenge: DailyChallenge;
  onComplete: () => void;
}

const ChallengeCelebration: React.FC<ChallengeCelebrationProps> = ({ challenge, onComplete }) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'from-green-500 to-emerald-500';
      case 'medium': return 'from-yellow-500 to-orange-500';
      case 'hard': return 'from-orange-500 to-red-500';
      case 'extreme': return 'from-red-500 to-pink-500';
      default: return 'from-blue-500 to-purple-500';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onComplete}
    >
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className={`bg-gradient-to-r ${getDifficultyColor(challenge.difficulty)} p-1 rounded-2xl shadow-2xl max-w-sm mx-4`}
      >
        <div className="bg-gray-900 rounded-xl p-6 text-center">
          {/* Challenge Icon with Animation */}
          <motion.div
            animate={{ 
              rotate: [0, 10, -10, 10, -10, 0],
              scale: [1, 1.2, 1, 1.2, 1]
            }}
            transition={{ duration: 2, repeat: 2 }}
            className="text-6xl mb-4"
          >
            {challenge.icon}
          </motion.div>

          {/* Challenge Complete Text */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-2xl font-bold text-white mb-2"
          >
            Challenge Complete!
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-lg text-gray-300 mb-4"
          >
            {challenge.name}
          </motion.p>

          {/* Difficulty Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className={`inline-block px-4 py-2 rounded-full text-sm font-bold text-white bg-gradient-to-r ${getDifficultyColor(challenge.difficulty)} mb-4`}
          >
            {challenge.difficulty.toUpperCase()} DIFFICULTY
          </motion.div>

          {/* Rewards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="space-y-2 mb-6"
          >
            <div className="text-sm text-gray-400 mb-2">Rewards Earned:</div>
            <div className="flex justify-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">
                  +{challenge.reward.points.toLocaleString()}
                </div>
                <div className="text-xs text-gray-400">Points</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">
                  +{challenge.reward.starCoins}
                </div>
                <div className="text-xs text-gray-400">Star Coins</div>
              </div>
            </div>
            {challenge.reward.bonusMultiplier && challenge.reward.bonusMultiplier > 1 && (
              <div className="text-purple-400 font-semibold">
                {challenge.reward.bonusMultiplier}x Bonus Applied!
              </div>
            )}
          </motion.div>

          {/* Continue Button */}
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onComplete}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 px-8 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
          >
            Continue Playing
          </motion.button>

          {/* Sparkle Effects */}
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  opacity: 0,
                  scale: 0,
                  x: Math.random() * 300 - 150,
                  y: Math.random() * 300 - 150
                }}
                animate={{ 
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                  rotate: 360
                }}
                transition={{ 
                  duration: 2,
                  delay: Math.random() * 1,
                  repeat: Infinity,
                  repeatDelay: Math.random() * 2
                }}
                className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)'
                }}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ChallengeCelebration;