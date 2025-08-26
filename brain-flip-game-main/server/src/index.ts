import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { BattleService } from './services/BattleService';
import { RoomService } from './services/RoomService';
import { PlayerService } from './services/PlayerService';
import { GameService } from './services/GameService';
import { Logger } from './utils/Logger';
import { DatabaseService } from './services/DatabaseService';
import { RateLimiter } from './middleware/RateLimiter';
import { AuthMiddleware } from './middleware/AuthMiddleware';

// Load environment variables
dotenv.config();

class BattleServer {
  private app: express.Application;
  private server: any;
  private io: Server;
  private battleService: BattleService;
  private roomService: RoomService;
  private playerService: PlayerService;
  private gameService: GameService;
  private databaseService: DatabaseService;
  private logger: Logger;
  private port: number;

  constructor() {
    this.port = parseInt(process.env.PORT || '3001');
    this.logger = new Logger();
    this.app = express();
    this.server = createServer(this.app);
    this.io = new Server(this.server, {
      cors: {
        origin: process.env.CLIENT_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    this.initializeServices();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupSocketHandlers();
    this.startServer();
  }

  private async initializeServices(): Promise<void> {
    try {
      // Initialize database connection
      this.databaseService = new DatabaseService();
      await this.databaseService.connect();

      // Initialize game services
      this.battleService = new BattleService(this.io, this.databaseService);
      this.roomService = new RoomService(this.io, this.databaseService);
      this.playerService = new PlayerService(this.databaseService);
      this.gameService = new GameService(this.io, this.databaseService);

      this.logger.info('All services initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize services:', error);
      process.exit(1);
    }
  }

  private setupMiddleware(): void {
    // Security middleware
    this.app.use(helmet());
    this.app.use(cors({
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      credentials: true
    }));

    // Performance middleware
    this.app.use(compression());
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Logging middleware
    this.app.use(morgan('combined'));

    // Rate limiting
    this.app.use(RateLimiter.createLimiter());

    // Authentication middleware for protected routes
    this.app.use('/api/battle', AuthMiddleware.verifyToken);
  }

  private setupRoutes(): void {
    // Health check
    this.app.get('/health', (req, res) => {
      res.status(200).json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      });
    });

    // Battle API routes
    this.app.get('/api/battle/stats', async (req, res) => {
      try {
        const stats = await this.battleService.getBattleStats();
        res.json(stats);
      } catch (error) {
        this.logger.error('Error getting battle stats:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    // Error handling middleware
    this.app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      this.logger.error('Unhandled error:', err);
      res.status(500).json({ error: 'Internal server error' });
    });
  }

  private setupSocketHandlers(): void {
    // Connection handling
    this.io.on('connection', (socket) => {
      this.logger.info(`Player connected: ${socket.id}`);

      // Handle room creation
      socket.on('create_room', async (data) => {
        try {
          const room = await this.roomService.createRoom(data, socket.id);
          socket.join(room.id);
          socket.emit('room_created', room);
          this.logger.info(`Room created: ${room.id} by ${socket.id}`);
        } catch (error) {
          this.logger.error('Error creating room:', error);
          socket.emit('error', { message: 'Failed to create room' });
        }
      });

      // Handle room joining
      socket.on('join_room', async (data) => {
        try {
          const result = await this.roomService.joinRoom(data.roomId, data.player, socket.id);
          if (result.success) {
            socket.join(data.roomId);
            socket.emit('room_joined', result.room);
            socket.to(data.roomId).emit('player_joined', result.player);
            this.logger.info(`Player ${result.player.username} joined room ${data.roomId}`);
          } else {
            socket.emit('error', { message: result.error });
          }
        } catch (error) {
          this.logger.error('Error joining room:', error);
          socket.emit('error', { message: 'Failed to join room' });
        }
      });

      // Handle ready signal
      socket.on('ready_signal', async (data) => {
        try {
          const result = await this.roomService.setPlayerReady(data.roomId, data.playerId);
          if (result.success) {
            socket.to(data.roomId).emit('player_ready', { playerId: data.playerId });
            
            // Check if all players are ready
            if (result.allReady) {
              this.io.to(data.roomId).emit('all_players_ready');
              // Start countdown
              setTimeout(() => {
                this.gameService.startBattle(data.roomId);
              }, 3000);
            }
          }
        } catch (error) {
          this.logger.error('Error setting player ready:', error);
        }
      });

      // Handle answer submission
      socket.on('submit_answer', async (data) => {
        try {
          const result = await this.gameService.submitAnswer(
            data.roomId, 
            data.playerId, 
            data.answer, 
            data.reactionTime
          );
          
          if (result.success) {
            // Broadcast to all players in room
            this.io.to(data.roomId).emit('answer_submitted', {
              playerId: data.playerId,
              answer: data.answer,
              isCorrect: result.isCorrect,
              score: result.score,
              streak: result.streak
            });

            // Check if round should end
            if (result.roundEnded) {
              this.gameService.endRound(data.roomId);
            }
          }
        } catch (error) {
          this.logger.error('Error submitting answer:', error);
        }
      });

      // Handle power-up activation
      socket.on('activate_powerup', async (data) => {
        try {
          const result = await this.gameService.activatePowerUp(
            data.roomId,
            data.playerId,
            data.powerUpType
          );
          
          if (result.success) {
            this.io.to(data.roomId).emit('powerup_activated', {
              playerId: data.playerId,
              powerUpType: data.powerUpType,
              effect: result.effect
            });
          }
        } catch (error) {
          this.logger.error('Error activating power-up:', error);
        }
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        this.logger.info(`Player disconnected: ${socket.id}`);
        this.playerService.handleDisconnect(socket.id);
      });
    });
  }

  private startServer(): void {
    this.server.listen(this.port, () => {
      this.logger.info(`🚀 Battle Server running on port ${this.port}`);
      this.logger.info(`📡 WebSocket server ready for connections`);
      this.logger.info(`🔒 Security middleware enabled`);
      this.logger.info(`⚡ Performance optimizations active`);
    });
  }

  // Graceful shutdown
  public async shutdown(): Promise<void> {
    this.logger.info('Shutting down battle server...');
    
    // Close all socket connections
    this.io.close();
    
    // Close database connections
    if (this.databaseService) {
      await this.databaseService.disconnect();
    }
    
    // Close HTTP server
    this.server.close(() => {
      this.logger.info('Battle server shutdown complete');
      process.exit(0);
    });
  }
}

// Start the server
const battleServer = new BattleServer();

// Handle graceful shutdown
process.on('SIGTERM', () => battleServer.shutdown());
process.on('SIGINT', () => battleServer.shutdown());

export default battleServer;
