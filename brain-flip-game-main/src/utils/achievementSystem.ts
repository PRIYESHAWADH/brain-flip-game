export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'score' | 'streak' | 'speed' | 'accuracy' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  unlockedAt?: number;
  rewards: {
    points: number;
    starCoins: number;
    title?: string;
  };
}

export interface GameStats {
  totalGamesPlayed: number;
  totalScore: number;
  bestScore: number;
  totalStreak: number;
  bestStreak: number;
  averageReactionTime: number;
  totalPlayTime: number;
  perfectRounds: number;
  achievements: Achievement[];
}

const ACHIEVEMENTS: Omit<Achievement, 'unlocked' | 'progress' | 'unlockedAt'>[] = [
  // Score Achievements
  {
    id: 'first_score_100',
    name: 'Century',
    description: 'Score 100 points in a single game',
    icon: '💯',
    category: 'score',
    rarity: 'common',
    maxProgress: 100,
    rewards: { points: 50, starCoins: 1 }
  },
  {
    id: 'first_score_1000',
    name: 'Millennium',
    description: 'Score 1,000 points in a single game',
    icon: '🏆',
    category: 'score',
    rarity: 'rare',
    maxProgress: 1000,
    rewards: { points: 200, starCoins: 3 }
  },
  {
    id: 'first_score_10000',
    name: 'Ten Thousand',
    description: 'Score 10,000 points in a single game',
    icon: '👑',
    category: 'score',
    rarity: 'epic',
    maxProgress: 10000,
    rewards: { points: 500, starCoins: 10, title: 'Score Master' }
  },
  
  // Streak Achievements
  {
    id: 'streak_5',
    name: 'Hot Streak',
    description: 'Achieve a 5-round streak',
    icon: '🔥',
    category: 'streak',
    rarity: 'common',
    maxProgress: 5,
    rewards: { points: 25, starCoins: 1 }
  },
  {
    id: 'streak_10',
    name: 'On Fire',
    description: 'Achieve a 10-round streak',
    icon: '🚀',
    category: 'streak',
    rarity: 'rare',
    maxProgress: 10,
    rewards: { points: 100, starCoins: 2 }
  },
  {
    id: 'streak_25',
    name: 'Unstoppable',
    description: 'Achieve a 25-round streak',
    icon: '⚡',
    category: 'streak',
    rarity: 'epic',
    maxProgress: 25,
    rewards: { points: 300, starCoins: 5, title: 'Streak Master' }
  },
  
  // Speed Achievements
  {
    id: 'lightning_fast',
    name: 'Lightning Fast',
    description: 'React in under 200ms',
    icon: '⚡',
    category: 'speed',
    rarity: 'rare',
    maxProgress: 1,
    rewards: { points: 150, starCoins: 2 }
  },
  {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Complete 10 rounds with average time under 400ms',
    icon: '👹',
    category: 'speed',
    rarity: 'epic',
    maxProgress: 10,
    rewards: { points: 400, starCoins: 8 }
  },
  
  // Accuracy Achievements
  {
    id: 'perfect_game',
    name: 'Perfectionist',
    description: 'Complete a game without mistakes',
    icon: '💎',
    category: 'accuracy',
    rarity: 'rare',
    maxProgress: 1,
    rewards: { points: 200, starCoins: 3 }
  },
  {
    id: 'perfect_streak_20',
    name: 'Flawless',
    description: 'Complete 20 perfect rounds in a row',
    icon: '✨',
    category: 'accuracy',
    rarity: 'legendary',
    maxProgress: 20,
    rewards: { points: 1000, starCoins: 20, title: 'Perfection Incarnate' }
  },
  
  // Special Achievements
  {
    id: 'first_game',
    name: 'Welcome to Brain Flip',
    description: 'Play your first game',
    icon: '🎮',
    category: 'special',
    rarity: 'common',
    maxProgress: 1,
    rewards: { points: 10, starCoins: 1 }
  },
  {
    id: 'daily_player',
    name: 'Daily Dedication',
    description: 'Play for 7 consecutive days',
    icon: '📅',
    category: 'special',
    rarity: 'rare',
    maxProgress: 7,
    rewards: { points: 300, starCoins: 5 }
  },
  {
    id: 'comeback_king',
    name: 'Comeback King',
    description: 'Reach level 10 after failing at level 1',
    icon: '👑',
    category: 'special',
    rarity: 'epic',
    maxProgress: 1,
    rewards: { points: 500, starCoins: 10, title: 'Phoenix' }
  }
];

export class EnhancedAchievementSystem {
  private achievements: Achievement[];
  
  constructor() {
    this.achievements = ACHIEVEMENTS.map(achievement => ({
      ...achievement,
      unlocked: false,
      progress: 0
    }));
  }
  
  checkAchievements(gameStats: Partial<GameStats>): Achievement[] {
    const newlyUnlocked: Achievement[] = [];
    
    this.achievements.forEach(achievement => {
      if (achievement.unlocked) return;
      
      let currentProgress = achievement.progress;
      
      switch (achievement.id) {
        case 'first_score_100':
          currentProgress = Math.max(currentProgress, gameStats.bestScore || 0);
          break;
        case 'first_score_1000':
          currentProgress = Math.max(currentProgress, gameStats.bestScore || 0);
          break;
        case 'first_score_10000':
          currentProgress = Math.max(currentProgress, gameStats.bestScore || 0);
          break;
        case 'streak_5':
        case 'streak_10':
        case 'streak_25':
          currentProgress = Math.max(currentProgress, gameStats.bestStreak || 0);
          break;
        case 'lightning_fast':
          if (gameStats.averageReactionTime && gameStats.averageReactionTime < 200) {
            currentProgress = 1;
          }
          break;
        case 'perfect_game':
          // This would be set externally when a perfect game is detected
          break;
        case 'first_game':
          currentProgress = Math.max(currentProgress, gameStats.totalGamesPlayed || 0);
          break;
      }
      
      achievement.progress = currentProgress;
      
      if (currentProgress >= achievement.maxProgress && !achievement.unlocked) {
        achievement.unlocked = true;
        achievement.unlockedAt = Date.now();
        newlyUnlocked.push(achievement);
      }
    });
    
    return newlyUnlocked;
  }
  
  getAchievements(): Achievement[] {
    return [...this.achievements];
  }
  
  getUnlockedAchievements(): Achievement[] {
    return this.achievements.filter(a => a.unlocked);
  }
  
  getAchievementProgress(id: string): { progress: number; maxProgress: number } | null {
    const achievement = this.achievements.find(a => a.id === id);
    return achievement ? { progress: achievement.progress, maxProgress: achievement.maxProgress } : null;
  }
  
  getTotalRewards(): { points: number; starCoins: number } {
    return this.achievements
      .filter(a => a.unlocked)
      .reduce(
        (total, achievement) => ({
          points: total.points + achievement.rewards.points,
          starCoins: total.starCoins + achievement.rewards.starCoins
        }),
        { points: 0, starCoins: 0 }
      );
  }
  
  getUnlockedTitles(): string[] {
    return this.achievements
      .filter(a => a.unlocked && a.rewards.title)
      .map(a => a.rewards.title!)
      .filter(Boolean);
  }
}