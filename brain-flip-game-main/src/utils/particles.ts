/**
 * Particle System Utilities
 * 
 * High-performance particle system for visual effects with memory management,
 * GPU optimization, and reduced motion support.
 */

export interface ParticleConfig {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  rotation?: number;
  rotationSpeed?: number;
  gravity?: number;
  friction?: number;
  alpha?: number;
  alphaDecay?: number;
  scaleDecay?: number;
}

export interface EmissionConfig {
  x: number;
  y: number;
  count: number;
  color: string | string[];
  type: 'burst' | 'confetti' | 'stars' | 'trail' | 'explosion';
  speed?: { min: number; max: number };
  size?: { min: number; max: number };
  life?: { min: number; max: number };
  angle?: { min: number; max: number };
  gravity?: number;
  friction?: number;
}

export class Particle {
  public id: string;
  public x: number;
  public y: number;
  public vx: number;
  public vy: number;
  public life: number;
  public maxLife: number;
  public color: string;
  public size: number;
  public rotation: number;
  public rotationSpeed: number;
  public gravity: number;
  public friction: number;
  public alpha: number;
  public alphaDecay: number;
  public scaleDecay: number;
  public scale: number;

  constructor(config: ParticleConfig & { id: string }) {
    this.id = config.id;
    this.x = config.x;
    this.y = config.y;
    this.vx = config.vx;
    this.vy = config.vy;
    this.life = config.life;
    this.maxLife = config.maxLife;
    this.color = config.color;
    this.size = config.size;
    this.rotation = config.rotation || 0;
    this.rotationSpeed = config.rotationSpeed || 0;
    this.gravity = config.gravity || 0.2;
    this.friction = config.friction || 0.99;
    this.alpha = config.alpha || 1;
    this.alphaDecay = config.alphaDecay || 0.02;
    this.scaleDecay = config.scaleDecay || 0.01;
    this.scale = 1;
  }

  update(deltaTime: number): boolean {
    // Update position
    this.x += this.vx * deltaTime;
    this.y += this.vy * deltaTime;

    // Apply physics
    this.vy += this.gravity * deltaTime;
    this.vx *= this.friction;
    this.vy *= this.friction;

    // Update rotation
    this.rotation += this.rotationSpeed * deltaTime;

    // Update life and visual properties
    this.life -= deltaTime;
    this.alpha = Math.max(0, this.alpha - this.alphaDecay * deltaTime);
    this.scale = Math.max(0, this.scale - this.scaleDecay * deltaTime);

    // Return false if particle should be removed
    return this.life > 0 && this.alpha > 0.01 && this.scale > 0.01;
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (this.alpha <= 0 || this.scale <= 0) return;

    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.scale(this.scale, this.scale);

    // Set color
    ctx.fillStyle = this.color;
    ctx.strokeStyle = this.color;

    // Draw particle (circle by default)
    ctx.beginPath();
    ctx.arc(0, 0, this.size, 0, Math.PI * 2);
    ctx.fill();

    // Add glow effect
    ctx.shadowColor = this.color;
    ctx.shadowBlur = this.size * 2;
    ctx.fill();

    ctx.restore();
  }
}

export class ParticleSystem {
  private particles: Particle[] = [];
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private animationFrame: number | null = null;
  private lastTime: number = 0;
  private maxParticles: number = 500;
  private isRunning: boolean = false;

  constructor(canvas?: HTMLCanvasElement, maxParticles: number = 500) {
    this.maxParticles = maxParticles;
    if (canvas) {
      this.setCanvas(canvas);
    }
  }

  setCanvas(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    
    if (this.ctx) {
      // Optimize canvas for performance
      this.ctx.imageSmoothingEnabled = true;
      this.ctx.imageSmoothingQuality = 'high';
    }
  }

  emit(config: EmissionConfig): void {
    if (!this.ctx || this.particles.length >= this.maxParticles) return;

    for (let i = 0; i < config.count; i++) {
      if (this.particles.length >= this.maxParticles) break;
        id: `particle-${Date.now()}-${i}`,
        x: config.x,
        y: config.y,
        vx: Math.cos(particleAngle) * particleSpeed,
        vy: Math.sin(particleAngle) * particleSpeed,
        life: particleLife,
        maxLife: particleLife,
        color: particleColor,
        size: particleSize,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.1,
        gravity: config.gravity || this.getGravityForType(config.type),
        friction: config.friction || this.getFrictionForType(config.type),
        alphaDecay: this.getAlphaDecayForType(config.type),
        scaleDecay: this.getScaleDecayForType(config.type)
      });

      this.particles.push(particle);
    }

    // Start animation loop if not running
    if (!this.isRunning) {
      this.start();
    }
  }

  private getEmissionAngle(
    type: EmissionConfig['type'], 
    index: number, 
    total: number, 
    angleRange: { min: number; max: number }
  ): number {
    switch (type) {
      case 'burst':
        return (Math.PI * 2 * index) / total + Math.random() * 0.5;
      case 'confetti':
        return angleRange.min + Math.random() * (angleRange.max - angleRange.min);
      case 'explosion':
        return (Math.PI * 2 * index) / total;
      case 'stars':
      case 'trail':
      default:
        return angleRange.min + (angleRange.max - angleRange.min) * (index / total);
    }
  }

  private getGravityForType(type: EmissionConfig['type']): number {
    switch (type) {
      case 'confetti': return 0.3;
      case 'explosion': return 0.1;
      case 'stars': return 0.05;
      case 'trail': return 0;
      case 'burst':
      default: return 0.2;
    }
  }

  private getFrictionForType(type: EmissionConfig['type']): number {
    switch (type) {
      case 'trail': return 0.95;
      case 'explosion': return 0.98;
      case 'stars': return 0.99;
      case 'confetti':
      case 'burst':
      default: return 0.99;
    }
  }

  private getAlphaDecayForType(type: EmissionConfig['type']): number {
    switch (type) {
      case 'trail': return 0.05;
      case 'explosion': return 0.03;
      case 'stars': return 0.01;
      case 'confetti':
      case 'burst':
      default: return 0.02;
    }
  }

  private getScaleDecayForType(type: EmissionConfig['type']): number {
    switch (type) {
      case 'explosion': return 0.02;
      case 'trail': return 0.03;
      case 'stars': return 0.005;
      case 'confetti':
      case 'burst':
      default: return 0.01;
    }
  }

  private lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  }

  update(currentTime: number): void {
    if (!this.ctx) return;
    this.lastTime = currentTime;

    // Update particles
    this.particles = this.particles.filter(particle => particle.update(deltaTime));

    // Stop animation if no particles
    if (this.particles.length === 0 && this.isRunning) {
      this.stop();
    }
  }

  render(): void {
    if (!this.ctx || !this.canvas) return;

    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Render particles
    for (const particle of this.particles) {
      particle.render(this.ctx);
    }
  }

  private animate = (currentTime: number): void => {
    this.update(currentTime);
    this.render();

    if (this.isRunning) {
      this.animationFrame = requestAnimationFrame(this.animate);
    }
  };

  start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.lastTime = 0;
    this.animationFrame = requestAnimationFrame(this.animate);
  }

  stop(): void {
    this.isRunning = false;
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  clear(): void {
    this.particles = [];
    if (this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  destroy(): void {
    this.stop();
    this.clear();
    this.canvas = null;
    this.ctx = null;
  }

  // Getters
  get particleCount(): number {
    return this.particles.length;
  }

  get isActive(): boolean {
    return this.isRunning;
  }

  // Performance monitoring
  getPerformanceMetrics() {
    return {
      particleCount: this.particles.length,
      maxParticles: this.maxParticles,
      isRunning: this.isRunning,
      memoryUsage: this.particles.length * 200 // Rough estimate in bytes
    };
  }
}

/**
 * Preset particle configurations for common effects
 */
export const particlePresets = {
  success: {
    type: 'burst' as const,
    count: 8,
    color: ['#10b981', '#34d399', '#6ee7b7'],
    speed: { min: 2, max: 5 },
    size: { min: 2, max: 4 },
    life: { min: 800, max: 1200 }
  },

  failure: {
    type: 'burst' as const,
    count: 4,
    color: ['#ef4444', '#f87171', '#fca5a5'],
    speed: { min: 1, max: 3 },
    size: { min: 3, max: 5 },
    life: { min: 600, max: 1000 }
  },

  levelUp: {
    type: 'confetti' as const,
    count: 20,
    color: ['#fbbf24', '#f59e0b', '#d97706', '#3b82f6', '#1d4ed8'],
    speed: { min: 3, max: 7 },
    size: { min: 3, max: 6 },
    life: { min: 1500, max: 2500 },
    angle: { min: -Math.PI / 4, max: -3 * Math.PI / 4 }
  },

  streakBonus: {
    type: 'stars' as const,
    count: 12,
    color: ['#ec4899', '#f472b6', '#f9a8d4'],
    speed: { min: 1, max: 4 },
    size: { min: 2, max: 5 },
    life: { min: 1000, max: 1800 }
  },

  perfectTiming: {
    type: 'explosion' as const,
    count: 16,
    color: ['#fbbf24', '#f59e0b', '#ffffff'],
    speed: { min: 2, max: 6 },
    size: { min: 3, max: 7 },
    life: { min: 1200, max: 2000 }
  }
};

/**
 * Create a particle system instance with automatic canvas management
 */
export function createParticleSystem(
  container: HTMLElement,
  maxParticles: number = 500
): ParticleSystem {
  canvas.style.position = 'absolute';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '1000';
  
  // Set canvas size
    canvas.width = rect.width;
    canvas.height = rect.height;
  };

  updateCanvasSize();
  container.appendChild(canvas);

  // Handle resize
  resizeObserver.observe(container);

  // Cleanup function
    resizeObserver.disconnect();
    particleSystem.destroy();
    if (canvas.parentNode) {
      canvas.parentNode.removeChild(canvas);
    }
  };

  // Add cleanup to particle system
  (particleSystem as any).cleanup = cleanup;

  return particleSystem;
}