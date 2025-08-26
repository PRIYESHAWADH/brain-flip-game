'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import GameModeSelection from './GameModeSelection';
import DailyChallenges from '../challenges/DailyChallenges';
import Achievements from '../achievements/Achievements';
import Statistics from '../statistics/Statistics';
import Settings from '../settings/Settings';
import AuthModal from '../auth/AuthModal';
import BattleMode from '../battle/BattleMode';
import LearnMode from '../learn/LearnMode';
import { useMultiplayerStore } from '@/store/multiplayerStore';

type MenuTab = 'play' | 'learn' | 'battle' | 'challenges' | 'achievements' | 'stats' | 'settings';
  { id: 'play' as MenuTab, name: 'Play', icon: '🎮' },
  { id: 'learn' as MenuTab, name: 'Learn', icon: '🎓' },
  { id: 'battle' as MenuTab, name: 'Battle', icon: '⚔️' },
  { id: 'challenges' as MenuTab, name: 'Challenges', icon: '🎯' },
  { id: 'achievements' as MenuTab, name: 'Achievements', icon: '🏆' },
  { id: 'stats' as MenuTab, name: 'Stats', icon: '📊' },
  { id: 'settings' as MenuTab, name: 'Settings', icon: '⚙️' }
];

export default function MainMenu() {
  const [activeTab, setActiveTab] = useState<MenuTab>('play');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user, profile, isAuthenticated, loading } = useAuth();
    switch (activeTab) {
      case 'play':
        return <GameModeSelection />;
      case 'learn':
        return <LearnMode />;
      case 'battle':
        return <BattleMode />;
      case 'challenges':
        return <DailyChallenges />;
      case 'achievements':
        return <Achievements />;
      case 'stats':
        return <Statistics />;
      case 'settings':
        return <Settings />;
      default:
        return <GameModeSelection />;
    }
  };
    useMultiplayerStore.setState({ showMultiplayerMenu: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="text-center pt-8 pb-6">
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
        >
          Brain <span className="text-blue-400">Flip</span>
        </motion.h1>
        
        {/* User Profile Section */}
        <div className="flex justify-center items-center gap-4 mb-6">
          {loading ? (
            <div className="text-gray-400">Loading...</div>
          ) : isAuthenticated && profile ? (
            <div className="flex items-center gap-3 bg-gray-800/50 backdrop-blur-sm rounded-lg px-4 py-2 border border-gray-700">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {profile.display_name?.[0] || profile.username?.[0] || 'U'}
              </div>
              <div className="text-left">
                <div className="text-white font-medium text-sm">
                  {profile.display_name || profile.username}
                </div>
                <div className="text-gray-400 text-xs">
                  Level {profile.level} • {profile.total_games_played} games
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-6 py-2 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Sign In / Sign Up
            </button>
          )}
        </div>

        {/* Multiplayer Button */}
        <div className="flex justify-center mb-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleMultiplayerClick}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold px-8 py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl text-lg"
          >
            ⚡ Enter Multiplayer Battles
          </motion.button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center mb-8">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-2 border border-gray-700">
          <div className="flex space-x-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span className="hidden sm:inline">{tab.name}</span>
                
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-purple-600 rounded-lg -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="container mx-auto px-4 pb-8">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="max-w-6xl mx-auto"
        >
          {renderTabContent()}
        </motion.div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={() => setShowAuthModal(false)}
      />
    </div>
  );
}