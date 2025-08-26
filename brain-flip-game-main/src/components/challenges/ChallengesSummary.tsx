'use client';

import React from 'react';
import { useDailyChallengeStore } from '@/store/dailyChallengeStore';

const ChallengesSummary: React.FC = () => {
  const { dailyChallenges, globalJackpot, weeklyTournament } = useDailyChallengeStore();

  const completedChallenges = dailyChallenges.filter(challenge => challenge.completed);
  const totalRewards = completedChallenges.reduce((sum, challenge) => sum + challenge.reward.points, 0);
  const totalStarCoins = completedChallenges.reduce((sum, challenge) => sum + challenge.reward.starCoins, 0);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 border border-gray-600 rounded-xl p-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        {/* Daily Progress */}
        <div className="space-y-1">
          <div className="text-2xl font-bold text-green-400">
            {completedChallenges.length}/{dailyChallenges.length}
          </div>
          <div className="text-xs text-gray-400">Daily Challenges</div>
        </div>

        {/* Points Earned */}
        <div className="space-y-1">
          <div className="text-2xl font-bold text-blue-400">
            {formatNumber(totalRewards)}
          </div>
          <div className="text-xs text-gray-400">Points Earned</div>
        </div>

        {/* Star Coins */}
        <div className="space-y-1">
          <div className="text-2xl font-bold text-yellow-400">
            {totalStarCoins}
          </div>
          <div className="text-xs text-gray-400">Star Coins</div>
        </div>

        {/* Tournament Rank */}
        <div className="space-y-1">
          <div className="text-2xl font-bold text-purple-400">
            #{weeklyTournament?.userRank || '---'}
          </div>
          <div className="text-xs text-gray-400">Tournament Rank</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Daily Progress</span>
          <span>{Math.round((completedChallenges.length / Math.max(dailyChallenges.length, 1)) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-500"
            style={{ width: `${(completedChallenges.length / Math.max(dailyChallenges.length, 1)) * 100}%` }}
          />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-3 flex justify-between items-center text-xs text-gray-400">
        <span>🎰 Jackpot: {formatNumber(globalJackpot)}</span>
        {weeklyTournament && weeklyTournament.participants > 1 && (
          <span>🏆 Tournament: {weeklyTournament.participants.toLocaleString()} players</span>
        )}
      </div>
    </div>
  );
};

export default ChallengesSummary;