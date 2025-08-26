"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';

interface AnalyticsData {
  totalGames: number;
  totalScore: number;
  averageScore: number;
  bestScore: number;
  totalPlayTime: number;
  averageReactionTime: number;
  fastestReaction: number;
  totalStreaks: number;
  longestStreak: number;
  perfectRounds: number;
  lightningReactions: number;
  accuracy: number;
  gamesByMode: {
    classic: number;
    duel: number;
    'sudden-death': number;
  };
  scoresByMode: {
    classic: number;
    duel: number;
    'sudden-death': number;
  };
  recentPerformance: Array<{
    date: string;
    score: number;
    level: number;
    streak: number;
  }>;
  weeklyProgress: Array<{
    week: string;
    gamesPlayed: number;
    totalScore: number;
    averageScore: number;
  }>;
}

interface WorldClassAnalyticsProps {
  showDetailed?: boolean;
}

export default function WorldClassAnalytics({ showDetailed = true }: WorldClassAnalyticsProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const { user } = useAuth();

    try {
      setLoading(true);

      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      
      if (result.success) {
        setAnalytics(result.data);
        setError(null);
      } else {
        throw new Error(result.error || 'Failed to fetch analytics');
      }
    } catch (err: unknown) {
      console.error('Analytics fetch error:', err);
      setError('Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  }, [selectedTimeframe]);

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user, fetchAnalytics]);

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatReactionTime = (ms: number) => {
    return `${ms.toFixed(0)}ms`;
  };

  const getPerformanceColor = (value: number, threshold: number) => {
    if (value >= threshold * 0.8) return 'text-green-400';
    if (value >= threshold * 0.6) return 'text-yellow-400';
    return 'text-red-400';
  };
    return 'text-red-400';
  };

    title, 
    value, 
    subtitle, 
    icon, 
    color = 'text-white',
    trend 
  }: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: string;
    color?: string;
    trend?: { value: number; direction: 'up' | 'down' };
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 border border-purple-500/30"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="text-2xl">{icon}</div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm ${
            trend.direction === 'up' ? 'text-green-400' : 'text-red-400'
          }`}>
            <span>{trend.direction === 'up' ? '↗' : '↘'}</span>
            <span>{trend.value}%</span>
          </div>
        )}
      </div>
      <div className={`text-3xl font-bold ${color} mb-1`}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      <div className="text-gray-400 text-sm">{title}</div>
      {subtitle && (
        <div className="text-gray-500 text-xs mt-1">{subtitle}</div>
      )}
    </motion.div>
  );

		try {
			// Export logic here
			console.log(`Exporting analytics in ${format} format`);
		} catch (error: unknown) {
			console.error('Export error:', error);
		}
	};

  if (loading) {
    return (
      <div className="glass-card p-8 text-center">
        <div className="text-4xl mb-4">📊</div>
        <div className="text-xl text-gray-300">Loading your analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card p-8 text-center">
        <div className="text-4xl mb-4">❌</div>
        <div className="text-xl text-red-400 mb-4">Failed to load analytics</div>
        <button
          onClick={fetchAnalytics}
          className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="glass-card p-8 text-center">
        <div className="text-4xl mb-4">📊</div>
        <div className="text-xl text-gray-300">No analytics data available</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          📊 Your Analytics
        </h2>
        
        {/* Timeframe Selector */}
        <div className="flex gap-2">
          {(['7d', '30d', '90d', 'all'] as const).map((timeframe) => (
            <button
              key={timeframe}
              onClick={() => setSelectedTimeframe(timeframe)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                selectedTimeframe === timeframe
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {timeframe === '7d' ? '7 Days' : 
               timeframe === '30d' ? '30 Days' : 
               timeframe === '90d' ? '90 Days' : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Games"
          value={analytics.totalGames}
          icon="🎮"
          color="text-blue-400"
        />
        <StatCard
          title="Total Score"
          value={analytics.totalScore}
          icon="🏆"
          color="text-yellow-400"
        />
        <StatCard
          title="Best Score"
          value={analytics.bestScore}
          icon="⭐"
          color="text-purple-400"
        />
        <StatCard
          title="Play Time"
          value={formatTime(analytics.totalPlayTime)}
          icon="⏱️"
          color="text-green-400"
        />
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Average Score"
          value={analytics.averageScore.toFixed(0)}
          subtitle="per game"
          icon="📈"
          color={getPerformanceColor(analytics.averageScore, 1000)}
        />
        <StatCard
          title="Accuracy"
          value={`${(analytics.accuracy * 100).toFixed(1)}%`}
          subtitle="correct answers"
          icon="🎯"
          color={getPerformanceColor(analytics.accuracy * 100, 80)}
        />
        <StatCard
          title="Avg Reaction Time"
          value={formatReactionTime(analytics.averageReactionTime)}
          subtitle="response speed"
          icon="⚡"
          color={getPerformanceColor(1000 - analytics.averageReactionTime, 400)}
        />
      </div>

      {/* Advanced Metrics */}
      {showDetailed && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Fastest Reaction"
              value={formatReactionTime(analytics.fastestReaction)}
              icon="🚀"
              color="text-green-400"
            />
            <StatCard
              title="Longest Streak"
              value={analytics.longestStreak}
              icon="🔥"
              color="text-orange-400"
            />
            <StatCard
              title="Perfect Rounds"
              value={analytics.perfectRounds}
              icon="✨"
              color="text-purple-400"
            />
            <StatCard
              title="Lightning Reactions"
              value={analytics.lightningReactions}
              subtitle="< 400ms"
              icon="⚡"
              color="text-yellow-400"
            />
          </div>

          {/* Game Mode Breakdown */}
          <div className="glass-card p-6 border border-purple-500/30">
            <h3 className="text-xl font-bold text-white mb-4">🎮 Game Mode Performance</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(['classic', 'duel', 'sudden-death'] as const).map((mode) => (
                <div key={mode} className="text-center">
                  <div className="text-2xl mb-2">
                    {mode === 'classic' ? '🎯' : mode === 'duel' ? '⚔️' : '💀'}
                  </div>
                  <div className="text-lg font-bold text-white capitalize mb-1">
                    {mode.replace('-', ' ')}
                  </div>
                  <div className="text-2xl font-bold text-purple-400 mb-1">
                    {analytics.gamesByMode[mode]}
                  </div>
                  <div className="text-sm text-gray-400">games played</div>
                  <div className="text-lg font-bold text-yellow-400 mt-2">
                    {analytics.scoresByMode[mode].toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-400">total score</div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Performance Chart */}
          {analytics.recentPerformance.length > 0 && (
            <div className="glass-card p-6 border border-purple-500/30">
              <h3 className="text-xl font-bold text-white mb-4">📈 Recent Performance</h3>
              <div className="space-y-3">
                {analytics.recentPerformance.slice(-5).map((performance, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-lg">{index + 1}</div>
                      <div>
                        <div className="text-white font-medium">
                          {new Date(performance.date).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-400">
                          Level {performance.level} • Streak {performance.streak}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-yellow-400">
                        {performance.score.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-400">score</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Insights */}
      <div className="glass-card p-6 border border-purple-500/30">
        <h3 className="text-xl font-bold text-white mb-4">💡 Performance Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="text-2xl">🎯</div>
              <div>
                <div className="text-white font-medium">Accuracy</div>
                <div className="text-sm text-gray-400">
                  You're getting {(analytics.accuracy * 100).toFixed(1)}% of answers correct
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-2xl">⚡</div>
              <div>
                <div className="text-white font-medium">Speed</div>
                <div className="text-sm text-gray-400">
                  Average reaction time: {formatReactionTime(analytics.averageReactionTime)}
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="text-2xl">🔥</div>
              <div>
                <div className="text-white font-medium">Consistency</div>
                <div className="text-sm text-gray-400">
                  Longest streak: {analytics.longestStreak} correct answers
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-2xl">📊</div>
              <div>
                <div className="text-white font-medium">Progress</div>
                <div className="text-sm text-gray-400">
                  {analytics.totalGames} games played, {formatTime(analytics.totalPlayTime)} total time
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
