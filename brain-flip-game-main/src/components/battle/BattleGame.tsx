'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBattleStore } from '@/store/battleStore';
import { useAudio } from '@/hooks/useAudio';
import { getAnswers } from '@/utils/gameLogic';

export default function BattleGame() {
  const { 
    currentInstruction, 
    timeRemaining, 
    submitAnswer,
    currentRoom,
    isBattleActive,
    endBattle,
    activatePowerUp
  } = useBattleStore();

  const { 
    playCorrect, 
    playIncorrect 
  } = useAudio();

  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activePowerUps, setActivePowerUps] = useState<any[]>([]);
  const [showParticles, setShowParticles] = useState<'correct' | 'incorrect' | null>(null);
  const [isCountdownActive, setIsCountdownActive] = useState(false);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (timeRemaining <= 0) {
      handleTimeUp();
    }
  }, [timeRemaining]);

  const handleAnswer = useCallback((answer: string) => {
    if (isProcessing) return;
    
    setSelectedAnswer(answer);
    setIsProcessing(true);

    const isCorrect = currentInstruction?.correctAnswer === answer;
    
    if (isCorrect) {
      playCorrect();
      setShowParticles('correct');
    } else {
      playIncorrect();
      setShowParticles('incorrect');
    }
    
    submitAnswer(answer);
    
    setTimeout(() => {
      setIsProcessing(false);
      setSelectedAnswer('');
      setShowParticles(null);
    }, 1000);
  }, [isProcessing, currentInstruction, playCorrect, playIncorrect, submitAnswer]);

  const handleTimeUp = () => {
    // Handle time up logic
    console.log('Time up!');
  };

  const handlePowerUpActivation = (powerUp: any) => {
    activatePowerUp(powerUp.id);
    setActivePowerUps(prev => [...prev, powerUp]);
    
    // Remove power-up after duration
    setTimeout(() => {
      setActivePowerUps(prev => prev.filter(p => p.id !== powerUp.id));
    }, powerUp.duration);
  };

  const currentPlayer = () => {
    return currentRoom?.players.find(p => p.id === 'current_player');
  };

  const sortedPlayers = () => {
    if (!currentRoom) return [];
    return [...currentRoom.players].sort((a, b) => b.score - a.score);
  };

  const getTimerColor = () => {
    if (timeRemaining > 2000) return 'bg-green-500';
    if (timeRemaining > 1000) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (!currentRoom || !isBattleActive) {
    return null;
  }



  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Battle Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4 mb-4"
        >
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-purple-400">{currentRoom.name}</h1>
            <div className="flex items-center gap-4">
              <span className="text-gray-300">Battle Mode: {currentRoom.gameMode}</span>
              <span className="text-gray-300">Players: {currentRoom.currentPlayers}</span>
            </div>
          </div>
        </motion.div>

        {/* Countdown Overlay */}
        <AnimatePresence>
          {isCountdownActive && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.5 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
            >
              <div className="text-8xl font-bold text-white">{countdown}</div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Left Sidebar - Players */}
          <div className="lg:col-span-1 space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card p-4"
            >
              <h3 className="text-lg font-bold text-purple-400 mb-4">Players</h3>
              <div className="space-y-3">
                {sortedPlayers().map((player, index) => (
                  <div
                    key={player.id}
                    className={`p-3 rounded-lg border ${
                      player.id === 'current_player'
                        ? 'border-purple-500 bg-purple-500/20'
                        : 'border-gray-700 bg-gray-800/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">#{index + 1}</span>
                        <span className="font-medium text-white">{player.username}</span>
                        {player.isHost && <span className="text-yellow-400">👑</span>}
                      </div>
                      <span className={`text-sm ${player.isAlive ? 'text-green-400' : 'text-red-400'}`}>
                        {player.isAlive ? 'Alive' : 'Eliminated'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-400">Score:</span>
                        <span className="text-white font-medium ml-1">{player.score}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Lives:</span>
                        <span className="text-white font-medium ml-1">{player.lives}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Streak:</span>
                        <span className="text-white font-medium ml-1">{player.streak}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Rank:</span>
                        <span className="text-white font-medium ml-1">{player.rank}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Power-ups */}
            {currentRoom.settings.powerUpsEnabled && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card p-4"
              >
                <h3 className="text-lg font-bold text-green-400 mb-4">Power-ups</h3>
                <div className="space-y-2">
                  {currentPlayer()?.powerUps?.map((powerUp) => (
                    <button
                      key={powerUp.id}
                      onClick={() => handlePowerUpActivation(powerUp)}
                      className="w-full p-2 bg-gray-800 hover:bg-gray-700 rounded border border-gray-600 text-left"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{powerUp.icon}</span>
                        <div>
                          <div className="text-sm font-medium text-white">{powerUp.name}</div>
                          <div className="text-xs text-gray-400">{powerUp.description}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Main Game Area */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-8 text-center"
            >
              {/* Timer */}
              <div className="mb-6">
                <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
                  <div
                    className={`h-3 rounded-full transition-all duration-100 ${getTimerColor()}`}
                    style={{ width: `${(timeRemaining / 3000) * 100}%` }}
                  />
                </div>
                <div className="text-2xl font-bold text-white">
                  {Math.ceil(timeRemaining / 1000)}s
                </div>
              </div>

              {/* Current Instruction */}
              {currentInstruction && (
                <motion.div
                  key={currentInstruction.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-8"
                >
                  <div className="text-4xl font-bold text-white mb-4">
                    {currentInstruction.display}
                  </div>
                  <div className="text-lg text-gray-300">
                    {currentInstruction.type === 'color' && (
                      <span>Displayed in: <span className="text-blue-400">{currentInstruction.displayColor}</span></span>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Answer Buttons */}
              {currentInstruction && (
                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                  {getAnswers(currentInstruction).map((answer, index) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => handleAnswer(answer)}
                      disabled={isProcessing}
                      className={`p-4 text-lg font-medium rounded-lg border-2 transition-all duration-200 ${
                        selectedAnswer === answer
                          ? 'border-purple-500 bg-purple-500/20 text-white'
                          : 'border-gray-600 bg-gray-800 hover:border-purple-400 hover:bg-gray-700 text-gray-200'
                      } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {answer}
                    </motion.button>
                  ))}
                </div>
              )}

              {/* Particles */}
              <AnimatePresence>
                {showParticles && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.5 }}
                    className="absolute inset-0 pointer-events-none flex items-center justify-center"
                  >
                    <div className={`text-8xl ${
                      showParticles === 'correct' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {showParticles === 'correct' ? '✓' : '✗'}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Right Sidebar - Battle Info */}
          <div className="lg:col-span-1 space-y-4">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card p-4"
            >
              <h3 className="text-lg font-bold text-blue-400 mb-4">Battle Info</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-400">Mode:</span>
                  <span className="text-white ml-2 capitalize">{currentRoom.gameMode}</span>
                </div>
                <div>
                  <span className="text-gray-400">Difficulty:</span>
                  <span className="text-white ml-2 capitalize">{currentRoom.settings.difficulty}</span>
                </div>
                <div>
                  <span className="text-gray-400">Time Limit:</span>
                  <span className="text-white ml-2">{Math.floor(currentRoom.timeLimit / 60000)}m</span>
                </div>
                <div>
                  <span className="text-gray-400">Lives per Player:</span>
                  <span className="text-white ml-2">{currentRoom.livesPerPlayer}</span>
                </div>
              </div>
            </motion.div>

            {/* Active Power-ups */}
            {activePowerUps.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card p-4"
              >
                <h3 className="text-lg font-bold text-yellow-400 mb-4">Active Effects</h3>
                <div className="space-y-2">
                  {activePowerUps.map((powerUp) => (
                    <div key={powerUp.id} className="flex items-center gap-2 p-2 bg-yellow-500/20 rounded border border-yellow-500/30">
                      <span className="text-lg">{powerUp.icon}</span>
                      <div>
                        <div className="text-sm font-medium text-white">{powerUp.name}</div>
                        <div className="text-xs text-gray-300">{powerUp.effect.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Battle Controls */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-4"
            >
              <h3 className="text-lg font-bold text-red-400 mb-4">Controls</h3>
              <div className="space-y-2">
                <button
                  onClick={endBattle}
                  className="w-full p-2 bg-red-600 hover:bg-red-700 text-white rounded font-medium"
                >
                  End Battle
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
