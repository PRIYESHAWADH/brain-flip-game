// Jest globals are available without import in modern Jest
import {
	generateInstructionSequence,
	setInstructionSeed,
	DIRECTIONS,
	COLORS,
	ACTIONS,
} from '../src/utils/gameLogic';
import { Instruction } from '../src/types/game';
// Jest provides describe/it/expect globals; no need to import from node:test

describe('Instruction Fuzz Testing', () => {
	const FUZZ_TEST_COUNT = 10000;
	const SEQUENCE_LENGTH = 50;

	it('should generate valid instructions over 10k sequences', () => {
		let totalInstructions = 0;
		let invalidInstructions = 0;
		const errors: string[] = [];

		for (let seed = 1; seed <= FUZZ_TEST_COUNT / SEQUENCE_LENGTH; seed++) {
			try {
				const level = Math.floor(Math.random() * 30) + 1; // Random level 1-30
				const sequence = generateInstructionSequence(level, SEQUENCE_LENGTH, seed);
				
				sequence.forEach((instruction, index) => {
					totalInstructions++;
					
					try {
						validateInstructionIntegrity(instruction);
					} catch (error) {
						invalidInstructions++;
						errors.push(`Seed ${seed}, Index ${index}: ${error}`);
					}
				});
			} catch (error) {
				errors.push(`Seed ${seed}: ${error}`);
			}
		}

		// Report results
		console.log(`Fuzz test results:`);
		console.log(`Total instructions generated: ${totalInstructions}`);
		console.log(`Invalid instructions: ${invalidInstructions}`);
		console.log(`Success rate: ${((totalInstructions - invalidInstructions) / totalInstructions * 100).toFixed(2)}%`);

		if (errors.length > 0) {
			console.log(`First 10 errors:`, errors.slice(0, 10));
		}

		expect(invalidInstructions).toBe(0);
		expect(totalInstructions).toBeGreaterThan(FUZZ_TEST_COUNT * 0.9); // Allow some variance
	});

	it('should maintain fair distribution across instruction types', () => {
		const typeCounts = {
			direction: 0,
			color: 0,
			action: 0,
			combo: 0,
		};

		// Test at level 20 where all types should be available
		for (let seed = 1; seed <= 100; seed++) {
			const sequence = generateInstructionSequence(20, 50, seed);
			sequence.forEach(instruction => {
				typeCounts[instruction.type]++;
			});
		}

		const total = Object.values(typeCounts).reduce((a, b) => a + b, 0);
		
		// Each type should appear at least 5% of the time at level 20
		Object.entries(typeCounts).forEach(([type, count]) => {
			const percentage = (count / total) * 100;
			expect(percentage).toBeGreaterThan(5);
			console.log(`${type}: ${count} (${percentage.toFixed(1)}%)`);
		});
	});

	it('should prevent pattern traps in long sequences', () => {
		const patternTraps: Array<{ seed: number; index: number; display: string }> = [];

		for (let seed = 1; seed <= 100; seed++) {
			const sequence = generateInstructionSequence(15, 100, seed);
			
			for (let i = 1; i < sequence.length; i++) {
				if (sequence[i].display === sequence[i - 1].display) {
					patternTraps.push({
						seed,
						index: i,
						display: sequence[i].display,
					});
				}
			}
		}

		if (patternTraps.length > 0) {
			console.log(`Pattern traps found:`, patternTraps.slice(0, 5));
		}

		expect(patternTraps).toHaveLength(0);
	});

	it('should generate reasonable time limits', () => {
		const timeLimits: number[] = [];

		for (let level = 1; level <= 30; level++) {
			const sequence = generateInstructionSequence(level, 10, level);
			sequence.forEach(instruction => {
				timeLimits.push(instruction.timeLimit);
			});
		}

		// All time limits should be reasonable
		timeLimits.forEach(timeLimit => {
			expect(timeLimit).toBeGreaterThan(500); // At least 500ms
			expect(timeLimit).toBeLessThan(5000); // At most 5 seconds
		});

		// Time limits should generally decrease with level
		const level1Avg = timeLimits.slice(0, 10).reduce((a, b) => a + b, 0) / 10;
		const level30Avg = timeLimits.slice(-10).reduce((a, b) => a + b, 0) / 10;
		
		expect(level30Avg).toBeLessThan(level1Avg);
	});

	it('should generate valid acceptable answers', () => {
		const invalidAnswers: Array<{ instruction: Instruction; reason: string }> = [];

		for (let seed = 1; seed <= 50; seed++) {
			const sequence = generateInstructionSequence(20, 20, seed);
			
			sequence.forEach(instruction => {
				// Check that acceptable answers are valid for the instruction type
				switch (instruction.type) {
					case 'direction':
						instruction.acceptableAnswers.forEach(answer => {
							if (!DIRECTIONS.includes(answer as any)) {
								invalidAnswers.push({
									instruction,
									reason: `Invalid direction answer: ${answer}`,
								});
							}
						});
						break;
						
					case 'color':
						instruction.acceptableAnswers.forEach(answer => {
							if (!COLORS.includes(answer as any)) {
								invalidAnswers.push({
									instruction,
									reason: `Invalid color answer: ${answer}`,
								});
							}
						});
						break;
						
					case 'action':
						instruction.acceptableAnswers.forEach(answer => {
							if (!ACTIONS.includes(answer as any)) {
								invalidAnswers.push({
									instruction,
									reason: `Invalid action answer: ${answer}`,
								});
							}
						});
						break;
						
					case 'combo':
						instruction.acceptableAnswers.forEach(answer => {
							const parts = answer.split(' ');
							if (parts.length !== 2 || 
								!COLORS.includes(parts[0] as any) || 
								!DIRECTIONS.includes(parts[1] as any)) {
								invalidAnswers.push({
									instruction,
									reason: `Invalid combo answer: ${answer}`,
								});
							}
						});
						break;
				}
			});
		}

		if (invalidAnswers.length > 0) {
			console.log(`Invalid answers found:`, invalidAnswers.slice(0, 5));
		}

		expect(invalidAnswers).toHaveLength(0);
	});
});

// Helper function to validate instruction integrity
function validateInstructionIntegrity(instruction: Instruction): void {
	// Basic structure validation
	if (!instruction.id || typeof instruction.id !== 'string') {
		throw new Error('Invalid or missing ID');
	}

	if (!instruction.display || typeof instruction.display !== 'string') {
		throw new Error('Invalid or missing display');
	}

	if (!instruction.type || !['direction', 'color', 'action', 'combo'].includes(instruction.type)) {
		throw new Error(`Invalid instruction type: ${instruction.type}`);
	}

	if (typeof instruction.timeLimit !== 'number' || instruction.timeLimit <= 0) {
		throw new Error(`Invalid time limit: ${instruction.timeLimit}`);
	}

	if (!Array.isArray(instruction.acceptableAnswers) || instruction.acceptableAnswers.length === 0) {
		throw new Error('Invalid or empty acceptable answers');
	}

	// Type-specific validation
	switch (instruction.type) {
		case 'direction':
			if (instruction.type === 'direction') {
				if (!DIRECTIONS.includes(instruction.direction)) {
					throw new Error(`Invalid direction: ${instruction.direction}`);
				}
				if (!instruction.display.startsWith('SWIPE ')) {
					throw new Error(`Invalid direction display: ${instruction.display}`);
				}
			}
			break;

		case 'color':
			if (instruction.type === 'color') {
				if (!COLORS.includes(instruction.color)) {
					throw new Error(`Invalid color: ${instruction.color}`);
				}
				// Remove the incorrect expectation - color instructions can have correctAnswer
				// if (instruction.correctAnswer && instruction.correctAnswer.length > 0) {
				// 	throw new Error('Color instructions should have empty correctAnswer');
				// }
			}
			break;

		case 'action':
			if (instruction.type === 'action') {
				if (!ACTIONS.includes(instruction.action)) {
					throw new Error(`Invalid action: ${instruction.action}`);
				}
			}
			break;

		case 'combo':
			if (instruction.type === 'combo') {
				if (!COLORS.includes(instruction.color) || !DIRECTIONS.includes(instruction.direction)) {
					throw new Error(`Invalid combo: ${instruction.color} ${instruction.direction}`);
				}
				if (!instruction.display.includes(' ')) {
					throw new Error(`Invalid combo display: ${instruction.display}`);
				}
			}
			break;
	}
}