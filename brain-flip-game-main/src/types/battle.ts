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
}

export type BattleStatus = 'waiting' | 'starting' | 'active' | 'finished' | 'cancelled';

export type BattleGameMode = 'quick-battle' | 'elimination' | 'time-attack' | 'classic' | 'sudden-death' | 'battle-royale' | 'team-battle' | 'capture-the-flag';

export interface BattleSettings {
  instructionTypes: string[];
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
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
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export type PowerUpType = 'shield' | 'time-freeze' | 'score-multiplier' | 'life-steal' | 'speed-boost' | 'mind-reader';

export interface PowerUpEffect {
  type: PowerUpType;
  value: number;
  description: string;
}

export interface BattleAchievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
}

export interface BattleEvent {
  type: BattleEventType;
  playerId: string;
  timestamp: Date;
  data: unknown;
}

export type BattleEventType = 
  | 'player_joined'
  | 'player_left'
  | 'player_ready'
  | 'game_started'
  | 'instruction_generated'
  | 'answer_submitted'
  | 'power_up_activated'
  | 'player_eliminated'
  | 'battle_ended'
  | 'achievement_unlocked';

export interface BattleStats {
  totalBattles: number;
  wins: number;
  losses: number;
  winRate: number;
  totalScore: number;
  averageScore: number;
  bestScore: number;
  totalPlayTime: number;
  achievements: BattleAchievement[];
  powerUpsUsed: number;
  eliminations: number;
  rank: number;
}

export interface BattleLeaderboard {
  playerId: string;
  username: string;
  avatar?: string;
  score: number;
  rank: number;
  wins: number;
  totalBattles: number;
  winRate: number;
  lastActive: Date;
}

export interface BattleInvitation {
  id: string;
  fromPlayerId: string;
  toPlayerId: string;
  roomId: string;
  roomName: string;
  gameMode: BattleGameMode;
  expiresAt: Date;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
}
