import { DatabaseService } from './DatabaseService';
import { Logger } from '../utils/Logger';
import { BattlePlayer, BattleStats } from '../types/BattleTypes';

export class PlayerService {
  private databaseService: DatabaseService;
  private logger: Logger;
  private onlinePlayers: Map<string, BattlePlayer> = new Map();

  constructor(databaseService: DatabaseService) {
    this.databaseService = databaseService;
    this.logger = new Logger();
  }

  /**
   * Create a new player
   */
  public async createPlayer(playerData: {
    username: string;
    avatar?: string;
    difficulty?: string;
  }): Promise<BattlePlayer> {
    try {
      const player: BattlePlayer = {
        id: `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        username: playerData.username,
        avatar: playerData.avatar,
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
        socketId: '',
        // Additional properties
        eliminations: 0,
        winRate: 0,
        totalPlayTime: 0,
        lastActive: new Date(),
        fastestAnswer: 0,
        perfectAnswers: 0
      };

      // Save player to database
      await this.databaseService.savePlayer(player);
      
      this.logger.info(`New player created: ${player.username} (${player.id})`);
      return player;
    } catch (error) {
      this.logger.error('Error creating player:', error);
      throw error;
    }
  }

  /**
   * Get player by ID
   */
  public async getPlayer(playerId: string): Promise<BattlePlayer | null> {
    try {
      // Check online players first
      let player = this.onlinePlayers.get(playerId);
      
      if (!player) {
        // Get from database
        player = await this.databaseService.getPlayer(playerId);
        if (player) {
          this.onlinePlayers.set(playerId, player);
        }
      }
      
      return player;
    } catch (error) {
      this.logger.error('Error getting player:', error);
      return null;
    }
  }

  /**
   * Get player by username
   */
  public async getPlayerByUsername(username: string): Promise<BattlePlayer | null> {
    try {
      // Check online players first
      for (const player of this.onlinePlayers.values()) {
        if (player.username === username) {
          return player;
        }
      }
      
      // Get from database
      const player = await this.databaseService.getPlayerByUsername(username);
      if (player) {
        this.onlinePlayers.set(player.id, player);
      }
      
      return player;
    } catch (error) {
      this.logger.error('Error getting player by username:', error);
      return null;
    }
  }

  /**
   * Update player data
   */
  public async updatePlayer(player: BattlePlayer): Promise<boolean> {
    try {
      // Update in memory
      this.onlinePlayers.set(player.id, player);
      
      // Update in database
      await this.databaseService.updatePlayer(player);
      
      this.logger.info(`Player ${player.username} updated`);
      return true;
    } catch (error) {
      this.logger.error('Error updating player:', error);
      return false;
    }
  }

  /**
   * Update player statistics
   */
  public async updatePlayerStats(player: BattlePlayer): Promise<boolean> {
    try {
      // Calculate win rate
      const totalGames = player.totalCorrect + player.totalIncorrect;
      if (totalGames > 0) {
        player.winRate = (player.totalCorrect / totalGames) * 100;
      }

      // Update last active time
      player.lastActive = new Date();

      // Update in database
      await this.databaseService.updatePlayerStats(player);
      
      this.logger.info(`Player ${player.username} stats updated`);
      return true;
    } catch (error) {
      this.logger.error('Error updating player stats:', error);
      return false;
    }
  }

  /**
   * Handle player disconnection
   */
  public async handleDisconnect(socketId: string): Promise<void> {
    try {
      // Find player by socket ID
      let disconnectedPlayer: BattlePlayer | null = null;
      
      for (const player of this.onlinePlayers.values()) {
        if (player.socketId === socketId) {
          disconnectedPlayer = player;
          break;
        }
      }

      if (disconnectedPlayer) {
        // Update last active time
        disconnectedPlayer.lastActive = new Date();
        disconnectedPlayer.socketId = '';
        
        // Update in database
        await this.databaseService.updatePlayer(disconnectedPlayer);
        
        // Remove from online players
        this.onlinePlayers.delete(disconnectedPlayer.id);
        
        this.logger.info(`Player ${disconnectedPlayer.username} disconnected`);
      }
    } catch (error) {
      this.logger.error('Error handling player disconnection:', error);
    }
  }

  /**
   * Get player leaderboard
   */
  public async getLeaderboard(limit: number = 100): Promise<BattlePlayer[]> {
    try {
      const players = await this.databaseService.getLeaderboard(limit);
      return players;
    } catch (error) {
      this.logger.error('Error getting leaderboard:', error);
      return [];
    }
  }

  /**
   * Get player achievements
   */
  public async getPlayerAchievements(playerId: string): Promise<any[]> {
    try {
      const player = await this.getPlayer(playerId);
      if (!player) return [];
      
      return player.achievements;
    } catch (error) {
      this.logger.error('Error getting player achievements:', error);
      return [];
    }
  }

  /**
   * Award achievement to player
   */
  public async awardAchievement(playerId: string, achievement: any): Promise<boolean> {
    try {
      const player = await this.getPlayer(playerId);
      if (!player) return false;

      // Check if player already has this achievement
      if (player.achievements.some(a => a.name === achievement.name)) {
        return false;
      }

      // Add achievement
      player.achievements.push(achievement);
      
      // Update player
      await this.updatePlayer(player);
      
      this.logger.info(`Achievement ${achievement.name} awarded to ${player.username}`);
      return true;
    } catch (error) {
      this.logger.error('Error awarding achievement:', error);
      return false;
    }
  }

  /**
   * Get player battle history
   */
  public async getPlayerBattleHistory(playerId: string, limit: number = 50): Promise<any[]> {
    try {
      const history = await this.databaseService.getPlayerBattleHistory(playerId, limit);
      return history;
    } catch (error) {
      this.logger.error('Error getting player battle history:', error);
      return [];
    }
  }

  /**
   * Get player statistics
   */
  public async getPlayerStats(playerId: string): Promise<BattleStats | null> {
    try {
      const player = await this.getPlayer(playerId);
      if (!player) return null;

      return {
        gamesPlayed: player.totalCorrect + player.totalIncorrect,
        gamesWon: player.totalCorrect,
        totalScore: player.score,
        bestStreak: player.streak,
        averageReactionTime: player.averageReactionTime,
        fastestAnswer: player.fastestAnswer,
        perfectAnswers: player.perfectAnswers,
        totalPlayTime: player.totalPlayTime,
        winRate: player.winRate,
        eliminations: player.eliminations,
        achievements: player.achievements.length
      };
    } catch (error) {
      this.logger.error('Error getting player stats:', error);
      return null;
    }
  }

  /**
   * Update player power-ups
   */
  public async updatePlayerPowerUps(playerId: string, powerUps: any[]): Promise<boolean> {
    try {
      const player = await this.getPlayer(playerId);
      if (!player) return false;

      player.powerUps = powerUps;
      await this.updatePlayer(player);
      
      this.logger.info(`Power-ups updated for player ${player.username}`);
      return true;
    } catch (error) {
      this.logger.error('Error updating player power-ups:', error);
      return false;
    }
  }

  /**
   * Get online players count
   */
  public getOnlinePlayersCount(): number {
    return this.onlinePlayers.size;
  }

  /**
   * Get all online players
   */
  public getOnlinePlayers(): BattlePlayer[] {
    return Array.from(this.onlinePlayers.values());
  }

  /**
   * Search players by username
   */
  public async searchPlayers(query: string, limit: number = 20): Promise<BattlePlayer[]> {
    try {
      const players = await this.databaseService.searchPlayers(query, limit);
      return players;
    } catch (error) {
      this.logger.error('Error searching players:', error);
      return [];
    }
  }

  /**
   * Ban player
   */
  public async banPlayer(playerId: string, reason: string, bannedBy: string): Promise<boolean> {
    try {
      const player = await this.getPlayer(playerId);
      if (!player) return false;

      // Add ban information
      (player as any).isBanned = true;
      (player as any).banReason = reason;
      (player as any).bannedBy = bannedBy;
      (player as any).bannedAt = new Date();

      await this.updatePlayer(player);
      
      this.logger.info(`Player ${player.username} banned by ${bannedBy}: ${reason}`);
      return true;
    } catch (error) {
      this.logger.error('Error banning player:', error);
      return false;
    }
  }

  /**
   * Unban player
   */
  public async unbanPlayer(playerId: string, unbannedBy: string): Promise<boolean> {
    try {
      const player = await this.getPlayer(playerId);
      if (!player) return false;

      // Remove ban information
      (player as any).isBanned = false;
      delete (player as any).banReason;
      delete (player as any).bannedBy;
      delete (player as any).bannedAt;

      await this.updatePlayer(player);
      
      this.logger.info(`Player ${player.username} unbanned by ${unbannedBy}`);
      return true;
    } catch (error) {
      this.logger.error('Error unbanning player:', error);
      return false;
    }
  }

  /**
   * Get player rank
   */
  public async getPlayerRank(playerId: string): Promise<number> {
    try {
      const rank = await this.databaseService.getPlayerRank(playerId);
      return rank;
    } catch (error) {
      this.logger.error('Error getting player rank:', error);
      return 0;
    }
  }

  /**
   * Update player rank
   */
  public async updatePlayerRank(playerId: string, newRank: number): Promise<boolean> {
    try {
      const player = await this.getPlayer(playerId);
      if (!player) return false;

      player.rank = newRank;
      await this.updatePlayer(player);
      
      this.logger.info(`Player ${player.username} rank updated to ${newRank}`);
      return true;
    } catch (error) {
      this.logger.error('Error updating player rank:', error);
      return false;
    }
  }
}
