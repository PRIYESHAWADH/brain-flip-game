"use client";
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface MobileControlsProps {
  onAnswer: (answer: string) => void;
  disabled?: boolean;
  answers?: string[];
  layout?: 'cross' | 'grid' | 'horizontal';
}

export default function MobileControls({ 
  onAnswer, 
  disabled = false, 
  answers = ['UP', 'DOWN', 'LEFT', 'RIGHT'],
  layout = 'cross'
}: MobileControlsProps) {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [hapticSupported, setHapticSupported] = useState(false);

  // Check for haptic feedback support
  useEffect(() => {
    setHapticSupported('vibrate' in navigator);
  }, []);

  // Haptic feedback function
  const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (!hapticSupported) return;
    
    try {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30]
      };
      navigator.vibrate(patterns[type]);
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  };

  // Handle touch gestures for swipe controls
  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled) return;
    
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (disabled || !touchStart) return;
    
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;
    const minSwipeDistance = 50;
    
    // Determine swipe direction
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (Math.abs(deltaX) > minSwipeDistance) {
        const answer = deltaX > 0 ? 'RIGHT' : 'LEFT';
        if (answers.includes(answer)) {
          triggerHaptic('medium');
          onAnswer(answer);
        }
      }
    } else {
      // Vertical swipe
      if (Math.abs(deltaY) > minSwipeDistance) {
        const answer = deltaY > 0 ? 'DOWN' : 'UP';
        if (answers.includes(answer)) {
          triggerHaptic('medium');
          onAnswer(answer);
        }
      }
    }
    
    setTouchStart(null);
  };

  const handleButtonPress = (answer: string) => {
    if (disabled) return;
    
    triggerHaptic('light');
    onAnswer(answer);
  };

  // Cross layout for directional controls
  if (layout === 'cross') {
    return (
      <div className="relative w-full max-w-xs mx-auto">
        {/* Swipe area */}
        <div
          className="w-full h-64 bg-gray-800/30 rounded-2xl border-2 border-dashed border-gray-600 flex items-center justify-center mb-4 relative overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="text-gray-400 text-center">
            <div className="text-2xl mb-2">👆</div>
            <div className="text-sm">Swipe to answer</div>
          </div>
          
          {/* Directional indicators */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-gray-500 text-xs">↑ UP</div>
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-gray-500 text-xs">↓ DOWN</div>
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs rotate-90">← LEFT</div>
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs rotate-90">→ RIGHT</div>
        </div>

        {/* Button controls as backup */}
        <div className="grid grid-cols-3 gap-2 max-w-48 mx-auto">
          <div></div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => handleButtonPress('UP')}
            disabled={disabled || !answers.includes('UP')}
            className="mobile-btn"
          >
            ↑
          </motion.button>
          <div></div>
          
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => handleButtonPress('LEFT')}
            disabled={disabled || !answers.includes('LEFT')}
            className="mobile-btn"
          >
            ←
          </motion.button>
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => handleButtonPress('RIGHT')}
            disabled={disabled || !answers.includes('RIGHT')}
            className="mobile-btn"
          >
            →
          </motion.button>
          
          <div></div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => handleButtonPress('DOWN')}
            disabled={disabled || !answers.includes('DOWN')}
            className="mobile-btn"
          >
            ↓
          </motion.button>
          <div></div>
        </div>
      </div>
    );
  }

  // Grid layout for multiple choice
  if (layout === 'grid') {
    return (
      <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
        {answers.map((answer, index) => (
          <motion.button
            key={answer}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleButtonPress(answer)}
            disabled={disabled}
            className="mobile-btn text-lg font-bold h-16"
          >
            {answer}
            <span className="absolute top-1 right-1 text-xs opacity-60">
              {index + 1}
            </span>
          </motion.button>
        ))}
      </div>
    );
  }

  // Horizontal layout
  return (
    <div className="flex gap-3 justify-center overflow-x-auto pb-2">
      {answers.map((answer, index) => (
        <motion.button
          key={answer}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleButtonPress(answer)}
          disabled={disabled}
          className="mobile-btn text-sm font-bold min-w-20 h-12 flex-shrink-0"
        >
          {answer}
          <span className="absolute top-1 right-1 text-xs opacity-60">
            {index + 1}
          </span>
        </motion.button>
      ))}
    </div>
  );
}