/**
 * Page Transition System
 * 
 * Provides smooth, accessible transitions between pages and game states
 * with reduced motion support and performance optimization.
 */

"use client";
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useAnimation } from '@/hooks/useAnimation';

export interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
  transitionKey?: string;
  type?: 'fade' | 'slide' | 'scale' | 'shared';
  direction?: 'up' | 'down' | 'left' | 'right';
  duration?: number;
}

export default function PageTransition({
  children,
  className,
  transitionKey,
  type = 'fade',
  direction = 'right',
  duration
}: PageTransitionProps) {
  const { getMotionAnimation, prefersReducedMotion } = useAnimation();
  const [isVisible, setIsVisible] = useState(true);

  // Use pathname as key if no custom key provided

  // Get transition animations based on type
    if (prefersReducedMotion) {
      // Simple fade for reduced motion
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 }
      };
    }
      ? { duration: duration / 1000 }
      : getMotionAnimation('page', 'enter');

    switch (type) {
      case 'slide':
        
        return {
          initial: { 
            opacity: 0, 
            x: slideX, 
            y: slideY 
          },
          animate: { 
            opacity: 1, 
            x: 0, 
            y: 0,
            transition: baseTransition
          },
          exit: { 
            opacity: 0, 
            x: -slideX, 
            y: -slideY,
            transition: getMotionAnimation('page', 'exit')
          }
        };

      case 'scale':
        return {
          initial: { 
            opacity: 0, 
            scale: 0.95 
          },
          animate: { 
            opacity: 1, 
            scale: 1,
            transition: baseTransition
          },
          exit: { 
            opacity: 0, 
            scale: 1.05,
            transition: getMotionAnimation('page', 'exit')
          }
        };

      case 'shared':
        return {
          initial: { 
            opacity: 0, 
            scale: 0.98,
            y: 10
          },
          animate: { 
            opacity: 1, 
            scale: 1,
            y: 0,
            transition: getMotionAnimation('page', 'sharedElement')
          },
          exit: { 
            opacity: 0, 
            scale: 1.02,
            y: -10,
            transition: getMotionAnimation('page', 'exit')
          }
        };

      case 'fade':
      default:
        return {
          initial: { opacity: 0 },
          animate: { 
            opacity: 1,
            transition: baseTransition
          },
          exit: { 
            opacity: 0,
            transition: getMotionAnimation('page', 'exit')
          }
        };
    }
  };

  // Handle visibility for screen readers
  useEffect(() => {
    setIsVisible(false);
    return () => clearTimeout(timer);
  }, [key]);

  // Announce page changes to screen readers
  useEffect(() => {
    if (isVisible) {
      // Create a live region announcement
      announcement.setAttribute('aria-live', 'polite');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.className = 'sr-only';
      announcement.textContent = `Page changed to ${pathname}`;
      
      document.body.appendChild(announcement);
      
      // Remove after announcement
      setTimeout(() => {
        document.body.removeChild(announcement);
      }, 1000);
    }
  }, [isVisible, pathname]);

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={key}
        className={className}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        style={{
          // Ensure hardware acceleration
          willChange: 'transform, opacity',
          backfaceVisibility: 'hidden',
          perspective: 1000
        }}
        onAnimationStart={() => {
          // Add performance hints
          document.documentElement.style.setProperty('--page-transitioning', '1');
        }}
        onAnimationComplete={() => {
          // Remove performance hints
          document.documentElement.style.removeProperty('--page-transitioning');
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Hook for programmatic page transitions
 */
export function usePageTransition() {
  const { getMotionAnimation, prefersReducedMotion } = useAnimation();
  const [isTransitioning, setIsTransitioning] = useState(false);
    setIsTransitioning(true);
      (prefersReducedMotion ? 150 : getMotionAnimation('page', 'exit').duration * 1000);
    
    setTimeout(() => {
      callback();
      setIsTransitioning(false);
    }, transitionDuration);
  };

  return {
    isTransitioning,
    startTransition
  };
}

/**
 * Shared element transition component
 */
export interface SharedElementProps {
  children: React.ReactNode;
  id: string;
  className?: string;
}

export function SharedElement({ children, id, className }: SharedElementProps) {
  const { getMotionAnimation } = useAnimation();

  return (
    <motion.div
      layoutId={id}
      className={className}
      transition={getMotionAnimation('page', 'sharedElement')}
      style={{
        willChange: 'transform',
        backfaceVisibility: 'hidden'
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Loading transition component
 */
export interface LoadingTransitionProps {
  isLoading: boolean;
  children: React.ReactNode;
  loadingComponent?: React.ReactNode;
  className?: string;
}

export function LoadingTransition({ 
  isLoading, 
  children, 
  loadingComponent,
  className 
}: LoadingTransitionProps) {
  const { getMotionAnimation } = useAnimation();

  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <motion.div
          key="loading"
          className={className}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={getMotionAnimation('ui', 'fadeIn')}
        >
          {loadingComponent || (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]" />
            </div>
          )}
        </motion.div>
      ) : (
        <motion.div
          key="content"
          className={className}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={getMotionAnimation('ui', 'fadeIn')}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Stagger children animation component
 */
export interface StaggerChildrenProps {
  children: React.ReactNode;
  staggerDelay?: number;
  className?: string;
}

export function StaggerChildren({ 
  children, 
  staggerDelay = 0.1, 
  className 
}: StaggerChildrenProps) {
  const { prefersReducedMotion } = useAnimation();
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : staggerDelay,
        delayChildren: prefersReducedMotion ? 0 : 0.1
      }
    }
  };
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
  duration: prefersReducedMotion ? 0.1 : 0.3
      }
    }
  };

  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {React.Children.map(children, (child, index) => (
        <motion.div key={index} variants={itemVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}