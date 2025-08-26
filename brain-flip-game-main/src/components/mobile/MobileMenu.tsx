'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Trophy, Settings, Info, Zap, Users } from 'lucide-react';

interface MobileMenuProps {
  onStartGame: () => void;
  mobile: any;
}

export function MobileMenu({ onStartGame, mobile }: MobileMenuProps) {
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard' | 'adaptive'>('adaptive');
  const [showInfo, setShowInfo] = useState(false);

  const difficulties = [
    {
      id: 'easy',
      name: 'Easy',
      description: 'Slower pace, longer sequences',
      icon: '🌱',
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'medium',
      name: 'Medium',
      description: 'Balanced challenge',
      icon: '⚡',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'hard',
      name: 'Hard',
      description: 'Fast pace, complex patterns',
      icon: '🔥',
      color: 'from-red-500 to-orange-500'
    },
    {
      id: 'adaptive',
      name: 'Adaptive',
      description: 'Adjusts to your skill',
      icon: '🧠',
      color: 'from-purple-500 to-pink-500'
    }
  ];

  const menuItems = [
    {
      icon: Trophy,
      label: 'Achievements',
      description: 'View your progress',
      action: () => {
        // Handle achievements
        if (mobile.supportsHaptic) {
          navigator.vibrate(30);
        }
      }
    },
    {
      icon: Users,
      label: 'Leaderboard',
      description: 'Compare scores',
      action: () => {
        // Handle leaderboard
        if (mobile.supportsHaptic) {
          navigator.vibrate(30);
        }
      }
    },
    {
      icon: Settings,
      label: 'Settings',
      description: 'Customize experience',
      action: () => {
        // Handle settings
        if (mobile.supportsHaptic) {
          navigator.vibrate(30);
        }
      }
    },
    {
      icon: Info,
      label: 'How to Play',
      description: 'Learn the rules',
      action: () => {
        setShowInfo(true);
        if (mobile.supportsHaptic) {
          navigator.vibrate(30);
        }
      }
    }
  ];

  const handleStartGame = () => {
    if (mobile.supportsHaptic) {
      navigator.vibrate(50);
    }
    onStartGame();
  };

  const getButtonSize = () => {
    if (mobile.screenSize === 'sm') {
      return 'h-12 text-sm';
    }
    return 'h-14 text-base';
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 relative">
      {/* Title */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
            Brain
          </span>
          <br />
          <span className="bg-gradient-to-r from-blue-400 via-green-400 to-yellow-400 bg-clip-text text-transparent">
            Flip
          </span>
        </h1>
        <p className="text-white/80 text-sm md:text-base">
          Test your memory and concentration
        </p>
      </motion.div>

      {/* Difficulty Selection */}
      <motion.div
        className="w-full max-w-sm mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="text-white/80 text-sm text-center mb-4">Choose Difficulty:</div>
        <div className="grid grid-cols-2 gap-2">
          {difficulties.map((difficulty) => (
            <motion.button
              key={difficulty.id}
              className={`p-3 rounded-lg border-2 transition-all ${
                selectedDifficulty === difficulty.id
                  ? 'border-white/50 bg-white/10'
                  : 'border-white/20 bg-white/5'
              }`}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setSelectedDifficulty(difficulty.id as any);
                if (mobile.supportsHaptic) {
                  navigator.vibrate(20);
                }
              }}
            >
              <div className="text-lg mb-1">{difficulty.icon}</div>
              <div className="text-white text-xs font-semibold">{difficulty.name}</div>
              <div className="text-white/60 text-xs">{difficulty.description}</div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Start Game Button */}
      <motion.button
        className={`w-full max-w-sm ${getButtonSize()} bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-lg shadow-lg mb-6 flex items-center justify-center space-x-2`}
        whileTap={{ scale: 0.95 }}
        onClick={handleStartGame}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Play className="w-5 h-5" />
        <span>Start Game</span>
      </motion.button>

      {/* Menu Items */}
      <motion.div
        className="w-full max-w-sm space-y-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        {menuItems.map((item, index) => (
          <motion.button
            key={item.label}
            className="w-full p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors flex items-center space-x-3"
            whileTap={{ scale: 0.95 }}
            onClick={item.action}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
          >
            <item.icon className="w-5 h-5 text-white/80" />
            <div className="flex-1 text-left">
              <div className="font-semibold text-sm">{item.label}</div>
              <div className="text-white/60 text-xs">{item.description}</div>
            </div>
          </motion.button>
        ))}
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        className="mt-8 text-center text-white/60 text-xs"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.2 }}
      >
        <div>Best Score: 0 • Games Played: 0</div>
        <div className="mt-1">Ready to train your brain?</div>
      </motion.div>

      {/* How to Play Modal */}
      <AnimatePresence>
        {showInfo && (
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg p-6 max-w-sm w-full max-h-96 overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <h3 className="text-white font-bold text-lg mb-4">How to Play</h3>
              <div className="text-white/80 text-sm space-y-3">
                <div>
                  <strong>1. Watch the Sequence</strong>
                  <br />
                  Cards will light up in a specific order. Pay attention!
                </div>
                <div>
                  <strong>2. Repeat the Pattern</strong>
                  <br />
                  Tap the cards in the same order you saw them light up.
                </div>
                <div>
                  <strong>3. Level Up</strong>
                  <br />
                  Each level adds more cards to remember. How far can you go?
                </div>
                <div>
                  <strong>Mobile Controls:</strong>
                  <br />
                  • Tap cards directly
                  <br />
                  • Use number buttons
                  <br />
                  • Swipe gestures
                </div>
              </div>
              <motion.button
                className="w-full mt-6 p-3 bg-blue-500 text-white rounded-lg font-semibold"
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowInfo(false)}
              >
                Got it!
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Device Info (Debug) */}
      {process.env.NODE_ENV === 'development' && (
        <motion.div
          className="fixed bottom-4 left-4 text-white/40 text-xs bg-black/40 p-2 rounded"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          <div>Screen: {mobile.screenSize}</div>
          <div>Touch: {mobile.isTouchDevice ? 'Yes' : 'No'}</div>
          <div>Haptic: {mobile.supportsHaptic ? 'Yes' : 'No'}</div>
        </motion.div>
      )}
    </div>
  );
}