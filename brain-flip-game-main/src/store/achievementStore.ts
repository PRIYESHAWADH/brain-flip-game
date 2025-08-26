import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Achievement {
	id: string;
	name: string;
	description: string;
	icon: string;
	tier: 'bronze' | 'silver' | 'gold' | 'diamond' | 'legendary';
	requirement: {
		type: 'streak' | 'score' | 'speed' | 'perfect' | 'daily' | 'combo' | 'games';
		target: number;
	};
	reward: {
		points: number;
		starCoins?: number;
		cosmetic?: string;
	};
	unlocked: boolean;
	unlockedAt?: string;
	progress: number;
}

export interface Badge {
	id: string;
	name: string;
	icon: string;
	color: string;
	description: string;
	unlocked: boolean;
}

interface AchievementStore {
	achievements: Achievement[];
	badges: Badge[];
	unlockedCosmetics: string[];
	
	// Actions
	checkAchievements: (gameStats: {
		streak: number;
		score: number;
		reactionTime: number;
		perfectRounds: number;
		dailyStreak: number;
		comboStreak: number;
		gamesPlayed: number;
	}) => Achievement[];
	unlockAchievement: (id: string) => void;
	unlockBadge: (id: string) => void;
	unlockCosmetic: (id: string) => void;
	getProgress: (id: string) => number;
	getUnlockedAchievements: () => Achievement[];
	getTierProgress: (tier: Achievement['tier']) => {
		unlocked: number;
		total: number;
		percentage: number;
	};
}

import { LEGENDARY_ACHIEVEMENTS } from './legendaryAchievements';

const BASE_ACHIEVEMENTS: Achievement[] = [
	{
		id: 'first_steps',
		name: 'First Steps',
		description: 'Complete your first game',
		icon: '👶',
		tier: 'bronze',
		requirement: { type: 'games', target: 1 },
		reward: { points: 100 },
		unlocked: false,
		progress: 0
	},
	{
		id: 'speed_demon',
		name: 'Speed Demon',
		description: 'React in under 300ms',
		icon: '⚡',
		tier: 'silver',
		requirement: { type: 'speed', target: 300 },
		reward: { points: 200, starCoins: 1 },
		unlocked: false,
		progress: 0
	},
	{
		id: 'lightning_reflexes',
		name: 'Lightning Reflexes',
		description: 'React in under 200ms',
		icon: '🌩️',
		tier: 'gold',
		requirement: { type: 'speed', target: 200 },
		reward: { points: 500, starCoins: 3, cosmetic: 'lightning_trail' },
		unlocked: false,
		progress: 0
	},
	{
		id: 'streak_starter',
		name: 'Streak Starter',
		description: 'Achieve a 5-streak',
		icon: '🔥',
		tier: 'bronze',
		requirement: { type: 'streak', target: 5 },
		reward: { points: 150 },
		unlocked: false,
		progress: 0
	},
	{
		id: 'streak_master',
		name: 'Streak Master',
		description: 'Achieve a 15-streak',
		icon: '🌟',
		tier: 'gold',
		requirement: { type: 'streak', target: 15 },
		reward: { points: 750, starCoins: 5 },
		unlocked: false,
		progress: 0
	},
	{
		id: 'streak_legend',
		name: 'Streak Legend',
		description: 'Achieve a 30-streak',
		icon: '👑',
		tier: 'legendary',
		requirement: { type: 'streak', target: 30 },
		reward: { points: 2000, starCoins: 15, cosmetic: 'crown_effect' },
		unlocked: false,
		progress: 0
	},
	{
		id: 'perfect_ten',
		name: 'Perfect Ten',
		description: 'Complete 10 perfect rounds',
		icon: '💎',
		tier: 'diamond',
		requirement: { type: 'perfect', target: 10 },
		reward: { points: 1000, starCoins: 8 },
		unlocked: false,
		progress: 0
	},
	{
		id: 'daily_warrior',
		name: 'Daily Warrior',
		description: 'Maintain a 7-day streak',
		icon: '📅',
		tier: 'silver',
		requirement: { type: 'daily', target: 7 },
		reward: { points: 500, starCoins: 2 },
		unlocked: false,
		progress: 0
	},
	{
		id: 'combo_king',
		name: 'Combo King',
		description: '5 perfect rounds in a row',
		icon: '🎯',
		tier: 'gold',
		requirement: { type: 'combo', target: 5 },
		reward: { points: 800, starCoins: 4 },
		unlocked: false,
		progress: 0
	},
	{
		id: 'high_scorer',
		name: 'High Scorer',
		description: 'Score 10,000 points in one game',
		icon: '🚀',
		tier: 'diamond',
		requirement: { type: 'score', target: 10000 },
		reward: { points: 1500, starCoins: 10 },
		unlocked: false,
		progress: 0
	}
];

const INITIAL_ACHIEVEMENTS = [...BASE_ACHIEVEMENTS, ...LEGENDARY_ACHIEVEMENTS];
];

const INITIAL_BADGES: Badge[] = [
	{
		id: 'newcomer',
		name: 'Newcomer',
		icon: '🌱',
		color: 'text-neon-green',
		description: 'Welcome to Brain Flip!',
		unlocked: true
	},
	{
		id: 'speed_runner',
		name: 'Speed Runner',
		icon: '💨',
		color: 'text-neon-yellow',
		description: 'Lightning fast reactions',
		unlocked: false
	},
	{
		id: 'perfectionist',
		name: 'Perfectionist',
		icon: '✨',
		color: 'text-neon-blue',
		description: 'Flawless execution',
		unlocked: false
	},
	{
		id: 'streak_champion',
		name: 'Streak Champion',
		icon: '🏆',
		color: 'text-neon-pink',
		description: 'Master of consistency',
		unlocked: false
	},
	{
		id: 'grandmaster',
		name: 'Grandmaster',
		icon: '👑',
		color: 'text-neon-purple',
		description: 'True mastery of Brain Flip',
		unlocked: false
	},
	{
		id: 'legend',
		name: 'Legend',
		icon: '🌟',
		color: 'text-neon-gold',
		description: 'Your name will be remembered',
		unlocked: false
	}
];

export const useAchievementStore = create<AchievementStore>()(
	persist(
		(set, get) => ({
			achievements: INITIAL_ACHIEVEMENTS,
			badges: INITIAL_BADGES,
			unlockedCosmetics: [],
			
			checkAchievements: (gameStats) => {
				const { achievements } = get();
				const newlyUnlocked: Achievement[] = [];
				
				const updatedAchievements = achievements.map(achievement => {
					let progress = 0;
					let shouldUnlock = false;

					if (achievement.unlocked) return achievement;
					
					switch (achievement.requirement.type) {
						case 'streak':
							progress = Math.min(gameStats.streak / achievement.requirement.target, 1);
							shouldUnlock = gameStats.streak >= achievement.requirement.target;
							break;
						case 'score':
							progress = Math.min(gameStats.score / achievement.requirement.target, 1);
							shouldUnlock = gameStats.score >= achievement.requirement.target;
							break;
						case 'speed':
							// For speed, lower is better, so we invert the logic
							progress = gameStats.reactionTime <= achievement.requirement.target ? 1 : 0;
							shouldUnlock = gameStats.reactionTime <= achievement.requirement.target;
							break;
						case 'perfect':
							progress = Math.min(gameStats.perfectRounds / achievement.requirement.target, 1);
							shouldUnlock = gameStats.perfectRounds >= achievement.requirement.target;
							break;
						case 'daily':
							progress = Math.min(gameStats.dailyStreak / achievement.requirement.target, 1);
							shouldUnlock = gameStats.dailyStreak >= achievement.requirement.target;
							break;
						case 'combo':
							progress = Math.min(gameStats.comboStreak / achievement.requirement.target, 1);
							shouldUnlock = gameStats.comboStreak >= achievement.requirement.target;
							break;
						case 'games':
							progress = Math.min(gameStats.gamesPlayed / achievement.requirement.target, 1);
							shouldUnlock = gameStats.gamesPlayed >= achievement.requirement.target;
							break;
					}
					
					if (shouldUnlock && !achievement.unlocked) {

							...achievement,
							unlocked: true,
							unlockedAt: new Date().toISOString(),
							progress: 1
						};
						newlyUnlocked.push(unlockedAchievement);
						return unlockedAchievement;
					}
					
					return { ...achievement, progress };
				});
				
				set({ achievements: updatedAchievements });
				return newlyUnlocked;
			},
			
			unlockAchievement: (id) => {
				set(state => ({
					achievements: state.achievements.map(a => 
						a.id === id ? { ...a, unlocked: true, unlockedAt: new Date().toISOString() } : a
					)
				}));
			},
			
			unlockBadge: (id) => {
				set(state => ({
					badges: state.badges.map(b => 
						b.id === id ? { ...b, unlocked: true } : b
					)
				}));
			},
			
			unlockCosmetic: (id) => {
				set(state => ({
					unlockedCosmetics: Array.from(new Set([...state.unlockedCosmetics, id]))
				}));
			},
			
			getProgress: (id) => {
				const achievement = get().achievements.find(a => a.id === id);
				return achievement?.progress || 0;
			}
		}),
		{
			name: 'brain-flip-achievements',
			version: 1
		}
	)
);