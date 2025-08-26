import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GameState as LegacyGameState, Instruction } from '@/types/game';
import { generateInstruction } from '@/utils/gameLogic';
import { useCoinStore } from '@/store/coinStore';
import { analytics } from '@/utils/analytics';
import { GameResult } from '@/types/coins';
import { adaptiveDifficulty, PerformanceMetrics, FlowStateAnalysis } from '@/utils/adaptiveDifficulty';
import { EnhancedAchievementSystem, GameStats } from '@/utils/achievementSystem';

// Enhanced game state with addiction mechanics
interface EnhancedGameState extends LegacyGameState {
	// Exponential scoring system
	currentMultiplier: number;
	nextPotentialScore: number;
	speedBonusActive: boolean;
	lastReactionTime: number;
	exponentialBase: number; // Base score for exponential system (10)
	streakMultiplier: number; // Current streak multiplier (2^streak)
	// Golden moment (variable ratio reinforcement rare event)
	goldenActive?: boolean;
	goldenValue?: number; // 1000+
	
	// Achievement tracking
	perfectRounds: number;
	lightningReactions: number; // under 400ms
	comboStreak: number; // consecutive perfect rounds
	
	// Daily challenge tracking
	gamesPlayed: number;
	totalPoints: number;
	starCoins: number;
	bestStreak: number;
	reactionTimes: number[];
	
	// Daily engagement
	dailyStreak: number;
	lastPlayDate: string;
	
	// Social features
	personalBest: number;
	personalBests: {
		classic: number;
		duel: number;
		'sudden-death': number;
	};
	
	// Adaptive difficulty system
	flowStateAnalysis: FlowStateAnalysis | null;
	practiceMode: boolean;
	adaptiveDifficultyLevel: number;
	sessionStartTime: number;
	
	// Lucky moments
	luckyMultiplierActive: boolean;
	luckyMultiplierValue: number;
	
	// Visual feedback
	showScoreBreakdown: boolean;
	lastScoreGain: number;
	celebrationLevel: 'none' | 'good' | 'great' | 'amazing' | 'legendary';
	lastLuckyMultiplier?: number;
	lastGoldenBonus?: number;
	lastDailyClaimDate?: string;
	lastInstructionGenerationTime?: number;
	
	// Methods
	startGame: (mode: LegacyGameState['gameMode']) => void;
	submitAnswer: (answer: string, reactionTime: number) => void;
	generateNextInstruction: () => void;
	pauseGame: () => void;
	resumeGame: () => void;
	endGame: () => void;
	resetGame: () => void;
	startNewGameFromGameOver: (gameMode?: string) => void;
	returnToMenu: () => void;
	updateTimer: (timeLeft: number) => void;
	
	// New addiction mechanics
	calculateExponentialScore: (streak: number, reactionTime: number) => number;
	updateExponentialScoring: () => void;
	triggerLuckyMoment: () => void;
	maybeActivateGolden: () => void;
	updateDailyStreak: () => void;
	getCelebrationLevel: (scoreGain: number, streak: number) => 'none' | 'good' | 'great' | 'amazing' | 'legendary';
	claimDailyReward: () => void;
	
	// New addiction mechanics
	getExponentialScore: (streak: number) => number;
	getNextPotentialScore: (streak: number) => number;
	triggerRandomMultiplier: () => { active: boolean; multiplier: number };
	checkLightningBonus: (reactionTime: number) => boolean;
	updateStreakMultiplier: () => void;
	
	// Daily challenge support
	addPoints: (points: number) => void;
	addStarCoins: (coins: number) => void;
}

// Separate state and methods
type GameState = Omit<EnhancedGameState, 
	| 'startGame' | 'submitAnswer' | 'generateNextInstruction' | 'pauseGame' | 'resumeGame' 
	| 'endGame' | 'resetGame' | 'startNewGameFromGameOver' | 'returnToMenu' | 'updateTimer'
	| 'calculateExponentialScore' | 'updateExponentialScoring' | 'triggerLuckyMoment' 
	| 'maybeActivateGolden' | 'updateDailyStreak' | 'getCelebrationLevel' | 'claimDailyReward'
	| 'getExponentialScore' | 'getNextPotentialScore' | 'triggerRandomMultiplier' 
	| 'checkLightningBonus' | 'updateStreakMultiplier' | 'addPoints' | 'addStarCoins'
>;

// Use EnhancedGameState as the main interface
type GameStore = EnhancedGameState;

const initialState: GameState = {
	level: 1,
	score: 0,
	streak: 0,
	timeRemaining: 3000,
	roundTimeLimit: 3000,
	currentInstruction: null,
	gameMode: 'classic',
	isActive: false,
	hasStarted: false,
	mistakes: 0,
	totalReactionTime: 0,
	
	// Enhanced state
	currentMultiplier: 10,
	nextPotentialScore: 20,
	speedBonusActive: false,
	lastReactionTime: 0,
	exponentialBase: 10,
	streakMultiplier: 1,
	goldenActive: false,
	goldenValue: 0,
	lastGoldenBonus: 0,
	perfectRounds: 0,
	lightningReactions: 0,
	comboStreak: 0,
	dailyStreak: 0,
	lastPlayDate: '',
	personalBest: 0,
	sessionStartTime: 0,
	luckyMultiplierActive: false,
	luckyMultiplierValue: 1,
	showScoreBreakdown: false,
	lastScoreGain: 0,
	celebrationLevel: 'none',
	lastLuckyMultiplier: 1,
	lastDailyClaimDate: '',
	lastInstructionGenerationTime: 0,
	
	// Daily challenge tracking
	gamesPlayed: 0,
	totalPoints: 0,
	starCoins: 0,
	bestStreak: 0,
	reactionTimes: [],
	
	// Social features
	personalBests: {
		classic: 0,
		duel: 0,
		'sudden-death': 0,
	},
	
	// Adaptive difficulty system
	flowStateAnalysis: null,
	practiceMode: false,
	adaptiveDifficultyLevel: 1,
};

export const useGameStore = create<EnhancedGameState>()(
	persist(
		(set, get): EnhancedGameState => ({
			...initialState,
	
	calculateExponentialScore: (streak, reactionTime) => {
		// Enhanced exponential scoring with flow state optimization
		const { exponentialBase, comboStreak } = get();
		
		// Base exponential score: 10→20→40→80→160→320→640→1280...
		let baseScore = streak <= 0 ? exponentialBase : exponentialBase * Math.pow(2, Math.min(streak - 1, 8));
		
		// Flow state bonus - reward sustained performance
		if (comboStreak >= 5) {
			baseScore = Math.floor(baseScore * (1 + comboStreak * 0.1)); // 10% per combo streak
		}
		
		// Perfect timing bonus (under 300ms = perfect, under 500ms = great)
		if (reactionTime < 300) {
			baseScore = Math.floor(baseScore * 2.0); // Perfect timing: 2x multiplier
			set({ speedBonusActive: true });
		} else if (reactionTime < 500) {
			baseScore = Math.floor(baseScore * 1.5); // Great timing: 1.5x multiplier
			set({ speedBonusActive: true });
		} else {
			set({ speedBonusActive: false });
		}
		
		// Track lightning reactions for achievements
		if (reactionTime < 400) {
			set({ lightningReactions: get().lightningReactions + 1 });
		}
		
		// Adaptive difficulty multiplier - reward consistent performance
		const recentReactionTimes = get().reactionTimes.slice(-5); // Last 5 reactions
		if (recentReactionTimes.length >= 3) {
			const avgReactionTime = recentReactionTimes.reduce((a, b) => a + b, 0) / recentReactionTimes.length;
			if (avgReactionTime < 600) { // Consistently fast
				baseScore = Math.floor(baseScore * 1.2); // 20% bonus for consistent speed
			}
		}
		
		// Lucky moment system (rare but exciting)
		const randomChance = Math.random();
		let multiplier = 1;
		
		if (randomChance < 0.05) { // 5% chance for multipliers
			if (randomChance < 0.01) multiplier = 5; // 1% chance for 5x
			else if (randomChance < 0.03) multiplier = 3; // 2% chance for 3x
			else multiplier = 2; // 2% chance for 2x
			
			baseScore = Math.floor(baseScore * multiplier);
			set({ 
				luckyMultiplierActive: true, 
				luckyMultiplierValue: multiplier,
				lastLuckyMultiplier: multiplier
			});
		} else {
			set({ 
				luckyMultiplierActive: false, 
				luckyMultiplierValue: 1,
				lastLuckyMultiplier: undefined
			});
		}
		
		return baseScore;
	},
	
	updateExponentialScoring: () => {
		const { streak, exponentialBase } = get();

		set({ 
			nextPotentialScore: nextScore,
			streakMultiplier: Math.pow(2, streak - 1)
		});
	},
	

	
	triggerLuckyMoment: () => {
		// ~6% total chance: 1% for 5x, 2% for 3x, 3% for 2x (unpredictable, low frequency)
		const rand = Math.random();
		if (rand < 0.01) {
			set({ luckyMultiplierActive: true, luckyMultiplierValue: 5 });
		} else if (rand < 0.03) {
			set({ luckyMultiplierActive: true, luckyMultiplierValue: 3 });
		} else if (rand < 0.06) {
			set({ luckyMultiplierActive: true, luckyMultiplierValue: 2 });
		}
	},

	// Rare golden moment separate from multipliers; doesn't change instruction types to avoid test impact
	maybeActivateGolden: () => {
		// ~0.3% chance per round
		if (get().goldenActive) return;
		const roll = Math.random();
		if (roll < 0.003) {
			// Randomize value between 1000 and 2000
			const value = 1000 + Math.floor(Math.random() * 1000);
			set({ goldenActive: true, goldenValue: value });
		}
	},
	
	updateDailyStreak: () => {
		const today = new Date().toDateString();
		const { lastPlayDate, dailyStreak } = get();
		
		if (lastPlayDate !== today) {
			const yesterday = new Date();
			yesterday.setDate(yesterday.getDate() - 1);
			
			if (lastPlayDate === yesterday.toDateString()) {
				// Consecutive day
				set({ dailyStreak: dailyStreak + 1, lastPlayDate: today });
			} else {
				// Streak broken
				set({ dailyStreak: 1, lastPlayDate: today });
			}
		}
	},
	
	getCelebrationLevel: (scoreGain, streak) => {
		if (scoreGain >= 1000 && streak >= 10) return 'legendary';
		if (scoreGain >= 500 && streak >= 5) return 'amazing';
		if (scoreGain >= 200 && streak >= 3) return 'great';
		if (scoreGain >= 100 && streak >= 1) return 'good';
		return 'none';
	},

	// Claim daily reward based on current dailyStreak; safe no-op if already claimed today
	claimDailyReward: () => {
		const today = new Date().toDateString();
		const { dailyStreak, lastDailyClaimDate } = get();
		if (lastDailyClaimDate === today) return; // already claimed

		// Reward schedule
		const schedule: Array<{ day: number; points: number; star?: number }> = [
			{ day: 1, points: 20 },
			{ day: 3, points: 75 },
			{ day: 7, points: 300 },
			{ day: 14, points: 800 },
			{ day: 30, points: 2500, star: 1 },
		];

		let rewardPts = 20;
		let rewardSC = 0;
		for (const r of schedule) {
			if (dailyStreak >= r.day) {
				rewardPts = r.points;
				rewardSC = r.star ?? rewardSC;
			}
		}
		// Apply rewards to local trackers and points store if available
		set({ totalPoints: get().totalPoints + rewardPts, lastDailyClaimDate: today });
		try {
			const { usePointsStore } = require('@/store/pointsStore');
			const p = usePointsStore.getState();
			p.addPoints(rewardPts, 'Daily Login');
			if (rewardSC > 0) p.addStarCoins(rewardSC, 'Daily Login');
		} catch {}
	},
	
	startGame: (mode) => {
		console.log('[GameStore] Starting game with mode:', mode);
		const now = Date.now();
		
		// Update daily streak
		const { updateDailyStreak } = get();
		updateDailyStreak();
		
		// Reset to initial state and start game
		set({ 
			...initialState, 
			gameMode: mode, 
			isActive: false, // Start inactive to prevent immediate timer
			hasStarted: true, // Always true when starting a game
			level: 1,
			score: 0,
			streak: 0,
			mistakes: 0,
			totalReactionTime: 0,
			sessionStartTime: now,
			currentMultiplier: 10,
			nextPotentialScore: 20,
			dailyStreak: get().dailyStreak, // Preserve daily streak
			lastPlayDate: get().lastPlayDate,
			personalBest: get().personalBest, // Preserve personal best
			showScoreBreakdown: false, // Ensure this is false for new games
		});
		
		// Generate first instruction
		get().generateNextInstruction();
		
		// Then activate the game to prevent race condition
		setTimeout(() => {
			set({ isActive: true });
			console.log('[GameStore] Game activated after instruction generation');
		}, 100);
		
		console.log('[GameStore] Game started successfully');

		try { analytics.track({ type: 'game_start', payload: { mode, ts: Date.now() } }); } catch {}
	},
	submitAnswer: (answer, reactionTime) => {
		const { timeRemaining, currentInstruction, streak, level, mistakes, score, totalReactionTime, gameMode,
			perfectRounds, lightningReactions, comboStreak, personalBest, reactionTimes } = get();
		
		// CRITICAL FIX: Don't end game immediately if no instruction exists
		if (timeRemaining <= 0 && currentInstruction) {
			get().endGame();
			return;
		}
		
		// CRITICAL FIX: If no instruction, ignore answer instead of ending game
		if (!currentInstruction) {
			console.log('[GameStore] No current instruction, ignoring answer');
			return;
		}
		console.log('[GameStore] Submitting answer:', answer, 'reactionTime:', reactionTime);
		
		// Check if answer is correct
		const acceptable = currentInstruction.acceptableAnswers || [];
		const answerCorrect = acceptable.includes(answer);
		const withinTimeLimit = reactionTime <= currentInstruction.timeLimit;
		const correct = answerCorrect && withinTimeLimit;

		console.log('[GameStore] Answer correct:', correct, 'answerCorrect:', answerCorrect, 'withinTimeLimit:', withinTimeLimit);
		
		// Trigger random events for reinforcement
		if (correct) {
			get().triggerLuckyMoment();
			get().maybeActivateGolden();
		}
		
		// Calculate new state
		const newStreak = correct ? streak + 1 : 0;
		const newLevel = Math.floor(newStreak / 5) + 1;
		const newMistakes = correct ? mistakes : mistakes + 1;
		const newTotalReactionTime = totalReactionTime + reactionTime;
		
		// Enhanced scoring with exponential system
		let scoreGain = 0;
		let newPerfectRounds = perfectRounds;
		let newLightningReactions = lightningReactions;
		let newComboStreak = comboStreak;
		let speedBonusActive = false;
		
		if (correct) {
			// Exponential scoring system
			scoreGain = get().calculateExponentialScore(newStreak, reactionTime);
			
			// Update exponential scoring preview
			get().updateExponentialScoring();
			
			// Track perfect rounds (under 500ms)
			if (reactionTime < 500) {
				newPerfectRounds++;
				newComboStreak++;
			} else {
				newComboStreak = 0;
			}
			
			// Track lightning reactions (under 400ms)
			if (reactionTime < 400) {
				newLightningReactions++;
				speedBonusActive = true;
			}
			
			// Golden moment bonus (one-shot)
			const { goldenActive, goldenValue } = get();
			if (goldenActive && goldenValue && goldenValue > 0) {
				scoreGain += goldenValue;
				set({ lastGoldenBonus: goldenValue });
			}
		} else {
			newComboStreak = 0;
		}

		const newScore = score + scoreGain;
		const newReactionTimes = [...reactionTimes, reactionTime].slice(-20); // Keep last 20
		
		// Update personal best
		const newPersonalBest = Math.max(personalBest, newScore);
		
		// Calculate next potential score for UI
		const nextPotentialScore = get().getNextPotentialScore(newStreak);
		
		// Get celebration level
		const celebrationLevel = get().getCelebrationLevel(scoreGain, newStreak);
		
		// Check if game should end
		const lives = livesForMode(gameMode);
		const shouldEndGame = newMistakes >= lives;
		
		console.log('[GameStore] New state - score:', newScore, 'level:', newLevel, 'streak:', newStreak, 'scoreGain:', scoreGain);
		
		// Update state with enhanced tracking
		set({
			score: newScore,
			streak: newStreak,
			level: newLevel,
			mistakes: newMistakes,
			totalReactionTime: newTotalReactionTime,
			lastReactionTime: reactionTime,
			perfectRounds: newPerfectRounds,
			lightningReactions: newLightningReactions,
			comboStreak: newComboStreak,
			personalBest: newPersonalBest,
			currentMultiplier: newStreak === 0 ? 10 : 10 * Math.pow(2, Math.min(newStreak - 1, 5)),
			nextPotentialScore,
			speedBonusActive,
			lastScoreGain: scoreGain,
			celebrationLevel,
			showScoreBreakdown: false,
			luckyMultiplierActive: false, // Reset after use
			luckyMultiplierValue: 1,
			lastLuckyMultiplier: get().luckyMultiplierActive ? get().luckyMultiplierValue : 1,
			goldenActive: false,
			goldenValue: 0,
			reactionTimes: newReactionTimes,
			lastFailReason: !answerCorrect ? 'wrong' : !withinTimeLimit ? 'time' : undefined,
			lastFailDetail: !answerCorrect 
				? `Expected one of: ${acceptable.join(', ')}` 
				: !withinTimeLimit ? `Too slow: ${Math.round(reactionTime)}ms` : undefined
		});
		
		// Handle game end or continue
		if (shouldEndGame) {
			console.log('[GameStore] Game should end, calling endGame');
			get().endGame();
			return;
		}

		console.log('[GameStore] Scheduling next instruction generation with animation delay');
		setTimeout(() => {
			get().generateNextInstruction();
		}, 300); // Small delay for smooth animations
	},

	generateNextInstruction: () => {
		console.log('[GameStore] Generating next instruction');
		const { level, currentInstruction, streak, mistakes, reactionTimes, gameMode } = get();
		
		try {
			// Adaptive difficulty based on performance
			const adaptiveLevel = get().calculateAdaptiveLevel();
			// Create previous instructions array for pattern prevention
			const previousInstructions = currentInstruction ? [currentInstruction] : [];
			const next = generateInstruction(adaptiveLevel, previousInstructions);
			
			// CRITICAL FIX: Ensure instruction has valid answers
			if (!next.acceptableAnswers || next.acceptableAnswers.length === 0) {
				console.error('[GameStore] Generated instruction has no acceptable answers, using fallback');
				throw new Error('Invalid instruction: no acceptable answers');
			}

			// Enhanced adaptive time limit with flow state consideration
			const baseTimeLimit = get().practiceMode ? 4000 : 3000;
			let timeLimit = baseTimeLimit;
			
			// Apply flow state adjustments
			const { flowStateAnalysis } = get();
			if (flowStateAnalysis) {
				timeLimit *= flowStateAnalysis.adjustments.timeMultiplier;
			}
			
			// Game mode adjustments
			timeLimit *= speedMultiplierForMode(gameMode);
			timeLimit *= levelTimeDecayMultiplier(adaptiveLevel);
			
			// Practice mode gets extra time and hints
			if (get().practiceMode) {
				timeLimit *= 1.3; // 30% more time in practice mode
			}

			console.log('[GameStore] Generated instruction:', {
				type: next.type,
				display: next.display,
				correctAnswer: next.correctAnswer,
				acceptableAnswers: next.acceptableAnswers,
				timeLimit: timeLimit,
				adaptiveLevel: adaptiveLevel
			});
			set({ 
				currentInstruction: next, 
				timeRemaining: timeLimit, 
				roundTimeLimit: timeLimit,
				lastInstructionGenerationTime: Date.now()
			});
		} catch (error) {
			console.error('[GameStore] Error generating instruction:', error);
			// Enhanced fallback: create a simple direction instruction with guaranteed valid answers
			const fallback: Instruction = {
				id: `fallback-${Date.now()}`,
				type: 'direction' as const,
				display: 'SWIPE UP',
				direction: 'UP' as const,
				correctAnswer: 'DOWN' as const,
				acceptableAnswers: ['DOWN' as const],
				timeLimit: 3000
			};
			console.log('[GameStore] Using fallback instruction:', fallback);
			set({ 
				currentInstruction: fallback, 
				timeRemaining: 3000, 
				roundTimeLimit: 3000,
				lastInstructionGenerationTime: Date.now()
			});
		}
	},
	pauseGame: () => {
		console.log('[GameStore] Pausing game');
		set({ isActive: false });
	},
	
	resumeGame: () => {
		console.log('[GameStore] Resuming game');
		set({ isActive: true });
	},
	endGame: () => {
		const { mistakes, gameMode, timeRemaining, score, streak, personalBests, lives } = get();

		if (mistakes >= lives || timeRemaining <= 0) {
			// Update mode-specific best score
			const currentBest = personalBests[gameMode] || 0;
			const newPersonalBests = {
				...personalBests,
				[gameMode]: Math.max(currentBest, score)
			};
			
			// Update overall personal best
			const overallBest = Math.max(...Object.values(newPersonalBests));
			
			set({
				isActive: false,
				hasStarted: true, // Keep this true to show GameOver screen
				showScoreBreakdown: true,
				lastScoreGain: score,
				celebrationLevel: getCelebrationLevel(score, streak),
				personalBests: newPersonalBests,
				personalBest: overallBest,
			});
			console.log('[GameStore] Game Over - showing score breakdown');
		}
	},
	resetGame: () => {
		set({
			level: 1,
			score: 0,
			streak: 0,
			timeRemaining: 3000,
			mistakes: 0,
			isActive: false,
			hasStarted: false,
			currentInstruction: null,
			showScoreBreakdown: false,
		});
		console.log('[GameStore] Game reset without navigation');
	},
	
	// New function to handle starting a new game from GameOver screen
	startNewGameFromGameOver: (gameMode?: string) => {
		// Reset game state but keep hasStarted true to avoid jumping to menu
		set({
			level: 1,
			score: 0,
			streak: 0,
			timeRemaining: 3000,
			mistakes: 0,
			isActive: false,
			hasStarted: true, // Keep this true to stay in game flow
			currentInstruction: null,
			showScoreBreakdown: false,
		});
		
		// If gameMode is provided, start the game immediately
		if (gameMode) {
			requestAnimationFrame(() => {
				try {
					get().startGame(gameMode as any);
					console.log('[GameStore] New game started from GameOver');
				} catch (error) {
					console.error('[GameStore] Error starting new game from GameOver:', error);
				}
			});
		}
	},
	
	// Function to properly return to menu from GameOver
	returnToMenu: () => {
		set({
			level: 1,
			score: 0,
			streak: 0,
			timeRemaining: 3000,
			mistakes: 0,
			isActive: false,
			hasStarted: false, // This will show the menu
			currentInstruction: null,
			showScoreBreakdown: false,
		});
		console.log('[GameStore] Returned to menu from GameOver');
	},
	updateTimer: (timeLeft) => set({ timeRemaining: timeLeft }),
	
	// Daily challenge support methods
	addPoints: (points) => {
		set(state => ({ 
			totalPoints: state.totalPoints + points 
		}));
	},
	
	addStarCoins: (coins) => {
		set(state => ({ 
			starCoins: state.starCoins + coins 
		}));
	},
	
	// New addiction mechanics
	getExponentialScore: (streak) => {
		// Exponential scoring: 10→20→40→80→160→320→640→1280...
		if (streak <= 0) return 10;
		return 10 * Math.pow(2, streak - 1);
	},
	
	getNextPotentialScore: (streak) => {
		return streak === 0 ? 10 : 10 * Math.pow(2, Math.min(streak, 5));
	},
	
	triggerRandomMultiplier: () => {
		const rand = Math.random();
		if (rand < 0.01) return { active: true, multiplier: 5 };
		if (rand < 0.03) return { active: true, multiplier: 3 };
		if (rand < 0.06) return { active: true, multiplier: 2 };
		return { active: false, multiplier: 1 };
	},
	
	checkLightningBonus: (reactionTime) => {
		return reactionTime < 400;
	},
	
	updateStreakMultiplier: () => {
		const { streak } = get();
		const baseScore = streak === 0 ? 10 : 10 * Math.pow(2, Math.min(streak - 1, 5));
		const nextScore = 10 * Math.pow(2, Math.min(streak, 5));
		
		set({
			currentMultiplier: baseScore,
			nextPotentialScore: nextScore
		});
	},
	
	// Enhanced adaptive difficulty with flow state analysis
	calculateAdaptiveLevel: () => {
		const { level, streak, mistakes, reactionTimes, comboStreak, score, perfectRounds } = get();
		
		// Create performance metrics for analysis
		const metrics: PerformanceMetrics = {
			reactionTimes: reactionTimes.slice(-10),
			accuracy: mistakes === 0 ? 1.0 : Math.max(0, 1 - (mistakes * 0.2)),
			streak,
			comboStreak,
			mistakes,
			flowStateIndicators: {
				consistentTiming: reactionTimes.length >= 3 && 
					reactionTimes.slice(-3).every(time => Math.abs(time - 800) < 300),
				lowStress: mistakes <= 1,
				highEngagement: streak >= 3 || comboStreak >= 2
			}
		};
		
		// Analyze flow state
		const flowAnalysis = adaptiveDifficulty.analyzeFlowState(metrics);
		
		// Update flow state in store
		set({ flowStateAnalysis: flowAnalysis });
		
		// Calculate adaptive level based on flow analysis
		let adaptiveLevel = level + flowAnalysis.adjustments.complexityBoost;
		
		// Apply time multiplier for next instruction
		const baseTimeMultiplier = flowAnalysis.adjustments.timeMultiplier;
		
		// Activate practice mode if recommended
		if (flowAnalysis.adjustments.practiceMode && !get().practiceMode) {
			set({ practiceMode: true });
			console.log('[AdaptiveDifficulty] Practice mode activated');
		} else if (!flowAnalysis.adjustments.practiceMode && get().practiceMode) {
			set({ practiceMode: false });
			console.log('[AdaptiveDifficulty] Practice mode deactivated');
		}
		
		// Store adaptive level for UI display
		set({ adaptiveDifficultyLevel: adaptiveLevel });
		
		// Cap adaptive level to prevent overwhelming difficulty
		return Math.max(1, Math.min(adaptiveLevel, level + 3));
	},
	
	// Toggle practice mode manually
	togglePracticeMode: () => {
		const { practiceMode } = get();
		set({ practiceMode: !practiceMode });
		console.log('[GameStore] Practice mode toggled:', !practiceMode);
	},
	
	// Add missing lives property
	lives: 3,
	
	// Generate daily challenge based on performance
	generateDailyChallenge: () => {
		const { reactionTimes, streak, mistakes, score } = get();
		
		// Create recent performance metrics
		const recentMetrics: PerformanceMetrics[] = [{
			reactionTimes: reactionTimes.slice(-20),
			accuracy: mistakes === 0 ? 1.0 : Math.max(0, 1 - (mistakes * 0.2)),
			streak,
			comboStreak: get().comboStreak,
			mistakes,
			flowStateIndicators: {
				consistentTiming: true,
				lowStress: mistakes <= 1,
				highEngagement: streak >= 3
			}
		}];
		
		return adaptiveDifficulty.generateDailyChallenge(get().level, recentMetrics);
	},
}),
{
	name: 'brain-flip-game-store',
	version: 1,
	// Only persist certain fields
	partialize: (state: EnhancedGameState) => ({
		gamesPlayed: state.gamesPlayed,
		totalPoints: state.totalPoints,
		starCoins: state.starCoins,
		personalBest: state.personalBest,
		personalBests: state.personalBests,
		bestStreak: state.bestStreak,
		reactionTimes: state.reactionTimes,
		dailyStreak: state.dailyStreak,
		lastPlayDate: state.lastPlayDate,
		lastDailyClaimDate: state.lastDailyClaimDate,
	}),
}
));

// Helpers for game modes
export function livesForMode(mode: LegacyGameState['gameMode']): number {
	switch (mode) {
		case 'sudden-death':
			return 1; // one mistake ends the game
		case 'duel':
			return 2; // two lives
		case 'classic':
		default:
			return 3; // three lives
	}
}
function speedMultiplierForMode(mode: LegacyGameState['gameMode']): number {
	switch (mode) {
		case 'sudden-death':
			return 0.95; // slightly faster
		case 'duel':
			return 0.85; // faster paced
		case 'classic':
		default:
			return 1.0;
	}
}

// Level-based time decay: slow start then ramps up with levels (ease-in curve)
function levelTimeDecayMultiplier(level: number): number {

	// Normalize progress across 20 levels for faster progression


	// Quadratic ease-in: starts gentle, accelerates as t increases

	// Make sure minimum is reasonable
	return Math.min(1, Math.max(0.3, mult));
}

// Exported for external use
export function getCelebrationLevel(scoreGain: number, streak: number): 'none' | 'good' | 'great' | 'amazing' | 'legendary' {
  if (scoreGain >= 1000 && streak >= 10) return 'legendary';
  if (scoreGain >= 500 && streak >= 5) return 'amazing';
  if (scoreGain >= 200 && streak >= 3) return 'great';
  if (scoreGain >= 100 && streak >= 1) return 'good';
  return 'none';
}

