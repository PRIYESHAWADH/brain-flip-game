'use client';
import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MobileTouchControlsProps {
  gameState: any;
  onCardSelect: (cardIndex: number) => void;
  orientation: 'portrait' | 'landscape';
  mobile: any;
}

export function MobileTouchControls({ 
  gameState, 
  onCardSelect, 
  orientation, 
  mobile 
}: MobileTouchControlsProps) {
  const [activeGesture, setActiveGesture] = useState<string | null>(null);
  const [showHints, setShowHints] = useState(false);

  // Show hints for new players
  useEffect(() => {
    if (gameState?.level === 1 && !gameState?.isShowingSequence) {
      const timer = setTimeout(() => setShowHints(true), 2000);
      return () => clearTimeout(timer);
    } else {
      setShowHints(false);
    }
  }, [gameState?.level, gameState?.isShowingSequence]);

  // Quick access buttons for numbers 1-9
  const handleQuickSelect = useCallback((cardIndex: number) => {
    if (gameState?.isShowingSequence || gameState?.gameOver) return;
    
    setActiveGesture(`quick-${cardIndex}`);
    
    // Haptic feedback
    if (mobile.supportsHaptic) {
      navigator.vibrate(40);
    }
    
    setTimeout(() => setActiveGesture(null), 200);
    onCardSelect(cardIndex);
  }, [gameState, mobile.supportsHaptic, onCardSelect]);

  // Gesture patterns for advanced users
  const gesturePatterns = [
    { pattern: 'tap-center', description: 'Tap center for card 5', cardIndex: 4 },
    { pattern: 'double-tap', description: 'Double tap for last card', cardIndex: 8 },
    { pattern: 'long-press', description: 'Long press for card 1', cardIndex: 0 },
  ];

  const getControlsLayout = () => {
    if (orientation === 'landscape') {
      return 'flex-row justify-center space-x-2 px-4';
    }
    return 'grid grid-cols-3 gap-2 px-4';
  };

  const getButtonSize = () => {
    if (mobile.screenSize === 'sm') {
      return 'w-12 h-12 text-sm';
    }
    return orientation === 'landscape' ? 'w-10 h-10 text-xs' : 'w-14 h-14 text-sm';
  };

  // Don't show controls during sequence or if game is over
  if (gameState?.isShowingSequence || gameState?.gameOver) {
    return null;
  }

  return (
    <div className="relative">
      {/* Quick Access Number Pad */}
      <motion.div
        className={`${getControlsLayout()} mb-4`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {Array.from({ length: 9 }, (_, index) => (
          <motion.button
            key={index}
            className={`${getButtonSize()} bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white font-bold hover:bg-white/20 transition-colors relative overflow-hidden`}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleQuickSelect(index)}
            disabled={gameState?.isShowingSequence || gameState?.gameOver}
          >
            {/* Button Content */}
            <span className="relative z-10">{index + 1}</span>
            
            {/* Active State */}
            <AnimatePresence>
              {activeGesture === `quick-${index}` && (
                <motion.div
                  className="absolute inset-0 bg-white/30"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ duration: 0.2 }}
                />
              )}
            </AnimatePresence>
            
            {/* Highlight expected card */}
            {gameState?.sequence && 
             gameState.userSequence && 
             gameState.sequence[gameState.userSequence.length] === index && (
              <motion.div
                className="absolute inset-0 bg-yellow-400/20 border-2 border-yellow-400/50 rounded-lg"
                animate={{ opacity: [0.3, 0.8, 0.3] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            )}
          </motion.button>
        ))}
      </motion.div>

      {/* Gesture Hints */}
      <AnimatePresence>
        {showHints && (
          <motion.div
            className="text-center text-white/60 text-xs mb-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-black/40 backdrop-blur-sm rounded-lg p-3 mx-4">
              <div className="mb-2 font-semibold">Touch Controls:</div>
              <div className="space-y-1">
                <div>• Tap number buttons above</div>
                <div>• Tap cards directly on the board</div>
                <div>• Swipe in any direction on the board</div>
              </div>
              <motion.button
                className="mt-2 text-blue-400 text-xs underline"
                onClick={() => setShowHints(false)}
                whileTap={{ scale: 0.95 }}
              >
                Got it!
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Swipe Gesture Area (Alternative Input) */}
      {orientation === 'portrait' && (
        <motion.div
          className="mx-4 mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
            <div className="text-white/40 text-xs mb-2">Alternative: Swipe Gestures</div>
            <div className="grid grid-cols-3 gap-1 text-xs text-white/30">
              <div>↖ 1</div>
              <div>↑ 2</div>
              <div>↗ 3</div>
              <div>← 4</div>
              <div>⊙ 5</div>
              <div>→ 6</div>
              <div>↙ 7</div>
              <div>↓ 8</div>
              <div>↘ 9</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Performance Mode Toggle */}
      {mobile.screenSize === 'sm' && (
        <motion.div
          className="text-center mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <button
            className="text-white/40 text-xs underline"
            onClick={() => {
              // Toggle performance mode (reduce animations, etc.)
              if (mobile.supportsHaptic) {
                navigator.vibrate(20);
              }
            }}
          >
            Performance Mode
          </button>
        </motion.div>
      )}

      {/* Accessibility: Voice Commands Hint */}
      {mobile.isMobile && (
        <motion.div
          className="text-center text-white/30 text-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <div>Voice commands: "One", "Two", "Three"...</div>
        </motion.div>
      )}
    </div>
  );
}