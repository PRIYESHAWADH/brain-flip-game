'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '@/store/gameStore'
import InteractiveRules from './InteractiveRules'

interface GameMode {
	id: string
	name: string
	description: string
	icon: string
	duration: string
	lives: string
	difficulty: string
}

const gameModesData: GameMode[] = [
	{
		id: 'classic',
		name: 'Classic',
		description: 'Perfect for learning and practice',
		icon: '🎯',
		duration: '60s',
		lives: '3',
		difficulty: 'Balanced'
	},
	{
		id: 'duel',
		name: 'Duel',
		description: 'More challenging, less room for error',
		icon: '⚔️',
		duration: '45s',
		lives: '2',
		difficulty: 'Hard'
	},
	{
		id: 'sudden-death',
		name: 'Sudden Death',
		description: 'One mistake ends the game',
		icon: '💀',
		duration: '90s',
		lives: '1',
		difficulty: 'Extreme'
	}
]

export default function GameMenu() {
	const { startGame, isActive, pauseGame, resumeGame, resetGame } = useGameStore()
	const [showRules, setShowRules] = useState(false)

	// Initialize showRules based on saved preference
	useEffect(() => {
		try {
			if (saved === '1') {
				setShowRules(false);
			}
		} catch {}
	}, [])
	
	if (isActive && !showRules) return null
		console.log('[GameMenu] Mode selected:', mode)
		if (!mode) return
		// Clear any prior game-over state and start fresh - prevent race condition
		resetGame()
		// Use setTimeout to ensure state is properly reset before starting
		setTimeout(() => {
			try {
				startGame(mode as any)
				console.log('[GameMenu] Game started successfully')
			} catch (error) {
				console.error('[GameMenu] Error starting game:', error)
			}
		}, 50)
	}
		console.log('[GameMenu] Opening rules')
		if (isActive) {
			pauseGame()
		}
		setShowRules(true)
	}
		console.log('[GameMenu] Closing rules')
		setShowRules(false)
		if (isActive) {
			resumeGame()
		}
	}
		console.log('[GameMenu] Navigating to leaderboard')
		window.location.href = '/leaderboard'
	}
		console.log('[GameMenu] Navigating to home')
		// Clear state before navigating home so returning won’t show GameOver
		resetGame()
		window.location.href = '/'
	}

	return (
		<div className="min-h-screen relative overflow-hidden" role="main" aria-label="Game mode selection">
			{/* Floating Elements */}
			<div className="fixed inset-0 z-0">
				{[...Array(6)].map((_, i) => (
					<motion.div
						key={i}
						className="absolute w-2 h-2 bg-brain-primary rounded-full opacity-20"
						style={{
							left: `${15 + i * 15}%`,
							top: `${10 + i * 15}%`,
						}}
						animate={{
							y: [-12, 12, -12],
							x: [-8, 8, -8],
							opacity: [0.1, 0.3, 0.1],
							scale: [0.8, 1.2, 0.8],
						}}
						transition={{
							duration: 8 + i * 0.5,
							repeat: Infinity,
							ease: "easeInOut"
						}}
					/>
				))}
			</div>

			{/* Main Content */}
			<div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">
				{/* Header */}
				<motion.div
					initial={{ opacity: 0, y: -30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, ease: "easeOut" }}
					className="text-center mb-16"
				>
					<h1 className="text-5xl md:text-6xl font-orbitron font-bold mb-4 text-gradient">
						Brain <span className="text-neon-blue">Flip</span>
					</h1>
					<p className="text-lg text-text-secondary font-light">
						Choose your challenge level
					</p>
				</motion.div>

				{/* Game Mode Cards */}
				<motion.div
					initial={{ opacity: 0, y: 40 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
					className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl mb-12"
				>
					{gameModesData.map((mode, index) => (
						<motion.div
							key={mode.id}
							initial={{ opacity: 0, y: 30 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.1 * index, ease: "easeOut" }}
							whileHover={{ y: -8, scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
							onClick={() => handleModeSelect(mode.id)}
							className="game-mode-card text-center group"
						>
							<div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">
								{mode.icon}
							</div>
							
							<h3 className="text-2xl font-orbitron font-bold mb-3 text-text-primary group-hover:text-brain-primary transition-colors duration-300">
								{mode.name}
							</h3>
							
							<p className="text-text-secondary mb-6 text-sm leading-relaxed">
								{mode.description}
							</p>
							
							<div className="space-y-2 mb-6">
								<div className="flex justify-between text-xs text-text-muted">
									<span>Duration:</span>
									<span className="text-brain-accent">{mode.duration}</span>
								</div>
								<div className="flex justify-between text-xs text-text-muted">
									<span>Lives:</span>
									<span className="text-brain-warning">{mode.lives}</span>
								</div>
								<div className="flex justify-between text-xs text-text-muted">
									<span>Difficulty:</span>
									<span className={`font-semibold ${
										mode.difficulty === 'Balanced' ? 'text-brain-success' :
										mode.difficulty === 'Hard' ? 'text-brain-warning' :
										'text-brain-danger'
									}`}>
										{mode.difficulty}
									</span>
								</div>
							</div>
							
							<div className="flex items-center justify-center text-sm text-brain-primary font-medium group-hover:text-white transition-colors">
								<span>Start Game</span>
								<svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
								</svg>
							</div>
						</motion.div>
					))}
				</motion.div>

				{/* Action Buttons */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
					className="flex flex-col sm:flex-row gap-4 w-full max-w-2xl justify-center items-center mx-auto"
				>
					<motion.button
						whileHover={{ scale: 1.02 }}
						whileTap={{ scale: 0.98 }}
						onClick={handleHomeClick}
						className="glass-card px-6 py-3 text-brain-success hover:text-white font-medium transition-colors duration-200 flex items-center justify-center gap-2"
					>
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
						</svg>
						Home
					</motion.button>
					
					<motion.button
						whileHover={{ scale: 1.02 }}
						whileTap={{ scale: 0.98 }}
						onClick={handleRulesOpen}
						className="btn-primary flex items-center justify-center gap-2"
					>
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						How to Play
					</motion.button>
					
					<motion.button
						whileHover={{ scale: 1.02 }}
						whileTap={{ scale: 0.98 }}
						onClick={handleLeaderboardClick}
						className="glass-card px-6 py-3 text-brain-accent hover:text-white font-medium transition-colors duration-200 flex items-center justify-center gap-2"
					>
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
						</svg>
						Leaderboard
					</motion.button>
				</motion.div>

				{/* Footer */}
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.8, delay: 0.8 }}
					className="mt-12 text-center text-text-muted"
				>
					<p className="text-sm font-light">
						Think Fast • Think Backwards • Think Different
					</p>
				</motion.div>
			</div>

			{/* Interactive Rules Modal */}
			{showRules && (
				<InteractiveRules 
					isOpen={showRules}
					onClose={handleRulesClose}
				/>
			)}
		</div>
	)
}