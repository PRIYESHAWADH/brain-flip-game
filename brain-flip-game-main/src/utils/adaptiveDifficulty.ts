export interface PerformanceMetrics {
  reactionTimes: number[];
  accuracy: number;
  streak: number;
  comboStreak: number;
  mistakes: number;
  flowStateIndicators: {
    consistentTiming: boolean;
    lowStress: boolean;
    highEngagement: boolean;
  };
}

export interface FlowStateAnalysis {
  state: 'boredom' | 'anxiety' | 'flow' | 'apathy';
  confidence: number;
  adjustments: {
    timeMultiplier: number;
    complexityBoost: number;
    practiceMode: boolean;
  };
  recommendations: string[];
}

export interface DailyChallenge {
  id: string;
  name: string;
  description: string;
  targetLevel: number;
  targetScore: number;
  timeLimit: number;
  specialRules: string[];
  rewards: {
    points: number;
    starCoins: number;
  };
}

class AdaptiveDifficultySystem {
  analyzeFlowState(metrics: PerformanceMetrics): FlowStateAnalysis {
    const avgReactionTime = metrics.reactionTimes.length > 0 
      ? metrics.reactionTimes.reduce((a, b) => a + b, 0) / metrics.reactionTimes.length 
      : 1000;
    
    const skill = this.calculateSkillLevel(metrics);
    const challenge = this.calculateChallengeLevel(metrics);
    
    let state: FlowStateAnalysis['state'] = 'flow';
    let timeMultiplier = 1.0;
    let complexityBoost = 0;
    let practiceMode = false;
    const recommendations: string[] = [];
    
    // Flow state analysis based on skill vs challenge
    if (skill > challenge + 0.3) {
      state = 'boredom';
      timeMultiplier = 0.85; // Faster pace
      complexityBoost = 1; // More complex instructions
      recommendations.push('Increasing difficulty to maintain engagement');
    } else if (challenge > skill + 0.3) {
      state = 'anxiety';
      timeMultiplier = 1.2; // Slower pace
      complexityBoost = -1; // Simpler instructions
      practiceMode = metrics.mistakes > 2;
      recommendations.push('Reducing difficulty to prevent frustration');
    } else if (metrics.flowStateIndicators.consistentTiming && 
               metrics.flowStateIndicators.lowStress && 
               metrics.flowStateIndicators.highEngagement) {
      state = 'flow';
      recommendations.push('Perfect flow state achieved!');
    } else {
      state = 'apathy';
      timeMultiplier = 1.1;
      recommendations.push('Adjusting to re-engage player');
    }
    
    return {
      state,
      confidence: this.calculateConfidence(metrics),
      adjustments: {
        timeMultiplier,
        complexityBoost,
        practiceMode
      },
      recommendations
    };
  }
  
  private calculateSkillLevel(metrics: PerformanceMetrics): number {
    const reactionScore = metrics.reactionTimes.length > 0 
      ? Math.max(0, 1 - (metrics.reactionTimes.reduce((a, b) => a + b, 0) / metrics.reactionTimes.length) / 2000)
      : 0.5;
    
    const accuracyScore = metrics.accuracy;
    const streakScore = Math.min(1, metrics.streak / 10);
    
    return (reactionScore * 0.4 + accuracyScore * 0.4 + streakScore * 0.2);
  }
  
  private calculateChallengeLevel(metrics: PerformanceMetrics): number {
    // Challenge increases with mistakes and decreases with consistent performance
    const mistakesPenalty = Math.min(1, metrics.mistakes / 5);
    const consistencyBonus = metrics.flowStateIndicators.consistentTiming ? 0.2 : 0;
    
    return Math.max(0, Math.min(1, 0.5 + mistakesPenalty - consistencyBonus));
  }
  
  private calculateConfidence(metrics: PerformanceMetrics): number {
    // Confidence based on data quality
    const dataPoints = metrics.reactionTimes.length;
    const minDataPoints = 5;
    
    return Math.min(1, dataPoints / minDataPoints);
  }
  
  generateDailyChallenge(currentLevel: number, recentMetrics: PerformanceMetrics[]): DailyChallenge {
    const avgSkill = recentMetrics.length > 0 
      ? recentMetrics.reduce((sum, m) => sum + this.calculateSkillLevel(m), 0) / recentMetrics.length
      : 0.5;
    
    const targetLevel = Math.max(1, Math.round(currentLevel + (avgSkill - 0.5) * 5));
    const targetScore = Math.round(1000 * Math.pow(1.5, targetLevel - 1));
    
    const challenges = [
      {
        name: 'Speed Demon',
        description: 'Complete 10 rounds with average reaction time under 500ms',
        specialRules: ['fast-reactions-only'],
        pointsMultiplier: 1.5
      },
      {
        name: 'Perfect Streak',
        description: 'Achieve a streak of 15 without mistakes',
        specialRules: ['no-mistakes'],
        pointsMultiplier: 2.0
      },
      {
        name: 'Color Master',
        description: 'Complete 20 color instructions perfectly',
        specialRules: ['color-only'],
        pointsMultiplier: 1.3
      },
      {
        name: 'Combo King',
        description: 'Master 15 combo instructions in a row',
        specialRules: ['combo-only'],
        pointsMultiplier: 1.8
      }
    ];
    
    const selectedChallenge = challenges[Math.floor(Math.random() * challenges.length)];
    
    return {
      id: `daily-${Date.now()}`,
      name: selectedChallenge.name,
      description: selectedChallenge.description,
      targetLevel,
      targetScore,
      timeLimit: 300000, // 5 minutes
      specialRules: selectedChallenge.specialRules,
      rewards: {
        points: Math.round(targetScore * 0.1),
        starCoins: Math.max(1, Math.floor(targetLevel / 5))
      }
    };
  }
}

export const adaptiveDifficulty = new AdaptiveDifficultySystem();