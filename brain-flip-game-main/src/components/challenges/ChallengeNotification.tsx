'use client';

import React, { useEffect, useState } from 'react';
import { DailyChallenge } from '@/store/dailyChallengeStore';

interface ChallengeNotificationProps {
  challenge: DailyChallenge;
  onClose: () => void;
}

export default function ChallengeNotification({ challenge, onClose }: ChallengeNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    
    // Auto-close after 4 seconds
    const autoClose = setTimeout(() => {
      handleClose();
    }, 4000);

    return () => {
      clearTimeout(timer);
      clearTimeout(autoClose);
    };
  }, []);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'from-green-500 to-emerald-600';
      case 'medium': return 'from-yellow-500 to-orange-500';
      case 'hard': return 'from-orange-500 to-red-500';
      case 'extreme': return 'from-red-500 to-pink-600';
      default: return 'from-blue-500 to-purple-600';
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const calculateProgress = (progress: number, target: number) => {
    const percentage = Math.min((progress / target) * 100, 100);
    return { percentage, remaining: target - progress };
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 transform transition-all duration-300 ${
        isVisible && !isLeaving
          ? 'translate-x-0 opacity-100 scale-100'
          : 'translate-x-full opacity-0 scale-95'
      }`}
    >
      <div 
        className={`bg-gradient-to-r ${getDifficultyColor(challenge.difficulty)} p-[2px] rounded-xl shadow-2xl max-w-sm animate-float`}
        style={{ perspective: '1000px' }}
      >
        <div 
          className="bg-gray-900 rounded-xl p-4 relative overflow-hidden backdrop-blur-sm"
          style={{
            transform: isVisible ? 'rotateY(0deg)' : 'rotateY(-90deg)',
            transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
            transformStyle: 'preserve-3d'
          }}
        >
          {/* Background Pattern with animated gradient */}
          <div className="absolute inset-0 overflow-hidden">
            <div 
              className="absolute inset-0 opacity-10 animate-gradient-x"
              style={{
                background: `linear-gradient(45deg, 
                  ${challenge.difficulty === 'extreme' ? '#ff0080, #7928ca' : 
                    challenge.difficulty === 'hard' ? '#ff4d4d, #f9cb28' : 
                    challenge.difficulty === 'medium' ? '#ff9f4d, #ffe44d' : 
                    '#4dff4d, #4dfff4'
                  })`
              }}
            />
          </div>

          {/* Particles Effect */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute animate-float"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animation: `float ${2 + Math.random() * 2}s infinite`,
                    animationDelay: `${Math.random() * 2}s`
                  }}
                >
                  ✨
                </div>
              ))}
            </div>
          </div>

          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
          </div>

          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>

          {/* Content */}
          <div className="relative">
            {/* Header */}
            <div className="flex items-center gap-3 mb-3">
              <div className="text-3xl animate-bounce">{challenge.icon}</div>
              <div>
                <div className="text-lg font-bold text-white">Challenge Complete!</div>
                <div className="text-sm text-gray-300">{challenge.name}</div>
              </div>
            </div>

            {/* Description */}
            <div className="text-sm text-gray-400 mb-4">
              {challenge.description}
            </div>

            {/* Rewards */}
            <div className="space-y-2">
              <div className="text-sm font-semibold text-white mb-2">Rewards Earned:</div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1 text-blue-400 font-semibold">
                    🎯 +{formatNumber(challenge.reward.points)}
                  </span>
                  <span className="flex items-center gap-1 text-yellow-400 font-semibold">
                    ⭐ +{challenge.reward.starCoins}
                  </span>
                </div>
                {challenge.reward.bonusMultiplier && challenge.reward.bonusMultiplier > 1 && (
                  <span className="text-purple-400 font-semibold text-sm">
                    {challenge.reward.bonusMultiplier}x Bonus!
                  </span>
                )}
              </div>
            </div>

            {/* Celebration Effect */}
            <div className="absolute -top-2 -right-2 text-yellow-400 animate-pulse">
              ✨
            </div>
            <div className="absolute -bottom-1 -left-1 text-yellow-400 animate-pulse delay-300">
              ✨
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}