import { Request, Response, NextFunction } from 'express';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import Redis from 'redis';
import { Logger } from '../utils/Logger';

export class RateLimiter {
  private static redisClient: Redis.RedisClientType;
  private static rateLimiters: Map<string, RateLimiterRedis> = new Map();
  private static logger: Logger = new Logger();

  /**
   * Initialize Redis client for rate limiting
   */
  public static async initialize(): Promise<void> {
    try {
      this.redisClient = Redis.createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379'
      });

      await this.redisClient.connect();
      this.logger.info('Rate limiter Redis client initialized');
    } catch (error) {
      this.logger.error('Failed to initialize rate limiter Redis client:', error);
      throw error;
    }
  }

  /**
   * Create rate limiter for different endpoints
   */
  public static createLimiter(): (req: Request, res: Response, next: NextFunction) => void {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const endpoint = req.path;
        const clientId = this.getClientId(req);
        
        // Get or create rate limiter for this endpoint
        const limiter = this.getRateLimiter(endpoint);
        
        // Check rate limit
        await limiter.consume(clientId);
        
        // Add rate limit headers
        res.setHeader('X-RateLimit-Limit', limiter.points);
        res.setHeader('X-RateLimit-Remaining', 'dynamic');
        res.setHeader('X-RateLimit-Reset', 'dynamic');
        
        next();
      } catch (error: any) {
        if (error instanceof Error && error.message.includes('Rate limit exceeded')) {
          const retryAfter = Math.ceil(error.msBeforeNext / 1000);
          
          res.setHeader('Retry-After', retryAfter);
          res.setHeader('X-RateLimit-Reset', new Date(Date.now() + error.msBeforeNext).toISOString());
          
          this.logger.warn(`Rate limit exceeded for ${req.path}`, {
            clientId: this.getClientId(req),
            endpoint: req.path,
            retryAfter
          });
          
          return res.status(429).json({
            error: 'Rate limit exceeded',
            message: 'Too many requests, please try again later',
            retryAfter,
            endpoint: req.path
          });
        }
        
        this.logger.error('Rate limiter error:', error);
        next();
      }
    };
  }

  /**
   * Create specific rate limiter for battle endpoints
   */
  public static createBattleRateLimiter(): (req: Request, res: Response, next: NextFunction) => void {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const clientId = this.getClientId(req);
        const limiter = this.getRateLimiter('battle', {
          points: 100,        // 100 requests
          duration: 60,       // per minute
          blockDuration: 300  // block for 5 minutes if exceeded
        });
        
        await limiter.consume(clientId);
        next();
      } catch (error: any) {
        if (error instanceof Error && error.message.includes('Rate limit exceeded')) {
          const retryAfter = Math.ceil(error.msBeforeNext / 1000);
          
          res.setHeader('Retry-After', retryAfter);
          
          this.logger.warn(`Battle rate limit exceeded`, {
            clientId: this.getClientId(req),
            endpoint: req.path,
            retryAfter
          });
          
          return res.status(429).json({
            error: 'Battle rate limit exceeded',
            message: 'Too many battle requests, please wait before trying again',
            retryAfter
          });
        }
        
        this.logger.error('Battle rate limiter error:', error);
        next();
      }
    };
  }

  /**
   * Create rate limiter for WebSocket connections
   */
  public static createWebSocketRateLimiter(): (socket: any, next: any) => void {
    return async (socket: any, next: any) => {
      try {
        const clientId = socket.handshake.address || socket.id;
        const limiter = this.getRateLimiter('websocket', {
          points: 10,         // 10 connections
          duration: 60,       // per minute
          blockDuration: 600  // block for 10 minutes if exceeded
        });
        
        await limiter.consume(clientId);
        next();
      } catch (error: any) {
        if (error instanceof Error && error.message.includes('Rate limit exceeded')) {
          this.logger.warn(`WebSocket rate limit exceeded`, {
            clientId: socket.handshake.address || socket.id,
            retryAfter: Math.ceil(error.msBeforeNext / 1000)
          });
          
          return next(new Error('Connection rate limit exceeded'));
        }
        
        this.logger.error('WebSocket rate limiter error:', error);
        next();
      }
    };
  }

  /**
   * Create rate limiter for authentication endpoints
   */
  public static createAuthRateLimiter(): (req: Request, res: Response, next: NextFunction) => void {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const clientId = this.getClientId(req);
        const limiter = this.getRateLimiter('auth', {
          points: 5,          // 5 attempts
          duration: 300,      // per 5 minutes
          blockDuration: 900  // block for 15 minutes if exceeded
        });
        
        await limiter.consume(clientId);
        next();
      } catch (error: any) {
        if (error instanceof Error && error.message.includes('Rate limit exceeded')) {
          const retryAfter = Math.ceil(error.msBeforeNext / 1000);
          
          res.setHeader('Retry-After', retryAfter);
          
          this.logger.warn(`Authentication rate limit exceeded`, {
            clientId: this.getClientId(req),
            endpoint: req.path,
            retryAfter
          });
          
          return res.status(429).json({
            error: 'Authentication rate limit exceeded',
            message: 'Too many authentication attempts, please wait before trying again',
            retryAfter
          });
        }
        
        this.logger.error('Auth rate limiter error:', error);
        next();
      }
    };
  }

  /**
   * Get or create rate limiter for specific endpoint
   */
  private static getRateLimiter(endpoint: string, options?: {
    points: number;
    duration: number;
    blockDuration: number;
  }): RateLimiterRedis {
    const key = `rate_limiter:${endpoint}`;
    
    if (!this.rateLimiters.has(key)) {
      const defaultOptions = {
        points: 100,        // 100 requests
        duration: 60,       // per minute
        blockDuration: 300  // block for 5 minutes if exceeded
      };
      
      const config = { ...defaultOptions, ...options };
      
      const limiter = new RateLimiterRedis({
        storeClient: this.redisClient,
        keyPrefix: key,
        points: config.points,
        duration: config.duration,
        blockDuration: config.blockDuration,
        inmemoryBlockOnConsumed: config.points,
        inmemoryBlockDuration: config.blockDuration,
        insuranceLimiter: this.createInsuranceLimiter(config)
      });
      
      this.rateLimiters.set(key, limiter);
      this.logger.info(`Rate limiter created for ${endpoint}`, config);
    }
    
    return this.rateLimiters.get(key)!;
  }

  /**
   * Create insurance limiter as fallback
   */
  private static createInsuranceLimiter(config: any): RateLimiterRedis {
    return new RateLimiterRedis({
      storeClient: this.redisClient,
      keyPrefix: 'insurance',
      points: config.points * 2,
      duration: config.duration * 2,
      blockDuration: config.blockDuration * 2
    });
  }

  /**
   * Get client identifier from request
   */
  private static getClientId(req: Request): string {
    // Try to get from various sources
    const clientId = 
      req.headers['x-forwarded-for'] ||
      req.headers['x-real-ip'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.ip ||
      'unknown';
    
    return Array.isArray(clientId) ? clientId[0] : clientId;
  }

  /**
   * Reset rate limit for specific client
   */
  public static async resetRateLimit(endpoint: string, clientId: string): Promise<void> {
    try {
      const key = `rate_limiter:${endpoint}`;
      const limiter = this.rateLimiters.get(key);
      
      if (limiter) {
        await limiter.delete(clientId);
        this.logger.info(`Rate limit reset for ${clientId} on ${endpoint}`);
      }
    } catch (error) {
      this.logger.error('Error resetting rate limit:', error);
    }
  }

  /**
   * Get rate limit status for client
   */
  public static async getRateLimitStatus(endpoint: string, clientId: string): Promise<any> {
    try {
      const key = `rate_limiter:${endpoint}`;
      const limiter = this.rateLimiters.get(key);
      
      if (limiter) {
        const res = await limiter.get(clientId);
        return {
          remaining: res.remainingPoints,
          total: res.totalPoints,
          resetTime: new Date(Date.now() + res.msBeforeNext),
          isBlocked: res.isBlocked
        };
      }
      
      return null;
    } catch (error) {
      this.logger.error('Error getting rate limit status:', error);
      return null;
    }
  }

  /**
   * Update rate limit configuration
   */
  public static updateRateLimitConfig(endpoint: string, config: {
    points: number;
    duration: number;
    blockDuration: number;
  }): void {
    const key = `rate_limiter:${endpoint}`;
    
    // Remove existing limiter
    if (this.rateLimiters.has(key)) {
      this.rateLimiters.delete(key);
    }
    
    // Create new limiter with updated config
    this.getRateLimiter(endpoint, config);
    
    this.logger.info(`Rate limit configuration updated for ${endpoint}`, config);
  }

  /**
   * Get all rate limiters status
   */
  public static getRateLimitersStatus(): any[] {
    const status = [];
    
    for (const [key, limiter] of this.rateLimiters) {
      status.push({
        endpoint: key.replace('rate_limiter:', ''),
        points: limiter.points,
        duration: limiter.duration,
        blockDuration: limiter.blockDuration
      });
    }
    
    return status;
  }

  /**
   * Clean up rate limiters
   */
  public static async cleanup(): Promise<void> {
    try {
      // Clear all rate limiters
      this.rateLimiters.clear();
      
      // Close Redis connection
      if (this.redisClient) {
        await this.redisClient.quit();
      }
      
      this.logger.info('Rate limiters cleaned up');
    } catch (error) {
      this.logger.error('Error cleaning up rate limiters:', error);
    }
  }
}

// Export middleware functions for easy use
export const rateLimiter = RateLimiter.createLimiter();
export const battleRateLimiter = RateLimiter.createBattleRateLimiter();
export const authRateLimiter = RateLimiter.createAuthRateLimiter();
export const websocketRateLimiter = RateLimiter.createWebSocketRateLimiter();
