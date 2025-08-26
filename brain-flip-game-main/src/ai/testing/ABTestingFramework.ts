/**
 * Ultimate Brain Flip Experience - A/B Testing Framework
 * Advanced experimentation platform for personalization strategies
 */

import { CognitiveProfile, PersonalizationData } from '@/types/cognitive';
import { GameSession, InstructionResponse } from '@/types/game';

// Experiment configuration
interface ExperimentConfig {
  id: string;
  name: string;
  description: string;
  hypothesis: string;
  startDate: Date;
  endDate: Date;
  targetMetrics: string[];
  variants: ExperimentVariant[];
  trafficAllocation: TrafficAllocation;
  successCriteria: SuccessCriteria;
  segmentation: UserSegmentation;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
}

// Experiment variant
interface ExperimentVariant {
  id: string;
  name: string;
  description: string;
  trafficPercentage: number;
  configuration: PersonalizationConfiguration;
  isControl: boolean;
}

// Traffic allocation strategy
interface TrafficAllocation {
  strategy: 'random' | 'balanced' | 'weighted' | 'sequential';
  seed?: number;
  constraints?: AllocationConstraint[];
}

// Allocation constraints
interface AllocationConstraint {
  type: 'user_segment' | 'cognitive_profile' | 'performance_level' | 'device_type';
  condition: string;
  allocation: Record<string, number>; // variant_id -> percentage
}

// Success criteria
interface SuccessCriteria {
  primaryMetric: string;
  minimumDetectableEffect: number; // percentage
  statisticalSignificance: number; // alpha level (e.g., 0.05)
  practicalSignificance: number; // minimum practical difference
  minimumSampleSize: number;
  maximumDuration: number; // days
}

// User segmentation for experiments
interface UserSegmentation {
  segments: UserSegment[];
  strategy: 'include' | 'exclude' | 'stratify';
}

interface UserSegment {
  id: string;
  name: string;
  criteria: SegmentCriteria[];
  expectedSize: number;
}

interface SegmentCriteria {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'in_range';
  value: any;
}

// Personalization configuration for variants
interface PersonalizationConfiguration {
  difficultyAdjustmentStrategy: string;
  contentRecommendationAlgorithm: string;
  timingOptimizationEnabled: boolean;
  motivationalTriggerFrequency: number;
  feedbackStyle: string;
  adaptationRate: number;
  customParameters: Record<string, any>;
}

// Experiment results
interface ExperimentResults {
  experimentId: string;
  status: 'running' | 'completed' | 'inconclusive';
  startDate: Date;
  endDate?: Date;
  totalParticipants: number;
  variantResults: VariantResults[];
  statisticalSignificance: StatisticalTest;
  practicalSignificance: boolean;
  recommendations: string[];
  confidence: number;
}

interface VariantResults {
  variantId: string;
  sampleSize: number;
  conversionRate: number;
  averageValue: number;
  standardError: number;
  confidenceInterval: [number, number];
  metrics: Record<string, MetricResult>;
}

interface MetricResult {
  value: number;
  standardError: number;
  confidenceInterval: [number, number];
  improvement: number; // vs control
  pValue: number;
}

interface StatisticalTest {
  testType: 'ttest' | 'chi_square' | 'mann_whitney';
  pValue: number;
  testStatistic: number;
  degreesOfFreedom?: number;
  isSignificant: boolean;
  alpha: number;
  power: number;
}

// Experiment assignment tracking
interface ExperimentAssignment {
  userId: string;
  experimentId: string;
  variantId: string;
  assignedAt: Date;
  exposureEvents: ExposureEvent[];
  conversionEvents: ConversionEvent[];
}

// Event tracking
interface ExposureEvent {
  timestamp: Date;
  context: Record<string, any>;
}

interface ConversionEvent {
  timestamp: Date;
  metric: string;
  value: number;
  context: Record<string, any>;
}
  primaryMetric: string;
  secondaryMetrics: string[];
  minimumDetectableEffect: number;
  statisticalPower: number;
  significanceLevel: number;
  minimumSampleSize: number;
}

// User segmentation
interface UserSegmentation {
  includeNewUsers: boolean;
  includeReturningUsers: boolean;
  cognitiveProfileFilters: string[];
  performanceFilters: PerformanceFilter[];
  demographicFilters: DemographicFilter[];
}

// Performance and demographic filters
interface PerformanceFilter {
  metric: string;
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte' | 'between';
  value: number | [number, number];
}

interface DemographicFilter {
  attribute: string;
  values: string[];
}

// Personalization configuration for variants
interface PersonalizationConfiguration {
  difficultyAdjustmentStrategy: 'aggressive' | 'conservative' | 'adaptive' | 'static';
  flowStateOptimization: boolean;
  realTimePersonalization: boolean;
  cognitiveLoadThreshold: number;
  motivationalStrategy: 'achievement' | 'progress' | 'social' | 'mixed';
  feedbackFrequency: 'immediate' | 'delayed' | 'batch' | 'adaptive';
  customParameters: Record<string, any>;
}

// Experiment assignment
interface ExperimentAssignment {
  userId: string;
  experimentId: string;
  variantId: string;
  assignedAt: Date;
  exposureEvents: ExposureEvent[];
  conversionEvents: ConversionEvent[];
}

// Event tracking
interface ExposureEvent {
  timestamp: Date;
  sessionId: string;
  context: Record<string, any>;
}

interface ConversionEvent {
  timestamp: Date;
  sessionId: string;
  metric: string;
  value: number;
  context: Record<string, any>;
}

// Statistical analysis results
interface ExperimentResults {
  experimentId: string;
  analysisDate: Date;
  variants: VariantResults[];
  overallResults: OverallResults;
  statisticalSignificance: StatisticalSignificance;
  recommendations: string[];
}

interface VariantResults {
  variantId: string;
  sampleSize: number;
  metrics: MetricResults[];
  conversionRate: number;
  confidenceInterval: [number, number];
}

interface MetricResults {
  metric: string;
  mean: number;
  standardDeviation: number;
  confidenceInterval: [number, number];
  percentileDistribution: Record<string, number>;
}

interface OverallResults {
  winner: string | null;
  winnerConfidence: number;
  effectSize: number;
  practicalSignificance: boolean;
}

interface StatisticalSignificance {
  pValue: number;
  isSignificant: boolean;
  powerAnalysis: PowerAnalysis;
}

interface PowerAnalysis {
  achievedPower: number;
  requiredSampleSize: number;
  currentSampleSize: number;
  daysToSignificance: number;
}

export class ABTestingFramework {
  private experiments: Map<string, ExperimentConfig> = new Map();
  private assignments: Map<string, ExperimentAssignment[]> = new Map();
  private exposureEvents: Map<string, ExposureEvent[]> = new Map();
  private conversionEvents: Map<string, ConversionEvent[]> = new Map();

  /**
   * Create a new A/B test experiment
   */
  createExperiment(config: ExperimentConfig): void {
    // Validate experiment configuration
    this.validateExperimentConfig(config);
    
    // Store experiment
    this.experiments.set(config.id, config);
    
    console.log(`Created experiment: ${config.name} (${config.id})`);
  }

  /**
   * Assign user to experiment variant
   */
  assignUserToExperiment(
    userId: string,
    experimentId: string,
    cognitiveProfile: CognitiveProfile,
    userContext: Record<string, any>
  ): ExperimentAssignment | null {
    const experiment = this.experiments.get(experimentId);
    if (!experiment || experiment.status !== 'active') {
      return null;
    }

    // Check if user is eligible for experiment
    if (!this.isUserEligible(userId, experiment, cognitiveProfile, userContext)) {
      return null;
    }

    // Check if user is already assigned
    const existingAssignments = this.assignments.get(userId) || [];
    const existingAssignment = existingAssignments.find(a => a.experimentId === experimentId);
    if (existingAssignment) {
      return existingAssignment;
    }

    // Assign user to variant
    const variantId = this.selectVariant(userId, experiment, cognitiveProfile);
    const assignment: ExperimentAssignment = {
      userId,
      experimentId,
      variantId,
      assignedAt: new Date(),
      exposureEvents: [],
      conversionEvents: []
    };

    // Store assignment
    if (!this.assignments.has(userId)) {
      this.assignments.set(userId, []);
    }
    this.assignments.get(userId)!.push(assignment);

    console.log(`Assigned user ${userId} to variant ${variantId} in experiment ${experimentId}`);
    return assignment;
  }

  /**
   * Get personalization configuration for user based on experiment assignment
   */
  getPersonalizationConfig(
    userId: string,
    defaultConfig: PersonalizationConfiguration
  ): PersonalizationConfiguration {
    const userAssignments = this.assignments.get(userId) || [];
    
    // Find active experiment assignments
    const activeAssignments = userAssignments.filter(assignment => {
      const experiment = this.experiments.get(assignment.experimentId);
      return experiment && experiment.status === 'active';
    });

    if (activeAssignments.length === 0) {
      return defaultConfig;
    }

    // Apply experiment configurations (last one wins if multiple)
    let config = { ...defaultConfig };
    
    for (const assignment of activeAssignments) {
      const experiment = this.experiments.get(assignment.experimentId)!;
      const variant = experiment.variants.find(v => v.id === assignment.variantId);
      
      if (variant) {
        config = { ...config, ...variant.configuration };
      }
    }

    return config;
  }

  /**
   * Track exposure event
   */
  trackExposure(
    userId: string,
    experimentId: string,
    sessionId: string,
    context: Record<string, any> = {}
  ): void {
    const assignment = this.getUserAssignment(userId, experimentId);
    if (!assignment) return;

    const exposureEvent: ExposureEvent = {
      timestamp: new Date(),
      sessionId,
      context
    };

    assignment.exposureEvents.push(exposureEvent);

    // Also store in separate map for analysis
    const key = `${experimentId}_${assignment.variantId}`;
    if (!this.exposureEvents.has(key)) {
      this.exposureEvents.set(key, []);
    }
    this.exposureEvents.get(key)!.push(exposureEvent);
  }

  /**
   * Track conversion event
   */
  trackConversion(
    userId: string,
    experimentId: string,
    sessionId: string,
    metric: string,
    value: number,
    context: Record<string, any> = {}
  ): void {
    const assignment = this.getUserAssignment(userId, experimentId);
    if (!assignment) return;

    const conversionEvent: ConversionEvent = {
      timestamp: new Date(),
      sessionId,
      metric,
      value,
      context
    };

    assignment.conversionEvents.push(conversionEvent);

    // Also store in separate map for analysis
    const key = `${experimentId}_${assignment.variantId}`;
    if (!this.conversionEvents.has(key)) {
      this.conversionEvents.set(key, []);
    }
    this.conversionEvents.get(key)!.push(conversionEvent);
  }

  /**
   * Analyze experiment results
   */
  analyzeExperiment(experimentId: string): ExperimentResults | null {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) return null;

    const variantResults: VariantResults[] = [];
    
    // Analyze each variant
    for (const variant of experiment.variants) {
      const key = `${experimentId}_${variant.id}`;
      const exposures = this.exposureEvents.get(key) || [];
      const conversions = this.conversionEvents.get(key) || [];
      
      const sampleSize = exposures.length;
      const conversionRate = conversions.length / Math.max(1, sampleSize);
      
      // Calculate metrics
      const metrics: MetricResults[] = [];
      for (const targetMetric of experiment.targetMetrics) {
        const metricConversions = conversions.filter(c => c.metric === targetMetric);
        const values = metricConversions.map(c => c.value);
        
        if (values.length > 0) {
          const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
          const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
          const standardDeviation = Math.sqrt(variance);
          
          // Calculate confidence interval (95%)
          const marginOfError = 1.96 * (standardDeviation / Math.sqrt(values.length));
          const confidenceInterval: [number, number] = [mean - marginOfError, mean + marginOfError];
          
          // Calculate percentiles
          const sortedValues = [...values].sort((a, b) => a - b);
          const percentileDistribution = {
            p25: this.calculatePercentile(sortedValues, 0.25),
            p50: this.calculatePercentile(sortedValues, 0.50),
            p75: this.calculatePercentile(sortedValues, 0.75),
            p90: this.calculatePercentile(sortedValues, 0.90),
            p95: this.calculatePercentile(sortedValues, 0.95)
          };
          
          metrics.push({
            metric: targetMetric,
            mean,
            standardDeviation,
            confidenceInterval,
            percentileDistribution
          });
        }
      }
      
      // Calculate variant confidence interval
      const marginOfError = 1.96 * Math.sqrt((conversionRate * (1 - conversionRate)) / sampleSize);
      const variantConfidenceInterval: [number, number] = [
        Math.max(0, conversionRate - marginOfError),
        Math.min(1, conversionRate + marginOfError)
      ];
      
      variantResults.push({
        variantId: variant.id,
        sampleSize,
        metrics,
        conversionRate,
        confidenceInterval: variantConfidenceInterval
      });
    }
    
    // Determine winner and statistical significance
    const controlVariant = variantResults.find(v => 
      experiment.variants.find(variant => variant.id === v.variantId)?.isControl
    );
    
    let winner: string | null = null;
    let winnerConfidence = 0;
    let effectSize = 0;
    let pValue = 1;
    
    if (controlVariant && variantResults.length > 1) {
      // Find best performing variant
      const bestVariant = variantResults.reduce((best, current) => 
        current.conversionRate > best.conversionRate ? current : best
      );
      
      if (bestVariant.variantId !== controlVariant.variantId) {
        winner = bestVariant.variantId;
        effectSize = (bestVariant.conversionRate - controlVariant.conversionRate) / controlVariant.conversionRate;
        
        // Simple t-test approximation
        const pooledStdError = Math.sqrt(
          (controlVariant.conversionRate * (1 - controlVariant.conversionRate)) / controlVariant.sampleSize +
          (bestVariant.conversionRate * (1 - bestVariant.conversionRate)) / bestVariant.sampleSize
        );
        
        const tStat = Math.abs(bestVariant.conversionRate - controlVariant.conversionRate) / pooledStdError;
        pValue = 2 * (1 - this.normalCDF(tStat)); // Two-tailed test
        winnerConfidence = 1 - pValue;
      }
    }
    
    const isSignificant = pValue < experiment.successCriteria.significanceLevel;
    const practicalSignificance = Math.abs(effectSize) >= experiment.successCriteria.minimumDetectableEffect;
    
    // Power analysis
    const totalSampleSize = variantResults.reduce((sum, v) => sum + v.sampleSize, 0);
    const achievedPower = this.calculatePower(effectSize, totalSampleSize, experiment.successCriteria.significanceLevel);
    const daysToSignificance = this.estimateDaysToSignificance(experiment, totalSampleSize);
    
    const results: ExperimentResults = {
      experimentId,
      analysisDate: new Date(),
      variants: variantResults,
      overallResults: {
        winner,
        winnerConfidence,
        effectSize,
        practicalSignificance
      },
      statisticalSignificance: {
        pValue,
        isSignificant,
        powerAnalysis: {
          achievedPower,
          requiredSampleSize: experiment.successCriteria.minimumSampleSize,
          currentSampleSize: totalSampleSize,
          daysToSignificance
        }
      },
      recommendations: this.generateRecommendations(experiment, variantResults, isSignificant, practicalSignificance)
    };
    
    return results;
  }

  // Helper methods
  private validateExperimentConfig(config: ExperimentConfig): void {
    if (!config.id || !config.name) {
      throw new Error('Experiment must have id and name');
    }
    
    if (config.variants.length < 2) {
      throw new Error('Experiment must have at least 2 variants');
    }
    
    const totalTraffic = config.variants.reduce((sum, v) => sum + v.trafficPercentage, 0);
    if (Math.abs(totalTraffic - 100) > 0.01) {
      throw new Error('Variant traffic percentages must sum to 100%');
    }
    
    const controlVariants = config.variants.filter(v => v.isControl);
    if (controlVariants.length !== 1) {
      throw new Error('Experiment must have exactly one control variant');
    }
  }

  private isUserEligible(
    userId: string,
    experiment: ExperimentConfig,
    cognitiveProfile: CognitiveProfile,
    userContext: Record<string, any>
  ): boolean {
    const segmentation = experiment.segmentation;
    
    // Check cognitive profile filters
    if (segmentation.cognitiveProfileFilters.length > 0) {
      const hasMatchingProfile = segmentation.cognitiveProfileFilters.some(filter => {
        // Implement cognitive profile matching logic
        return true; // Simplified for now
      });
      
      if (!hasMatchingProfile) return false;
    }
    
    // Check performance filters
    for (const filter of segmentation.performanceFilters) {
      const userValue = userContext[filter.metric];
      if (userValue === undefined) continue;
      
      const passes = this.evaluateFilter(userValue, filter.operator, filter.value);
      if (!passes) return false;
    }
    
    return true;
  }

  private selectVariant(
    userId: string,
    experiment: ExperimentConfig,
    cognitiveProfile: CognitiveProfile
  ): string {
    // Use deterministic hash-based assignment for consistency
    const hash = this.hashUserId(userId + experiment.id);
    const random = hash / 0xFFFFFFFF; // Normalize to 0-1
    
    let cumulativePercentage = 0;
    for (const variant of experiment.variants) {
      cumulativePercentage += variant.trafficPercentage / 100;
      if (random <= cumulativePercentage) {
        return variant.id;
      }
    }
    
    // Fallback to control variant
    return experiment.variants.find(v => v.isControl)!.id;
  }

  private hashUserId(input: string): number {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  private getUserAssignment(userId: string, experimentId: string): ExperimentAssignment | null {
    const userAssignments = this.assignments.get(userId) || [];
    return userAssignments.find(a => a.experimentId === experimentId) || null;
  }

  private evaluateFilter(value: number, operator: string, filterValue: number | [number, number]): boolean {
    switch (operator) {
      case 'gt': return value > (filterValue as number);
      case 'lt': return value < (filterValue as number);
      case 'eq': return value === (filterValue as number);
      case 'gte': return value >= (filterValue as number);
      case 'lte': return value <= (filterValue as number);
      case 'between': 
        const [min, max] = filterValue as [number, number];
        return value >= min && value <= max;
      default: return true;
    }
  }

  private calculatePercentile(sortedValues: number[], percentile: number): number {
    const index = percentile * (sortedValues.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index - lower;
    
    if (lower === upper) {
      return sortedValues[lower];
    }
    
    return sortedValues[lower] * (1 - weight) + sortedValues[upper] * weight;
  }

  private normalCDF(x: number): number {
    // Approximation of normal cumulative distribution function
    return 0.5 * (1 + this.erf(x / Math.sqrt(2)));
  }

  private erf(x: number): number {
    // Approximation of error function
    const a1 =  0.254829592;
    const a2 = -0.284496736;
    const a3 =  1.421413741;
    const a4 = -1.453152027;
    const a5 =  1.061405429;
    const p  =  0.3275911;

    const sign = x >= 0 ? 1 : -1;
    x = Math.abs(x);

    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return sign * y;
  }

  private calculatePower(effectSize: number, sampleSize: number, alpha: number): number {
    // Simplified power calculation
    const zAlpha = this.normalInverse(1 - alpha / 2);
    const zBeta = Math.abs(effectSize) * Math.sqrt(sampleSize / 2) - zAlpha;
    return this.normalCDF(zBeta);
  }

  private normalInverse(p: number): number {
    // Approximation of inverse normal distribution
    if (p <= 0 || p >= 1) {
      throw new Error('Probability must be between 0 and 1');
    }
    
    // Beasley-Springer-Moro algorithm approximation
    const a = [0, -3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02, 1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00];
    const b = [0, -5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02, 6.680131188771972e+01, -1.328068155288572e+01];
    const c = [0, -7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00, -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00];
    const d = [0, 7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00, 3.754408661907416e+00];

    const pLow = 0.02425;
    const pHigh = 1 - pLow;
    
    let q: number, r: number, x: number;
    
    if (p < pLow) {
      q = Math.sqrt(-2 * Math.log(p));
      x = (((((c[1] * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) * q + c[6]) / ((((d[1] * q + d[2]) * q + d[3]) * q + d[4]) * q + 1);
    } else if (p <= pHigh) {
      q = p - 0.5;
      r = q * q;
      x = (((((a[1] * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * r + a[6]) * q / (((((b[1] * r + b[2]) * r + b[3]) * r + b[4]) * r + b[5]) * r + 1);
    } else {
      q = Math.sqrt(-2 * Math.log(1 - p));
      x = -(((((c[1] * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) * q + c[6]) / ((((d[1] * q + d[2]) * q + d[3]) * q + d[4]) * q + 1);
    }
    
    return x;
  }

  private estimateDaysToSignificance(experiment: ExperimentConfig, currentSampleSize: number): number {
    const requiredSampleSize = experiment.successCriteria.minimumSampleSize;
    if (currentSampleSize >= requiredSampleSize) return 0;
    
    const remainingSamples = requiredSampleSize - currentSampleSize;
    const daysRunning = Math.max(1, (Date.now() - experiment.startDate.getTime()) / (1000 * 60 * 60 * 24));
    const samplesPerDay = currentSampleSize / daysRunning;
    
    return Math.ceil(remainingSamples / Math.max(1, samplesPerDay));
  }

  private generateRecommendations(
    experiment: ExperimentConfig,
    variantResults: VariantResults[],
    isSignificant: boolean,
    practicalSignificance: boolean
  ): string[] {
    const recommendations: string[] = [];
    
    if (!isSignificant) {
      recommendations.push('Results are not statistically significant. Continue running the experiment or increase sample size.');
    }
    
    if (isSignificant && !practicalSignificance) {
      recommendations.push('Results are statistically significant but may not be practically significant. Consider the business impact.');
    }
    
    if (isSignificant && practicalSignificance) {
      const bestVariant = variantResults.reduce((best, current) => 
        current.conversionRate > best.conversionRate ? current : best
      );
      recommendations.push(`Implement variant ${bestVariant.variantId} as it shows significant improvement.`);
    }
    
    // Check for low sample sizes
    const lowSampleVariants = variantResults.filter(v => v.sampleSize < 100);
    if (lowSampleVariants.length > 0) {
      recommendations.push('Some variants have low sample sizes. Consider running the experiment longer for more reliable results.');
    }
    
    return recommendations;
  }
}

export default ABTestingFramework;