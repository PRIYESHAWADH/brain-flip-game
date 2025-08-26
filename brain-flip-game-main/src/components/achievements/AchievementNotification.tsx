"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAudio } from '@/hooks/useAudio';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  reward_coins: number;
  reward_xp: number;
}

interface AchievementNotificationProps {
  achievement: Achievement;
  onClose: () => void;
  autoHide?: boolean;
  duration?: number;
}

export default function AchievementNotification({ 
  achievement, 
  onClose, 
  autoHide = true, 
  duration = 5000 
}: AchievementNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [showRewards, setShowRewards] = useState(false);
  const { playLevelUp } = useAudio();

  useEffect(() => {
    // Play achievement sound
    playLevelUp({ volume: 0.8 });
    
    // Show rewards after icon animation
    setTimeout(() => setShowRewards(true), 800);
    
    if (autoHide) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 500); // Wait for exit animation
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [autoHide, duration, onClose, playLevelUp]);

    switch (rarity) {
      case 'legendary':
        return 'from-yellow-400 via-orange-400 to-red-400';
      case 'epic':
        return 'from-purple-400 via-pink-400 to-purple-600';
      case 'rare':
        return 'from-blue-400 via-cyan-400 to-blue-600';
      default:
        return 'from-gray-400 via-gray-500 to-gray-600';
    }
  };

  const getBorderColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return 'border-yellow-400/50';
      case 'epic':
        return 'border-purple-400/50';
      case 'rare':
        return 'border-blue-400/50';
      default:
        return 'border-gray-400/50';
    }
  };

  const getShadowColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return 'shadow-yellow-400/50';
      case 'epic':
        return 'shadow-purple-400/50';
      case 'rare':
        return 'shadow-blue-400/50';
      default:
        return 'shadow-gray-400/25';
    }
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -100, scale: 0.8 }}
        animate={{ 
          opacity: 1, 
          y: 0, 
          scale: 1,
          transition: {
            type: "spring",
            damping: 15,
            stiffness: 400
          }
        }}
        exit={{ 
          opacity: 0, 
          y: -100, 
          scale: 0.8,
          transition: { duration: 0.3 }
        }}
        className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
      >
        <motion.div
          animate={{
            boxShadow: [
              `0 0 20px rgba(255, 255, 255, 0.1)`,
              `0 0 40px rgba(255, 255, 255, 0.3)`,
              `0 0 20px rgba(255, 255, 255, 0.1)`
            ]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className={`
            bg-gray-900/95 backdrop-blur-md rounded-2xl border-2 
            ${getRarityBorder(achievement.rarity)} ${getRarityGlow(achievement.rarity)}
            p-6 min-w-96 max-w-md mx-4
            shadow-2xl
          `}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <motion.h3
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear"
              }}
              className={`
                text-xl font-bold bg-gradient-to-r ${getRarityGradient(achievement.rarity)}
                bg-clip-text text-transparent bg-[length:200%_100%]
              `}
            >
              🎉 Achievement Unlocked!
            </motion.h3>
            
            <button
              onClick={() => {
                setIsVisible(false);
                setTimeout(onClose, 300);
              }}
              className="text-gray-400 hover:text-white transition-colors p-1"
            >
              ✕
            </button>
          </div>

          {/* Achievement Content */}
          <div className="flex items-center gap-4 mb-4">
            {/* Icon */}
            <motion.div
              animate={{
                rotate: [0, 10, -10, 10, 0],
                scale: [1, 1.1, 1, 1.1, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className={`
                w-16 h-16 rounded-xl flex items-center justify-center text-3xl
                bg-gradient-to-br ${getRarityGradient(achievement.rarity)} ${getRarityGlow(achievement.rarity)}
                shadow-lg
              `}
            >
              {achievement.icon}
            </motion.div>

            {/* Details */}
            <div className="flex-1">
              <h4 className="text-white font-bold text-lg mb-1">
                {achievement.name}
              </h4>
              <p className="text-gray-300 text-sm mb-2">
                {achievement.description}
              </p>
              
              {/* Rarity Badge */}
              <span className={`
                inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                bg-gradient-to-r ${getRarityGradient(achievement.rarity)} text-white
              `}>
                {achievement.rarity}
              </span>
            </div>
          </div>

          {/* Rewards */}
          <div className="flex items-center justify-between bg-gray-800/50 rounded-lg p-3">
            <div className="flex items-center gap-4">
              {achievement.reward_coins > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400 text-lg">🪙</span>
                  <span className="text-yellow-400 font-bold">
                    +{achievement.reward_coins}
                  </span>
                </div>
              )}
              
              {achievement.reward_xp > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-blue-400 text-lg">⭐</span>
                  <span className="text-blue-400 font-bold">
                    +{achievement.reward_xp} XP
                  </span>
                </div>
              )}
            </div>

            <motion.div
              animate={{
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="text-gray-400 text-sm"
            >
              Tap to dismiss
            </motion.div>
          </div>

          {/* Progress bar */}
          {autoHide && (
            <motion.div
              className="mt-4 h-1 bg-gray-700 rounded-full overflow-hidden"
            >
              <motion.div
                className={`h-full bg-gradient-to-r ${getRarityGradient(achievement.rarity)}`}
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: duration / 1000, ease: "linear" }}
              />
            </motion.div>
          )}
        </motion.div>

        {/* Particle Effects */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-yellow-400 rounded-full"
              initial={{
                x: 192, // Center
                y: 100,
                scale: 0,
                opacity: 0
              }}
              animate={{
                x: 192 + (Math.cos(i * 30 * Math.PI / 180) * 150),
                y: 100 + (Math.sin(i * 30 * Math.PI / 180) * 150),
                scale: [0, 1, 0],
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: 2,
                delay: i * 0.1,
                ease: "easeOut"
              }}
            />
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Achievement Notification Manager
interface AchievementManagerProps {
  children: React.ReactNode;
}

export function AchievementManager({ children }: AchievementManagerProps) {
  const [notifications, setNotifications] = useState<Achievement[]>([]);

  const showAchievement = (achievement: Achievement) => {
    setNotifications(prev => [...prev, achievement]);
  };

  const hideAchievement = (achievementId: string) => {
    setNotifications(prev => prev.filter(a => a.id !== achievementId));
  };

  // Global function to trigger achievement notifications
  useEffect(() => {
    // @ts-expect-error - Animation API types are not fully compatible
    window.showAchievement = showAchievement;
    
    return () => {
      // @ts-expect-error - Animation API types are not fully compatible
      delete window.showAchievement;
    };
  }, [showAchievement]);

  return (
    <>
      {children}
      
      {/* Render notifications */}
      <div className="fixed top-0 left-0 w-full z-50 pointer-events-none">
        <div className="relative">
          {notifications.map((achievement, index) => (
            <div
              key={achievement.id}
              className="pointer-events-auto"
              style={{ 
                position: 'absolute',
                top: index * 120,
                left: '50%',
                transform: 'translateX(-50%)'
              }}
            >
              <AchievementNotification
                achievement={achievement}
                onClose={() => hideAchievement(achievement.id)}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
