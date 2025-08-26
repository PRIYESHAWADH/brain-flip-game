'use client';

import React from 'react';
import { useAchievementStore } from '@/store/achievementStore';

export default function Achievements() {
  const { achievements, unlockedAchievements } = useAchievementStore();

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getRarityClasses = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-400 border-gray-600';
      case 'rare': return 'text-blue-400 border-blue-600';
      case 'epic': return 'text-purple-400 border-purple-600';
      case 'legendary': return 'text-yellow-400 border-yellow-600';
      default: return 'text-gray-400 border-gray-600';
    }
  };

  const getRarityColor = (tier: string) => {
    switch (tier) {
      case 'bronze': return 'border-orange-600 text-orange-400';
      case 'silver': return 'border-gray-400 text-gray-300';
      case 'gold': return 'border-yellow-500 text-yellow-400';
      case 'legendary': return 'border-purple-500 text-purple-400';
      default: return 'border-gray-600 text-gray-400';
    }
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
          Achievements
        </h2>
        <p className="text-gray-400">
          {unlockedAchievements.length} of {achievements.length} unlocked
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-700 rounded-full h-3">
        <div
          className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500"
          style={{ width: `${(unlockedAchievements.length / achievements.length) * 100}%` }}
        />
      </div>

      {/* Achievement Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements.map((achievement) => {
          const isUnlocked = unlockedAchievements.some(ua => ua.id === achievement.id);
          const unlockedData = unlockedAchievements.find(ua => ua.id === achievement.id);
          
          return (
            <div
              key={achievement.id}
              className={`relative overflow-hidden rounded-xl border-2 p-4 transition-all duration-300 ${
                isUnlocked
                  ? `bg-gray-800/50 ${getRarityColor(achievement.tier)}`
                  : 'bg-gray-900/50 border-gray-700 opacity-60'
              }`}
            >
              {/* Achievement Icon */}
              <div className="text-center mb-3">
                <div className={`text-4xl mb-2 ${isUnlocked ? '' : 'grayscale'}`}>
                  {achievement.icon}
                </div>
                <h3 className={`font-semibold ${isUnlocked ? 'text-white' : 'text-gray-500'}`}>
                  {achievement.name}
                </h3>
              </div>

              {/* Description */}
              <p className={`text-sm text-center mb-3 ${isUnlocked ? 'text-gray-300' : 'text-gray-600'}`}>
                {achievement.description}
              </p>

              {/* Rarity Badge */}
              <div className="flex justify-center mb-3">
                <span className={`px-2 py-1 rounded-full text-xs border ${getRarityColor(achievement.tier)} capitalize`}>
                  {achievement.tier}
                </span>
              </div>

              {/* Rewards */}
              <div className="flex justify-center gap-4 text-sm">
                <span className={`flex items-center gap-1 ${isUnlocked ? 'text-blue-400' : 'text-gray-600'}`}>
                  🎯 {formatNumber(achievement.reward.points)}
                </span>
                <span className={`flex items-center gap-1 ${isUnlocked ? 'text-yellow-400' : 'text-gray-600'}`}>
                  ⭐ {achievement.reward.starCoins}
                </span>
              </div>

              {/* Unlock Date */}
              {isUnlocked && unlockedData && (
                <div className="text-xs text-gray-500 text-center mt-2">
                  Unlocked: {new Date(unlockedData.unlockedAt).toLocaleDateString()}
                </div>
              )}

              {/* Locked Overlay */}
              {!isUnlocked && (
                <div className="absolute inset-0 bg-gray-900/30 flex items-center justify-center">
                  <div className="text-gray-500 text-2xl">🔒</div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Stats Summary */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
        <h4 className="font-semibold text-white mb-3">Achievement Progress</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-400">
              {achievements.filter(a => a.tier === 'bronze').length}
            </div>
            <div className="text-sm text-gray-500">Bronze</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-400">
              {achievements.filter(a => a.tier === 'silver').length}
            </div>
            <div className="text-sm text-gray-500">Silver</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-400">
              {achievements.filter(a => a.tier === 'gold').length}
            </div>
            <div className="text-sm text-gray-500">Gold</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-400">
              {achievements.filter(a => a.tier === 'legendary').length}
            </div>
            <div className="text-sm text-gray-500">Legendary</div>
          </div>
        </div>
      </div>
    </div>
  );
}