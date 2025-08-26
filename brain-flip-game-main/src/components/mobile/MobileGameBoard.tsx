'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MobileCard } from './MobileCard';

interface MobileGameBoardProps {
  gameState: any;
  onCardSelect: (cardIndex: number) => void;
  orientation: 'portrait' | 'landscape';
  mobile: any;
  prefersReducedMotion: boolean;
}

export function MobileGameBoard({ 
  gameState, 
  onCardSelect, 
  orientation, 
  mobile,
  prefersReducedMotion 
}: MobileGameBoardProps) {
  const [boardSize, setBoardSize] = useState({ width: 0, height: 0 });
  const [cardSize, setCardSize] = useState(60);

  // Calculate optimal board and card sizes
  useEffect(() => {
    const updateSizes = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Account for safe areas and UI elements
      const availableWidth = viewportWidth - 40; // 20px padding each side
      const availableHeight = orientation === 'portrait' 
        ? viewportHeight * 0.5 // Leave space for HUD and controls
        : viewportHeight - 120; // Leave space for landscape HUD
      
      // Calculate card size based on available space
      const maxCardSize = Math.min(
        (availableWidth - 32) / 3, // 3 cards per row with gaps
        (availableHeight - 32) / 3  // 3 rows with gaps
      );
      
      setCardSize(Math.max(50, Math.min(80, maxCardSize)));
      setBoardSize({ 
        width: availableWidth, 
        height: availableHeight 
      });
    };

    updateSizes();
    window.addEventListener('resize', updateSizes);
    window.addEventListener('orientationchange', updateSizes);

    return () => {
      window.removeEventListener('resize', updateSizes);
      window.removeEventListener('orientationchange', updateSizes);
    };
  }, [orientation]);

  // Handle swipe gestures for card selection
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [swipeDirection, setSwipeDirection] = useState<string | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
    setSwipeDirection(null);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStart) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;
    const minSwipeDistance = 30;
    
    if (Math.abs(deltaX) > minSwipeDistance || Math.abs(deltaY) > minSwipeDistance) {
      let direction = '';
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        direction = deltaX > 0 ? 'right' : 'left';
      } else {
        direction = deltaY > 0 ? 'down' : 'up';
      }
      setSwipeDirection(direction);
    }
  }, [touchStart]);

  const handleTouchEnd = useCallback(() => {
    setTouchStart(null);
    if (swipeDirection) {
      // Convert swipe direction to card index
      const directionMap: { [key: string]: number } = {
        'up': 1,
        'down': 7,
        'left': 3,
        'right': 5,
        // Add diagonal support
        'up-left': 0,
        'up-right': 2,
        'down-left': 6,
        'down-right': 8
      };
      
      const cardIndex = directionMap[swipeDirection];
      if (cardIndex !== undefined) {
        onCardSelect(cardIndex);
      }
    }
    setSwipeDirection(null);
  }, [swipeDirection, onCardSelect]);

  const getAnimationVariants = () => {
    if (prefersReducedMotion) {
      return {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
        exit: { opacity: 0 }
      };
    }
    
    return {
      hidden: { 
        opacity: 0, 
        scale: 0.8,
        rotateY: -90
      },
      visible: { 
        opacity: 1, 
        scale: 1,
        rotateY: 0,
        transition: {
          type: "spring",
          stiffness: 300,
          damping: 30,
          staggerChildren: 0.1
        }
      },
      exit: { 
        opacity: 0, 
        scale: 0.8,
        rotateY: 90,
        transition: { duration: 0.2 }
      }
    };
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      {/* Sequence Progress Indicator */}
      {gameState?.isShowingSequence && (
        <motion.div 
          className="mb-4 w-full max-w-xs"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <div className="text-white/80 text-sm text-center mb-2">
            Watch the sequence...
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <motion.div 
              className="bg-gradient-to-r from-blue-400 to-purple-400 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ 
                width: `${((gameState.currentStep || 0) / (gameState.sequence?.length || 1)) * 100}%` 
              }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </motion.div>
      )}

      {/* User Progress Indicator */}
      {!gameState?.isShowingSequence && gameState?.isActive && (
        <motion.div 
          className="mb-4 w-full max-w-xs"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <div className="text-white/80 text-sm text-center mb-2">
            Your turn: {gameState.userSequence?.length || 0} / {gameState.sequence?.length || 0}
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <motion.div 
              className="bg-gradient-to-r from-green-400 to-blue-400 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ 
                width: `${((gameState.userSequence?.length || 0) / (gameState.sequence?.length || 1)) * 100}%` 
              }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </motion.div>
      )}

      {/* Game Board */}
      <motion.div
        className="relative"
        style={{ 
          width: Math.min(boardSize.width, cardSize * 3 + 32),
          height: Math.min(boardSize.height, cardSize * 3 + 32)
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        variants={getAnimationVariants()}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        {/* Swipe Direction Indicator */}
        <AnimatePresence>
          {swipeDirection && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                <div className="text-white text-2xl">
                  {swipeDirection === 'up' && '↑'}
                  {swipeDirection === 'down' && '↓'}
                  {swipeDirection === 'left' && '←'}
                  {swipeDirection === 'right' && '→'}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Card Grid */}
        <div 
          className="grid grid-cols-3 gap-2"
          style={{ 
            gridTemplateRows: `repeat(3, ${cardSize}px)`,
            gridTemplateColumns: `repeat(3, ${cardSize}px)`
          }}
        >
          {Array.from({ length: 9 }, (_, index) => (
            <MobileCard
              key={index}
              index={index}
              gameState={gameState}
              onSelect={() => onCardSelect(index)}
              size={cardSize}
              mobile={mobile}
              prefersReducedMotion={prefersReducedMotion}
            />
          ))}
        </div>

        {/* Touch Hints for First-Time Users */}
        {gameState?.level === 1 && !gameState?.isShowingSequence && (
          <motion.div
            className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ delay: 1 }}
          >
            <div className="text-white/60 text-xs">
              Tap cards or swipe in any direction
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Streak Display */}
      {gameState?.streak > 0 && (
        <motion.div 
          className="mt-4"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-sm">
            <span>🔥</span>
            <span className="font-bold">{gameState.streak} Streak!</span>
            <span>🔥</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}