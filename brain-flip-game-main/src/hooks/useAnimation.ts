/**
 * Animation Management Hook
 * 
 * Provides centralized animation control with performance monitoring,
 * reduced motion support, and dynamic quality adjustment.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { 
  getAnimationPreset, 
  createMotionAnimation, 
  performanceMonitor,
  type MotionConfig 
} from '@/motion/presets';

export interface AnimationState {
  isAnimating: boolean;
  performanceMode: 'high' | 'balanced' | 'low';
  respectReducedMotion: boolean;
  debugMode: boolean;
}

export interface AnimationMetrics {
  averageFPS: number;
  frameDrops: number;
  dropRate: number;
  shouldReduceQuality: boolean;
}

/**
 * Animation management hook with performance monitoring
 */
export function useAnimation(initialConfig?: Partial<MotionConfig>) {
  const [state, setState] = useState<AnimationState>({
    isAnimating: false,
    performanceMode: initialConfig?.performanceMode || 'balanced',
    respectReducedMotion: initialConfig?.respectReducedMotion ?? true,
    debugMode: initialConfig?.debugMode || false
  });

  const [metrics, setMetrics] = useState<AnimationMetrics>({
    averageFPS: 60,
    frameDrops: 0,
    dropRate: 0,
    shouldReduceQuality: false
  });

  // Check for reduced motion preference
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // Update performance metrics
  const updatePerformanceMetrics = useCallback((newMetrics: Partial<typeof metrics>) => {
    setMetrics(prev => ({ ...prev, ...newMetrics }));

    // Auto-adjust performance mode based on metrics
    if (newMetrics.shouldReduceQuality && state.performanceMode !== 'low') {
      setState(prev => ({ ...prev, performanceMode: 'low' }));
      console.warn('Animation performance degraded, switching to low performance mode');
    }
  }, [state.performanceMode]);

  // Start performance monitoring
  const startPerformanceMonitoring = useCallback(() => {
    performanceMonitor.startMonitoring();
    
    const monitorFrame = () => {
      performanceMonitor.recordFrame();
      animationFrameRef.current = requestAnimationFrame(monitorFrame);
    };
    
    animationFrameRef.current = requestAnimationFrame(monitorFrame);
  }, []);

  // Stop performance monitoring
  const stopPerformanceMonitoring = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = undefined;
    }
    updatePerformanceMetrics({});
  }, [updatePerformanceMetrics]);

  // Register animation start
  const registerAnimationStart = useCallback((animationId: string) => {
    activeAnimationsRef.current.add(animationId);
    
    if (activeAnimationsRef.current.size === 1) {
      setState(prev => ({ ...prev, isAnimating: true }));
      startMonitoring();
    }

    if (state.debugMode) {
      console.log(`Animation started: ${animationId}`);
    }
  }, [startMonitoring, state.debugMode]);

  // Register animation end
  const endAnimation = useCallback((animationId: string) => {
    activeAnimationsRef.current.delete(animationId);
    
    if (activeAnimationsRef.current.size === 0) {
      setState(prev => ({ ...prev, isAnimating: false }));
      stopPerformanceMonitoring();
    }

    if (state.debugMode) {
      console.log(`Animation ended: ${animationId}`);
    }
  }, [stopPerformanceMonitoring, state.debugMode]);

  // Get animation configuration
  const getAnimationConfig = useMemo(() => ({
    respectReducedMotion: state.respectReducedMotion && prefersReducedMotion,
    performanceMode: state.performanceMode,
    debugMode: state.debugMode
  }), [state, prefersReducedMotion]);

  // Get animation preset with current configuration
  const getPreset = useCallback((
    category: Parameters<typeof getAnimationPreset>[0],
    preset: Parameters<typeof getAnimationPreset>[1]
  ) => {
    return getAnimationPreset(category, preset, getAnimationConfig);
  }, [getAnimationConfig]);

  // Get Framer Motion animation object
  const getMotionAnimation = useCallback((
    category: Parameters<typeof createMotionAnimation>[0],
    preset: Parameters<typeof createMotionAnimation>[1]
  ) => {
    return createMotionAnimation(category, preset, getAnimationConfig);
  }, [getAnimationConfig]);

  // Create CSS animation string
  const getCSSAnimation = useCallback((
    category: Parameters<typeof getAnimationPreset>[0],
    preset: Parameters<typeof getAnimationPreset>[1]
  ) => {
    const animationPreset = getPreset(category, preset);
    return `${animationPreset.duration}ms ${animationPreset.easing} ${animationPreset.delay || 0}ms`;
  }, [getPreset]);

  // Apply CSS custom properties for animation
  const applyCSSProperties = useCallback((
    element: HTMLElement,
    category: Parameters<typeof getAnimationPreset>[0],
    preset: Parameters<typeof getAnimationPreset>[1]
  ) => {
    const animationPreset = getPreset(category, preset);
    element.style.setProperty('--animation-duration', `${animationPreset.duration}ms`);
    element.style.setProperty('--animation-easing', animationPreset.easing);
    element.style.setProperty('--animation-delay', `${animationPreset.delay || 0}ms`);
  }, [getPreset]);

  // Trigger feedback animation
  const triggerFeedback = useCallback((
    type: 'success' | 'failure' | 'levelUp' | 'streakBonus' | 'perfectTiming',
    element?: HTMLElement
  ) => {
    const animationId = `feedback-${type}-${Date.now()}`;
    startAnimation(animationId);

    if (element) {
      // Add animation class
      element.classList.add(`animate-${type.toLowerCase().replace(/([A-Z])/g, '-$1')}`);
      element.classList.add('animate-gpu');

      // Remove classes after animation
      const preset = getPreset('feedback', type);
      setTimeout(() => {
        element.classList.remove(`animate-${type.toLowerCase().replace(/([A-Z])/g, '-$1')}`);
        element.classList.remove('animate-gpu');
        element.classList.add('animate-complete');
        endAnimation(animationId);
      }, preset.duration + (preset.delay || 0));
    } else {
      // Just track the animation timing
      const preset = getPreset('feedback', type);
      setTimeout(() => {
        endAnimation(animationId);
      }, preset.duration + (preset.delay || 0));
    }

    return animationId;
  }, [startAnimation, endAnimation, getPreset]);

  // Update configuration
  const updateConfig = useCallback((newConfig: Partial<AnimationState>) => {
    setState(prev => ({
      ...prev,
      ...newConfig
    }));
  }, []);

  // Reset performance metrics
  const resetMetrics = useCallback(() => {
    performanceMonitor.reset();
    setMetrics({
      averageFPS: 60,
      frameDrops: 0,
      dropRate: 0,
      shouldReduceQuality: false
    });
  }, []);

  // Listen for reduced motion preference changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (e: MediaQueryListEvent) => {
      setState(prev => ({ 
        ...prev, 
        respectReducedMotion: e.matches 
      }));
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return {
    // State
    state,
    metrics,
    isAnimating: state.isAnimating,
    activeAnimations: activeAnimationsRef.current.size,

    // Configuration
    getConfig,
    updateConfig,
    prefersReducedMotion: prefersReducedMotion(),

    // Animation utilities
    getPreset,
    getMotionAnimation,
    getCSSAnimation,
    applyCSSProperties,

    // Animation control
    startAnimation,
    endAnimation,
    triggerFeedback,

    // Performance monitoring
    resetMetrics,
    
    // Debug utilities
    getActiveAnimations: () => Array.from(activeAnimationsRef.current)
  };
}

/**
 * Hook for simple animation triggers without full management
 */
export function useAnimationTrigger() {
  const { triggerFeedback, getCSSAnimation, applyCSSProperties } = useAnimation();

  return {
    triggerFeedback,
    getCSSAnimation,
    applyCSSProperties
  };
}