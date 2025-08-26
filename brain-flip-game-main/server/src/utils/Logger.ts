import winston from 'winston';
import path from 'path';

export class Logger {
  private logger: winston.Logger;

  constructor() {
    // Create logs directory if it doesn't exist
    const logsDir = path.join(process.cwd(), 'logs');
    
    // Define log format
    const logFormat = winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.errors({ stack: true }),
      winston.format.json()
    );

    // Define console format for development
    const consoleFormat = winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp({ format: 'HH:mm:ss' }),
      winston.format.printf(({ timestamp, level, message, ...meta }) => {
        let metaStr = '';
        if (Object.keys(meta).length > 0) {
          metaStr = JSON.stringify(meta, null, 2);
        }
        return `${timestamp} [${level}]: ${message} ${metaStr}`;
      })
    );

    // Create logger instance
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: logFormat,
      defaultMeta: { service: 'battle-server' },
      transports: [
        // Console transport for development
        new winston.transports.Console({
          format: consoleFormat,
          level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug'
        }),
        
        // File transport for all logs
        new winston.transports.File({
          filename: path.join(logsDir, 'combined.log'),
          maxsize: 5242880, // 5MB
          maxFiles: 5,
          tailable: true
        }),
        
        // File transport for error logs
        new winston.transports.File({
          filename: path.join(logsDir, 'error.log'),
          level: 'error',
          maxsize: 5242880, // 5MB
          maxFiles: 5,
          tailable: true
        }),
        
        // File transport for battle-specific logs
        new winston.transports.File({
          filename: path.join(logsDir, 'battle.log'),
          level: 'info',
          maxsize: 5242880, // 5MB
          maxFiles: 10,
          tailable: true
        })
      ],
      
      // Handle uncaught exceptions
      exceptionHandlers: [
        new winston.transports.File({
          filename: path.join(logsDir, 'exceptions.log'),
          maxsize: 5242880, // 5MB
          maxFiles: 5
        })
      ],
      
      // Handle unhandled rejections
      rejectionHandlers: [
        new winston.transports.File({
          filename: path.join(logsDir, 'rejections.log'),
          maxsize: 5242880, // 5MB
          maxFiles: 5
        })
      ]
    });

    // Add request logging for HTTP requests
    if (process.env.NODE_ENV === 'development') {
      this.logger.add(new winston.transports.Console({
        format: winston.format.simple(),
        level: 'debug'
      }));
    }
  }

  /**
   * Log info message
   */
  public info(message: string, meta?: any): void {
    this.logger.info(message, meta);
  }

  /**
   * Log error message
   */
  public error(message: string, meta?: any): void {
    this.logger.error(message, meta);
  }

  /**
   * Log warning message
   */
  public warn(message: string, meta?: any): void {
    this.logger.warn(message, meta);
  }

  /**
   * Log debug message
   */
  public debug(message: string, meta?: any): void {
    this.logger.debug(message, meta);
  }

  /**
   * Log battle-specific events
   */
  public battle(message: string, meta?: any): void {
    this.logger.info(`[BATTLE] ${message}`, meta);
  }

  /**
   * Log player actions
   */
  public player(playerId: string, action: string, meta?: any): void {
    this.logger.info(`[PLAYER:${playerId}] ${action}`, meta);
  }

  /**
   * Log room events
   */
  public room(roomId: string, event: string, meta?: any): void {
    this.logger.info(`[ROOM:${roomId}] ${event}`, meta);
  }

  /**
   * Log game events
   */
  public game(roomId: string, event: string, meta?: any): void {
    this.logger.info(`[GAME:${roomId}] ${event}`, meta);
  }

  /**
   * Log performance metrics
   */
  public performance(operation: string, duration: number, meta?: any): void {
    this.logger.info(`[PERFORMANCE] ${operation} took ${duration}ms`, meta);
  }

  /**
   * Log security events
   */
  public security(event: string, meta?: any): void {
    this.logger.warn(`[SECURITY] ${event}`, meta);
  }

  /**
   * Log database operations
   */
  public database(operation: string, table: string, meta?: any): void {
    this.logger.debug(`[DATABASE] ${operation} on ${table}`, meta);
  }

  /**
   * Log WebSocket events
   */
  public websocket(event: string, socketId: string, meta?: any): void {
    this.logger.debug(`[WEBSOCKET:${socketId}] ${event}`, meta);
  }

  /**
   * Create a child logger with additional context
   */
  public child(context: Record<string, any>): Logger {
    const childLogger = new Logger();
    childLogger.logger = this.logger.child(context);
    return childLogger;
  }

  /**
   * Get the underlying Winston logger
   */
  public getWinstonLogger(): winston.Logger {
    return this.logger;
  }

  /**
   * Close all transports
   */
  public async close(): Promise<void> {
    await this.logger.end();
  }
}

// Export a default instance
export const logger = new Logger();

// Export log levels for configuration
export const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
  silly: 6
};
