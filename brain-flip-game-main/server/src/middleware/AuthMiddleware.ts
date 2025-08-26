import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Logger } from '../utils/Logger';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
    email?: string;
    role: string;
    permissions: string[];
  };
}

export class AuthMiddleware {
  private static logger: Logger = new Logger();
  private static readonly JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
  private static readonly JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

  /**
   * Verify JWT token from request
   */
  public static verifyToken(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
    try {
      const token = this.extractToken(req);
      
      if (!token) {
        this.logger.warn('No token provided', { path: req.path, ip: req.ip });
        return res.status(401).json({
          error: 'Access denied',
          message: 'No token provided'
        });
      }

      try {
        const decoded = jwt.verify(token, this.JWT_SECRET) as any;
        
        // Add user info to request
        req.user = {
          id: decoded.id,
          username: decoded.username,
          email: decoded.email,
          role: decoded.role || 'user',
          permissions: decoded.permissions || []
        };

        this.logger.debug('Token verified successfully', {
          userId: decoded.id,
          username: decoded.username,
          path: req.path
        });

        next();
      } catch (jwtError: any) {
        if (jwtError.name === 'TokenExpiredError') {
          this.logger.warn('Token expired', { path: req.path, ip: req.ip });
          return res.status(401).json({
            error: 'Token expired',
            message: 'Please login again'
          });
        } else if (jwtError.name === 'JsonWebTokenError') {
          this.logger.warn('Invalid token', { path: req.path, ip: req.ip });
          return res.status(401).json({
            error: 'Invalid token',
            message: 'Please provide a valid token'
          });
        } else {
          this.logger.error('JWT verification error', { error: jwtError.message });
          return res.status(401).json({
            error: 'Authentication failed',
            message: 'Token verification failed'
          });
        }
      }
    } catch (error) {
      this.logger.error('Auth middleware error:', error);
      return res.status(500).json({
        error: 'Internal server error',
        message: 'Authentication service unavailable'
      });
    }
  }

  /**
   * Verify token for WebSocket connections
   */
  public static verifyWebSocketToken(socket: any, next: any): void {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization;
      
      if (!token) {
        this.logger.warn('No token provided for WebSocket connection', {
          socketId: socket.id,
          ip: socket.handshake.address
        });
        return next(new Error('Authentication required'));
      }

      try {
        const cleanToken = this.cleanToken(token);
        const decoded = jwt.verify(cleanToken, this.JWT_SECRET) as any;
        
        // Add user info to socket
        socket.user = {
          id: decoded.id,
          username: decoded.username,
          email: decoded.email,
          role: decoded.role || 'user',
          permissions: decoded.permissions || []
        };

        this.logger.debug('WebSocket token verified', {
          userId: decoded.id,
          username: decoded.username,
          socketId: socket.id
        });

        next();
      } catch (jwtError: any) {
        if (jwtError.name === 'TokenExpiredError') {
          this.logger.warn('WebSocket token expired', { socketId: socket.id });
          return next(new Error('Token expired'));
        } else {
          this.logger.warn('Invalid WebSocket token', { socketId: socket.id });
          return next(new Error('Invalid token'));
        }
      }
    } catch (error) {
      this.logger.error('WebSocket auth middleware error:', error);
      return next(new Error('Authentication failed'));
    }
  }

  /**
   * Check if user has required role
   */
  public static requireRole(role: string | string[]): (req: AuthenticatedRequest, res: Response, next: NextFunction) => void {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      if (!req.user) {
        return res.status(401).json({
          error: 'Authentication required',
          message: 'Please login to access this resource'
        });
      }

      const requiredRoles = Array.isArray(role) ? role : [role];
      
      if (!requiredRoles.includes(req.user.role)) {
        this.logger.warn('Insufficient role access', {
          userId: req.user.id,
          username: req.user.username,
          userRole: req.user.role,
          requiredRoles,
          path: req.path
        });

        return res.status(403).json({
          error: 'Insufficient permissions',
          message: `Role '${req.user.role}' is not authorized to access this resource`
        });
      }

      next();
    };
  }

  /**
   * Check if user has required permission
   */
  public static requirePermission(permission: string | string[]): (req: AuthenticatedRequest, res: Response, next: NextFunction) => void {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      if (!req.user) {
        return res.status(401).json({
          error: 'Authentication required',
          message: 'Please login to access this resource'
        });
      }

      const requiredPermissions = Array.isArray(permission) ? permission : [permission];
      
      const hasPermission = requiredPermissions.some(perm => 
        req.user!.permissions.includes(perm)
      );

      if (!hasPermission) {
        this.logger.warn('Insufficient permission access', {
          userId: req.user.id,
          username: req.user.username,
          userPermissions: req.user.permissions,
          requiredPermissions,
          path: req.path
        });

        return res.status(403).json({
          error: 'Insufficient permissions',
          message: 'You do not have permission to access this resource'
        });
      }

      next();
    };
  }

  /**
   * Check if user is the owner of the resource or has admin role
   */
  public static requireOwnershipOrRole(resourceOwnerId: string, adminRole: string = 'admin'): (req: AuthenticatedRequest, res: Response, next: NextFunction) => void {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      if (!req.user) {
        return res.status(401).json({
          error: 'Authentication required',
          message: 'Please login to access this resource'
        });
      }

      // Allow if user is admin
      if (req.user.role === adminRole) {
        return next();
      }

      // Allow if user owns the resource
      if (req.user.id === resourceOwnerId) {
        return next();
      }

      this.logger.warn('Resource ownership check failed', {
        userId: req.user.id,
        username: req.user.username,
        resourceOwnerId,
        path: req.path
      });

      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only access your own resources'
      });
    };
  }

  /**
   * Optional authentication - doesn't fail if no token, but adds user info if present
   */
  public static optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
    try {
      const token = this.extractToken(req);
      
      if (token) {
        try {
          const decoded = jwt.verify(token, this.JWT_SECRET) as any;
          
          req.user = {
            id: decoded.id,
            username: decoded.username,
            email: decoded.email,
            role: decoded.role || 'user',
            permissions: decoded.permissions || []
          };

          this.logger.debug('Optional auth token verified', {
            userId: decoded.id,
            username: decoded.username
          });
        } catch (jwtError) {
          // Token is invalid, but we don't fail the request
          this.logger.debug('Optional auth token invalid, continuing without user', {
            error: jwtError instanceof Error ? jwtError.message : 'Unknown error'
          });
        }
      }

      next();
    } catch (error) {
      this.logger.error('Optional auth middleware error:', error);
      next();
    }
  }

  /**
   * Generate JWT token for user
   */
  public static generateToken(userData: {
    id: string;
    username: string;
    email?: string;
    role?: string;
    permissions?: string[];
  }): string {
    const payload = {
      id: userData.id,
      username: userData.username,
      email: userData.email,
      role: userData.role || 'user',
      permissions: userData.permissions || [],
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // 24 hours
    };

    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN
    });
  }

  /**
   * Verify and decode token without middleware
   */
  public static verifyTokenDirectly(token: string): any {
    try {
      const cleanToken = this.cleanToken(token);
      return jwt.verify(cleanToken, this.JWT_SECRET);
    } catch (error) {
      this.logger.error('Direct token verification failed:', error);
      return null;
    }
  }

  /**
   * Refresh token if it's close to expiring
   */
  public static refreshTokenIfNeeded(token: string, thresholdMinutes: number = 30): string | null {
    try {
      const decoded = jwt.decode(token) as any;
      
      if (!decoded || !decoded.exp) {
        return null;
      }

      const now = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = decoded.exp - now;
      const thresholdSeconds = thresholdMinutes * 60;

      if (timeUntilExpiry <= thresholdSeconds) {
        // Token is close to expiring, generate new one
        const newToken = this.generateToken({
          id: decoded.id,
          username: decoded.username,
          email: decoded.email,
          role: decoded.role,
          permissions: decoded.permissions
        });

        this.logger.info('Token refreshed', {
          userId: decoded.id,
          username: decoded.username,
          timeUntilExpiry
        });

        return newToken;
      }

      return null;
    } catch (error) {
      this.logger.error('Token refresh check failed:', error);
      return null;
    }
  }

  /**
   * Extract token from request
   */
  private static extractToken(req: Request): string | null {
    // Check Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // Check query parameter
    if (req.query.token && typeof req.query.token === 'string') {
      return req.query.token;
    }

    // Check body
    if (req.body && req.body.token) {
      return req.body.token;
    }

    // Check cookies
    if (req.cookies && req.cookies.token) {
      return req.cookies.token;
    }

    return null;
  }

  /**
   * Clean token string
   */
  private static cleanToken(token: string): string {
    return token.replace(/^Bearer\s+/i, '').trim();
  }

  /**
   * Get token expiration time
   */
  public static getTokenExpiration(token: string): Date | null {
    try {
      const decoded = jwt.decode(token) as any;
      if (decoded && decoded.exp) {
        return new Date(decoded.exp * 1000);
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if token is expired
   */
  public static isTokenExpired(token: string): boolean {
    const expiration = this.getTokenExpiration(token);
    if (!expiration) return true;
    
    return expiration < new Date();
  }

  /**
   * Get token payload without verification
   */
  public static getTokenPayload(token: string): any {
    try {
      return jwt.decode(token);
    } catch (error) {
      return null;
    }
  }

  /**
   * Blacklist token (for logout)
   */
  public static blacklistToken(token: string): void {
    // In a production environment, you would store this in Redis or database
    // For now, we'll just log it
    this.logger.info('Token blacklisted', {
      token: token.substring(0, 20) + '...'
    });
  }

  /**
   * Check if token is blacklisted
   */
  public static isTokenBlacklisted(token: string): boolean {
    // In a production environment, you would check Redis or database
    // For now, we'll return false
    return false;
  }
}

// Export middleware functions for easy use
export const requireAuth = AuthMiddleware.verifyToken;
export const requireRole = AuthMiddleware.requireRole;
export const requirePermission = AuthMiddleware.requirePermission;
export const requireOwnershipOrRole = AuthMiddleware.requireOwnershipOrRole;
export const optionalAuth = AuthMiddleware.optionalAuth;
export const verifyWebSocketToken = AuthMiddleware.verifyWebSocketToken;
