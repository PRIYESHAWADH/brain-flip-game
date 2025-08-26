'use client';

import React from 'react';
import { useGameStore } from '@/store/gameStore';

export default function Statistics() {
  const { 
    totalPoints, 
    starCoins, 
    gamesPlayed, 
    bestStreak, 
    totalReactionTime,
    perfectRounds 
  } = useGameStore();
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };
    {
      label: 'Total Points',
      value: formatNumber(totalPoints),
      icon: '🎯',
      color: 'text-blue-400'
    },
    {
      label: 'Star Coins',
      value: starCoins.toString(),
      icon: '⭐',
      color: 'text-yellow-400'
    },
    {
      label: 'Games Played',
      value: gamesPlayed.toString(),
      icon: '🎮',
      color: 'text-green-400'
    },
    {
      label: 'Best Streak',
      value: bestStreak.toString(),
      icon: '🔥',
      color: 'text-orange-400'
    },
    {
      label: 'Perfect Rounds',
      value: perfectRounds.toString(),
      icon: '💎',
      color: 'text-purple-400'
    },
    {
      label: 'Avg Reaction Time',
      value: `${Math.round(averageReactionTime)}ms`,
      icon: '⚡',
      color: 'text-cyan-400'
    },
    {
      label: 'Perfect Rate',
      value: `${perfectRate.toFixed(1)}%`,
      icon: '🎪',
      color: 'text-pink-400'
    },
    {
      label: 'Points Per Game',
      value: gamesPlayed > 0 ? Math.round(totalPoints / gamesPlayed).toString() : '0',
      icon: '📈',
      color: 'text-indigo-400'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
          Statistics
        </h2>
        <p className="text-gray-400">Track your progress and performance</p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 text-center hover:border-gray-600 transition-colors"
          >
            <div className={`text-3xl mb-2 ${stat.color}`}>
              {stat.icon}
            </div>
            <div className={`text-2xl font-bold mb-1 ${stat.color}`}>
              {stat.value}
            </div>
            <div className="text-sm text-gray-400">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Performance Analysis */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Performance Analysis</h3>
        
        <div className="space-y-4">
          {/* Reaction Time Rating */}
          <div>
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Reaction Time Rating</span>
              <span>
                {averageReactionTime < 300 ? 'Lightning Fast ⚡' :
                 averageReactionTime < 500 ? 'Very Fast 🚀' :
                 averageReactionTime < 700 ? 'Good 👍' :
                 averageReactionTime < 1000 ? 'Average 😐' : 'Needs Work 📚'}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  averageReactionTime < 300 ? 'bg-green-500' :
                  averageReactionTime < 500 ? 'bg-blue-500' :
                  averageReactionTime < 700 ? 'bg-yellow-500' :
                  averageReactionTime < 1000 ? 'bg-orange-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(100, Math.max(10, 100 - (averageReactionTime / 10)))}%` }}
              />
            </div>
          </div>

          {/* Perfect Rate Rating */}
          <div>
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Accuracy Rating</span>
              <span>
                {perfectRate >= 90 ? 'Perfect 💎' :
                 perfectRate >= 75 ? 'Excellent 🌟' :
                 perfectRate >= 60 ? 'Good 👍' :
                 perfectRate >= 40 ? 'Average 😐' : 'Needs Work 📚'}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  perfectRate >= 90 ? 'bg-purple-500' :
                  perfectRate >= 75 ? 'bg-green-500' :
                  perfectRate >= 60 ? 'bg-blue-500' :
                  perfectRate >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${perfectRate}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <h4 className="font-semibold text-blue-300 mb-2">💡 Improvement Tips</h4>
        <ul className="text-sm text-gray-300 space-y-1">
          {averageReactionTime > 600 && (
            <li>• Focus on reading instructions quickly to improve reaction time</li>
          )}
          {perfectRate < 70 && (
            <li>• Take your time to understand each instruction before answering</li>
          )}
          {bestStreak < 10 && (
            <li>• Practice regularly to build longer streaks</li>
          )}
          <li>• Try different game modes to challenge yourself</li>
          <li>• Complete daily challenges for bonus rewards</li>
        </ul>
      </div>
    </div>
  );
}