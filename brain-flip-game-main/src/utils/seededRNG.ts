/**
 * Seeded Random Number Generator for deterministic testing
 * Uses a simple Linear Congruential Generator (LCG) algorithm
 */
export class SeededRNG {
  private seed: number;
  private current: number;

  constructor(seed: number = Date.now()) {
    this.seed = seed;
    this.current = seed;
  }

  /**
   * Generate next random number between 0 and 1
   */
  next(): number {
    // LCG formula: (a * seed + c) % m
    // Using values from Numerical Recipes
    this.current = (this.current * 1664525 + 1013904223) % Math.pow(2, 32);
    return this.current / Math.pow(2, 32);
  }

  /**
   * Generate random integer between min (inclusive) and max (exclusive)
   */
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min)) + min;
  }

  /**
   * Pick random element from array
   */
  pick<T>(array: readonly T[]): T {
    return array[this.nextInt(0, array.length)];
  }

  /**
   * Reset to original seed
   */
  reset(): void {
    this.current = this.seed;
  }

  /**
   * Get current seed for reproducibility
   */
  getSeed(): number {
    return this.seed;
  }
}

// Global instance for game use (can be overridden for testing)
export const gameRNG = new SeededRNG();

// Utility functions that use the global RNG
export const randomFloat = (): number => gameRNG.next();
export const randomInt = (min: number, max: number): number => gameRNG.nextInt(min, max);
export const randomPick = <T>(array: readonly T[]): T => gameRNG.pick(array);

// For testing - allows setting a specific seed
export const setGameSeed = (seed: number): void => {
  gameRNG.reset();
  (gameRNG as any).seed = seed;
  (gameRNG as any).current = seed;
};