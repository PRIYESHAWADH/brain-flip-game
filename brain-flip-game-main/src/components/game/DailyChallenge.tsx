"use client";
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { useState, useEffect } from 'react';

interface DailyChallengeProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: () => void;
}

export default function DailyChallenge({ isOpen, onClose, onStart }: DailyChallengeProps) {
  const { generateDailyChallenge, level, personalBest } = useGameStore();
  const [challenge, setChallenge] = useState<any>(null);
  const [isAccepted, setIsAccepted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const dailyChallenge = generateDailyChallenge();
      setChallenge(dailyChallenge);
    }
  }, [isOpen, generateDailyChallenge]);

  const handleAcceptChallenge = () => {
    setIsAccepted(true);
    setTimeout(() => {
      onStart();
      onClose();
    }, 1000);
  };

  if (!isOpen || !challenge) return null;

  const difficultyLevel = challenge.targetStreak >= 10 ? 'Expert' :
                         challenge.targetStreak >= 7 ? 'Advanced' :
                         challenge.targetStreak >= 5 ? 'Intermediate' : 'Beginner';

  const difficultyColor = difficultyLevel === 'Expert' ? 'text-red-400' :
                         difficultyLevel === 'Advanced' ? 'text-orange-400' :
                         difficultyLevel === 'Intermediate' ? 'text-yellow-400' : 'text-green-400';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="glass-card p-8 max-w-md w-full border-2 border-purple-500/30"
          onClick={(e) => e.stopPropagation()}
        >
          {!isAccepted ? (
            <>
              {/* Header */}
              <div className="text-center mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-4xl mb-2"
                >
                  🎯
                </motion.div>
                <h2 className="text-2xl font-bold text-purple-400 mb-2">
                  Daily Challenge
                </h2>
                <div className={`text-sm font-semibold ${difficultyColor}`}>
                  {difficultyLevel} Level
                </div>
              </div>

              {/* Challenge Details */}
              <div className="space-y-4 mb-6">
                <div className="glass-card p-4 border border-blue-500/30">
                  <h3 className="text-blue-400 font-semibold mb-2">🎯 Objectives</h3>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Achieve {Math.round(challenge.targetAccuracy * 100)}% accuracy</li>
                    <li>• Reach a streak of {challenge.targetStreak}</li>
                    <li>• Average reaction time under {Math.round(challenge.timeLimit)}ms</li>
                  </ul>
                </div>

                {challenge.specialRules.length > 0 && (
                  <div className="glass-card p-4 border border-yellow-500/30">
                    <h3 className="text-yellow-400 font-semibold mb-2">⚡ Special Rules</h3>
                    <ul className="text-sm text-gray-300 space-y-1">
                      {challenge.specialRules.map((rule: string, index: number) => (
                        <li key={index}>• {rule}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="glass-card p-4 border border-green-500/30">
                  <h3 className="text-green-400 font-semibold mb-2">🏆 Rewards</h3>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• 2x Score Multiplier</li>
                    <li>• Exclusive Achievement Badge</li>
                    <li>• Bonus Star Coins</li>
                    {difficultyLevel === 'Expert' && (
                      <li>• Special "Flow Master" Title</li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Performance Context */}
              <div className="text-center mb-6 text-sm text-gray-400">
                <div>Your Level: {level}</div>
                <div>Personal Best: {personalBest.toLocaleString()}</div>
                <div className="text-purple-400 mt-2">
                  Challenge tailored to your skill level
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Maybe Later
                </button>
                <button
                  onClick={handleAcceptChallenge}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg font-semibold transition-all transform hover:scale-105"
                >
                  Accept Challenge
                </button>
              </div>
            </>
          ) : (
            /* Challenge Accepted Animation */
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ duration: 0.6 }}
                className="text-6xl mb-4"
              >
                🚀
              </motion.div>
              <motion.h3
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold text-purple-400 mb-2"
              >
                Challenge Accepted!
              </motion.h3>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-gray-300"
              >
                Prepare for an epic brain training session!
              </motion.p>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}