import { Server } from 'socket.io';
import { DatabaseService } from './DatabaseService';
import { Logger } from '../utils/Logger';
import { BattleRoom, BattlePlayer, PowerUp } from '../types/BattleTypes';
import { generateInstruction } from '../utils/GameLogic';

export class GameService {
  private io: Server;
  private databaseService: DatabaseService;
  private logger: Logger;
  private activeGames: Map<string, any> = new Map();
  private gameTimers: Map<string, NodeJS.Timeout> = new Map();

  constructor(io: Server, databaseService: DatabaseService) {
    this.io = io;
    this.databaseService = databaseService;
    this.logger = new Logger();
  }

  /**
   * Start a battle in a room
   */
  public async startBattle(roomId: string): Promise<void> {
    try {
      const room = await this.databaseService.getRoom(roomId);
      if (!room) {
        this.logger.error(`Room ${roomId} not found for battle start`);
        return;
      }

      // Initialize game state
      const gameState = {
        roomId,
        currentRound: 1,
        maxRounds: 10,
        currentInstruction: null,
        roundStartTime: Date.now(),
        roundEndTime: Date.now() + room.timeLimit,
        playersAnswered: new Set<string>(),
        roundResults: [],
        gamePhase: 'active'
      };

      this.activeGames.set(roomId, gameState);

      // Generate first instruction
      const instruction = generateInstruction(room.settings.difficulty);
      gameState.currentInstruction = instruction;

      // Notify all players that battle has started
      this.io.to(roomId).emit('battle_started', {
        roomId,
        instruction,
        roundNumber: gameState.currentRound,
        timeLimit: room.timeLimit,
        roundStartTime: gameState.roundStartTime
      });

      // Start round timer
      this.startRoundTimer(roomId, room.timeLimit);

      this.logger.info(`Battle started in room ${roomId} with ${room.players.length} players`);
    } catch (error) {
      this.logger.error('Error starting battle:', error);
    }
  }

  /**
   * Submit an answer for a player
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
    message?: string;
  }> {
    try {
      const gameState = this.activeGames.get(roomId);
      if (!gameState) {
        return { success: false, isCorrect: false, score: 0, streak: 0, roundEnded: false };
      }

      const room = await this.databaseService.getRoom(roomId);
      if (!room) {
        return { success: false, isCorrect: false, score: 0, streak: 0, roundEnded: false };
      }

      const player = room.players.find(p => p.id === playerId);
      if (!player) {
        return { success: false, isCorrect: false, score: 0, streak: 0, roundEnded: false };
      }

      // Check if player already answered this round
      if (gameState.playersAnswered.has(playerId)) {
        return { success: false, isCorrect: false, score: 0, streak: 0, roundEnded: false, message: 'Already answered this round' };
      }

      // Mark player as answered
      gameState.playersAnswered.add(playerId);

      // Validate answer
      const isCorrect = this.validateAnswer(answer, gameState.currentInstruction);
      
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

      // Store round result
      gameState.roundResults.push({
        playerId,
        answer,
        isCorrect,
        score,
        reactionTime,
        timestamp: Date.now()
      });

      // Check if round should end
      const roundEnded = this.checkRoundEnd(room, gameState);
      
      // Update player in database
      await this.databaseService.updatePlayer(player);

      // Check for achievements
      await this.checkAchievements(player);

      // Broadcast answer result to all players
      this.io.to(roomId).emit('answer_submitted', {
        playerId,
        answer,
        isCorrect,
        score,
        streak: player.streak,
        lives: player.lives,
        reactionTime
      });

      if (roundEnded) {
        await this.endRound(roomId);
      }

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
      const room = await this.databaseService.getRoom(roomId);
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
   * End the current round
   */
  public async endRound(roomId: string): Promise<void> {
    try {
      const gameState = this.activeGames.get(roomId);
      if (!gameState) return;

      const room = await this.databaseService.getRoom(roomId);
      if (!room) return;

      // Clear round timer
      const timer = this.gameTimers.get(roomId);
      if (timer) {
        clearTimeout(timer);
        this.gameTimers.delete(roomId);
      }

      // Check if game should end
      if (gameState.currentRound >= gameState.maxRounds || this.checkGameEnd(room)) {
        await this.endGame(roomId);
        return;
      }

      // Move to next round
      gameState.currentRound += 1;
      gameState.playersAnswered.clear();
      gameState.roundResults = [];

      // Generate next instruction
      const nextInstruction = generateInstruction(room.settings.difficulty);
      gameState.currentInstruction = nextInstruction;
      gameState.roundStartTime = Date.now();
      gameState.roundEndTime = Date.now() + room.timeLimit;

      // Notify players of round end
      this.io.to(roomId).emit('round_ended', {
        roomId,
        roundNumber: gameState.currentRound,
        nextInstruction,
        playerStats: room.players.map(p => ({
          id: p.id,
          username: p.username,
          score: p.score,
          lives: p.lives,
          streak: p.streak
        })),
        roundStartTime: gameState.roundStartTime
      });

      // Start next round timer
      this.startRoundTimer(roomId, room.timeLimit);

      this.logger.info(`Round ${gameState.currentRound - 1} ended in room ${roomId}`);
    } catch (error) {
      this.logger.error('Error ending round:', error);
    }
  }

  /**
   * End the entire game
   */
  public async endGame(roomId: string): Promise<void> {
    try {
      const gameState = this.activeGames.get(roomId);
      if (!gameState) return;

      const room = await this.databaseService.getRoom(roomId);
      if (!room) return;

      // Clear game timer
      const timer = this.gameTimers.get(roomId);
      if (timer) {
        clearTimeout(timer);
        this.gameTimers.delete(roomId);
      }

      // Determine winner
      const winner = this.determineWinner(room);
      room.winner = winner?.id;
      room.status = 'finished';
      room.endedAt = new Date();

      // Update final stats for all players
      for (const player of room.players) {
        await this.databaseService.updatePlayerStats(player);
      }

      // Update room in database
      await this.databaseService.updateRoom(room);

      // Notify all players
      this.io.to(roomId).emit('game_ended', {
        roomId,
        winner: winner?.username,
        finalScores: room.players.map(p => ({
          id: p.id,
          username: p.username,
          score: p.score,
          streak: p.streak,
          lives: p.lives,
          totalCorrect: p.totalCorrect,
          totalIncorrect: p.totalIncorrect,
          averageReactionTime: p.averageReactionTime,
          fastestAnswer: p.fastestAnswer,
          perfectAnswers: p.perfectAnswers
        })),
        gameStats: {
          totalRounds: gameState.currentRound,
          duration: room.endedAt.getTime() - room.startedAt!.getTime()
        }
      });

      // Clean up game state
      this.activeGames.delete(roomId);

      this.logger.info(`Game ended in room ${roomId}, winner: ${winner?.username}`);
    } catch (error) {
      this.logger.error('Error ending game:', error);
    }
  }

  /**
   * Get current game state
   */
  public getGameState(roomId: string): any {
    return this.activeGames.get(roomId);
  }

  /**
   * Pause the game
   */
  public async pauseGame(roomId: string): Promise<boolean> {
    try {
      const gameState = this.activeGames.get(roomId);
      if (!gameState) return false;

      gameState.gamePhase = 'paused';
      
      // Pause timer
      const timer = this.gameTimers.get(roomId);
      if (timer) {
        clearTimeout(timer);
        this.gameTimers.delete(roomId);
      }

      this.io.to(roomId).emit('game_paused', { roomId });
      this.logger.info(`Game paused in room ${roomId}`);
      return true;
    } catch (error) {
      this.logger.error('Error pausing game:', error);
      return false;
    }
  }

  /**
   * Resume the game
   */
  public async resumeGame(roomId: string): Promise<boolean> {
    try {
      const gameState = this.activeGames.get(roomId);
      if (!gameState) return false;

      gameState.gamePhase = 'active';
      
      // Resume timer
      const remainingTime = gameState.roundEndTime - Date.now();
      if (remainingTime > 0) {
        this.startRoundTimer(roomId, remainingTime);
      }

      this.io.to(roomId).emit('game_resumed', { roomId });
      this.logger.info(`Game resumed in room ${roomId}`);
      return true;
    } catch (error) {
      this.logger.error('Error resuming game:', error);
      return false;
    }
  }

  // Private helper methods
  private startRoundTimer(roomId: string, duration: number): void {
    const timer = setTimeout(() => {
      this.endRound(roomId);
    }, duration);
    
    this.gameTimers.set(roomId, timer);
  }

  private validateAnswer(answer: string, instruction: any): boolean {
    if (!instruction) return false;
    
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

  private checkRoundEnd(room: BattleRoom, gameState: any): boolean {
    // Check if all players have answered
    const allAnswered = room.players.every(p => gameState.playersAnswered.has(p.id));
    
    // Check if all players are eliminated
    const allEliminated = room.players.every(p => p.lives <= 0);
    
    return allAnswered || allEliminated;
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
    const newAchievements = [];
    
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
