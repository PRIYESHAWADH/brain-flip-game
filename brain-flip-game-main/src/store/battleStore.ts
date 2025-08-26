import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { PowerUp, BattleAchievement, BattleGameMode, BattleStatus } from '@/types/battle';

// Enhanced Battle Player Interface - Production Ready
interface BattlePlayer {
	id: string;
	username: string;  // Primary identifier for compatibility
	name?: string;     // Display name (optional for backward compatibility)
	avatar?: string;
	score: number;
	streak: number;
	lives: number;
	isReady: boolean;
	isHost: boolean;
	lastAnswerTime: number;
	position: number;
	isConnected: boolean;
	totalCorrect: number;
	totalAnswered: number;
	totalIncorrect: number;
	averageReactionTime: number;
	isAlive: boolean;
	// Enhanced scoring and achievements
	powerUps: PowerUp[];
	comboMultiplier: number;
	perfectAnswers: number;
	fastestAnswer: number;
	achievements: BattleAchievement[];  // Full achievement objects
	rank: number;
	experience: number;
	level: number;
	// Advanced stats
	eliminations: number;
	winRate: number;
	totalPlayTime: number;
	lastActive: Date;
}

// Enhanced Battle Room Interface
interface BattleRoom {
	id: string;
	name: string;
	players: BattlePlayer[];
	maxPlayers: number;
	currentPlayers: number;  // ADD THIS - for compatibility with battle.ts
	gameMode: 'quick-battle' | 'elimination' | 'time-attack';
	status: 'waiting' | 'starting' | 'active' | 'finished';
	currentRound: number;
	totalRounds: number;
	timeLimit: number;
	livesPerPlayer: number;  // ADD THIS - for compatibility with battle.ts
	startTime?: number;
	winner?: BattlePlayer;
	createdAt: number;

	roundResults: RoundResult[];
	powerUpEvents: PowerUpEvent[];
	leaderboard: LeaderboardEntry[];
	settings: BattleSettings;
}

interface RoundResult {
	roundNumber: number;
	winner: BattlePlayer;
	fastestAnswer: BattlePlayer;
	perfectAnswer: BattlePlayer;
	roundDuration: number;
	participants: number;
}

interface PowerUpEvent {
	id: string;
	type: 'double-points' | 'shield' | 'time-freeze' | 'combo-boost' | 'life-steal';
	playerId: string;
	roundNumber: number;
	effect: string;
	duration: number;
}

interface LeaderboardEntry {
	playerId: string;
	playerName: string;
	score: number;
	streak: number;
	perfectAnswers: number;
	fastestAnswer: number;
	rank: number;
}

interface BattleSettings {
	powerUpsEnabled: boolean;
	achievementsEnabled: boolean;
	rankingEnabled: boolean;
	spectatorMode: boolean;
	timeLimit: number;
	roundsToWin: number;
	difficulty: string;  // ADD THIS - for compatibility with battle.ts
}

// Enhanced Battle Answer Interface
interface BattleAnswer {
	playerId: string;
	answer: string;
	reactionTime: number;
	isCorrect: boolean;
	timestamp: number;
	instructionId: string;

	score: number;
	bonusPoints: number;
	comboMultiplier: number;
	powerUpUsed?: string;
	achievementEarned?: string;
}

// Enhanced Battle Event Interface
interface BattleEvent {
	type: 'player_joined' | 'player_left' | 'player_ready' | 'game_started' | 'answer_submitted' | 'round_ended' | 'game_ended' | 'power_up_activated' | 'achievement_earned' | 'leaderboard_updated';
	data: unknown;
	timestamp: number;
}

// WebSocket Connection Status
type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

// Enhanced Battle Store Interface
interface BattleStore {
	// Connection State
	isConnected: boolean;
	connectionStatus: ConnectionStatus;
	reconnectAttempts: number;
	
	// Room State
  currentRoom: BattleRoom | null;
  availableRooms: BattleRoom[];
	localPlayer: BattlePlayer | null;
	
	// Battle Game State
	currentInstruction: unknown | null;  // ADD THIS
	timeRemaining: number;           // ADD THIS
	isBattleActive: boolean;        // ADD THIS
	
	// UI State
	isLoading: boolean;             // ADD THIS
	error: string | null;           // ADD THIS
	
	// Game State
	battleAnswers: BattleAnswer[];
	currentInstructionId: string | null;
	roundStartTime: number | null;

	battleStats: {
		gamesPlayed: number;
		gamesWon: number;
		totalScore: number;
		bestStreak: number;
		averageReactionTime: number;

		perfectAnswers: number;
		fastestAnswers: number;
		powerUpsUsed: number;
		achievementsUnlocked: number;
		highestCombo: number;
		totalExperience: number;
		currentRank: number;
		rankProgress: number;
	};

	activePowerUps: PowerUpEvent[];
	availablePowerUps: string[];
	recentAchievements: BattleAchievement[];
	
	// WebSocket connection (would be actual WebSocket in production)
	ws: WebSocket | null;
  
  // Actions
	connect: () => Promise<void>;
	disconnect: () => void;
	createRoom: (config: { name: string; gameMode: 'quick-battle' | 'elimination' | 'time-attack'; maxPlayers: number; timeLimit: number }, playerName: string) => void;
	joinRoom: (roomId: string, playerName: string) => void;
  leaveRoom: () => void;
	sendReadySignal: () => void;
	submitBattleAnswer: (answer: string, reactionTime: number, isCorrect: boolean) => void;
	updatePlayerScore: (playerId: string, score: number, streak: number) => void;
	setRoundStartTime: (time: number) => void;
	
	// Missing functions that components need
	startBattle: () => void;                           // ADD THIS
	updateRoomSettings: (settings: unknown) => void;      // ADD THIS
	kickPlayer: (playerId: string) => void;           // ADD THIS
	transferHost: (playerId: string) => void;         // ADD THIS
	clearError: () => void;                           // ADD THIS
	submitAnswer: (answer: string, correct: boolean) => void;  // ADD THIS
	endBattle: () => void;                            // ADD THIS

	activatePowerUp: (powerUpType: string) => void;
	calculateBattleScore: (reactionTime: number, isCorrect: boolean, streak: number, powerUps: string[]) => number;
	updateLeaderboard: () => void;
	determineWinner: () => BattlePlayer | null;
	processRoundResults: () => void;
	awardAchievements: (playerId: string, action: string) => void;
	updatePlayerRank: (playerId: string) => void;
	
	// Event Handlers
	handlePlayerJoined: (player: BattlePlayer) => void;
	handlePlayerLeft: (playerId: string) => void;
	handleGameStarted: () => void;
	handleRoundEnded: () => void;
	handleGameEnded: (winner: BattlePlayer) => void;

	handlePowerUpActivated: (event: PowerUpEvent) => void;
	handleAchievementEarned: (playerId: string, achievement: string) => void;
	handleLeaderboardUpdate: (leaderboard: LeaderboardEntry[]) => void;
}

class MockWebSocket {
	private callbacks: { [key: string]: Function[] } = {};
	private connected = false;
	
	constructor(private store: unknown) {}
	
	connect() {
		setTimeout(() => {
			this.connected = true;
			this.store.setState({ isConnected: true, connectionStatus: 'connected' as ConnectionStatus });
			this.emit('connected');
		}, 1000);
	}
	
	disconnect() {
		this.connected = false;
		this.store.setState({ isConnected: false, connectionStatus: 'disconnected' as ConnectionStatus });
	}
	
	send(data: unknown) {
		if (!this.connected) return;
		
		// Mock server responses

		
		switch (message.type) {
			case 'create_room':
				this.mockCreateRoom(message.data);
				break;
			case 'join_room':
				this.mockJoinRoom(message.data);
				break;
			case 'ready_signal':
				this.mockReadySignal(message.data);
				break;
			case 'submit_answer':
				this.mockSubmitAnswer(message.data);
				break;
			case 'activate_powerup':
				this.mockActivatePowerUp(message.data);
				break;
		}
	}
	
	private mockCreateRoom(data: unknown) {
		const room: BattleRoom = {
			id: `room_${Date.now()}`,
			name: data.roomName,
			players: [{
				id: `player_${Date.now()}`,
				username: data.playerName,
				name: data.playerName,
				score: 0,
				streak: 0,
				lives: 3,
				isReady: false,
				isHost: true,
				lastAnswerTime: 0,
				position: 1,
				isConnected: true,
				totalCorrect: 0,
				totalAnswered: 0,
				totalIncorrect: 0,
				averageReactionTime: 0,
				isAlive: true,
				powerUps: [],
				comboMultiplier: 1,
				perfectAnswers: 0,
				fastestAnswer: 0,
				achievements: [],
				rank: 1,
				experience: 0,
				level: 1,
				eliminations: 0,
				winRate: 0,
				totalPlayTime: 0,
				lastActive: new Date()
			}],
			maxPlayers: data.maxPlayers,
			currentPlayers: 1,             // ADD THIS
			gameMode: data.gameMode,
			status: 'waiting',
			currentRound: 0,
			totalRounds: data.gameMode === 'elimination' ? 10 : 5,
			timeLimit: data.timeLimit,
			livesPerPlayer: 3,             // ADD THIS
			createdAt: Date.now(),
			roundResults: [],
			powerUpEvents: [],
			leaderboard: [],
			settings: {
  			powerUpsEnabled: true,
				achievementsEnabled: true,
				rankingEnabled: true,
				spectatorMode: false,
				timeLimit: data.timeLimit,
				roundsToWin: data.gameMode === 'elimination' ? 5 : 3,
				difficulty: 'medium'       // ADD THIS
			}
		};
		
		this.store.setState({
			currentRoom: room,
			localPlayer: room.players[0]
		});
	}
	
	private mockJoinRoom(data: unknown) {
		// Mock joining an existing room
		const newPlayer: BattlePlayer = {
			id: `player_${Date.now()}`,
			username: data.playerName,
			name: data.playerName,
			score: 0,
			streak: 0,
			lives: 3,
			isReady: false,
			isHost: false,
			lastAnswerTime: 0,
			position: 2,
			isConnected: true,
			totalCorrect: 0,
			totalAnswered: 0,
			totalIncorrect: 0,
			averageReactionTime: 0,
			isAlive: true,
			powerUps: [],
			comboMultiplier: 1,
			perfectAnswers: 0,
			fastestAnswer: 0,
			achievements: [],
			rank: 1,
			experience: 0,
			level: 1,
			eliminations: 0,
			winRate: 0,
			totalPlayTime: 0,
			lastActive: new Date()
		};

		if (currentRoom && currentRoom.players.length < currentRoom.maxPlayers) {
			const updatedRoom = {
				...currentRoom,
				players: [...currentRoom.players, newPlayer]
			};
			
			this.store.setState({
				currentRoom: updatedRoom,
				localPlayer: newPlayer
			});
		}
	}
	
	private mockReadySignal(data: unknown) {
		if (!currentRoom) return;

		const updatedPlayers = currentRoom.players.map(player =>
			player.id === data.playerId ? { ...player, isReady: true } : player
		);

		const updatedRoom = {
			...currentRoom,
			players: updatedPlayers
		};
		
		this.store.setState({ currentRoom: updatedRoom });
		
		// If all players are ready, start the game
		if (updatedPlayers.every(p => p.isReady) && updatedPlayers.length >= 2) {
			setTimeout(() => {
				this.store.setState({
					currentRoom: { ...updatedRoom, status: 'active' as const },
					roundStartTime: Date.now()
				});
			}, 3000);
		}
	}
	
	private mockSubmitAnswer(data: unknown) {
		const answer: BattleAnswer = {
			playerId: data.playerId,
			answer: data.answer,
			reactionTime: data.reactionTime,
			isCorrect: data.isCorrect,
			timestamp: Date.now(),
			instructionId: data.instructionId,
			score: data.score || 0,
			bonusPoints: data.bonusPoints || 0,
			comboMultiplier: data.comboMultiplier || 1,
			powerUpUsed: data.powerUpUsed,
			achievementEarned: data.achievementEarned
		};
		
		this.store.setState((state: unknown) => ({
			battleAnswers: [...state.battleAnswers, answer]
		}));
		
		// Update player score
		if (data.isCorrect) {
			this.store.getState().updatePlayerScore(data.playerId, data.score || 10, data.streak || 1);
		}
	}
	
	private mockActivatePowerUp(data: unknown) {
		const powerUpEvent: PowerUpEvent = {
			id: `powerup_${Date.now()}`,
			type: data.powerUpType as any,
			playerId: data.playerId,
			roundNumber: data.roundNumber || 1,
			effect: data.effect || 'Power-up activated',
			duration: data.duration || 10000
		};
		
		this.store.setState((state: unknown) => ({
			activePowerUps: [...state.activePowerUps, powerUpEvent]
		}));
	}
	
	on(event: string, callback: Function) {
		if (!this.callbacks[event]) {
			this.callbacks[event] = [];
		}
		this.callbacks[event].push(callback);
	}
	
	private emit(event: string, data?: unknown) {
		if (this.callbacks[event]) {
			this.callbacks[event].forEach(callback => callback(data));
		}
	}
}

export const useBattleStore = create<BattleStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial State
		isConnected: false,
		connectionStatus: 'disconnected',
		reconnectAttempts: 0,
    currentRoom: null,
    availableRooms: [],
		localPlayer: null,
		
		// Battle Game State
		currentInstruction: null,     // ADD THIS
		timeRemaining: 0,             // ADD THIS
		isBattleActive: false,        // ADD THIS
		
		// UI State
		isLoading: false,             // ADD THIS
		error: null,                  // ADD THIS
		
		battleAnswers: [],
		currentInstructionId: null,
		roundStartTime: null,
		battleStats: {
			gamesPlayed: 0,
			gamesWon: 0,
			totalScore: 0,
			bestStreak: 0,
			averageReactionTime: 0,
			perfectAnswers: 0,
			fastestAnswers: 0,
			powerUpsUsed: 0,
			achievementsUnlocked: 0,
			highestCombo: 0,
			totalExperience: 0,
			currentRank: 1,
			rankProgress: 0
		},
		activePowerUps: [],
		availablePowerUps: ['double-points', 'shield', 'time-freeze', 'combo-boost', 'life-steal'],
		recentAchievements: [],
		ws: null,
		
		// Actions
		connect: async () => {
			set({ connectionStatus: 'connecting' });
			
			// In production, this would be a real WebSocket connection

			set({ ws: mockWs as any });
			
			mockWs.connect();
		},
		
		disconnect: () => {
			const { ws } = get();
			if (ws) {
				ws.close();
			}
			set({
				isConnected: false,
				connectionStatus: 'disconnected',
				ws: null,
				currentRoom: null,
				localPlayer: null
			});
		},
		
		createRoom: (config, playerName) => {
			const { ws } = get();
			if (!ws) return;
			
			ws.send(JSON.stringify({
				type: 'create_room',
				data: {
					roomName: config.name,
					playerName,
					gameMode: config.gameMode,
					maxPlayers: config.maxPlayers,
					timeLimit: config.timeLimit
				}
			}));
		},
		
		joinRoom: (roomId, playerName) => {
			const { ws } = get();
			if (!ws) return;
			
			ws.send(JSON.stringify({
				type: 'join_room',
				data: {
					roomId,
					playerName
				}
			}));
		},
		
		leaveRoom: () => {
			const { ws, currentRoom } = get();
			if (!ws || !currentRoom) return;
			
			ws.send(JSON.stringify({
				type: 'leave_room',
				data: {
					roomId: currentRoom.id
				}
			}));
			
			set({
				currentRoom: null,
				localPlayer: null,
				battleAnswers: [],
				roundStartTime: null
			});
		},
		
		sendReadySignal: () => {
			const { ws, localPlayer, currentRoom } = get();
			if (!ws || !localPlayer || !currentRoom) return;
			
			// Update local state immediately
		const updatedPlayer = { ...localPlayer, isReady: true };
		const updatedPlayers = currentRoom.players.map(p =>
			p.id === localPlayer.id ? updatedPlayer : p
		);
			
			set({
				localPlayer: updatedPlayer,
				currentRoom: { ...currentRoom, players: updatedPlayers }
			});
			
			ws.send(JSON.stringify({
				type: 'ready_signal',
				data: {
					playerId: localPlayer.id,
					roomId: currentRoom.id
				}
			}));
		},
		
		submitBattleAnswer: (answer, reactionTime, isCorrect) => {
			const { ws, localPlayer, currentRoom, currentInstructionId } = get();
			if (!ws || !localPlayer || !currentRoom) return;
			
					// Calculate comprehensive score
		const score = get().calculateBattleScore(reactionTime, isCorrect, localPlayer.streak, localPlayer.powerUps.map(p => p.type));
		const newStreak = isCorrect ? localPlayer.streak + 1 : 0;
		
		// Update local player stats
		const updatedPlayer = {
			...localPlayer,
			score: localPlayer.score + score,
			streak: newStreak,
			totalAnswered: localPlayer.totalAnswered + 1,
			totalCorrect: localPlayer.totalCorrect + (isCorrect ? 1 : 0),
			averageReactionTime: (localPlayer.averageReactionTime * localPlayer.totalAnswered + reactionTime) / (localPlayer.totalAnswered + 1),
			perfectAnswers: localPlayer.perfectAnswers + (reactionTime < 200 ? 1 : 0),
			fastestAnswer: localPlayer.fastestAnswer === 0 || reactionTime < localPlayer.fastestAnswer ? reactionTime : localPlayer.fastestAnswer
		};
			
			set({ localPlayer: updatedPlayer });
			
			ws.send(JSON.stringify({
				type: 'submit_answer',
				data: {
					playerId: localPlayer.id,
					roomId: currentRoom.id,
					answer,
					reactionTime,
					isCorrect,
					score,
					streak: newStreak,
					instructionId: currentInstructionId
				}
			}));
		},
		
		updatePlayerScore: (playerId, score, streak) => {
      const { currentRoom } = get();
      if (!currentRoom) return;

			const updatedPlayers = currentRoom.players.map(player =>
				player.id === playerId 
					? { ...player, score, streak }
					: player
			);
      
      set({ 
				currentRoom: { ...currentRoom, players: updatedPlayers }
			});
		},
		
		setRoundStartTime: (time) => {
			set({ roundStartTime: time });
		},
		
		// Missing functions that components need
		startBattle: () => {
			const { currentRoom } = get();
			if (!currentRoom) return;
			
			set({
				currentRoom: { ...currentRoom, status: 'active' as const },
				isBattleActive: true,
				roundStartTime: Date.now()
			});
		},
		
		updateRoomSettings: (settings) => {
			const { currentRoom } = get();
			if (!currentRoom) return;
			
			set({
				currentRoom: {
					...currentRoom,
					settings: { ...currentRoom.settings, ...settings }
				}
			});
		},
		
		kickPlayer: (playerId) => {
			const { currentRoom } = get();
			if (!currentRoom) return;

			set({
				currentRoom: {
					...currentRoom,
					players: updatedPlayers,
					currentPlayers: updatedPlayers.length
				}
			});
		},
		
		transferHost: (playerId) => {
			const { currentRoom } = get();
			if (!currentRoom) return;

			const updatedPlayers = currentRoom.players.map(p => ({
				...p,
				isHost: p.id === playerId
			}));
			
			set({
				currentRoom: { ...currentRoom, players: updatedPlayers }
			});
		},
		
		clearError: () => {
			set({ error: null });
		},
		
		submitAnswer: (answer, correct) => {
			const { localPlayer } = get();
			if (!localPlayer) return;
			const reactionTime = Date.now() - get().roundStartTime;

			get().submitBattleAnswer(answer, reactionTime, correct);
		},
		
		endBattle: () => {
			const { currentRoom } = get();
			if (!currentRoom) return;
			
			set({
				currentRoom: { ...currentRoom, status: 'finished' as const },
				isBattleActive: false
			});
		},

		activatePowerUp: (powerUpType) => {
			const { ws, localPlayer, currentRoom } = get();
			if (!ws || !localPlayer || !currentRoom) return;
			
			// Check if player has power-ups available
			if (localPlayer.powerUps.length <= 0) return;
			
			// Validate power-up type
			const validPowerUps = ['shield', 'time-freeze', 'score-multiplier', 'life-steal', 'speed-boost', 'mind-reader'];
			if (!validPowerUps.includes(powerUpType)) {
				set({ error: 'Invalid power-up type' });
				return;
			}
			
			// Check cooldown and availability
			const powerUp = localPlayer.powerUps.find(p => p.type === powerUpType && p.isAvailable);
			if (!powerUp) {
				set({ error: 'Power-up not available' });
				return;
			}
			
			// Update local player (remove used power-up)
			const updatedPlayer = {
				...localPlayer,
				powerUps: localPlayer.powerUps.filter(p => p.id !== powerUp.id)
			};
			set({ localPlayer: updatedPlayer });
			
			// Apply immediate effects
			switch (powerUpType) {
				case 'shield':
					// Player is immune to next attack
					break;
				case 'time-freeze':
					// Freeze opponent's timer
					break;
				case 'score-multiplier':
					// Double score for next answer
					updatedPlayer.comboMultiplier = 2;
					break;
				case 'life-steal':
					// Steal a life from opponent
					break;
				case 'speed-boost':
					// Faster reaction time
					break;
				case 'mind-reader':
					// See opponent's answer
					break;
			}
			
			// Send to server
			ws.send(JSON.stringify({
				type: 'activate_powerup',
				data: {
					playerId: localPlayer.id,
					roomId: currentRoom.id,
					powerUpType,
					roundNumber: currentRoom.currentRound,
					effect: powerUp.effect,
					duration: powerUp.duration
				}
			}));
			
			// Clear error after successful activation
			set({ error: null });
		},
		
		calculateBattleScore: (reactionTime, isCorrect, streak, powerUps) => {
			if (!isCorrect) return 0;

			
			// Speed bonus
			if (reactionTime < 500) baseScore += 10;
			if (reactionTime < 200) baseScore += 20; // Perfect timing
			
			// Streak multiplier

			baseScore = Math.floor(baseScore * streakMultiplier);
			
			// Power-up bonuses
			if (powerUps.includes('double-points')) baseScore *= 2;
			if (powerUps.includes('combo-boost')) baseScore += streak * 5;
			
			return baseScore;
		},
		
		updateLeaderboard: () => {
			const { currentRoom } = get();
			if (!currentRoom) return;

			const leaderboard = currentRoom.players
				.map(player => ({
					playerId: player.id,
					playerName: player.name,
					score: player.score,
					streak: player.streak,
					perfectAnswers: player.perfectAnswers,
					fastestAnswer: player.fastestAnswer,
					rank: 0
				}))
				.sort((a, b) => b.score - a.score)
				.map((entry, index) => ({ ...entry, rank: index + 1 }));
			
      set({ 
				currentRoom: { ...currentRoom, leaderboard }
      });
    },
    
		determineWinner: () => {
			const { currentRoom } = get();
			if (!currentRoom) return null;
			
			// Sort players by score, then by fastest answer, then by perfect answers
			const sortedPlayers = currentRoom.players.sort((a, b) => {
				if (b.score !== a.score) return b.score - a.score;
				if (a.fastestAnswer !== b.fastestAnswer) return a.fastestAnswer - b.fastestAnswer;
				return b.perfectAnswers - a.perfectAnswers;
			});
			
			return sortedPlayers[0] || null;
		},
		
		processRoundResults: () => {
			const { currentRoom, roundStartTime } = get();
			if (!currentRoom || !roundStartTime) return;

			const roundDuration = Date.now() - roundStartTime;
			const fastestPlayer = currentRoom.players.reduce((fastest, current) =>
				current.fastestAnswer < fastest.fastestAnswer ? current : fastest
			);
			const perfectPlayer = currentRoom.players.reduce((best, current) =>
				current.perfectAnswers > best.perfectAnswers ? current : best
			);
			
			const roundResult: RoundResult = {
				roundNumber: currentRoom.currentRound,
				winner: get().determineWinner() || currentRoom.players[0],
				fastestAnswer: fastestPlayer,
				perfectAnswer: perfectPlayer,
				roundDuration,
				participants: currentRoom.players.length
			};
			
			set({
				currentRoom: {
          ...currentRoom,
					roundResults: [...currentRoom.roundResults, roundResult],
					currentRound: currentRoom.currentRound + 1
				}
			});
		},
		
		awardAchievements: (playerId, action) => {
			const { currentRoom } = get();
			if (!currentRoom) return;

			if (!player) return;
			
			const newAchievements: BattleAchievement[] = [];
			
			// Check for various achievements
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
			if (player.score >= 100 && !player.achievements.some(a => a.name === 'High Scorer')) {
				newAchievements.push({
					id: `achievement_${Date.now()}_4`,
					name: 'High Scorer',
					description: 'Score 100+ points',
					icon: '🏆',
					unlockedAt: new Date(),
					rarity: 'common',
					points: 50
				});
			}
			
			if (newAchievements.length > 0) {
				const updatedPlayer = {
					...player,
					achievements: [...player.achievements, ...newAchievements]
				};

				const updatedPlayers = currentRoom.players.map(p =>
					p.id === playerId ? updatedPlayer : p
				);
				
				set({
					currentRoom: { ...currentRoom, players: updatedPlayers },
					recentAchievements: [...get().recentAchievements, ...newAchievements]
				});
			}
		},
		
		updatePlayerRank: (playerId) => {
      const { currentRoom } = get();
      if (!currentRoom) return;
			const player = currentRoom.players.find(p => p.id === playerId);
			if (!player) return;
			
			// Calculate rank based on experience and achievements
			let newRank = 1;
			let newLevel = 1;
			
			if (player.experience >= 1000) {
				newRank = 2;
				newLevel = 2;
			}
			if (player.experience >= 2500) {
				newRank = 3;
				newLevel = 3;
			}
			if (player.experience >= 5000) {
				newRank = 4;
				newLevel = 4;
			}
			if (player.experience >= 10000) {
				newRank = 5;
				newLevel = 5;
			}
			
			if (newRank !== player.rank) {
				const updatedPlayer = { ...player, rank: newRank, level: newLevel };
				const updatedPlayers = currentRoom.players.map(p =>
					p.id === playerId ? updatedPlayer : p
				);
				
      set({ 
					currentRoom: { ...currentRoom, players: updatedPlayers }
      });
			}
    },
    
		// Event Handlers - Production Ready with Advanced Features
		handlePlayerJoined: (player) => {
      const { currentRoom } = get();
      if (!currentRoom) return;
      
      // Check if room is full
      if (currentRoom.players.length >= currentRoom.maxPlayers) {
        set({ error: 'Room is full' });
        return;
      }
      
      // Update room with new player
      const updatedRoom = {
        ...currentRoom,
				players: [...currentRoom.players, player],
        currentPlayers: currentRoom.players.length + 1
      };
      
      // Auto-start if conditions are met
      if (updatedRoom.players.length >= 2 && updatedRoom.players.every(p => p.isReady)) {
        setTimeout(() => {
          get().startBattle();
        }, 3000);
      }
      
      set({ currentRoom: updatedRoom });
      
      // Clear any previous errors
      set({ error: null });
    },
    
		handlePlayerLeft: (playerId) => {
      const { currentRoom } = get();
      if (!currentRoom) return;
			const updatedPlayers = currentRoom.players.filter(p => p.id !== playerId);
			const updatedRoom = {
        ...currentRoom,
				players: updatedPlayers
      };
      
      set({ currentRoom: updatedRoom });
    },
    
		handleGameStarted: () => {
      const { currentRoom } = get();
      if (!currentRoom) return;
      
			set({
				currentRoom: { ...currentRoom, status: 'active' },
				roundStartTime: Date.now(),
				battleAnswers: []
			});
		},
		
		handleRoundEnded: () => {
			get().processRoundResults();
			get().updateLeaderboard();
		},
		
		handleGameEnded: (winner) => {
			const { currentRoom, battleStats, localPlayer } = get();
			if (!currentRoom) return;
			const didWin = winner.id === localPlayer.id;
			
			set({
				currentRoom: { ...currentRoom, status: 'finished', winner },
				battleStats: {
					...battleStats,
					gamesPlayed: battleStats.gamesPlayed + 1,
					gamesWon: battleStats.gamesWon + (didWin ? 1 : 0)
				}
			});
		},

		handlePowerUpActivated: (event) => {
			set((state) => ({
				activePowerUps: [...state.activePowerUps, event]
			}));
			
			// Apply power-up effects to all players
			const { currentRoom } = get();
			if (!currentRoom) return;
			const updatedPlayers = currentRoom.players.map(player => {
				if (player.id === event.playerId) {
					// Apply positive effects to power-up user
					switch (event.type) {
						case 'double-points':
							return { ...player, comboMultiplier: player.comboMultiplier * 2 };
						case 'combo-boost':
							return { ...player, fastestAnswer: Math.max(0, player.fastestAnswer - 50) };
						case 'shield':
							return { ...player, lives: Math.min(player.lives + 1, 5) };
						default:
							return player;
					}
				} else {
					// Apply negative effects to opponents for certain power-ups
					switch (event.type) {
						case 'life-steal':
							return { ...player, lives: Math.max(0, player.lives - 1) };
						case 'time-freeze':
							// Freeze opponent's timer (implemented in UI)
							return player;
						default:
							return player;
					}
				}
			});
			
			set({
				currentRoom: { ...currentRoom, players: updatedPlayers }
			});
		},
		
		handleAchievementEarned: (playerId, achievement) => {
			// Convert string achievement to BattleAchievement object if needed
			const achievementObj = typeof achievement === 'string' ? {
				id: `achievement_${Date.now()}`,
				name: achievement,
				description: `Achievement: ${achievement}`,
				icon: '🏅',
				unlockedAt: new Date(),
				rarity: 'common' as const,
				points: 50
			} : achievement;
			
			set((state) => ({
				recentAchievements: [...state.recentAchievements, achievementObj]
			}));
		},
		
		handleLeaderboardUpdate: (leaderboard) => {
			const { currentRoom } = get();
			if (!currentRoom) return;
			
			set({
				currentRoom: { ...currentRoom, leaderboard }
			});
    }
  }))
);// Initialize connection only on client side to avoid SSR issues
if (typeof window !== 'undefined') {
	// Initialize connection on store creation
	useBattleStore.getState().connect();
	
	// Production-ready error handling and reconnection logic
	let reconnectInterval: NodeJS.Timeout;
	let heartbeatInterval: NodeJS.Timeout;
	
	// Auto-reconnect on connection loss with exponential backoff
	useBattleStore.subscribe(
		(state) => state.connectionStatus,
		(status) => {
			if (status === 'error' || status === 'disconnected') {
				clearTimeout(reconnectInterval);


				
				reconnectInterval = setTimeout(() => {
					if (attempts < 5) {
						useBattleStore.setState({ reconnectAttempts: attempts + 1 });
						useBattleStore.getState().connect();
					} else {
						// Final fallback - show user manual reconnect option
						useBattleStore.setState({ 
							error: 'Connection lost. Please refresh the page to reconnect.',
							connectionStatus: 'error' as const
						});
					}
				}, delay);
			} else if (status === 'connected') {
				// Reset reconnect attempts on successful connection
				useBattleStore.setState({ reconnectAttempts: 0, error: null });
			}
		}
	);
	
	// Heartbeat to keep connection alive
	heartbeatInterval = setInterval(() => {
		const { ws, isConnected } = useBattleStore.getState();
		if (ws && isConnected) {
			ws.send(JSON.stringify({ type: 'heartbeat', timestamp: Date.now() }));
		}
	}, 30000); // Every 30 seconds
	
	// Cleanup on unmount
	window.addEventListener('beforeunload', () => {
		clearTimeout(reconnectInterval);
		clearInterval(heartbeatInterval);
		useBattleStore.getState().disconnect();
	});
	
	// Performance monitoring and analytics
	if (process.env.NODE_ENV === 'development') {
		useBattleStore.subscribe(
			(state) => state.currentRoom,
			(room) => {
				if (room) {
					console.log('🎮 Battle Room Updated:', {
						players: room.players.length,
						status: room.status,
						gameMode: room.gameMode
					});
				}
			}
		);
		
		// Track battle performance metrics
		useBattleStore.subscribe(
			(state) => state.battleStats,
			(stats) => {
				if (stats.gamesPlayed > 0) {
					console.log('📊 Battle Stats:', {
						winRate: `${((stats.gamesWon / stats.gamesPlayed) * 100).toFixed(1)}%`,
						totalScore: stats.totalScore,
						bestStreak: stats.bestStreak,
						perfectAnswers: stats.perfectAnswers
					});
				}
			}
		);
	}
	
	// Export store for external access (useful for debugging)
	// Only run on client side to avoid SSR issues
	if (process.env.NODE_ENV === 'development') {
		(window as any).__BATTLE_STORE__ = useBattleStore;
	}
}

