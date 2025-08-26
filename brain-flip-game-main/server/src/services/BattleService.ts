import { Server } from 'socket.io';
import { DatabaseService } from './DatabaseService';
import { Logger } from '../utils/Logger';
import { BattleRoom, BattlePlayer, BattleStats, PowerUp, BattleAchievement } from '../types/BattleTypes';
import { generateInstruction } from '../utils/GameLogic';

export class BattleService {
  private io: Server;
  private databaseService: DatabaseService;
  private logger: Logger;
  private activeRooms: Map<string, BattleRoom> = new Map();
  private roomInstructions: Map<string, any[]> = new Map();

  constructor(io: Server, databaseService: DatabaseService) {
    this.io = io;
    this.databaseService = databaseService;
    this.logger = new Logger();
  }

  /**
   * Create a new battle room with advanced configuration
   */
  public async createRoom(config: {
    name: string;
    gameMode: string;
    maxPlayers: number;
    timeLimit: number;
    difficulty: string;
    powerUpsEnabled: boolean;
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
        isPrivate: false,
        password: undefined,
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

      // Generate initial instructions for the room
      this.roomInstructions.set(roomId, this.generateRoomInstructions(config.difficulty));
      
      // Store room in memory and database
      this.activeRooms.set(roomId, room);
      await this.databaseService.saveRoom(room);

      this.logger.info(`Battle room created: ${roomId} by ${hostPlayer.username}`);
      return room;
    } catch (error) {
      this.logger.error('Error creating battle room:', error);
      throw error;
    }
  }

  /**
   * Join an existing battle room
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
   * Start a battle in a room
   */
  public async startBattle(roomId: string): Promise<void> {
    try {
      const room = this.activeRooms.get(roomId);
      if (!room) return;

      room.status = 'active';
      room.startedAt = new Date();
      room.currentRound = 1;

      // Generate first instruction for all players
      const instruction = this.getNextInstruction(roomId);
      
      // Notify all players that battle has started
      this.io.to(roomId).emit('battle_started', {
        roomId,
        instruction,
        roundNumber: room.currentRound,
        timeLimit: room.timeLimit
      });

      // Start the round timer
      this.startRoundTimer(roomId, room.timeLimit);

      this.logger.info(`Battle started in room ${roomId}`);
    } catch (error) {
      this.logger.error('Error starting battle:', error);
    }
  }

  /**
   * Submit an answer and calculate score
   */
  public async submitAnswer(
    roomId: string, 
    playerId: string, 
    answer: string, 
    reactionTime: number
  ): Promise<{
    success: boolean;
    isCorrect: boolean;
    score: number;
    streak: number;
    roundEnded: boolean;
  }> {
    try {
      const room = this.activeRooms.get(roomId);
      if (!room) {
        return { success: false, isCorrect: false, score: 0, streak: 0, roundEnded: false };
      }

      const player = room.players.find(p => p.id === playerId);
      if (!player) {
        return { success: false, isCorrect: false, score: 0, streak: 0, roundEnded: false };
      }

      // Get current instruction
      const currentInstruction = this.getCurrentInstruction(roomId);
      if (!currentInstruction) {
        return { success: false, isCorrect: false, score: 0, streak: 0, roundEnded: false };
      }

      // Check if answer is correct
      const isCorrect = this.validateAnswer(answer, currentInstruction);
      
      // Calculate score
      const score = this.calculateScore(reactionTime, isCorrect, player.streak, player.powerUps);
      
      // Update player stats
      if (isCorrect) {
        player.streak += 1;
        player.totalCorrect += 1;
        player.score += score;
        
        // Check for perfect timing bonus
        if (reactionTime < 200) {
          player.perfectAnswers += 1;
        }
        
        // Update fastest answer
        if (player.fastestAnswer === 0 || reactionTime < player.fastestAnswer) {
          player.fastestAnswer = reactionTime;
        }
      } else {
        player.streak = 0;
        player.totalIncorrect += 1;
        player.lives = Math.max(0, player.lives - 1);
      }

      player.totalAnswered += 1;
      player.lastAnswerTime = Date.now();
      player.averageReactionTime = this.calculateAverageReactionTime(player);

      // Check if round should end
      const roundEnded = this.checkRoundEnd(room);
      
      // Update room in database
      await this.databaseService.updateRoom(room);

      // Check for achievements
      await this.checkAchievements(player);

      return {
        success: true,
        isCorrect,
        score,
        streak: player.streak,
        roundEnded
      };
    } catch (error) {
      this.logger.error('Error submitting answer:', error);
      return { success: false, isCorrect: false, score: 0, streak: 0, roundEnded: false };
    }
  }

  /**
   * Activate a power-up for a player
   */
  public async activatePowerUp(
    roomId: string, 
    playerId: string, 
    powerUpType: string
  ): Promise<{
    success: boolean;
    effect?: string;
    error?: string;
  }> {
    try {
      const room = this.activeRooms.get(roomId);
      if (!room) {
        return { success: false, error: 'Room not found' };
      }

      const player = room.players.find(p => p.id === playerId);
      if (!player) {
        return { success: false, error: 'Player not found' };
      }

      // Check if player has the power-up
      const powerUp = player.powerUps.find(p => p.type === powerUpType);
      if (!powerUp) {
        return { success: false, error: 'Power-up not available' };
      }

      // Remove power-up from player
      player.powerUps = player.powerUps.filter(p => p.type !== powerUpType);

      // Apply power-up effect
      const effect = this.applyPowerUpEffect(player, powerUpType);

      // Update player in database
      await this.databaseService.updatePlayer(player);

      this.logger.info(`Power-up ${powerUpType} activated by ${player.username} in room ${roomId}`);

      return { success: true, effect };
    } catch (error) {
      this.logger.error('Error activating power-up:', error);
      return { success: false, error: 'Failed to activate power-up' };
    }
  }

  /**
   * Get battle statistics
   */
  public async getBattleStats(): Promise<BattleStats> {
    try {
      const stats = await this.databaseService.getBattleStats();
      return stats;
    } catch (error) {
      this.logger.error('Error getting battle stats:', error);
      throw error;
    }
  }

  /**
   * End a battle and determine winner
   */
  public async endBattle(roomId: string): Promise<void> {
    try {
      const room = this.activeRooms.get(roomId);
      if (!room) return;

      room.status = 'finished';
      room.endedAt = new Date();

      // Determine winner
      const winner = this.determineWinner(room);
      room.winner = winner?.id;

      // Update final stats
      for (const player of room.players) {
        await this.databaseService.updatePlayerStats(player);
      }

      // Notify all players
      this.io.to(roomId).emit('battle_ended', {
        roomId,
        winner: winner?.username,
        finalScores: room.players.map(p => ({
          username: p.username,
          score: p.score,
          streak: p.streak
        }))
      });

      // Clean up room
      this.activeRooms.delete(roomId);
      this.roomInstructions.delete(roomId);

      this.logger.info(`Battle ended in room ${roomId}, winner: ${winner?.username}`);
    } catch (error) {
      this.logger.error('Error ending battle:', error);
    }
  }

  // Private helper methods
  private generateRoomId(): string {
    return `battle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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
      powerUps: this.generateInitialPowerUps(difficulty),
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
      powerUps: this.generateInitialPowerUps(difficulty),
      achievements: [],
      socketId: ''
    };
  }

  private generateInitialPowerUps(difficulty: string): PowerUp[] {
    const powerUps: PowerUp[] = [];
    const count = difficulty === 'easy' ? 2 : difficulty === 'medium' ? 1 : 0;
    
    for (let i = 0; i < count; i++) {
      powerUps.push({
        id: `powerup_${Date.now()}_${i}`,
        type: this.getRandomPowerUpType(),
        name: 'Battle Power-Up',
        description: 'Enhance your battle performance',
        icon: '⚡',
        duration: 10000,
        effect: { type: 'boost', value: 1.5, description: 'Performance boost' },
        rarity: 'common'
      });
    }
    
    return powerUps;
  }

  private getRandomPowerUpType(): string {
    const types = ['shield', 'time-freeze', 'score-multiplier', 'life-steal', 'speed-boost', 'mind-reader'];
    return types[Math.floor(Math.random() * types.length)];
  }

  private generateRoomInstructions(difficulty: string): any[] {
    const instructions = [];
    const count = difficulty === 'easy' ? 20 : difficulty === 'medium' ? 30 : 40;
    
    for (let i = 0; i < count; i++) {
      instructions.push(generateInstruction(difficulty));
    }
    
    return instructions;
  }

  private getNextInstruction(roomId: string): any {
    const instructions = this.roomInstructions.get(roomId);
    if (!instructions || instructions.length === 0) {
      return generateInstruction('medium');
    }
    return instructions.shift();
  }

  private getCurrentInstruction(roomId: string): any {
    const instructions = this.roomInstructions.get(roomId);
    if (!instructions || instructions.length === 0) {
      return generateInstruction('medium');
    }
    return instructions[0];
  }

  private validateAnswer(answer: string, instruction: any): boolean {
    if (instruction.acceptableAnswers && instruction.acceptableAnswers.length > 0) {
      return instruction.acceptableAnswers.includes(answer);
    }
    return instruction.correctAnswer === answer;
  }

  private calculateScore(reactionTime: number, isCorrect: boolean, streak: number, powerUps: PowerUp[]): number {
    if (!isCorrect) return 0;

    let baseScore = 10;
    
    // Speed bonus
    if (reactionTime < 500) baseScore += 10;
    if (reactionTime < 200) baseScore += 20; // Perfect timing
    
    // Streak multiplier
    const streakMultiplier = Math.min(1 + (streak * 0.2), 3);
    baseScore = Math.floor(baseScore * streakMultiplier);
    
    // Power-up bonuses
    const activePowerUps = powerUps.map(p => p.type);
    if (activePowerUps.includes('score-multiplier')) baseScore *= 2;
    if (activePowerUps.includes('speed-boost')) baseScore += 5;
    
    return baseScore;
  }

  private calculateAverageReactionTime(player: BattlePlayer): number {
    if (player.totalAnswered === 0) return 0;
    return (player.averageReactionTime * (player.totalAnswered - 1) + player.lastAnswerTime) / player.totalAnswered;
  }

  private checkRoundEnd(room: BattleRoom): boolean {
    // Check if all players have answered or if time is up
    const allAnswered = room.players.every(p => p.lastAnswerTime > 0);
    const allEliminated = room.players.every(p => p.lives <= 0);
    
    return allAnswered || allEliminated;
  }

  private startRoundTimer(roomId: string, timeLimit: number): void {
    setTimeout(() => {
      this.endRound(roomId);
    }, timeLimit);
  }

  private async endRound(roomId: string): Promise<void> {
    try {
      const room = this.activeRooms.get(roomId);
      if (!room) return;

      room.currentRound += 1;

      // Check if game should end
      if (room.currentRound > 10 || this.checkGameEnd(room)) {
        await this.endBattle(roomId);
        return;
      }

      // Generate next instruction
      const nextInstruction = this.getNextInstruction(roomId);
      
      // Notify players of round end
      this.io.to(roomId).emit('round_ended', {
        roomId,
        roundNumber: room.currentRound,
        nextInstruction,
        playerStats: room.players.map(p => ({
          id: p.id,
          username: p.username,
          score: p.score,
          lives: p.lives,
          streak: p.streak
        }))
      });

      // Start next round timer
      this.startRoundTimer(roomId, room.timeLimit);
    } catch (error) {
      this.logger.error('Error ending round:', error);
    }
  }

  private checkGameEnd(room: BattleRoom): boolean {
    const activePlayers = room.players.filter(p => p.lives > 0);
    return activePlayers.length <= 1;
  }

  private determineWinner(room: BattleRoom): BattlePlayer | null {
    const activePlayers = room.players.filter(p => p.lives > 0);
    
    if (activePlayers.length === 0) return null;
    if (activePlayers.length === 1) return activePlayers[0];
    
    // Sort by score, then by streak, then by fastest answer
    return activePlayers.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.streak !== a.streak) return b.streak - a.streak;
      if (a.fastestAnswer !== b.fastestAnswer) return a.fastestAnswer - b.fastestAnswer;
      return 0;
    })[0];
  }

  private applyPowerUpEffect(player: BattlePlayer, powerUpType: string): string {
    switch (powerUpType) {
      case 'shield':
        player.lives = Math.min(player.lives + 1, 5);
        return 'Shield activated - +1 life';
      case 'time-freeze':
        return 'Time freeze activated - opponents slowed';
      case 'score-multiplier':
        return 'Score multiplier activated - 2x points';
      case 'life-steal':
        return 'Life steal activated - steal from opponents';
      case 'speed-boost':
        return 'Speed boost activated - faster reactions';
      case 'mind-reader':
        return 'Mind reader activated - see opponent answers';
      default:
        return 'Power-up activated';
    }
  }

  private async checkAchievements(player: BattlePlayer): Promise<void> {
    const newAchievements: BattleAchievement[] = [];
    
    // Streak achievements
    if (player.streak >= 5 && !player.achievements.some(a => a.name === 'Streak Master')) {
      newAchievements.push({
        id: `achievement_${Date.now()}_1`,
        name: 'Streak Master',
        description: 'Maintain a 5+ streak',
        icon: '🔥',
        unlockedAt: new Date(),
        rarity: 'rare',
        points: 100
      });
    }
    
    // Perfect timing achievements
    if (player.perfectAnswers >= 3 && !player.achievements.some(a => a.name === 'Perfectionist')) {
      newAchievements.push({
        id: `achievement_${Date.now()}_2`,
        name: 'Perfectionist',
        description: 'Get 3 perfect answers',
        icon: '⭐',
        unlockedAt: new Date(),
        rarity: 'epic',
        points: 200
      });
    }
    
    // Speed achievements
    if (player.fastestAnswer > 0 && player.fastestAnswer < 150 && !player.achievements.some(a => a.name === 'Speed Demon')) {
      newAchievements.push({
        id: `achievement_${Date.now()}_3`,
        name: 'Speed Demon',
        description: 'Answer in under 150ms',
        icon: '⚡',
        unlockedAt: new Date(),
        rarity: 'legendary',
        points: 500
      });
    }
    
    // Add new achievements to player
    if (newAchievements.length > 0) {
      player.achievements.push(...newAchievements);
      this.logger.info(`Player ${player.username} unlocked ${newAchievements.length} achievements`);
    }
  }
}
