"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';

interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  streak: number;
  gameMode: string;
  date: string;
  reactionTime: number;
}

interface SimpleLeaderboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SimpleLeaderboard({ isOpen, onClose }: SimpleLeaderboardProps) {
  const { personalBest, personalBests, reactionTimes, streak: currentStreak } = useGameStore();
  const [activeTab, setActiveTab] = useState<'local' | 'global'>('local');
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [localLeaderboard, setLocalLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [globalLeaderboard, setGlobalLeaderboard] = useState<LeaderboardEntry[]>([]);

  // Load local leaderboard from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('brain-flip-leaderboard');
    if (saved) {
      try {
        const entries = JSON.parse(saved);
        setLocalLeaderboard(entries);
      } catch (error) {
        console.error('Failed to load leaderboard:', error);
      }
    }
  }, []);

  // Save score to local leaderboard
  const saveScore = (score: number, gameMode: string, streak: number) => {
    const avgReactionTime = reactionTimes.length > 0 
      ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
      : 0;

    const newEntry: LeaderboardEntry = {
      id: Date.now().toString(),
      name: 'You',
      score,
      streak,
      gameMode,
      date: new Date().toISOString(),
      reactionTime: avgReactionTime
    };

    const updated = [...localLeaderboard, newEntry]
      .sort((a, b) => b.score - a.score)
      .slice(0, 100); // Keep top 100

    setLocalLeaderboard(updated);
    localStorage.setItem('brain-flip-leaderboard', JSON.stringify(updated));
  };

  // Mock global leaderboard (in a real app, this would come from a server)
  useEffect(() => {
    const mockGlobalData: LeaderboardEntry[] = [
      { id: '1', name: 'BrainMaster', score: 45230, streak: 28, gameMode: 'classic', date: '2024-01-15', reactionTime: 245 },
      { id: '2', name: 'QuickThink', score: 42100, streak: 25, gameMode: 'classic', date: '2024-01-14', reactionTime: 198 },
      { id: '3', name: 'FlipLord', score: 38950, streak: 22, gameMode: 'duel', date: '2024-01-13', reactionTime: 312 },
      { id: '4', name: 'NeuralNet', score: 35670, streak: 19, gameMode: 'classic', date: '2024-01-12', reactionTime: 267 },
      { id: '5', name: 'CognitiveAce', score: 33420, streak: 18, gameMode: 'sudden-death', date: '2024-01-11', reactionTime: 189 },
      { id: '6', name: 'MindBender', score: 31200, streak: 16, gameMode: 'classic', date: '2024-01-10', reactionTime: 298 },
      { id: '7', name: 'SynapseSpeed', score: 29800, streak: 15, gameMode: 'duel', date: '2024-01-09', reactionTime: 223 },
      { id: '8', name: 'BrainWave', score: 28100, streak: 14, gameMode: 'classic', date: '2024-01-08', reactionTime: 334 },
      { id: '9', name: 'ThinkFast', score: 26500, streak: 13, gameMode: 'classic', date: '2024-01-07', reactionTime: 276 },
      { id: '10', name: 'FlipMaster', score: 25200, streak: 12, gameMode: 'duel', date: '2024-01-06', reactionTime: 301 }
    ];

    // Add user's best score to global leaderboard if it's good enough
    if (personalBest > 20000) {
      const userEntry: LeaderboardEntry = {
        id: 'user',
        name: 'You',
        score: personalBest,
        streak: currentStreak,
        gameMode: 'classic',
        date: new Date().toISOString(),
        reactionTime: reactionTimes.length > 0 
          ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
          : 0
      };

      const combined = [...mockGlobalData, userEntry]
        .sort((a, b) => b.score - a.score)
        .slice(0, 50);

      setGlobalLeaderboard(combined);
    } else {
      setGlobalLeaderboard(mockGlobalData);
    }
  }, [personalBest, currentStreak, reactionTimes]);

  // Filter entries by time
  const filterByTime = (entries: LeaderboardEntry[]) => {
    if (timeFilter === 'all') return entries;

    const now = new Date();
    const cutoff = new Date();

    switch (timeFilter) {
      case 'today':
        cutoff.setHours(0, 0, 0, 0);
        break;
      case 'week':
        cutoff.setDate(now.getDate() - 7);
        break;
      case 'month':
        cutoff.setMonth(now.getMonth() - 1);
        break;
    }

    return entries.filter(entry => new Date(entry.date) >= cutoff);
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '🏅';
    }
  };

  const getGameModeColor = (mode: string) => {
    switch (mode) {
      case 'classic': return 'text-green-400';
      case 'duel': return 'text-yellow-400';
      case 'sudden-death': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  if (!isOpen) return null;

  const currentEntries = activeTab === 'local' 
    ? filterByTime(localLeaderboard)
    : filterByTime(globalLeaderboard);

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
              Leaderboard
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
            <button
              onClick={() => setActiveTab('local')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'local'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              📱 Local Scores
            </button>
            <button
              onClick={() => setActiveTab('global')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'global'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              🌍 Global Scores
            </button>
          </div>

          {/* Time Filter */}
          <div className="flex gap-2 mb-6">
            {[
              { id: 'all', label: 'All Time' },
              { id: 'month', label: 'This Month' },
              { id: 'week', label: 'This Week' },
              { id: 'today', label: 'Today' }
            ].map(filter => (
              <button
                key={filter.id}
                onClick={() => setTimeFilter(filter.id as any)}
                className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                  timeFilter === filter.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Personal Best Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="glass-card p-4 text-center border border-blue-500/30">
              <div className="text-2xl text-blue-400 mb-1">🎯</div>
              <div className="text-xl font-bold text-white">{personalBest.toLocaleString()}</div>
              <div className="text-sm text-gray-400">Personal Best</div>
            </div>
            
            <div className="glass-card p-4 text-center border border-green-500/30">
              <div className="text-2xl text-green-400 mb-1">🔥</div>
              <div className="text-xl font-bold text-white">{Math.max(...Object.values(personalBests))}</div>
              <div className="text-sm text-gray-400">Best Mode Score</div>
            </div>
            
            <div className="glass-card p-4 text-center border border-yellow-500/30">
              <div className="text-2xl text-yellow-400 mb-1">⚡</div>
              <div className="text-xl font-bold text-white">
                {reactionTimes.length > 0 ? Math.min(...reactionTimes) : 0}ms
              </div>
              <div className="text-sm text-gray-400">Fastest Reaction</div>
            </div>
          </div>

          {/* Leaderboard Table */}
          <div className="space-y-2">
            {currentEntries.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <div className="text-4xl mb-4">🏆</div>
                <div className="text-lg mb-2">No scores yet!</div>
                <div className="text-sm">
                  {activeTab === 'local' 
                    ? 'Play some games to see your scores here.'
                    : 'Check back later for global rankings.'}
                </div>
              </div>
            ) : (
              currentEntries.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center gap-4 p-4 rounded-lg transition-all ${
                    entry.name === 'You' 
                      ? 'bg-purple-500/20 border border-purple-500/30' 
                      : 'bg-gray-800/50 hover:bg-gray-800/70'
                  }`}
                >
                  {/* Rank */}
                  <div className="text-2xl w-12 text-center">
                    {getRankIcon(index + 1)}
                  </div>
                  
                  {/* Rank Number */}
                  <div className="text-lg font-bold text-gray-400 w-8">
                    #{index + 1}
                  </div>
                  
                  {/* Player Info */}
                  <div className="flex-1">
                    <div className={`font-semibold ${entry.name === 'You' ? 'text-purple-400' : 'text-white'}`}>
                      {entry.name}
                      {entry.name === 'You' && <span className="ml-2 text-xs text-purple-300">(You)</span>}
                    </div>
                    <div className="text-sm text-gray-400">
                      <span className={getGameModeColor(entry.gameMode)}>
                        {entry.gameMode === 'sudden-death' ? 'Sudden Death' : 
                         entry.gameMode.charAt(0).toUpperCase() + entry.gameMode.slice(1)}
                      </span>
                      {' • '}
                      {new Date(entry.date).toLocaleDateString()}
                    </div>
                  </div>
                  
                  {/* Score */}
                  <div className="text-right">
                    <div className="text-xl font-bold text-green-400">
                      {entry.score.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-400">
                      {entry.streak} streak • {entry.reactionTime}ms avg
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Share Score Button */}
          {personalBest > 0 && (
            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  const text = `I just scored ${personalBest.toLocaleString()} points in Brain Flip! 🧠⚡ Can you beat my score?`;
                  if (navigator.share) {
                    navigator.share({ text });
                  } else {
                    navigator.clipboard.writeText(text);
                    // Could show a toast notification here
                  }
                }}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-lg font-semibold transition-all transform hover:scale-105"
              >
                📤 Share Your Score
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}