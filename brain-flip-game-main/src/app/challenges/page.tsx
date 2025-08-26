'use client';

import React from 'react';
import Link from 'next/link';
import DailyChallenges from '@/components/challenges/DailyChallenges';

export default function ChallengesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="text-center pt-8 pb-6">
        <h1 className="text-4xl md:text-5xl font-orbitron font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Daily Challenges
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto px-4">
          Complete daily challenges to earn rewards, climb the leaderboard, and unlock achievements!
        </p>
      </div>

      {/* Navigation */}
      <div className="flex justify-center mb-8">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-2 border border-gray-700">
          <div className="flex space-x-2">
            <Link
              href="/game"
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-700/50 transition-all duration-200 flex items-center gap-2"
            >
              <span>🎮</span>
              <span>Play Game</span>
            </Link>
            <div className="px-4 py-2 rounded-lg text-sm font-medium bg-purple-600 text-white shadow-lg flex items-center gap-2">
              <span>🎯</span>
              <span>Challenges</span>
            </div>
            <Link
              href="/leaderboard"
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-700/50 transition-all duration-200 flex items-center gap-2"
            >
              <span>🏆</span>
              <span>Leaderboard</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Challenges Content */}
      <div className="container mx-auto px-4 pb-8">
        <div className="max-w-4xl mx-auto">
          <DailyChallenges />
        </div>
      </div>
    </div>
  );
}