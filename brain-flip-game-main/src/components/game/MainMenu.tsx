'use client';

import React, { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import LocalMultiplayer from '@/components/multiplayer/LocalMultiplayer';
import SimpleLeaderboard from '@/components/leaderboard/SimpleLeaderboard';
import SocialShare from '@/components/social/SocialShare';
import PersonalStats from '@/components/game/PersonalStats';

export default function MainMenu() {
  const { startGame, personalBest } = useGameStore();
  const [showLocalMultiplayer, setShowLocalMultiplayer] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showSocialShare, setShowSocialShare] = useState(false);
  const [showStats, setShowStats] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center p-6">
      <div className="text-center">
        <h1 className="text-6xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
          🧠 Brain Flip
        </h1>
        <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
          Test your reflexes and cognitive skills in this fast-paced brain training game!
        </p>
        
        {/* Single Player Modes */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Single Player</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            <button
              onClick={() => startGame('classic')}
              className="btn-primary text-lg px-6 py-4 flex items-center justify-center gap-3"
            >
              <span>🎯</span>
              Classic Mode
            </button>
            
            <button
              onClick={() => startGame('duel')}
              className="btn-secondary text-lg px-6 py-4 flex items-center justify-center gap-3"
            >
              <span>⚡</span>
              Duel Mode
            </button>
            
            <button
              onClick={() => startGame('sudden-death')}
              className="btn-accent text-lg px-6 py-4 flex items-center justify-center gap-3"
            >
              <span>💀</span>
              Sudden Death
            </button>
          </div>
        </div>

        {/* Multiplayer Options */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Multiplayer</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <button
              onClick={() => setShowLocalMultiplayer(true)}
              className="glass-card px-6 py-4 text-purple-400 hover:text-white hover:bg-purple-500/10 transition-all flex items-center justify-center gap-3 border border-purple-500/30"
            >
              <span>👥</span>
              Local Multiplayer
            </button>
            
            <button
              onClick={() => window.open('/battle', '_blank')}
              className="glass-card px-6 py-4 text-red-400 hover:text-white hover:bg-red-500/10 transition-all flex items-center justify-center gap-3 border border-red-500/30"
            >
              <span>⚔️</span>
              Online Battle
            </button>
          </div>
        </div>

        {/* Social & Stats */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Progress & Social</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <button
              onClick={() => setShowStats(true)}
              className="glass-card px-4 py-3 text-blue-400 hover:text-white hover:bg-blue-500/10 transition-all flex items-center justify-center gap-2 border border-blue-500/30"
            >
              <span>📊</span>
              Stats
            </button>
            
            <button
              onClick={() => setShowLeaderboard(true)}
              className="glass-card px-4 py-3 text-yellow-400 hover:text-white hover:bg-yellow-500/10 transition-all flex items-center justify-center gap-2 border border-yellow-500/30"
            >
              <span>🏆</span>
              Leaderboard
            </button>
            
            <button
              onClick={() => setShowSocialShare(true)}
              disabled={personalBest === 0}
              className="glass-card px-4 py-3 text-green-400 hover:text-white hover:bg-green-500/10 transition-all flex items-center justify-center gap-2 border border-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>📤</span>
              Share
            </button>
            
            <button
              onClick={() => window.open('/achievements', '_blank')}
              className="glass-card px-4 py-3 text-purple-400 hover:text-white hover:bg-purple-500/10 transition-all flex items-center justify-center gap-2 border border-purple-500/30"
            >
              <span>🏅</span>
              Achievements
            </button>
          </div>
        </div>
        
        {/* Personal Best Display */}
        {personalBest > 0 && (
          <div className="glass-card p-4 max-w-md mx-auto mb-8 border border-green-500/30">
            <div className="text-center">
              <div className="text-sm text-gray-400 mb-1">Personal Best</div>
              <div className="text-2xl font-bold text-green-400">{personalBest.toLocaleString()}</div>
            </div>
          </div>
        )}

        <div className="text-gray-400 text-sm">
          <p>Use arrow keys, WASD, or click buttons to answer</p>
          <p>React quickly and accurately to earn high scores!</p>
        </div>
      </div>

      {/* Modals */}
      <LocalMultiplayer 
        isOpen={showLocalMultiplayer} 
        onClose={() => setShowLocalMultiplayer(false)} 
      />
      
      <SimpleLeaderboard 
        isOpen={showLeaderboard} 
        onClose={() => setShowLeaderboard(false)} 
      />
      
      <SocialShare 
        isOpen={showSocialShare} 
        onClose={() => setShowSocialShare(false)} 
      />
      
      <PersonalStats 
        isOpen={showStats} 
        onClose={() => setShowStats(false)} 
      />
    </div>
  );
}
