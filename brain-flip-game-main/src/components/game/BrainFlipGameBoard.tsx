'use client';
import { useEffect, useState, useCallback } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useGameTimer } from '@/hooks/useGameTimer';
import { motion, AnimatePresence } from 'framer-motion';
import { useMobile } from '@/hooks/useMobile';

export function BrainFlipGameBoard() {
  const mobile = useMobile();
  const { 
    currentInstruction, 
    isActive, 
    timeRemaining, 
    roundTimeLimit,
    score, 
    streak, 
    level,
    submitAnswer,
    lastScoreGain,
    celebrationLevel,
    speedBonusActive,
    luckyMultiplierActive,
    luckyMultiplierValue
  } = useGameStore();
  
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [showInstruction, setShowInstruction] = useState(false);

  // Initialize timer
  useGameTimer();

  // Reset start time when new instruction appears
  useEffect(() => {
    if (currentInstruction) {
      setStartTime(Date.now());
      setShowInstruction(true);
    }
  }, [currentInstruction?.id]);

  // Handle answer submission
  const handleAnswer = useCallback((answer: string) => {
    if (!isActive || !currentInstruction) return;
    
    const reactionTime = Date.now() - startTime;
    submitAnswer(answer, reactionTime);
    
    // Haptic feedback
    if (mobile.supportsHaptic) {
      navigator.vibrate(50);
    }
  }, [isActive, currentInstruction, startTime, submitAnswer, mobile.supportsHaptic]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!isActive || !currentInstruction) return;
      
      const key = event.key.toUpperCase();
      let answer = '';
      
      // Map keys to answers based on instruction type
      switch (currentInstruction.type) {
        case 'direction':
          switch (key) {
            case 'ARROWUP':
            case 'W':
              answer = 'UP';
              break;
            case 'ARROWDOWN':
            case 'S':
              answer = 'DOWN';
              break;
            case 'ARROWLEFT':
            case 'A':
              answer = 'LEFT';
              break;
            case 'ARROWRIGHT':
            case 'D':
              answer = 'RIGHT';
              break;
          }
          break;
        case 'color':
          switch (key) {
            case 'R':
              answer = 'RED';
              break;
            case 'G':
              answer = 'GREEN';
              break;
            case 'B':
              answer = 'BLUE';
              break;
            case 'Y':
              answer = 'YELLOW';
              break;
          }
          break;
        case 'action':
          switch (key) {
            case 'T':
            case ' ':
              answer = 'TAP';
              break;
            case 'H':
              answer = 'HOLD';
              break;
            case 'S':
              answer = 'SWIPE';
              break;
          }
          break;
      }
      
      if (answer) {
        event.preventDefault();
        handleAnswer(answer);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isActive, currentInstruction, handleAnswer]);

  if (!isActive || !currentInstruction) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white/60">Waiting for game to start...</div>
      </div>
    );
  }

  const timeProgress = timeRemaining / roundTimeLimit;
  const getInstructionColor = () => {
    if (currentInstruction.displayColor) {
      switch (currentInstruction.displayColor) {
        case 'RED': return 'text-red-400';
        case 'GREEN': return 'text-green-400';
        case 'BLUE': return 'text-blue-400';
        case 'YELLOW': return 'text-yellow-400';
        default: return 'text-white';
      }
    }
    return 'text-white';
  };

  const getAnswerButtons = () => {
    switch (currentInstruction.type) {
      case 'direction':
        return [
          { label: '↑ UP', value: 'UP', key: 'W' },
          { label: '↓ DOWN', value: 'DOWN', key: 'S' },
          { label: '← LEFT', value: 'LEFT', key: 'A' },
          { label: '→ RIGHT', value: 'RIGHT', key: 'D' }
        ];
      case 'color':
        return [
          { label: '🔴 RED', value: 'RED', key: 'R' },
          { label: '🟢 GREEN', value: 'GREEN', key: 'G' },
          { label: '🔵 BLUE', value: 'BLUE', key: 'B' },
          { label: '🟡 YELLOW', value: 'YELLOW', key: 'Y' }
        ];
      case 'action':
        return [
          { label: '👆 TAP', value: 'TAP', key: 'T' },
          { label: '✋ HOLD', value: 'HOLD', key: 'H' },
          { label: '👋 SWIPE', value: 'SWIPE', key: 'S' }
        ];
      case 'combo':
        // For combo instructions, show the most likely answers
        return currentInstruction.acceptableAnswers.slice(0, 4).map((answer, index) => ({
          label: answer,
          value: answer,
          key: (index + 1).toString()
        }));
      default:
        return [];
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 relative">
      {/* Score and Stats HUD */}
      <div className="fixed top-4 left-4 right-4 z-10">
        <div className="flex justify-between items-center bg-black/40 backdrop-blur-sm rounded-lg p-4">
          <div className="flex space-x-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{score.toLocaleString()}</div>
              <div className="text-xs text-white/60">Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">{level}</div>
              <div className="text-xs text-white/60">Level</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">{streak}</div>
              <div className="text-xs text-white/60">Streak</div>
            </div>
          </div>
          
          {/* Timer */}
          <div className="text-right">
            <div className="text-lg font-bold text-white">
              {Math.ceil(timeRemaining / 1000)}s
            </div>
            <div className="w-20 h-2 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                className={`h-full ${timeProgress > 0.5 ? 'bg-green-400' : timeProgress > 0.2 ? 'bg-yellow-400' : 'bg-red-400'}`}
                initial={{ width: '100%' }}
                animate={{ width: `${timeProgress * 100}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-4xl w-full mt-20">
        {/* Instruction Display */}
        <AnimatePresence mode="wait">
          {showInstruction && (
            <motion.div
              key={currentInstruction.id}
              initial={{ opacity: 0, scale: 0.8, rotateY: -90 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              exit={{ opacity: 0, scale: 0.8, rotateY: 90 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="text-center mb-12"
            >
              <div className="mb-4">
                <div className="text-sm text-white/60 mb-2">
                  {currentInstruction.isReversed ? 'Do the OPPOSITE of:' : 'Follow this instruction:'}
                </div>
                <div className={`text-6xl md:text-8xl font-bold ${getInstructionColor()} mb-4`}>
                  {currentInstruction.display}
                </div>
                <div className="text-sm text-white/40">
                  Type: {currentInstruction.type} • Level {level}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Answer Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-2xl">
          {getAnswerButtons().map((button, index) => (
            <motion.button
              key={button.value}
              className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg p-4 text-white font-bold transition-all duration-200 transform hover:scale-105 active:scale-95"
              whileTap={{ scale: 0.95 }}
              onClick={() => handleAnswer(button.value)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="text-lg mb-1">{button.label}</div>
              <div className="text-xs text-white/60">Press {button.key}</div>
            </motion.button>
          ))}
        </div>

        {/* Keyboard Hints */}
        <div className="mt-8 text-center text-white/40 text-sm">
          Use keyboard arrows or WASD for directions • RGBY for colors • THS for actions
        </div>
      </div>

      {/* Score Feedback */}
      <AnimatePresence>
        {lastScoreGain > 0 && (
          <motion.div
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50"
            initial={{ opacity: 0, scale: 0, y: 0 }}
            animate={{ opacity: 1, scale: 1, y: -50 }}
            exit={{ opacity: 0, scale: 0, y: -100 }}
            transition={{ duration: 1 }}
          >
            <div className="text-4xl font-bold text-green-400">
              +{lastScoreGain.toLocaleString()}
            </div>
            {speedBonusActive && (
              <div className="text-lg text-yellow-400">⚡ Speed Bonus!</div>
            )}
            {luckyMultiplierActive && luckyMultiplierValue > 1 && (
              <div className="text-lg text-purple-400">🍀 {luckyMultiplierValue}x Lucky!</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Celebration Effects */}
      <AnimatePresence>
        {celebrationLevel !== 'none' && (
          <motion.div
            className="fixed inset-0 pointer-events-none z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Particle effects would go here */}
            <div className="absolute inset-0 bg-gradient-radial from-yellow-400/20 via-transparent to-transparent animate-pulse" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}