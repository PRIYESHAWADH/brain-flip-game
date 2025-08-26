/**
 * Motion Design System - Standardized Animation Presets
 * 
 * Provides consistent animation timing, easing curves, and reduced-motion alternatives
 * for a cohesive visual experience across the entire game.
 */

export interface AnimationPreset {
  duration: number;
  easing: string;
  delay?: number;
  reducedMotion?: Partial<AnimationPreset>;
}

export interface MotionConfig {
  respectReducedMotion: boolean;
  performanceMode: 'high' | 'balanced' | 'low';
  debugMode: boolean;
}

/**
 * Standardized easing curves for consistent motion feel
 */
export const easingCurves = {
  // Standard easing
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  
  // Bouncy/Spring easing
  spring: 'cubic-bezier(0.16, 1, 0.3, 1)',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  
  // Sharp/Snappy easing
  sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
  snappy: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  
  // Smooth/Gentle easing
  smooth: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
  gentle: 'cubic-bezier(0.165, 0.84, 0.44, 1)'
} as const;

/**
 * Core animation presets organized by use case
 */
export const motionPresets = {
  // Micro-interactions (buttons, hover states)
  micro: {
    buttonHover: {
      duration: 150,
      easing: easingCurves.easeOut,
      reducedMotion: { duration: 100 }
    },
    buttonPress: {
      duration: 100,
      easing: easingCurves.easeIn,
      reducedMotion: { duration: 50 }
    },
    iconHover: {
      duration: 200,
      easing: easingCurves.spring,
      reducedMotion: { duration: 100, easing: easingCurves.easeOut }
    },
    focusRing: {
      duration: 200,
      easing: easingCurves.easeOut,
      reducedMotion: { duration: 100 }
    }
  },

  // UI transitions (modals, menus, page changes)
  ui: {
    fadeIn: {
      duration: 300,
      easing: easingCurves.easeOut,
      reducedMotion: { duration: 150 }
    },
    fadeOut: {
      duration: 200,
      easing: easingCurves.easeIn,
      reducedMotion: { duration: 100 }
    },
    slideUp: {
      duration: 400,
      easing: easingCurves.spring,
      reducedMotion: { duration: 200, easing: easingCurves.easeOut }
    },
    slideDown: {
      duration: 350,
      easing: easingCurves.easeInOut,
      reducedMotion: { duration: 175, easing: easingCurves.easeOut }
    },
    scaleIn: {
      duration: 300,
      easing: easingCurves.bounce,
      reducedMotion: { duration: 150, easing: easingCurves.easeOut }
    },
    modalAppear: {
      duration: 400,
      easing: easingCurves.spring,
      reducedMotion: { duration: 200, easing: easingCurves.easeOut }
    }
  },

  // Game feedback (success, failure, level up)
  feedback: {
    success: {
      duration: 600,
      easing: easingCurves.bounce,
      reducedMotion: { duration: 300, easing: easingCurves.easeOut }
    },
    failure: {
      duration: 300,
      easing: easingCurves.sharp,
      reducedMotion: { duration: 150, easing: easingCurves.easeOut }
    },
    levelUp: {
      duration: 1200,
      easing: easingCurves.spring,
      reducedMotion: { duration: 600, easing: easingCurves.easeOut }
    },
    streakBonus: {
      duration: 800,
      easing: easingCurves.bounce,
      reducedMotion: { duration: 400, easing: easingCurves.easeOut }
    },
    perfectTiming: {
      duration: 1000,
      easing: easingCurves.spring,
      reducedMotion: { duration: 500, easing: easingCurves.easeOut }
    }
  },

  // Value updates (score, streak, level changes)
  values: {
    scoreUpdate: {
      duration: 400,
      easing: easingCurves.spring,
      reducedMotion: { duration: 200, easing: easingCurves.easeOut }
    },
    streakUpdate: {
      duration: 350,
      easing: easingCurves.bounce,
      reducedMotion: { duration: 175, easing: easingCurves.easeOut }
    },
    levelProgress: {
      duration: 400,
      easing: easingCurves.easeOut,
      reducedMotion: { duration: 250 }
    },
    timerTick: {
      duration: 75,
      easing: easingCurves.easeInOut,
      reducedMotion: { duration: 50 }
    }
  },

  // Page transitions
  page: {
    enter: {
      duration: 400,
      easing: easingCurves.spring,
      reducedMotion: { duration: 200, easing: easingCurves.easeOut }
    },
    exit: {
      duration: 300,
      easing: easingCurves.easeIn,
      reducedMotion: { duration: 150 }
    },
    sharedElement: {
      duration: 500,
      easing: easingCurves.spring,
      reducedMotion: { duration: 250, easing: easingCurves.easeOut }
    }
  }
} as const;

/**
 * Default motion configuration
 */
export const defaultMotionConfig: MotionConfig = {
  respectReducedMotion: true,
  performanceMode: 'balanced',
  debugMode: false
};

/**
 * Get animation preset with reduced motion consideration
 */
export function getAnimationPreset(
  category: keyof typeof motionPresets,
  preset: string,
  config: Partial<MotionConfig> = {}
): AnimationPreset {
  
  if (!presetData) {
    console.warn(`Animation preset not found: ${category}.${preset}`);
    return motionPresets.ui.fadeIn;
  }

  // Check for reduced motion preference
    (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  if (prefersReducedMotion && presetData.reducedMotion) {
    return {
      ...presetData,
      ...presetData.reducedMotion
    };
  }

  // Adjust for performance mode
  if (finalConfig.performanceMode === 'low') {
    return {
      ...presetData,
      duration: Math.max(100, presetData.duration * 0.5)
    };
  } else if (finalConfig.performanceMode === 'high') {
    return {
      ...presetData,
      duration: presetData.duration * 1.2
    };
  }

  return presetData;
}

/**
 * Create CSS animation string from preset
 */
export function createCSSAnimation(
  category: keyof typeof motionPresets,
  preset: string,
  config?: Partial<MotionConfig>
): string {
  return `${animationPreset.duration}ms ${animationPreset.easing} ${animationPreset.delay || 0}ms`;
}

/**
 * Create Framer Motion animation object from preset
 */
export function createMotionAnimation(
  category: keyof typeof motionPresets,
  preset: string,
  config?: Partial<MotionConfig>
) {
  return {
    duration: animationPreset.duration / 1000, // seconds
    ...(animationPreset.delay ? { delay: animationPreset.delay / 1000 } : {})
  };
}

/**
 * Performance monitoring utilities
 */
export class AnimationPerformanceMonitor {
  private frameDrops: number = 0;
  private lastFrameTime: number = 0;
  private frameCount: number = 0;
  private startTime: number = 0;

  startMonitoring(): void {
    this.startTime = performance.now();
    this.frameCount = 0;
    this.frameDrops = 0;
  }

  recordFrame(): void {
    
    if (this.lastFrameTime > 0) {
      // Consider frame dropped if it takes longer than 16.67ms (60fps)
      if (frameDuration > 16.67) {
        this.frameDrops++;
      }
    }
    
    this.lastFrameTime = currentTime;
    this.frameCount++;
  }

  getMetrics() {
    
    return {
      averageFPS,
      frameDrops: this.frameDrops,
      dropRate,
      shouldReduceQuality: dropRate > 0.1 || averageFPS < 50
    };
  }

  reset(): void {
    this.frameDrops = 0;
    this.lastFrameTime = 0;
    this.frameCount = 0;
    this.startTime = performance.now();
  }
}

/**
 * Global performance monitor instance
 */
export const performanceMonitor = new AnimationPerformanceMonitor();