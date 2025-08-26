import { Pool, PoolClient } from 'pg';
import Redis from 'redis';
import { Logger } from '../utils/Logger';
import { BattleRoom, BattlePlayer, BattleStats } from '../types/BattleTypes';

export class DatabaseService {
  private pgPool: Pool;
  private redisClient: Redis.RedisClientType;
  private logger: Logger;
  private isConnected: boolean = false;

  constructor() {
    this.logger = new Logger();
    
    // Initialize PostgreSQL connection pool
    this.pgPool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'brain_flip_battle',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    // Initialize Redis client
    this.redisClient = Redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        connectTimeout: 5000,
        lazyConnect: true,
      },
    });

    // Handle PostgreSQL errors
    this.pgPool.on('error', (err) => {
      this.logger.error('Unexpected error on idle client', err);
      this.isConnected = false;
    });

    // Handle Redis errors
    this.redisClient.on('error', (err) => {
      this.logger.error('Redis error:', err);
    });

    this.redisClient.on('connect', () => {
      this.logger.info('Redis connected');
    });
  }

  /**
   * Connect to databases
   */
  public async connect(): Promise<void> {
    try {
      // Test PostgreSQL connection
      const client = await this.pgPool.connect();
      await client.query('SELECT NOW()');
      client.release();
      
      // Connect to Redis
      await this.redisClient.connect();
      
      this.isConnected = true;
      this.logger.info('Database connections established');
      
      // Initialize database schema
      await this.initializeSchema();
    } catch (error) {
      this.logger.error('Failed to connect to databases:', error);
      throw error;
    }
  }

  /**
   * Disconnect from databases
   */
  public async disconnect(): Promise<void> {
    try {
      await this.pgPool.end();
      await this.redisClient.quit();
      this.isConnected = false;
      this.logger.info('Database connections closed');
    } catch (error) {
      this.logger.error('Error disconnecting from databases:', error);
    }
  }

  /**
   * Initialize database schema
   */
  private async initializeSchema(): Promise<void> {
    try {
      const client = await this.pgPool.connect();
      
      // Create tables if they don't exist
      await client.query(`
        CREATE TABLE IF NOT EXISTS players (
          id VARCHAR(255) PRIMARY KEY,
          username VARCHAR(100) UNIQUE NOT NULL,
          avatar TEXT,
          is_host BOOLEAN DEFAULT FALSE,
          is_ready BOOLEAN DEFAULT FALSE,
          score INTEGER DEFAULT 0,
          lives INTEGER DEFAULT 3,
          streak INTEGER DEFAULT 0,
          total_correct INTEGER DEFAULT 0,
          total_incorrect INTEGER DEFAULT 0,
          average_reaction_time INTEGER DEFAULT 0,
          last_answer_time TIMESTAMP,
          is_alive BOOLEAN DEFAULT TRUE,
          rank INTEGER DEFAULT 1,
          power_ups JSONB DEFAULT '[]',
          achievements JSONB DEFAULT '[]',
          socket_id VARCHAR(255),
          eliminations INTEGER DEFAULT 0,
          win_rate DECIMAL(5,2) DEFAULT 0,
          total_play_time INTEGER DEFAULT 0,
          last_active TIMESTAMP DEFAULT NOW(),
          fastest_answer INTEGER DEFAULT 0,
          perfect_answers INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS rooms (
          id VARCHAR(255) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          max_players INTEGER DEFAULT 4,
          current_players INTEGER DEFAULT 1,
          players JSONB DEFAULT '[]',
          status VARCHAR(50) DEFAULT 'waiting',
          game_mode VARCHAR(100),
          time_limit INTEGER DEFAULT 30000,
          lives_per_player INTEGER DEFAULT 3,
          is_private BOOLEAN DEFAULT FALSE,
          password VARCHAR(255),
          created_at TIMESTAMP DEFAULT NOW(),
          started_at TIMESTAMP,
          ended_at TIMESTAMP,
          winner VARCHAR(255),
          settings JSONB DEFAULT '{}',
          current_round INTEGER DEFAULT 1
        );

        CREATE TABLE IF NOT EXISTS battle_history (
          id SERIAL PRIMARY KEY,
          room_id VARCHAR(255) NOT NULL,
          player_id VARCHAR(255) NOT NULL,
          answer TEXT,
          is_correct BOOLEAN,
          score INTEGER,
          reaction_time INTEGER,
          round_number INTEGER,
          timestamp TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS achievements (
          id VARCHAR(255) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          icon VARCHAR(10),
          rarity VARCHAR(50),
          points INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT NOW()
        );

        -- Create indexes for better performance
        CREATE INDEX IF NOT EXISTS idx_players_username ON players(username);
        CREATE INDEX IF NOT EXISTS idx_players_score ON players(score DESC);
        CREATE INDEX IF NOT EXISTS idx_players_rank ON players(rank);
        CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(status);
        CREATE INDEX IF NOT EXISTS idx_rooms_created_at ON rooms(created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_battle_history_room_id ON battle_history(room_id);
        CREATE INDEX IF NOT EXISTS idx_battle_history_player_id ON battle_history(player_id);
      `);

      client.release();
      this.logger.info('Database schema initialized');
    } catch (error) {
      this.logger.error('Error initializing database schema:', error);
      throw error;
    }
  }

  // Player operations
  public async savePlayer(player: BattlePlayer): Promise<void> {
    try {
      const client = await this.pgPool.connect();
      
      await client.query(`
        INSERT INTO players (
          id, username, avatar, is_host, is_ready, score, lives, streak,
          total_correct, total_incorrect, average_reaction_time, last_answer_time,
          is_alive, rank, power_ups, achievements, socket_id, eliminations,
          win_rate, total_play_time, last_active, fastest_answer, perfect_answers
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
        ON CONFLICT (id) DO UPDATE SET
          username = EXCLUDED.username,
          avatar = EXCLUDED.avatar,
          is_host = EXCLUDED.is_host,
          is_ready = EXCLUDED.is_ready,
          score = EXCLUDED.score,
          lives = EXCLUDED.lives,
          streak = EXCLUDED.streak,
          total_correct = EXCLUDED.total_correct,
          total_incorrect = EXCLUDED.total_incorrect,
          average_reaction_time = EXCLUDED.average_reaction_time,
          last_answer_time = EXCLUDED.last_answer_time,
          is_alive = EXCLUDED.is_alive,
          rank = EXCLUDED.rank,
          power_ups = EXCLUDED.power_ups,
          achievements = EXCLUDED.achievements,
          socket_id = EXCLUDED.socket_id,
          eliminations = EXCLUDED.eliminations,
          win_rate = EXCLUDED.win_rate,
          total_play_time = EXCLUDED.total_play_time,
          last_active = EXCLUDED.last_active,
          fastest_answer = EXCLUDED.fastest_answer,
          perfect_answers = EXCLUDED.perfect_answers,
          updated_at = NOW()
      `, [
        player.id, player.username, player.avatar, player.isHost, player.isReady,
        player.score, player.lives, player.streak, player.totalCorrect,
        player.totalIncorrect, player.averageReactionTime, player.lastAnswerTime,
        player.isAlive, player.rank, JSON.stringify(player.powerUps),
        JSON.stringify(player.achievements), player.socketId, player.eliminations,
        player.winRate, player.totalPlayTime, player.lastActive,
        player.fastestAnswer, player.perfectAnswers
      ]);

      client.release();
      
      // Cache player in Redis
      await this.redisClient.setEx(`player:${player.id}`, 3600, JSON.stringify(player));
    } catch (error) {
      this.logger.error('Error saving player:', error);
      throw error;
    }
  }

  public async getPlayer(playerId: string): Promise<BattlePlayer | null> {
    try {
      // Try Redis first
      const cached = await this.redisClient.get(`player:${playerId}`);
      if (cached) {
        return JSON.parse(cached);
      }

      // Get from PostgreSQL
      const client = await this.pgPool.connect();
      const result = await client.query('SELECT * FROM players WHERE id = $1', [playerId]);
      client.release();

      if (result.rows.length === 0) return null;

      const player = this.mapDbRowToPlayer(result.rows[0]);
      
      // Cache in Redis
      await this.redisClient.setEx(`player:${playerId}`, 3600, JSON.stringify(player));
      
      return player;
    } catch (error) {
      this.logger.error('Error getting player:', error);
      return null;
    }
  }

  public async getPlayerByUsername(username: string): Promise<BattlePlayer | null> {
    try {
      const client = await this.pgPool.connect();
      const result = await client.query('SELECT * FROM players WHERE username = $1', [username]);
      client.release();

      if (result.rows.length === 0) return null;

      const player = this.mapDbRowToPlayer(result.rows[0]);
      
      // Cache in Redis
      await this.redisClient.setEx(`player:${player.id}`, 3600, JSON.stringify(player));
      
      return player;
    } catch (error) {
      this.logger.error('Error getting player by username:', error);
      return null;
    }
  }

  public async updatePlayer(player: BattlePlayer): Promise<void> {
    try {
      const client = await this.pgPool.connect();
      
      await client.query(`
        UPDATE players SET
          username = $2, avatar = $3, is_host = $4, is_ready = $5, score = $6,
          lives = $7, streak = $8, total_correct = $9, total_incorrect = $10,
          average_reaction_time = $11, last_answer_time = $12, is_alive = $13,
          rank = $14, power_ups = $15, achievements = $16, socket_id = $17,
          eliminations = $18, win_rate = $19, total_play_time = $20,
          last_active = $21, fastest_answer = $22, perfect_answers = $23,
          updated_at = NOW()
        WHERE id = $1
      `, [
        player.id, player.username, player.avatar, player.isHost, player.isReady,
        player.score, player.lives, player.streak, player.totalCorrect,
        player.totalIncorrect, player.averageReactionTime, player.lastAnswerTime,
        player.isAlive, player.rank, JSON.stringify(player.powerUps),
        JSON.stringify(player.achievements), player.socketId, player.eliminations,
        player.winRate, player.totalPlayTime, player.lastActive,
        player.fastestAnswer, player.perfectAnswers
      ]);

      client.release();
      
      // Update Redis cache
      await this.redisClient.setEx(`player:${player.id}`, 3600, JSON.stringify(player));
    } catch (error) {
      this.logger.error('Error updating player:', error);
      throw error;
    }
  }

  public async updatePlayerStats(player: BattlePlayer): Promise<void> {
    try {
      const client = await this.pgPool.connect();
      
      await client.query(`
        UPDATE players SET
          score = $2, streak = $3, total_correct = $4, total_incorrect = $5,
          average_reaction_time = $6, fastest_answer = $7, perfect_answers = $8,
          eliminations = $9, win_rate = $10, total_play_time = $11,
          last_active = $12, updated_at = NOW()
        WHERE id = $1
      `, [
        player.id, player.score, player.streak, player.totalCorrect,
        player.totalIncorrect, player.averageReactionTime, player.fastestAnswer,
        player.perfectAnswers, player.eliminations, player.winRate,
        player.totalPlayTime, player.lastActive
      ]);

      client.release();
      
      // Update Redis cache
      await this.redisClient.setEx(`player:${player.id}`, 3600, JSON.stringify(player));
    } catch (error) {
      this.logger.error('Error updating player stats:', error);
      throw error;
    }
  }

  // Room operations
  public async saveRoom(room: BattleRoom): Promise<void> {
    try {
      const client = await this.pgPool.connect();
      
      await client.query(`
        INSERT INTO rooms (
          id, name, max_players, current_players, players, status, game_mode,
          time_limit, lives_per_player, is_private, password, created_at,
          started_at, ended_at, winner, settings, current_round
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          max_players = EXCLUDED.max_players,
          current_players = EXCLUDED.current_players,
          players = EXCLUDED.players,
          status = EXCLUDED.status,
          game_mode = EXCLUDED.game_mode,
          time_limit = EXCLUDED.time_limit,
          lives_per_player = EXCLUDED.lives_per_player,
          is_private = EXCLUDED.is_private,
          password = EXCLUDED.password,
          started_at = EXCLUDED.started_at,
          ended_at = EXCLUDED.ended_at,
          winner = EXCLUDED.winner,
          settings = EXCLUDED.settings,
          current_round = EXCLUDED.current_round
      `, [
        room.id, room.name, room.maxPlayers, room.currentPlayers,
        JSON.stringify(room.players), room.status, room.gameMode,
        room.timeLimit, room.livesPerPlayer, room.isPrivate, room.password,
        room.createdAt, room.startedAt, room.endedAt, room.winner,
        JSON.stringify(room.settings), room.currentRound || 1
      ]);

      client.release();
      
      // Cache room in Redis
      await this.redisClient.setEx(`room:${room.id}`, 1800, JSON.stringify(room));
    } catch (error) {
      this.logger.error('Error saving room:', error);
      throw error;
    }
  }

  public async getRoom(roomId: string): Promise<BattleRoom | null> {
    try {
      // Try Redis first
      const cached = await this.redisClient.get(`room:${roomId}`);
      if (cached) {
        return JSON.parse(cached);
      }

      // Get from PostgreSQL
      const client = await this.pgPool.connect();
      const result = await client.query('SELECT * FROM rooms WHERE id = $1', [roomId]);
      client.release();

      if (result.rows.length === 0) return null;

      const room = this.mapDbRowToRoom(result.rows[0]);
      
      // Cache in Redis
      await this.redisClient.setEx(`room:${roomId}`, 1800, JSON.stringify(room));
      
      return room;
    } catch (error) {
      this.logger.error('Error getting room:', error);
      return null;
    }
  }

  public async updateRoom(room: BattleRoom): Promise<void> {
    try {
      const client = await this.pgPool.connect();
      
      await client.query(`
        UPDATE rooms SET
          name = $2, max_players = $3, current_players = $4, players = $5,
          status = $6, game_mode = $7, time_limit = $8, lives_per_player = $9,
          is_private = $10, password = $11, started_at = $12, ended_at = $13,
          winner = $14, settings = $15, current_round = $16
        WHERE id = $1
      `, [
        room.id, room.name, room.maxPlayers, room.currentPlayers,
        JSON.stringify(room.players), room.status, room.gameMode,
        room.timeLimit, room.livesPerPlayer, room.isPrivate, room.password,
        room.startedAt, room.endedAt, room.winner,
        JSON.stringify(room.settings), room.currentRound || 1
      ]);

      client.release();
      
      // Update Redis cache
      await this.redisClient.setEx(`room:${room.id}`, 1800, JSON.stringify(room));
    } catch (error) {
      this.logger.error('Error updating room:', error);
      throw error;
    }
  }

  public async deleteRoom(roomId: string): Promise<void> {
    try {
      const client = await this.pgPool.connect();
      await client.query('DELETE FROM rooms WHERE id = $1', [roomId]);
      client.release();
      
      // Remove from Redis cache
      await this.redisClient.del(`room:${roomId}`);
    } catch (error) {
      this.logger.error('Error deleting room:', error);
      throw error;
    }
  }

  // Battle statistics
  public async getBattleStats(): Promise<BattleStats> {
    try {
      const client = await this.pgPool.connect();
      
      const statsResult = await client.query(`
        SELECT 
          COUNT(*) as total_players,
          AVG(score) as avg_score,
          MAX(score) as max_score,
          AVG(win_rate) as avg_win_rate,
          SUM(total_correct) as total_correct_answers,
          SUM(total_incorrect) as total_incorrect_answers
        FROM players
      `);
      
      const roomResult = await client.query(`
        SELECT COUNT(*) as total_rooms, COUNT(CASE WHEN status = 'active' THEN 1 END) as active_rooms
        FROM rooms
      `);
      
      client.release();
      
      const stats = statsResult.rows[0];
      const rooms = roomResult.rows[0];
      
      return {
        totalPlayers: parseInt(stats.total_players) || 0,
        totalRooms: parseInt(rooms.total_rooms) || 0,
        activeRooms: parseInt(rooms.active_rooms) || 0,
        averageScore: parseFloat(stats.avg_score) || 0,
        maxScore: parseInt(stats.max_score) || 0,
        averageWinRate: parseFloat(stats.avg_win_rate) || 0,
        totalCorrectAnswers: parseInt(stats.total_correct_answers) || 0,
        totalIncorrectAnswers: parseInt(stats.total_incorrect_answers) || 0
      };
    } catch (error) {
      this.logger.error('Error getting battle stats:', error);
      return {
        totalPlayers: 0,
        totalRooms: 0,
        activeRooms: 0,
        averageScore: 0,
        maxScore: 0,
        averageWinRate: 0,
        totalCorrectAnswers: 0,
        totalIncorrectAnswers: 0
      };
    }
  }

  public async getLeaderboard(limit: number = 100): Promise<BattlePlayer[]> {
    try {
      const client = await this.pgPool.connect();
      const result = await client.query(`
        SELECT * FROM players 
        ORDER BY score DESC, win_rate DESC, total_correct DESC 
        LIMIT $1
      `, [limit]);
      client.release();

      return result.rows.map(row => this.mapDbRowToPlayer(row));
    } catch (error) {
      this.logger.error('Error getting leaderboard:', error);
      return [];
    }
  }

  public async getPlayerRank(playerId: string): Promise<number> {
    try {
      const client = await this.pgPool.connect();
      const result = await client.query(`
        SELECT COUNT(*) + 1 as rank
        FROM players 
        WHERE score > (SELECT score FROM players WHERE id = $1)
      `, [playerId]);
      client.release();

      return parseInt(result.rows[0]?.rank) || 1;
    } catch (error) {
      this.logger.error('Error getting player rank:', error);
      return 1;
    }
  }

  public async searchPlayers(query: string, limit: number = 20): Promise<BattlePlayer[]> {
    try {
      const client = await this.pgPool.connect();
      const result = await client.query(`
        SELECT * FROM players 
        WHERE username ILIKE $1 
        ORDER BY score DESC 
        LIMIT $2
      `, [`%${query}%`, limit]);
      client.release();

      return result.rows.map(row => this.mapDbRowToPlayer(row));
    } catch (error) {
      this.logger.error('Error searching players:', error);
      return [];
    }
  }

  public async getPlayerBattleHistory(playerId: string, limit: number = 50): Promise<any[]> {
    try {
      const client = await this.pgPool.connect();
      const result = await client.query(`
        SELECT * FROM battle_history 
        WHERE player_id = $1 
        ORDER BY timestamp DESC 
        LIMIT $2
      `, [playerId, limit]);
      client.release();

      return result.rows;
    } catch (error) {
      this.logger.error('Error getting player battle history:', error);
      return [];
    }
  }

  // Helper methods
  private mapDbRowToPlayer(row: any): BattlePlayer {
    return {
      id: row.id,
      username: row.username,
      avatar: row.avatar,
      isHost: row.is_host,
      isReady: row.is_ready,
      score: row.score,
      lives: row.lives,
      streak: row.streak,
      totalCorrect: row.total_correct,
      totalIncorrect: row.total_incorrect,
      averageReactionTime: row.average_reaction_time,
      lastAnswerTime: row.last_answer_time,
      isAlive: row.is_alive,
      rank: row.rank,
      powerUps: row.power_ups ? JSON.parse(row.power_ups) : [],
      achievements: row.achievements ? JSON.parse(row.achievements) : [],
      socketId: row.socket_id,
      eliminations: row.eliminations,
      winRate: row.win_rate,
      totalPlayTime: row.total_play_time,
      lastActive: row.last_active,
      fastestAnswer: row.fastest_answer,
      perfectAnswers: row.perfect_answers
    };
  }

  private mapDbRowToRoom(row: any): BattleRoom {
    return {
      id: row.id,
      name: row.name,
      maxPlayers: row.max_players,
      currentPlayers: row.current_players,
      players: row.players ? JSON.parse(row.players) : [],
      status: row.status,
      gameMode: row.game_mode,
      timeLimit: row.time_limit,
      livesPerPlayer: row.lives_per_player,
      isPrivate: row.is_private,
      password: row.password,
      createdAt: row.created_at,
      startedAt: row.started_at,
      endedAt: row.ended_at,
      winner: row.winner,
      settings: row.settings ? JSON.parse(row.settings) : {},
      currentRound: row.current_round
    };
  }

  // Health check
  public async healthCheck(): Promise<boolean> {
    try {
      // Check PostgreSQL
      const client = await this.pgPool.connect();
      await client.query('SELECT 1');
      client.release();
      
      // Check Redis
      await this.redisClient.ping();
      
      return true;
    } catch (error) {
      this.logger.error('Health check failed:', error);
      return false;
    }
  }
}
