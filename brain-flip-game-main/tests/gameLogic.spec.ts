// Jest globals are available without import in modern Jest
import {
	generateInstruction,
	generateInstructionSequence,
	setInstructionSeed,
	getOppositeDirection,
	getOppositeColor,
	getOppositeAction,
	DIRECTIONS,
	COLORS,
	ACTIONS,
	DIFFICULTY_CURVE,
} from '../src/utils/gameLogic';
import { Instruction } from '../src/types/game';

describe('GameLogic', () => {
	beforeEach(() => {
		// Reset to a known seed for deterministic tests
		setInstructionSeed(12345);
	});

	describe('Opposite Functions', () => {
		describe('getOppositeDirection', () => {
			it('should return correct opposites for all directions', () => {
				expect(getOppositeDirection('UP')).toBe('DOWN');
				expect(getOppositeDirection('DOWN')).toBe('UP');
				expect(getOppositeDirection('LEFT')).toBe('RIGHT');
				expect(getOppositeDirection('RIGHT')).toBe('LEFT');
			});

			it('should be exhaustive (TypeScript compile-time check)', () => {
				// This test ensures all direction cases are handled
				DIRECTIONS.forEach(dir => {
					expect(() => getOppositeDirection(dir)).not.toThrow();
				});
			});
		});

		describe('getOppositeColor', () => {
			it('should return correct opposites for all colors', () => {
				expect(getOppositeColor('RED')).toBe('GREEN');
				expect(getOppositeColor('GREEN')).toBe('RED');
				expect(getOppositeColor('BLUE')).toBe('YELLOW');
				expect(getOppositeColor('YELLOW')).toBe('BLUE');
			});

			it('should be exhaustive', () => {
				COLORS.forEach(color => {
					expect(() => getOppositeColor(color)).not.toThrow();
				});
			});
		});

		describe('getOppositeAction', () => {
			it('should return correct opposites for all actions', () => {
				expect(getOppositeAction('TAP')).toBe('HOLD');
				expect(getOppositeAction('HOLD')).toBe('TAP');
				expect(getOppositeAction('SWIPE')).toBe('TAP');
			});

			it('should be exhaustive', () => {
				ACTIONS.forEach(action => {
					expect(() => getOppositeAction(action)).not.toThrow();
				});
			});
		});
	});

	describe('Instruction Generation', () => {
		it('should generate valid instructions for all levels', () => {
			for (let level = 1; level <= 30; level++) {
				const instruction = generateInstruction(level, []);
				
				// Basic validation
				expect(instruction.id).toBeDefined();
				expect(instruction.display).toBeDefined();
				expect(instruction.timeLimit).toBeGreaterThan(0);
				expect(instruction.acceptableAnswers).toBeDefined();
				expect(instruction.acceptableAnswers.length).toBeGreaterThan(0);
				
				// Type-specific validation
				expect(['direction', 'color', 'action', 'combo']).toContain(instruction.type);
			}
		});

		it('should generate different instruction types based on level', () => {
			// Level 1 should only generate direction instructions
			setInstructionSeed(12345);
			const level1Instructions = generateInstructionSequence(1, 10);
			expect(level1Instructions.every(i => i.type === 'direction')).toBe(true);

			// Higher levels should have variety
			setInstructionSeed(12345);
			const level20Instructions = generateInstructionSequence(20, 20);
			const types = new Set(level20Instructions.map(i => i.type));
			expect(types.size).toBeGreaterThan(1);
		});

		it('should respect difficulty curve time limits', () => {
			Object.entries(DIFFICULTY_CURVE).forEach(([level, curve]) => {
				const instruction = generateInstruction(+level, []);
				expect(instruction.timeLimit).toBe(curve.timeLimit);
			});
		});

		it('should generate deterministic sequences with same seed', () => {
			const sequence1 = generateInstructionSequence(10, 5, 12345);
			const sequence2 = generateInstructionSequence(10, 5, 12345);
			
			expect(sequence1).toHaveLength(5);
			expect(sequence2).toHaveLength(5);
			
			for (let i = 0; i < 5; i++) {
				expect(sequence1[i].type).toBe(sequence2[i].type);
				expect(sequence1[i].display).toBe(sequence2[i].display);
				expect(sequence1[i].correctAnswer).toBe(sequence2[i].correctAnswer);
			}
		});

		it('should avoid pattern traps', () => {
			// Generate a sequence and check for consecutive identical displays
			const sequence = generateInstructionSequence(10, 50, 12345);
			
			for (let i = 1; i < sequence.length; i++) {
				expect(sequence[i].display).not.toBe(sequence[i - 1].display);
			}
		});
	});

	describe('Instruction Type Validation', () => {
		it('should generate valid direction instructions', () => {
			setInstructionSeed(12345);
			const instructions = generateInstructionSequence(1, 20); // Level 1 only generates directions
			
			instructions.forEach(instruction => {
				expect(instruction.type).toBe('direction');
				expect(instruction.display).toMatch(/^SWIPE (UP|DOWN|LEFT|RIGHT)$/);
				expect(DIRECTIONS).toContain(instruction.correctAnswer as any);
				expect(instruction.acceptableAnswers).toHaveLength(1);
				expect(instruction.acceptableAnswers[0]).toBe(instruction.correctAnswer);
			});
		});

		it('should generate valid color instructions', () => {
			// Force color generation by using appropriate level and seed
			let colorInstruction: Instruction | null = null;
			
			// Try multiple seeds to find a color instruction
			for (let seed = 1; seed < 100; seed++) {
				const instructions = generateInstructionSequence(5, 10, seed);
				const found = instructions.find(i => i.type === 'color');
				if (found) {
					colorInstruction = found;
					break;
				}
			}
			
			expect(colorInstruction).not.toBeNull();
			if (colorInstruction && colorInstruction.type === 'color') {
				expect(COLORS).toContain(colorInstruction.color);
				expect(colorInstruction.correctAnswer).toBe('');
				expect(colorInstruction.acceptableAnswers.length).toBeGreaterThan(0);
				expect(colorInstruction.acceptableAnswers.length).toBeLessThan(4); // Should exclude at least text color
			}
		});

		it('should generate valid action instructions', () => {
			let actionInstruction: Instruction | null = null;
			
			for (let seed = 1; seed < 100; seed++) {
				const instructions = generateInstructionSequence(12, 10, seed);
				const found = instructions.find(i => i.type === 'action');
				if (found) {
					actionInstruction = found;
					break;
				}
			}
			
			expect(actionInstruction).not.toBeNull();
			if (actionInstruction && actionInstruction.type === 'action') {
				expect(ACTIONS).toContain(actionInstruction.action);
				expect(ACTIONS).toContain(actionInstruction.correctAnswer as any);
				expect(actionInstruction.acceptableAnswers).toHaveLength(1);
			}
		});

		it('should generate valid combo instructions', () => {
			let comboInstruction: Instruction | null = null;
			
			for (let seed = 1; seed < 100; seed++) {
				const instructions = generateInstructionSequence(16, 10, seed);
				const found = instructions.find(i => i.type === 'combo');
				if (found) {
					comboInstruction = found;
					break;
				}
			}
			
			expect(comboInstruction).not.toBeNull();
			if (comboInstruction && comboInstruction.type === 'combo') {
				expect(COLORS).toContain(comboInstruction.color);
				expect(DIRECTIONS).toContain(comboInstruction.direction);
				expect(comboInstruction.display).toMatch(/^(RED|GREEN|BLUE|YELLOW) (UP|DOWN|LEFT|RIGHT)$/);
				expect(comboInstruction.correctAnswer).toMatch(/^(RED|GREEN|BLUE|YELLOW) (UP|DOWN|LEFT|RIGHT)$/);
				expect(comboInstruction.acceptableAnswers).toHaveLength(1);
			}
		});
	});

	describe('Reverse Psychology Tricks', () => {
		it('should apply reverse psychology tricks at higher levels', () => {
			// Generate many instructions at high level to find reverse psychology
			let reversedInstruction: Instruction | null = null;
			
			for (let seed = 1; seed < 200; seed++) {
				const instructions = generateInstructionSequence(25, 10, seed);
				const found = instructions.find(i => i.isReversed);
				if (found) {
					reversedInstruction = found;
					break;
				}
			}
			
			if (reversedInstruction) {
				expect(reversedInstruction.isReversed).toBe(true);
				expect(reversedInstruction.display).toMatch(/^Don't /);
			}
		});
	});

	describe('Performance', () => {
		it('should generate instructions quickly', () => {
			const start = performance.now();
			generateInstructionSequence(15, 1000, 12345);
			const end = performance.now();
			
			const timePerInstruction = (end - start) / 1000;
			expect(timePerInstruction).toBeLessThan(1); // Less than 1ms per instruction
		});
	});
});