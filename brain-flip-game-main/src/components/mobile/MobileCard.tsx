'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

interface MobileCardProps {
  index: number;
  gameState: any;
  onSelect: () => void;
  size: number;
  mobile: any;
  prefersReducedMotion: boolean;
}

export function MobileCard({ 
  index, 
  gameState, 
  onSelect, 
  size, 
  mobile,
  prefersReducedMotion 
}: MobileCardProps) {
  const [isHighlighted, setIsHighlighted] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);

  const isInSequence = gameState?.sequence?.includes(index);
  const sequencePosition = gameState?.sequence?.indexOf(index);
  const isLastClicked = gameState?.userSequence?.[gameState.userSequence.length - 1] === index;

  // Show sequence animation
  useEffect(() => {
    if (gameState?.isShowingSequence && isInSequence) {
      const delay = (sequencePosition + 1) * 600;
      const timer = setTimeout(() => {
        setIsHighlighted(true);
        // Haptic feedback for sequence
        if (mobile.supportsHaptic) {
          navigator.vibrate(30);
        }
        setTimeout(() => setIsHighlighted(false), 400);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [gameState?.isShowingSequence, isInSequence, sequencePosition, mobile.supportsHaptic]);

  // Handle touch interactions
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (gameState?.isShowingSequence || gameState?.gameOver) return;
    
    setIsPressed(true);
    
    // Light haptic feedback on touch
    if (mobile.supportsHaptic) {
      navigator.vibrate(20);
    }
  }, [gameState, mobile.supportsHaptic]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    setIsPressed(false);
    
    if (gameState?.isShowingSequence || gameState?.gameOver) return;
    
    // Check if this is the correct card
    const expectedIndex = gameState?.sequence?.[gameState?.userSequence?.length || 0];
    const isCorrect = index === expectedIndex;
    
    setFeedback(isCorrect ? 'correct' : 'incorrect');
    
    // Haptic feedback based on correctness
    if (mobile.supportsHaptic) {
      if (isCorrect) {
        navigator.vibrate(50); // Success vibration
      } else {
        navigator.vibrate([100, 50, 100]); // Error vibration pattern
      }
    }
    
    // Clear feedback after animation
    setTimeout(() => setFeedback(null), 300);
    
    onSelect();
  }, [gameState, index, onSelect, mobile.supportsHaptic]);

  const getCardStyles = () => {
    const baseStyles = {
      width: `${size}px`,
      height: `${size}px`,
    };

    return baseStyles;
  };

  const getCardClasses = () => {
    let classes = "relative rounded-lg border-2 transition-all duration-200 transform overflow-hidden select-none";
    
    // Theme-based styling
    classes += " bg-white/20 border-white/30";
    
    // State-based styling
    if (isHighlighted) {
      classes += " bg-gradient-to-br from-yellow-400 to-orange-400 border-yellow-300 shadow-lg";
    } else if (feedback === 'correct') {
      classes += " bg-gradient-to-br from-green-400 to-emerald-500 border-green-300 shadow-lg";
    } else if (feedback === 'incorrect') {
      classes += " bg-gradient-to-br from-red-400 to-red-600 border-red-300 shadow-lg";
    } else if (isPressed) {
      classes += " scale-95 bg-white/30";
    } else if (!gameState?.isShowingSequence && !gameState?.gameOver) {
      classes += " active:scale-95 hover:bg-white/30";
    }
    
    if (gameState?.isShowingSequence || gameState?.gameOver) {
      classes += " opacity-75";
    }
    
    return classes;
  };

  const getAnimationVariants = () => {
    if (prefersReducedMotion) {
      return {
        idle: { scale: 1 },
        pressed: { scale: 0.95 },
        highlighted: { scale: 1.05 },
        correct: { scale: 1.1 },
        incorrect: { scale: 0.9 }
      };
    }
    
    return {
      idle: { 
        scale: 1,
        rotateY: 0,
        z: 0
      },
      pressed: { 
        scale: 0.95,
        rotateY: -5,
        z: -10,
        transition: { duration: 0.1 }
      },
      highlighted: { 
        scale: 1.1,
        rotateY: 10,
        z: 20,
        transition: { 
          type: "spring",
          stiffness: 400,
          damping: 25
        }
      },
      correct: { 
        scale: [1, 1.2, 1.1],
        rotateY: [0, 360, 0],
        z: [0, 30, 10],
        transition: { 
          duration: 0.6,
          times: [0, 0.5, 1]
        }
      },
      incorrect: { 
        scale: [1, 0.8, 0.9],
        rotateX: [0, -20, 0],
        transition: { 
          duration: 0.4,
          times: [0, 0.5, 1]
        }
      }
    };
  };

  const getCurrentVariant = () => {
    if (feedback === 'correct') return 'correct';
    if (feedback === 'incorrect') return 'incorrect';
    if (isHighlighted) return 'highlighted';
    if (isPressed) return 'pressed';
    return 'idle';
  };

  return (
    <motion.button
      className={getCardClasses()}
      style={getCardStyles()}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      disabled={gameState?.isShowingSequence || gameState?.gameOver}
      variants={getAnimationVariants()}
      animate={getCurrentVariant()}
      whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
    >
      {/* Card Content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.span 
          className="font-bold text-white transition-colors duration-200"
          style={{ fontSize: `${Math.max(12, size * 0.25)}px` }}
          animate={{
            color: isHighlighted || feedback ? '#ffffff' : '#ffffff'
          }}
        >
          {index + 1}
        </motion.span>
      </div>

      {/* Ripple Effect */}
      {isPressed && !prefersReducedMotion && (
        <motion.div
          className="absolute inset-0 bg-white/30 rounded-lg"
          initial={{ scale: 0, opacity: 0.8 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: 0.3 }}
        />
      )}

      {/* Glow Effect for Sequence */}
      {isInSequence && gameState?.isShowingSequence && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 rounded-lg"
          animate={{ opacity: [0.2, 0.8, 0.2] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        />
      )}

      {/* Success/Error Icons */}
      {feedback === 'correct' && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 180 }}
        >
          <span className="text-white text-xl">✓</span>
        </motion.div>
      )}
      
      {feedback === 'incorrect' && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 180 }}
        >
          <span className="text-white text-xl">✗</span>
        </motion.div>
      )}

      {/* Touch Target Expansion for Small Cards */}
      {size < 60 && (
        <div 
          className="absolute inset-0 -m-2"
          style={{ 
            minWidth: '44px', 
            minHeight: '44px',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)'
          }}
        />
      )}
    </motion.button>
  );
}