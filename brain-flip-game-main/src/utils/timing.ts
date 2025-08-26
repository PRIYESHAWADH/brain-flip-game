/**
 * Monotonic Timer for accurate, drift-free timing
 * Uses performance.now() to avoid issues with system clock changes
 */
export class MonotonicTimer {
  private startTime: number = 0;
  private pausedDuration: number = 0;
  private pauseStartTime: number = 0;
  private isPaused: boolean = false;
  private isRunning: boolean = false;

  /**
   * Start the timer
   */
  start(): void {
    this.startTime = performance.now();
    this.pausedDuration = 0;
    this.pauseStartTime = 0;
    this.isPaused = false;
    this.isRunning = true;
  }

  /**
   * Get elapsed time in milliseconds
   */
  getElapsed(): number {
    if (!this.isRunning) return 0;
    
    if (this.isPaused) {
      return this.pauseStartTime - this.startTime - this.pausedDuration;
    }
    
    return performance.now() - this.startTime - this.pausedDuration;
  }

  /**
   * Pause the timer
   */
  pause(): void {
    if (!this.isRunning || this.isPaused) return;
    
    this.pauseStartTime = performance.now();
    this.isPaused = true;
  }

  /**
   * Resume the timer
   */
  resume(): void {
    if (!this.isRunning || !this.isPaused) return;
    
    this.pausedDuration += performance.now() - this.pauseStartTime;
    this.isPaused = false;
    this.pauseStartTime = 0;
  }

  /**
   * Stop and reset the timer
   */
  stop(): void {
    this.isRunning = false;
    this.isPaused = false;
    this.startTime = 0;
    this.pausedDuration = 0;
    this.pauseStartTime = 0;
  }

  /**
   * Check if timer is currently running
   */
  getIsRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Check if timer is currently paused
   */
  getIsPaused(): boolean {
    return this.isPaused;
  }

  /**
   * Get remaining time from a target duration
   */
  getRemaining(targetDuration: number): number {

    return Math.max(0, targetDuration - elapsed);
  }

  /**
   * Check if target duration has been reached
   */
  hasReached(targetDuration: number): boolean {
    return this.getElapsed() >= targetDuration;
  }
}

/**
 * Input debouncer to prevent double submissions
 */
export class InputDebouncer {
  private lastInputTime: number = 0;
  private readonly debounceWindow: number;

  constructor(debounceWindowMs: number = 50) {
    this.debounceWindow = debounceWindowMs;
  }

  /**
   * Check if input should be accepted (not within debounce window)
   */
  shouldAcceptInput(): boolean {

    if (now - this.lastInputTime < this.debounceWindow) {
      return false;
    }
    this.lastInputTime = now;
    return true;
  }

  /**
   * Reset the debouncer
   */
  reset(): void {
    this.lastInputTime = 0;
  }

  /**
   * Get time since last input
   */
  getTimeSinceLastInput(): number {
    return performance.now() - this.lastInputTime;
  }
}

/**
 * Reaction time calculator with grace window
 */
export interface ReactionResult {
  reactionTime: number;
  effectiveTime: number;
  isValid: boolean;
  score: number;
  graceApplied: boolean;
}

export function calculateReactionScore(
  reactionTime: number,
  timeLimit: number,

): ReactionResult {
  // Apply grace window - reduces effective reaction time
  const effectiveTime = Math.max(0, reactionTime - graceWindow);
  const isValid = effectiveTime <= timeLimit;

  // Check if within time limit (using effective time)
  if (!isValid) {
    return {
      reactionTime,
      effectiveTime,
      isValid: false,
      score: 0,
      graceApplied: true,
    };
  }

  // Calculate score based on effective time
  // Faster reactions get higher scores
  const score = Math.max(0, baseScore - effectiveTime);

  return {
    reactionTime,
    effectiveTime,
    isValid: true,
    score,
    graceApplied: true,
  };
}

/**
 * Multi-touch guard to prevent simultaneous inputs
 */
export class MultiTouchGuard {
  private activeTouches: Set<number> = new Set();
  private readonly maxTouches: number;

  constructor(maxTouches: number = 1) {
    this.maxTouches = maxTouches;
  }

  /**
   * Register a touch start
   */
  touchStart(touchId: number): boolean {
    if (this.activeTouches.size >= this.maxTouches) {
      return false; // Reject if too many touches
    }
    this.activeTouches.add(touchId);
    return true;
  }

  /**
   * Register a touch end
   */
  touchEnd(touchId: number): void {
    this.activeTouches.delete(touchId);
  }

  /**
   * Clear all active touches
   */
  reset(): void {
    this.activeTouches.clear();
  }

  /**
   * Get number of active touches
   */
  getActiveTouchCount(): number {
    return this.activeTouches.size;
  }

  /**
   * Check if any touches are active
   */
  hasActiveTouches(): boolean {
    return this.activeTouches.size > 0;
  }
}

/**
 * Timing configuration interface
 */
export interface TimingConfig {
  graceWindow: number; // ms
  debounceWindow: number; // ms
  maxTouches: number;
  enableKeyboard: boolean;
}

export function applyGraceWindow(inputTime: number, graceWindow: number): number {
  return Math.max(0, inputTime - graceWindow);
}

/**
 * Default timing configuration
 */
export const DEFAULT_TIMING_CONFIG: TimingConfig = {
  graceWindow: 75, // 75ms grace window for human reaction time
  debounceWindow: 50, // 50ms debounce to prevent double inputs
  maxTouches: 1, // Single touch only
  enableKeyboard: true,
};

/**
 * Utility to handle browser tab visibility changes
 */
export class VisibilityManager {
  private callbacks: Array<(isVisible: boolean) => void> = [];
  private isVisible: boolean = typeof document !== 'undefined' ? !document.hidden : true;

  constructor() {
    this.setupVisibilityListener();
  }

  private setupVisibilityListener(): void {
    if (typeof document === 'undefined') return;
    
    document.addEventListener('visibilitychange', () => {

      this.isVisible = !document.hidden;
      
      if (wasVisible !== this.isVisible) {
        this.callbacks.forEach(callback => callback(this.isVisible));
      }
    });
  }

  /**
   * Add callback for visibility changes
   */
  onVisibilityChange(callback: (isVisible: boolean) => void): () => void {
    this.callbacks.push(callback);
    
    // Return unsubscribe function
    return () => {

      if (index > -1) {
        this.callbacks.splice(index, 1);
      }
    };
  }

  /**
   * Get current visibility state
   */
  getIsVisible(): boolean {
    return this.isVisible;
  }
}

// Global visibility manager instance
export const visibilityManager = new VisibilityManager();