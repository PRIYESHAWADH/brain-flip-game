'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBattleStore } from '@/store/battleStore';
import { BattleSettings } from '@/types/battle';

export default function BattleLobby() {
  const {
    currentRoom,
    createRoom,
    joinRoom,
    leaveRoom,
    startBattle,
    kickPlayer,
    transferHost,
    isLoading,
    error,
    clearError
  } = useBattleStore();

  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showJoinRoom, setShowJoinRoom] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [roomPassword, setRoomPassword] = useState('');
  const [joinRoomId, setJoinRoomId] = useState('');
  const [joinPassword, setJoinPassword] = useState('');
  const [settings, setSettings] = useState<Partial<BattleSettings>>({
    instructionTypes: ['direction', 'color', 'action', 'combo'],
    difficulty: 'medium',
    powerUpsEnabled: true,
    spectateMode: false,
    autoStart: false,
    countdownDuration: 5
  });

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const handleCreateRoom = async () => {
    try {
      const roomData = {
        name: roomName,
        gameMode: 'quick-battle' as const,
        maxPlayers: 4,
        timeLimit: 300000
      };
      await createRoom(roomData, 'Player');
      setShowCreateRoom(false);
      setRoomName('');
      setRoomPassword('');
    } catch (error: unknown) {
      console.error('Failed to create room:', error);
    }
  };

  const handleJoinRoom = async () => {
    try {
      await joinRoom(joinRoomId, joinPassword || undefined);
      setShowJoinRoom(false);
      setJoinRoomId('');
      setJoinPassword('');
    } catch (error: unknown) {
      console.error('Failed to join room:', error);
    }
  };

  const handleStartBattle = () => {
    if (currentRoom && currentRoom.players.length >= 2) {
      startBattle();
    }
  };

  const handleKickPlayer = (playerId: string) => {
    kickPlayer(playerId);
  };

  const handleTransferHost = (playerId: string) => {
    transferHost(playerId);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'hard': return 'text-orange-400';
      case 'extreme': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getPlayerStatusColor = (player: any) => {
    if (!player.isAlive) return 'text-red-400';
    if (player.isReady) return 'text-green-400';
    return 'text-yellow-400';
  };

  const handleRoomSettingsChange = (key: keyof BattleSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (!currentRoom) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              ⚔️ Battle Arena
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Challenge other players in real-time battles. Test your skills, use power-ups, and climb the leaderboard!
            </p>
          </motion.div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateRoom(true)}
              className="btn-primary text-lg px-8 py-4 flex items-center gap-3"
            >
              <span>🏠</span>
              Create Battle Room
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowJoinRoom(true)}
              className="btn-secondary text-lg px-8 py-4 flex items-center gap-3"
            >
              <span>🔍</span>
              Join Battle Room
            </motion.button>
          </div>

          {/* Create Room Modal */}
          <AnimatePresence>
            {showCreateRoom && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
                onClick={() => setShowCreateRoom(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-gray-900/95 border border-purple-500/30 rounded-2xl p-6 max-w-md w-full"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h2 className="text-2xl font-bold mb-6 text-center">Create Battle Room</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Room Name</label>
                      <input
                        type="text"
                        value={roomName}
                        onChange={(e) => setRoomName(e.target.value)}
                        placeholder="Enter room name..."
                        className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                        maxLength={30}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Password (Optional)</label>
                      <input
                        type="password"
                        value={roomPassword}
                        onChange={(e) => setRoomPassword(e.target.value)}
                        placeholder="Enter password..."
                        className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => setShowCreateRoom(false)}
                      className="flex-1 py-3 px-4 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateRoom}
                      disabled={!roomName.trim()}
                      className="flex-1 py-3 px-4 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
                    >
                      Create Room
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Join Room Modal */}
          <AnimatePresence>
            {showJoinRoom && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
                onClick={() => setShowJoinRoom(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-gray-900/95 border border-purple-500/30 rounded-2xl p-6 max-w-md w-full"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h2 className="text-2xl font-bold mb-6 text-center">Join Battle Room</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Room ID</label>
                      <input
                        type="text"
                        value={joinRoomId}
                        onChange={(e) => setJoinRoomId(e.target.value)}
                        placeholder="Enter room ID..."
                        className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Password (if required)</label>
                      <input
                        type="password"
                        value={joinPassword}
                        onChange={(e) => setJoinPassword(e.target.value)}
                        placeholder="Enter password..."
                        className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => setShowJoinRoom(false)}
                      className="flex-1 py-3 px-4 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleJoinRoom}
                      disabled={!joinRoomId.trim()}
                      className="flex-1 py-3 px-4 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
                    >
                      Join Room
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // Room view
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Room Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">{currentRoom.name}</h1>
            <p className="text-gray-400">
              {currentRoom.gameMode} • {currentRoom.players.length}/{currentRoom.maxPlayers} players
            </p>
          </div>
          <button
            onClick={leaveRoom}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors"
          >
            Leave Room
          </button>
        </div>

        {/* Players Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {currentRoom.players.map((player) => (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card p-6 text-center"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">
                  {player.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <h3 className="font-bold text-lg mb-2">{player.name}</h3>
              <div className="text-sm text-gray-400 mb-2">
                Score: {player.score} • Streak: {player.streak}
              </div>
              <div className={`text-xs px-3 py-1 rounded-full ${
                player.isReady ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
              }`}>
                {player.isReady ? 'Ready' : 'Not Ready'}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Room Settings */}
        <div className="glass-card p-6 mb-8">
          <h3 className="text-xl font-bold mb-4">Room Settings</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Difficulty</label>
              <select
                value={settings.difficulty}
                onChange={(e) => handleRoomSettingsChange('difficulty', e.target.value)}
                className="w-full p-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
                <option value="extreme">Extreme</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Power-ups</label>
              <input
                type="checkbox"
                checked={settings.powerUpsEnabled}
                onChange={(e) => handleRoomSettingsChange('powerUpsEnabled', e.target.checked)}
                className="w-4 h-4 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Auto-start</label>
              <input
                type="checkbox"
                checked={settings.autoStart}
                onChange={(e) => handleRoomSettingsChange('autoStart', e.target.checked)}
                className="w-4 h-4 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Countdown</label>
              <input
                type="number"
                min="3"
                max="10"
                value={settings.countdownDuration}
                onChange={(e) => handleRoomSettingsChange('countdownDuration', parseInt(e.target.value))}
                className="w-full p-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
              />
            </div>
          </div>
        </div>

        {/* Start Battle Button */}
        {currentRoom.players.length >= 2 && (
          <div className="text-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStartBattle}
              className="btn-primary text-xl px-12 py-4"
            >
              🚀 Start Battle
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
}
