export interface BattlePlayer {
  id: string;
  username: string;
  avatar?: string;
  isHost: boolean;
  isReady: boolean;
  score: number;
  lives: number;
  streak: number;
  totalCorrect: number;
  totalIncorrect: number;
  averageReactionTime: number;
  lastAnswerTime: number;
  isAlive: boolean;
  rank: number;
  powerUps: PowerUp[];
  achievements: BattleAchievement[];
  socketId: string;
  // Additional properties
  eliminations: number;
  winRate: number;
  totalPlayTime: number;
  lastActive: Date;
  fastestAnswer: number;
  perfectAnswers: number;
}

export interface BattleRoom {
  id: string;
  name: string;
  maxPlayers: number;
  currentPlayers: number;
  players: BattlePlayer[];
  status: BattleStatus;
  gameMode: BattleGameMode;
  timeLimit: number;
  livesPerPlayer: number;
  isPrivate: boolean;
  password?: string;
  createdAt: Date;
  startedAt?: Date;
  endedAt?: Date;
  winner?: string;
  settings: BattleSettings;
  currentRound?: number;
}

export interface BattleSettings {
  instructionTypes: string[];
  difficulty: BattleDifficulty;
  powerUpsEnabled: boolean;
  spectateMode: boolean;
  autoStart: boolean;
  countdownDuration: number;
}

export interface PowerUp {
  id: string;
  type: PowerUpType;
  name: string;
  description: string;
  icon: string;
  duration: number;
  effect: PowerUpEffect;
  rarity: PowerUpRarity;
}

export interface PowerUpEffect {
  type: 'boost' | 'shield' | 'time' | 'score' | 'life';
  value: number;
  description: string;
}

export interface BattleAchievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  rarity: AchievementRarity;
  points: number;
}

export interface BattleStats {
  gamesPlayed: number;
  gamesWon: number;
  totalScore: number;
  bestStreak: number;
  averageReactionTime: number;
  fastestAnswer: number;
  perfectAnswers: number;
  totalPlayTime: number;
  winRate: number;
  eliminations: number;
  achievements: number;
}

export interface BattleAnswer {
  playerId: string;
  answer: string;
  isCorrect: boolean;
  score: number;
  reactionTime: number;
  timestamp: number;
}

export interface BattleEvent {
  type: BattleEventType;
  playerId?: string;
  data: any;
  timestamp: number;
}

export interface RoundResult {
  roundNumber: number;
  players: {
    playerId: string;
    answer: string;
    isCorrect: boolean;
    score: number;
    reactionTime: number;
    lives: number;
    streak: number;
  }[];
  winner?: string;
  duration: number;
}

export interface LeaderboardEntry {
  rank: number;
  playerId: string;
  username: string;
  score: number;
  winRate: number;
  totalGames: number;
  bestStreak: number;
  fastestAnswer: number;
  perfectAnswers: number;
}

// Enums
export type BattleStatus = 'waiting' | 'countdown' | 'active' | 'paused' | 'finished';

export type BattleGameMode = 'quick-battle' | 'elimination' | 'time-attack' | 'classic' | 'sudden-death' | 'battle-royale' | 'team-battle' | 'capture-the-flag';

export type BattleDifficulty = 'easy' | 'medium' | 'hard';

export type PowerUpType = 'shield' | 'time-freeze' | 'score-multiplier' | 'life-steal' | 'speed-boost' | 'mind-reader';

export type PowerUpRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export type AchievementRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export type BattleEventType = 'player_joined' | 'player_left' | 'player_ready' | 'game_started' | 'round_started' | 'answer_submitted' | 'round_ended' | 'game_ended' | 'powerup_activated' | 'achievement_unlocked';

// WebSocket event interfaces
export interface WebSocketEvent {
  type: string;
  data: any;
  timestamp: number;
}

export interface CreateRoomEvent {
  name: string;
  gameMode: BattleGameMode;
  maxPlayers: number;
  timeLimit: number;
  difficulty: BattleDifficulty;
  powerUpsEnabled: boolean;
  isPrivate?: boolean;
  password?: string;
}

export interface JoinRoomEvent {
  roomId: string;
  player: {
    username: string;
    avatar?: string;
  };
  password?: string;
}

export interface ReadySignalEvent {
  roomId: string;
  playerId: string;
}

export interface SubmitAnswerEvent {
  roomId: string;
  playerId: string;
  answer: string;
  reactionTime: number;
}

export interface ActivatePowerUpEvent {
  roomId: string;
  playerId: string;
  powerUpType: PowerUpType;
}

export interface LeaveRoomEvent {
  roomId: string;
  playerId: string;
}

export interface KickPlayerEvent {
  roomId: string;
  playerId: string;
  kickedByPlayerId: string;
}

export interface UpdateRoomSettingsEvent {
  roomId: string;
  settings: Partial<BattleSettings>;
}

// Response interfaces
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface RoomCreatedResponse {
  room: BattleRoom;
  player: BattlePlayer;
}

export interface RoomJoinedResponse {
  room: BattleRoom;
  player: BattlePlayer;
}

export interface BattleStartedResponse {
  roomId: string;
  instruction: any;
  roundNumber: number;
  timeLimit: number;
  roundStartTime: number;
}

export interface AnswerSubmittedResponse {
  playerId: string;
  answer: string;
  isCorrect: boolean;
  score: number;
  streak: number;
  lives: number;
  reactionTime: number;
}

export interface RoundEndedResponse {
  roomId: string;
  roundNumber: number;
  nextInstruction: any;
  playerStats: {
    id: string;
    username: string;
    score: number;
    lives: number;
    streak: number;
  }[];
  roundStartTime: number;
}

export interface GameEndedResponse {
  roomId: string;
  winner?: string;
  finalScores: {
    id: string;
    username: string;
    score: number;
    streak: number;
    lives: number;
    totalCorrect: number;
    totalIncorrect: number;
    averageReactionTime: number;
    fastestAnswer: number;
    perfectAnswers: number;
  }[];
  gameStats: {
    totalRounds: number;
    duration: number;
  };
}

export interface PowerUpActivatedResponse {
  playerId: string;
  powerUpType: PowerUpType;
  effect: string;
}

export interface PlayerReadyResponse {
  playerId: string;
}

export interface AllPlayersReadyResponse {
  roomId: string;
  countdownDuration: number;
}

export interface CountdownStartedResponse {
  duration: number;
}

export interface PlayerJoinedResponse {
  player: BattlePlayer;
}

export interface PlayerLeftResponse {
  playerId: string;
  reason: string;
}

export interface KickedFromRoomResponse {
  roomId: string;
  reason: string;
}

export interface ErrorResponse {
  error: string;
  message: string;
  details?: any;
}

// Game state interfaces
export interface GameState {
  roomId: string;
  currentRound: number;
  maxRounds: number;
  currentInstruction: any;
  roundStartTime: number;
  roundEndTime: number;
  playersAnswered: Set<string>;
  roundResults: any[];
  gamePhase: 'active' | 'paused' | 'ended';
}

export interface Instruction {
  id: string;
  type: 'direction' | 'color' | 'action' | 'mixed';
  text: string;
  correctAnswer: string;
  acceptableAnswers?: string[];
  difficulty: BattleDifficulty;
  timeLimit: number;
  points: number;
  category: string;
  tags: string[];
}

// Statistics interfaces
export interface PlayerStatistics {
  playerId: string;
  username: string;
  totalGames: number;
  gamesWon: number;
  gamesLost: number;
  winRate: number;
  totalScore: number;
  averageScore: number;
  bestScore: number;
  bestStreak: number;
  averageReactionTime: number;
  fastestAnswer: number;
  perfectAnswers: number;
  totalPlayTime: number;
  eliminations: number;
  achievements: BattleAchievement[];
  rank: number;
  lastActive: Date;
}

export interface RoomStatistics {
  roomId: string;
  name: string;
  status: BattleStatus;
  playerCount: number;
  maxPlayers: number;
  gameMode: BattleGameMode;
  difficulty: BattleDifficulty;
  createdAt: Date;
  startedAt?: Date;
  endedAt?: Date;
  duration?: number;
  players: {
    id: string;
    username: string;
    isHost: boolean;
    isReady: boolean;
    score: number;
    lives: number;
    streak: number;
  }[];
}

export interface GlobalStatistics {
  totalPlayers: number;
  totalRooms: number;
  activeRooms: number;
  averageScore: number;
  maxScore: number;
  averageWinRate: number;
  totalCorrectAnswers: number;
  totalIncorrectAnswers: number;
  totalGamesPlayed: number;
  totalPlayTime: number;
}

// Configuration interfaces
export interface ServerConfig {
  port: number;
  host: string;
  environment: 'development' | 'production' | 'test';
  cors: {
    origin: string | string[];
    credentials: boolean;
  };
  database: {
    host: string;
    port: number;
    name: string;
    user: string;
    password: string;
  };
  redis: {
    url: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
  rateLimiting: {
    enabled: boolean;
    windowMs: number;
    maxRequests: number;
  };
}

export interface GameConfig {
  maxPlayersPerRoom: number;
  minPlayersToStart: number;
  maxRoundsPerGame: number;
  defaultTimeLimit: number;
  defaultLives: number;
  powerUpChance: number;
  achievementPoints: {
    common: number;
    uncommon: number;
    rare: number;
    epic: number;
    legendary: number;
  };
  difficultyMultipliers: {
    easy: number;
    medium: number;
    hard: number;
  };
}
