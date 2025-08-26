/**
 * Ultimate Brain Flip Experience - Cognitive Pattern Recognition
 * TensorFlow.js models for real-time behavior analysis and cognitive profiling
 */

import * as tf from '@tensorflow/tfjs';
import { CognitiveProfile, CognitiveAbility, LearningStyle, PersonalityProfile } from '@/types/cognitive';
import { InstructionResponse, GameSession } from '@/types/game';

// Model configurations
interface ModelConfig {
  inputShape: number[];
  hiddenLayers: number[];
  outputShape: number;
  learningRate: number;
  batchSize: number;
  epochs: number;
}

// Feature extraction configuration
interface FeatureConfig {
  reactionTimeWindow: number;
  accuracyWindow: number;
  streakWindow: number;
  temporalFeatures: boolean;
  cognitiveLoadFeatures: boolean;
  errorPatternFeatures: boolean;
}

// Cognitive pattern types
enum CognitivePatternType {
  REACTION_TIME_PATTERN = 'reaction_time_pattern',
  ACCURACY_PATTERN = 'accuracy_pattern',
  LEARNING_CURVE = 'learning_curve',
  FATIGUE_PATTERN = 'fatigue_pattern',
  ATTENTION_PATTERN = 'attention_pattern',
  COGNITIVE_LOAD_PATTERN = 'cognitive_load_pattern',
  ERROR_PATTERN = 'error_pattern',
  FLOW_STATE_PATTERN = 'flow_state_pattern'
}

// Pattern recognition results
interface PatternRecognitionResult {
  patternType: CognitivePatternType;
  confidence: number;
  features: number[];
  interpretation: string;
  recommendations: string[];
  timestamp: number;
}

// Cognitive clustering result
interface CognitiveCluster {
  clusterId: number;
  centroid: number[];
  members: string[]; // user IDs
  characteristics: {
    dominantCognitiveAbilities: CognitiveAbility[];
    averagePerformance: number;
    learningStyle: LearningStyle;
    difficultyPreference: number;
    sessionDurationPreference: number;
  };
  confidence: number;
}

export class CognitivePatternRecognition {
  private models: Map<CognitivePatternType, tf.LayersModel> = new Map();
  private featureExtractor: FeatureExtractor;
  private clusteringModel: KMeansClusterer;
  private anomalyDetector: AnomalyDetector;
  private isInitialized = false;

  // Model configurations for different pattern types
  private modelConfigs: Map<CognitivePatternType, ModelConfig> = new Map([
    [CognitivePatternType.REACTION_TIME_PATTERN, {
      inputShape: [20], // 20 recent reaction times
      hiddenLayers: [64, 32, 16],
      outputShape: 5, // 5 reaction time categories
      learningRate: 0.001,
      batchSize: 32,
      epochs: 100
    }],
    [CognitivePatternType.ACCURACY_PATTERN, {
      inputShape: [15], // accuracy features
      hiddenLayers: [32, 16, 8],
      outputShape: 4, // 4 accuracy patterns
      learningRate: 0.002,
      batchSize: 16,
      epochs: 80
    }],
    [CognitivePatternType.LEARNING_CURVE, {
      inputShape: [30], // learning progression features
      hiddenLayers: [128, 64, 32],
      outputShape: 6, // 6 learning curve types
      learningRate: 0.0005,
      batchSize: 64,
      epochs: 150
    }],
    [CognitivePatternType.COGNITIVE_LOAD_PATTERN, {
      inputShape: [25], // cognitive load indicators
      hiddenLayers: [48, 24, 12],
      outputShape: 3, // low, medium, high cognitive load
      learningRate: 0.001,
      batchSize: 24,
      epochs: 120
    }]
  ]);

  constructor() {
    this.featureExtractor = new FeatureExtractor({
      reactionTimeWindow: 20,
      accuracyWindow: 15,
      streakWindow: 10,
      temporalFeatures: true,
      cognitiveLoadFeatures: true,
      errorPatternFeatures: true
    });
    
    this.clusteringModel = new KMeansClusterer(8); // 8 cognitive clusters
    this.anomalyDetector = new AnomalyDetector();
  }

  /**
   * Initialize all models and load pre-trained weights
   */
  async initialize(): Promise<void> {
    try {
      console.log('Initializing Cognitive Pattern Recognition models...');
      
      // Initialize TensorFlow.js backend
      await tf.ready();
      console.log('TensorFlow.js backend:', tf.getBackend());

      // Create and load models for each pattern type
      for (const [patternType, config] of this.modelConfigs) {
        const model = await this.createModel(config);
        
        // Try to load pre-trained weights
        try {
          const modelUrl = `/models/cognitive-patterns/${patternType}/model.json`;
          const loadedModel = await tf.loadLayersModel(modelUrl);
          this.models.set(patternType, loadedModel);
          console.log(`Loaded pre-trained model for ${patternType}`);
        } catch (error) {
          // Use newly created model if pre-trained not available
          this.models.set(patternType, model);
          console.log(`Using new model for ${patternType} (pre-trained not found)`);
        }
      }

      // Initialize clustering model
      await this.clusteringModel.initialize();
      
      // Initialize anomaly detector
      await this.anomalyDetector.initialize();

      this.isInitialized = true;
      console.log('Cognitive Pattern Recognition initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Cognitive Pattern Recognition:', error);
      throw error;
    }
  }

  /**
   * Analyze cognitive patterns from instruction responses
   */
  async analyzePatterns(
    userId: string, 
    responses: InstructionResponse[], 
    sessionHistory: GameSession[]
  ): Promise<PatternRecognitionResult[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const results: PatternRecognitionResult[] = [];

    try {
      // Extract features for different pattern types
      const reactionTimeFeatures = this.featureExtractor.extractReactionTimeFeatures(responses);
      const accuracyFeatures = this.featureExtractor.extractAccuracyFeatures(responses);
      const learningFeatures = this.featureExtractor.extractLearningFeatures(responses, sessionHistory);
      const cognitiveLoadFeatures = this.featureExtractor.extractCognitiveLoadFeatures(responses);

      // Analyze reaction time patterns
      if (reactionTimeFeatures.length > 0) {
        const reactionTimeResult = await this.analyzeReactionTimePattern(reactionTimeFeatures);
        results.push(reactionTimeResult);
      }

      // Analyze accuracy patterns
      if (accuracyFeatures.length > 0) {
        const accuracyResult = await this.analyzeAccuracyPattern(accuracyFeatures);
        results.push(accuracyResult);
      }

      // Analyze learning curve
      if (learningFeatures.length > 0) {
        const learningResult = await this.analyzeLearningCurve(learningFeatures);
        results.push(learningResult);
      }

      // Analyze cognitive load patterns
      if (cognitiveLoadFeatures.length > 0) {
        const cognitiveLoadResult = await this.analyzeCognitiveLoadPattern(cognitiveLoadFeatures);
        results.push(cognitiveLoadResult);
      }

      // Detect anomalies
      const anomalies = await this.detectAnomalies(userId, responses);
      results.push(...anomalies);

      return results;
    } catch (error) {
      console.error('Error analyzing cognitive patterns:', error);
      return [];
    }
  }

  /**
   * Create cognitive profile from pattern analysis
   */
  async createCognitiveProfile(
    userId: string,
    patternResults: PatternRecognitionResult[],
    historicalData: GameSession[]
  ): Promise<CognitiveProfile> {
    const profile: CognitiveProfile = {
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

    // Analyze cognitive strengths and weaknesses
    const strengthsWeaknesses = this.analyzeCognitiveAbilities(patternResults, historicalData);
    profile.cognitiveStrengths = strengthsWeaknesses.strengths;
    profile.weaknessAreas = strengthsWeaknesses.weaknesses;

    // Determine learning style
    profile.learningStyle = this.determineLearningStyle(patternResults);

    // Calculate optimal difficulty curve
    profile.optimalDifficultyCurve = this.calculateOptimalDifficultyCurve(historicalData);

    // Analyze flow state indicators
    profile.flowStateIndicators = this.analyzeFlowStateIndicators(patternResults, historicalData);

    // Determine personality traits
    profile.personalityTraits = this.analyzePersonalityTraits(historicalData, patternResults);

    return profile;
  }

  /**
   * Perform cognitive clustering to group similar users
   */
  async performCognitiveClustering(
    userProfiles: Map<string, CognitiveProfile>
  ): Promise<CognitiveCluster[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // Extract features from cognitive profiles
    const features: number[][] = [];
    const userIds: string[] = [];

    for (const [userId, profile] of userProfiles) {
      const profileFeatures = this.extractProfileFeatures(profile);
      features.push(profileFeatures);
      userIds.push(userId);
    }

    // Perform clustering
    const clusters = await this.clusteringModel.cluster(features);

    // Create cognitive cluster objects
    const cognitiveCluster: CognitiveCluster[] = [];
    
    for (let i = 0; i < clusters.length; i++) {
      const cluster = clusters[i];
      const clusterMembers = cluster.memberIndices.map(idx => userIds[idx]);
      const memberProfiles = clusterMembers.map(id => userProfiles.get(id)!);

      cognitiveCluster.push({
        clusterId: i,
        centroid: cluster.centroid,
        members: clusterMembers,
        characteristics: this.analyzeClusterCharacteristics(memberProfiles),
        confidence: cluster.confidence
      });
    }

    return cognitiveCluster;
  }

  /**
   * Detect unusual performance patterns (anomalies)
   */
  private async detectAnomalies(
    userId: string, 
    responses: InstructionResponse[]
  ): Promise<PatternRecognitionResult[]> {
    const anomalies: PatternRecognitionResult[] = [];

    // Extract features for anomaly detection
    const features = this.featureExtractor.extractAnomalyFeatures(responses);
    
    if (features.length === 0) return anomalies;

    // Detect anomalies using isolation forest or similar
    const anomalyScores = await this.anomalyDetector.detectAnomalies(features);

    for (let i = 0; i < anomalyScores.length; i++) {
      if (anomalyScores[i] > 0.7) { // Anomaly threshold
        anomalies.push({
          patternType: CognitivePatternType.ERROR_PATTERN,
          confidence: anomalyScores[i],
          features: features[i],
          interpretation: this.interpretAnomaly(features[i], anomalyScores[i]),
          recommendations: this.generateAnomalyRecommendations(features[i]),
          timestamp: Date.now()
        });
      }
    }

    return anomalies;
  }

  /**
   * Create a neural network model for pattern recognition
   */
  private async createModel(config: ModelConfig): Promise<tf.LayersModel> {
    const model = tf.sequential();

    // Input layer
    model.add(tf.layers.dense({
      inputShape: config.inputShape,
      units: config.hiddenLayers[0],
      activation: 'relu',
      kernelInitializer: 'heNormal'
    }));

    // Hidden layers with dropout for regularization
    for (let i = 1; i < config.hiddenLayers.length; i++) {
      model.add(tf.layers.dropout({ rate: 0.2 }));
      model.add(tf.layers.dense({
        units: config.hiddenLayers[i],
        activation: 'relu',
        kernelInitializer: 'heNormal'
      }));
    }

    // Output layer
    model.add(tf.layers.dropout({ rate: 0.1 }));
    model.add(tf.layers.dense({
      units: config.outputShape,
      activation: 'softmax'
    }));

    // Compile model
    model.compile({
      optimizer: tf.train.adam(config.learningRate),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });

    return model;
  }

  /**
   * Analyze reaction time patterns
   */
  private async analyzeReactionTimePattern(features: number[]): Promise<PatternRecognitionResult> {
    const model = this.models.get(CognitivePatternType.REACTION_TIME_PATTERN)!;
    const input = tf.tensor2d([features]);
    
    const prediction = model.predict(input) as tf.Tensor;
    const probabilities = await prediction.data();
    
    // Clean up tensors
    input.dispose();
    prediction.dispose();

    const maxProbability = Math.max(...probabilities);
    const patternIndex = probabilities.indexOf(maxProbability);

    return {
      patternType: CognitivePatternType.REACTION_TIME_PATTERN,
      confidence: maxProbability,
      features,
      interpretation: this.interpretReactionTimePattern(patternIndex, features),
      recommendations: this.generateReactionTimeRecommendations(patternIndex, features),
      timestamp: Date.now()
    };
  }

  /**
   * Analyze accuracy patterns
   */
  private async analyzeAccuracyPattern(features: number[]): Promise<PatternRecognitionResult> {
    const model = this.models.get(CognitivePatternType.ACCURACY_PATTERN)!;
    const input = tf.tensor2d([features]);
    
    const prediction = model.predict(input) as tf.Tensor;
    const probabilities = await prediction.data();
    
    input.dispose();
    prediction.dispose();

    const maxProbability = Math.max(...probabilities);
    const patternIndex = probabilities.indexOf(maxProbability);

    return {
      patternType: CognitivePatternType.ACCURACY_PATTERN,
      confidence: maxProbability,
      features,
      interpretation: this.interpretAccuracyPattern(patternIndex, features),
      recommendations: this.generateAccuracyRecommendations(patternIndex, features),
      timestamp: Date.now()
    };
  }

  /**
   * Analyze learning curve patterns
   */
  private async analyzeLearningCurve(features: number[]): Promise<PatternRecognitionResult> {
    const model = this.models.get(CognitivePatternType.LEARNING_CURVE)!;
    const input = tf.tensor2d([features]);
    
    const prediction = model.predict(input) as tf.Tensor;
    const probabilities = await prediction.data();
    
    input.dispose();
    prediction.dispose();

    const maxProbability = Math.max(...probabilities);
    const patternIndex = probabilities.indexOf(maxProbability);

    return {
      patternType: CognitivePatternType.LEARNING_CURVE,
      confidence: maxProbability,
      features,
      interpretation: this.interpretLearningCurve(patternIndex, features),
      recommendations: this.generateLearningRecommendations(patternIndex, features),
      timestamp: Date.now()
    };
  }

  /**
   * Analyze cognitive load patterns
   */
  private async analyzeCognitiveLoadPattern(features: number[]): Promise<PatternRecognitionResult> {
    const model = this.models.get(CognitivePatternType.COGNITIVE_LOAD_PATTERN)!;
    const input = tf.tensor2d([features]);
    
    const prediction = model.predict(input) as tf.Tensor;
    const probabilities = await prediction.data();
    
    input.dispose();
    prediction.dispose();

    const maxProbability = Math.max(...probabilities);
    const patternIndex = probabilities.indexOf(maxProbability);

    return {
      patternType: CognitivePatternType.COGNITIVE_LOAD_PATTERN,
      confidence: maxProbability,
      features,
      interpretation: this.interpretCognitiveLoadPattern(patternIndex, features),
      recommendations: this.generateCognitiveLoadRecommendations(patternIndex, features),
      timestamp: Date.now()
    };
  }

  // Pattern interpretation methods
  private interpretReactionTimePattern(patternIndex: number, features: number[]): string {
    const patterns = [
      'Consistently fast reactions with high precision',
      'Variable reaction times indicating attention fluctuations',
      'Gradually improving reaction times showing learning',
      'Declining reaction times suggesting fatigue',
      'Erratic reaction times indicating stress or distraction'
    ];
    return patterns[patternIndex] || 'Unknown reaction time pattern';
  }

  private interpretAccuracyPattern(patternIndex: number, features: number[]): string {
    const patterns = [
      'High accuracy with consistent performance',
      'Accuracy declining with increased difficulty',
      'Improving accuracy showing skill development',
      'Inconsistent accuracy indicating attention issues'
    ];
    return patterns[patternIndex] || 'Unknown accuracy pattern';
  }

  private interpretLearningCurve(patternIndex: number, features: number[]): string {
    const patterns = [
      'Rapid initial learning with plateau',
      'Steady linear improvement',
      'Slow start with accelerating improvement',
      'Inconsistent learning with ups and downs',
      'Advanced learner with minimal improvement needed',
      'Struggling learner requiring additional support'
    ];
    return patterns[patternIndex] || 'Unknown learning pattern';
  }

  private interpretCognitiveLoadPattern(patternIndex: number, features: number[]): string {
    const patterns = [
      'Low cognitive load - can handle increased difficulty',
      'Moderate cognitive load - optimal challenge level',
      'High cognitive load - consider reducing difficulty'
    ];
    return patterns[patternIndex] || 'Unknown cognitive load pattern';
  }

  private interpretAnomaly(features: number[], score: number): string {
    if (score > 0.9) {
      return 'Highly unusual performance pattern detected - may indicate technical issues or extreme fatigue';
    } else if (score > 0.8) {
      return 'Unusual performance pattern - consider environmental factors or user state';
    } else {
      return 'Minor performance anomaly detected';
    }
  }

  // Recommendation generation methods
  private generateReactionTimeRecommendations(patternIndex: number, features: number[]): string[] {
    const recommendations = [
      ['Excellent reaction times! Try increasing difficulty for more challenge.'],
      ['Focus exercises may help improve attention and reaction consistency.'],
      ['Great progress! Continue current training approach.'],
      ['Consider taking a break to prevent fatigue buildup.'],
      ['Try relaxation techniques to reduce stress and improve focus.']
    ];
    return recommendations[patternIndex] || ['Continue current training approach.'];
  }

  private generateAccuracyRecommendations(patternIndex: number, features: number[]): string[] {
    const recommendations = [
      ['Excellent accuracy! Ready for advanced challenges.'],
      ['Practice at current difficulty level before advancing.'],
      ['Good improvement trend - maintain current approach.'],
      ['Focus on concentration exercises to improve consistency.']
    ];
    return recommendations[patternIndex] || ['Continue practicing for improvement.'];
  }

  private generateLearningRecommendations(patternIndex: number, features: number[]): string[] {
    const recommendations = [
      ['Try varied challenges to break through the plateau.'],
      ['Maintain steady practice schedule for continued improvement.'],
      ['Be patient - your learning is accelerating.'],
      ['Consider shorter, more frequent sessions for better consistency.'],
      ['Explore advanced techniques and strategies.'],
      ['Additional support and practice time recommended.']
    ];
    return recommendations[patternIndex] || ['Continue regular practice.'];
  }

  private generateCognitiveLoadRecommendations(patternIndex: number, features: number[]): string[] {
    const recommendations = [
      ['Ready for increased difficulty and complexity.'],
      ['Current difficulty level is optimal - maintain it.'],
      ['Consider reducing difficulty or taking breaks.']
    ];
    return recommendations[patternIndex] || ['Monitor cognitive load levels.'];
  }

  private generateAnomalyRecommendations(features: number[]): string[] {
    return [
      'Check for technical issues or environmental distractions',
      'Consider taking a longer break if fatigue is suspected',
      'Review recent performance for patterns',
      'Consult with a cognitive training specialist if issues persist'
    ];
  }

  // Helper methods for cognitive profile creation
  private analyzeCognitiveAbilities(
    patterns: PatternRecognitionResult[], 
    history: GameSession[]
  ): { strengths: CognitiveAbility[], weaknesses: CognitiveAbility[] } {
    const strengths: CognitiveAbility[] = [];
    const weaknesses: CognitiveAbility[] = [];

    // Analyze reaction time patterns
    const reactionTimePattern = patterns.find(p => p.patternType === CognitivePatternType.REACTION_TIME_PATTERN);
    if (reactionTimePattern && reactionTimePattern.confidence > 0.8) {
      if (reactionTimePattern.interpretation.includes('fast')) {
        strengths.push('processing_speed' as CognitiveAbility);
      } else if (reactionTimePattern.interpretation.includes('slow') || reactionTimePattern.interpretation.includes('declining')) {
        weaknesses.push('processing_speed' as CognitiveAbility);
      }
    }

    // Analyze accuracy patterns
    const accuracyPattern = patterns.find(p => p.patternType === CognitivePatternType.ACCURACY_PATTERN);
    if (accuracyPattern && accuracyPattern.confidence > 0.8) {
      if (accuracyPattern.interpretation.includes('high') || accuracyPattern.interpretation.includes('consistent')) {
        strengths.push('attention_span' as CognitiveAbility);
      } else if (accuracyPattern.interpretation.includes('declining') || accuracyPattern.interpretation.includes('inconsistent')) {
        weaknesses.push('attention_span' as CognitiveAbility);
      }
    }

    // Analyze learning curve
    const learningPattern = patterns.find(p => p.patternType === CognitivePatternType.LEARNING_CURVE);
    if (learningPattern && learningPattern.confidence > 0.8) {
      if (learningPattern.interpretation.includes('rapid') || learningPattern.interpretation.includes('advanced')) {
        strengths.push('working_memory' as CognitiveAbility);
      } else if (learningPattern.interpretation.includes('struggling') || learningPattern.interpretation.includes('slow')) {
        weaknesses.push('working_memory' as CognitiveAbility);
      }
    }
    
    return { strengths, weaknesses };
  }

  private determineLearningStyle(patterns: PatternRecognitionResult[]): LearningStyle {
    // Analyze patterns to determine learning style
    const accuracyPattern = patterns.find(p => p.patternType === CognitivePatternType.ACCURACY_PATTERN);
    const reactionTimePattern = patterns.find(p => p.patternType === CognitivePatternType.REACTION_TIME_PATTERN);
    
    if (accuracyPattern && accuracyPattern.confidence > 0.7) {
      if (accuracyPattern.interpretation.includes('visual') || accuracyPattern.features.some(f => f > 0.8)) {
        return 'visual';
      }
    }
    
    if (reactionTimePattern && reactionTimePattern.confidence > 0.7) {
      if (reactionTimePattern.interpretation.includes('fast') && reactionTimePattern.features.some(f => f < 500)) {
        return 'kinesthetic';
      }
    }
    
    return 'mixed';
  }

  private calculateOptimalDifficultyCurve(history: GameSession[]): number[] {
    if (history.length === 0) return [0.3, 0.5, 0.7, 0.9];
    
    // Calculate difficulty progression based on historical performance
    const curve: number[] = [];
    const sessionCount = Math.min(history.length, 10); // Last 10 sessions
    
    for (let i = 0; i < sessionCount; i++) {
      const session = history[history.length - sessionCount + i];
      const avgAccuracy = session.totalCorrect / Math.max(session.totalQuestions, 1);
      const avgReactionTime = session.averageReactionTime || 1500;
      
      // Calculate optimal difficulty based on performance
      let difficulty = 0.5; // Base difficulty
      
      if (avgAccuracy > 0.9 && avgReactionTime < 1000) {
        difficulty = Math.min(0.95, difficulty + 0.3);
      } else if (avgAccuracy < 0.6 || avgReactionTime > 2500) {
        difficulty = Math.max(0.1, difficulty - 0.2);
      }
      
      curve.push(difficulty);
    }
    
    return curve.length > 0 ? curve : [0.3, 0.5, 0.7, 0.9];
  }

  private analyzeFlowStateIndicators(
    patterns: PatternRecognitionResult[], 
    history: GameSession[]
  ): any {
    let averageFlowDuration = 0;
    const flowTriggers: string[] = [];
    let optimalChallengeLevel = 0.7;
    let attentionSpan = 1800; // 30 minutes default
    
    // Analyze flow state from patterns
    const learningPattern = patterns.find(p => p.patternType === CognitivePatternType.LEARNING_CURVE);
    if (learningPattern && learningPattern.confidence > 0.7) {
      if (learningPattern.interpretation.includes('steady') || learningPattern.interpretation.includes('consistent')) {
        averageFlowDuration = 900; // 15 minutes
        flowTriggers.push('consistent_performance');
      }
    }
    
    const cognitiveLoadPattern = patterns.find(p => p.patternType === CognitivePatternType.COGNITIVE_LOAD_PATTERN);
    if (cognitiveLoadPattern && cognitiveLoadPattern.confidence > 0.7) {
      if (cognitiveLoadPattern.interpretation.includes('moderate')) {
        optimalChallengeLevel = 0.6;
        flowTriggers.push('optimal_challenge');
      } else if (cognitiveLoadPattern.interpretation.includes('low')) {
        optimalChallengeLevel = 0.8;
      } else if (cognitiveLoadPattern.interpretation.includes('high')) {
        optimalChallengeLevel = 0.4;
      }
    }
    
    // Calculate attention span from history
    if (history.length > 0) {
      const avgSessionDuration = history.reduce((sum, session) => sum + (session.duration || 1800), 0) / history.length;
      attentionSpan = Math.max(300, Math.min(3600, avgSessionDuration)); // Between 5 minutes and 1 hour
    }
    
    return {
      averageFlowDuration,
      flowTriggers,
      optimalChallengeLevel,
      attentionSpan
    };
  }

  private analyzePersonalityTraits(
    history: GameSession[], 
    patterns: PatternRecognitionResult[]
  ): PersonalityProfile {
    let riskTolerance = 0.5;
    let persistenceLevel = 0.5;
    let competitiveness = 0.5;
    let socialEngagement = 0.5;
    
    if (history.length > 0) {
      // Analyze risk tolerance from difficulty choices
      const avgDifficulty = history.reduce((sum, session) => {
        return sum + (session.difficulty || 0.5);
      }, 0) / history.length;
      riskTolerance = Math.min(1, Math.max(0, avgDifficulty));
      
      // Analyze persistence from session completion rates
      const completionRate = history.filter(session => session.completed).length / history.length;
      persistenceLevel = completionRate;
      
      // Analyze competitiveness from score improvement trends
      if (history.length > 1) {
        const scores = history.map(session => session.finalScore || 0);
        const improvement = (scores[scores.length - 1] - scores[0]) / Math.max(scores[0], 1);
        competitiveness = Math.min(1, Math.max(0, 0.5 + improvement * 0.5));
      }
      
      // Analyze social engagement from multiplayer participation
      const multiplayerSessions = history.filter(session => session.gameMode === 'multiplayer').length;
      socialEngagement = Math.min(1, multiplayerSessions / Math.max(history.length, 1) * 2);
    }
    
    return {
      riskTolerance,
      persistenceLevel,
      competitiveness,
      socialEngagement
    };
  }

  private extractProfileFeatures(profile: CognitiveProfile): number[] {
    const features: number[] = [];
    
    // Flow state indicators
    features.push(
      profile.flowStateIndicators.optimalChallengeLevel,
      profile.flowStateIndicators.attentionSpan / 3600, // Normalize to hours
      profile.flowStateIndicators.averageFlowDuration / 3600 // Normalize to hours
    );
    
    // Personality traits
    features.push(
      profile.personalityTraits.riskTolerance,
      profile.personalityTraits.persistenceLevel,
      profile.personalityTraits.competitiveness,
      profile.personalityTraits.socialEngagement
    );
    
    // Learning style (one-hot encoding)
    const learningStyles: LearningStyle[] = ['visual', 'auditory', 'kinesthetic', 'mixed'];
    learningStyles.forEach(style => {
      features.push(profile.learningStyle === style ? 1 : 0);
    });
    
    // Cognitive strengths and weaknesses (count)
    features.push(
      profile.cognitiveStrengths.length / 10, // Normalize
      profile.weaknessAreas.length / 10 // Normalize
    );
    
    // Optimal difficulty curve (average)
    const avgDifficulty = profile.optimalDifficultyCurve.length > 0 
      ? profile.optimalDifficultyCurve.reduce((sum, d) => sum + d, 0) / profile.optimalDifficultyCurve.length
      : 0.5;
    features.push(avgDifficulty);
    
    return features;
  }

  private analyzeClusterCharacteristics(profiles: CognitiveProfile[]): any {
    if (profiles.length === 0) {
      return {
        dominantCognitiveAbilities: [],
        averagePerformance: 0,
        learningStyle: 'mixed' as LearningStyle,
        difficultyPreference: 0.5,
        sessionDurationPreference: 1800
      };
    }
    
    // Analyze dominant cognitive abilities
    const abilityCount: Record<string, number> = {};
    profiles.forEach(profile => {
      profile.cognitiveStrengths.forEach(ability => {
        abilityCount[ability] = (abilityCount[ability] || 0) + 1;
      });
    });
    
    const dominantCognitiveAbilities = Object.entries(abilityCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([ability]) => ability as CognitiveAbility);
    
    // Calculate average performance metrics
    const avgOptimalChallenge = profiles.reduce((sum, profile) => 
      sum + profile.flowStateIndicators.optimalChallengeLevel, 0) / profiles.length;
    
    const avgAttentionSpan = profiles.reduce((sum, profile) => 
      sum + profile.flowStateIndicators.attentionSpan, 0) / profiles.length;
    
    // Determine dominant learning style
    const styleCount: Record<LearningStyle, number> = { visual: 0, auditory: 0, kinesthetic: 0, mixed: 0 };
    profiles.forEach(profile => {
      styleCount[profile.learningStyle]++;
    });
    
    const dominantLearningStyle = Object.entries(styleCount)
      .sort(([,a], [,b]) => b - a)[0][0] as LearningStyle;
    
    return {
      dominantCognitiveAbilities,
      averagePerformance: avgOptimalChallenge,
      learningStyle: dominantLearningStyle,
      difficultyPreference: avgOptimalChallenge,
      sessionDurationPreference: avgAttentionSpan
    };
  }

  private interpretAccuracyPattern(patternIndex: number, features: number[]): string {
    const patterns = [
      'High accuracy with consistent performance',
      'Accuracy declining with increased difficulty',
      'Improving accuracy showing skill development',
      'Inconsistent accuracy indicating attention issues'
    ];
    return patterns[patternIndex] || 'Unknown accuracy pattern';
  }

  private interpretLearningCurve(patternIndex: number, features: number[]): string {
    const patterns = [
      'Rapid initial learning with plateau',
      'Steady linear improvement',
      'Slow start with accelerating improvement',
      'Inconsistent learning with ups and downs',
      'Advanced learner with minimal improvement needed',
      'Struggling learner requiring additional support'
    ];
    return patterns[patternIndex] || 'Unknown learning pattern';
  }

  private interpretCognitiveLoadPattern(patternIndex: number, features: number[]): string {
    const patterns = [
      'Low cognitive load - can handle increased difficulty',
      'Moderate cognitive load - optimal challenge level',
      'High cognitive load - consider reducing difficulty'
    ];
    return patterns[patternIndex] || 'Unknown cognitive load pattern';
  }

  private interpretAnomaly(features: number[], score: number): string {
    if (score > 0.9) {
      return 'Highly unusual performance pattern detected - may indicate technical issues or extreme fatigue';
    } else if (score > 0.8) {
      return 'Unusual performance pattern - consider environmental factors or user state';
    } else {
      return 'Minor performance anomaly detected';
    }
  }

  // Recommendation generation methods
  private generateReactionTimeRecommendations(patternIndex: number, features: number[]): string[] {
    const recommendations = [
      ['Excellent reaction times! Try increasing difficulty for more challenge.'],
      ['Focus exercises may help improve attention and reaction consistency.'],
      ['Great progress! Continue current training approach.'],
      ['Consider taking a break to prevent fatigue buildup.'],
      ['Try relaxation techniques to reduce stress and improve focus.']
    ];
    return recommendations[patternIndex] || ['Continue current training approach.'];
  }

  private generateAccuracyRecommendations(patternIndex: number, features: number[]): string[] {
    const recommendations = [
      ['Excellent accuracy! Ready for advanced challenges.'],
      ['Practice at current difficulty level before advancing.'],
      ['Good improvement trend - maintain current approach.'],
      ['Focus on concentration exercises to improve consistency.']
    ];
    return recommendations[patternIndex] || ['Continue practicing for improvement.'];
  }

  private generateLearningRecommendations(patternIndex: number, features: number[]): string[] {
    const recommendations = [
      ['Try varied challenges to break through the plateau.'],
      ['Maintain steady practice schedule for continued improvement.'],
      ['Be patient - your learning is accelerating.'],
      ['Consider shorter, more frequent sessions for better consistency.'],
      ['Explore advanced techniques and strategies.'],
      ['Additional support and practice time recommended.']
    ];
    return recommendations[patternIndex] || ['Continue regular practice.'];
  }

  private generateCognitiveLoadRecommendations(patternIndex: number, features: number[]): string[] {
    const recommendations = [
      ['Ready for increased difficulty and complexity.'],
      ['Current difficulty level is optimal - maintain it.'],
      ['Consider reducing difficulty or taking breaks.']
    ];
    return recommendations[patternIndex] || ['Monitor cognitive load levels.'];
  }

  private generateAnomalyRecommendations(features: number[]): string[] {
    return [
      'Check for technical issues or environmental distractions',
      'Consider taking a longer break if fatigue is suspected',
      'Review recent performance for patterns',
      'Consult with a cognitive training specialist if issues persist'
    ];
  }

  // Helper methods for cognitive profile creation
  private analyzeCognitiveAbilities(
    patterns: PatternRecognitionResult[], 
    history: GameSession[]
  ): { strengths: CognitiveAbility[], weaknesses: CognitiveAbility[] } {
    // Analyze patterns to determine cognitive strengths and weaknesses
    const strengths: CognitiveAbility[] = [];
    const weaknesses: CognitiveAbility[] = [];

    // Implementation would analyze specific patterns and map to cognitive abilities
    // This is a simplified version
    
    return { strengths, weaknesses };
  }

  private determineLearningStyle(patterns: PatternRecognitionResult[]): LearningStyle {
    // Analyze patterns to determine learning style
    // This would involve more sophisticated analysis
    return 'mixed';
  }

  private calculateOptimalDifficultyCurve(history: GameSession[]): any[] {
    // Calculate optimal difficulty progression based on historical performance
    return [];
  }

  private analyzeFlowStateIndicators(
    patterns: PatternRecognitionResult[], 
    history: GameSession[]
  ): any {
    return {
      averageFlowDuration: 0,
      flowTriggers: [],
      optimalChallengeLevel: 0.7,
      attentionSpan: 0
    };
  }

  private analyzePersonalityTraits(
    history: GameSession[], 
    patterns: PatternRecognitionResult[]
  ): PersonalityProfile {
    return {
      riskTolerance: 0.5,
      persistenceLevel: 0.5,
      competitiveness: 0.5,
      socialEngagement: 0.5
    };
  }

  private extractProfileFeatures(profile: CognitiveProfile): number[] {
    // Extract numerical features from cognitive profile for clustering
    return [];
  }

  private analyzeClusterCharacteristics(profiles: CognitiveProfile[]): any {
    return {
      dominantCognitiveAbilities: [],
      averagePerformance: 0,
      learningStyle: 'mixed' as LearningStyle,
      difficultyPreference: 0.5,
      sessionDurationPreference: 1800
    };
  }

  /**
   * Save trained models
   */
  async saveModels(): Promise<void> {
    for (const [patternType, model] of this.models) {
      const saveUrl = `localstorage://cognitive-pattern-${patternType}`;
      await model.save(saveUrl);
      console.log(`Saved model for ${patternType}`);
    }
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    for (const model of this.models.values()) {
      model.dispose();
    }
    this.models.clear();
    this.featureExtractor.dispose();
    this.clusteringModel.dispose();
    this.anomalyDetector.dispose();
  }
}

// Feature extraction class
class FeatureExtractor {
  constructor(private config: FeatureConfig) {}

  extractReactionTimeFeatures(responses: InstructionResponse[]): number[] {
    if (responses.length < this.config.reactionTimeWindow) return [];
    
    const recentResponses = responses.slice(-this.config.reactionTimeWindow);
    const reactionTimes = recentResponses.map(r => r.reactionTime);
    
    return [
      ...reactionTimes,
      this.calculateMean(reactionTimes),
      this.calculateStandardDeviation(reactionTimes),
      this.calculateTrend(reactionTimes)
    ];
  }

  extractAccuracyFeatures(responses: InstructionResponse[]): number[] {
    if (responses.length < this.config.accuracyWindow) return [];
    
    const recentResponses = responses.slice(-this.config.accuracyWindow);
    const accuracies = recentResponses.map(r => r.isCorrect ? 1 : 0);
    
    return [
      ...accuracies,
      this.calculateMean(accuracies),
      this.calculateMovingAverage(accuracies, 5)
    ];
  }

  extractLearningFeatures(responses: InstructionResponse[], sessions: GameSession[]): number[] {
    if (responses.length < 10 || sessions.length < 2) return [];
    
    const features: number[] = [];
    
    // Learning curve analysis - accuracy improvement over time
    const accuracyWindow = 10;
    const accuracyTrend = this.calculateLearningTrend(responses, accuracyWindow, 'accuracy');
    features.push(accuracyTrend);
    
    // Reaction time improvement over time
    const reactionTimeTrend = this.calculateLearningTrend(responses, accuracyWindow, 'reactionTime');
    features.push(reactionTimeTrend);
    
    // Consistency improvement (decreasing variance over time)
    const consistencyTrend = this.calculateConsistencyTrend(responses);
    features.push(consistencyTrend);
    
    // Session-to-session improvement
    if (sessions.length >= 2) {
      const sessionImprovement = this.calculateSessionImprovement(sessions);
      features.push(...sessionImprovement);
    } else {
      features.push(0, 0, 0); // Padding
    }
    
    // Skill transfer indicators (performance across different instruction types)
    const transferIndicators = this.calculateSkillTransfer(responses);
    features.push(...transferIndicators);
    
    // Plateau detection features
    const plateauIndicators = this.detectLearningPlateau(responses);
    features.push(...plateauIndicators);
    
    // Retention features (performance on repeated instruction types)
    const retentionFeatures = this.calculateRetentionFeatures(responses);
    features.push(...retentionFeatures);
    
    // Pad to 30 features
    while (features.length < 30) {
      features.push(0);
    }
    
    return features.slice(0, 30);
  }

  extractCognitiveLoadFeatures(responses: InstructionResponse[]): number[] {
    if (responses.length < this.config.reactionTimeWindow) return [];
    
    const features: number[] = [];
    const recentResponses = responses.slice(-this.config.reactionTimeWindow);
    
    // Reaction time variability (higher variability = higher cognitive load)
    const reactionTimes = recentResponses.map(r => r.reactionTime);
    const rtVariability = this.calculateStandardDeviation(reactionTimes) / this.calculateMean(reactionTimes);
    features.push(rtVariability);
    
    // Accuracy decline under time pressure
    const accuracyUnderPressure = this.calculateAccuracyUnderPressure(recentResponses);
    features.push(accuracyUnderPressure);
    
    // Error pattern complexity (more complex errors = higher load)
    const errorComplexity = this.calculateErrorComplexity(recentResponses);
    features.push(errorComplexity);
    
    // Response time distribution features
    const rtDistribution = this.analyzeReactionTimeDistribution(reactionTimes);
    features.push(...rtDistribution);
    
    // Fatigue indicators
    const fatigueIndicators = this.calculateFatigueIndicators(recentResponses);
    features.push(...fatigueIndicators);
    
    // Attention lapse detection
    const attentionLapses = this.detectAttentionLapses(recentResponses);
    features.push(...attentionLapses);
    
    // Cognitive switching cost (performance drop when instruction type changes)
    const switchingCost = this.calculateSwitchingCost(recentResponses);
    features.push(switchingCost);
    
    // Working memory load indicators
    const workingMemoryLoad = this.calculateWorkingMemoryLoad(recentResponses);
    features.push(...workingMemoryLoad);
    
    // Pad to 25 features
    while (features.length < 25) {
      features.push(0);
    }
    
    return features.slice(0, 25);
  }

  extractAnomalyFeatures(responses: InstructionResponse[]): number[][] {
    if (responses.length < 5) return [];
    
    const features: number[][] = [];
    
    // Sliding window approach for anomaly detection
    const windowSize = 5;
    for (let i = 0; i <= responses.length - windowSize; i++) {
      const window = responses.slice(i, i + windowSize);
      const windowFeatures: number[] = [];
      
      // Reaction time features
      const reactionTimes = window.map(r => r.reactionTime);
      windowFeatures.push(
        this.calculateMean(reactionTimes),
        this.calculateStandardDeviation(reactionTimes),
        Math.min(...reactionTimes),
        Math.max(...reactionTimes)
      );
      
      // Accuracy features
      const accuracies = window.map(r => r.isCorrect ? 1 : 0);
      windowFeatures.push(
        this.calculateMean(accuracies),
        accuracies.filter(a => a === 0).length // error count
      );
      
      // Pattern features
      const patterns = this.extractPatternFeatures(window);
      windowFeatures.push(...patterns);
      
      // Temporal features
      const temporalFeatures = this.extractTemporalFeatures(window);
      windowFeatures.push(...temporalFeatures);
      
      // Behavioral consistency features
      const consistencyFeatures = this.extractConsistencyFeatures(window);
      windowFeatures.push(...consistencyFeatures);
      
      // Pad to 20 features per window
      while (windowFeatures.length < 20) {
        windowFeatures.push(0);
      }
      
      features.push(windowFeatures.slice(0, 20));
    }
    
    return features;
  }

  // Helper methods for learning features
  private calculateLearningTrend(responses: InstructionResponse[], window: number, metric: 'accuracy' | 'reactionTime'): number {
    if (responses.length < window * 2) return 0;
    
    const firstHalf = responses.slice(0, Math.floor(responses.length / 2));
    const secondHalf = responses.slice(Math.floor(responses.length / 2));
    
    let firstValue: number, secondValue: number;
    
    if (metric === 'accuracy') {
      firstValue = firstHalf.filter(r => r.isCorrect).length / firstHalf.length;
      secondValue = secondHalf.filter(r => r.isCorrect).length / secondHalf.length;
    } else {
      firstValue = this.calculateMean(firstHalf.map(r => r.reactionTime));
      secondValue = this.calculateMean(secondHalf.map(r => r.reactionTime));
      // For reaction time, improvement is decrease, so invert
      return (firstValue - secondValue) / firstValue;
    }
    
    return (secondValue - firstValue) / Math.max(firstValue, 0.01);
  }

  private calculateConsistencyTrend(responses: InstructionResponse[]): number {
    if (responses.length < 20) return 0;
    
    const firstHalf = responses.slice(0, Math.floor(responses.length / 2));
    const secondHalf = responses.slice(Math.floor(responses.length / 2));
    
    const firstVariance = this.calculateStandardDeviation(firstHalf.map(r => r.reactionTime));
    const secondVariance = this.calculateStandardDeviation(secondHalf.map(r => r.reactionTime));
    
    // Consistency improvement is variance decrease
    return (firstVariance - secondVariance) / Math.max(firstVariance, 1);
  }

  private calculateSessionImprovement(sessions: GameSession[]): number[] {
    const recentSessions = sessions.slice(-5); // Last 5 sessions
    if (recentSessions.length < 2) return [0, 0, 0];
    
    // Score improvement
    const scores = recentSessions.map(s => s.finalScore);
    const scoreImprovement = this.calculateTrend(scores);
    
    // Accuracy improvement
    const accuracies = recentSessions.map(s => s.totalCorrect / Math.max(s.totalQuestions, 1));
    const accuracyImprovement = this.calculateTrend(accuracies);
    
    // Reaction time improvement (lower is better)
    const reactionTimes = recentSessions.map(s => s.averageReactionTime || 1500);
    const reactionTimeImprovement = -this.calculateTrend(reactionTimes); // Invert because lower is better
    
    return [scoreImprovement, accuracyImprovement, reactionTimeImprovement];
  }

  private calculateSkillTransfer(responses: InstructionResponse[]): number[] {
    const typeGroups: Record<string, InstructionResponse[]> = {};
    
    // Group responses by instruction type
    responses.forEach(response => {
      if (!typeGroups[response.instructionType]) {
        typeGroups[response.instructionType] = [];
      }
      typeGroups[response.instructionType].push(response);
    });
    
    const types = Object.keys(typeGroups);
    if (types.length < 2) return [0, 0, 0];
    
    // Calculate performance correlation between types
    const correlations: number[] = [];
    for (let i = 0; i < types.length - 1; i++) {
      for (let j = i + 1; j < types.length; j++) {
        const type1Perf = typeGroups[types[i]].map(r => r.isCorrect ? 1 : 0);
        const type2Perf = typeGroups[types[j]].map(r => r.isCorrect ? 1 : 0);
        
        if (type1Perf.length > 0 && type2Perf.length > 0) {
          const correlation = this.calculateCorrelation(type1Perf, type2Perf);
          correlations.push(correlation);
        }
      }
    }
    
    return [
      this.calculateMean(correlations),
      Math.max(...correlations, 0),
      Math.min(...correlations, 0)
    ];
  }

  private detectLearningPlateau(responses: InstructionResponse[]): number[] {
    if (responses.length < 30) return [0, 0];
    
    // Divide into three segments and check for improvement stagnation
    const segmentSize = Math.floor(responses.length / 3);
    const segments = [
      responses.slice(0, segmentSize),
      responses.slice(segmentSize, segmentSize * 2),
      responses.slice(segmentSize * 2)
    ];
    
    const segmentAccuracies = segments.map(segment => 
      segment.filter(r => r.isCorrect).length / segment.length
    );
    
    // Check if improvement has stagnated
    const improvement1to2 = segmentAccuracies[1] - segmentAccuracies[0];
    const improvement2to3 = segmentAccuracies[2] - segmentAccuracies[1];
    
    const plateauIndicator = improvement1to2 > 0.05 && improvement2to3 < 0.02 ? 1 : 0;
    const overallTrend = this.calculateTrend(segmentAccuracies);
    
    return [plateauIndicator, overallTrend];
  }

  private calculateRetentionFeatures(responses: InstructionResponse[]): number[] {
    // Group by instruction type and analyze retention
    const typeGroups: Record<string, InstructionResponse[]> = {};
    responses.forEach(response => {
      if (!typeGroups[response.instructionType]) {
        typeGroups[response.instructionType] = [];
      }
      typeGroups[response.instructionType].push(response);
    });
    
    const retentionScores: number[] = [];
    Object.values(typeGroups).forEach(group => {
      if (group.length >= 5) {
        const firstQuarter = group.slice(0, Math.floor(group.length / 4));
        const lastQuarter = group.slice(-Math.floor(group.length / 4));
        
        const firstAccuracy = firstQuarter.filter(r => r.isCorrect).length / firstQuarter.length;
        const lastAccuracy = lastQuarter.filter(r => r.isCorrect).length / lastQuarter.length;
        
        retentionScores.push(lastAccuracy - firstAccuracy);
      }
    });
    
    if (retentionScores.length === 0) return [0, 0];
    
    return [
      this.calculateMean(retentionScores),
      this.calculateStandardDeviation(retentionScores)
    ];
  }

  // Helper methods for cognitive load features
  private calculateAccuracyUnderPressure(responses: InstructionResponse[]): number {
    // Define pressure as shorter time limits
    const avgTimeLimit = this.calculateMean(responses.map(r => r.reactionTime));
    const pressureThreshold = avgTimeLimit * 0.7;
    
    const pressureResponses = responses.filter(r => r.reactionTime < pressureThreshold);
    const normalResponses = responses.filter(r => r.reactionTime >= pressureThreshold);
    
    if (pressureResponses.length === 0 || normalResponses.length === 0) return 0;
    
    const pressureAccuracy = pressureResponses.filter(r => r.isCorrect).length / pressureResponses.length;
    const normalAccuracy = normalResponses.filter(r => r.isCorrect).length / normalResponses.length;
    
    return normalAccuracy - pressureAccuracy; // Higher value = more accuracy loss under pressure
  }

  private calculateErrorComplexity(responses: InstructionResponse[]): number {
    const errors = responses.filter(r => !r.isCorrect);
    if (errors.length === 0) return 0;
    
    // Analyze error patterns - more complex errors indicate higher cognitive load
    const errorTypes: Record<string, number> = {};
    errors.forEach(error => {
      const errorType = `${error.instructionType}_${error.userAnswer}`;
      errorTypes[errorType] = (errorTypes[errorType] || 0) + 1;
    });
    
    // Shannon entropy as complexity measure
    const total = errors.length;
    let entropy = 0;
    Object.values(errorTypes).forEach(count => {
      const probability = count / total;
      entropy -= probability * Math.log2(probability);
    });
    
    return entropy;
  }

  private analyzeReactionTimeDistribution(reactionTimes: number[]): number[] {
    if (reactionTimes.length === 0) return [0, 0, 0];
    
    const sorted = [...reactionTimes].sort((a, b) => a - b);
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const median = sorted[Math.floor(sorted.length * 0.5)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];
    
    return [q1, median, q3];
  }

  private calculateFatigueIndicators(responses: InstructionResponse[]): number[] {
    if (responses.length < 10) return [0, 0, 0];
    
    // Divide into early and late responses
    const early = responses.slice(0, Math.floor(responses.length / 3));
    const late = responses.slice(-Math.floor(responses.length / 3));
    
    // Reaction time increase
    const earlyRT = this.calculateMean(early.map(r => r.reactionTime));
    const lateRT = this.calculateMean(late.map(r => r.reactionTime));
    const rtIncrease = (lateRT - earlyRT) / earlyRT;
    
    // Accuracy decrease
    const earlyAcc = early.filter(r => r.isCorrect).length / early.length;
    const lateAcc = late.filter(r => r.isCorrect).length / late.length;
    const accDecrease = earlyAcc - lateAcc;
    
    // Consistency decrease (variance increase)
    const earlyVar = this.calculateStandardDeviation(early.map(r => r.reactionTime));
    const lateVar = this.calculateStandardDeviation(late.map(r => r.reactionTime));
    const varIncrease = (lateVar - earlyVar) / Math.max(earlyVar, 1);
    
    return [rtIncrease, accDecrease, varIncrease];
  }

  private detectAttentionLapses(responses: InstructionResponse[]): number[] {
    // Attention lapses are characterized by sudden increases in reaction time
    const reactionTimes = responses.map(r => r.reactionTime);
    const mean = this.calculateMean(reactionTimes);
    const std = this.calculateStandardDeviation(reactionTimes);
    
    // Count responses that are more than 2 standard deviations above mean
    const lapses = reactionTimes.filter(rt => rt > mean + 2 * std).length;
    const lapseRate = lapses / reactionTimes.length;
    
    // Average severity of lapses
    const lapseSeverity = lapses > 0 ? 
      this.calculateMean(reactionTimes.filter(rt => rt > mean + 2 * std).map(rt => (rt - mean) / std)) : 0;
    
    return [lapseRate, lapseSeverity];
  }

  private calculateSwitchingCost(responses: InstructionResponse[]): number {
    if (responses.length < 2) return 0;
    
    let switchCosts: number[] = [];
    
    for (let i = 1; i < responses.length; i++) {
      if (responses[i].instructionType !== responses[i-1].instructionType) {
        // Task switch occurred
        const switchRT = responses[i].reactionTime;
        const prevRT = responses[i-1].reactionTime;
        switchCosts.push(switchRT - prevRT);
      }
    }
    
    return switchCosts.length > 0 ? this.calculateMean(switchCosts) : 0;
  }

  private calculateWorkingMemoryLoad(responses: InstructionResponse[]): number[] {
    // Working memory load can be inferred from performance on complex instruction types
    const complexTypes = ['combo', 'sequence', 'pattern', 'memory'];
    const complexResponses = responses.filter(r => complexTypes.includes(r.instructionType));
    const simpleResponses = responses.filter(r => !complexTypes.includes(r.instructionType));
    
    if (complexResponses.length === 0 || simpleResponses.length === 0) return [0, 0];
    
    const complexAccuracy = complexResponses.filter(r => r.isCorrect).length / complexResponses.length;
    const simpleAccuracy = simpleResponses.filter(r => r.isCorrect).length / simpleResponses.length;
    
    const complexRT = this.calculateMean(complexResponses.map(r => r.reactionTime));
    const simpleRT = this.calculateMean(simpleResponses.map(r => r.reactionTime));
    
    return [
      simpleAccuracy - complexAccuracy, // Accuracy cost
      (complexRT - simpleRT) / simpleRT // RT cost
    ];
  }

  // Helper methods for anomaly features
  private extractPatternFeatures(responses: InstructionResponse[]): number[] {
    // Look for unusual patterns in response sequences
    const features: number[] = [];
    
    // Consecutive errors
    let maxConsecutiveErrors = 0;
    let currentConsecutiveErrors = 0;
    
    responses.forEach(response => {
      if (!response.isCorrect) {
        currentConsecutiveErrors++;
        maxConsecutiveErrors = Math.max(maxConsecutiveErrors, currentConsecutiveErrors);
      } else {
        currentConsecutiveErrors = 0;
      }
    });
    
    features.push(maxConsecutiveErrors);
    
    // Response time outliers
    const reactionTimes = responses.map(r => r.reactionTime);
    const mean = this.calculateMean(reactionTimes);
    const std = this.calculateStandardDeviation(reactionTimes);
    const outliers = reactionTimes.filter(rt => Math.abs(rt - mean) > 2 * std).length;
    
    features.push(outliers / reactionTimes.length);
    
    return features;
  }

  private extractTemporalFeatures(responses: InstructionResponse[]): number[] {
    // Time-based patterns that might indicate anomalies
    const features: number[] = [];
    
    // Response rhythm consistency
    const intervals: number[] = [];
    for (let i = 1; i < responses.length; i++) {
      intervals.push(responses[i].timestamp - responses[i-1].timestamp);
    }
    
    if (intervals.length > 0) {
      const rhythmConsistency = 1 / (1 + this.calculateStandardDeviation(intervals) / this.calculateMean(intervals));
      features.push(rhythmConsistency);
    } else {
      features.push(0);
    }
    
    return features;
  }

  private extractConsistencyFeatures(responses: InstructionResponse[]): number[] {
    // Behavioral consistency indicators
    const features: number[] = [];
    
    // Response pattern consistency
    const accuracyPattern = responses.map(r => r.isCorrect ? 1 : 0);
    const patternEntropy = this.calculateEntropy(accuracyPattern);
    features.push(patternEntropy);
    
    return features;
  }

  private calculateCorrelation(x: number[], y: number[]): number {
    if (x.length !== y.length || x.length === 0) return 0;
    
    const meanX = this.calculateMean(x);
    const meanY = this.calculateMean(y);
    
    let numerator = 0;
    let denomX = 0;
    let denomY = 0;
    
    for (let i = 0; i < x.length; i++) {
      const deltaX = x[i] - meanX;
      const deltaY = y[i] - meanY;
      numerator += deltaX * deltaY;
      denomX += deltaX * deltaX;
      denomY += deltaY * deltaY;
    }
    
    const denominator = Math.sqrt(denomX * denomY);
    return denominator === 0 ? 0 : numerator / denominator;
  }

  private calculateEntropy(values: number[]): number {
    if (values.length === 0) return 0;
    
    const counts: Record<number, number> = {};
    values.forEach(value => {
      counts[value] = (counts[value] || 0) + 1;
    });
    
    const total = values.length;
    let entropy = 0;
    
    Object.values(counts).forEach(count => {
      const probability = count / total;
      entropy -= probability * Math.log2(probability);
    });
    
    return entropy;
  }

  private calculateMean(values: number[]): number {
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private calculateStandardDeviation(values: number[]): number {
    const mean = this.calculateMean(values);
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    return Math.sqrt(this.calculateMean(squaredDiffs));
  }

  private calculateTrend(values: number[]): number {
    // Simple linear trend calculation
    const n = values.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = values.reduce((sum, val, idx) => sum + (idx * val), 0);
    const sumXX = (n * (n - 1) * (2 * n - 1)) / 6;
    
    return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  }

  private calculateMovingAverage(values: number[], window: number): number {
    if (values.length < window) return this.calculateMean(values);
    
    const recentValues = values.slice(-window);
    return this.calculateMean(recentValues);
  }

  dispose(): void {
    // Clean up any resources
  }
}

// K-Means clustering implementation
class KMeansClusterer {
  private centroids: number[][] = [];
  private maxIterations = 100;
  private tolerance = 1e-4;

  constructor(private k: number) {}

  async initialize(): Promise<void> {
    // K-means clustering is stateless, no initialization needed
  }

  async cluster(features: number[][]): Promise<any[]> {
    if (features.length === 0 || this.k <= 0) return [];
    
    const numFeatures = features[0].length;
    const numPoints = features.length;
    
    // Initialize centroids randomly
    this.centroids = [];
    for (let i = 0; i < this.k; i++) {
      const centroid: number[] = [];
      for (let j = 0; j < numFeatures; j++) {
        const min = Math.min(...features.map(f => f[j]));
        const max = Math.max(...features.map(f => f[j]));
        centroid.push(min + Math.random() * (max - min));
      }
      this.centroids.push(centroid);
    }
    
    let assignments = new Array(numPoints).fill(0);
    let converged = false;
    let iteration = 0;
    
    while (!converged && iteration < this.maxIterations) {
      // Assign points to nearest centroids
      const newAssignments = features.map(point => {
        let minDistance = Infinity;
        let closestCentroid = 0;
        
        for (let i = 0; i < this.k; i++) {
          const distance = this.euclideanDistance(point, this.centroids[i]);
          if (distance < minDistance) {
            minDistance = distance;
            closestCentroid = i;
          }
        }
        
        return closestCentroid;
      });
      
      // Check for convergence
      converged = newAssignments.every((assignment, index) => assignment === assignments[index]);
      assignments = newAssignments;
      
      if (!converged) {
        // Update centroids
        const newCentroids: number[][] = [];
        
        for (let i = 0; i < this.k; i++) {
          const clusterPoints = features.filter((_, index) => assignments[index] === i);
          
          if (clusterPoints.length > 0) {
            const centroid: number[] = [];
            for (let j = 0; j < numFeatures; j++) {
              const sum = clusterPoints.reduce((acc, point) => acc + point[j], 0);
              centroid.push(sum / clusterPoints.length);
            }
            newCentroids.push(centroid);
          } else {
            // Keep old centroid if no points assigned
            newCentroids.push([...this.centroids[i]]);
          }
        }
        
        // Check centroid movement for convergence
        const maxMovement = Math.max(...newCentroids.map((centroid, i) => 
          this.euclideanDistance(centroid, this.centroids[i])
        ));
        
        if (maxMovement < this.tolerance) {
          converged = true;
        }
        
        this.centroids = newCentroids;
      }
      
      iteration++;
    }
    
    // Create cluster results
    const clusters: any[] = [];
    for (let i = 0; i < this.k; i++) {
      const memberIndices = assignments
        .map((assignment, index) => assignment === i ? index : -1)
        .filter(index => index !== -1);
      
      clusters.push({
        centroid: this.centroids[i],
        memberIndices,
        size: memberIndices.length,
        inertia: this.calculateInertia(features, assignments, i)
      });
    }
    
    return clusters;
  }

  private euclideanDistance(point1: number[], point2: number[]): number {
    if (point1.length !== point2.length) return Infinity;
    
    let sum = 0;
    for (let i = 0; i < point1.length; i++) {
      sum += Math.pow(point1[i] - point2[i], 2);
    }
    return Math.sqrt(sum);
  }

  private calculateInertia(features: number[][], assignments: number[], clusterId: number): number {
    const clusterPoints = features.filter((_, index) => assignments[index] === clusterId);
    const centroid = this.centroids[clusterId];
    
    return clusterPoints.reduce((sum, point) => {
      return sum + Math.pow(this.euclideanDistance(point, centroid), 2);
    }, 0);
  }

  dispose(): void {
    this.centroids = [];
  }
}

// Anomaly detection implementation using Isolation Forest algorithm
class AnomalyDetector {
  private trees: IsolationTree[] = [];
  private numTrees = 100;
  private subsampleSize = 256;
  private maxDepth = 10;

  async initialize(): Promise<void> {
    // Isolation Forest is trained on-demand, no pre-initialization needed
  }

  async detectAnomalies(features: number[][]): Promise<number[]> {
    if (features.length === 0) return [];
    
    // Build isolation forest
    this.buildForest(features);
    
    // Calculate anomaly scores for each point
    const scores = features.map(point => this.calculateAnomalyScore(point, features.length));
    
    return scores;
  }

  private buildForest(features: number[][]): void {
    this.trees = [];
    const sampleSize = Math.min(this.subsampleSize, features.length);
    
    for (let i = 0; i < this.numTrees; i++) {
      // Random subsample
      const subsample = this.randomSample(features, sampleSize);
      
      // Build isolation tree
      const tree = this.buildTree(subsample, 0, this.maxDepth);
      this.trees.push(tree);
    }
  }

  private buildTree(data: number[][], depth: number, maxDepth: number): IsolationTree {
    // Base cases
    if (data.length <= 1 || depth >= maxDepth) {
      return {
        isLeaf: true,
        size: data.length,
        depth: depth
      };
    }
    
    // Random feature and split point
    const numFeatures = data[0].length;
    const splitFeature = Math.floor(Math.random() * numFeatures);
    
    const featureValues = data.map(point => point[splitFeature]);
    const minValue = Math.min(...featureValues);
    const maxValue = Math.max(...featureValues);
    
    if (minValue === maxValue) {
      return {
        isLeaf: true,
        size: data.length,
        depth: depth
      };
    }
    
    const splitValue = minValue + Math.random() * (maxValue - minValue);
    
    // Split data
    const leftData = data.filter(point => point[splitFeature] < splitValue);
    const rightData = data.filter(point => point[splitFeature] >= splitValue);
    
    return {
      isLeaf: false,
      splitFeature,
      splitValue,
      left: this.buildTree(leftData, depth + 1, maxDepth),
      right: this.buildTree(rightData, depth + 1, maxDepth),
      size: data.length,
      depth: depth
    };
  }

  private calculateAnomalyScore(point: number[], datasetSize: number): number {
    // Average path length across all trees
    const pathLengths = this.trees.map(tree => this.getPathLength(point, tree));
    const avgPathLength = pathLengths.reduce((sum, length) => sum + length, 0) / pathLengths.length;
    
    // Normalize using expected path length for dataset size
    const expectedPathLength = this.expectedPathLength(datasetSize);
    
    // Anomaly score: 2^(-avgPathLength / expectedPathLength)
    // Score close to 1 = anomaly, close to 0 = normal
    return Math.pow(2, -avgPathLength / expectedPathLength);
  }

  private getPathLength(point: number[], tree: IsolationTree): number {
    if (tree.isLeaf) {
      // Estimate path length for leaf node
      return tree.depth + this.expectedPathLength(tree.size);
    }
    
    if (point[tree.splitFeature!] < tree.splitValue!) {
      return this.getPathLength(point, tree.left!);
    } else {
      return this.getPathLength(point, tree.right!);
    }
  }

  private expectedPathLength(n: number): number {
    if (n <= 1) return 0;
    if (n === 2) return 1;
    
    // Harmonic number approximation: H(n-1) ≈ ln(n-1) + γ
    const gamma = 0.5772156649; // Euler-Mascheroni constant
    return 2 * (Math.log(n - 1) + gamma) - (2 * (n - 1)) / n;
  }

  private randomSample(data: number[][], sampleSize: number): number[][] {
    const shuffled = [...data];
    
    // Fisher-Yates shuffle
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    return shuffled.slice(0, sampleSize);
  }

  dispose(): void {
    this.trees = [];
  }
}

// Isolation tree structure
interface IsolationTree {
  isLeaf: boolean;
  splitFeature?: number;
  splitValue?: number;
  left?: IsolationTree;
  right?: IsolationTree;
  size: number;
  depth: number;
}

export default CognitivePatternRecognition;