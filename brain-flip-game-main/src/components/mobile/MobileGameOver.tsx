'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Home, Share, Trophy, RotateCcw } from 'lucide-react';

interface MobileGameOverProps {
  score: number;
  streak: number;
  celebrationLevel: number;
  onPlayAgain: () => void;
  onMainMenu: () => void;
  mobile: any;
}

export function MobileGameOver({ 
  score, 
  streak, 
  celebrationLevel, 
  onPlayAgain, 
  onMainMenu, 
  mobile 
}: MobileGameOverProps) {
  const [showCelebration, setShowCelebration] = useState(false);
  const [newRecord, setNewRecord] = useState(false);
  const [shareText, setShareText] = useState('');

  useEffect(() => {
    // Check for new records
    const bestScore = parseInt(localStorage.getItem('brainflip-best-score') || '0');
    const bestStreak = parseInt(localStorage.getItem('brainflip-best-streak') || '0');
    
    if (score > bestScore || streak > bestStreak) {
      setNewRecord(true);
      localStorage.setItem('brainflip-best-score', Math.max(score, bestScore).toString());
      localStorage.setItem('brainflip-best-streak', Math.max(streak, bestStreak).toString());
    }

    // Show celebration for good performance
    if (celebrationLevel > 0 || newRecord) {
      setShowCelebration(true);
      // Haptic feedback for celebration
      if (mobile.supportsHaptic) {
        navigator.vibrate([100, 50, 100, 50, 200]);
      }
    }

    // Prepare share text
    setShareText(`I just scored ${score.toLocaleString()} points with a ${streak} streak in Brain Flip! 🧠⚡ Can you beat it?`);
  }, [score, streak, celebrationLevel, newRecord, mobile.supportsHaptic]);

  const handleShare = async () => {
    if (mobile.supportsHaptic) {
      navigator.vibrate(30);
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Brain Flip - Memory Game',
          text: shareText,
          url: window.location.origin
        });
      } catch (error) {
        // Fallback to clipboard
        navigator.clipboard?.writeText(shareText);
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard?.writeText(shareText);
    }
  };

  const getCelebrationEmoji = () => {
    if (newRecord) return '🏆';
    if (celebrationLevel >= 3) return '🎉';
    if (celebrationLevel >= 2) return '⭐';
    if (celebrationLevel >= 1) return '👏';
    return '💪';
  };

  const getCelebrationMessage = () => {
    if (newRecord) return 'New Record!';
    if (celebrationLevel >= 3) return 'Outstanding!';
    if (celebrationLevel >= 2) return 'Great Job!';
    if (celebrationLevel >= 1) return 'Well Done!';
    return 'Good Try!';
  };

  const getButtonSize = () => {
    if (mobile.screenSize === 'sm') {
      return 'h-12 text-sm';
    }
    return 'h-14 text-base';
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 relative">
      {/* Celebration Effects */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            className="fixed inset-0 pointer-events-none z-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Confetti-like particles */}
            {Array.from({ length: 20 }, (_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                initial={{
                  x: '50vw',
                  y: '50vh',
                  scale: 0,
                  rotate: 0
                }}
                animate={{
                  x: `${Math.random() * 100}vw`,
                  y: `${Math.random() * 100}vh`,
                  scale: [0, 1, 0],
                  rotate: 360
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.1,
                  ease: "easeOut"
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Over Content */}
      <motion.div
        className="text-center relative z-10"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Title */}
        <motion.div
          className="mb-6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
        >
          <div className="text-6xl mb-2">{getCelebrationEmoji()}</div>
          <h2 className={`text-3xl font-bold mb-2 ${newRecord ? 'text-yellow-400' : 'text-red-400'}`}>
            {newRecord ? getCelebrationMessage() : 'Game Over'}
          </h2>
          {newRecord && (
            <motion.div
              className="text-yellow-400 text-sm font-semibold"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              🏆 NEW RECORD! 🏆
            </motion.div>
          )}
        </motion.div>

        {/* Stats */}
        <motion.div
          className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 mb-6 max-w-sm w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <motion.div
                className="text-2xl font-bold text-blue-400 mb-1"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, delay: 0.6 }}
              >
                {score.toLocaleString()}
              </motion.div>
              <div className="text-white/60 text-sm">Final Score</div>
            </div>
            <div>
              <motion.div
                className="text-2xl font-bold text-orange-400 mb-1"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, delay: 0.7 }}
              >
                {streak}
              </motion.div>
              <div className="text-white/60 text-sm">Best Streak</div>
            </div>
          </div>

          {/* Additional Stats */}
          <div className="mt-4 pt-4 border-t border-white/20">
            <div className="grid grid-cols-2 gap-4 text-center text-sm">
              <div>
                <div className="text-white font-semibold">
                  {parseInt(localStorage.getItem('brainflip-best-score') || '0').toLocaleString()}
                </div>
                <div className="text-white/60 text-xs">Personal Best</div>
              </div>
              <div>
                <div className="text-white font-semibold">
                  {parseInt(localStorage.getItem('brainflip-games-played') || '0') + 1}
                </div>
                <div className="text-white/60 text-xs">Games Played</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          className="space-y-3 w-full max-w-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          {/* Play Again */}
          <motion.button
            className={`w-full ${getButtonSize()} bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-lg shadow-lg flex items-center justify-center space-x-2`}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (mobile.supportsHaptic) {
                navigator.vibrate(50);
              }
              onPlayAgain();
            }}
          >
            <Play className="w-5 h-5" />
            <span>Play Again</span>
          </motion.button>

          {/* Secondary Actions */}
          <div className="grid grid-cols-2 gap-3">
            <motion.button
              className={`${getButtonSize()} bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-lg flex items-center justify-center space-x-2 hover:bg-white/20 transition-colors`}
              whileTap={{ scale: 0.95 }}
              onClick={handleShare}
            >
              <Share className="w-4 h-4" />
              <span>Share</span>
            </motion.button>

            <motion.button
              className={`${getButtonSize()} bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-lg flex items-center justify-center space-x-2 hover:bg-white/20 transition-colors`}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (mobile.supportsHaptic) {
                  navigator.vibrate(30);
                }
                onMainMenu();
              }}
            >
              <Home className="w-4 h-4" />
              <span>Menu</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Achievements Unlocked */}
        {newRecord && (
          <motion.div
            className="mt-6 bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 max-w-sm w-full"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 1 }}
          >
            <div className="flex items-center justify-center space-x-2 text-yellow-400">
              <Trophy className="w-5 h-5" />
              <span className="font-semibold">Achievement Unlocked!</span>
            </div>
            <div className="text-white/80 text-sm mt-1">
              New personal record achieved
            </div>
          </motion.div>
        )}

        {/* Encouragement Message */}
        <motion.div
          className="mt-6 text-white/60 text-sm text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.2 }}
        >
          {score > 1000 ? (
            "Incredible memory skills! 🧠"
          ) : score > 500 ? (
            "Great concentration! Keep it up! 💪"
          ) : (
            "Practice makes perfect! Try again! 🎯"
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}