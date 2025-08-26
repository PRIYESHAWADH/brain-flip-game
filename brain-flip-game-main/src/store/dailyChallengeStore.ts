import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface DailyChallenge {
	id: string;
	name: string;
	description: string;
	icon: string;
	difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
	requirement: {
		type: 'streak' | 'score' | 'speed' | 'perfect' | 'games' | 'accuracy';
		target: number;
		condition?: string; // Additional conditions like "in one game"
	};
	reward: {
		points: number;
		starCoins: number;
		bonusMultiplier?: number;
	};
	completed: boolean;
	completedAt?: string;
	progress: number;
	expiresAt: string;
}

export interface WeeklyTournament {
	id: string;
	name: string;
	description: string;
	startDate: string;
	endDate: string;
	participants: number;
	prizePool: {
		first: { points: number; starCoins: number; cosmetic?: string };
		second: { points: number; starCoins: number };
		third: { points: number; starCoins: number };
		participation: { points: number };
	};
	leaderboard: Array<{
		playerId: string;
		playerName: string;
		score: number;
		rank: number;
	}>;
	userRank?: number;
	userScore?: number;
	active: boolean;
}

interface DailyChallengeStore {
	dailyChallenges: DailyChallenge[];
	weeklyTournament: WeeklyTournament | null;
	lastChallengeRefresh: string;
	globalJackpot: number;
	lastJackpotWinner?: {
		playerName: string;
		amount: number;
		date: string;
	};
	dailyProgress: {
		bestStreak: number;
		bestScore: number;
		bestReactionTime: number;
		totalPerfectRounds: number;
		totalGamesPlayed: number;
		totalCorrectAnswers: number;
		totalAnswers: number;
		lastUpdated: string;
	};
	
	// Actions
	generateDailyChallenges: () => void;
	updateChallengeProgress: (gameStats: {
		streak: number;
		score: number;
		reactionTime: number;
		perfectRounds: number;
		gamesPlayed: number;
		accuracy: number;
	}) => DailyChallenge[];
	updateDailyProgress: (gameData: {
		streak: number;
		score: number;
		reactionTime: number;
		perfectRounds: number;
		correctAnswers: number;
		totalAnswers: number;
	}) => void;
	completeDailyChallenge: (id: string) => void;
	addToGlobalJackpot: (amount: number) => void;
	claimJackpot: (playerName: string) => number;
	joinWeeklyTournament: () => void;
	updateTournamentScore: (score: number) => void;
}

const CHALLENGE_TEMPLATES = [
	{
		name: 'Speed Demon',
		description: 'React in under {target}ms {condition}',
		icon: '⚡',
		type: 'speed' as const,
		difficulties: {
			easy: { target: 500, points: 200, starCoins: 1 },
			medium: { target: 400, points: 400, starCoins: 2 },
			hard: { target: 300, points: 800, starCoins: 4 },
			extreme: { target: 200, points: 1500, starCoins: 8 }
		}
	},
	{
		name: 'Streak Master',
		description: 'Achieve a {target}-streak {condition}',
		icon: '🔥',
		type: 'streak' as const,
		difficulties: {
			easy: { target: 5, points: 150, starCoins: 1 },
			medium: { target: 10, points: 300, starCoins: 2 },
			hard: { target: 20, points: 600, starCoins: 4 },
			extreme: { target: 35, points: 1200, starCoins: 8 }
		}
	},
	{
		name: 'High Scorer',
		description: 'Score {target} points {condition}',
		icon: '🎯',
		type: 'score' as const,
		difficulties: {
			easy: { target: 2000, points: 200, starCoins: 1 },
			medium: { target: 5000, points: 400, starCoins: 2 },
			hard: { target: 10000, points: 800, starCoins: 4 },
			extreme: { target: 25000, points: 1500, starCoins: 8 }
		}
	},
	{
		name: 'Perfectionist',
		description: 'Complete {target} perfect rounds {condition}',
		icon: '💎',
		type: 'perfect' as const,
		difficulties: {
			easy: { target: 3, points: 180, starCoins: 1 },
			medium: { target: 8, points: 360, starCoins: 2 },
			hard: { target: 15, points: 720, starCoins: 4 },
			extreme: { target: 25, points: 1400, starCoins: 8 }
		}
	},
	{
		name: 'Marathon Runner',
		description: 'Play {target} games today',
		icon: '🏃',
		type: 'games' as const,
		difficulties: {
			easy: { target: 3, points: 120, starCoins: 1 },
			medium: { target: 7, points: 250, starCoins: 2 },
			hard: { target: 15, points: 500, starCoins: 4 },
			extreme: { target: 30, points: 1000, starCoins: 8 }
		}
	},
	{
		name: 'Accuracy Expert',
		description: 'Maintain {target}% accuracy {condition}',
		icon: '🎪',
		type: 'accuracy' as const,
		difficulties: {
			easy: { target: 80, points: 160, starCoins: 1 },
			medium: { target: 90, points: 320, starCoins: 2 },
			hard: { target: 95, points: 640, starCoins: 4 },
			extreme: { target: 98, points: 1280, starCoins: 8 }
		}
	}
];

function generateRandomChallenges(): DailyChallenge[] {
	const challenges: DailyChallenge[] = [];
	const usedTemplates = new Set<number>();
	const tomorrow = new Date();
	tomorrow.setDate(tomorrow.getDate() + 1);
	tomorrow.setHours(0, 0, 0, 0);
	
	// Generate 3 daily challenges with different difficulties
	const difficulties: Array<'easy' | 'medium' | 'hard' | 'extreme'> = ['easy', 'medium', 'hard'];
	
	for (let i = 0; i < 3; i++) {
		let templateIndex;
		do {
			templateIndex = Math.floor(Math.random() * CHALLENGE_TEMPLATES.length);
		} while (usedTemplates.has(templateIndex));
		
		usedTemplates.add(templateIndex);
		
		const template = CHALLENGE_TEMPLATES[templateIndex];
		const difficulty = difficulties[i];
		const config = template.difficulties[difficulty];
		
		const challenge: DailyChallenge = {
			id: `${template.type}-${difficulty}-${Date.now()}-${i}`,
			name: template.name,
			description: template.description
				.replace('{target}', config.target.toString())
				.replace('{condition}', difficulty === 'easy' ? 'today' : difficulty === 'medium' ? 'in one game' : 'in one perfect game'),
			icon: template.icon,
			difficulty,
			requirement: {
				type: template.type,
				target: config.target,
				condition: difficulty === 'easy' ? 'today' : difficulty === 'medium' ? 'in one game' : 'in one perfect game'
			},
			reward: {
				points: config.points,
				starCoins: config.starCoins,
				bonusMultiplier: difficulty === 'extreme' ? 2 : 1
			},
			completed: false,
			progress: 0,
			expiresAt: tomorrow.toISOString()
		};
		
		challenges.push(challenge);
	}
	
	return challenges;
}

export const useDailyChallengeStore = create<DailyChallengeStore>()(
	persist(
		(set, get) => ({
			dailyChallenges: [],
			weeklyTournament: null,
			lastChallengeRefresh: '',
			globalJackpot: 0, // Starting jackpot
			dailyProgress: {
				bestStreak: 0,
				bestScore: 0,
				bestReactionTime: Infinity,
				totalPerfectRounds: 0,
				totalGamesPlayed: 0,
				totalCorrectAnswers: 0,
				totalAnswers: 0,
				lastUpdated: ''
			},
			
			generateDailyChallenges: () => {
				const { lastChallengeRefresh, dailyProgress } = get();
				const today = new Date().toISOString().split('T')[0];
				const newChallenges = generateRandomChallenges();

				if (lastChallengeRefresh !== today) {
					set({
						dailyChallenges: newChallenges,
						lastChallengeRefresh: today,
						// Reset daily progress for new day
						dailyProgress: {
							bestStreak: 0,
							bestScore: 0,
							bestReactionTime: Infinity,
							totalPerfectRounds: 0,
							totalGamesPlayed: 0,
							totalCorrectAnswers: 0,
							totalAnswers: 0,
							lastUpdated: today
						}
					});
				}
			},
			
			updateDailyProgress: (gameData) => {
				const { dailyProgress } = get();
				const today = new Date().toISOString().split('T')[0];

				const updatedProgress = {
					bestStreak: Math.max(dailyProgress.bestStreak, gameData.streak),
					bestScore: Math.max(dailyProgress.bestScore, gameData.score),
					bestReactionTime: Math.min(dailyProgress.bestReactionTime, gameData.reactionTime),
					totalPerfectRounds: dailyProgress.totalPerfectRounds + gameData.perfectRounds,
					totalGamesPlayed: dailyProgress.totalGamesPlayed + 1,
					totalCorrectAnswers: dailyProgress.totalCorrectAnswers + gameData.correctAnswers,
					totalAnswers: dailyProgress.totalAnswers + gameData.totalAnswers,
					lastUpdated: today
				};
				
				set({ dailyProgress: updatedProgress });
			},
			
			updateChallengeProgress: (gameStats) => {
				const { dailyChallenges, dailyProgress } = get();
				const completedChallenges: DailyChallenge[] = [];
				const today = new Date().toISOString().split('T')[0];

				const updatedChallenges = dailyChallenges.map(challenge => {
					let progress = 0;
					let shouldComplete = false;

					switch (challenge.requirement.type) {
						case 'streak':
							progress = Math.min(dailyProgress.bestStreak / challenge.requirement.target, 1);
							shouldComplete = dailyProgress.bestStreak >= challenge.requirement.target;
							break;
						case 'score':
							progress = Math.min(dailyProgress.bestScore / challenge.requirement.target, 1);
							shouldComplete = dailyProgress.bestScore >= challenge.requirement.target;
							break;
						case 'speed':
							if (dailyProgress.bestReactionTime !== Infinity && dailyProgress.bestReactionTime <= challenge.requirement.target) {
								progress = 1;
								shouldComplete = true;
							}
							break;
						case 'perfect':
							progress = Math.min(dailyProgress.totalPerfectRounds / challenge.requirement.target, 1);
							shouldComplete = dailyProgress.totalPerfectRounds >= challenge.requirement.target;
							break;
						case 'games':
							progress = Math.min(dailyProgress.totalGamesPlayed / challenge.requirement.target, 1);
							shouldComplete = dailyProgress.totalGamesPlayed >= challenge.requirement.target;
							break;
						case 'accuracy':
							const accuracy = dailyProgress.totalAnswers > 0
								? (dailyProgress.totalCorrectAnswers / dailyProgress.totalAnswers) * 100 
								: 0;
							if (accuracy >= challenge.requirement.target) {
								progress = 1;
								shouldComplete = true;
							} else {
								progress = accuracy / challenge.requirement.target;
							}
							break;
					}
					
					if (shouldComplete && !challenge.completed) {
						const completedChallenge = {
							...challenge,
							completed: true,
							completedAt: new Date().toISOString(),
							progress: 1
						};
						completedChallenges.push(completedChallenge);
						return completedChallenge;
					}
					
					return { ...challenge, progress };
				});
				
				set({ dailyChallenges: updatedChallenges });
				return completedChallenges;
			},
			
			completeDailyChallenge: (id) => {
				set(state => ({
					dailyChallenges: state.dailyChallenges.map(c => 
						c.id === id ? { ...c, completed: true, completedAt: new Date().toISOString() } : c
					)
				}));
			},
			
			addToGlobalJackpot: (amount) => {
				set(state => ({
					globalJackpot: state.globalJackpot + amount
				}));
			},
			
			claimJackpot: (playerName) => {
				const { globalJackpot } = get();
				set({
					globalJackpot: 1000, // Reset to base amount after win
					lastJackpotWinner: {
						playerName,
						amount: globalJackpot,
						date: new Date().toISOString()
					}
				});
				return globalJackpot;
			},
			
			joinWeeklyTournament: () => {
				const now = new Date();
				const startOfWeek = new Date(now);
				const endOfWeek = new Date(now);

				startOfWeek.setDate(now.getDate() - now.getDay());
				startOfWeek.setHours(0, 0, 0, 0);

				endOfWeek.setDate(startOfWeek.getDate() + 7);
				
				const tournament: WeeklyTournament = {
					id: `tournament_${startOfWeek.getTime()}`,
					name: 'Weekly Brain Flip Championship',
					description: 'Compete with players worldwide for the ultimate brain flip crown!',
					startDate: startOfWeek.toISOString(),
					endDate: endOfWeek.toISOString(),
					participants: 1,
					prizePool: {
						first: { points: 50000, starCoins: 100, cosmetic: 'Golden Brain Trophy' },
						second: { points: 25000, starCoins: 50 },
						third: { points: 15000, starCoins: 25 },
						participation: { points: 1000 }
					},
					leaderboard: [],
					userRank: undefined,
					userScore: 0,
					active: true
				};
				
				set({ weeklyTournament: tournament });
			},
			
			updateTournamentScore: (score) => {
				const { weeklyTournament } = get();
				if (weeklyTournament && weeklyTournament.active && score > (weeklyTournament.userScore || 0)) {
					// Update user's best score in tournament
					const updatedTournament = {
						...weeklyTournament,
						userScore: score
					};
					
					// Add user to leaderboard if not already there
					const userEntry = updatedTournament.leaderboard.find(p => p.playerId === 'user');
					const existingUserIndex = updatedTournament.leaderboard.findIndex(p => p.playerId === 'user');

					if (existingUserIndex >= 0) {
						updatedTournament.leaderboard[existingUserIndex].score = score;
					} else {
						updatedTournament.leaderboard.push({
							playerId: 'user',
							playerName: 'You',
							score: score,
							rank: 1
						});
					}
					
					// Sort leaderboard and update ranks
					updatedTournament.leaderboard.sort((a, b) => b.score - a.score);
					updatedTournament.leaderboard.forEach((player, index) => {
						player.rank = index + 1;
					});
					
					// Update user rank
					updatedTournament.userRank = userEntry?.rank || updatedTournament.leaderboard.length + 1;
					
					set({ weeklyTournament: updatedTournament });
				}
			}
		}),
		{
			name: 'brain-flip-daily-challenges',
			version: 1
		}
	)
);