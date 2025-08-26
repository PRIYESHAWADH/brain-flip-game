/**
 * Ultimate Brain Flip Experience - AI Personalization Service
 * Orchestrates AI-powered personalization across the platform
 */

import { CognitivePatternRecognition } from '../models/CognitivePatternRecognition';
import { 
  CognitiveProfile, 
  DifficultyAdjustment
} from '@/types/cognitive';
import { InstructionResponse, GameSession, Instruction } from '@/types/game';
import { indexedDBPersistence } from '@/store/persistence/indexedDBPersistence';

// Service configuration
interface AIPersonalizationConfig {
  modelUpdateFrequency: number; // milliseconds
  minDataPointsForPersonalization: number;
  confidenceThreshold: number;
  adaptationRate: number; // how quickly to adapt to changes
  enableRealTimePersonalization: boolean;
  enablePredictivePersonalization: boolean;
}

// Personalization context
interface PersonalizationContext {
  userId: string;
  currentSession: CognitiveTrainingSession;
  historicalSessions: GameSession[];
  cognitiveProfile: CognitiveProfile;
  recentPerformance: InstructionResponse[];
  environmentalFactors: EnvironmentalFactors;
  userPreferences: UserPreferences;
}

// Environmental factors that affect personalization
interface EnvironmentalFactors {
  timeOfDay: string;
  dayOfWeek: string;
  sessionNumber: number; // session number today
  timeSinceLastSession: number; // minutes
  deviceType: string;
  networkQuality: string;
  ambientNoise?: number;
  batteryLevel?: number;
  screenBrightness?: number;
}

// User preferences for personalization
interface UserPreferences {
  preferredDifficulty: number;
  preferredSessionDuration: number;
  preferredGameModes: string[];
  preferredInstructionTypes: string[];
  feedbackStyle: 'minimal' | 'moderate' | 'detailed';
  motivationStyle: 'achievement' | 'progress' | 'social' | 'challenge';
  adaptationSpeed: 'slow' | 'medium' | 'fast';
  privacyLevel: 'basic' | 'standard' | 'enhanced';
  accessibilityNeeds: string[];
}
  lightingConditions?: string;
}

// User preferences for personalization
interface UserPreferences {
  preferredDifficulty: number;
  preferredSessionDuration: number;
  preferredGameModes: string[];
  feedbackStyle: 'minimal' | 'moderate' | 'detailed';
  motivationStyle: 'achievement' | 'progress' | 'social' | 'challenge';
  adaptationSpeed: 'slow' | 'medium' | 'fast';
}

// Personalization strategies
enum PersonalizationStrategy {
  DIFFICULTY_ADAPTATION = 'difficulty_adaptation',
  CONTENT_SELECTION = 'content_selection',
  TIMING_OPTIMIZATION = 'timing_optimization',
  MOTIVATIONAL_ENHANCEMENT = 'motivational_enhancement',
  FEEDBACK_PERSONALIZATION = 'feedback_personalization',
  FLOW_STATE_OPTIMIZATION = 'flow_state_optimization'
}

export class AIPersonalizationService {
  private cognitivePatternRecognition: CognitivePatternRecognition;
  private config: AIPersonalizationConfig;
  private userProfiles: Map<string, CognitiveProfile> = new Map();
  private personalizationCache: Map<string, PersonalizationData> = new Map();
  private isInitialized = false;

  constructor(config?: Partial<AIPersonalizationConfig>) {
    this.config = {
      modelUpdateFrequency: 300000, // 5 minutes
      minDataPointsForPersonalization: 10,
      confidenceThreshold: 0.7,
      adaptationRate: 0.1,
      enableRealTimePersonalization: true,
      enablePredictivePersonalization: true,
      ...config
    };

    this.cognitivePatternRecognition = new CognitivePatternRecognition();
  }

  /**
   * Initialize the AI personalization service
   */
  async initialize(): Promise<void> {
    try {
      console.log('Initializing AI Personalization Service...');
      
      // Initialize cognitive pattern recognition
      await this.cognitivePatternRecognition.initialize();
      
      // Load existing user profiles from storage
      await this.loadUserProfiles();
      
      // Start periodic model updates if enabled
      if (this.config.enableRealTimePersonalization) {
        this.startPeriodicUpdates();
      }

      this.isInitialized = true;
      console.log('AI Personalization Service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize AI Personalization Service:', error);
      throw error;
    }
  }

  /**
   * Generate personalized recommendations for a user
   */
  async generatePersonalizedRecommendations(
    userId: string,
    context: PersonalizationContext
  ): Promise<PersonalizationData> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Check cache first
      const cached = this.personalizationCache.get(userId);
      if (cached && this.isCacheValid(cached)) {
        return cached;
      }

      // Analyze cognitive patterns
      const patternResults = await this.cognitivePatternRecognition.analyzePatterns(
        userId,
        context.recentPerformance,
        context.historicalSessions
      );

      // Generate personalization strategies
      const personalizationData: PersonalizationData = {
        difficultyAdjustments: await this.generateDifficultyAdjustments(context, patternResults),
        contentRecommendations: await this.generateContentRecommendations(context, patternResults),
        timingOptimizations: await this.generateTimingOptimizations(context, patternResults),
        motivationalTriggers: await this.generateMotivationalTriggers(context, patternResults),
        personalizedFeedback: await this.generatePersonalizedFeedback(context, patternResults),
        modelVersion: '1.0.0',
        lastUpdate: Date.now()
      };

      // Cache the results
      this.personalizationCache.set(userId, personalizationData);

      // Save to persistent storage
      await this.savePersonalizationData(userId, personalizationData);

      return personalizationData;
    } catch (error) {
      console.error('Error generating personalized recommendations:', error);
      return this.getDefaultPersonalization();
    }
  }

  /**
   * Update cognitive profile based on new session data
   */
  async updateCognitiveProfile(
    userId: string,
    session: CognitiveTrainingSession
  ): Promise<CognitiveProfile> {
    try {
      // Get existing profile or create new one
      let profile = this.userProfiles.get(userId);
      if (!profile) {
        profile = await this.createInitialCognitiveProfile(userId);
      }

      // Analyze new session data
      const patternResults = await this.cognitivePatternRecognition.analyzePatterns(
        userId,
        session.performanceByType ? Object.values(session.performanceByType).map(p => ({
          userId,
          reactionTime: p.averageReactionTime,
          isCorrect: p.accuracyRate > 0.5,
          instructionType: p.instructionType,
          timestamp: session.endTime
        } as InstructionResponse)) : [],
        [session as any] // Convert to GameSession format
      );

      // Update profile with new insights
      const updatedProfile = await this.cognitivePatternRecognition.createCognitiveProfile(
        userId,
        patternResults,
        [session as any]
      );

      // Merge with existing profile using weighted average
      const mergedProfile = this.mergeCognitiveProfiles(profile, updatedProfile);

      // Update cache and storage
      this.userProfiles.set(userId, mergedProfile);
      await this.saveCognitiveProfile(userId, mergedProfile);

      return mergedProfile;
    } catch (error) {
      console.error('Error updating cognitive profile:', error);
      throw error;
    }
  }

  /**
   * Generate real-time personalization adjustments during gameplay
   */
  async generateRealTimeAdjustments(
    userId: string,
    currentPerformance: InstructionResponse[],
    currentDifficulty: number
  ): Promise<{
    difficultyAdjustment: number;
    contentSuggestions: string[];
    motivationalMessage?: string;
    breakRecommendation?: boolean;
  }> {
    if (!this.config.enableRealTimePersonalization) {
      return {
        difficultyAdjustment: 0,
        contentSuggestions: []
      };
    }

    try {
      const profile = this.userProfiles.get(userId);
      if (!profile || currentPerformance.length < 5) {
        return {
          difficultyAdjustment: 0,
          contentSuggestions: []
        };
      }

      // Analyze recent performance
      const recentAccuracy = this.calculateRecentAccuracy(currentPerformance, 5);
      const recentReactionTime = this.calculateAverageReactionTime(currentPerformance, 5);
      const performanceTrend = this.calculatePerformanceTrend(currentPerformance, 10);

      // Calculate cognitive load
      const cognitiveLoad = this.estimateCognitiveLoad(currentPerformance, profile);

      // Generate adjustments
      let difficultyAdjustment = 0;
      const contentSuggestions: string[] = [];
      let motivationalMessage: string | undefined;
      let breakRecommendation = false;

      // Difficulty adjustment logic
      if (recentAccuracy > 0.9 && cognitiveLoad < 0.6) {
        difficultyAdjustment = 0.1; // Increase difficulty
        motivationalMessage = "Excellent performance! Let's increase the challenge.";
      } else if (recentAccuracy < 0.6 || cognitiveLoad > 0.8) {
        difficultyAdjustment = -0.1; // Decrease difficulty
        motivationalMessage = "Let's adjust the difficulty to help you find your flow.";
      }

      // Break recommendation
      if (cognitiveLoad > 0.85 || performanceTrend < -0.2) {
        breakRecommendation = true;
        motivationalMessage = "Consider taking a short break to recharge your focus.";
      }

      // Content suggestions based on weaknesses
      if (profile.weaknessAreas.length > 0) {
        const targetWeakness = profile.weaknessAreas[0];
        contentSuggestions.push(`Focus on ${targetWeakness} exercises`);
      }

      return {
        difficultyAdjustment,
        contentSuggestions,
        motivationalMessage,
        breakRecommendation
      };
    } catch (error) {
      console.error('Error generating real-time adjustments:', error);
      return {
        difficultyAdjustment: 0,
        contentSuggestions: []
      };
    }
  }

  /**
   * Predict optimal next instruction based on user profile and current state
   */
  async predictOptimalInstruction(
    userId: string,
    currentContext: {
      recentPerformance: InstructionResponse[];
      currentDifficulty: number;
      sessionProgress: number; // 0-1
      timeInSession: number; // minutes
    }
  ): Promise<{
    recommendedType: string;
    recommendedDifficulty: number;
    expectedPerformance: number;
    confidence: number;
  }> {
    if (!this.config.enablePredictivePersonalization) {
      return {
        recommendedType: 'direction',
        recommendedDifficulty: currentContext.currentDifficulty,
        expectedPerformance: 0.7,
        confidence: 0.5
      };
    }

    try {
      const profile = this.userProfiles.get(userId);
      if (!profile) {
        return {
          recommendedType: 'direction',
          recommendedDifficulty: currentContext.currentDifficulty,
          expectedPerformance: 0.7,
          confidence: 0.3
        };
      }

      // Analyze current state
      const cognitiveLoad = this.estimateCognitiveLoad(currentContext.recentPerformance, profile);
      const fatigueLevel = this.estimateFatigueLevel(currentContext.timeInSession, currentContext.sessionProgress);
      
      // Determine optimal instruction type based on strengths/weaknesses
      let recommendedType = 'direction'; // default
      if (profile.cognitiveStrengths.includes('visual_processing' as any)) {
        recommendedType = Math.random() > 0.5 ? 'color' : 'combo';
      } else if (profile.cognitiveStrengths.includes('processing_speed' as any)) {
        recommendedType = 'direction';
      }

      // Adjust difficulty based on current state
      let recommendedDifficulty = currentContext.currentDifficulty;
      if (cognitiveLoad < 0.5 && fatigueLevel < 0.3) {
        recommendedDifficulty = Math.min(1.0, currentContext.currentDifficulty + 0.1);
      } else if (cognitiveLoad > 0.8 || fatigueLevel > 0.7) {
        recommendedDifficulty = Math.max(0.1, currentContext.currentDifficulty - 0.1);
      }

      // Predict expected performance
      const expectedPerformance = this.predictPerformance(
        profile,
        recommendedType,
        recommendedDifficulty,
        cognitiveLoad,
        fatigueLevel
      );

      return {
        recommendedType,
        recommendedDifficulty,
        expectedPerformance,
        confidence: 0.8
      };
    } catch (error) {
      console.error('Error predicting optimal instruction:', error);
      return {
        recommendedType: 'direction',
        recommendedDifficulty: currentContext.currentDifficulty,
        expectedPerformance: 0.7,
        confidence: 0.3
      };
    }
  }

  /**
   * Generate difficulty adjustments
   */
  private async generateDifficultyAdjustments(
    context: PersonalizationContext,
    patternResults: any[]
  ): Promise<DifficultyAdjustment[]> {
    const adjustments: DifficultyAdjustment[] = [];

    // Analyze performance patterns to suggest difficulty changes
    const recentAccuracy = this.calculateRecentAccuracy(context.recentPerformance, 10);
    const cognitiveLoad = this.estimateCognitiveLoad(context.recentPerformance, context.cognitiveProfile);

    if (recentAccuracy > 0.85 && cognitiveLoad < 0.6) {
      adjustments.push({
        currentDifficulty: context.currentSession.difficultyLevel,
        recommendedDifficulty: Math.min(1.0, context.currentSession.difficultyLevel + 0.1),
        adjustmentReason: 'High accuracy with low cognitive load indicates readiness for increased challenge',
        confidence: 0.8,
        expectedOutcome: 'Improved engagement and skill development',
        timestamp: Date.now()
      });
    } else if (recentAccuracy < 0.6 || cognitiveLoad > 0.8) {
      adjustments.push({
        currentDifficulty: context.currentSession.difficultyLevel,
        recommendedDifficulty: Math.max(0.1, context.currentSession.difficultyLevel - 0.1),
        adjustmentReason: 'Low accuracy or high cognitive load suggests need for easier challenges',
        confidence: 0.9,
        expectedOutcome: 'Reduced frustration and improved learning',
        timestamp: Date.now()
      });
    }

    return adjustments;
  }

  /**
   * Generate content recommendations
   */
  private async generateContentRecommendations(
    context: PersonalizationContext,
    patternResults: any[]
  ): Promise<ContentRecommendation[]> {
    const recommendations: ContentRecommendation[] = [];

    // Recommend content based on cognitive profile
    if (context.cognitiveProfile.weaknessAreas.length > 0) {
      const primaryWeakness = context.cognitiveProfile.weaknessAreas[0];
      recommendations.push({
        contentType: `${primaryWeakness}_training`,
        priority: 1,
        reason: `Target identified weakness in ${primaryWeakness}`,
        expectedEngagement: 0.8,
        personalizedParameters: {
          focusArea: primaryWeakness,
          adaptiveDifficulty: true
        },
        timestamp: Date.now()
      });
    }

    // Recommend based on learning style
    if (context.cognitiveProfile.learningStyle === 'visual') {
      recommendations.push({
        contentType: 'visual_emphasis_mode',
        priority: 2,
        reason: 'Visual learning style preference detected',
        expectedEngagement: 0.9,
        personalizedParameters: {
          enhancedVisuals: true,
          colorCoding: true
        },
        timestamp: Date.now()
      });
    }

    return recommendations;
  }

  /**
   * Generate timing optimizations
   */
  private async generateTimingOptimizations(
    context: PersonalizationContext,
    patternResults: any[]
  ): Promise<TimingOptimization[]> {
    const optimizations: TimingOptimization[] = [];

    // Optimize instruction timing based on reaction time patterns
    const avgReactionTime = this.calculateAverageReactionTime(context.recentPerformance, 20);
    const optimalTiming = avgReactionTime * 1.5; // 50% buffer

    if (Math.abs(context.currentSession.duration - optimalTiming) > 500) {
      optimizations.push({
        currentTiming: context.currentSession.duration,
        recommendedTiming: optimalTiming,
        timingType: 'instruction_duration',
        reason: 'Optimize based on personal reaction time patterns',
        expectedImprovement: 0.15,
        timestamp: Date.now()
      });
    }

    return optimizations;
  }

  /**
   * Generate motivational triggers
   */
  private async generateMotivationalTriggers(
    context: PersonalizationContext,
    patternResults: any[]
  ): Promise<MotivationalTrigger[]> {
    const triggers: MotivationalTrigger[] = [];

    // Achievement-based motivation
    if (context.userPreferences.motivationStyle === 'achievement') {
      triggers.push({
        triggerType: 'achievement',
        condition: 'streak >= 5',
        action: 'show_achievement_progress',
        effectiveness: 0.8,
        personalizedMessage: 'Amazing streak! You\'re on fire!',
        timestamp: Date.now()
      });
    }

    // Progress-based motivation
    if (context.userPreferences.motivationStyle === 'progress') {
      triggers.push({
        triggerType: 'progress',
        condition: 'session_progress >= 0.5',
        action: 'show_progress_celebration',
        effectiveness: 0.7,
        personalizedMessage: 'Halfway there! Your brain is getting stronger!',
        timestamp: Date.now()
      });
    }

    return triggers;
  }

  /**
   * Generate personalized feedback
   */
  private async generatePersonalizedFeedback(
    context: PersonalizationContext,
    patternResults: any[]
  ): Promise<PersonalizedFeedback[]> {
    const feedback: PersonalizedFeedback[] = [];

    // Performance feedback
    const recentAccuracy = this.calculateRecentAccuracy(context.recentPerformance, 5);
    
    if (recentAccuracy > 0.8) {
      feedback.push({
        feedbackType: 'performance',
        message: 'Excellent accuracy! Your focus is really paying off.',
        tone: 'celebratory',
        timing: 'end_of_round',
        personalizationFactors: ['high_accuracy', 'positive_reinforcement'],
        timestamp: Date.now()
      });
    } else if (recentAccuracy < 0.6) {
      feedback.push({
        feedbackType: 'encouragement',
        message: 'Take your time and trust your instincts. You\'ve got this!',
        tone: 'supportive',
        timing: 'immediate',
        personalizationFactors: ['low_accuracy', 'encouragement_needed'],
        timestamp: Date.now()
      });
    }

    return feedback;
  }

  // Helper methods
  private calculateRecentAccuracy(responses: InstructionResponse[], count: number): number {
    if (responses.length === 0) return 0;
    
    const recent = responses.slice(-count);
    const correct = recent.filter(r => r.isCorrect).length;
    return correct / recent.length;
  }

  private calculateAverageReactionTime(responses: InstructionResponse[], count: number): number {
    if (responses.length === 0) return 1000;
    
    const recent = responses.slice(-count);
    const total = recent.reduce((sum, r) => sum + r.reactionTime, 0);
    return total / recent.length;
  }

  private calculatePerformanceTrend(responses: InstructionResponse[], count: number): number {
    if (responses.length < count) return 0;
    
    const recent = responses.slice(-count);
    const firstHalf = recent.slice(0, Math.floor(count / 2));
    const secondHalf = recent.slice(Math.floor(count / 2));
    
    const firstAccuracy = firstHalf.filter(r => r.isCorrect).length / firstHalf.length;
    const secondAccuracy = secondHalf.filter(r => r.isCorrect).length / secondHalf.length;
    
    return secondAccuracy - firstAccuracy;
  }

  private estimateCognitiveLoad(responses: InstructionResponse[], profile: CognitiveProfile): number {
    if (responses.length === 0) return 0.5;
    
    const recentResponses = responses.slice(-10);
    const avgReactionTime = this.calculateAverageReactionTime(recentResponses, 10);
    const accuracy = this.calculateRecentAccuracy(recentResponses, 10);
    
    // Simple cognitive load estimation
    const reactionTimeLoad = Math.min(1, avgReactionTime / 2000); // Normalize to 2 seconds
    const accuracyLoad = 1 - accuracy;
    
    return (reactionTimeLoad + accuracyLoad) / 2;
  }

  private estimateFatigueLevel(timeInSession: number, sessionProgress: number): number {
    // Simple fatigue model based on time and progress
    const timeFatigue = Math.min(1, timeInSession / 60); // Normalize to 60 minutes
    const progressFatigue = sessionProgress * 0.3; // Progress contributes less to fatigue
    
    return Math.min(1, timeFatigue + progressFatigue);
  }

  private predictPerformance(
    profile: CognitiveProfile,
    instructionType: string,
    difficulty: number,
    cognitiveLoad: number,
    fatigueLevel: number
  ): number {
    // Simple performance prediction model
    let basePerformance = 0.7;
    
    // Adjust based on cognitive load and fatigue
    basePerformance -= cognitiveLoad * 0.3;
    basePerformance -= fatigueLevel * 0.2;
    
    // Adjust based on difficulty
    basePerformance -= (difficulty - 0.5) * 0.2;
    
    return Math.max(0.1, Math.min(1.0, basePerformance));
  }

  private async createInitialCognitiveProfile(userId: string): Promise<CognitiveProfile> {
    return {
      playerId: userId,
      cognitiveStrengths: [],
      weaknessAreas: [],
      learningStyle: 'mixed',
      optimalDifficultyCurve: [],
      flowStateIndicators: {
        averageFlowDuration: 0,
        flowTriggers: [],
        optimalChallengeLevel: 0.7,
        attentionSpan: 0
      },
      personalityTraits: {
        riskTolerance: 0.5,
        persistenceLevel: 0.5,
        competitiveness: 0.5,
        socialEngagement: 0.5
      }
    };
  }

  private mergeCognitiveProfiles(existing: CognitiveProfile, updated: CognitiveProfile): CognitiveProfile {
    // Simple merge strategy - in practice, this would be more sophisticated
    return {
      ...existing,
      ...updated,
      lastAnalysisTimestamp: Date.now()
    };
  }

  private isCacheValid(data: PersonalizationData): boolean {
    const cacheAge = Date.now() - data.lastUpdate;
    return cacheAge < this.config.modelUpdateFrequency;
  }

  private getDefaultPersonalization(): PersonalizationData {
    return {
      difficultyAdjustments: [],
      contentRecommendations: [],
      timingOptimizations: [],
      motivationalTriggers: [],
      personalizedFeedback: [],
      modelVersion: '1.0.0',
      lastUpdate: Date.now()
    };
  }

  private async loadUserProfiles(): Promise<void> {
    // Load profiles from persistent storage
    // Implementation would depend on storage backend
  }

  private async saveCognitiveProfile(userId: string, profile: CognitiveProfile): Promise<void> {
    await indexedDBPersistence.saveAIPersonalization(
      userId,
      profile,
      this.personalizationCache.get(userId) || this.getDefaultPersonalization()
    );
  }

  private async savePersonalizationData(userId: string, data: PersonalizationData): Promise<void> {
    const profile = this.userProfiles.get(userId);
    if (profile) {
      await indexedDBPersistence.saveAIPersonalization(userId, profile, data);
    }
  }

  private startPeriodicUpdates(): void {
    setInterval(() => {
      this.updateModelsIfNeeded();
    }, this.config.modelUpdateFrequency);
  }

  private async updateModelsIfNeeded(): Promise<void> {
    // Check if models need updating and update if necessary
    // This would involve retraining or fine-tuning models
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    this.cognitivePatternRecognition.dispose();
    this.userProfiles.clear();
    this.personalizationCache.clear();
  }
}

export default AIPersonalizationService;