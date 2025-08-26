'use client';
import { useState, useEffect, useCallback } from 'react';
import { useMobile, useReducedMotion } from '@/hooks/useMobile';
import { useGameStore } from '@/store/gameStore';
import { MobileGameBoard } from './MobileGameBoard';
import { MobileGameHUD } from './MobileGameHUD';
import { MobileTouchControls } from './MobileTouchControls';
import { MobileMenu } from './MobileMenu';
import { MobileGameOver } from './MobileGameOver';
import { motion, AnimatePresence } from 'framer-motion';

export function MobileBrainFlipGame() {
  const mobile = useMobile();
  const prefersReducedMotion = useReducedMotion();
  const { 
    isActive, 
    hasStarted, 
    gameState,
    score,
    streak,
    celebrationLevel,
    startGame,
    resetGame
  } = useGameStore();

  const [showMobileMenu, setShowMobileMenu] = useState(!isActive && !hasStarted);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [safeAreaInsets, setSafeAreaInsets] = useState({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  });

  // Handle orientation changes
  useEffect(() => {
    const handleOrientationChange = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
      
      // Update safe area insets for notched devices
      if (mobile.hasNotch) {
        const computedStyle = getComputedStyle(document.documentElement);
        setSafeAreaInsets({
          top: parseInt(computedStyle.getPropertyValue('--sat') || '0'),
          bottom: parseInt(computedStyle.getPropertyValue('--sab') || '0'),
          left: parseInt(computedStyle.getPropertyValue('--sal') || '0'),
          right: parseInt(computedStyle.getPropertyValue('--sar') || '0')
        });
      }
    };

    handleOrientationChange();
    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleOrientationChange);

    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', handleOrientationChange);
    };
  }, [mobile.hasNotch]);

  // Prevent zoom on double tap
  useEffect(() => {
    const preventDefault = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };

    let lastTouchEnd = 0;
    const preventZoom = (e: TouchEvent) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    };

    document.addEventListener('touchstart', preventDefault, { passive: false });
    document.addEventListener('touchend', preventZoom, { passive: false });

    return () => {
      document.removeEventListener('touchstart', preventDefault);
      document.removeEventListener('touchend', preventZoom);
    };
  }, []);

  // Handle card selection for mobile
  const handleCardSelect = useCallback((cardIndex: number) => {
    if (!isActive || gameState?.isShowingSequence) return;
    
    // Trigger haptic feedback
    if (mobile.supportsHaptic) {
      navigator.vibrate(50);
    }
    
    // Convert card index to answer based on current instruction
    const currentInstruction = gameState?.currentInstruction;
    if (!currentInstruction) return;
    
    let answer = '';
    const startTime = Date.now() - (gameState?.lastInstructionGenerationTime || Date.now());
    
    // Map card index to appropriate answer based on instruction type
    switch (currentInstruction.type) {
      case 'direction':
        const directions = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
        answer = directions[cardIndex % 4] || 'UP';
        break;
      case 'color':
        const colors = ['RED', 'GREEN', 'BLUE', 'YELLOW'];
        answer = colors[cardIndex % 4] || 'RED';
        break;
      case 'action':
        const actions = ['TAP', 'HOLD', 'SWIPE'];
        answer = actions[cardIndex % 3] || 'TAP';
        break;
      default:
        answer = `CARD_${cardIndex + 1}`;
    }
    
    // Submit the answer with reaction time
    const { submitAnswer } = useGameStore.getState();
    submitAnswer(answer, startTime);
  }, [isActive, gameState, mobile.supportsHaptic]);

  const containerStyle = {
    paddingTop: `${safeAreaInsets.top}px`,
    paddingBottom: `${safeAreaInsets.bottom}px`,
    paddingLeft: `${safeAreaInsets.left}px`,
    paddingRight: `${safeAreaInsets.right}px`,
  };

  const getLayoutClasses = () => {
    if (orientation === 'landscape') {
      return 'flex-row';
    }
    return 'flex-col';
  };

  return (
    <div 
      className={`min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden ${mobile.isMobile ? 'touch-manipulation' : ''}`}
      style={containerStyle}
    >
      {/* Background Effects - Reduced for mobile performance */}
      {!prefersReducedMotion && (
        <div className="fixed inset-0 z-0 opacity-30">
          <div className="absolute inset-0 bg-gradient-radial from-purple-500/10 via-transparent to-transparent" />
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* Mobile Menu */}
        {showMobileMenu && (
          <motion.div
            key="menu"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
            className="relative z-10 h-full"
          >
            <MobileMenu
              onStartGame={() => {
                startGame();
                setShowMobileMenu(false);
              }}
              mobile={mobile}
            />
          </motion.div>
        )}

        {/* Game Over Screen */}
        {!isActive && hasStarted && (
          <motion.div
            key="gameover"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
            className="relative z-10 h-full"
          >
            <MobileGameOver
              score={score}
              streak={streak}
              celebrationLevel={celebrationLevel}
              onPlayAgain={() => {
                startGame();
              }}
              onMainMenu={() => {
                resetGame();
                setShowMobileMenu(true);
              }}
              mobile={mobile}
            />
          </motion.div>
        )}

        {/* Active Game */}
        {isActive && (
          <motion.div
            key="game"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
            className={`relative z-10 h-full flex ${getLayoutClasses()}`}
          >
            {/* Game HUD */}
            <div className={`${orientation === 'landscape' ? 'w-1/3' : 'h-auto'} flex-shrink-0`}>
              <MobileGameHUD
                gameState={gameState}
                score={score}
                streak={streak}
                orientation={orientation}
                mobile={mobile}
              />
            </div>

            {/* Game Board */}
            <div className={`${orientation === 'landscape' ? 'w-2/3' : 'flex-1'} flex flex-col justify-center`}>
              <MobileGameBoard
                gameState={gameState}
                onCardSelect={handleCardSelect}
                orientation={orientation}
                mobile={mobile}
                prefersReducedMotion={prefersReducedMotion}
              />
              
              {/* Touch Controls */}
              <div className="mt-4">
                <MobileTouchControls
                  gameState={gameState}
                  onCardSelect={handleCardSelect}
                  orientation={orientation}
                  mobile={mobile}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}