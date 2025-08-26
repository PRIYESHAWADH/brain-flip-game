/**
 * Cognitive Types for Ultimate Brain Flip Experience
 * Complete type definitions for AI-powered cognitive analysis
 */

// Core cognitive abilities
export enum CognitiveAbility {
  PROCESSING_SPEED = 'processing_speed',
  WORKING_MEMORY = 'working_memory',
  ATTENTION_SPAN = 'attention_span',
  COGNITIVE_FLEXIBILITY = 'cognitive_flexibility',
  PATTERN_RECOGNITION = 'pattern_recognition',
  VISUAL_PROCESSING = 'visual_processing',
  AUDITORY_PROCESSING = 'auditory_processing',
  EXECUTIVE_FUNCTION = 'executive_function',
  INHIBITORY_CONTROL = 'inhibitory_control',
  TASK_SWITCHING = 'task_switching'
}

// Learning styles
export type LearningStyle = 'visual' | 'auditory' | 'kinesthetic' | 'mixed';

// Personality profile for cognitive training
export interface PersonalityProfile {
  riskTolerance: number; // 0-1 scale
  persistenceLevel: number; // 0-1 scale
  competitiveness: number; // 0-1 scale
  socialEngagement: number; // 0-1 scale
}

// Flow state indicators
export interface FlowStateIndicators {
  averageFlowDuration: number; // in seconds
  flowTriggers: string[]; // conditions that trigger flow state
  optimalChallengeLevel: number; // 0-1 scale
  attentionSpan: number; // in seconds
}

// Comprehensive cognitive profile
export interface CognitiveProfile {
  playerId: string;
  cognitiveStrengths: CognitiveAbility[];
  weaknessAreas: CognitiveAbility[];
  learningStyle: LearningStyle;
  optimalDifficultyCurve: number[]; // progression of optimal difficulty levels
  flowStateIndicators: FlowStateIndicators;
  personalityTraits: PersonalityProfile;
  lastAnalysisTimestamp: number;
  confidenceScore: number; // how confident we are in this profile (0-1)
  adaptationHistory: AdaptationEvent[];
}

// Adaptation events for tracking profile changes
export interface AdaptationEvent {
  timestamp: number;
  trigger: string; // what caused the adaptation
  changes: {
    property: string;
    oldValue: any;
    newValue: any;
  }[];
  performanceImpact: number; // -1 to 1, how much this helped/hurt performance
}

// Cognitive load assessment
export interface CognitiveLoadAssessment {
  overallLoad: number; // 0-1 scale
  memoryLoad: number;
  attentionLoad: number;
  processingLoad: number;
  recommendations: string[];
  timestamp: number;
}

// Learning progression tracking
export interface LearningProgression {
  skill: CognitiveAbility;
  currentLevel: number; // 0-100 scale
  progressRate: number; // improvement per session
  plateauIndicator: number; // 0-1, how likely user is plateauing
  nextMilestone: {
    level: number;
    estimatedSessionsToReach: number;
    requiredFocus: CognitiveAbility[];
  };
}

// Cognitive training session analysis
export interface CognitiveSessionAnalysis {
  sessionId: string;
  cognitiveLoadProgression: number[]; // load over time during session
  attentionLapses: {
    timestamp: number;
    duration: number;
    severity: number;
  }[];
  flowStateIntervals: {
    startTime: number;
    endTime: number;
    intensity: number;
  }[];
  skillUtilization: Record<CognitiveAbility, number>; // how much each skill was used
  fatigueIndicators: {
    reactionTimeIncrease: number;
    accuracyDecrease: number;
    consistencyDecrease: number;
  };
  recommendations: {
    immediate: string[]; // for next session
    shortTerm: string[]; // for next week
    longTerm: string[]; // for next month
  };
}

// Personalized difficulty adjustment
export interface DifficultyAdjustment {
  currentDifficulty: number;
  recommendedDifficulty: number;
  adjustmentReason: string;
  confidence: number;
  expectedPerformanceImprovement: number;
  riskAssessment: {
    tooEasy: number; // probability 0-1
    tooHard: number; // probability 0-1
    optimal: number; // probability 0-1
  };
}

// Cognitive training goals
export interface CognitiveGoal {
  id: string;
  targetSkill: CognitiveAbility;
  currentLevel: number;
  targetLevel: number;
  timeframe: number; // days
  priority: 'low' | 'medium' | 'high' | 'critical';
  strategies: string[];
  milestones: {
    level: number;
    deadline: number;
    completed: boolean;
  }[];
  progress: {
    sessionsCompleted: number;
    averageImprovement: number;
    consistencyScore: number;
  };
}

// Neuroplasticity indicators
export interface NeuroplasticityIndicators {
  adaptationRate: number; // how quickly user adapts to new challenges
  retentionRate: number; // how well user retains learned skills
  transferRate: number; // how well skills transfer between tasks
  recoveryRate: number; // how quickly user recovers from mistakes
  innovationIndex: number; // tendency to find creative solutions
}

// Cognitive bias detection
export interface CognitiveBias {
  type: 'confirmation' | 'anchoring' | 'availability' | 'overconfidence' | 'pattern_seeking';
  strength: number; // 0-1 how strong the bias is
  impact: number; // -1 to 1 how much it affects performance
  examples: string[]; // specific instances where bias was observed
  mitigationStrategies: string[];
}

// Advanced cognitive metrics
export interface AdvancedCognitiveMetrics {
  cognitiveReserve: number; // 0-100, overall cognitive capacity
  mentalAgility: number; // 0-100, ability to switch between tasks
  stressResilience: number; // 0-100, performance under pressure
  learningEfficiency: number; // 0-100, how efficiently user learns
  metacognition: number; // 0-100, awareness of own thinking
  creativityIndex: number; // 0-100, tendency for creative problem solving
  biases: CognitiveBias[];
  neuroplasticity: NeuroplasticityIndicators;
}

// Comprehensive user cognitive state
export interface CognitiveState {
  profile: CognitiveProfile;
  currentSession: CognitiveSessionAnalysis | null;
  recentProgression: LearningProgression[];
  activeGoals: CognitiveGoal[];
  advancedMetrics: AdvancedCognitiveMetrics;
  lastUpdated: number;
}

// Additional types for AI Personalization Service
export interface CognitiveInsights {
  dominantPatterns: string[];
  improvementAreas: string[];
  strengths: string[];
  recommendations: string[];
  confidence: number;
  timestamp: number;
}

export interface PersonalizationData {
  difficultyAdjustments: DifficultyAdjustment[];
  contentRecommendations: ContentRecommendation[];
  timingOptimizations: TimingOptimization[];
  motivationalTriggers: MotivationalTrigger[];
  personalizedFeedback: PersonalizedFeedback[];
  modelVersion: string;
  lastUpdate: number;
}

export interface CognitiveTrainingSession {
  id: string;
  userId: string;
  startTime: number;
  endTime?: number;
  currentInstructionIndex: number;
  totalInstructions: number;
  currentDifficulty: number;
  cognitiveLoad: number;
  fatigueLevel: number;
  flowState: number;
  performance: {
    accuracy: number;
    averageReactionTime: number;
    consistency: number;
  };
}

export interface ContentRecommendation {
  type: 'instruction_type' | 'difficulty' | 'session_length' | 'break_timing';
  recommendation: string;
  reasoning: string;
  confidence: number;
  expectedImpact: number;
  priority: 'low' | 'medium' | 'high';
}

export interface TimingOptimization {
  optimalSessionDuration: number;
  optimalBreakFrequency: number;
  optimalBreakDuration: number;
  bestTimeOfDay: string[];
  reasoning: string;
  confidence: number;
}

export interface MotivationalTrigger {
  trigger: 'achievement' | 'progress' | 'challenge' | 'social' | 'streak';
  message: string;
  timing: 'before_session' | 'during_session' | 'after_session' | 'on_milestone';
  effectiveness: number;
  personalizedElements: string[];
}

export interface PersonalizedFeedback {
  type: 'performance' | 'improvement' | 'encouragement' | 'guidance';
  message: string;
  tone: 'supportive' | 'challenging' | 'informative' | 'celebratory';
  timing: 'immediate' | 'end_of_session' | 'daily_summary' | 'weekly_review';
  personalizationFactors: string[];
}

// Export utility types
export type CognitiveMetricKey = keyof AdvancedCognitiveMetrics;
export type PersonalityTraitKey = keyof PersonalityProfile;
export type FlowIndicatorKey = keyof FlowStateIndicators;