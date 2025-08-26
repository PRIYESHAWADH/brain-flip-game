"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { worldClassSupabase } from '@/lib/supabase-enhanced';

interface LeaderboardEntry {
  id: string;
  rank: number;
  userId: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  score: number;
  gameMode: string;
  level: number;
  streak: number;
  createdAt: string;
  updatedAt: string;
}

interface WorldClassLeaderboardProps {
  gameMode: 'classic' | 'duel' | 'sudden-death';
  limit?: number;
  showRealTime?: boolean;
}

export default function WorldClassLeaderboard({ 
  gameMode, 
  limit = 10, 
  showRealTime = true 
}: WorldClassLeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Fetch initial leaderboard data
  useEffect(() => {
    fetchLeaderboard();
  }, [gameMode, limit]);

  // Set up real-time subscription
  useEffect(() => {
    if (!showRealTime) return;
      .channel('leaderboard-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leaderboards',
          filter: `game_mode=eq.${gameMode}`
        },
        (payload) => {
          console.log('Real-time leaderboard update:', payload);
          // Refresh leaderboard on any change
          fetchLeaderboard();
          setLastUpdate(new Date());
        }
      )
      .subscribe();

    return () => {
      worldClassSupabase.removeChannel(channel);
    };
  }, [gameMode, showRealTime]);
    try {
      setLoading(true);
      
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }
      
      if (result.success) {
        setEntries(result.data.leaderboard || []);
        setError(null);
      } else {
        throw new Error(result.error || 'Failed to fetch leaderboard');
      }
    } catch (err: unknown) {
      setError(err.message);
      console.error('Leaderboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };
    if (score >= 10000) return 'text-yellow-400';
    if (score >= 5000) return 'text-purple-400';
    if (score >= 2000) return 'text-blue-400';
    if (score >= 1000) return 'text-green-400';
    return 'text-gray-300';
  };

  if (loading && entries.length === 0) {
    return (
      <div className="glass-card p-8 text-center">
        <div className="text-4xl mb-4">⏳</div>
        <div className="text-xl text-gray-300">Loading leaderboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card p-8 text-center">
        <div className="text-4xl mb-4">❌</div>
        <div className="text-xl text-red-400 mb-4">Failed to load leaderboard</div>
        <button
          onClick={fetchLeaderboard}
          className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          🏆 {gameMode.charAt(0).toUpperCase() + gameMode.slice(1)} Leaderboard
        </h3>
        {showRealTime && (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Live Updates</span>
            <span className="text-xs">
              {lastUpdate.toLocaleTimeString()}
            </span>
          </div>
        )}
      </div>

      {/* Leaderboard Table */}
      <div className="glass-card overflow-hidden border border-purple-500/30">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-purple-500/10 border-b border-purple-500/20">
                <th className="px-4 py-3 text-left text-sm font-bold text-purple-400 uppercase tracking-wide">
                  Rank
                </th>
                <th className="px-4 py-3 text-left text-sm font-bold text-purple-400 uppercase tracking-wide">
                  Player
                </th>
                <th className="px-4 py-3 text-left text-sm font-bold text-purple-400 uppercase tracking-wide">
                  Score
                </th>
                <th className="px-4 py-3 text-left text-sm font-bold text-purple-400 uppercase tracking-wide">
                  Level
                </th>
                <th className="px-4 py-3 text-left text-sm font-bold text-purple-400 uppercase tracking-wide">
                  Streak
                </th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {entries.map((entry, index) => (
                  <motion.tr
                    key={entry.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                    className={`border-b border-purple-500/10 hover:bg-purple-500/5 transition-colors ${
                      index < 3 ? 'bg-purple-500/5' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold">
                          {getRankIcon(entry.rank)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {entry.displayName?.charAt(0) || entry.username?.charAt(0) || '?'}
                        </div>
                        <div>
                          <div className="font-medium text-white">
                            {entry.displayName || entry.username}
                          </div>
                          <div className="text-xs text-gray-400">
                            @{entry.username}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className={`font-bold text-lg ${getScoreColor(entry.score)}`}>
                        {entry.score.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-lg font-bold text-blue-400">
                        {entry.level}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-lg font-bold text-green-400">
                        {entry.streak}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {entries.length === 0 && !loading && (
        <div className="glass-card p-8 text-center">
          <div className="text-4xl mb-4">🏆</div>
          <div className="text-xl text-gray-300 mb-2">No scores yet!</div>
          <div className="text-gray-400">Be the first to set a record!</div>
        </div>
      )}

      {/* Refresh Button */}
      <div className="flex justify-center">
        <button
          onClick={fetchLeaderboard}
          disabled={loading}
          className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-lg transition-colors flex items-center gap-2"
        >
          {loading ? '🔄' : '🔄'} Refresh
        </button>
      </div>
    </div>
  );
}
