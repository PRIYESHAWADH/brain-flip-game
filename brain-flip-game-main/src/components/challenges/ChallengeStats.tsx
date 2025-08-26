'use client';

import React from 'react';
import { useDailyChallengeStore } from '@/store/dailyChallengeStore';
import { useGameStore } from '@/store/gameStore';

export default function ChallengeStats() {
  const { totalPoints, starCoins } = useGameStore();
  const { dailyProgress, completedChallenges, dailyChallenges } = useDailyChallengeStore();

  const totalChallenges = dailyChallenges.length;
  const completionRate = totalChallenges > 0 ? (completedChallenges.length / totalChallenges) * 100 : 0;

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getCompletionColor = (rate: number) => {
    if (rate >= 100) return 'text-green-400';
    if (rate >= 66) return 'text-yellow-400';
    if (rate >= 33) return 'text-orange-400';
    return 'text-red-400';
  };

  // Only show stats if user has actually played
  const hasPlayedToday = dailyProgress.totalGamesPlayed > 0;

  if (!hasPlayedToday) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🎮</div>
        <h3 className="text-2xl font-bold text-white mb-2">Start Playing to See Stats!</h3>
        <p className="text-gray-400 mb-6">Play your first game to unlock detailed statistics and challenge progress.</p>
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 max-w-md mx-auto">
          <p className="text-blue-300 text-sm">
            💡 Your performance data will appear here after you complete your first game today.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Basic Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Points */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">{formatNumber(totalPoints)}</div>
          <div className="text-sm text-gray-400">Total Points</div>
          <div className="text-xs text-gray-500 mt-1">All-time earned</div>
        </div>

        {/* Star Coins */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">{starCoins}</div>
          <div className="text-sm text-gray-400">Star Coins</div>
          <div className="text-xs text-gray-500 mt-1">Premium currency</div>
        </div>

        {/* Challenge Completion */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 text-center">
          <div className={`text-2xl font-bold ${getCompletionColor(completionRate)}`}>
            {Math.round(completionRate)}%
          </div>
          <div className="text-sm text-gray-400">Daily Progress</div>
          <div className="text-xs text-gray-500 mt-1">
            {completedChallenges.length}/{totalChallenges} completed
          </div>
        </div>

        {/* Games Played */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-400">{dailyProgress.totalGamesPlayed}</div>
          <div className="text-sm text-gray-400">Games Today</div>
          <div className="text-xs text-gray-500 mt-1">Keep playing!</div>
        </div>
      </div>

      {/* Performance Stats */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">Today's Performance</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{dailyProgress.bestStreak}</div>
            <div className="text-sm text-gray-400">Best Streak</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{formatNumber(dailyProgress.bestScore)}</div>
            <div className="text-sm text-gray-400">Best Score</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {dailyProgress.bestReactionTime === Infinity ? '--' : `${Math.round(dailyProgress.bestReactionTime)}ms`}
            </div>
            <div className="text-sm text-gray-400">Best Time</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">{dailyProgress.totalPerfectRounds}</div>
            <div className="text-sm text-gray-400">Perfect Rounds</div>
          </div>
        </div>
      </div>
    </div>
  );
};