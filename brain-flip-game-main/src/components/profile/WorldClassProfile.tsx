"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useAchievements } from '@/hooks/useAchievements';

interface ProfileStats {
  totalGames: number;
  totalScore: number;
  bestScore: number;
  averageScore: number;
  longestStreak: number;
  level: number;
  experience: number;
  achievementsUnlocked: number;
  gamesThisWeek: number;
  scoreThisWeek: number;
  favoriteGameMode: string;
  accuracyRate: number;
  averageReactionTime: number;
}

export default function WorldClassProfile() {
  const { user, profile } = useAuth();
  const { achievements, loading: achievementsLoading } = useAchievements();
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      // Calculate stats from profile data
      const calculatedStats: ProfileStats = {
        totalGames: profile.total_games_played || 0,
        totalScore: profile.total_score || 0,
        bestScore: profile.best_score || 0,
        averageScore: profile.total_games_played ? Math.round((profile.total_score || 0) / profile.total_games_played) : 0,
        longestStreak: profile.longest_streak || 0,
        level: profile.level || 1,
        experience: profile.experience || 0,
        achievementsUnlocked: achievements?.length || 0,
        gamesThisWeek: 0, // Would need recent session data
        scoreThisWeek: 0, // Would need recent session data
        favoriteGameMode: 'Classic', // Would need session analysis
        accuracyRate: 85, // Would need detailed session data
        averageReactionTime: profile.average_reaction_time || 0,
      };
      
      setStats(calculatedStats);
      setLoading(false);
    }
  }, [profile, achievements]);

  if (!user || loading) {
    return (
      <div className="bg-gray-900 rounded-2xl border border-gray-700 p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-700 rounded w-1/2"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) return null;
    title: string;
    value: string | number;
    subtitle?: string;
    gradient: string;
  }) => (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`bg-gradient-to-br ${gradient} p-6 rounded-xl border border-white/10 backdrop-blur-sm`}
    >
      <h3 className="text-white/80 text-sm font-medium mb-2">{title}</h3>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      {subtitle && <p className="text-white/60 text-xs">{subtitle}</p>}
    </motion.div>
  );
    <motion.div
      whileHover={{ scale: 1.1 }}
      className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg p-3 text-center"
    >
      <div className="text-2xl mb-1">{achievement.icon}</div>
      <div className="text-yellow-400 font-bold text-sm">{achievement.name}</div>
      <div className="text-yellow-300/80 text-xs">{achievement.description}</div>
    </motion.div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-2xl border border-purple-500/20 p-8"
      >
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-3xl font-bold text-white">
            {profile?.username?.charAt(0).toUpperCase() || '?'}
          </div>
          
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white mb-2">
              {profile?.display_name || profile?.username}
            </h1>
            <p className="text-purple-300 mb-4">Level {stats.level} Brain Training Champion</p>
            
            {/* Experience Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/80">Experience</span>
                <span className="text-purple-300">{stats.experience} XP</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-1000"
                  style={{ width: `${progressToNextLevel}%` }}
                ></div>
              </div>
              <p className="text-white/60 text-xs">
                {experienceToNextLevel} XP to Level {stats.level + 1}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <StatCard
          title="Total Games"
          value={stats.totalGames.toLocaleString()}
          subtitle="Games completed"
          gradient="from-blue-600/30 to-blue-800/30"
        />
        
        <StatCard
          title="Best Score"
          value={stats.bestScore.toLocaleString()}
          subtitle="Personal record"
          gradient="from-green-600/30 to-green-800/30"
        />
        
        <StatCard
          title="Longest Streak"
          value={stats.longestStreak}
          subtitle="Consecutive correct"
          gradient="from-orange-600/30 to-orange-800/30"
        />
        
        <StatCard
          title="Achievements"
          value={stats.achievementsUnlocked}
          subtitle="Unlocked badges"
          gradient="from-purple-600/30 to-purple-800/30"
        />
      </motion.div>

      {/* Detailed Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
      >
        {/* Performance Stats */}
        <div className="bg-gray-900 rounded-2xl border border-gray-700 p-6">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            📊 Performance Stats
          </h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Total Score</span>
              <span className="text-white font-bold">{stats.totalScore.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Average Score</span>
              <span className="text-blue-400 font-bold">{stats.averageScore.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Accuracy Rate</span>
              <span className="text-green-400 font-bold">{stats.accuracyRate}%</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Avg Reaction Time</span>
              <span className="text-yellow-400 font-bold">
                {stats.averageReactionTime ? `${stats.averageReactionTime.toFixed(2)}ms` : 'N/A'}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Favorite Mode</span>
              <span className="text-purple-400 font-bold">{stats.favoriteGameMode}</span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-gray-900 rounded-2xl border border-gray-700 p-6">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            🔥 Recent Activity
          </h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Games This Week</span>
              <span className="text-white font-bold">{stats.gamesThisWeek}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Score This Week</span>
              <span className="text-blue-400 font-bold">{stats.scoreThisWeek.toLocaleString()}</span>
            </div>
            
            <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-lg p-4 border border-green-500/20">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400 mb-1">
                  {Math.max(0, 7 - (stats.gamesThisWeek % 7))}
                </div>
                <div className="text-green-300 text-sm">Games to weekly goal</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Achievements */}
      {achievements && achievements.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-900 rounded-2xl border border-gray-700 p-6"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            🏆 Achievements
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {achievements.slice(0, 8).map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <AchievementBadge achievement={achievement} />
              </motion.div>
            ))}
          </div>
          
          {achievements.length > 8 && (
            <div className="text-center mt-6">
              <button className="text-purple-400 hover:text-purple-300 font-medium">
                View All {achievements.length} Achievements →
              </button>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
