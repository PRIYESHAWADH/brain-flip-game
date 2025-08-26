"use client";
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface ScoreAnimationsProps {
  scoreGain: number;
  streak: number;
  comboStreak: number;
  speedBonus: boolean;
  luckyMultiplier?: number;
  celebrationLevel: 'none' | 'good' | 'great' | 'amazing' | 'legendary';
  show: boolean;
  onComplete?: () => void;
}

interface FloatingText {
  id: string;
  text: string;
  color: string;
  size: string;
  x: number;
  y: number;
  delay: number;
}

export default function ScoreAnimations({
  scoreGain,
  streak,
  comboStreak,
  speedBonus,
  luckyMultiplier,
  celebrationLevel,
  show,
  onComplete
}: ScoreAnimationsProps) {
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);

  useEffect(() => {
    if (!show || scoreGain <= 0) return;

    const texts: FloatingText[] = [];
    let delay = 0;

    // Main score gain
    texts.push({
      id: 'main-score',
      text: `+${scoreGain.toLocaleString()}`,
      color: celebrationLevel === 'legendary' ? '#a855f7' :
             celebrationLevel === 'amazing' ? '#ec4899' :
             celebrationLevel === 'great' ? '#f59e0b' :
             celebrationLevel === 'good' ? '#10b981' : '#3b82f6',
      size: celebrationLevel === 'legendary' ? 'text-4xl' :
             celebrationLevel === 'amazing' ? 'text-3xl' :
             celebrationLevel === 'great' ? 'text-2xl' : 'text-xl',
      x: 0,
      y: 0,
      delay: delay
    });
    delay += 200;

    // Speed bonus
    if (speedBonus) {
      texts.push({
        id: 'speed-bonus',
        text: '⚡ LIGHTNING!',
        color: '#fbbf24',
        size: 'text-lg',
        x: 20,
        y: -30,
        delay: delay
      });
      delay += 150;
    }

    // Lucky multiplier
    if (luckyMultiplier && luckyMultiplier > 1) {
      texts.push({
        id: 'lucky-multiplier',
        text: `✨ x${luckyMultiplier} LUCKY!`,
        color: '#ec4899',
        size: 'text-lg',
        x: -20,
        y: -30,
        delay: delay
      });
      delay += 150;
    }

    // Combo streak
    if (comboStreak >= 5) {
      texts.push({
        id: 'combo-streak',
        text: `🔥 COMBO x${comboStreak}`,
        color: '#f97316',
        size: 'text-lg',
        x: 0,
        y: -60,
        delay: delay
      });
      delay += 150;
    }

    // Streak milestone
    if (streak >= 10) {
      texts.push({
        id: 'streak-milestone',
        text: `🚀 STREAK ${streak}!`,
        color: '#8b5cf6',
        size: 'text-lg',
        x: 0,
        y: -90,
        delay: delay
      });
    }

    setFloatingTexts(texts);

    // Clear after animation
    const totalDuration = 2000 + delay;
    const timer = setTimeout(() => {
      setFloatingTexts([]);
      onComplete?.();
    }, totalDuration);

    return () => clearTimeout(timer);
  }, [show, scoreGain, streak, comboStreak, speedBonus, luckyMultiplier, celebrationLevel, onComplete]);

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
      <AnimatePresence>
        {floatingTexts.map(text => (
          <motion.div
            key={text.id}
            initial={{ 
              opacity: 0, 
              scale: 0.5, 
              x: text.x, 
              y: text.y 
            }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              x: text.x, 
              y: text.y - 50 
            }}
            exit={{ 
              opacity: 0, 
              scale: 0.5, 
              y: text.y - 100 
            }}
            transition={{ 
              duration: 2, 
              delay: text.delay / 1000,
              ease: [0.16, 1, 0.3, 1] 
            }}
            className={`absolute font-bold ${text.size} drop-shadow-lg`}
            style={{ 
              color: text.color,
              textShadow: `0 0 20px ${text.color}`,
              filter: celebrationLevel === 'legendary' ? 
                `drop-shadow(0 0 30px ${text.color})` : undefined
            }}
          >
            {text.text}
            
            {/* Special effects for legendary scores */}
            {text.id === 'main-score' && celebrationLevel === 'legendary' && (
              <>
                {[...Array(8)].map((_, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ 
                      opacity: [0, 1, 0], 
                      scale: [0, 1, 0],
                      x: Math.cos(i * 45 * Math.PI / 180) * 30,
                      y: Math.sin(i * 45 * Math.PI / 180) * 30
                    }}
                    transition={{ 
                      duration: 1.5, 
                      delay: (text.delay / 1000) + 0.3 + i * 0.05,
                      ease: "easeOut"
                    }}
                    className="absolute text-2xl"
                    style={{ color: '#fbbf24' }}
                  >
                    ✨
                  </motion.span>
                ))}
              </>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}