export interface GameState {
	level: number;
	score: number;
	streak: number;
	timeRemaining: number;
	roundTimeLimit: number;
	currentInstruction: Instruction | null;
	gameMode: 'classic' | 'sudden-death' | 'duel';
	isActive: boolean;
	hasStarted: boolean;
	mistakes: number;
	totalReactionTime: number;
	lastFailReason?: 'time' | 'wrong';
	lastFailDetail?: string;
}

// Base instruction interface
interface BaseInstruction {
	id: string;
	display: string;
	timeLimit: number;
	isReversed?: boolean;
	displayColor?: string; // For backward compatibility with components
}

// Discriminated union for instruction types
export type DirectionInstruction = BaseInstruction & {
	type: 'direction';
	direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
	correctAnswer: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
	acceptableAnswers: ('UP' | 'DOWN' | 'LEFT' | 'RIGHT')[];
};

export type ColorInstruction = BaseInstruction & {
	type: 'color';
	color: 'RED' | 'GREEN' | 'BLUE' | 'YELLOW';
	displayColor?: 'RED' | 'GREEN' | 'BLUE' | 'YELLOW';
	correctAnswer: 'RED' | 'GREEN' | 'BLUE' | 'YELLOW'; // Color instructions have a correct answer
	acceptableAnswers: ('RED' | 'GREEN' | 'BLUE' | 'YELLOW')[];
};

export type ActionInstruction = BaseInstruction & {
	type: 'action';
	action: 'TAP' | 'HOLD' | 'SWIPE';
	correctAnswer: 'TAP' | 'HOLD' | 'SWIPE';
	acceptableAnswers: ('TAP' | 'HOLD' | 'SWIPE')[];
};

export type ComboInstruction = BaseInstruction & {
	type: 'combo';
	color: 'RED' | 'GREEN' | 'BLUE' | 'YELLOW';
	direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
	displayColor?: 'RED' | 'GREEN' | 'BLUE' | 'YELLOW';
	correctAnswer: string; // e.g., "GREEN DOWN"
	acceptableAnswers: string[];
};

export type SequenceInstruction = BaseInstruction & {
	type: 'sequence';
	sequence: string[];
	correctAnswer: string;
	acceptableAnswers: string[];
};

export type PatternInstruction = BaseInstruction & {
	type: 'pattern';
	pattern: string;
	correctAnswer: string;
	acceptableAnswers: string[];
};

export type MemoryInstruction = BaseInstruction & {
	type: 'memory';
	memorizeItems: string[];
	targetItem: string;
	correctAnswer: string;
	acceptableAnswers: string[];
};

export type MathInstruction = BaseInstruction & {
	type: 'math';
	equation: string;
	result: number;
	correctAnswer: string;
	acceptableAnswers: string[];
};

export type WordInstruction = BaseInstruction & {
	type: 'word';
	word: string;
	rule: 'vowels' | 'consonants' | 'length' | 'first-letter' | 'last-letter';
	correctAnswer: string;
	acceptableAnswers: string[];
};

export type ShapeInstruction = BaseInstruction & {
	type: 'shape';
	shape: 'CIRCLE' | 'SQUARE' | 'TRIANGLE' | 'STAR';
	property: 'sides' | 'corners' | 'curved';
	correctAnswer: string;
	acceptableAnswers: string[];
};

// Union type for all instructions
export type Instruction = DirectionInstruction | ColorInstruction | ActionInstruction | ComboInstruction | 
	SequenceInstruction | PatternInstruction | MemoryInstruction | MathInstruction | WordInstruction | ShapeInstruction;

// Legacy interface for backward compatibility
export interface LegacyInstruction {
	id: string;
	type: 'direction' | 'color' | 'action' | 'combo';
	display: string;
	correctAnswer: string;
	acceptableAnswers?: string[];
	displayColor?: string;
	isReversed?: boolean;
	timeLimit: number;
}

export type InstructionType = Instruction['type'];

export interface GameConfig {
	level: number;
	baseTimeLimit: number;
	speedMultiplier: number;
	allowedMistakes: number;
	instructionTypes: InstructionType[];
}

// Missing types for AI and analytics
export interface InstructionResponse {
	instructionId: string;
	userAnswer: string;
	correctAnswer: string;
	isCorrect: boolean;
	reactionTime: number;
	timestamp: number;
	difficulty: number;
	instructionType: InstructionType;
	correct?: boolean; // Alternative property name for compatibility
}

export interface GameSession {
	id: string;
	playerId: string;
	startTime: number;
	endTime?: number;
	duration?: number;
	gameMode: 'classic' | 'sudden-death' | 'duel' | 'multiplayer' | 'battle';
	difficulty?: number;
	level: number;
	finalScore: number;
	totalQuestions: number;
	totalCorrect: number;
	totalIncorrect: number;
	averageReactionTime?: number;
	bestReactionTime?: number;
	longestStreak: number;
	completed: boolean;
	responses: InstructionResponse[];
	cognitiveMetrics?: {
		focusScore: number;
		adaptabilityScore: number;
		consistencyScore: number;
		improvementRate: number;
	};
}

export interface PersonalizationData {
	userId: string;
	preferences: {
		preferredDifficulty: number;
		preferredGameModes: string[];
		preferredInstructionTypes: InstructionType[];
		sessionDurationPreference: number;
	};
	performanceHistory: {
		averageAccuracy: number;
		averageReactionTime: number;
		improvementTrend: number;
		strongestSkills: string[];
		weakestSkills: string[];
	};
	adaptationSettings: {
		adaptationRate: number;
		difficultyAdjustmentSensitivity: number;
		personalizedContentEnabled: boolean;
	};
}
