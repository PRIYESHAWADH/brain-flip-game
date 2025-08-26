// ULTIMATE BRAIN FLIP MULTIPLAYER TYPES - STATE OF THE ART

export interface Player {
	id: string;
	name: string;
	avatar: string;
	score: number;
	streak: number;
	isReady: boolean;
	isConnected: boolean;
	lastAnswer?: string;
	reactionTime?: number;
	powerUps: PowerUp[];
	status: PlayerStatus;
	rank: number;
	level: number;
	experience: number;
	achievements: Achievement[];
	statistics: PlayerStatistics;
}

export interface PlayerStatus {
	health: number;
	shield: boolean;
	speedBoost: boolean;
	timeFreeze: boolean;
	lastAction: string;
	lastActionTime: number;
}

export interface PlayerStatistics {
	totalBattles: number;
	wins: number;
	losses: number;
	winRate: number;
	bestStreak: number;
	averageReactionTime: number;
	totalPoints: number;
	tournamentWins: number;
}

export interface PowerUp {
	id: string;
	type: 'timeFreeze' | 'doublePoints' | 'shield' | 'speedBoost' | 'mindSwap' | 'chaosMode' | 'finalCountdown';
	name: string;
	description: string;
	duration: number;
	effect: PowerUpEffect;
	icon: string;
	rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface PowerUpEffect {
	type: string;
	value: number;
	target: 'self' | 'opponent' | 'all';
	duration: number;
}

export interface BattleRoom {
	id: string;
	mode: 'duel' | 'battle-royale' | 'tournament';
	state: 'waiting' | 'countdown' | 'playing' | 'results' | 'finished';
	players: Player[];
	spectators: Spectator[];
	currentRound: number;
	maxRounds: number;
	instruction: Instruction;
	timer: number;
	roundResults: RoundResult[];
	powerUps: PowerUp[];
	events: BattleEvent[];
	chat: ChatMessage[];
	highlights: Highlight[];
	settings: BattleSettings;
	createdAt: number;
	startedAt?: number;
	endedAt?: number;
}

export interface BattleSettings {
	maxPlayers: number;
	roundTimeLimit: number;
	maxRounds: number;
	powerUpsEnabled: boolean;
	spectatorsAllowed: boolean;
	chatEnabled: boolean;
	highlightRecording: boolean;
	rankingEnabled: boolean;
}

export interface Spectator {
	id: string;
	name: string;
	avatar: string;
	joinedAt: number;
	isBetting: boolean;
	betAmount?: number;
	betTarget?: string;
}

export interface RoundResult {
	roundNumber: number;
	instruction: Instruction;
	playerResults: PlayerRoundResult[];
	winner?: string;
	highlights: Highlight[];
	powerUpsUsed: PowerUp[];
	events: BattleEvent[];
	timestamp: number;
}

export interface PlayerRoundResult {
	playerId: string;
	answer: string;
	reactionTime: number;
	isCorrect: boolean;
	pointsEarned: number;
	bonuses: Bonus[];
	powerUpsUsed: PowerUp[];
}

export interface Bonus {
	type: 'speed' | 'accuracy' | 'streak' | 'comeback' | 'mindReading' | 'bluff';
	value: number;
	description: string;
}

export interface BattleEvent {
	id: string;
	type: 'powerUpUsed' | 'playerEliminated' | 'streakBroken' | 'comeback' | 'mindReading' | 'bluff' | 'chaosMode';
	playerId?: string;
	targetId?: string;
	data: unknown;
	timestamp: number;
}

export interface ChatMessage {
	id: string;
	playerId: string;
	playerName: string;
	message: string;
	timestamp: number;
	type: 'normal' | 'system' | 'highlight' | 'bet';
}

export interface Highlight {
	id: string;
	type: 'epicAnswer' | 'comeback' | 'mindReading' | 'bluff' | 'elimination' | 'victory';
	playerId: string;
	description: string;
	timestamp: number;
	data: unknown;
}

export interface Instruction {
	id: string;
	type: 'direction' | 'color' | 'action' | 'combo';
	display: string;
	correctAnswer: string;
	acceptableAnswers: string[];
	timeLimit: number;
	displayColor?: string;
	isReversed?: boolean;
	battleSpecific?: BattleSpecificInstruction;
}

export interface BattleSpecificInstruction {
	type: 'copyOpponent' | 'avoidOpponent' | 'speedVsAccuracy' | 'doubleTrouble' | 'chaosMode';
	targetPlayerId?: string;
	opponentAnswer?: string;
	additionalData?: unknown;
}

export interface Tournament {
	id: string;
	name: string;
	mode: 'single-elimination' | 'double-elimination' | 'swiss';
	players: Player[];
	brackets: Bracket[];
	currentRound: number;
	maxRounds: number;
	state: 'registration' | 'active' | 'finished';
	prizePool: PrizePool;
	settings: TournamentSettings;
	createdAt: number;
	startedAt?: number;
	endedAt?: number;
}

export interface Bracket {
	id: string;
	round: number;
	matches: Match[];
	players: Player[];
	state: 'waiting' | 'active' | 'finished';
}

export interface Match {
	id: string;
	player1Id: string;
	player2Id: string;
	winnerId?: string;
	score: [number, number];
	state: 'waiting' | 'active' | 'finished';
	roomId?: string;
}

export interface PrizePool {
	total: number;
	distribution: PrizeDistribution[];
	currency: 'coins' | 'tokens' | 'points';
}

export interface PrizeDistribution {
	rank: number;
	percentage: number;
	amount: number;
	title?: string;
	achievement?: Achievement;
}

export interface TournamentSettings {
	maxPlayers: number;
	registrationDeadline: number;
	startTime: number;
	roundTimeLimit: number;
	powerUpsEnabled: boolean;
	spectatorsAllowed: boolean;
	rankingEnabled: boolean;
}

export interface Achievement {
	id: string;
	name: string;
	description: string;
	icon: string;
	rarity: 'common' | 'rare' | 'epic' | 'legendary';
	unlockedAt?: number;
	progress?: number;
	maxProgress?: number;
}

export interface MultiplayerState {
	rooms: Map<string, BattleRoom>;
	tournaments: Map<string, Tournament>;
	playerSessions: Map<string, PlayerSession>;
	globalChat: ChatMessage[];
	leaderboards: Leaderboard[];
	notifications: Notification[];
}

export interface PlayerSession {
	playerId: string;
	currentRoomId?: string;
	currentTournamentId?: string;
	lastActivity: number;
	connectionStatus: 'connected' | 'disconnected' | 'reconnecting';
	latency: number;
}

export interface Leaderboard {
	id: string;
	type: 'global' | 'seasonal' | 'tournament' | 'skill';
	entries: LeaderboardEntry[];
	lastUpdated: number;
}

export interface LeaderboardEntry {
	rank: number;
	playerId: string;
	playerName: string;
	score: number;
	statistics: PlayerStatistics;
	lastUpdated: number;
}

export interface Notification {
	id: string;
	type: 'battle' | 'tournament' | 'achievement' | 'system';
	title: string;
	message: string;
	data?: unknown;
	timestamp: number;
	read: boolean;
}

// ULTIMATE MULTIPLAYER EVENTS
export type MultiplayerEvent = 
	| { type: 'playerJoined'; player: Player; roomId: string }
	| { type: 'playerLeft'; playerId: string; roomId: string }
	| { type: 'gameStarted'; roomId: string }
	| { type: 'instructionChanged'; instruction: Instruction; roomId: string }
	| { type: 'answerSubmitted'; playerId: string; answer: string; reactionTime: number; roomId: string }
	| { type: 'roundEnded'; result: RoundResult; roomId: string }
	| { type: 'gameEnded'; winner: Player; roomId: string }
	| { type: 'powerUpUsed'; playerId: string; powerUp: PowerUp; roomId: string }
	| { type: 'playerEliminated'; playerId: string; roomId: string }
	| { type: 'chatMessage'; message: ChatMessage; roomId: string }
	| { type: 'highlightCreated'; highlight: Highlight; roomId: string }
	| { type: 'tournamentStarted'; tournamentId: string }
	| { type: 'tournamentEnded'; tournamentId: string; winner: Player }
	| { type: 'achievementUnlocked'; playerId: string; achievement: Achievement };
