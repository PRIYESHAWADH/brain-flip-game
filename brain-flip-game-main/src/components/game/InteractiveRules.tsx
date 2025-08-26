"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface InteractiveRulesProps {
	isOpen: boolean;
	onClose: () => void;
}

// 12 COMPREHENSIVE RULES - COMPLETE GAME GUIDE INCLUDING SCORING & ACHIEVEMENTS
const RULES = [
	{
		title: '🧠 The Core Concept',
		description: 'Brain Flip is simple: ALWAYS do the OPPOSITE of what you see. This is the golden rule.',
		examples: [
			{ see: 'UP', click: 'DOWN', why: 'Always think opposite directions' },
			{ see: 'LEFT', click: 'RIGHT', why: 'Left becomes right, always reverse' },
			{ see: 'TAP', click: 'HOLD', why: 'Opposite actions - tap becomes hold' }
		]
	}
];

export default function InteractiveRules({ isOpen, onClose }: InteractiveRulesProps) {
	const [currentSlide, setCurrentSlide] = useState(0);

	const currentRule = RULES[currentSlide];
	const isFirstSlide = currentSlide === 0;
	const isLastSlide = currentSlide === RULES.length - 1;

	const nextSlide = () => {
		if (currentSlide < RULES.length - 1) {
			setCurrentSlide(currentSlide + 1);
		}
	};

	const previousSlide = () => {
		if (currentSlide > 0) {
			setCurrentSlide(currentSlide - 1);
		}
	};

	const goToSlide = (index: number) => {
		if (index >= 0 && index < RULES.length) {
			setCurrentSlide(index);
		}
	};

	// Keyboard navigation
	useEffect(() => {
		if (!isOpen) return;

		const handleKeyDown = (e: KeyboardEvent) => {
			switch (e.key) {
				case 'ArrowLeft':
					e.preventDefault();
					previousSlide();
					break;
				case 'ArrowRight':
					e.preventDefault();
					nextSlide();
					break;
				case 'Escape':
					e.preventDefault();
					onClose();
					break;
			}
		};

		document.addEventListener('keydown', handleKeyDown);
		return () => document.removeEventListener('keydown', handleKeyDown);
	}, [isOpen, currentSlide]);

	if (!isOpen) return null;

	return (
		<AnimatePresence>
			<div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
				{/* Background */}
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					onClick={(e) => e.target === e.currentTarget && onClose()}
					className="absolute inset-0 bg-black/70"
				/>

				{/* Modal */}
				<motion.div
					initial={{ opacity: 0, scale: 0.9 }}
					animate={{ opacity: 1, scale: 1 }}
					exit={{ opacity: 0, scale: 0.9 }}
					className="relative z-10 w-full max-w-4xl max-h-[90vh] bg-gray-900 border border-purple-500/30 rounded-2xl shadow-2xl overflow-hidden"
				>
					{/* Header */}
					<div className="p-6 border-b border-purple-500/30">
						<div className="flex justify-between items-center">
							<h2 className="text-2xl font-bold text-white">
								{currentRule.title}
							</h2>
							<button
								onClick={onClose}
								className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 hover:bg-red-600 hover:text-white transition-colors"
							>
								<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						</div>
					</div>

					{/* Content */}
					<div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
						<p className="text-lg text-gray-300 mb-6 leading-relaxed">
							{currentRule.description}
						</p>

						{/* Examples */}
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							{currentRule.examples.map((example, index) => (
								<div key={index} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
									<div className="mb-3">
										<span className="text-xs text-gray-400 uppercase">You See:</span>
										<div className="text-lg font-bold text-purple-400 mt-1 p-2 bg-gray-700 rounded">
											{example.see}
										</div>
									</div>

									<div className="mb-3">
										<span className="text-xs text-gray-400 uppercase">You Click:</span>
										<div className="text-lg font-bold text-green-400 mt-1 p-2 bg-gray-700 rounded">
											{example.click}
										</div>
									</div>

									<div>
										<span className="text-xs text-gray-400 uppercase">Why:</span>
										<div className="text-sm text-gray-300 mt-1">
											{example.why}
										</div>
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Footer Navigation */}
					<div className="p-6 border-t border-purple-500/30">
						<div className="flex justify-between items-center">
							{/* Previous Button */}
							<button
								onClick={previousSlide}
								disabled={isFirstSlide}
								className="bg-gray-800 px-4 py-2 text-white hover:text-purple-400 font-medium flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded"
							>
								<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
								</svg>
								Previous
							</button>

							{/* Progress Dots */}
							<div className="flex flex-col items-center gap-2">
								<div className="flex items-center gap-2">
									{RULES.map((_, index) => (
										<button
											key={index}
											onClick={() => goToSlide(index)}
											className={`w-3 h-3 rounded-full transition-colors ${
												index === currentSlide ? 'bg-purple-400' : 'bg-gray-600 hover:bg-purple-600'
											}`}
											title={`Slide ${index + 1}: ${RULES[index].title}`}
										/>
									))}
								</div>
								<span className="text-sm text-gray-400">
									{currentSlide + 1} of {RULES.length}
								</span>
							</div>

							{/* Next/Finish Button */}
							{isLastSlide ? (
								<button
									onClick={onClose}
									className="bg-purple-600 hover:bg-purple-700 px-6 py-2 font-medium flex items-center gap-2 text-white rounded"
								>
									🎮 Start Playing!
								</button>
							) : (
								<button
									onClick={nextSlide}
									className="bg-gray-800 px-4 py-2 text-white hover:text-purple-400 font-medium flex items-center gap-2 transition-colors rounded"
								>
									Next
									<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
									</svg>
								</button>
							)}
						</div>

						{/* Keyboard Hints */}
						<div className="mt-4 text-center text-xs text-gray-400">
							💡 Use ← → arrow keys to navigate • Esc to close
						</div>
					</div>
				</motion.div>
			</div>
		</AnimatePresence>
	);
}