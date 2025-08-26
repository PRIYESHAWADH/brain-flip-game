/**
 * Seeded Random Number Generator
 * Provides consistent random numbers based on a seed value
 * Useful for game logic that needs to be reproducible
 */
export class seededRNG {
  private seed: number;
  private m: number = 0x80000000; // 2**31
  private a: number = 1103515245;
  private c: number = 12345;
  private state: number;

  constructor(seed: number) {
    this.seed = seed;
    this.state = seed;
  }

  /**
   * Generate next random number
   */
  public next(): number {
    this.state = (this.a * this.state + this.c) % this.m;
    return this.state / (this.m - 1);
  }

  /**
   * Generate random number between 0 and 1
   */
  public random(): number {
    return this.next();
  }

  /**
   * Generate random integer between min and max (inclusive)
   */
  public randomInt(min: number, max: number): number {
    return Math.floor(this.random() * (max - min + 1)) + min;
  }

  /**
   * Generate random float between min and max
   */
  public randomFloat(min: number, max: number): number {
    return this.random() * (max - min) + min;
  }

  /**
   * Pick random element from array
   */
  public randomChoice<T>(array: T[]): T {
    if (array.length === 0) {
      throw new Error('Cannot pick from empty array');
    }
    return array[this.randomInt(0, array.length - 1)];
  }

  /**
   * Shuffle array using Fisher-Yates algorithm
   */
  public shuffle<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = this.randomInt(0, i);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Generate random boolean with given probability
   */
  public randomBoolean(probability: number = 0.5): boolean {
    return this.random() < probability;
  }

  /**
   * Generate random string of given length
   */
  public randomString(length: number, charset: string = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'): string {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += charset[this.randomInt(0, charset.length - 1)];
    }
    return result;
  }

  /**
   * Generate random color in hex format
   */
  public randomColor(): string {
    const r = this.randomInt(0, 255);
    const g = this.randomInt(0, 255);
    const b = this.randomInt(0, 255);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  /**
   * Generate random UUID v4
   */
  public randomUUID(): string {
    const template = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
    return template.replace(/[xy]/g, (c) => {
      const r = this.randomInt(0, 15);
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  /**
   * Reset generator to initial seed
   */
  public reset(): void {
    this.state = this.seed;
  }

  /**
   * Get current seed value
   */
  public getSeed(): number {
    return this.seed;
  }

  /**
   * Get current state
   */
  public getState(): number {
    return this.state;
  }

  /**
   * Set new seed and reset state
   */
  public setSeed(newSeed: number): void {
    this.seed = newSeed;
    this.state = newSeed;
  }

  /**
   * Generate weighted random choice
   */
  public weightedChoice<T>(items: Array<{ item: T; weight: number }>): T {
    const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
    let random = this.random() * totalWeight;
    
    for (const { item, weight } of items) {
      random -= weight;
      if (random <= 0) {
        return item;
      }
    }
    
    // Fallback to last item
    return items[items.length - 1].item;
  }

  /**
   * Generate random normal distribution (Box-Muller transform)
   */
  public randomNormal(mean: number = 0, standardDeviation: number = 1): number {
    const u1 = this.random();
    const u2 = this.random();
    
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return z0 * standardDeviation + mean;
  }

  /**
   * Generate random exponential distribution
   */
  public randomExponential(lambda: number = 1): number {
    return -Math.log(1 - this.random()) / lambda;
  }

  /**
   * Generate random poisson distribution
   */
  public randomPoisson(lambda: number): number {
    let k = 0;
    let p = 1.0;
    const L = Math.exp(-lambda);
    
    do {
      k++;
      p *= this.random();
    } while (p > L);
    
    return k - 1;
  }

  /**
   * Generate random geometric distribution
   */
  public randomGeometric(p: number): number {
    return Math.floor(Math.log(1 - this.random()) / Math.log(1 - p)) + 1;
  }

  /**
   * Generate random binomial distribution
   */
  public randomBinomial(n: number, p: number): number {
    let successes = 0;
    for (let i = 0; i < n; i++) {
      if (this.randomBoolean(p)) {
        successes++;
      }
    }
    return successes;
  }

  /**
   * Generate random permutation of numbers 0 to n-1
   */
  public randomPermutation(n: number): number[] {
    const array = Array.from({ length: n }, (_, i) => i);
    return this.shuffle(array);
  }

  /**
   * Generate random subset of given size from array
   */
  public randomSubset<T>(array: T[], size: number): T[] {
    if (size > array.length) {
      throw new Error('Subset size cannot be larger than array size');
    }
    
    const shuffled = this.shuffle(array);
    return shuffled.slice(0, size);
  }

  /**
   * Generate random weighted subset
   */
  public randomWeightedSubset<T>(items: Array<{ item: T; weight: number }>, size: number): T[] {
    if (size > items.length) {
      throw new Error('Subset size cannot be larger than items size');
    }
    
    const shuffled = this.shuffle(items);
    const selected = shuffled.slice(0, size);
    return selected.map(item => item.item);
  }

  /**
   * Generate random maze-like pattern
   */
  public randomMaze(width: number, height: number): boolean[][] {
    const maze = Array(height).fill(null).map(() => Array(width).fill(true));
    
    // Start from top-left corner
    maze[0][0] = false;
    
    const stack: [number, number][] = [[0, 0]];
    
    while (stack.length > 0) {
      const [x, y] = stack[stack.length - 1];
      const neighbors = this.getUnvisitedNeighbors(x, y, width, height, maze);
      
      if (neighbors.length === 0) {
        stack.pop();
        continue;
      }
      
      const [nx, ny] = this.randomChoice(neighbors);
      maze[ny][nx] = false;
      maze[y + (ny - y) / 2][x + (nx - x) / 2] = false;
      stack.push([nx, ny]);
    }
    
    return maze;
  }

  /**
   * Get unvisited neighbors for maze generation
   */
  private getUnvisitedNeighbors(x: number, y: number, width: number, height: number, maze: boolean[][]): [number, number][] {
    const neighbors: [number, number][] = [];
    const directions = [[0, -2], [2, 0], [0, 2], [-2, 0]];
    
    for (const [dx, dy] of directions) {
      const nx = x + dx;
      const ny = y + dy;
      
      if (nx >= 0 && nx < width && ny >= 0 && ny < height && maze[ny][nx]) {
        neighbors.push([nx, ny]);
      }
    }
    
    return neighbors;
  }

  /**
   * Generate random terrain height map
   */
  public randomTerrain(width: number, height: number, roughness: number = 0.5): number[][] {
    const terrain = Array(height).fill(null).map(() => Array(width).fill(0));
    
    // Initialize corners
    terrain[0][0] = this.randomFloat(-1, 1);
    terrain[0][width - 1] = this.randomFloat(-1, 1);
    terrain[height - 1][0] = this.randomFloat(-1, 1);
    terrain[height - 1][width - 1] = this.randomFloat(-1, 1);
    
    this.generateTerrainRecursive(terrain, 0, 0, width - 1, height - 1, roughness);
    
    return terrain;
  }

  /**
   * Recursive terrain generation using diamond-square algorithm
   */
  private generateTerrainRecursive(terrain: number[][], x1: number, y1: number, x2: number, y2: number, roughness: number): void {
    if (x2 - x1 < 2 || y2 - y1 < 2) return;
    
    const midX = Math.floor((x1 + x2) / 2);
    const midY = Math.floor((y1 + y2) / 2);
    
    // Diamond step
    terrain[midY][midX] = (terrain[y1][x1] + terrain[y1][x2] + terrain[y2][x1] + terrain[y2][x2]) / 4 + this.randomFloat(-roughness, roughness);
    
    // Square step
    if (midX > x1) {
      terrain[midY][x1] = (terrain[y1][x1] + terrain[y2][x1] + terrain[midY][midX]) / 3 + this.randomFloat(-roughness, roughness);
    }
    if (midX < x2) {
      terrain[midY][x2] = (terrain[y1][x2] + terrain[y2][x2] + terrain[midY][midX]) / 3 + this.randomFloat(-roughness, roughness);
    }
    if (midY > y1) {
      terrain[y1][midX] = (terrain[y1][x1] + terrain[y1][x2] + terrain[midY][midX]) / 3 + this.randomFloat(-roughness, roughness);
    }
    if (midY < y2) {
      terrain[y2][midX] = (terrain[y2][x1] + terrain[y2][x2] + terrain[midY][midX]) / 3 + this.randomFloat(-roughness, roughness);
    }
    
    // Recursive calls
    this.generateTerrainRecursive(terrain, x1, y1, midX, midY, roughness * 0.5);
    this.generateTerrainRecursive(terrain, midX, y1, x2, midY, roughness * 0.5);
    this.generateTerrainRecursive(terrain, x1, midY, midX, y2, roughness * 0.5);
    this.generateTerrainRecursive(terrain, midX, midY, x2, y2, roughness * 0.5);
  }
}

// Export default instance
export default seededRNG;
