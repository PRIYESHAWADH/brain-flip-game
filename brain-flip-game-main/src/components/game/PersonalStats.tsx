"use client";
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { useAchievementStore } from '@/store/achievementStore';
import { useState } from 'react';

interface PersonalStatsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PersonalStats({ isOpen, onClose }: PersonalStatsProps) {
  const { 
    personalBest, 
    personalBests, 
    reactionTimes, 
    perfectRounds, 
    lightningReactions,
    dailyStreak,
    gamesPlayed,
    totalPoints
  } = useGameStore();
  
  const { achievements, getUnlockedAchievements, getTierProgress } = useAchievementStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'progress'>('overview');

  if (!isOpen) return null;

  // Calculate statistics
  const avgReactionTime = reactionTimes.length > 0 
    ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
    : 0;
  
  const fastestReaction = reactionTimes.length > 0 
    ? Math.min(...reactionTimes)
    : 0;
  
  const unlockedAchievements = getUnlockedAchievements();
  const achievementProgress = (unlockedAchievements.length / achievements.length) * 100;
  
  const bronzeProgress = getTierProgress('bronze');
  const silverProgress = getTierProgress('silver');
  const goldProgress = getTierProgress('gold');
  const legendaryProgress = getTierProgress('legendary');

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
          className="glass-card p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto border-2 border-purple-500/30"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Personal Statistics
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl"
            >
              ×
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 mb-6">
            {[
              { id: 'overview', label: '📊 Overview', icon: '📊' },
              { id: 'achievements', label: '🏆 Achievements', icon: '🏆' },
              { id: 'progress', label: '📈 Progress', icon: '📈' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Key Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="glass-card p-4 text-center border border-blue-500/30">
                    <div className="text-2xl text-blue-400 mb-1">🎯</div>
                    <div className="text-2xl font-bold text-white">{personalBest.toLocaleString()}</div>
                    <div className="text-sm text-gray-400">Personal Best</div>
                  </div>
                  
                  <div className="glass-card p-4 text-center border border-green-500/30">
                    <div className="text-2xl text-green-400 mb-1">⚡</div>
                    <div className="text-2xl font-bold text-white">{fastestReaction}ms</div>
                    <div className="text-sm text-gray-400">Fastest Reaction</div>
                  </div>
                  
                  <div className="glass-card p-4 text-center border border-yellow-500/30">
                    <div className="text-2xl text-yellow-400 mb-1">🔥</div>
                    <div className="text-2xl font-bold text-white">{dailyStreak}</div>
                    <div className="text-sm text-gray-400">Daily Streak</div>
                  </div>
                  
                  <div className="glass-card p-4 text-center border border-purple-500/30">
                    <div className="text-2xl text-purple-400 mb-1">🎮</div>
                    <div className="text-2xl font-bold text-white">{gamesPlayed}</div>
                    <div className="text-sm text-gray-400">Games Played</div>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="glass-card p-6 border border-gray-700">
                    <h3 className="text-xl font-bold text-white mb-4">⚡ Speed Metrics</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Average Reaction Time</span>
                        <span className="text-white font-semibold">{avgReactionTime}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Lightning Reactions</span>
                        <span className="text-yellow-400 font-semibold">{lightningReactions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Perfect Rounds</span>
                        <span className="text-green-400 font-semibold">{perfectRounds}</span>
                      </div>
                    </div>
                  </div>

                  <div className="glass-card p-6 border border-gray-700">
                    <h3 className="text-xl font-bold text-white mb-4">🏆 Game Mode Bests</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Classic Mode</span>
                        <span className="text-green-400 font-semibold">{personalBests.classic.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Duel Mode</span>
                        <span className="text-yellow-400 font-semibold">{personalBests.duel.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Sudden Death</span>
                        <span className="text-red-400 font-semibold">{personalBests['sudden-death'].toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'achievements' && (
              <motion.div
                key="achievements"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Achievement Progress Overview */}
                <div className="glass-card p-6 border border-purple-500/30">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">Achievement Progress</h3>
                    <span className="text-purple-400 font-semibold">
                      {unlockedAchievements.length}/{achievements.length}
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-700 rounded-full h-3 mb-4">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${achievementProgress}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full"
                    />
                  </div>
                  
                  <div className="text-center text-gray-300">
                    {Math.round(achievementProgress)}% Complete
                  </div>
                </div>

                {/* Tier Progress */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="glass-card p-4 text-center border border-amber-500/30">
                    <div className="text-2xl text-amber-400 mb-2">🥉</div>
                    <div className="text-lg font-bold text-white">{bronzeProgress.unlocked}/{bronzeProgress.total}</div>
                    <div className="text-sm text-gray-400">Bronze</div>
                  </div>
                  
                  <div className="glass-card p-4 text-center border border-gray-400/30">
                    <div className="text-2xl text-gray-400 mb-2">🥈</div>
                    <div className="text-lg font-bold text-white">{silverProgress.unlocked}/{silverProgress.total}</div>
                    <div className="text-sm text-gray-400">Silver</div>
                  </div>
                  
                  <div className="glass-card p-4 text-center border border-yellow-500/30">
                    <div className="text-2xl text-yellow-400 mb-2">🥇</div>
                    <div className="text-lg font-bold text-white">{goldProgress.unlocked}/{goldProgress.total}</div>
                    <div className="text-sm text-gray-400">Gold</div>
                  </div>
                  
                  <div className="glass-card p-4 text-center border border-purple-500/30">
                    <div className="text-2xl text-purple-400 mb-2">👑</div>
                    <div className="text-lg font-bold text-white">{legendaryProgress.unlocked}/{legendaryProgress.total}</div>
                    <div className="text-sm text-gray-400">Legendary</div>
                  </div>
                </div>

                {/* Recent Achievements */}
                <div className="glass-card p-6 border border-gray-700">
                  <h3 className="text-xl font-bold text-white mb-4">🌟 Recent Achievements</h3>
                  <div className="space-y-3">
                    {unlockedAchievements.slice(-5).reverse().map(achievement => (
                      <div key={achievement.id} className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                        <div className="text-2xl">{achievement.icon}</div>
                        <div className="flex-1">
                          <div className="font-semibold text-white">{achievement.name}</div>
                          <div className="text-sm text-gray-400">{achievement.description}</div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {achievement.unlockedAt && new Date(achievement.unlockedAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                    {unlockedAchievements.length === 0 && (
                      <div className="text-center text-gray-400 py-8">
                        No achievements unlocked yet. Keep playing to earn your first achievement!
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'progress' && (
              <motion.div
                key="progress"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Progress Charts */}
                <div className="glass-card p-6 border border-gray-700">
                  <h3 className="text-xl font-bold text-white mb-4">📈 Performance Trends</h3>
                  
                  {/* Reaction Time Trend */}
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-300 mb-3">Reaction Time (Last 10 Games)</h4>
                    <div className="flex items-end gap-2 h-32">
                      {reactionTimes.slice(-10).map((time, index) => (
                        <div key={index} className="flex-1 flex flex-col items-center">
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${Math.max(10, (1000 - time) / 10)}%` }}
                            transition={{ delay: index * 0.1 }}
                            className={`w-full rounded-t ${
                              time < 400 ? 'bg-green-500' :
                              time < 600 ? 'bg-yellow-500' :
                              time < 800 ? 'bg-orange-500' : 'bg-red-500'
                            }`}
                          />
                          <div className="text-xs text-gray-400 mt-1">{time}ms</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Goals and Targets */}
                <div className="glass-card p-6 border border-green-500/30">
                  <h3 className="text-xl font-bold text-white mb-4">🎯 Goals & Targets</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-300">Daily Streak Goal</span>
                        <span className="text-white">{dailyStreak}/30 days</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, (dailyStreak / 30) * 100)}%` }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-300">Speed Master (Sub-300ms)</span>
                        <span className="text-white">{lightningReactions}/50 reactions</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-yellow-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, (lightningReactions / 50) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}