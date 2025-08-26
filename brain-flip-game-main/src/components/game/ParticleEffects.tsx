"use client";
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface ParticleEffectsProps {
  type: 'correct' | 'perfect' | 'incorrect' | 'combo' | 'flow' | null;
  streak: number;
  comboStreak: number;
  reactionTime: number;
  onComplete?: () => void;
}

interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
}

export default function ParticleEffects({ 
  type, 
  streak, 
  comboStreak, 
  reactionTime, 
  onComplete 
}: ParticleEffectsProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!type) return;

    const newParticles: Particle[] = [];
    const centerX = 0;
    const centerY = 0;

    switch (type) {
      case 'perfect':
        // Explosive burst for perfect timing
        for (let i = 0; i < 12; i++) {
          const angle = (i / 12) * Math.PI * 2;
          const speed = 100 + Math.random() * 50;
          newParticles.push({
            id: `perfect-${i}`,
            x: centerX,
            y: centerY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            color: '#fbbf24', // yellow-400
            size: 8 + Math.random() * 4,
            life: 1,
            maxLife: 1
          });
        }
        break;

      case 'correct':
        // Gentle sparkles for correct answers
        const particleCount = Math.min(8, 4 + streak);
        for (let i = 0; i < particleCount; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 50 + Math.random() * 30;
          newParticles.push({
            id: `correct-${i}`,
            x: centerX,
            y: centerY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            color: '#10b981', // green-500
            size: 4 + Math.random() * 2,
            life: 1,
            maxLife: 1
          });
        }
        break;

      case 'combo':
        // Fire effect for combo streaks
        for (let i = 0; i < Math.min(16, comboStreak * 2); i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 80 + Math.random() * 40;
          newParticles.push({
            id: `combo-${i}`,
            x: centerX + (Math.random() - 0.5) * 20,
            y: centerY + (Math.random() - 0.5) * 20,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 20, // Slight upward bias
            color: i % 2 === 0 ? '#f97316' : '#dc2626', // orange-500 / red-600
            size: 6 + Math.random() * 3,
            life: 1,
            maxLife: 1
          });
        }
        break;

      case 'flow':
        // Ethereal flow state particles
        for (let i = 0; i < 20; i++) {
          const angle = (i / 20) * Math.PI * 2;
          const radius = 30 + Math.random() * 20;
          const speed = 30 + Math.random() * 20;
          newParticles.push({
            id: `flow-${i}`,
            x: centerX + Math.cos(angle) * radius,
            y: centerY + Math.sin(angle) * radius,
            vx: Math.cos(angle + Math.PI/2) * speed,
            vy: Math.sin(angle + Math.PI/2) * speed,
            color: '#8b5cf6', // violet-500
            size: 3 + Math.random() * 2,
            life: 1,
            maxLife: 1
          });
        }
        break;
    }

    setParticles(newParticles);

    // Animate particles
    const animationDuration = type === 'flow' ? 2000 : 1000;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / animationDuration;

      if (progress >= 1) {
        setParticles([]);
        onComplete?.();
        return;
      }

      setParticles(currentParticles => 
        currentParticles.map(particle => ({
          ...particle,
          x: particle.x + particle.vx * 0.016, // 60fps
          y: particle.y + particle.vy * 0.016,
          vy: particle.vy + 200 * 0.016, // Gravity
          life: 1 - progress,
          size: particle.size * (1 - progress * 0.5) // Shrink over time
        }))
      );

      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [type, streak, comboStreak, onComplete]);

  if (!type || particles.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map(particle => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: `calc(50% + ${particle.x}px)`,
            top: `calc(50% + ${particle.y}px)`,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            opacity: particle.life,
            boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
          }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0, opacity: 0 }}
        />
      ))}
    </div>
  );
}