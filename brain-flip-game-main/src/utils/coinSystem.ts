import { 
  ScoreBreakdown, 
  GameResult, 
  Achievement, 
  CoinTransaction,
  COIN_FORMULAS,
  RANK_THRESHOLDS 
} from '@/types/coins';

/**
 * World-Class Coin Calculation System
 * Every coin earned is transparent, skill-based, and meaningful
 */

export function calculateGameScore(
  reactionTime: number, 
  streak: number, 
  level: number, 
  isPerfectRound: boolean,
  gameMode: string = 'classic'
): ScoreBreakdown {
  // Base score for completing a round
  const baseScore = 100;

  // Speed multiplier: rewards fast reactions
  let speedMultiplier = 1.0;
  if (reactionTime < 200) speedMultiplier = 3.0;
  else if (reactionTime < 400) speedMultiplier = 2.0;
  else if (reactionTime < 600) speedMultiplier = 1.5;

  // Streak bonus: linear with a sensible cap
  const streakBonus = Math.min(streak * 10, 500);

  // Level bonus: progressive rewards
  const levelBonus = level * 10;

  // Perfect round bonus
  const perfectBonus = isPerfectRound ? COIN_FORMULAS.PERFECT_BONUS : 0;

  // Combo multiplier: additional bonus for maintaining streaks
  const comboMultiplier = Math.min(1 + (streak * 0.1), 3.0); // Max 3x multiplier

  // Difficulty multiplier based on game mode
  const difficultyMultiplierMap: Record<string, number> = {
    classic: 1.0,
    duel: 1.3,
    'sudden-death': 1.8,
  };
  const difficultyMultiplier = difficultyMultiplierMap[gameMode] ?? 1.0;

  // Consistency bonus: reserved for future use (kept for type stability)
  const consistencyBonus = 0;

  // Calculate subtotal before multipliers
  const subtotal = baseScore + streakBonus + levelBonus + perfectBonus + consistencyBonus;

  // Apply multipliers
  const finalScore = Math.floor(subtotal * speedMultiplier * comboMultiplier * difficultyMultiplier);

  // Calculate coin rewards
  const gameCoinsEarned = Math.max(
    Math.floor(finalScore * COIN_FORMULAS.BASE_COIN_RATE),
    COIN_FORMULAS.MINIMUM_COINS_PER_GAME
  );

  // Bonus coins for exceptional performance
  let bonusCoinsEarned = 0;
  if (isPerfectRound) bonusCoinsEarned += 5;
  if (streak >= 10) bonusCoinsEarned += 10;
  if (reactionTime < 200) bonusCoinsEarned += 15;

  const totalCoinsAwarded = gameCoinsEarned + bonusCoinsEarned;

  return {
    baseScore,
    speedMultiplier,
    streakBonus,
    levelBonus,
    perfectBonus,
    comboMultiplier,
    difficultyBonus: Math.floor((difficultyMultiplier - 1) * 100), // percentage points over base
    consistencyBonus,
    subtotal,
    finalScore,
    gameCoinsEarned,
    bonusCoinsEarned,
    totalCoinsAwarded,
  };
}

export function calculatePlayerRank(experiencePoints: number) {
  // Find the highest rank the player qualifies for
  let currentRank = RANK_THRESHOLDS[0];
  let nextRank = RANK_THRESHOLDS[1] || RANK_THRESHOLDS[0];

  for (let i = 0; i < RANK_THRESHOLDS.length; i++) {
    if (experiencePoints >= RANK_THRESHOLDS[i].xp) {
      currentRank = RANK_THRESHOLDS[i];
      nextRank = RANK_THRESHOLDS[i + 1] || RANK_THRESHOLDS[i]; // Max rank
    } else {
      break;
    }
  }

  // Calculate progress to next rank
  const span = Math.max(1, nextRank.xp - currentRank.xp);
  const progressRaw = (experiencePoints - currentRank.xp) / span;
  const progressPercentage = Math.max(0, Math.min(100, Math.floor(progressRaw * 100)));

  // Calculate rank benefits based on tier
  const dailyCoins = currentRank.tier * 10;
  const starTokens = Math.floor(currentRank.tier / 5);
  const coinMultiplier = Math.min(2.5, 1 + currentRank.tier * 0.05);

  return {
    id: currentRank.name.toLowerCase().replace(/\s+/g, '-'),
    name: currentRank.name,
    tier: currentRank.tier,
    xpRequired: currentRank.xp,
    xpForNext: nextRank.xp,
    progress: progressPercentage,

    benefits: {
      dailyCoins,
      starTokens,
      coinMultiplier,
      exclusiveFeatures: generateRankFeatures(currentRank.tier),
      cosmetics: generateRankCosmetics(currentRank.tier),
      specialAbilities: generateRankAbilities(currentRank.tier),
    },

    prestige: {
      level: Math.max(0, currentRank.tier - 20), // Prestige after max rank
      bonusMultiplier: Math.max(0, (currentRank.tier - 20) * 0.1),
      exclusiveRewards: currentRank.tier > 20 ? ['Prestige Badge', 'Golden Effects'] : [],
    },
  };
}

function generateRankFeatures(tier: number): string[] {
  const features: string[] = [];
  if (tier >= 2) features.push('Custom Themes');
  if (tier >= 5) features.push('Advanced Stats');
  if (tier >= 8) features.push('Leaderboard Highlights');
  if (tier >= 12) features.push('Early Access Features');
  if (tier >= 16) features.push('VIP Support');
  if (tier >= 20) features.push('Neural Emperor Crown');
  return features;
}

function generateRankCosmetics(tier: number): string[] {
  const cosmetics: string[] = [];
  if (tier >= 3) cosmetics.push('Bronze Frame');
  if (tier >= 6) cosmetics.push('Silver Effects');
  if (tier >= 10) cosmetics.push('Gold Animations');
  if (tier >= 15) cosmetics.push('Diamond Particles');
  if (tier >= 18) cosmetics.push('Celestial Aura');
  if (tier >= 20) cosmetics.push('Neural Crown');
  return cosmetics;
}

function generateRankAbilities(tier: number): string[] {
  const abilities: string[] = [];
  if (tier >= 4) abilities.push('+10% Coin Boost');
  if (tier >= 7) abilities.push('Streak Protection');
  if (tier >= 11) abilities.push('+25% XP Boost');
  if (tier >= 14) abilities.push('Perfect Round Bonus');
  if (tier >= 17) abilities.push('Time Slow Ability');
  if (tier >= 20) abilities.push('Neural Enhancement');
  return abilities;
}

export function calculateCurrencyRewards(scoreBreakdown: ScoreBreakdown, gameResult: GameResult) {
  const rewards = {
    gameCoins: scoreBreakdown.totalCoinsAwarded,
    starTokens: 0,
    diamondShards: 0,
    experiencePoints: 0,
    skillPoints: 0,
    trophyCoins: 0,
    dailyTokens: 0
  };
  
  // Star tokens for high scores
  if (scoreBreakdown.finalScore >= COIN_FORMULAS.STAR_TOKEN_THRESHOLD) {
    rewards.starTokens = Math.floor(scoreBreakdown.finalScore / COIN_FORMULAS.STAR_TOKEN_THRESHOLD);
  }
  
  // Diamond shards for exceptional scores
  if (scoreBreakdown.finalScore >= COIN_FORMULAS.DIAMOND_SHARD_THRESHOLD) {
    rewards.diamondShards = Math.floor(scoreBreakdown.finalScore / COIN_FORMULAS.DIAMOND_SHARD_THRESHOLD);
  }
  
  // Experience points
  rewards.experiencePoints = COIN_FORMULAS.XP_PER_GAME + 
    Math.floor(scoreBreakdown.finalScore * COIN_FORMULAS.XP_SCORE_MULTIPLIER);
  
  // Skill points for mastery
  if (gameResult.perfectRounds > 0) {
    rewards.skillPoints = gameResult.perfectRounds * 2;
  }
  
  // Trophy coins for new records
  if (gameResult.isNewRecord) {
    rewards.trophyCoins = 25;
  }
  
  return rewards;
}

// Comprehensive achievement system
export const WORLD_CLASS_ACHIEVEMENTS: Achievement[] = [
  // Gameplay Achievements
  {
    id: 'first-game',
    name: 'Welcome to Brain Flip',
    description: 'Complete your first game',
    icon: '🎮',
    tier: 'Bronze',
    category: 'gameplay',
    requirement: { type: 'games', target: 1 },
    reward: { gameCoins: 50, starTokens: 1, diamondShards: 0, experiencePoints: 25, trophyCoins: 5 },
    isUnlocked: false
  },
  {
    id: 'century-club',
    name: 'Century Club',
    description: 'Play 100 games',
    icon: '💯',
    tier: 'Silver',
    category: 'gameplay',
    requirement: { type: 'games', target: 100 },
    reward: { gameCoins: 500, starTokens: 10, diamondShards: 1, experiencePoints: 200, trophyCoins: 25 },
    isUnlocked: false
  },
  
  // Score Achievements
  {
    id: 'high-scorer',
    name: 'High Scorer',
    description: 'Score 1000 points in a single game',
    icon: '🎯',
    tier: 'Bronze',
    category: 'gameplay',
    requirement: { type: 'score', target: 1000 },
    reward: { gameCoins: 100, starTokens: 2, diamondShards: 0, experiencePoints: 50, trophyCoins: 10 },
    isUnlocked: false
  },
  {
    id: 'score-master',
    name: 'Score Master',
    description: 'Score 5000 points in a single game',
    icon: '🏆',
    tier: 'Gold',
    category: 'gameplay',
    requirement: { type: 'score', target: 5000 },
    reward: { gameCoins: 750, starTokens: 15, diamondShards: 3, experiencePoints: 300, trophyCoins: 50 },
    isUnlocked: false
  },
  
  // Streak Achievements
  {
    id: 'streak-starter',
    name: 'Streak Starter',
    description: 'Get a streak of 10',
    icon: '🔥',
    tier: 'Bronze',
    category: 'streak',
    requirement: { type: 'streak', target: 10 },
    reward: { gameCoins: 75, starTokens: 1, diamondShards: 0, experiencePoints: 40, trophyCoins: 8 },
    isUnlocked: false
  },
  {
    id: 'unstoppable',
    name: 'Unstoppable',
    description: 'Get a streak of 50',
    icon: '⚡',
    tier: 'Diamond',
    category: 'streak',
    requirement: { type: 'streak', target: 50 },
    reward: { gameCoins: 1000, starTokens: 25, diamondShards: 5, experiencePoints: 500, trophyCoins: 100 },
    isUnlocked: false
  },
  
  // Speed Achievements
  {
    id: 'quick-draw',
    name: 'Quick Draw',
    description: 'React in under 200ms',
    icon: '💨',
    tier: 'Silver',
    category: 'speed',
    requirement: { type: 'speed', target: 200 },
    reward: { gameCoins: 200, starTokens: 3, diamondShards: 1, experiencePoints: 75, trophyCoins: 15 },
    isUnlocked: false
  },
  {
    id: 'lightning-reflexes',
    name: 'Lightning Reflexes',
    description: 'React in under 100ms',
    icon: '⚡',
    tier: 'Legendary',
    category: 'speed',
    requirement: { type: 'speed', target: 100 },
    reward: { gameCoins: 2000, starTokens: 50, diamondShards: 10, experiencePoints: 1000, trophyCoins: 200, title: 'Lightning Master' },
    isUnlocked: false
  },
  
  // Perfect Round Achievements
  {
    id: 'perfectionist',
    name: 'Perfectionist',
    description: 'Complete 10 perfect rounds',
    icon: '✨',
    tier: 'Gold',
    category: 'progression',
    requirement: { type: 'perfect', target: 10 },
    reward: { gameCoins: 500, starTokens: 12, diamondShards: 2, experiencePoints: 250, trophyCoins: 35 },
    isUnlocked: false
  },
  
  // Special Achievements
  {
    id: 'neural-emperor',
    name: 'Neural Emperor',
    description: 'Reach the highest rank',
    icon: '👑',
    tier: 'Legendary',
    category: 'special',
    requirement: { type: 'score', target: 100000 }, // Represents XP requirement
    reward: { gameCoins: 10000, starTokens: 100, diamondShards: 25, experiencePoints: 5000, trophyCoins: 500, title: 'Neural Emperor', cosmetic: 'Imperial Crown' },
    isUnlocked: false
  }
];

export function checkAchievements(
  gameResult: GameResult, 
  totalGames: number, 
  totalPerfectRounds: number, 
  bestStreak: number,
  unlockedAchievements: string[]
): Achievement[] {
  const newlyUnlocked: Achievement[] = [];
  
  for (const achievement of WORLD_CLASS_ACHIEVEMENTS) {
    if (unlockedAchievements.includes(achievement.id)) continue;

    
    switch (achievement.requirement.type) {
      case 'games':
        isUnlocked = totalGames >= achievement.requirement.target;
        break;
      case 'score':
        isUnlocked = gameResult.score >= achievement.requirement.target;
        break;
      case 'streak':
        isUnlocked = gameResult.streak >= achievement.requirement.target || bestStreak >= achievement.requirement.target;
        break;
      case 'speed':
        isUnlocked = gameResult.averageReactionTime <= achievement.requirement.target;
        break;
      case 'perfect':
        isUnlocked = totalPerfectRounds >= achievement.requirement.target;
        break;
    }
    
    if (isUnlocked) {
      const updatedAchievement = {
        ...achievement,
        isUnlocked: true,
        unlockedAt: new Date().toISOString()
      };
      newlyUnlocked.push(unlockedAchievement);
    }
  }
  
  return newlyUnlocked;
}
