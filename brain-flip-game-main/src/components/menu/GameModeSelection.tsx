"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import HowToPlay from '../ui/HowToPlay';

interface GameMode {
	id: string;
	name: string;
	description: string;
	icon: string;
	duration: string;
	lives: string;
	difficulty: string;
	features: string[];
}

const gameModesData: GameMode[] = [
	{
		id: 'classic',
		name: 'Classic',
		description: 'Perfect your skills with balanced gameplay',
		icon: '🎯',
		duration: '60s',
		lives: '3',
		difficulty: 'Balanced',
		features: ['Progressive difficulty', 'Exponential scoring', 'Achievement tracking']
	},
	{
		id: 'duel',
		name: 'Duel',
		description: 'Fast-paced competitive challenge',
		icon: '⚔️',
		duration: '45s',
		lives: '2',
		difficulty: 'Hard',
		features: ['Speed bonus', 'Combo multipliers', 'Lightning reactions']
	},
	{
		id: 'sudden-death',
		name: 'Sudden Death',
		description: 'One mistake and it\'s over',
		icon: '💀',
		duration: '90s',
		lives: '1',
		difficulty: 'Extreme',
		features: ['Perfect precision', 'Golden moments', 'Legendary rewards']
	}
];

export default function GameModeSelection() {
	const { startGame, resetGame, personalBests } = useGameStore();
	const [showRules, setShowRules] = useState(false);
		console.log('[GameModeSelection] Mode selected:', mode);
		if (!mode) return;
		
		// Clear any prior game state and start fresh - prevent race condition
		resetGame();
		// Use setTimeout to ensure state is properly reset before starting
		setTimeout(() => {
			try {
				startGame(mode as any);
				console.log('[GameModeSelection] Game started successfully');
			} catch (error) {
				console.error('[GameModeSelection] Error starting game:', error);
			}
		}, 50);
	};
		return personalBests[modeId as keyof typeof personalBests] || 0;
	};

	return (
		<div className="w-full max-w-6xl mx-auto p-6">
			{/* Enhanced Header */}
			<motion.div
				initial={{ opacity: 0, y: -30 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.8, ease: "easeOut" }}
				className="text-center mb-12 relative z-20"
			>
				<h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent relative z-20">
					Choose Your Challenge
				</h1>
				<p className="text-xl text-gray-300 max-w-2xl mx-auto relative z-20">
					Select a game mode that matches your skill level and preferred challenge intensity
				</p>
			</motion.div>

			{/* Enhanced Game Mode Cards */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
				{gameModesData.map((mode, index) => (
					<motion.div
						key={mode.id}
						initial={{ opacity: 0, y: 50, scale: 0.9 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						transition={{ 
							duration: 0.6, 
							delay: index * 0.2, 
							ease: "easeOut" 
						}}
						whileHover={{ 
							scale: 1.05, 
							y: -10,
							transition: { duration: 0.3 }
						}}
						className="game-mode-card relative overflow-hidden group"
					>
						{/* Background Gradient */}
						<div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
						
						{/* Mode Icon */}
						<motion.div
							initial={{ scale: 0 }}
							animate={{ scale: 1 }}
							transition={{ delay: index * 0.2 + 0.3, type: "spring", bounce: 0.4 }}
							className="text-6xl mb-6 relative z-10"
						>
							{mode.icon}
						</motion.div>

						{/* Mode Info */}
						<div className="relative z-10">
							<h3 className="text-2xl font-bold mb-3 text-purple-400">{mode.name}</h3>
							<p className="text-gray-300 mb-4 leading-relaxed">{mode.description}</p>
							
							{/* Stats Grid */}
							<div className="grid grid-cols-2 gap-4 mb-6">
								<div className="text-center">
									<div className="text-sm text-gray-400 uppercase tracking-wide mb-1">Duration</div>
									<div className="text-lg font-bold text-cyan-400">{mode.duration}</div>
								</div>
								<div className="text-center">
									<div className="text-sm text-gray-400 uppercase tracking-wide mb-1">Lives</div>
									<div className="text-lg font-bold text-green-400">{mode.lives}</div>
								</div>
							</div>

							{/* Difficulty Badge */}
							<div className="flex items-center justify-center mb-6">
								<span className={`px-4 py-2 rounded-full text-sm font-bold ${
									mode.difficulty === 'Balanced' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
									mode.difficulty === 'Hard' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
									'bg-red-500/20 text-red-400 border border-red-500/30'
								}`}>
									{mode.difficulty} Difficulty
								</span>
							</div>

							{/* Features List */}
							<div className="mb-6">
								<div className="text-sm text-gray-400 uppercase tracking-wide mb-3">Features</div>
								<ul className="space-y-2">
									{mode.features.map((feature, featureIndex) => (
										<motion.li
											key={featureIndex}
											initial={{ opacity: 0, x: -20 }}
											animate={{ opacity: 1, x: 0 }}
											transition={{ delay: index * 0.2 + 0.5 + featureIndex * 0.1 }}
											className="flex items-center text-sm text-gray-300"
										>
											<span className="text-green-400 mr-2">✓</span>
											{feature}
										</motion.li>
									))}
								</ul>
							</div>

							{/* Performance Stats */}
							<div className="mb-6 p-4 glass-card border border-purple-500/20">
								<div className="text-center">
									<div className="text-sm text-gray-400 mb-2">Your Best</div>
									<div className="text-2xl font-bold text-yellow-400">
										{getBestScoreForMode(mode.id) > 0 ? getBestScoreForMode(mode.id).toLocaleString() : 'No score yet'}
									</div>
									<div className="text-xs text-gray-400">
										{getBestScoreForMode(mode.id) > 0 ? 'Personal Record' : 'Start playing to set a record!'}
									</div>
								</div>
							</div>

							{/* Start Button */}
							<motion.button
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								onClick={() => handleModeSelect(mode.id)}
								className="w-full btn-primary text-lg py-4 relative overflow-hidden group"
							>
								<span className="relative z-10 flex items-center justify-center gap-2">
									<span>🎮</span>
									Start {mode.name}
								</span>
								<div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
							</motion.button>
						</div>

						{/* Hover Glow Effect */}
						<div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
							<div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-cyan-500/20 rounded-xl blur-xl" />
						</div>
					</motion.div>
				))}
			</div>

			{/* Enhanced Action Section */}
			<motion.div
				initial={{ opacity: 0, y: 30 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.8, delay: 0.8 }}
				className="text-center space-y-6"
			>
				{/* How to Play Button */}
				<div>
					<motion.button
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						onClick={() => setShowRules(true)}
						className="enhanced-secondary-btn text-lg px-8 py-4"
					>
						<span>❓</span>
						How to Play
					</motion.button>
				</div>

				{/* Weekly Tournament */}
				<motion.div
					initial={{ opacity: 0, scale: 0.9 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.6, delay: 1 }}
					className="glass-card p-8 border border-yellow-500/30"
				>
					<div className="flex items-center justify-center gap-4 mb-4">
						<span className="text-4xl">🏆</span>
						<h3 className="text-2xl font-bold text-yellow-400">Weekly Tournament</h3>
					</div>
					<p className="text-gray-300 mb-6">
						Compete against players worldwide in this week's special challenge!
					</p>
					<motion.button
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						className="enhanced-accent-btn"
					>
						Join This Week's Challenge
					</motion.button>
				</motion.div>

				{/* Battle Lobby */}
				<motion.div
					initial={{ opacity: 0, scale: 0.9 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.6, delay: 1.2 }}
					className="glass-card p-8 border border-pink-500/30"
				>
					<div className="flex items-center justify-center gap-4 mb-4">
						<span className="text-4xl">⚔️</span>
						<h3 className="text-2xl font-bold text-pink-400">Battle Lobby</h3>
					</div>
					<p className="text-gray-300 mb-6">
						Challenge your friends in real-time head-to-head matches!
					</p>
					<motion.button
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						className="enhanced-primary-btn"
					>
						Enter Battle Arena
					</motion.button>
				</motion.div>
			</motion.div>

			{/* How to Play Modal */}
			{showRules && (
				<HowToPlay 
					isOpen={showRules}
					onClose={() => setShowRules(false)}
				/>
			)}
		</div>
	);
}