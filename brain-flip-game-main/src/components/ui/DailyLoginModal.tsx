'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLoginStreakStore, LoginReward } from '@/store/loginStreakStore';
import { useGameStore } from '@/store/gameStore';

const DailyLoginModal: React.FC = () => {
  const { checkDailyLogin, claimDailyReward, currentStreak, getStreakReward } = useLoginStreakStore();
  const { addPoints, addStarCoins } = useGameStore();
  const [showModal, setShowModal] = useState(false);
  const [reward, setReward] = useState<LoginReward | null>(null);
  const [claimed, setClaimed] = useState(false);

  useEffect(() => {
    // Check if it's a new day login
    if (isNewDay) {
      setShowModal(true);
      setReward(getStreakReward(currentStreak));
    }
  }, []);
    if (claimedReward) {
      addPoints(claimedReward.points);
      if (claimedReward.starCoins > 0) {
        addStarCoins(claimedReward.starCoins);
      }
      setClaimed(true);
      
      // Auto close after 3 seconds
      setTimeout(() => {
        setShowModal(false);
      }, 3000);
    }
  };
    return num.toLocaleString();
  };

  if (!showModal || !reward) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          className="bg-gradient-to-br from-purple-600 to-pink-600 p-1 rounded-2xl shadow-2xl max-w-md mx-4"
        >
          <div className="bg-gray-900 rounded-xl p-6 text-center">
            {/* Header */}
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 10, -10, 0],
                scale: [1, 1.1, 1, 1.1, 1]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-6xl mb-4"
            >
              🎁
            </motion.div>

            <h2 className="text-3xl font-bold text-white mb-2">
              Daily Login Reward!
            </h2>

            <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg p-4 mb-6">
              <div className="text-lg font-semibold text-yellow-300 mb-2">
                Day {currentStreak} Streak! 🔥
              </div>
              
              {/* Reward Details */}
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">
                      +{formatNumber(reward.points)}
                    </div>
                    <div className="text-xs text-gray-400">Points</div>
                  </div>
                  
                  {reward.starCoins > 0 && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-400">
                        +{reward.starCoins}
                      </div>
                      <div className="text-xs text-gray-400">Star Coins</div>
                    </div>
                  )}
                </div>
                
                {reward.special && (
                  <div className="text-purple-400 font-semibold text-sm">
                    🏆 {reward.special}
                  </div>
                )}
              </div>
            </div>

            {/* Streak Progress */}
            <div className="mb-6">
              <div className="text-sm text-gray-400 mb-2">Login Streak Progress</div>
              <div className="flex justify-center gap-1">
                {Array.from({ length: Math.min(currentStreak, 7) }).map((_, i) => (
                  <div
                    key={i}
                    className="w-3 h-3 rounded-full bg-green-500"
                  />
                ))}
                {Array.from({ length: Math.max(0, 7 - currentStreak) }).map((_, i) => (
                  <div
                    key={i + currentStreak}
                    className="w-3 h-3 rounded-full bg-gray-600"
                  />
                ))}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {currentStreak < 7 ? `${7 - currentStreak} days until weekly bonus!` : 'Weekly bonus unlocked!'}
              </div>
            </div>

            {/* Claim Button */}
            {!claimed ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleClaimReward}
                className="bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold py-3 px-8 rounded-lg hover:from-green-600 hover:to-blue-600 transition-all duration-200"
              >
                Claim Reward! 🎉
              </motion.button>
            ) : (
              <div className="space-y-2">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-green-400 text-xl font-bold"
                >
                  ✅ Reward Claimed!
                </motion.div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Continue Playing
                </button>
              </div>
            )}

            {/* Next Day Preview */}
            {!claimed && (
              <div className="mt-4 text-xs text-gray-500">
                Tomorrow: +{formatNumber(getStreakReward(currentStreak + 1).points)} points
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DailyLoginModal;