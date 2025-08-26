'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';

interface NotificationBadgeProps {
  count: number;
  className?: string;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'error';
  animate?: boolean;
  pulse?: boolean;
}

const variants = {
  initial: { 
    scale: 0,
    opacity: 0,
    y: -10
  },
  animate: { 
    scale: 1,
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 500,
      damping: 25,
      mass: 1
    }
  },
  exit: { 
    scale: 0,
    opacity: 0,
    y: 10,
    transition: {
      duration: 0.2,
      ease: "easeOut" as const
    }
  }
};

const pulseAnimation = (size: 'sm' | 'md' | 'lg') => ({
  scale: [1, size === 'sm' ? 1.2 : 1.1, 1],
  opacity: [1, 0.7, 1],
  transition: {
    duration: size === 'sm' ? 1.5 : 2,
    repeat: Infinity,
    ease: "easeInOut" as const,
    times: [0, 0.5, 1]
  }
});

const sizeClasses = {
  sm: 'h-5 min-w-5 text-xs px-1.5',
  md: 'h-6 min-w-6 text-sm px-2',
  lg: 'h-7 min-w-7 text-base px-2.5'
};

const variantClasses = {
  default: [
    'bg-electric-blue/90 text-white',
    'border border-electric-blue/30',
    'shadow-[0_0_10px_rgba(65,145,255,0.3)]'
  ],
  success: [
    'bg-neon-green/90 text-white',
    'border border-neon-green/30',
    'shadow-[0_0_10px_rgba(0,255,65,0.3)]'
  ],
  warning: [
    'bg-yellow-500/90 text-black',
    'border border-yellow-400/30',
    'shadow-[0_0_10px_rgba(255,200,0,0.3)]'
  ],
  error: [
    'bg-warning-red/90 text-white',
    'border border-warning-red/30',
    'shadow-[0_0_10px_rgba(255,65,65,0.3)]'
  ]
};

export default function NotificationBadge({
  count,
  className,
  max = 99,
  size = 'md',
  variant = 'default',
  animate = true,
  pulse = false
}: NotificationBadgeProps) {
  const displayCount = count > max ? `${max}+` : count.toString();
  
  if (count === 0) return null;

  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div
          initial={animate ? "initial" : false}
          animate={{
            scale: pulse ? [1, size === 'sm' ? 1.2 : 1.1, 1] : 1,
            opacity: pulse ? [1, 0.7, 1] : 1,
            transition: {
              duration: size === 'sm' ? 1.5 : 2,
              repeat: pulse ? Infinity : 0,
              ease: "easeInOut"
            }
          }}
          exit="exit"
          variants={variants}
          className={cn(
            'inline-flex items-center justify-center rounded-full font-medium',
            'backdrop-blur-sm shadow-lg',
            sizeClasses[size],
            variantClasses[variant],
            pulse && 'hover:scale-110 transform-gpu',
            className
          )}
        >
          {displayCount}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
