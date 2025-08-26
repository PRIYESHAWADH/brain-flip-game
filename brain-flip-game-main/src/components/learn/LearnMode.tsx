"use client";
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { useAudio } from '@/hooks/useAudio';
import { useAnimation } from '@/hooks/useAnimation';
import { generateInstruction } from '@/utils/gameLogic';
import { Instruction } from '@/types/game';

interface LearnStep {
	id: string;
	title: string;
	description: string;
	instruction: Instruction;
	explanation: string;
	tips: string[];
}

const LEARN_STEPS: LearnStep[] = [
	{
		id: 'direction-basic',
		title: 'Direction Basics',
		description: 'Learn to do the OPPOSITE of direction commands',
		instruction: {
			id: 'learn-dir-1',
			type: 'direction',
			display: 'SWIPE UP',
			direction: 'UP',
			correctAnswer: 'DOWN',
			acceptableAnswers: ['DOWN'],
			timeLimit: 0, // No timer in learn mode
			displayColor: 'white'
		} as any,
		explanation: 'When you see "SWIPE UP", you should click DOWN because it\'s the opposite direction.',
		tips: [
			'Always think opposite: UP → DOWN, LEFT → RIGHT',
			'Ignore the action word (SWIPE) and focus on the direction',
			'Take your time to understand the pattern'
		]
	},
	{
		id: 'color-basic',
		title: 'Color Rules',
		description: 'Learn to avoid forbidden colors',
		instruction: {
			id: 'learn-color-1',
			type: 'color',
			display: 'RED',
			color: 'RED',
			displayColor: 'BLUE',
			correctAnswer: 'GREEN',
			acceptableAnswers: ['GREEN', 'YELLOW'],
			timeLimit: 0
		} as any,
		explanation: 'The word is RED and it\'s shown in BLUE color. You cannot click RED (the word) or BLUE (the display color). So GREEN or YELLOW are correct.',
		tips: [
			'Avoid both the word color AND the display color',
			'If RED is shown in BLUE, avoid both RED and BLUE',
			'Any other color is correct'
		]
	},
	{
		id: 'action-basic',
		title: 'Action Commands',
		description: 'Learn opposite actions',
		instruction: {
			id: 'learn-action-1',
			type: 'action',
			display: 'TAP',
			action: 'TAP',
			correctAnswer: 'HOLD',
			acceptableAnswers: ['HOLD'],
			timeLimit: 0
		} as any,
		explanation: 'When you see TAP, you should click HOLD because they are opposite actions.',
		tips: [
			'TAP ↔ HOLD are opposites',
			'SWIPE is opposite to both TAP and HOLD',
			'Think of opposite physical actions'
		]
	},
	{
		id: 'combo-basic',
		title: 'Combination Challenge',
		description: 'Learn color + direction combos',
		instruction: {
			id: 'learn-combo-1',
			type: 'combo',
			display: 'GREEN UP',
			color: 'GREEN',
			direction: 'UP',
			displayColor: 'YELLOW',
			correctAnswer: 'RED DOWN',
			acceptableAnswers: ['RED UP', 'RED DOWN', 'RED LEFT', 'RED RIGHT', 'BLUE UP', 'BLUE DOWN', 'BLUE LEFT', 'BLUE RIGHT'],
			timeLimit: 0
		} as any,
		explanation: 'GREEN UP is shown in YELLOW. Avoid GREEN (word) and YELLOW (display). Any other color + any direction works!',
		tips: [
			'Avoid the word color AND display color',
			'Any direction is acceptable',
			'Focus on picking a safe color first'
		]
	}
];

export default function LearnMode() {
	const { playCorrect, playIncorrect } = useAudio();
	const { prefersReducedMotion } = useAnimation();
	
	const [currentStep, setCurrentStep] = useState(0);
	const [showExplanation, setShowExplanation] = useState(true);
	const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
	const [showFeedback, setShowFeedback] = useState(false);
	const [isCorrect, setIsCorrect] = useState(false);
	const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

	// Generate answer options based on instruction type
		switch (instruction.type) {
			case 'direction':
				return ['UP', 'DOWN', 'LEFT', 'RIGHT'];
			case 'color':
				return ['RED', 'GREEN', 'BLUE', 'YELLOW'];
			case 'action':
				return ['TAP', 'HOLD', 'SWIPE'];
			case 'combo':
				const combos: string[] = [];
				for (const color of colors) {
					for (const direction of directions) {
						combos.push(`${color} ${direction}`);
					}
				}
				return combos.slice(0, 8); // Show first 8 combinations
			default:
				return ['A', 'B', 'C', 'D'];
		}
	};
		if (selectedAnswer) return; // Prevent multiple selections
		
		setSelectedAnswer(answer);
		setIsCorrect(correct);
		setShowFeedback(true);
		
		if (correct) {
			playCorrect();
			    setCompletedSteps(prev => new Set([...Array.from(prev), currentStep]));
		} else {
			playIncorrect();
		}
	};
		if (currentStep < LEARN_STEPS.length - 1) {
			setCurrentStep(currentStep + 1);
			resetStep();
		}
	};
		if (currentStep > 0) {
			setCurrentStep(currentStep - 1);
			resetStep();
		}
	};
		setSelectedAnswer(null);
		setShowFeedback(false);
		setIsCorrect(false);
		setShowExplanation(true);
	};
		resetStep();
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
			{/* Background effects */}
			<div className="absolute inset-0">
				{[...Array(8)].map((_, i) => (
					<motion.div
						key={i}
						className="absolute w-1 h-1 bg-indigo-400 rounded-full opacity-40"
						style={{
							left: `${10 + i * 12}%`,
							top: `${15 + i * 10}%`,
						}}
						animate={{
							y: [-10, 10, -10],
							x: [-6, 6, -6],
							opacity: [0.2, 0.6, 0.2],
							scale: [0.8, 1.2, 0.8],
						}}
						transition={{
							duration: 4 + i * 0.5,
							repeat: Infinity,
							ease: "easeInOut"
						}}
					/>
				))}
			</div>

			<div className="relative z-10 min-h-screen flex flex-col p-6">
				{/* Header */}
				<motion.div
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					className="text-center mb-8"
				>
					<h1 className="text-4xl md:text-5xl font-orbitron font-bold mb-4 text-gradient">
						Learn & Practice
					</h1>
					<p className="text-xl text-text-secondary">
						Master the rules at your own pace - no pressure, no timer
					</p>
				</motion.div>

				{/* Progress Bar */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="max-w-2xl mx-auto mb-8 w-full"
				>
					<div className="flex justify-between items-center mb-4">
						<h2 className="text-xl font-bold">Step {currentStep + 1} of {LEARN_STEPS.length}</h2>
						<div className="text-sm text-gray-400">
							{completedSteps.size} completed
						</div>
					</div>
					<div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
						<motion.div
							className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
							style={{ width: `${((currentStep + 1) / LEARN_STEPS.length) * 100}%` }}
							transition={{ duration: 0.5 }}
						/>
					</div>
				</motion.div>

				{/* Main Content */}
				<div className="flex-1 max-w-4xl mx-auto w-full">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
						{/* Left Side - Instruction */}
						<motion.div
							key={currentStep}
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							className="space-y-6"
						>
							{/* Step Info */}
							<div className="glass-card p-6">
								<h3 className="text-2xl font-bold mb-2">{currentLearnStep.title}</h3>
								<p className="text-gray-300 mb-4">{currentLearnStep.description}</p>
								
								{/* Instruction Display */}
								<div className="bg-gray-800 rounded-lg p-8 text-center mb-4">
									<div
										className="text-4xl font-bold"
										style={{ 
											color: currentLearnStep.instruction.displayColor?.toLowerCase() || 'white'
										}}
									>
										{currentLearnStep.instruction.display}
									</div>
								</div>
								
								{/* Show explanation initially */}
								<AnimatePresence>
									{showExplanation && !showFeedback && (
										<motion.div
											initial={{ opacity: 0, height: 0 }}
											animate={{ opacity: 1, height: 'auto' }}
											exit={{ opacity: 0, height: 0 }}
											className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4"
										>
											<h4 className="font-bold text-blue-300 mb-2">💡 Explanation:</h4>
											<p className="text-blue-100 text-sm">{currentLearnStep.explanation}</p>
										</motion.div>
									)}
								</AnimatePresence>

								{/* Show feedback after answer */}
								<AnimatePresence>
									{showFeedback && (
										<motion.div
											initial={{ opacity: 0, height: 0 }}
											animate={{ opacity: 1, height: 'auto' }}
											exit={{ opacity: 0, height: 0 }}
											className={`border rounded-lg p-4 ${
												isCorrect 
													? 'bg-green-500/20 border-green-500/30' 
													: 'bg-red-500/20 border-red-500/30'
											}`}
										>
											<h4 className={`font-bold mb-2 ${
												isCorrect ? 'text-green-300' : 'text-red-300'
											}`}>
												{isCorrect ? '✅ Correct!' : '❌ Not quite right'}
											</h4>
											<p className={`text-sm mb-3 ${
												isCorrect ? 'text-green-100' : 'text-red-100'
											}`}>
												{isCorrect 
													? 'Great job! You understood the rule correctly.'
													: `You selected "${selectedAnswer}" but the correct answers are: ${currentLearnStep.instruction.acceptableAnswers.join(', ')}`
												}
											</p>
											<div className="flex gap-2">
												{isCorrect ? (
													<button
														onClick={nextStep}
														disabled={currentStep >= LEARN_STEPS.length - 1}
														className="btn-primary text-sm disabled:opacity-50"
													>
														{currentStep >= LEARN_STEPS.length - 1 ? 'Completed!' : 'Next Step'}
													</button>
												) : (
													<button
														onClick={tryAgain}
														className="btn-secondary text-sm"
													>
														Try Again
													</button>
												)}
											</div>
										</motion.div>
									)}
								</AnimatePresence>
							</div>

							{/* Tips */}
							<div className="glass-card p-6">
								<h4 className="font-bold mb-3 text-yellow-300">💡 Pro Tips:</h4>
								<ul className="space-y-2">
									{currentLearnStep.tips.map((tip, index) => (
										<li key={index} className="text-sm text-gray-300 flex items-start gap-2">
											<span className="text-yellow-400 mt-1">•</span>
											{tip}
										</li>
									))}
								</ul>
							</div>
						</motion.div>

						{/* Right Side - Answer Options */}
						<motion.div
							key={`answers-${currentStep}`}
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							className="space-y-6"
						>
							<div className="glass-card p-6">
								<h4 className="font-bold mb-4">Choose your answer:</h4>
								
								<div className="grid grid-cols-2 gap-3">
									{getAnswerOptions(currentLearnStep.instruction).map((option, index) => (
										<motion.button
											key={option}
											whileHover={!selectedAnswer ? { scale: 1.02 } : {}}
											whileTap={!selectedAnswer ? { scale: 0.98 } : {}}
											onClick={() => !selectedAnswer && handleAnswer(option)}
											disabled={!!selectedAnswer}
											className={`p-4 rounded-lg font-bold transition-all duration-200 ${
												selectedAnswer === option
													? isCorrect
														? 'bg-green-500 text-white'
														: 'bg-red-500 text-white'
													: selectedAnswer
														              ? (currentLearnStep.instruction.acceptableAnswers as string[]).includes(option)
															? 'bg-green-500/30 border border-green-500/50 text-green-300'
															: 'bg-gray-700 text-gray-400'
														: 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-600 hover:border-gray-500'
											}`}
										>
											{option}
											{index < 9 && (
												<span className="absolute top-1 right-1 text-xs opacity-60">
													{index + 1}
												</span>
											)}
										</motion.button>
									))}
								</div>
								
								{!selectedAnswer && (
									<p className="text-xs text-gray-400 mt-4 text-center">
										💡 Take your time - there's no timer in learn mode
									</p>
								)}
							</div>

							{/* Navigation */}
							<div className="flex justify-between">
								<button
									onClick={prevStep}
									disabled={currentStep === 0}
									className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
								>
									← Previous
								</button>
								
								<div className="text-center">
									<div className="text-sm text-gray-400 mb-2">Progress</div>
									<div className="flex gap-2">
										{LEARN_STEPS.map((_, index) => (
											<div
												key={index}
												className={`w-3 h-3 rounded-full ${
													index === currentStep
														? 'bg-purple-500'
														: completedSteps.has(index)
															? 'bg-green-500'
															: 'bg-gray-600'
												}`}
											/>
										))}
									</div>
								</div>
								
								<button
									onClick={nextStep}
									disabled={currentStep >= LEARN_STEPS.length - 1}
									className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
								>
									Next →
								</button>
							</div>
						</motion.div>
					</div>
				</div>

				{/* Completion Message */}
				{completedSteps.size === LEARN_STEPS.length && (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
					>
						<div className="glass-card p-8 max-w-md text-center">
							<div className="text-6xl mb-4">🎉</div>
							<h2 className="text-2xl font-bold mb-4">Congratulations!</h2>
							<p className="text-gray-300 mb-6">
								You've completed all learning steps! You're ready to play the real game.
							</p>
							<button
								onClick={() => window.location.href = '/game'}
								className="btn-primary w-full"
							>
								Start Playing!
							</button>
						</div>
					</motion.div>
				)}
			</div>
		</div>
	);
}
