'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pause, Play, Home, RotateCcw, Settings } from 'lucide-react';

interface MobileGameHUDProps {
  gameState: any;
  score: number;
  streak: number;
  orientation: 'portrait' | 'landscape';
  mobile: any;
}

export function MobileGameHUD({ 
  gameState, 
  score, 
  streak, 
  orientation, 
  mobile 
}: MobileGameHUDProps) {
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [showMenu, setShowMenu] = useState(false);

  // Timer
  useEffect(() => {
    if (!gameState?.isActive) return;
    
    const startTime = gameState.timeStarted || Date.now();
    const interval = setInterval(() => {
      setTimeElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState?.isActive, gameState?.timeStarted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getLayoutClasses = () => {
    if (orientation === 'landscape') {
      return 'flex-col h-full justify-between p-4';
    }
    return 'flex-row justify-between items-center p-4 bg-black/20 backdrop-blur-sm';
  };

  const getStatClasses = () => {
    if (orientation === 'landscape') {
      return 'text-center mb-4';
    }
    return 'text-center';
  };

  const getStatValueSize = () => {
    if (mobile.screenSize === 'sm') {
      return 'text-lg';
    }
    return orientation === 'landscape' ? 'text-xl' : 'text-lg';
  };

  const getStatLabelSize = () => {
    return 'text-xs';
  };

  return (
    <div className={`relative ${getLayoutClasses()}`}>
      {/* Main Stats */}
      <div className={`flex ${orientation === 'landscape' ? 'flex-col space-y-4' : 'space-x-4'}`}>
        {/* Score */}
        <motion.div 
          className={getStatClasses()}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <motion.div 
            className={`font-bold text-blue-400 ${getStatValueSize()}`}
            key={score}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            {score.toLocaleString()}
          </motion.div>
          <div className={`text-white/60 ${getStatLabelSize()}`}>Score</div>
        </motion.div>

        {/* Level */}
        <motion.div 
          className={getStatClasses()}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div 
            className={`font-bold text-yellow-400 ${getStatValueSize()}`}
            key={gameState?.level}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            {gameState?.level || 1}
          </motion.div>
          <div className={`text-white/60 ${getStatLabelSize()}`}>Level</div>
        </motion.div>

        {/* Streak */}
        <motion.div 
          className={getStatClasses()}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <motion.div 
            className={`font-bold text-orange-400 ${getStatValueSize()}`}
            key={streak}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            {streak}
          </motion.div>
          <div className={`text-white/60 ${getStatLabelSize()}`}>Streak</div>
        </motion.div>

        {/* Time */}
        <motion.div 
          className={getStatClasses()}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className={`font-bold text-green-400 ${getStatValueSize()}`}>
            {formatTime(timeElapsed)}
          </div>
          <div className={`text-white/60 ${getStatLabelSize()}`}>Time</div>
        </motion.div>
      </div>

      {/* Control Buttons */}
      <div className={`flex ${orientation === 'landscape' ? 'flex-col space-y-2' : 'space-x-2'}`}>
        {/* Pause/Resume Button */}
        <motion.button
          className="p-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 text-white hover:bg-white/20 transition-colors"
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            // Handle pause/resume
            if (mobile.supportsHaptic) {
              navigator.vibrate(30);
            }
          }}
        >
          {gameState?.isPaused ? (
            <Play className="w-4 h-4" />
          ) : (
            <Pause className="w-4 h-4" />
          )}
        </motion.button>

        {/* Menu Button */}
        <motion.button
          className="p-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 text-white hover:bg-white/20 transition-colors"
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setShowMenu(!showMenu);
            if (mobile.supportsHaptic) {
              navigator.vibrate(30);
            }
          }}
        >
          <Settings className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {showMenu && (
          <motion.div
            className={`absolute ${orientation === 'landscape' ? 'right-0 top-20' : 'right-4 top-16'} bg-black/80 backdrop-blur-sm rounded-lg border border-white/20 p-2 z-50`}
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex flex-col space-y-1 min-w-32">
              <motion.button
                className="flex items-center space-x-2 p-2 text-white hover:bg-white/10 rounded text-sm"
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  // Handle restart level
                  setShowMenu(false);
                  if (mobile.supportsHaptic) {
                    navigator.vibrate(50);
                  }
                }}
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restart</span>
              </motion.button>
              
              <motion.button
                className="flex items-center space-x-2 p-2 text-white hover:bg-white/10 rounded text-sm"
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  // Handle main menu
                  setShowMenu(false);
                  if (mobile.supportsHaptic) {
                    navigator.vibrate(50);
                  }
                }}
              >
                <Home className="w-3 h-3" />
                <span>Main Menu</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Combo Multiplier */}
      {gameState?.comboMultiplier > 1 && (
        <motion.div
          className={`${orientation === 'landscape' ? 'mt-4' : 'absolute -top-8 left-1/2 transform -translate-x-1/2'}`}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 180 }}
        >
          <div className="inline-flex items-center gap-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs">
            <span>⚡</span>
            <span className="font-bold">{gameState.comboMultiplier.toFixed(1)}x</span>
          </div>
        </motion.div>
      )}

      {/* Level Progress */}
      {gameState?.sequence && (
        <motion.div
          className={`${orientation === 'landscape' ? 'mt-2' : 'absolute -bottom-6 left-0 right-0'}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="text-center text-xs text-white/60 mb-1">
            Sequence Length: {gameState.sequence.length}
          </div>
          <div className="w-full bg-white/20 rounded-full h-1">
            <motion.div
              className="bg-gradient-to-r from-blue-400 to-purple-400 h-1 rounded-full"
              initial={{ width: 0 }}
              animate={{ 
                width: `${((gameState.userSequence?.length || 0) / gameState.sequence.length) * 100}%` 
              }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </motion.div>
      )}

      {/* Click outside to close menu */}
      {showMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
}