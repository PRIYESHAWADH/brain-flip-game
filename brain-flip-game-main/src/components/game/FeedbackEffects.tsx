/**
 * Feedback Effects System
 * 
 * Provides visual feedback for game actions including success particles,
 * failure effects, level-up celebrations, and streak bonuses.
 */

"use client";
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnimation } from '@/hooks/useAnimation';
import { useGameStore } from '@/store/gameStore';

interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  rotation: number;
  rotationSpeed: number;
}

interface FeedbackEffect {
  id: string;
  type: 'success' | 'failure' | 'levelUp' | 'streakBonus' | 'perfectTiming';
  x: number;
  y: number;
  timestamp: number;
}

export interface FeedbackEffectsProps {
  containerRef?: React.RefObject<HTMLElement>;
  className?: string;
}

export default function FeedbackEffects({ containerRef, className }: FeedbackEffectsProps) {
  const { getMotionAnimation, triggerFeedback, prefersReducedMotion } = useAnimation();
  const { 
		score, 
		streak, 
		level, 
		mistakes 
	} = useGameStore();

  const [particles, setParticles] = useState<Particle[]>([]);
  const [effects, setEffects] = useState<FeedbackEffect[]>([]);
  const animationFrameRef = useRef<number>();
  const particlesCountRef = useRef(0);
  const lastScoreRef = useRef(0);
  const lastStreakRef = useRef(0);
  const lastLevelRef = useRef(1);
  const lastMistakesRef = useRef(0);

  // Particle system update loop
  const updateParticles = useCallback(() => {
    let nextLength = 0;

    setParticles(prevParticles => {
      const updated = prevParticles
        .map(particle => ({
          ...particle,
          x: particle.x + particle.vx,
          y: particle.y + particle.vy,
          vy: particle.vy + 0.2, // Gravity
          life: particle.life - 16, // ~60fps decay
          rotation: particle.rotation + particle.rotationSpeed
        }))
        .filter(particle => particle.life > 0);
      nextLength = updated.length;
      particlesCountRef.current = nextLength;
      return updated;
    });

    if (nextLength > 0) {
      animationFrameRef.current = requestAnimationFrame(updateParticles);
    } else {
      animationFrameRef.current = undefined;
    }
  }, []);

  // Start particle system
  useEffect(() => {
    // Only run the loop if we have particles and user hasn't opted for reduced motion
    if (!prefersReducedMotion && particlesCountRef.current > 0 && !animationFrameRef.current) {
      animationFrameRef.current = requestAnimationFrame(updateParticles);
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = undefined;
      }
    };
  }, [updateParticles, prefersReducedMotion]);

  // Create particles
  const createParticles = useCallback((
    x: number, 
    y: number, 
    count: number, 
    color: string,
    type: 'burst' | 'confetti' | 'stars' = 'burst'
  ) => {
    if (prefersReducedMotion) return;

    setParticles(prev => {
      const maxParticles = 50;
      const toCreate = Math.min(count, maxParticles - prev.length);

      if (toCreate <= 0) return prev;

      const newParticles: Particle[] = [];
      for (let i = 0; i < toCreate; i++) {
        const angle = (Math.PI * 2 * i) / toCreate + Math.random() * 0.5;
        const speed = 2 + Math.random() * 4;
        const size = type === 'confetti' ? 2 + Math.random() * 4 : 1 + Math.random() * 3;

        newParticles.push({
          id: `particle-${Date.now()}-${i}`,
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - (type === 'confetti' ? 2 : 1),
          life: type === 'confetti' ? 1600 : 900,
          maxLife: type === 'confetti' ? 1600 : 900,
          color,
          size,
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 10
        });
      }

      const merged = [...prev, ...newParticles];
      particlesCountRef.current = merged.length;
      return merged;
    });

    // Ensure RAF is running
    if (!animationFrameRef.current) {
      animationFrameRef.current = requestAnimationFrame(updateParticles);
    }
  }, [prefersReducedMotion, updateParticles]);

  // Add feedback effect
  const addEffect = useCallback((
    type: FeedbackEffect['type'],
    x?: number,
    y?: number
  ) => {
    const container = containerRef?.current || document.body;
    const rect = container.getBoundingClientRect();
    const effectX = x ?? rect.width / 2;
    const effectY = y ?? rect.height / 2;

    const effect: FeedbackEffect = {
      id: `effect-${Date.now()}`,
      type,
      x: effectX,
      y: effectY,
      timestamp: Date.now()
    };

  setEffects(prev => [...prev.slice(-9), effect]);

    // Remove effect after animation
    setTimeout(() => {
      setEffects(prev => prev.filter(e => e.id !== effect.id));
    }, 2000);

    return effect.id;
  }, [containerRef]);

  // Trigger success effect
  const triggerSuccess = useCallback((x?: number, y?: number) => {
    const effectId = addEffect('success', x, y);
    triggerFeedback('success');
    
    // Create success particles
    createParticles(
      x ?? 0, 
      y ?? 0, 
      8, 
      'var(--color-neon-green)',
      'burst'
    );

    return effectId;
  }, [addEffect, triggerFeedback, createParticles]);

  // Trigger failure effect
  const triggerFailure = useCallback((x?: number, y?: number) => {
    const effectId = addEffect('failure', x, y);
    triggerFeedback('failure');
    
    // Create failure particles (fewer, red)
    createParticles(
      x ?? 0, 
      y ?? 0, 
      4, 
      'var(--color-danger)',
      'burst'
    );

    return effectId;
  }, [addEffect, triggerFeedback, createParticles]);

  // Trigger level up celebration
  const triggerLevelUp = useCallback((x?: number, y?: number) => {
    const effectId = addEffect('levelUp', x, y);
    triggerFeedback('levelUp');
    
    // Create confetti explosion
    createParticles(
      x ?? 0, 
      y ?? 0, 
      20, 
      'var(--color-neon-yellow)',
      'confetti'
    );

    // Add some blue particles too
    setTimeout(() => {
      createParticles(
        x ?? 0, 
        y ?? 0, 
        15, 
        'var(--color-neon-blue)',
        'confetti'
      );
    }, 200);

    return effectId;
  }, [addEffect, triggerFeedback, createParticles]);

  const triggerStreakBonus = useCallback((x?: number, y?: number) => {
    const effectId = addEffect('streakBonus', x, y);
    return effectId;
  }, [addEffect]);

  // Trigger perfect timing effect
  const triggerPerfectTiming = useCallback((x?: number, y?: number) => {
    const effectId = addEffect('perfectTiming', x, y);
    triggerFeedback('perfectTiming');
    
    // Create special golden particles
    createParticles(
      x ?? 0, 
      y ?? 0, 
      16, 
      'var(--color-neon-yellow)',
      'stars'
    );

    return effectId;
  }, [addEffect, triggerFeedback, createParticles]);

  // Watch for game state changes and trigger effects
  useEffect(() => {
    // Score increased (success)
    if (score > lastScoreRef.current) {
      triggerSuccess();
    }
    lastScoreRef.current = score;
  }, [score, triggerSuccess]);

  useEffect(() => {
    // Streak increased (streak bonus)
    if (streak > lastStreakRef.current && streak > 0) {
      triggerStreakBonus();
    }
    lastStreakRef.current = streak;
  }, [streak, triggerStreakBonus]);

  useEffect(() => {
    // Level up
    if (level > lastLevelRef.current) {
      triggerLevelUp();
    }
    lastLevelRef.current = level;
  }, [level, triggerLevelUp]);

  useEffect(() => {
    // Mistake made (failure)
    if (mistakes > lastMistakesRef.current) {
      triggerFailure();
    }
    lastMistakesRef.current = mistakes;
  }, [mistakes, triggerFailure]);

  // Expose trigger functions via ref or context if needed
  useEffect(() => {
    // Could expose these functions globally if needed
    (window as any).__feedbackEffects = {
      triggerSuccess,
      triggerFailure,
      triggerLevelUp,
      triggerPerfectTiming
    };

    return () => {
      delete (window as any).__feedbackEffects;
    };
  }, [triggerSuccess, triggerFailure, triggerLevelUp, triggerPerfectTiming]);

  if (prefersReducedMotion) {
    return null; // Don't render particles for reduced motion users
  }

  return (
    <div 
      className={`fixed inset-0 pointer-events-none z-50 ${className || ''}`}
      style={{ overflow: 'hidden' }}
    >
      {/* Particle System */}
      <svg
        className="absolute inset-0 w-full h-full"
        style={{ pointerEvents: 'none', willChange: 'transform', transform: 'translateZ(0)' }}
      >
        {particles.map(particle => {
          const opacity = particle.life / particle.maxLife;
          return (
            <circle
              key={particle.id}
              cx={particle.x}
              cy={particle.y}
              r={particle.size}
              fill={particle.color}
              opacity={opacity}
              transform={`rotate(${particle.rotation} ${particle.x} ${particle.y})`}
              style={{
                filter: `drop-shadow(0 0 ${particle.size}px ${particle.color})`
              }}
            />
          );
        })}
      </svg>

      {/* Effect Overlays */}
      <AnimatePresence>
        {effects.map(effect => (
          <motion.div
            key={effect.id}
            className="absolute"
            style={{
              left: effect.x,
              top: effect.y,
              transform: 'translate(-50%, -50%)'
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={getMotionAnimation('feedback', effect.type)}
          >
            {/* success/failure visuals are handled in GameBoard to avoid duplication */}
            {effect.type === 'levelUp' && (
              <div className="px-3 py-1 rounded-lg bg-[var(--color-neon-yellow)] text-bg-primary text-sm font-black tracking-wide animate-level-up">
                LEVEL UP
              </div>
            )}
            {effect.type === 'streakBonus' && (
              <div className="text-5xl font-bold text-[var(--color-neon-pink)] animate-streak-glow">
                ⚡
              </div>
            )}
            {effect.type === 'perfectTiming' && (
              <div className="text-5xl font-bold text-[var(--color-neon-yellow)] animate-perfect-sparkle">
                ⭐
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}