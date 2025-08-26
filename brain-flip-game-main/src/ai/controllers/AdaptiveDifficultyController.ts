/**
 * Ultimate Brain Flip Experience - Adaptive Difficulty Controller
 * Reinforcement learning model for dynamic difficulty adjustment and flow state optimization
 */

import * as tf from '@tensorflow/tfjs';
import { CognitiveProfile, FlowStateData, CognitiveInsights } from '@/types/cognitive';
import { InstructionResponse, GameSession } from '@/types/game';

// Difficulty adjustment actions
enum DifficultyAction {
  DECREASE_MAJOR = -0.2,
  DECREASE_MINOR = -0.1,
  MAINTAIN = 0.0,
  INCREASE_MINOR = 0.1,
  INCREASE_MAJOR = 0.2
}

// Flow state indicators
interface FlowStateIndicators {
  challengeSkillBalance: number; // 0-1 scale
  clearGoals: number;
  immediateFeeback: number;
  actionAwarenessBalance: number;
  concentrationOnTask: number;
  senseOfControl: number;
  lossOfSelfConsciousness: number;
  timeTransformation: number;
  autotelic: number;
  overallFlowScore: number;
}

// Game state for RL model
interface GameState {
  currentDifficulty: number;
  recentAccuracy: number;
  averageReactionTime: number;
  streakLength: number;
  cognitiveLoad: number;
  fatigueLevel: number;
  sessionProgress: number;
  timeInSession: number;
  errorRate: number;
  improvementRate: number;
  flowStateScore: number;
  engagementLevel: number;
}

// Reward calculation parameters
interface RewardParameters {
  flowStateWeight: number;
  engagementWeight: number;
  learningProgressWeight: number;
  frustrationPenalty: number;
  boredomPenalty: number;
  optimalChallengeBonus: number;
}

// RL model configuration
interface RLModelConfig {
  stateSize: number;
  actionSize: number;
  hiddenLayers: number[];
  learningRate: number;
  discountFactor: number;
  explorationRate: number;
  explorationDecay: number;
  minExplorationRate: number;
  memorySize: number;
  batchSize: number;
  targetUpdateFrequency: number;
}

// Experience replay memory
interface Experience {
  state: number[];
  action: number;
  reward: number;
  nextState: number[];
  done: boolean;
  timestamp: number;
}

export class AdaptiveDifficultyController {
  private qNetwork: tf.LayersModel | null = null;
  private targetNetwork: tf.LayersModel | null = null;
  private replayMemory: Experience[] = [];
  private config: RLModelConfig;
  private rewardParams: RewardParameters;
  private flowStateDetector: FlowStateDetector;
  private isInitialized = false;
  private trainingStep = 0;

  constructor() {
    this.config = {
      stateSize: 12, // Number of state features
      actionSize: 5, // Number of difficulty actions
      hiddenLayers: [128, 64, 32],
      learningRate: 0.001,
      discountFactor: 0.95,
      explorationRate: 1.0,
      explorationDecay: 0.995,
      minExplorationRate: 0.01,
      memorySize: 10000,
      batchSize: 32,
      targetUpdateFrequency: 100
    };

    this.rewardParams = {
      flowStateWeight: 0.4,
      engagementWeight: 0.3,
      learningProgressWeight: 0.2,
      frustrationPenalty: -0.5,
      boredomPenalty: -0.3,
      optimalChallengeBonus: 0.2
    };

    this.flowStateDetector = new FlowStateDetector();
  }

  /**
   * Initialize the adaptive difficulty controller
   */
  async initialize(): Promise<void> {
    try {
      console.log('Initializing Adaptive Difficulty Controller...');
      
      await tf.ready();
      
      // Create Q-network and target network
      this.qNetwork = this.createDQNModel();
      this.targetNetwork = this.createDQNModel();
      
      // Initialize target network with same weights as Q-network
      this.updateTargetNetwork();
      
      // Initialize flow state detector
      await this.flowStateDetector.initialize();
      
      // Try to load pre-trained model
      try {
        const loadedModel = await tf.loadLayersModel('/models/adaptive-difficulty/model.json');
        this.qNetwork.dispose();
        this.qNetwork = loadedModel;
        console.log('Loaded pre-trained adaptive difficulty model');
      } catch (error) {
        console.log('No pre-trained model found, using new model');
      }

      this.isInitialized = true;
      console.log('Adaptive Difficulty Controller initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Adaptive Difficulty Controller:', error);
      throw error;
    }
  }  /*
*
   * Get optimal difficulty adjustment based on current game state
   */
  async getOptimalDifficulty(
    currentState: GameState,
    cognitiveProfile: CognitiveProfile,
    recentPerformance: InstructionResponse[]
  ): Promise<{
    newDifficulty: number;
    action: DifficultyAction;
    confidence: number;
    reasoning: string;
    flowStateScore: number;
  }> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Detect current flow state
      const flowState = await this.flowStateDetector.detectFlowState(
        recentPerformance,
        currentState,
        cognitiveProfile
      );

      // Prepare state vector for neural network
      const stateVector = this.prepareStateVector(currentState, flowState);

      // Get Q-values for all actions
      const qValues = this.qNetwork!.predict(tf.tensor2d([stateVector])) as tf.Tensor;
      const qValuesArray = await qValues.data();
      qValues.dispose();

      // Select action (epsilon-greedy for exploration during training)
      let actionIndex: number;
      if (Math.random() < this.config.explorationRate) {
        // Explore: random action
        actionIndex = Math.floor(Math.random() * this.config.actionSize);
      } else {
        // Exploit: best action
        actionIndex = qValuesArray.indexOf(Math.max(...qValuesArray));
      }

      const action = Object.values(DifficultyAction)[actionIndex];
      const newDifficulty = Math.max(0.1, Math.min(1.0, currentState.currentDifficulty + action));
      const confidence = Math.max(...qValuesArray) / (Math.max(...qValuesArray) + Math.min(...qValuesArray));

      // Generate reasoning
      const reasoning = this.generateReasoning(currentState, flowState, action);

      return {
        newDifficulty,
        action,
        confidence,
        reasoning,
        flowStateScore: flowState.overallFlowScore
      };
    } catch (error) {
      console.error('Error getting optimal difficulty:', error);
      return {
        newDifficulty: currentState.currentDifficulty,
        action: DifficultyAction.MAINTAIN,
        confidence: 0.5,
        reasoning: 'Error occurred, maintaining current difficulty',
        flowStateScore: 0.5
      };
    }
  }

  /**
   * Update the model based on performance feedback
   */
  async updateModel(
    previousState: GameState,
    action: DifficultyAction,
    newState: GameState,
    cognitiveProfile: CognitiveProfile,
    sessionEnded: boolean = false
  ): Promise<void> {
    if (!this.isInitialized) return;

    try {
      // Calculate reward based on performance improvement
      const reward = this.calculateReward(previousState, newState, action, sessionEnded);

      // Store experience in replay memory
      const experience: Experience = {
        state: this.prepareStateVector(previousState, await this.flowStateDetector.detectFlowState([], previousState, cognitiveProfile)),
        action: Object.values(DifficultyAction).indexOf(action),
        reward,
        nextState: this.prepareStateVector(newState, await this.flowStateDetector.detectFlowState([], newState, cognitiveProfile)),
        done: sessionEnded,
        timestamp: Date.now()
      };

      this.addExperience(experience);

      // Train the model if we have enough experiences
      if (this.replayMemory.length >= this.config.batchSize) {
        await this.trainModel();
      }

      // Update exploration rate
      this.config.explorationRate = Math.max(
        this.config.minExplorationRate,
        this.config.explorationRate * this.config.explorationDecay
      );

      // Update target network periodically
      if (this.trainingStep % this.config.targetUpdateFrequency === 0) {
        this.updateTargetNetwork();
      }

      this.trainingStep++;
    } catch (error) {
      console.error('Error updating model:', error);
    }
  }  /**
   *
 Create Deep Q-Network model
   */
  private createDQNModel(): tf.LayersModel {
    const model = tf.sequential();

    // Input layer
    model.add(tf.layers.dense({
      inputShape: [this.config.stateSize],
      units: this.config.hiddenLayers[0],
      activation: 'relu',
      kernelInitializer: 'heNormal'
    }));

    // Hidden layers with dropout
    for (let i = 1; i < this.config.hiddenLayers.length; i++) {
      model.add(tf.layers.dropout({ rate: 0.2 }));
      model.add(tf.layers.dense({
        units: this.config.hiddenLayers[i],
        activation: 'relu',
        kernelInitializer: 'heNormal'
      }));
    }

    // Output layer (Q-values for each action)
    model.add(tf.layers.dropout({ rate: 0.1 }));
    model.add(tf.layers.dense({
      units: this.config.actionSize,
      activation: 'linear'
    }));

    model.compile({
      optimizer: tf.train.adam(this.config.learningRate),
      loss: 'meanSquaredError'
    });

    return model;
  }

  /**
   * Prepare state vector for neural network input
   */
  private prepareStateVector(gameState: GameState, flowState: FlowStateIndicators): number[] {
    return [
      gameState.currentDifficulty,
      gameState.recentAccuracy,
      gameState.averageReactionTime / 2000, // Normalize to ~0-1
      gameState.streakLength / 20, // Normalize to ~0-1
      gameState.cognitiveLoad,
      gameState.fatigueLevel,
      gameState.sessionProgress,
      gameState.timeInSession / 3600, // Normalize to hours
      gameState.errorRate,
      gameState.improvementRate,
      flowState.overallFlowScore,
      gameState.engagementLevel
    ];
  }

  /**
   * Calculate reward based on performance and flow state
   */
  private calculateReward(
    previousState: GameState,
    newState: GameState,
    action: DifficultyAction,
    sessionEnded: boolean
  ): number {
    let reward = 0;

    // Flow state reward (primary objective)
    const flowImprovement = newState.flowStateScore - previousState.flowStateScore;
    reward += flowImprovement * this.rewardParams.flowStateWeight;

    // Engagement reward
    const engagementImprovement = newState.engagementLevel - previousState.engagementLevel;
    reward += engagementImprovement * this.rewardParams.engagementWeight;

    // Learning progress reward
    const learningProgress = newState.improvementRate;
    reward += learningProgress * this.rewardParams.learningProgressWeight;

    // Penalty for high frustration (low accuracy + high difficulty)
    if (newState.recentAccuracy < 0.4 && newState.currentDifficulty > 0.7) {
      reward += this.rewardParams.frustrationPenalty;
    }

    // Penalty for boredom (high accuracy + low difficulty)
    if (newState.recentAccuracy > 0.9 && newState.currentDifficulty < 0.3) {
      reward += this.rewardParams.boredomPenalty;
    }

    // Bonus for optimal challenge (accuracy around 70-80%)
    if (newState.recentAccuracy >= 0.7 && newState.recentAccuracy <= 0.8) {
      reward += this.rewardParams.optimalChallengeBonus;
    }

    // Bonus for maintaining flow state
    if (newState.flowStateScore > 0.7) {
      reward += 0.1;
    }

    // Penalty for session ending too early (unless natural completion)
    if (sessionEnded && newState.sessionProgress < 0.5) {
      reward -= 0.2;
    }

    return Math.max(-1, Math.min(1, reward)); // Clamp reward to [-1, 1]
  }  
/**
   * Add experience to replay memory
   */
  private addExperience(experience: Experience): void {
    this.replayMemory.push(experience);
    
    // Remove oldest experiences if memory is full
    if (this.replayMemory.length > this.config.memorySize) {
      this.replayMemory.shift();
    }
  }

  /**
   * Train the model using experience replay
   */
  private async trainModel(): Promise<void> {
    if (this.replayMemory.length < this.config.batchSize) return;

    // Sample random batch from replay memory
    const batch = this.sampleBatch();
    
    const states = batch.map(exp => exp.state);
    const nextStates = batch.map(exp => exp.nextState);
    
    // Get current Q-values
    const currentQValues = this.qNetwork!.predict(tf.tensor2d(states)) as tf.Tensor;
    
    // Get next Q-values from target network
    const nextQValues = this.targetNetwork!.predict(tf.tensor2d(nextStates)) as tf.Tensor;
    
    const currentQValuesArray = await currentQValues.data();
    const nextQValuesArray = await nextQValues.data();
    
    // Calculate target Q-values
    const targetQValues = new Float32Array(currentQValuesArray);
    
    for (let i = 0; i < batch.length; i++) {
      const experience = batch[i];
      const targetQ = experience.done 
        ? experience.reward
        : experience.reward + this.config.discountFactor * Math.max(...Array.from(nextQValuesArray.slice(i * this.config.actionSize, (i + 1) * this.config.actionSize)));
      
      targetQValues[i * this.config.actionSize + experience.action] = targetQ;
    }
    
    // Train the model
    await this.qNetwork!.fit(
      tf.tensor2d(states),
      tf.tensor2d(Array.from(targetQValues), [batch.length, this.config.actionSize]),
      {
        epochs: 1,
        verbose: 0
      }
    );
    
    // Clean up tensors
    currentQValues.dispose();
    nextQValues.dispose();
  }

  /**
   * Sample random batch from replay memory
   */
  private sampleBatch(): Experience[] {
    const batch: Experience[] = [];
    const memorySize = this.replayMemory.length;
    
    for (let i = 0; i < this.config.batchSize; i++) {
      const randomIndex = Math.floor(Math.random() * memorySize);
      batch.push(this.replayMemory[randomIndex]);
    }
    
    return batch;
  }

  /**
   * Update target network with current network weights
   */
  private updateTargetNetwork(): void {
    if (this.qNetwork && this.targetNetwork) {
      const weights = this.qNetwork.getWeights();
      this.targetNetwork.setWeights(weights);
    }
  }

  /**
   * Generate human-readable reasoning for difficulty adjustment
   */
  private generateReasoning(
    currentState: GameState,
    flowState: FlowStateIndicators,
    action: DifficultyAction
  ): string {
    const reasons: string[] = [];

    // Flow state analysis
    if (flowState.overallFlowScore > 0.8) {
      reasons.push('Player is in optimal flow state');
    } else if (flowState.overallFlowScore < 0.4) {
      reasons.push('Player is not in flow state');
    }

    // Performance analysis
    if (currentState.recentAccuracy > 0.85) {
      reasons.push('High accuracy indicates readiness for more challenge');
    } else if (currentState.recentAccuracy < 0.6) {
      reasons.push('Low accuracy suggests need for easier content');
    }

    // Cognitive load analysis
    if (currentState.cognitiveLoad > 0.8) {
      reasons.push('High cognitive load detected');
    } else if (currentState.cognitiveLoad < 0.4) {
      reasons.push('Low cognitive load suggests room for more complexity');
    }

    // Action explanation
    switch (action) {
      case DifficultyAction.INCREASE_MAJOR:
        reasons.push('Significantly increasing difficulty to maintain engagement');
        break;
      case DifficultyAction.INCREASE_MINOR:
        reasons.push('Slightly increasing difficulty for optimal challenge');
        break;
      case DifficultyAction.MAINTAIN:
        reasons.push('Maintaining current difficulty level');
        break;
      case DifficultyAction.DECREASE_MINOR:
        reasons.push('Slightly reducing difficulty to prevent frustration');
        break;
      case DifficultyAction.DECREASE_MAJOR:
        reasons.push('Significantly reducing difficulty to restore confidence');
        break;
    }

    return reasons.join('; ');
  }

  /**
   * Save the trained model
   */
  async saveModel(): Promise<void> {
    if (this.qNetwork) {
      await this.qNetwork.save('localstorage://adaptive-difficulty-model');
      console.log('Adaptive difficulty model saved');
    }
  }

  /**
   * Get model performance metrics
   */
  getModelMetrics(): {
    trainingSteps: number;
    explorationRate: number;
    memorySize: number;
    averageReward: number;
  } {
    const recentRewards = this.replayMemory.slice(-100).map(exp => exp.reward);
    const averageReward = recentRewards.length > 0 
      ? recentRewards.reduce((sum, reward) => sum + reward, 0) / recentRewards.length 
      : 0;

    return {
      trainingSteps: this.trainingStep,
      explorationRate: this.config.explorationRate,
      memorySize: this.replayMemory.length,
      averageReward
    };
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    if (this.qNetwork) {
      this.qNetwork.dispose();
    }
    if (this.targetNetwork) {
      this.targetNetwork.dispose();
    }
    this.replayMemory = [];
    this.flowStateDetector.dispose();
  }
}/**
 * 
Flow State Detection System
 * Detects and measures flow state indicators in real-time
 */
class FlowStateDetector {
  private flowModel: tf.LayersModel | null = null;
  private isInitialized = false;

  async initialize(): Promise<void> {
    try {
      // Create flow state detection model
      this.flowModel = this.createFlowModel();
      
      // Try to load pre-trained flow model
      try {
        const loadedModel = await tf.loadLayersModel('/models/flow-state/model.json');
        this.flowModel.dispose();
        this.flowModel = loadedModel;
        console.log('Loaded pre-trained flow state model');
      } catch (error) {
        console.log('No pre-trained flow model found, using new model');
      }

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize flow state detector:', error);
      throw error;
    }
  }

  /**
   * Detect current flow state based on performance and game state
   */
  async detectFlowState(
    recentPerformance: InstructionResponse[],
    gameState: GameState,
    cognitiveProfile: CognitiveProfile
  ): Promise<FlowStateIndicators> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Calculate individual flow indicators
      const challengeSkillBalance = this.calculateChallengeSkillBalance(gameState, cognitiveProfile);
      const clearGoals = this.calculateClearGoals(gameState);
      const immediateFeeback = this.calculateImmediateFeedback(recentPerformance);
      const actionAwarenessBalance = this.calculateActionAwarenessBalance(recentPerformance);
      const concentrationOnTask = this.calculateConcentration(recentPerformance, gameState);
      const senseOfControl = this.calculateSenseOfControl(gameState);
      const lossOfSelfConsciousness = this.calculateLossOfSelfConsciousness(gameState);
      const timeTransformation = this.calculateTimeTransformation(gameState);
      const autotelic = this.calculateAutotelicExperience(gameState);

      // Use neural network to calculate overall flow score
      const flowFeatures = [
        challengeSkillBalance,
        clearGoals,
        immediateFeeback,
        actionAwarenessBalance,
        concentrationOnTask,
        senseOfControl,
        lossOfSelfConsciousness,
        timeTransformation,
        autotelic
      ];

      const flowPrediction = this.flowModel!.predict(tf.tensor2d([flowFeatures])) as tf.Tensor;
      const overallFlowScore = (await flowPrediction.data())[0];
      flowPrediction.dispose();

      return {
        challengeSkillBalance,
        clearGoals,
        immediateFeeback,
        actionAwarenessBalance,
        concentrationOnTask,
        senseOfControl,
        lossOfSelfConsciousness,
        timeTransformation,
        autotelic,
        overallFlowScore: Math.max(0, Math.min(1, overallFlowScore))
      };
    } catch (error) {
      console.error('Error detecting flow state:', error);
      return this.getDefaultFlowState();
    }
  }

  private createFlowModel(): tf.LayersModel {
    const model = tf.sequential();

    model.add(tf.layers.dense({
      inputShape: [9], // 9 flow indicators
      units: 32,
      activation: 'relu'
    }));

    model.add(tf.layers.dropout({ rate: 0.2 }));
    
    model.add(tf.layers.dense({
      units: 16,
      activation: 'relu'
    }));

    model.add(tf.layers.dense({
      units: 1,
      activation: 'sigmoid' // Output between 0 and 1
    }));

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError'
    });

    return model;
  }

  // Flow state calculation methods
  private calculateChallengeSkillBalance(gameState: GameState, profile: CognitiveProfile): number {
    // Optimal challenge-skill balance is around 0.7-0.8 difficulty with good performance
    const optimalDifficulty = 0.75;
    const difficultyBalance = 1 - Math.abs(gameState.currentDifficulty - optimalDifficulty) / optimalDifficulty;
    const performanceBalance = gameState.recentAccuracy;
    return (difficultyBalance + performanceBalance) / 2;
  }

  private calculateClearGoals(gameState: GameState): number {
    // Clear goals indicated by consistent performance and low error rate
    return Math.max(0, 1 - gameState.errorRate);
  }

  private calculateImmediateFeedback(recentPerformance: InstructionResponse[]): number {
    if (recentPerformance.length === 0) return 0.5;
    
    // Immediate feedback quality based on reaction time consistency
    const reactionTimes = recentPerformance.slice(-10).map(r => r.reactionTime);
    const avgReactionTime = reactionTimes.reduce((sum, rt) => sum + rt, 0) / reactionTimes.length;
    const variance = reactionTimes.reduce((sum, rt) => sum + Math.pow(rt - avgReactionTime, 2), 0) / reactionTimes.length;
    const consistency = Math.max(0, 1 - variance / (avgReactionTime * avgReactionTime));
    
    return consistency;
  }

  private calculateActionAwarenessBalance(recentPerformance: InstructionResponse[]): number {
    if (recentPerformance.length === 0) return 0.5;
    
    // Balance between automatic responses and conscious control
    const recentAccuracy = recentPerformance.slice(-5).filter(r => r.isCorrect).length / Math.min(5, recentPerformance.length);
    const avgReactionTime = recentPerformance.slice(-5).reduce((sum, r) => sum + r.reactionTime, 0) / Math.min(5, recentPerformance.length);
    
    // Optimal balance: good accuracy with moderate reaction times (not too fast, not too slow)
    const reactionTimeBalance = avgReactionTime > 300 && avgReactionTime < 1500 ? 1 : 0.5;
    
    return (recentAccuracy + reactionTimeBalance) / 2;
  }

  private calculateConcentration(recentPerformance: InstructionResponse[], gameState: GameState): number {
    // Concentration indicated by sustained performance and low distraction
    const performanceConsistency = 1 - gameState.errorRate;
    const engagementLevel = gameState.engagementLevel;
    
    return (performanceConsistency + engagementLevel) / 2;
  }

  private calculateSenseOfControl(gameState: GameState): number {
    // Sense of control related to accuracy and manageable difficulty
    const controlFromAccuracy = gameState.recentAccuracy;
    const controlFromDifficulty = gameState.currentDifficulty < 0.9 ? 1 : 0.5;
    
    return (controlFromAccuracy + controlFromDifficulty) / 2;
  }

  private calculateLossOfSelfConsciousness(gameState: GameState): number {
    // Loss of self-consciousness indicated by sustained engagement and flow
    return Math.min(1, gameState.timeInSession / 1800); // Builds over 30 minutes
  }

  private calculateTimeTransformation(gameState: GameState): number {
    // Time transformation in flow state - time seems to pass differently
    const sessionLength = gameState.timeInSession;
    const expectedProgress = sessionLength / 3600; // Expected progress per hour
    const actualProgress = gameState.sessionProgress;
    
    // Time distortion occurs when actual progress differs from expected
    return Math.min(1, Math.abs(actualProgress - expectedProgress) + 0.3);
  }

  private calculateAutotelicExperience(gameState: GameState): number {
    // Intrinsic motivation and enjoyment
    const engagementScore = gameState.engagementLevel;
    const progressSatisfaction = gameState.improvementRate > 0 ? 1 : 0.5;
    
    return (engagementScore + progressSatisfaction) / 2;
  }

  private getDefaultFlowState(): FlowStateIndicators {
    return {
      challengeSkillBalance: 0.5,
      clearGoals: 0.5,
      immediateFeeback: 0.5,
      actionAwarenessBalance: 0.5,
      concentrationOnTask: 0.5,
      senseOfControl: 0.5,
      lossOfSelfConsciousness: 0.5,
      timeTransformation: 0.5,
      autotelic: 0.5,
      overallFlowScore: 0.5
    };
  }

  dispose(): void {
    if (this.flowModel) {
      this.flowModel.dispose();
    }
  }
}

export default AdaptiveDifficultyController;