import { Server } from 'socket.io';
import { DatabaseService } from './DatabaseService';
import { Logger } from '../utils/Logger';
import { BattleRoom, BattlePlayer, BattleStatus } from '../types/BattleTypes';

export class RoomService {
  private io: Server;
  private databaseService: DatabaseService;
  private logger: Logger;
  private activeRooms: Map<string, BattleRoom> = new Map();

  constructor(io: Server, databaseService: DatabaseService) {
    this.io = io;
    this.databaseService = databaseService;
    this.logger = new Logger();
  }

  /**
   * Create a new battle room
   */
  public async createRoom(config: {
    name: string;
    gameMode: string;
    maxPlayers: number;
    timeLimit: number;
    difficulty: string;
    powerUpsEnabled: boolean;
    isPrivate?: boolean;
    password?: string;
  }, hostSocketId: string): Promise<BattleRoom> {
    try {
      const roomId = this.generateRoomId();
      const hostPlayer = await this.createHostPlayer(hostSocketId, config.difficulty);

      const room: BattleRoom = {
        id: roomId,
        name: config.name,
        maxPlayers: config.maxPlayers,
        currentPlayers: 1,
        players: [hostPlayer],
        status: 'waiting',
        gameMode: config.gameMode as any,
        timeLimit: config.timeLimit,
        livesPerPlayer: 3,
        isPrivate: config.isPrivate || false,
        password: config.password,
        createdAt: new Date(),
        startedAt: undefined,
        endedAt: undefined,
        winner: undefined,
        settings: {
          instructionTypes: ['direction', 'color', 'action', 'mixed'],
          difficulty: config.difficulty as any,
          powerUpsEnabled: config.powerUpsEnabled,
          spectateMode: false,
          autoStart: false,
          countdownDuration: 3000
        }
      };

      // Store room in memory and database
      this.activeRooms.set(roomId, room);
      await this.databaseService.saveRoom(room);

      this.logger.info(`Room created: ${roomId} by ${hostPlayer.username}`);
      return room;
    } catch (error) {
      this.logger.error('Error creating room:', error);
      throw error;
    }
  }

  /**
   * Join an existing room
   */
  public async joinRoom(roomId: string, playerData: any, socketId: string): Promise<{
    success: boolean;
    room?: BattleRoom;
    player?: BattlePlayer;
    error?: string;
  }> {
    try {
      const room = this.activeRooms.get(roomId);
      if (!room) {
        return { success: false, error: 'Room not found' };
      }

      // Check if room is private and password is required
      if (room.isPrivate && room.password && playerData.password !== room.password) {
        return { success: false, error: 'Incorrect password' };
      }

      if (room.players.length >= room.maxPlayers) {
        return { success: false, error: 'Room is full' };
      }

      if (room.status !== 'waiting') {
        return { success: false, error: 'Game already in progress' };
      }

      const newPlayer = await this.createPlayer(playerData.username, room.settings.difficulty);
      newPlayer.socketId = socketId;

      room.players.push(newPlayer);
      room.currentPlayers = room.players.length;

      // Update room in memory and database
      this.activeRooms.set(roomId, room);
      await this.databaseService.updateRoom(room);

      this.logger.info(`Player ${newPlayer.username} joined room ${roomId}`);
      
      return { success: true, room, player: newPlayer };
    } catch (error) {
      this.logger.error('Error joining room:', error);
      return { success: false, error: 'Failed to join room' };
    }
  }

  /**
   * Set player ready status
   */
  public async setPlayerReady(roomId: string, playerId: string): Promise<{
    success: boolean;
    allReady: boolean;
    error?: string;
  }> {
    try {
      const room = this.activeRooms.get(roomId);
      if (!room) {
        return { success: false, allReady: false, error: 'Room not found' };
      }

      const player = room.players.find(p => p.id === playerId);
      if (!player) {
        return { success: false, allReady: false, error: 'Player not found' };
      }

      player.isReady = true;

      // Check if all players are ready
      const allReady = room.players.length >= 2 && room.players.every(p => p.isReady);

      // Update room in database
      await this.databaseService.updateRoom(room);

      this.logger.info(`Player ${player.username} is ready in room ${roomId}`);
      
      return { success: true, allReady };
    } catch (error) {
      this.logger.error('Error setting player ready:', error);
      return { success: false, allReady: false, error: 'Failed to set ready status' };
    }
  }

  /**
   * Leave a room
   */
  public async leaveRoom(roomId: string, playerId: string): Promise<{
    success: boolean;
    roomClosed: boolean;
    error?: string;
  }> {
    try {
      const room = this.activeRooms.get(roomId);
      if (!room) {
        return { success: false, roomClosed: false, error: 'Room not found' };
      }

      const playerIndex = room.players.findIndex(p => p.id === playerId);
      if (playerIndex === -1) {
        return { success: false, roomClosed: false, error: 'Player not found' };
      }

      const player = room.players[playerIndex];
      room.players.splice(playerIndex, 1);
      room.currentPlayers = room.players.length;

      // If host left, transfer host to next player
      if (player.isHost && room.players.length > 0) {
        room.players[0].isHost = true;
        this.logger.info(`Host transferred to ${room.players[0].username} in room ${roomId}`);
      }

      // Check if room should be closed
      const roomClosed = room.players.length === 0;

      if (roomClosed) {
        // Close room
        this.activeRooms.delete(roomId);
        await this.databaseService.deleteRoom(roomId);
        this.logger.info(`Room ${roomId} closed - no players left`);
      } else {
        // Update room
        this.activeRooms.set(roomId, room);
        await this.databaseService.updateRoom(room);
        this.logger.info(`Player ${player.username} left room ${roomId}`);
      }

      return { success: true, roomClosed };
    } catch (error) {
      this.logger.error('Error leaving room:', error);
      return { success: false, roomClosed: false, error: 'Failed to leave room' };
    }
  }

  /**
   * Get room information
   */
  public async getRoom(roomId: string): Promise<BattleRoom | null> {
    try {
      let room = this.activeRooms.get(roomId);
      
      if (!room) {
        // Try to get from database
        room = await this.databaseService.getRoom(roomId);
        if (room) {
          this.activeRooms.set(roomId, room);
        }
      }
      
      return room;
    } catch (error) {
      this.logger.error('Error getting room:', error);
      return null;
    }
  }

  /**
   * Get all active rooms
   */
  public async getActiveRooms(): Promise<BattleRoom[]> {
    try {
      const rooms = Array.from(this.activeRooms.values());
      return rooms.filter(room => room.status === 'waiting');
    } catch (error) {
      this.logger.error('Error getting active rooms:', error);
      return [];
    }
  }

  /**
   * Update room settings
   */
  public async updateRoomSettings(roomId: string, settings: any): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const room = this.activeRooms.get(roomId);
      if (!room) {
        return { success: false, error: 'Room not found' };
      }

      // Only allow updates if game hasn't started
      if (room.status !== 'waiting') {
        return { success: false, error: 'Cannot update settings during game' };
      }

      // Update settings
      room.settings = { ...room.settings, ...settings };

      // Update room in database
      await this.databaseService.updateRoom(room);

      this.logger.info(`Room settings updated for room ${roomId}`);
      return { success: true };
    } catch (error) {
      this.logger.error('Error updating room settings:', error);
      return { success: false, error: 'Failed to update settings' };
    }
  }

  /**
   * Kick player from room
   */
  public async kickPlayer(roomId: string, playerId: string, kickedByPlayerId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const room = this.activeRooms.get(roomId);
      if (!room) {
        return { success: false, error: 'Room not found' };
      }

      const kickedByPlayer = room.players.find(p => p.id === kickedByPlayerId);
      if (!kickedByPlayer || !kickedByPlayer.isHost) {
        return { success: false, error: 'Only host can kick players' };
      }

      const playerToKick = room.players.find(p => p.id === playerId);
      if (!playerToKick) {
        return { success: false, error: 'Player not found' };
      }

      if (playerToKick.isHost) {
        return { success: false, error: 'Cannot kick host' };
      }

      // Remove player from room
      room.players = room.players.filter(p => p.id !== playerId);
      room.currentPlayers = room.players.length;

      // Update room in database
      await this.databaseService.updateRoom(room);

      // Notify kicked player
      this.io.to(playerToKick.socketId).emit('kicked_from_room', {
        roomId,
        reason: 'Kicked by host'
      });

      this.logger.info(`Player ${playerToKick.username} kicked from room ${roomId} by ${kickedByPlayer.username}`);
      return { success: true };
    } catch (error) {
      this.logger.error('Error kicking player:', error);
      return { success: false, error: 'Failed to kick player' };
    }
  }

  /**
   * Start countdown for room
   */
  public async startCountdown(roomId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const room = this.activeRooms.get(roomId);
      if (!room) {
        return { success: false, error: 'Room not found' };
      }

      if (room.status !== 'waiting') {
        return { success: false, error: 'Game already in progress' };
      }

      if (room.players.length < 2) {
        return { success: false, error: 'Need at least 2 players to start' };
      }

      if (!room.players.every(p => p.isReady)) {
        return { success: false, error: 'All players must be ready' };
      }

      // Start countdown
      this.io.to(roomId).emit('countdown_started', {
        duration: room.settings.countdownDuration
      });

      this.logger.info(`Countdown started for room ${roomId}`);
      return { success: true };
    } catch (error) {
      this.logger.error('Error starting countdown:', error);
      return { success: false, error: 'Failed to start countdown' };
    }
  }

  /**
   * Get room statistics
   */
  public async getRoomStats(roomId: string): Promise<any> {
    try {
      const room = this.activeRooms.get(roomId);
      if (!room) {
        return null;
      }

      return {
        roomId: room.id,
        name: room.name,
        status: room.status,
        playerCount: room.players.length,
        maxPlayers: room.maxPlayers,
        gameMode: room.gameMode,
        difficulty: room.settings.difficulty,
        createdAt: room.createdAt,
        startedAt: room.startedAt,
        players: room.players.map(p => ({
          id: p.id,
          username: p.username,
          isHost: p.isHost,
          isReady: p.isReady,
          score: p.score,
          lives: p.lives,
          streak: p.streak
        }))
      };
    } catch (error) {
      this.logger.error('Error getting room stats:', error);
      return null;
    }
  }

  // Private helper methods
  private generateRoomId(): string {
    return `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async createHostPlayer(socketId: string, difficulty: string): Promise<BattlePlayer> {
    return {
      id: `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      username: `Host_${Math.random().toString(36).substr(2, 6)}`,
      avatar: undefined,
      isHost: true,
      isReady: true,
      score: 0,
      lives: 3,
      streak: 0,
      totalCorrect: 0,
      totalIncorrect: 0,
      averageReactionTime: 0,
      lastAnswerTime: Date.now(),
      isAlive: true,
      rank: 1,
      powerUps: [],
      achievements: [],
      socketId
    };
  }

  private async createPlayer(username: string, difficulty: string): Promise<BattlePlayer> {
    return {
      id: `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      username,
      avatar: undefined,
      isHost: false,
      isReady: false,
      score: 0,
      lives: 3,
      streak: 0,
      totalCorrect: 0,
      totalIncorrect: 0,
      averageReactionTime: 0,
      lastAnswerTime: Date.now(),
      isAlive: true,
      rank: 1,
      powerUps: [],
      achievements: [],
      socketId: ''
    };
  }
}
