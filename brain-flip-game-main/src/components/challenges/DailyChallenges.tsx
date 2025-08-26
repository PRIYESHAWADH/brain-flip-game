'use client';

import React, { useState } from 'react';
import { useDailyChallengeStore } from '@/store/dailyChallengeStore';
import { useEffect } from 'react';
import WeeklyTournament from './WeeklyTournament';
import JackpotChallenge from './JackpotChallenge';
import ChallengeStats from './ChallengeStats';

const DifficultyColors = {
  easy: 'bg-green-500/20 border-green-500/40 text-green-300',
  medium: 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300',
  hard: 'bg-orange-500/20 border-orange-500/40 text-orange-300',
  extreme: 'bg-red-500/20 border-red-500/40 text-red-300'
};

const DifficultyLabels = {
  easy: 'Easy',
  medium: 'Medium', 
  hard: 'Hard',
  extreme: 'Extreme'
};

export default function DailyChallenges() {
  const [activeTab, setActiveTab] = useState<'challenges' | 'tournament' | 'stats'>('challenges');
  
  const { 
    dailyChallenges, 
    generateDailyChallenges
  } = useDailyChallengeStore();

  useEffect(() => {
    generateDailyChallenges();
  }, [generateDailyChallenges]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getProgressBarColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'hard': return 'bg-orange-500';
      case 'extreme': return 'bg-red-500';
      default: return 'bg-blue-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
          Challenges & Tournaments
        </h2>
        <p className="text-gray-400 mb-4">
					Complete daily challenges to earn bonus points, star coins, and unlock special rewards!
				</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center mb-6">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-2 border border-gray-700">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('challenges')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                activeTab === 'challenges'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <span>🎯</span>
              <span className="hidden sm:inline">Daily Challenges</span>
              <span className="sm:hidden">Challenges</span>
            </button>
            <button
              onClick={() => setActiveTab('tournament')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                activeTab === 'tournament'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <span>🏆</span>
              <span className="hidden sm:inline">Weekly Tournament</span>
              <span className="sm:hidden">Tournament</span>
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                activeTab === 'stats'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <span>📊</span>
              <span className="hidden sm:inline">Statistics</span>
              <span className="sm:hidden">Stats</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'challenges' ? (
        <div className="space-y-6">
          {/* Player Stats */}
          <ChallengeStats />

          {/* Global Jackpot */}
          <JackpotChallenge />

      {/* Daily Challenges */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white">Today's Challenges</h3>
        
        {dailyChallenges.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <div className="text-4xl mb-2">🎯</div>
            <p>Loading today&apos;s challenges...</p>
          </div>
        ) : (
          dailyChallenges.map((challenge) => (
            <div
              key={challenge.id}
              className={`relative overflow-hidden rounded-xl border-2 p-4 transition-all duration-300 ${
                challenge.completed
                  ? 'bg-green-500/10 border-green-500/40'
                  : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
              }`}
            >
              {/* Challenge Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{challenge.icon}</div>
                  <div>
                    <h4 className="font-semibold text-white flex items-center gap-2">
                      {challenge.name}
                      <span className={`px-2 py-1 rounded-full text-xs border ${DifficultyColors[challenge.difficulty]}`}>
                        {DifficultyLabels[challenge.difficulty]}
                      </span>
                    </h4>
                    <p className="text-sm text-gray-400">{challenge.description}</p>
                  </div>
                </div>
                
                {challenge.completed && (
                  <div className="text-green-400 text-xl">✅</div>
                )}
              </div>

              {/* Progress Bar */}
              <div className="mb-3">
                <div className="flex justify-between text-sm text-gray-400 mb-1">
                  <span>Progress</span>
                  <span>{Math.round(challenge.progress * 100)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${getProgressBarColor(challenge.difficulty)}`}
                    style={{ width: `${challenge.progress * 100}%` }}
                  />
                </div>
              </div>

              {/* Rewards */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1 text-blue-400">
                    🎯 {formatNumber(challenge.reward.points)} pts
                  </span>
                  <span className="flex items-center gap-1 text-yellow-400">
                    ⭐ {challenge.reward.starCoins}
                  </span>
                  {challenge.reward.bonusMultiplier && challenge.reward.bonusMultiplier > 1 && (
                    <span className="flex items-center gap-1 text-purple-400">
                      ✨ {challenge.reward.bonusMultiplier}x bonus
                    </span>
                  )}
                </div>
                
                <div className="text-xs text-gray-500">
                  Expires: {new Date(challenge.expiresAt).toLocaleDateString()}
                </div>
              </div>

              {/* Completion Glow Effect */}
              {challenge.completed && (
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 pointer-events-none" />
              )}
            </div>
          ))
        )}
      </div>

          {/* Tips */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <h4 className="font-semibold text-blue-300 mb-2">💡 Pro Tips</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Complete all daily challenges to maximize your rewards</li>
              <li>• Higher difficulty challenges give more points and star coins</li>
              <li>• Challenges reset every day at midnight</li>
              <li>• Perfect games contribute to multiple challenge types</li>
            </ul>
          </div>
        </div>
      ) : activeTab === 'tournament' ? (
        <WeeklyTournament />
      ) : (
        <ChallengeStats />
      )}
    </div>
  );
}