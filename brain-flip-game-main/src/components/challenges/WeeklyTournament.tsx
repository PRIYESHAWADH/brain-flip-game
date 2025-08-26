'use client';

import React, { useEffect } from 'react';
import { useDailyChallengeStore } from '@/store/dailyChallengeStore';
import { useGameStore } from '@/store/gameStore';

const WeeklyTournament: React.FC = () => {
  const { 
    weeklyTournament, 
    joinWeeklyTournament,
    updateTournamentScore 
  } = useDailyChallengeStore();
  
  const { totalPoints } = useGameStore();

  useEffect(() => {
    if (!weeklyTournament) {
      joinWeeklyTournament();
    }
  }, [weeklyTournament, joinWeeklyTournament]);

  useEffect(() => {
    if (weeklyTournament && totalPoints > 0) {
      updateTournamentScore(totalPoints);
    }
  }, [totalPoints, weeklyTournament, updateTournamentScore]);

  if (!weeklyTournament) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-4">🏆</div>
        <p className="text-gray-400">Loading tournament...</p>
      </div>
    );
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-400';
    if (rank === 2) return 'text-gray-300';
    if (rank === 3) return 'text-orange-400';
    return 'text-gray-400';
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };


  return (
    <div className="space-y-6">
      {/* Tournament Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent mb-2">
          {weeklyTournament.name}
        </h2>
        <p className="text-gray-400 mb-4">{weeklyTournament.description}</p>
        
        <div className="flex justify-center gap-6 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{formatNumber(weeklyTournament.participants)}</div>
            <div className="text-gray-400">Participants</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{daysRemaining}</div>
            <div className="text-gray-400">Days Left</div>
          </div>
        </div>
      </div>

      {/* User Rank Card */}
      <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-6">
        <div className="text-center">
          <h3 className="text-xl font-bold text-white mb-4">Your Tournament Standing</h3>
          {weeklyTournament.userScore && weeklyTournament.userScore > 0 ? (
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className={`text-3xl font-bold ${getRankColor(weeklyTournament.userRank || 999)}`}>
                  {getRankIcon(weeklyTournament.userRank || 999)}
                </div>
                <div className="text-gray-400 text-sm">Current Rank</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-400">
                  {formatNumber(weeklyTournament.userScore)}
                </div>
                <div className="text-gray-400 text-sm">Tournament Score</div>
              </div>
            </div>
          ) : (
            <div className="py-8">
              <div className="text-4xl mb-4">🎮</div>
              <p className="text-gray-400 mb-2">Play a game to join the tournament!</p>
              <p className="text-sm text-gray-500">Your best score will be automatically submitted</p>
            </div>
          )}
        </div>
      </div>

      {/* Prize Pool */}
      <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl p-6">
        <h3 className="text-xl font-bold text-yellow-300 mb-4 text-center">🏆 Prize Pool</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-yellow-500/20 rounded-lg border border-yellow-500/40">
            <div className="text-2xl mb-2">🥇</div>
            <div className="font-bold text-yellow-400">1st Place</div>
            <div className="text-sm text-gray-300">
              {formatNumber(weeklyTournament.prizePool.first.points)} pts
            </div>
            <div className="text-sm text-gray-300">
              {weeklyTournament.prizePool.first.starCoins} ⭐
            </div>
            {weeklyTournament.prizePool.first.cosmetic && (
              <div className="text-xs text-purple-400 mt-1">
                + {weeklyTournament.prizePool.first.cosmetic}
              </div>
            )}
          </div>
          
          <div className="text-center p-4 bg-gray-500/20 rounded-lg border border-gray-500/40">
            <div className="text-2xl mb-2">🥈</div>
            <div className="font-bold text-gray-300">2nd Place</div>
            <div className="text-sm text-gray-300">
              {formatNumber(weeklyTournament.prizePool.second.points)} pts
            </div>
            <div className="text-sm text-gray-300">
              {weeklyTournament.prizePool.second.starCoins} ⭐
            </div>
          </div>
          
          <div className="text-center p-4 bg-orange-500/20 rounded-lg border border-orange-500/40">
            <div className="text-2xl mb-2">🥉</div>
            <div className="font-bold text-orange-400">3rd Place</div>
            <div className="text-sm text-gray-300">
              {formatNumber(weeklyTournament.prizePool.third.points)} pts
            </div>
            <div className="text-sm text-gray-300">
              {weeklyTournament.prizePool.third.starCoins} ⭐
            </div>
          </div>
          
          <div className="text-center p-4 bg-blue-500/20 rounded-lg border border-blue-500/40">
            <div className="text-2xl mb-2">🎁</div>
            <div className="font-bold text-blue-400">Participation</div>
            <div className="text-sm text-gray-300">
              {formatNumber(weeklyTournament.prizePool.participation.points)} pts
            </div>
            <div className="text-xs text-gray-400 mt-1">
              For all participants
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4 text-center">🏅 Top Players</h3>
        <div className="space-y-3">
          {weeklyTournament.leaderboard.length > 0 ? (
            weeklyTournament.leaderboard.slice(0, 10).map((player, index) => (
              <div
                key={player.playerId}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  player.playerId === 'user'
                    ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/40'
                    : index < 3 
                      ? 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30'
                      : 'bg-gray-700/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`text-xl ${getRankColor(player.rank)}`}>
                    {getRankIcon(player.rank)}
                  </div>
                  <div>
                    <div className={`font-semibold ${player.playerId === 'user' ? 'text-purple-300' : 'text-white'}`}>
                      {player.playerName}
                    </div>
                    <div className="text-sm text-gray-400">Rank #{player.rank}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-blue-400">{formatNumber(player.score)}</div>
                  <div className="text-xs text-gray-400">points</div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-400">
              <div className="text-4xl mb-2">🏆</div>
              <p>Be the first to set a score!</p>
              <p className="text-sm mt-1">Play a game to join the tournament leaderboard</p>
            </div>
          )}
        </div>
      </div>

      {/* Tournament Tips */}
      <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
        <h4 className="font-semibold text-purple-300 mb-2">🎯 Tournament Tips</h4>
        <ul className="text-sm text-gray-300 space-y-1">
          <li>• Your highest single-game score counts toward the tournament</li>
          <li>• Complete daily challenges for bonus tournament points</li>
          <li>• Tournament resets every Sunday at midnight</li>
          <li>• All participants receive participation rewards</li>
        </ul>
      </div>
    </div>
  );
};

export default WeeklyTournament;