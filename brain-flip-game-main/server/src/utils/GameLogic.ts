import { seededRNG } from './SeededRNG';

export interface GameInstruction {
  id: string;
  type: 'direction' | 'color' | 'action' | 'mixed';
  text: string;
  correctAnswer: string;
  acceptableAnswers?: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit: number;
  points: number;
  category: string;
  tags: string[];
}

export interface PowerUpEffect {
  type: 'boost' | 'shield' | 'time' | 'score' | 'life';
  value: number;
  description: string;
  duration: number;
}

/**
 * Generate a random game instruction based on difficulty
 */
export function generateInstruction(difficulty: 'easy' | 'medium' | 'hard'): GameInstruction {
  const rng = new seededRNG(Date.now());
  
  const instructionType = selectInstructionType(difficulty, rng);
  const instruction = generateInstructionByType(instructionType, difficulty, rng);
  
  return {
    id: `instruction_${Date.now()}_${rng.random().toString(36).substr(2, 9)}`,
    type: instructionType,
    text: instruction.text,
    correctAnswer: instruction.correctAnswer,
    acceptableAnswers: instruction.acceptableAnswers,
    difficulty,
    timeLimit: getTimeLimit(difficulty),
    points: getPoints(difficulty),
    category: instruction.category,
    tags: instruction.tags
  };
}

/**
 * Select instruction type based on difficulty
 */
function selectInstructionType(difficulty: string, rng: any): 'direction' | 'color' | 'action' | 'mixed' {
  const typeWeights = {
    easy: { direction: 0.4, color: 0.3, action: 0.2, mixed: 0.1 },
    medium: { direction: 0.3, color: 0.25, action: 0.25, mixed: 0.2 },
    hard: { direction: 0.2, color: 0.2, action: 0.3, mixed: 0.3 }
  };
  
  const weights = typeWeights[difficulty as keyof typeof typeWeights] || typeWeights.medium;
  const random = rng.random();
  
  if (random < weights.direction) return 'direction';
  if (random < weights.direction + weights.color) return 'color';
  if (random < weights.direction + weights.color + weights.action) return 'action';
  return 'mixed';
}

/**
 * Generate instruction by type
 */
function generateInstructionByType(type: string, difficulty: string, rng: any): any {
  switch (type) {
    case 'direction':
      return generateDirectionInstruction(difficulty, rng);
    case 'color':
      return generateColorInstruction(difficulty, rng);
    case 'action':
      return generateActionInstruction(difficulty, rng);
    case 'mixed':
      return generateMixedInstruction(difficulty, rng);
    default:
      return generateDirectionInstruction(difficulty, rng);
  }
}

/**
 * Generate direction-based instruction
 */
function generateDirectionInstruction(difficulty: string, rng: any): any {
  const directions = ['up', 'down', 'left', 'right'];
  const modifiers = ['quickly', 'slowly', 'twice', 'three times'];
  
  const direction = directions[Math.floor(rng.random() * directions.length)];
  const modifier = difficulty === 'hard' && rng.random() > 0.5 
    ? modifiers[Math.floor(rng.random() * modifiers.length)]
    : '';
  
  const text = modifier ? `Move ${direction} ${modifier}` : `Move ${direction}`;
  const correctAnswer = direction;
  
  let acceptableAnswers = [direction];
  
  // Add synonyms for hard difficulty
  if (difficulty === 'hard') {
    switch (direction) {
      case 'up':
        acceptableAnswers.push('north', 'top', 'above');
        break;
      case 'down':
        acceptableAnswers.push('south', 'bottom', 'below');
        break;
      case 'left':
        acceptableAnswers.push('west', 'l');
        break;
      case 'right':
        acceptableAnswers.push('east', 'r');
        break;
    }
  }
  
  return {
    text,
    correctAnswer,
    acceptableAnswers,
    category: 'direction',
    tags: ['movement', 'spatial', 'reaction']
  };
}

/**
 * Generate color-based instruction
 */
function generateColorInstruction(difficulty: string, rng: any): any {
  const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'brown'];
  const actions = ['click', 'press', 'select', 'choose', 'find'];
  
  const color = colors[Math.floor(rng.random() * colors.length)];
  const action = actions[Math.floor(rng.random() * actions.length)];
  
  const text = `${action} the ${color} button`;
  const correctAnswer = color;
  
  let acceptableAnswers = [color];
  
  // Add color variations for medium/hard difficulty
  if (difficulty !== 'easy') {
    switch (color) {
      case 'red':
        acceptableAnswers.push('crimson', 'scarlet', 'ruby');
        break;
      case 'blue':
        acceptableAnswers.push('navy', 'azure', 'cobalt');
        break;
      case 'green':
        acceptableAnswers.push('emerald', 'forest', 'lime');
        break;
      case 'yellow':
        acceptableAnswers.push('golden', 'amber', 'lemon');
        break;
    }
  }
  
  return {
    text,
    correctAnswer,
    acceptableAnswers,
    category: 'color',
    tags: ['visual', 'recognition', 'color']
  };
}

/**
 * Generate action-based instruction
 */
function generateActionInstruction(difficulty: string, rng: any): any {
  const actions = [
    { action: 'jump', key: 'space' },
    { action: 'crouch', key: 'ctrl' },
    { action: 'run', key: 'shift' },
    { action: 'attack', key: 'x' },
    { action: 'defend', key: 'z' },
    { action: 'special', key: 'q' }
  ];
  
  const selectedAction = actions[Math.floor(rng.random() * actions.length)];
  const text = `Press ${selectedAction.key} to ${selectedAction.action}`;
  const correctAnswer = selectedAction.key;
  
  let acceptableAnswers = [selectedAction.key];
  
  // Add alternative keys for medium/hard difficulty
  if (difficulty !== 'easy') {
    switch (selectedAction.key) {
      case 'space':
        acceptableAnswers.push(' ', 'spacebar');
        break;
      case 'ctrl':
        acceptableAnswers.push('control');
        break;
      case 'shift':
        acceptableAnswers.push('shift');
        break;
    }
  }
  
  return {
    text,
    correctAnswer,
    acceptableAnswers,
    category: 'action',
    tags: ['keyboard', 'input', 'action']
  };
}

/**
 * Generate mixed instruction (combines multiple types)
 */
function generateMixedInstruction(difficulty: string, rng: any): any {
  const mixedInstructions = [
    {
      text: 'Press the red button when the arrow points up',
      correctAnswer: 'red',
      acceptableAnswers: ['red', 'crimson', 'scarlet'],
      category: 'mixed',
      tags: ['color', 'direction', 'timing']
    },
    {
      text: 'Click blue if the text says "fast", otherwise click green',
      correctAnswer: 'blue',
      acceptableAnswers: ['blue', 'navy', 'azure'],
      category: 'mixed',
      tags: ['color', 'text', 'logic']
    },
    {
      text: 'Move left twice, then press space',
      correctAnswer: 'left',
      acceptableAnswers: ['left', 'west', 'l'],
      category: 'mixed',
      tags: ['direction', 'action', 'sequence']
    },
    {
      text: 'Find the yellow button that is NOT in the top row',
      correctAnswer: 'yellow',
      acceptableAnswers: ['yellow', 'golden', 'amber'],
      category: 'mixed',
      tags: ['color', 'position', 'logic']
    }
  ];
  
  const instruction = mixedInstructions[Math.floor(rng.random() * mixedInstructions.length)];
  
  // Make it harder for higher difficulties
  if (difficulty === 'hard') {
    instruction.text += ' within 2 seconds';
  }
  
  return instruction;
}

/**
 * Get time limit based on difficulty
 */
function getTimeLimit(difficulty: string): number {
  switch (difficulty) {
    case 'easy':
      return 5000; // 5 seconds
    case 'medium':
      return 3000; // 3 seconds
    case 'hard':
      return 1500; // 1.5 seconds
    default:
      return 3000;
  }
}

/**
 * Get points based on difficulty
 */
function getPoints(difficulty: string): number {
  switch (difficulty) {
    case 'easy':
      return 10;
    case 'medium':
      return 20;
    case 'hard':
      return 30;
    default:
      return 15;
  }
}

/**
 * Validate player answer against instruction
 */
export function validateAnswer(answer: string, instruction: GameInstruction): boolean {
  if (!instruction) return false;
  
  // Check exact match first
  if (answer.toLowerCase() === instruction.correctAnswer.toLowerCase()) {
    return true;
  }
  
  // Check acceptable answers
  if (instruction.acceptableAnswers) {
    return instruction.acceptableAnswers.some(
      acceptable => answer.toLowerCase() === acceptable.toLowerCase()
    );
  }
  
  return false;
}

/**
 * Calculate score based on answer correctness and reaction time
 */
export function calculateScore(
  isCorrect: boolean,
  reactionTime: number,
  difficulty: string,
  streak: number = 0
): number {
  if (!isCorrect) return 0;
  
  let baseScore = getPoints(difficulty);
  
  // Speed bonus
  const timeBonus = Math.max(0, 1000 - reactionTime) / 100;
  baseScore += Math.floor(timeBonus);
  
  // Streak multiplier
  const streakMultiplier = Math.min(1 + (streak * 0.1), 2);
  baseScore = Math.floor(baseScore * streakMultiplier);
  
  // Perfect timing bonus
  if (reactionTime < 200) {
    baseScore += 10;
  }
  
  return Math.max(1, baseScore);
}

/**
 * Generate a sequence of instructions for a game round
 */
export function generateInstructionSequence(
  count: number,
  difficulty: 'easy' | 'medium' | 'hard',
  seed?: number
): GameInstruction[] {
  const rng = new seededRNG(seed || Date.now());
  const instructions: GameInstruction[] = [];
  
  for (let i = 0; i < count; i++) {
    instructions.push(generateInstruction(difficulty));
  }
  
  return instructions;
}

/**
 * Get instruction statistics
 */
export function getInstructionStats(instructions: GameInstruction[]): any {
  const stats = {
    total: instructions.length,
    byType: {} as Record<string, number>,
    byDifficulty: {} as Record<string, number>,
    averagePoints: 0,
    averageTimeLimit: 0
  };
  
  instructions.forEach(instruction => {
    // Count by type
    stats.byType[instruction.type] = (stats.byType[instruction.type] || 0) + 1;
    
    // Count by difficulty
    stats.byDifficulty[instruction.difficulty] = (stats.byDifficulty[instruction.difficulty] || 0) + 1;
    
    // Sum points and time limits
    stats.averagePoints += instruction.points;
    stats.averageTimeLimit += instruction.timeLimit;
  });
  
  // Calculate averages
  if (instructions.length > 0) {
    stats.averagePoints = Math.round(stats.averagePoints / instructions.length);
    stats.averageTimeLimit = Math.round(stats.averageTimeLimit / instructions.length);
  }
  
  return stats;
}

/**
 * Check if instruction is valid for current game state
 */
export function isInstructionValid(
  instruction: GameInstruction,
  gameState: any,
  playerLevel: number
): boolean {
  // Check if player level meets difficulty requirement
  const difficultyLevels = { easy: 1, medium: 5, hard: 10 };
  if (playerLevel < difficultyLevels[instruction.difficulty as keyof typeof difficultyLevels]) {
    return false;
  }
  
  // Check if instruction type is allowed in current game mode
  if (gameState && gameState.allowedTypes && !gameState.allowedTypes.includes(instruction.type)) {
    return false;
  }
  
  return true;
}

/**
 * Generate power-up effects
 */
export function generatePowerUpEffect(type: string): PowerUpEffect {
  const effects = {
    'shield': {
      type: 'shield' as const,
      value: 1,
      description: 'Protects from one wrong answer',
      duration: 10000
    },
    'time-freeze': {
      type: 'time' as const,
      value: 0.5,
      description: 'Slows down time for opponents',
      duration: 8000
    },
    'score-multiplier': {
      type: 'score' as const,
      value: 2,
      description: 'Doubles points for correct answers',
      duration: 12000
    },
    'life-steal': {
      type: 'life' as const,
      value: 1,
      description: 'Steals a life from opponent',
      duration: 0
    },
    'speed-boost': {
      type: 'boost' as const,
      value: 1.5,
      description: 'Increases reaction speed',
      duration: 15000
    }
  };
  
  return effects[type as keyof typeof effects] || effects['shield'];
}
