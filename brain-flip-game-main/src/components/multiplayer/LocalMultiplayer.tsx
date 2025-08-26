"use client";
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { useAudio } from '@/hooks/useAudio';
import { generateInstruction } from '@/utils/gameLogic';

interface LocalPlayer {
  id: string;
  name: string;
  score: number;
  streak: number;
  mistakes: number;
  isReady: boolean;
  color: string;
  keys: string[];
}

interface LocalMultiplayerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LocalMultiplayer({ isOpen, onClose }: LocalMultiplayerProps) {
  const [gameState, setGameState] = useState<'setup' | 'waiting' | 'playing' | 'finished'>('setup');
  const [players, setPlayers] = useState<LocalPlayer[]>([
    { id: '1', name: 'Player 1', score: 0, streak: 0, mistakes: 0, isReady: false, color: 'bg-blue-500', keys: ['Q', 'W', 'E', 'R'] },
    { id: '2', name: 'Player 2', score: 0, streak: 0, mistakes: 0, isReady: false, color: 'bg-red-500', keys: ['U', 'I', 'O', 'P'] }
  ]);
  const [currentInstruction, setCurrentInstruction] = useState<any>(null);
  const [timeRemaining, setTimeRemaining] = useState(3000);
  const [roundNumber, setRoundNumber] = useState(0);
  const [maxRounds] = useState(10);
  const [winner, setWinner] = useState<LocalPlayer | null>(null);
  
  const { playCorrect, playIncorrect, playGameStart, playGameOver } = useAudio();

  // Add/remove players
  const addPlayer = () => {
    if (players.length >= 4) return;
    
    const colors = ['bg-blue-500', 'bg-red-500', 'bg-green-500', 'bg-yellow-500'];
    const keyMaps = [
      ['Q', 'W', 'E', 'R'],
      ['U', 'I', 'O', 'P'],
      ['A', 'S', 'D', 'F'],
      ['J', 'K', 'L', ';']
    ];
    
    const newPlayer: LocalPlayer = {
      id: (players.length + 1).toString(),
      name: `Player ${players.length + 1}`,
      score: 0,
      streak: 0,
      mistakes: 0,
      isReady: false,
      color: colors[players.length],
      keys: keyMaps[players.length]
    };
    
    setPlayers([...players, newPlayer]);
  };

  const removePlayer = (playerId: string) => {
    if (players.length <= 2) return;
    setPlayers(players.filter(p => p.id !== playerId));
  };

  const toggleReady = (playerId: string) => {
    setPlayers(players.map(p => 
      p.id === playerId ? { ...p, isReady: !p.isReady } : p
    ));
  };

  const updatePlayerName = (playerId: string, name: string) => {
    setPlayers(players.map(p => 
      p.id === playerId ? { ...p, name } : p
    ));
  };

  // Start game when all players are ready
  useEffect(() => {
    if (gameState === 'waiting' && players.every(p => p.isReady) && players.length >= 2) {
      setTimeout(() => {
        setGameState('playing');
        setRoundNumber(1);
        generateNewInstruction();
        playGameStart();
      }, 2000);
    }
  }, [players, gameState, playGameStart]);

  // Generate new instruction
  const generateNewInstruction = useCallback(() => {
    const instruction = generateInstruction(Math.min(roundNumber, 10), []);
    setCurrentInstruction(instruction);
    setTimeRemaining(3000);
  }, [roundNumber]);

  // Timer countdown
  useEffect(() => {
    if (gameState !== 'playing' || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 100) {
          // Time's up - next round
          setTimeout(() => {
            if (roundNumber >= maxRounds) {
              endGame();
            } else {
              setRoundNumber(prev => prev + 1);
              generateNewInstruction();
            }
          }, 1000);
          return 0;
        }
        return prev - 100;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [gameState, timeRemaining, roundNumber, maxRounds]);

  // Handle keyboard input
  useEffect(() => {
    if (gameState !== 'playing' || !currentInstruction) return;

    const handleKeyPress = (event: KeyboardEvent) => {
      const key = event.key.toUpperCase();
      
      // Find which player pressed the key
      const player = players.find(p => p.keys.includes(key));
      if (!player) return;

      // Map key to answer
      const keyIndex = player.keys.indexOf(key);
      const answers = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
      const answer = answers[keyIndex];
      
      if (!answer) return;

      // Check if answer is correct
      const isCorrect = currentInstruction.acceptableAnswers?.includes(answer) || false;
      
      // Update player score
      setPlayers(prevPlayers => prevPlayers.map(p => {
        if (p.id === player.id) {
          if (isCorrect) {
            playCorrect();
            return {
              ...p,
              score: p.score + (10 * (p.streak + 1)),
              streak: p.streak + 1
            };
          } else {
            playIncorrect();
            return {
              ...p,
              mistakes: p.mistakes + 1,
              streak: 0
            };
          }
        }
        return p;
      }));

      // Move to next round
      setTimeout(() => {
        if (roundNumber >= maxRounds) {
          endGame();
        } else {
          setRoundNumber(prev => prev + 1);
          generateNewInstruction();
        }
      }, 1000);
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [gameState, currentInstruction, players, roundNumber, maxRounds, playCorrect, playIncorrect]);

  const startGame = () => {
    setGameState('waiting');
    setPlayers(players.map(p => ({ ...p, score: 0, streak: 0, mistakes: 0, isReady: false })));
  };

  const endGame = () => {
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
    setWinner(sortedPlayers[0]);
    setGameState('finished');
    playGameOver();
  };

  const resetGame = () => {
    setGameState('setup');
    setPlayers(players.map(p => ({ ...p, score: 0, streak: 0, mistakes: 0, isReady: false })));
    setRoundNumber(0);
    setWinner(null);
    setCurrentInstruction(null);
  };

  if (!isOpen) return null;

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
          className="glass-card p-6 max-w-6xl w-full max-h-[90vh] overflow-y-auto border-2 border-purple-500/30"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Local Multiplayer
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl"
            >
              ×
            </button>
          </div>

          {/* Setup Phase */}
          {gameState === 'setup' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h3 className="text-xl font-semibold text-white mb-2">Set Up Players</h3>
                <p className="text-gray-400">Add 2-4 players and customize their names</p>
              </div>

              {/* Players Setup */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {players.map((player, index) => (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`glass-card p-4 border-2 ${player.color.replace('bg-', 'border-')}/30`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-8 h-8 ${player.color} rounded-full flex items-center justify-center text-white font-bold`}>
                        {player.id}
                      </div>
                      <input
                        type="text"
                        value={player.name}
                        onChange={(e) => updatePlayerName(player.id, e.target.value)}
                        className="flex-1 bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white"
                        maxLength={20}
                      />
                      {players.length > 2 && (
                        <button
                          onClick={() => removePlayer(player.id)}
                          className="text-red-400 hover:text-red-300 p-1"
                        >
                          ×
                        </button>
                      )}
                    </div>
                    
                    <div className="text-sm text-gray-400">
                      <div className="mb-1">Controls:</div>
                      <div className="flex gap-1">
                        {player.keys.map((key, i) => (
                          <span key={key} className="px-2 py-1 bg-gray-700 rounded text-xs">
                            {key} = {['UP', 'DOWN', 'LEFT', 'RIGHT'][i]}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Add Player Button */}
              {players.length < 4 && (
                <div className="text-center">
                  <button
                    onClick={addPlayer}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition-colors"
                  >
                    + Add Player
                  </button>
                </div>
              )}

              {/* Start Game Button */}
              <div className="text-center">
                <button
                  onClick={startGame}
                  disabled={players.length < 2}
                  className="px-8 py-4 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-bold text-lg transition-colors"
                >
                  Start Game
                </button>
              </div>
            </motion.div>
          )}

          {/* Waiting Phase */}
          {gameState === 'waiting' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-6"
            >
              <h3 className="text-2xl font-bold text-white">Get Ready!</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {players.map(player => (
                  <div key={player.id} className={`glass-card p-4 border-2 ${player.color.replace('bg-', 'border-')}/30`}>
                    <div className={`w-12 h-12 ${player.color} rounded-full flex items-center justify-center text-white font-bold mx-auto mb-2`}>
                      {player.id}
                    </div>
                    <div className="font-semibold text-white mb-2">{player.name}</div>
                    <button
                      onClick={() => toggleReady(player.id)}
                      className={`w-full py-2 rounded font-semibold transition-colors ${
                        player.isReady 
                          ? 'bg-green-600 text-white' 
                          : 'bg-gray-600 hover:bg-gray-500 text-gray-300'
                      }`}
                    >
                      {player.isReady ? '✓ Ready!' : 'Press to Ready'}
                    </button>
                  </div>
                ))}
              </div>

              {players.every(p => p.isReady) && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-2xl font-bold text-green-400"
                >
                  Starting in 2 seconds...
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Playing Phase */}
          {gameState === 'playing' && currentInstruction && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Round Info */}
              <div className="text-center">
                <div className="text-lg text-gray-400 mb-2">Round {roundNumber} of {maxRounds}</div>
                <div className="w-full max-w-md mx-auto bg-gray-700 rounded-full h-3 mb-4">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-red-400 h-3 rounded-full transition-all duration-100"
                    style={{ width: `${(timeRemaining / 3000) * 100}%` }}
                  />
                </div>
                <div className="text-sm text-gray-300">{Math.ceil(timeRemaining / 1000)}s remaining</div>
              </div>

              {/* Instruction */}
              <div className="text-center">
                <motion.div
                  key={currentInstruction.id}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-4xl font-bold mb-6"
                  style={{ color: currentInstruction.displayColor?.toLowerCase() }}
                >
                  {currentInstruction.display}
                </motion.div>
              </div>

              {/* Player Scores */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {players.map(player => (
                  <div key={player.id} className={`glass-card p-4 border-2 ${player.color.replace('bg-', 'border-')}/30`}>
                    <div className={`w-8 h-8 ${player.color} rounded-full flex items-center justify-center text-white font-bold mx-auto mb-2`}>
                      {player.id}
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-white">{player.name}</div>
                      <div className="text-2xl font-bold text-green-400">{player.score}</div>
                      <div className="text-sm text-gray-400">
                        Streak: {player.streak} | Mistakes: {player.mistakes}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Controls Reminder */}
              <div className="text-center text-sm text-gray-400">
                Press your assigned keys to answer: UP, DOWN, LEFT, RIGHT
              </div>
            </motion.div>
          )}

          {/* Finished Phase */}
          {gameState === 'finished' && winner && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="text-6xl mb-4"
              >
                🏆
              </motion.div>
              
              <h3 className="text-3xl font-bold text-yellow-400">
                {winner.name} Wins!
              </h3>
              
              <div className="text-xl text-white mb-6">
                Final Score: {winner.score.toLocaleString()}
              </div>

              {/* Final Leaderboard */}
              <div className="max-w-md mx-auto space-y-3">
                {[...players].sort((a, b) => b.score - a.score).map((player, index) => (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      index === 0 ? 'bg-yellow-500/20 border border-yellow-500/30' :
                      index === 1 ? 'bg-gray-400/20 border border-gray-400/30' :
                      index === 2 ? 'bg-amber-600/20 border border-amber-600/30' :
                      'bg-gray-700/50'
                    }`}
                  >
                    <div className="text-2xl">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏅'}
                    </div>
                    <div className={`w-8 h-8 ${player.color} rounded-full flex items-center justify-center text-white font-bold`}>
                      {player.id}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-white">{player.name}</div>
                      <div className="text-sm text-gray-400">
                        {player.score.toLocaleString()} pts • {player.streak} max streak
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 justify-center">
                <button
                  onClick={resetGame}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors"
                >
                  Play Again
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg font-semibold transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}