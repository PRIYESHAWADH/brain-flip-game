import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { 
	MultiplayerState, 
	BattleRoom, 
	Player, 
	Tournament, 
	MultiplayerEvent,
	PowerUp,
	ChatMessage,
	Notification,
	Leaderboard,
	Instruction
} from '@/types/multiplayer';
import { generateInstruction } from '@/utils/gameLogic';
import { Instruction as GameInstruction } from '@/types/game';

// ULTIMATE MULTIPLAYER STORE - STATE OF THE ART
interface MultiplayerStore extends MultiplayerState {
	// Current player state
	currentPlayer: Player | null;
	currentRoom: BattleRoom | null;
	currentTournament: Tournament | null;
	
	// Connection state
	isConnected: boolean;
	latency: number;
	connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'reconnecting';
	
	// UI state
	showMultiplayerMenu: boolean;
	showBattleLobby: boolean;
	showTournamentLobby: boolean;
	activeTab: 'duel' | 'battle-royale' | 'tournament' | 'leaderboards';
	
	// Actions
	connect: () => Promise<void>;
	disconnect: () => void;
	createRoom: (mode: 'duel' | 'battle-royale', settings?: Partial<BattleRoom['settings']>) => Promise<string>;
	joinRoom: (roomId: string) => Promise<void>;
	leaveRoom: () => void;
	submitAnswer: (answer: string, reactionTime: number) => void;
	usePowerUp: (powerUpId: string) => void;
	sendChatMessage: (message: string) => void;
	readyUp: () => void;
	createTournament: (name: string, settings: Tournament['settings']) => Promise<string>;
	joinTournament: (tournamentId: string) => Promise<void>;
	leaveTournament: () => void;
	
	// Event handlers
	handleEvent: (event: MultiplayerEvent) => void;
	updateLatency: (latency: number) => void;
	
	// Power-ups
	availablePowerUps: PowerUp[];
	equippedPowerUps: PowerUp[];
	
	// Chat
	sendGlobalMessage: (message: string) => void;
	
	// Notifications
	addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
	markNotificationAsRead: (notificationId: string) => void;
	clearNotifications: () => void;
}

// ULTIMATE POWER-UPS
const POWER_UPS: PowerUp[] = [
	{
		id: 'time-freeze',
		type: 'timeFreeze',
		name: 'Time Freeze',
		description: 'Freeze opponent\'s timer for 3 seconds',
		duration: 3000,
		effect: { type: 'timerFreeze', value: 3000, target: 'opponent', duration: 3000 },
		icon: '⏸️',
		rarity: 'rare'
	},
	{
		id: 'double-points',
		type: 'doublePoints',
		name: 'Double Points',
		description: 'Earn 2x points for the next round',
		duration: 1,
		effect: { type: 'pointMultiplier', value: 2, target: 'self', duration: 1 },
		icon: '💎',
		rarity: 'epic'
	},
	{
		id: 'shield',
		type: 'shield',
		name: 'Shield',
		description: 'Protect against one wrong answer',
		duration: 1,
		effect: { type: 'damageProtection', value: 1, target: 'self', duration: 1 },
		icon: '🛡️',
		rarity: 'common'
	},
	{
		id: 'speed-boost',
		type: 'speedBoost',
		name: 'Speed Boost',
		description: 'Get 1.5x reaction time bonus',
		duration: 5000,
		effect: { type: 'reactionTimeBoost', value: 1.5, target: 'self', duration: 5000 },
		icon: '⚡',
		rarity: 'rare'
	},
	{
		id: 'mind-swap',
		type: 'mindSwap',
		name: 'Mind Swap',
		description: 'Swap instruction types with opponent',
		duration: 1,
		effect: { type: 'instructionSwap', value: 1, target: 'opponent', duration: 1 },
		icon: '🔄',
		rarity: 'legendary'
	},
	{
		id: 'chaos-mode',
		type: 'chaosMode',
		name: 'Chaos Mode',
		description: 'Random instruction types for everyone',
		duration: 10000,
		effect: { type: 'randomInstructions', value: 1, target: 'all', duration: 10000 },
		icon: '🌀',
		rarity: 'epic'
	},
	{
		id: 'final-countdown',
		type: 'finalCountdown',
		name: 'Final Countdown',
		description: 'Last 10 seconds give 3x points',
		duration: 10000,
		effect: { type: 'finalCountdown', value: 3, target: 'self', duration: 10000 },
		icon: '🔥',
		rarity: 'legendary'
	}
];

export const useMultiplayerStore = create<MultiplayerStore>()(
	subscribeWithSelector((set, get) => ({
		// Initial state
		rooms: new Map(),
		tournaments: new Map(),
		playerSessions: new Map(),
		globalChat: [],
		leaderboards: [],
		notifications: [],
		
		// Current state
		currentPlayer: null,
		currentRoom: null,
		currentTournament: null,
		
		// Connection state
		isConnected: false,
		latency: 0,
		connectionStatus: 'disconnected',
		
		// UI state
		showMultiplayerMenu: false,
		showBattleLobby: false,
		showTournamentLobby: false,
		activeTab: 'duel',
		
		// Power-ups
		availablePowerUps: POWER_UPS,
		equippedPowerUps: [],
		
		// Connection management
		connect: async () => {
			set({ connectionStatus: 'connecting' });
			
			try {
				
				// Simulate connection for now
				await new Promise(resolve => setTimeout(resolve, 1000));
				
				set({ 
					isConnected: true, 
					connectionStatus: 'connected',
					latency: Math.random() * 50 + 10 // 10-60ms latency
				});
				
				console.log('[MULTIPLAYER] Connected successfully');
			} catch (error) {
				set({ 
					isConnected: false, 
					connectionStatus: 'disconnected' 
				});
				console.error('[MULTIPLAYER] Connection failed:', error);
			}
		},
		
		disconnect: () => {
			set({ 
				isConnected: false, 
				connectionStatus: 'disconnected',
				currentRoom: null,
				currentTournament: null
			});
		},
		
		// Room management
		createRoom: async (mode, settings = {}) => {
				maxPlayers: mode === 'duel' ? 2 : 8,
				roundTimeLimit: 5000,
				maxRounds: mode === 'duel' ? 5 : 10,
				powerUpsEnabled: true,
				spectatorsAllowed: true,
				chatEnabled: true,
				highlightRecording: true,
				rankingEnabled: true,
				...settings
			};
			
			const room: BattleRoom = {
				id: roomId,
				mode,
				state: 'waiting',
				players: [],
				spectators: [],
				currentRound: 0,
				maxRounds: defaultSettings.maxRounds,
				instruction: {
					...generateInstruction(1, []),
					battleSpecific: undefined
				} as Instruction,
				timer: defaultSettings.roundTimeLimit,
				roundResults: [],
				powerUps: [],
				events: [],
				chat: [],
				highlights: [],
				settings: defaultSettings,
				createdAt: Date.now()
			};
			rooms.set(roomId, room);
			set({ rooms });
			
			console.log('[MULTIPLAYER] Created room:', roomId);
			return roomId;
		},
		
		joinRoom: async (roomId: string) => {
			
			if (!room) {
				throw new Error('Room not found');
			}
			
			if (room.players.length >= room.settings.maxPlayers) {
				throw new Error('Room is full');
			}
			if (!currentPlayer) {
				throw new Error('No current player');
			}
			
			// Add player to room
			room.players.push(currentPlayer);
			
			// Update room
			updatedRooms.set(roomId, room);
			
			set({ 
				rooms: updatedRooms,
				currentRoom: room,
				showBattleLobby: true
			});
			
			console.log('[MULTIPLAYER] Joined room:', roomId);
		},
		
		leaveRoom: () => {
			if (!currentRoom) return;
			
			// Remove player from room
			if (room) {
				room.players = room.players.filter(p => p.id !== get().currentPlayer?.id);
				updatedRooms.set(currentRoom.id, room);
				
				set({ rooms: updatedRooms });
			}
			
			set({ 
				currentRoom: null,
				showBattleLobby: false
			});
			
			console.log('[MULTIPLAYER] Left room:', currentRoom.id);
		},
		
		// Game actions
		submitAnswer: (answer: string, reactionTime: number) => {
			
			if (!currentRoom || !currentPlayer) return;
			
			// Update player's last answer
			currentPlayer.lastAnswer = answer;
			currentPlayer.reactionTime = reactionTime;
			
			// Check if all players have answered
			
			if (allAnswered) {
				// Process round results
					
					return {
						playerId: player.id,
						answer: player.lastAnswer!,
						reactionTime: player.reactionTime!,
						isCorrect,
						pointsEarned,
						bonuses: [],
						powerUpsUsed: []
					};
				});
				
				// Find winner
					prev.pointsEarned > current.pointsEarned ? prev : current
				);
				
				// Update scores
				results.forEach(result => {
					if (player) {
						player.score += result.pointsEarned;
						if (result.isCorrect) {
							player.streak++;
						} else {
							player.streak = 0;
						}
					}
				});
				
				// Add round result
					roundNumber: currentRoom.currentRound + 1,
					instruction: currentRoom.instruction,
					playerResults: results,
					winner: winner.playerId,
					highlights: [],
					powerUpsUsed: [],
					events: [],
					timestamp: Date.now()
				};
				
				currentRoom.roundResults.push(roundResult);
				currentRoom.currentRound++;
				
				// Check if game is over
				if (currentRoom.currentRound >= currentRoom.maxRounds) {
					currentRoom.state = 'finished';
						prev.score > current.score ? prev : current
					);
					
					// Handle game end
					get().handleEvent({
						type: 'gameEnded',
						winner: gameWinner,
						roomId: currentRoom.id
					});
				} else {
					// Generate new instruction with previous instruction tracking
					const previousGameInstructions: GameInstruction[] = currentRoom.roundResults.map(result => ({
						id: result.instruction.id,
						type: result.instruction.type,
						display: result.instruction.display,
						correctAnswer: result.instruction.correctAnswer,
						acceptableAnswers: result.instruction.acceptableAnswers,
						timeLimit: result.instruction.timeLimit,
						displayColor: result.instruction.displayColor,
						isReversed: result.instruction.isReversed,
						// Map specific instruction type properties
						...(result.instruction.type === 'direction' && 'direction' in result.instruction ? { direction: result.instruction.direction } : {}),
						...(result.instruction.type === 'color' && 'color' in result.instruction ? { color: result.instruction.color } : {}),
						...(result.instruction.type === 'action' && 'action' in result.instruction ? { action: result.instruction.action } : {}),
						...(result.instruction.type === 'combo' && 'color' in result.instruction && 'direction' in result.instruction ? { 
							color: result.instruction.color, 
							direction: result.instruction.direction 
						} : {})
					} as GameInstruction));
					
					// Convert back to multiplayer instruction format
					currentRoom.instruction = {
						...newGameInstruction,
						battleSpecific: undefined // No battle-specific data for regular multiplayer
					} as Instruction;
					currentRoom.timer = currentRoom.settings.roundTimeLimit;
					
					// Reset player answers
					currentRoom.players.forEach(p => {
						p.lastAnswer = undefined;
						p.reactionTime = undefined;
					});
				}
				
				// Update room
				rooms.set(currentRoom.id, currentRoom);
				set({ rooms });
			}
		},
		
		usePowerUp: (powerUpId: string) => {
			
			if (!currentPlayer || !currentRoom) return;
			if (!powerUp) return;
			
			// Check if player has this power-up
			if (!hasPowerUp) return;
			
			// Remove power-up from player
			currentPlayer.powerUps = currentPlayer.powerUps.filter(p => p.id !== powerUpId);
			
			// Apply power-up effect
			switch (powerUp.type) {
				case 'timeFreeze':
					// Freeze opponent's timer
					break;
				case 'doublePoints':
					// Double points for next round
					break;
				case 'shield':
					// Protect against wrong answer
					currentPlayer.status.shield = true;
					break;
				case 'speedBoost':
					// Boost reaction time
					currentPlayer.status.speedBoost = true;
					break;
				case 'mindSwap':
					// Swap instruction types
					break;
				case 'chaosMode':
					// Random instructions
					break;
				case 'finalCountdown':
					// Final countdown bonus
					break;
			}
			
			// Add event
			currentRoom.events.push({
				id: `event_${Date.now()}`,
				type: 'powerUpUsed',
				playerId: currentPlayer.id,
				data: { powerUp },
				timestamp: Date.now()
			});
			
			// Update room
			rooms.set(currentRoom.id, currentRoom);
			set({ rooms });
			
			console.log('[MULTIPLAYER] Power-up used:', powerUp.name);
		},
		
		sendChatMessage: (message: string) => {
			
			if (!currentPlayer || !currentRoom) return;
			
			const chatMessage: ChatMessage = {
				id: `msg_${Date.now()}`,
				playerId: currentPlayer.id,
				playerName: currentPlayer.name,
				message,
				timestamp: Date.now(),
				type: 'normal'
			};
			
			currentRoom.chat.push(chatMessage);
			
			// Update room
			rooms.set(currentRoom.id, currentRoom);
			set({ rooms });
		},
		
		readyUp: () => {
			
			if (!currentPlayer || !currentRoom) return;
			
			currentPlayer.isReady = !currentPlayer.isReady;
			
			// Check if all players are ready
			if (allReady && currentRoom.players.length >= 2) {
				currentRoom.state = 'countdown';
				// Start countdown
				setTimeout(() => {
					currentRoom.state = 'playing';
					currentRoom.startedAt = Date.now();
					rooms.set(currentRoom.id, currentRoom);
					set({ rooms });
					
					get().handleEvent({
						type: 'gameStarted',
						roomId: currentRoom.id
					});
				}, 3000);
			}
			
			// Update room
			rooms.set(currentRoom.id, currentRoom);
			set({ rooms });
		},
		
		// Tournament management
		createTournament: async (name: string, settings: Tournament['settings']) => {
			
			const tournament: Tournament = {
				id: tournamentId,
				name,
				mode: 'single-elimination',
				players: [],
				brackets: [],
				currentRound: 0,
				maxRounds: 0,
				state: 'registration',
				prizePool: {
					total: 1000,
					distribution: [
						{ rank: 1, percentage: 50, amount: 500 },
						{ rank: 2, percentage: 30, amount: 300 },
						{ rank: 3, percentage: 20, amount: 200 }
					],
					currency: 'coins'
				},
				settings,
				createdAt: Date.now()
			};
			tournaments.set(tournamentId, tournament);
			set({ tournaments });
			
			console.log('[MULTIPLAYER] Created tournament:', tournamentId);
			return tournamentId;
		},
		
		joinTournament: async (tournamentId: string) => {
			
			if (!tournament) {
				throw new Error('Tournament not found');
			}
			
			if (tournament.state !== 'registration') {
				throw new Error('Tournament registration is closed');
			}
			if (!currentPlayer) {
				throw new Error('No current player');
			}
			
			// Add player to tournament
			tournament.players.push(currentPlayer);
			
			// Update tournament
			updatedTournaments.set(tournamentId, tournament);
			
			set({ 
				tournaments: updatedTournaments,
				currentTournament: tournament,
				showTournamentLobby: true
			});
			
			console.log('[MULTIPLAYER] Joined tournament:', tournamentId);
		},
		
		leaveTournament: () => {
			if (!currentTournament) return;
			
			// Remove player from tournament
			if (tournament) {
				tournament.players = tournament.players.filter(p => p.id !== get().currentPlayer?.id);
				updatedTournaments.set(currentTournament.id, tournament);
				
				set({ tournaments: updatedTournaments });
			}
			
			set({ 
				currentTournament: null,
				showTournamentLobby: false
			});
			
			console.log('[MULTIPLAYER] Left tournament:', currentTournament.id);
		},
		
		// Event handling
		handleEvent: (event: MultiplayerEvent) => {
			console.log('[MULTIPLAYER] Event received:', event);
			
			switch (event.type) {
				case 'playerJoined':
					// Handle player joined
					break;
				case 'playerLeft':
					// Handle player left
					break;
				case 'gameStarted':
					// Handle game started
					break;
				case 'instructionChanged':
					// Handle instruction change
					break;
				case 'answerSubmitted':
					// Handle answer submission
					break;
				case 'roundEnded':
					// Handle round end
					break;
				case 'gameEnded':
					// Handle game end
					break;
				case 'powerUpUsed':
					// Handle power-up usage
					break;
				case 'playerEliminated':
					// Handle player elimination
					break;
				case 'chatMessage':
					// Handle chat message
					break;
				case 'highlightCreated':
					// Handle highlight creation
					break;
				case 'tournamentStarted':
					// Handle tournament start
					break;
				case 'tournamentEnded':
					// Handle tournament end
					break;
				case 'achievementUnlocked':
					// Handle achievement unlock
					break;
			}
		},
		
		updateLatency: (latency: number) => {
			set({ latency });
		},
		
		// Global chat
		sendGlobalMessage: (message: string) => {
			if (!currentPlayer) return;
			
			const chatMessage: ChatMessage = {
				id: `global_${Date.now()}`,
				playerId: currentPlayer.id,
				playerName: currentPlayer.name,
				message,
				timestamp: Date.now(),
				type: 'normal'
			};
			set({ globalChat });
		},
		
		// Notifications
		addNotification: (notification) => {
			const newNotification: Notification = {
				...notification,
				id: `notification_${Date.now()}`,
				timestamp: Date.now(),
				read: false
			};
			set({ notifications });
		},
		
		markNotificationAsRead: (notificationId: string) => {
				n.id === notificationId ? { ...n, read: true } : n
			);
			set({ notifications });
		},
		
		clearNotifications: () => {
			set({ notifications: [] });
		}
	}))
);
