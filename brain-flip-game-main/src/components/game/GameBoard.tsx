"use client";
import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore, livesForMode } from '@/store/gameStore';
import { useAudio } from '@/hooks/useAudio';
import { GameInputHandler, KeyboardNavigationHelper, InputEvent } from '@/utils/inputHandlers';
import { calculateReactionScore } from '@/utils/timing';
import GameOver from './GameOver';
import ChallengeManager from '../challenges/ChallengeManager';
import { useAnimation } from '@/hooks/useAnimation';
import { useMobile } from '@/hooks/useMobile';
import ParticleEffects from './ParticleEffects';
import ScoreAnimations from './ScoreAnimations';
import PracticeMode from './PracticeMode';
import MobileControls from '@/components/mobile/MobileControls';

// World-class constants for game answers
const DIRS = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
const COLORS = ['RED', 'BLUE', 'GREEN', 'YELLOW'];
const ACTIONS = ['PRESS', 'HOLD', 'SWIPE', 'TAP'];

// World-class answer organization for optimal gameplay
const ANSWER_GROUPS = {
	directions: DIRS,
	colors: COLORS,
	actions: ACTIONS,
	combinations: (() => {
	const combos: string[] = [];
	for (const c of COLORS) {
		for (const d of DIRS) combos.push(`${c} ${d}`);
	}
		return combos;
	})()
};

export default function GameBoard() {
	 const {
	 	isActive,
	 	currentInstruction,
	 	submitAnswer,
	 	timeRemaining,
	 	hasStarted,
	 	roundTimeLimit,
	 	streak,
	 	level,
	 	endGame,
	 	mistakes,
	 	gameMode,
	 	lastScoreGain,
	 	celebrationLevel,
	 	showScoreBreakdown,
	 	score,
	 	nextPotentialScore,
	 	speedBonusActive,
	 	goldenActive,
	 	goldenValue,
	 	luckyMultiplierActive,
	 	luckyMultiplierValue,
	 	personalBest,
	 	comboStreak
	 } = useGameStore();
	
	// Enhanced visual feedback system
	const [showParticles, setShowParticles] = useState<'correct' | 'perfect' | 'incorrect' | 'combo' | 'flow' | null>(null);
	const [showScoreAnimation, setShowScoreAnimation] = useState(false);

	const { 
		playCorrect, 
		playIncorrect, 
		playTimerWarning, 
		playPerfectTiming, 
		playStreakBonus, 
		playGameOver,
		playComboBonus,
		playFlowState,
		playAdaptiveBackgroundMusic
	} = useAudio();
	const [answerTime, setAnswerTime] = useState(performance.now());

	const containerRef = useRef<HTMLDivElement>(null);
	const inputHandlerRef = useRef<GameInputHandler>(new GameInputHandler());
	const keyboardNavRef = useRef<KeyboardNavigationHelper>(new KeyboardNavigationHelper());

	 const { prefersReducedMotion } = useAnimation();

	// CRITICAL FIX: Prevent rapid instruction changes that cause jumping
	const [isProcessingAnswer, setIsProcessingAnswer] = useState<boolean>(false);
	const [lastInstructionId, setLastInstructionId] = useState<string | null>(null);

	const lives = livesForMode(gameMode);

	// Simple component initialization
	useEffect(() => {
		setShowParticles(null);
		setIsProcessingAnswer(false);
	}, []);
	
	// Handle instruction changes smoothly
	useEffect(() => {
		if (currentInstruction && currentInstruction.id !== lastInstructionId) {
			setLastInstructionId(currentInstruction.id);
			setAnswerTime(performance.now());
			setIsProcessingAnswer(false);
		}
	}, [currentInstruction, lastInstructionId]);

	// Update answer time when instruction changes
	useEffect(() => {
		if (isActive && currentInstruction) {
			setAnswerTime(performance.now());
		}
	}, [currentInstruction?.id, isActive]);

	 // Set up input handler for keyboard only
	 useEffect(() => {
		 const inputHandler = inputHandlerRef.current;

		 inputHandler.setInputCallback((inputEvent: InputEvent) => {
			 handleAnswer(inputEvent.action);
		 });

		 return () => {
			 inputHandler.reset();
		 };
	 }, []);

	 // Set up keyboard event listeners
	 useEffect(() => {
		 if (!isActive) return;

		 const handleKeyDown = (event: KeyboardEvent) => {
			 // Prevent input during answer processing
			 if (isProcessingAnswer) {
				 event.preventDefault();
				 return;
			 }

			 // First try keyboard navigation
			 if (keyboardNavRef.current.handleNavigation(event)) {
				 return;
			 }

			 // Then try game input
			 inputHandlerRef.current.handleKeyboardInput(event);
		 };

		 const handleKeyUp = (event: KeyboardEvent) => {
			 // Handle key up events if needed
		 };

		 document.addEventListener('keydown', handleKeyDown);
		 document.addEventListener('keyup', handleKeyUp);

		 return () => {
			 document.removeEventListener('keydown', handleKeyDown);
			 document.removeEventListener('keyup', handleKeyUp);
		 };
	 }, [isActive, isProcessingAnswer]);

	 // Update keyboard navigation when options change
	 useEffect(() => {
		 if (!containerRef.current) return;

		 const buttons = containerRef.current.querySelectorAll('button[data-answer]');
		 keyboardNavRef.current.setFocusableElements(Array.from(buttons) as HTMLElement[]);
	 }, [currentInstruction?.id, isActive]); // Only depend on instruction ID

	// 🎯 SIMPLE GAME OVER LOGIC - End game when lives exhausted or timer runs out
	 useEffect(() => {
		if (!isActive) return;

		
		// Simple and clear: game ends when mistakes reach lives OR time runs out
		if (mistakes >= lives) {
			console.log('[GameBoard] Game Over - Lives exhausted');
	 		endGame();
	 		return;
	 	}
		
		if (timeRemaining <= 0) {
			console.log('[GameBoard] Game Over - Time up');
	 		endGame();
	 		return;
	 	}
		
		// Play timer warning when time is running low
		if (timeRemaining < 700 && timeRemaining > 0 && isActive) playTimerWarning();
	}, [timeRemaining, mistakes, gameMode, isActive, playTimerWarning, endGame, lives]);

	// REAL ULTIMATE FIX: Immediate answer processing without delays
	const handleAnswer = useCallback((ans: string) => {
		if (!isActive || !currentInstruction || isProcessingAnswer) {
			console.log('[BULLETPROOF] Answer blocked - isActive:', isActive, 'hasInstruction:', !!currentInstruction, 'isProcessing:', isProcessingAnswer);
			return;
		}

		// Set processing state to prevent multiple rapid answers
		setIsProcessingAnswer(true);
		console.log('[BULLETPROOF] Processing answer:', ans);

		// Process answer immediately
		const reactionTime = performance.now() - answerTime;

		// Follow the "How to Play" rules exactly
		
		// STEP 1: Use the instruction's pre-calculated correct answers (most reliable)
		let correctAnswers: string[] = [];
		
		// Priority 1: Use acceptableAnswers from instruction (these are pre-calculated correctly)
		if (currentInstruction.acceptableAnswers && currentInstruction.acceptableAnswers.length > 0) {
			correctAnswers = [...currentInstruction.acceptableAnswers];
		}
		// Priority 2: Use correctAnswer if available
		else if (currentInstruction.correctAnswer && currentInstruction.correctAnswer.trim() !== '') {
			correctAnswers = [currentInstruction.correctAnswer];
		}
		// Priority 3: Fallback calculation based on instruction type (only if needed)
		else {
			switch (currentInstruction.type) {
				case 'direction':
					// Direction: opposite direction
					if (currentInstruction.direction) {
						const dirMap = { 'UP': 'DOWN', 'DOWN': 'UP', 'LEFT': 'RIGHT', 'RIGHT': 'LEFT' };
						const opposite = dirMap[currentInstruction.direction as keyof typeof dirMap];
						if (opposite) correctAnswers = [opposite];
					}
					break;
				case 'color':
					// Color: any color except the word color and display color
					if (currentInstruction.color && currentInstruction.displayColor) {
						correctAnswers = COLORS.filter(
							color => color !== currentInstruction.color && color !== currentInstruction.displayColor
						);
					}
					break;
				case 'action':
					// Action: opposite action
					if (currentInstruction.action) {
						const actionMap = { 'PRESS': 'HOLD', 'HOLD': 'PRESS', 'SWIPE': 'TAP', 'TAP': 'SWIPE' };
						const opposite = actionMap[currentInstruction.action as keyof typeof actionMap];
						if (opposite) correctAnswers = [opposite];
					}
					break;
				case 'combo':
					// Combo: opposite color AND opposite direction
					if (currentInstruction.color && currentInstruction.direction) {
						const colorMap = { 'RED': 'BLUE', 'BLUE': 'RED', 'GREEN': 'YELLOW', 'YELLOW': 'GREEN' };
						const dirMap = { 'UP': 'DOWN', 'DOWN': 'UP', 'LEFT': 'RIGHT', 'RIGHT': 'LEFT' };
						const oppositeColor = colorMap[currentInstruction.color as keyof typeof colorMap];
						const oppositeDirection = dirMap[currentInstruction.direction as keyof typeof dirMap];
						if (oppositeColor && oppositeDirection) {
							correctAnswers = [`${oppositeColor} ${oppositeDirection}`];
						}
					}
					break;
			}
		}
		
		// STEP 2: Check if player's answer is correct
		const isCorrect = correctAnswers.includes(ans.toUpperCase());
		
		// STEP 3: DEBUG LOGGING
		console.log('[FIXED] === ANSWER VALIDATION ===');
		console.log('[FIXED] Player answer:', ans);
		console.log('[FIXED] Instruction type:', currentInstruction.type);
		console.log('[FIXED] Instruction display:', currentInstruction.display);
		console.log('[FIXED] Correct answers:', correctAnswers);
		console.log('[FIXED] Final result:', isCorrect);
		console.log('[FIXED] === END VALIDATION ===');

		// STEP 4: ✅ SIMPLE CLEAN FEEDBACK SYSTEM
		if (isCorrect) {
			// Enhanced audio feedback with dynamic intensity
			playCorrect({}, streak, reactionTime);
			
			// Special audio for combo streaks
			if (comboStreak >= 5) {
				setTimeout(() => playComboBonus(comboStreak), 200);
			}
			
			// Flow state audio feedback
			if (streak >= 5 && comboStreak >= 3) {
				setTimeout(() => playFlowState(), 400);
			}
			
			// Adaptive background music
			playAdaptiveBackgroundMusic({
				streak: streak + 1, // Next streak value
				comboStreak: comboStreak + 1,
				isFlowState: streak >= 5 && comboStreak >= 3
			});
			
			// Enhanced visual feedback based on performance
			if (!prefersReducedMotion) {
				if (reactionTime < 300) {
					setShowParticles('perfect'); // Perfect timing
				} else if (reactionTime < 500) {
					setShowParticles('correct'); // Good timing
				} else {
					setShowParticles('correct'); // Standard reaction
				}
				
				// Special effects for combo streaks and flow state
				if (comboStreak >= 5) {
					setTimeout(() => setShowParticles('combo'), 300);
				}
				
				if (streak >= 5 && comboStreak >= 3) {
					setTimeout(() => setShowParticles('flow'), 600);
				}
			}
			
			// Show score animation
			setShowScoreAnimation(true);
			
			// Submit answer to game store
			submitAnswer(ans, reactionTime);
			
			// Check for achievements after correct answer
			try {
				const { useAchievementStore } = require('@/store/achievementStore');
				const achievementStore = useAchievementStore.getState();
				
				const gameStats = {
					streak: streak + 1,
					score: score + lastScoreGain,
					reactionTime,
					perfectRounds: reactionTime < 400 ? perfectRounds + 1 : perfectRounds,
					dailyStreak: dailyStreak,
					comboStreak: reactionTime < 400 ? comboStreak + 1 : 0,
					gamesPlayed: gamesPlayed + 1,
					lightningReactions: reactionTime < 400 ? lightningReactions + 1 : lightningReactions
				};
				
				const newlyUnlocked = achievementStore.checkAchievements(gameStats);
				
				// Show achievement notifications
				newlyUnlocked.forEach((achievement: any) => {
					setTimeout(() => {
						if ((window as any).showAchievement) {
							(window as any).showAchievement(achievement);
						}
					}, 1000);
				});
			} catch (error) {
				console.warn('Achievement check failed:', error);
			}
			
			// Reset processing state after a short delay
			setTimeout(() => {
				setIsProcessingAnswer(false);
				setShowParticles(null);
				setShowScoreAnimation(false);
			}, 2000);
		} else {
			// Simple audio feedback
			playIncorrect();
			
			// Simple visual feedback
			if (!prefersReducedMotion) {
				setShowParticles('incorrect');
			}
			
			// Submit answer to game store (will handle mistake)
		submitAnswer(ans, reactionTime);
			
			// Reset processing state after a short delay
			setTimeout(() => {
				setIsProcessingAnswer(false);
				setShowParticles(null);
			}, 300);
		}
	}, [isActive, currentInstruction, isProcessingAnswer, answerTime, playCorrect, playIncorrect, prefersReducedMotion, submitAnswer]);

	function handleButtonClick(ans: string, event: React.MouseEvent | React.TouchEvent) {
		// Prevent default to avoid any browser interference
		event.preventDefault();
		event.stopPropagation();
		
		// Directly handle the answer instead of going through input handler
		handleAnswer(ans);
	}

	// Get answer layout based on instruction type
	const getAnswerLayout = (type: string = 'default') => {
		// Simple layout selection based on type
		const layoutMap = {
			direction: 'cross',
			color: 'square', 
			action: 'horizontal',
			combo: 'grid'
		} as const;

		const layout = layoutMap[type as keyof typeof layoutMap] || 'grid';
		
		// Base configuration
		const configs = {
			direction: {
				title: 'Direction Challenge',
				description: 'Swipe in the OPPOSITE direction'
			},
			color: {
				title: 'Color Challenge', 
				description: 'Choose any color EXCEPT the word and display color'
			},
			action: {
				title: 'Action Challenge',
				description: 'Perform the OPPOSITE action'
			},
			combo: {
				title: 'Combo Challenge',
				description: 'Combine OPPOSITE color AND direction'
			}
		};

		const config = configs[type as keyof typeof configs] || {
			title: 'Challenge',
			description: 'Choose the correct answer'
		};
		
		return {
			layout,
			title: config.title,
			description: config.description
		};
	};

	// BULLETPROOF WORLD-CLASS ANSWER GENERATION SYSTEM
	// Mathematical perfection with guaranteed correct answers
	const getAnswers = (instruction: any): string[] => {
		console.log('[BULLETPROOF] === ANSWER GENERATION START ===');
		console.log('[BULLETPROOF] Input instruction:', instruction);
		
		if (!instruction) {
			console.log('[BULLETPROOF] No instruction, returning safe defaults');
			return ['UP', 'DOWN', 'LEFT', 'RIGHT'];
		}
		
		// STEP 1: DETERMINE CORRECT ANSWERS WITH BULLETPROOF LOGIC
		let correctAnswers: string[] = [];
		
		// Priority 1: Use acceptableAnswers from instruction (most reliable)
		if (instruction.acceptableAnswers && instruction.acceptableAnswers.length > 0) {
			correctAnswers = [...instruction.acceptableAnswers];
		}
		// Priority 2: Use correctAnswer if available
		else if (instruction.correctAnswer && instruction.correctAnswer.trim() !== '') {
			correctAnswers = [instruction.correctAnswer];
		}
		// Priority 3: Emergency fallback based on instruction type
		else {
			switch (instruction.type) {
				case 'direction':
					if (instruction.direction) {
						const dirMap = { 'UP': 'DOWN', 'DOWN': 'UP', 'LEFT': 'RIGHT', 'RIGHT': 'LEFT' };
						const opposite = dirMap[instruction.direction as keyof typeof dirMap];
						if (opposite) correctAnswers = [opposite];
					}
					break;
				case 'color':
					if (instruction.color && instruction.displayColor) {
						correctAnswers = COLORS.filter(
							color => color !== instruction.color && color !== instruction.displayColor
						);
					}
					break;
				case 'action':
					if (instruction.action) {
						const actionMap = { 'PRESS': 'HOLD', 'HOLD': 'PRESS', 'SWIPE': 'TAP', 'TAP': 'SWIPE' };
						const opposite = actionMap[instruction.action as keyof typeof actionMap];
						if (opposite) correctAnswers = [opposite];
					}
					break;
				case 'combo':
					if (instruction.color && instruction.direction) {
						const colorMap = { 'RED': 'BLUE', 'BLUE': 'RED', 'GREEN': 'YELLOW', 'YELLOW': 'GREEN' };
						const dirMap = { 'UP': 'DOWN', 'DOWN': 'UP', 'LEFT': 'RIGHT', 'RIGHT': 'LEFT' };
						const oppositeColor = colorMap[instruction.color as keyof typeof colorMap];
						const oppositeDirection = dirMap[instruction.direction as keyof typeof dirMap];
						if (oppositeColor && oppositeDirection) {
							correctAnswers = [`${oppositeColor} ${oppositeDirection}`];
						}
					}
					break;
			}
		}
		
		// STEP 2: BULLETPROOF VALIDATION - Ensure we have at least one correct answer
		if (correctAnswers.length === 0) {
			console.log('[BULLETPROOF] EMERGENCY: No correct answers found, using safe fallback');
			correctAnswers = ['DOWN']; // Safe default
		}
		
		console.log('[BULLETPROOF] Determined correct answers:', correctAnswers);
		
		// STEP 3: BUILD PERFECT ANSWER ARRAY
		let finalAnswers: string[] = [];
		
		// Always include at least one correct answer first
		finalAnswers.push(correctAnswers[0]);
		console.log('[BULLETPROOF] Added primary correct answer:', correctAnswers[0]);
		
		// Add remaining correct answers if any
		for (let i = 1; i < correctAnswers.length && finalAnswers.length < 4; i++) {
			finalAnswers.push(correctAnswers[i]);
			console.log('[BULLETPROOF] Added additional correct answer:', correctAnswers[i]);
		}
		
		// STEP 4: FILL WITH WRONG ANSWERS
		let wrongOptions: string[] = [];
		switch (instruction.type) {
			case 'direction':
				wrongOptions = ANSWER_GROUPS.directions.filter(d => !correctAnswers.includes(d));
				break;
			case 'color':
				wrongOptions = ANSWER_GROUPS.colors.filter(c => !correctAnswers.includes(c));
				break;
			case 'action':
				wrongOptions = ANSWER_GROUPS.actions.filter(a => !correctAnswers.includes(a));
				break;
			case 'combo':
				wrongOptions = ANSWER_GROUPS.combinations.filter(c => !correctAnswers.includes(c));
				break;
		}
		console.log('[BULLETPROOF] Available wrong options:', wrongOptions);
		
		// Add wrong options until we have 4 total
		while (finalAnswers.length < 4 && wrongOptions.length > 0) {
			const randomIndex = Math.floor(Math.random() * wrongOptions.length);
			const randomWrong = wrongOptions.splice(randomIndex, 1)[0];
			finalAnswers.push(randomWrong);
			console.log('[BULLETPROOF] Added wrong option:', randomWrong);
		}
		
		// STEP 5: EMERGENCY FILL - Duplicate correct answers if needed
		while (finalAnswers.length < 4) {
			const randomCorrect = correctAnswers[Math.floor(Math.random() * correctAnswers.length)];
			finalAnswers.push(randomCorrect);
			console.log('[BULLETPROOF] Duplicated correct answer:', randomCorrect);
		}
		
		// STEP 6: PERFECT SHUFFLE - Return exactly 4 answers
		const shuffled = [...finalAnswers].sort(() => Math.random() - 0.5);
		console.log('[BULLETPROOF] Final shuffled answers:', shuffled);
		console.log('[BULLETPROOF] === ANSWER GENERATION END ===');
		
		return shuffled;
	};

	// When not active, don't render the game board
	if (!isActive) {
		return null;
	}

	const answers = useMemo(() => {
		return getAnswers(currentInstruction);
	}, [currentInstruction?.id]); // Only regenerate when instruction ID changes

	const layoutConfig = useMemo(() => {
		return getAnswerLayout(currentInstruction?.type || 'default');
	}, [currentInstruction?.id]); // Only change layout when instruction changes
	
	const { layout, title, description } = layoutConfig;

	return (
		<div
			ref={containerRef}
			className="relative flex flex-col items-center w-full max-w-4xl mx-auto"
			style={{ height: '600px' }}
			tabIndex={-1}
		>
			{/* Simple background */}
			<div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800" aria-hidden="true" />

			{/* Main Instruction Display - Stable animation without layout shifts */}
			<div className="relative flex items-center justify-center mb-8 pt-4" style={{ height: '120px', width: '100%' }}>
				{currentInstruction && (
					<motion.div
						key={currentInstruction.id}
						initial={prefersReducedMotion ? false : { opacity: 0 }}
						animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1 }}
						exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0 }}
						transition={{ 
							duration: prefersReducedMotion ? 0.01 : 0.2, // Faster, smoother animation
							ease: "easeOut"
						}}
						className="instruction-display w-full absolute inset-0 flex items-center justify-center"
						style={{
							color: currentInstruction.displayColor?.toLowerCase() || undefined,
							fontSize: '2rem',
							fontWeight: 'bold',
							textAlign: 'center',
							lineHeight: '1.1',
							padding: '0 20px',
							textShadow: '0 2px 4px rgba(0,0,0,0.3)',
							letterSpacing: '0.5px'
						}}
						aria-live="polite"
					>
						{currentInstruction.display}
					</motion.div>
				)}
			</div>

			{/* Timer Bar - Smooth and compact */}
			<div className="w-full max-w-lg mb-8" role="region" aria-label="Round timer">
				<div className="glass-card p-3">
					<div className="timer-bar"
						style={{
							transform: `scaleX(${(timeRemaining / Math.max(1, roundTimeLimit))})`,
							backgroundColor: timeRemaining > roundTimeLimit * 0.5 ? '#10b981' :
								timeRemaining > roundTimeLimit * 0.25 ? '#f59e0b' : '#ec4899',
							transition: 'transform 0.1s ease-out, background-color 0.3s ease'
						}}
					/>
					<div className="flex justify-between items-center mt-2">
						<div className="text-sm text-gray-400">
							Streak: {streak}
						</div>
						<div className="text-sm text-gray-300 font-medium" aria-live="polite">
						{Math.ceil(timeRemaining / 1000)}s remaining
						</div>
						<div className="text-sm text-gray-400">
							Lives: {lives - mistakes}
						</div>
					</div>
				</div>
			</div>

			{/* Answer Buttons - Perfect organization based on instruction type */}
			<div className="w-full max-w-2xl mx-auto mb-8">
				{/* Layout Title and Description */}
				<div className="text-center mb-6">
					<h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
					<p className="text-sm text-gray-400">{description}</p>
				</div>

				{/* Direction Layout - Cross pattern */}
				{layout === 'cross' && (
					<div className="grid grid-cols-3 gap-6 max-w-xs mx-auto">
						<div className="col-start-2">
							<AnswerButton answer={answers[0] || 'UP'} index={0} onClick={handleButtonClick} layout="cross" disabled={isProcessingAnswer} />
						</div>
						<div className="col-start-1 row-start-2">
							<AnswerButton answer={answers[1] || 'LEFT'} index={1} onClick={handleButtonClick} layout="cross" disabled={isProcessingAnswer} />
						</div>
						<div className="col-start-2 row-start-2">
							<AnswerButton answer={answers[2] || 'DOWN'} index={2} onClick={handleButtonClick} layout="cross" disabled={isProcessingAnswer} />
						</div>
						<div className="col-start-3 row-start-2">
							<AnswerButton answer={answers[3] || 'RIGHT'} index={3} onClick={handleButtonClick} layout="cross" disabled={isProcessingAnswer} />
						</div>
					</div>
				)}

				{/* Color Layout - 2x2 square */}
				{layout === 'square' && (
					<div className="grid grid-cols-2 gap-6 max-w-xs mx-auto">
						{answers.map((answer, index) => (
							<AnswerButton 
								key={answer} 
								answer={answer} 
								index={index} 
								onClick={handleButtonClick} 
								layout="square"
								disabled={isProcessingAnswer}
							/>
						))}
					</div>
				)}

				{/* Action Layout - Horizontal row */}
				{layout === 'horizontal' && (
					<div className="flex justify-center gap-6">
						{answers.map((answer, index) => (
							<AnswerButton 
								key={answer} 
								answer={answer} 
								index={index} 
								onClick={handleButtonClick} 
								layout="horizontal"
								disabled={isProcessingAnswer}
							/>
						))}
						</div>
				)}

				{/* Grid Layout - For combinations and all options */}
				{layout === 'grid' && (
					<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
						{answers.map((answer, index) => (
							<AnswerButton 
								key={answer} 
								answer={answer} 
								index={index} 
								onClick={handleButtonClick} 
								layout="grid"
								disabled={isProcessingAnswer}
							/>
						))}
					</div>
				)}
			</div>

			{/* Enhanced particle effects system */}
			<ParticleEffects
				type={showParticles}
				streak={streak}
				comboStreak={comboStreak}
				reactionTime={answerTime}
				onComplete={() => setShowParticles(null)}
			/>
			
			{/* Enhanced score animations */}
			<ScoreAnimations
				scoreGain={lastScoreGain}
				streak={streak}
				comboStreak={comboStreak}
				speedBonus={speedBonusActive}
				luckyMultiplier={luckyMultiplierActive ? luckyMultiplierValue : undefined}
				celebrationLevel={celebrationLevel}
				show={showScoreAnimation}
				onComplete={() => setShowScoreAnimation(false)}
			/>
			
			{/* Simple fallback effects for reduced motion */}
			{prefersReducedMotion && (
				<AnimatePresence>
					{showParticles === 'correct' && (
						<motion.div
							key="correct-simple"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.2 }}
							className="absolute inset-0 pointer-events-none flex items-center justify-center"
						>
							<div className="text-4xl text-green-400">✓</div>
						</motion.div>
					)}
					
					{showParticles === 'perfect' && (
						<motion.div
							key="perfect-simple"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.2 }}
							className="absolute inset-0 pointer-events-none flex items-center justify-center"
						>
							<div className="text-5xl text-yellow-400">⚡</div>
						</motion.div>
					)}
					
					{showParticles === 'incorrect' && (
						<motion.div
							key="incorrect-simple"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.2 }}
							className="absolute inset-0 pointer-events-none flex items-center justify-center"
						>
							<div className="text-4xl text-red-400">✗</div>
						</motion.div>
					)}
				</AnimatePresence>
			)}
			
			{/* Practice Mode Overlay */}
			<PracticeMode currentInstruction={currentInstruction} />
		</div>
	);
}

// World-class Answer Button Component
interface AnswerButtonProps {
	answer: string;
	index: number;
	onClick: (answer: string, event: React.MouseEvent | React.TouchEvent) => void;
	layout?: 'cross' | 'square' | 'horizontal' | 'grid';
	disabled?: boolean;
}

function AnswerButton({ answer, index, onClick, layout = 'grid', disabled = false }: AnswerButtonProps) {
	const { prefersReducedMotion } = useAnimation();

	return (
		<motion.button
			initial={prefersReducedMotion ? false : { opacity: 0 }}
			animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1 }}
			transition={{
				delay: prefersReducedMotion ? 0 : index * 0.1,
				duration: prefersReducedMotion ? 0.01 : 0.3,
				ease: "easeOut"
			}}
			whileHover={prefersReducedMotion || disabled ? undefined : {
				scale: 1.02,
				transition: { duration: 0.2, ease: "easeOut" }
			}}
			whileTap={prefersReducedMotion || disabled ? undefined : {
				scale: 0.98,
				transition: { duration: 0.1 }
			}}
			className={`answer-btn ${layout}-layout relative group interactive-hover ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
			onClick={(e) => !disabled && onClick(answer, e)}
			aria-label={`Answer ${answer}`}
			tabIndex={disabled ? -1 : 0}
			disabled={disabled}
			data-answer={answer}
		>
			<span className="relative z-10 font-bold text-base">{answer}</span>
			
			{/* Keyboard number hint */}
			{index < 9 && (
				<span className="absolute top-1 right-1 text-xs opacity-60 text-gray-400 font-bold">
					{index + 1}
				</span>
			)}

			{/* Enhanced Hover effect */}
			<div className="absolute inset-0 bg-gradient-to-r from-green-500 to-cyan-500 opacity-0 group-hover:opacity-15 transition-opacity duration-200" />
			
			{/* Enhanced Ripple Effect */}
			<div className="absolute inset-0 rounded-lg overflow-hidden">
				<div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-8 transition-opacity duration-200" />
			</div>
		</motion.button>
	);
}