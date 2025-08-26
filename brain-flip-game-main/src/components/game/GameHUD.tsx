"use client";
import { useEffect, useRef, useState, memo, useMemo, useCallback } from 'react';
import { useGameStore, livesForMode } from '@/store/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { useAudio } from '@/hooks/useAudio';
import InteractiveRules from './InteractiveRules';
import ChallengeProgress from './ChallengeProgress';

function GameHUD() {
	const { 
		score, streak, level, mistakes, timeRemaining, roundTimeLimit, gameMode, isActive, hasStarted, 
		pauseGame, resumeGame, currentMultiplier, nextPotentialScore, speedBonusActive, lastScoreGain,
		celebrationLevel, perfectRounds, lightningReactions, dailyStreak,
		personalBest, comboStreak, lastLuckyMultiplier, goldenActive, goldenValue,
		practiceMode, flowStateAnalysis, togglePracticeMode
	} = useGameStore();

	const [rulesOpen, setRulesOpen] = useState(false);
	const [showScoreAnimation, setShowScoreAnimation] = useState(false);
	const prevScore = useRef(0);

	// Score animation effect
	useEffect(() => {
		if (score > prevScore.current && lastScoreGain > 0) {
			setShowScoreAnimation(true);
			const timer = setTimeout(() => setShowScoreAnimation(false), 2000);
			prevScore.current = score;
			return () => clearTimeout(timer);
		}
	}, [score, lastScoreGain]);

	const handleRulesOpen = useCallback(() => {
		if (isActive) {
			pauseGame();
		}
		setRulesOpen(true);
	}, [isActive, pauseGame]);

	const handleRulesClose = useCallback(() => {
		setRulesOpen(false);
		if (isActive) {
			resumeGame();
		}
	}, [isActive, resumeGame]);

	// Memoize heavy computation sections
	const memoizedScoreSection = useMemo(() => (
		<div className="flex items-center justify-center mb-6 relative">
			<div className="glass-card px-8 py-4 text-center relative overflow-hidden" role="region" aria-label="Score">
				<span className="text-gray-400 text-sm font-medium uppercase tracking-wide block mb-1">Score</span>
				<motion.div
					key={score}
					initial={{ scale: 0.8, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
					className="relative"
				>
					<span className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent block" aria-live="polite">
						{score.toLocaleString()}
					</span>
					
					{/* Personal Best Indicator */}
					{score === personalBest && personalBest > 0 && (
						<motion.div
							initial={{ scale: 0, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							className="absolute -top-2 -right-2 bg-neon-yellow text-bg-primary text-xs px-2 py-1 rounded-full font-bold"
						>
							PB!
						</motion.div>
					)}
				</motion.div>
				
				{/* Enhanced Next Potential Score Preview with Flow State Indicators */}
				{isActive && (
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						className="mt-2 text-center"
					>
						<div className="text-sm text-green-400 font-medium mb-1">
							Next: +{nextPotentialScore.toLocaleString()}
							{speedBonusActive && <span className="text-yellow-400 ml-1">⚡ LIGHTNING!</span>}
							{(lastLuckyMultiplier && lastLuckyMultiplier > 1) && (
								<span className="ml-2 text-pink-400 animate-pulse">x{lastLuckyMultiplier} LUCKY!</span>
							)}
							{comboStreak >= 5 && (
								<span className="ml-2 text-purple-400 animate-pulse">🔥 COMBO x{comboStreak}</span>
							)}
						</div>
						
						{/* Flow State Indicator */}
						{streak >= 5 && comboStreak >= 3 && (
							<motion.div
								initial={{ scale: 0 }}
								animate={{ scale: 1 }}
								className="text-xs text-purple-400 font-bold mb-1 animate-pulse"
							>
								🧠 FLOW STATE ACTIVATED 🧠
							</motion.div>
						)}
						
						{streak > 0 && (
							<div className="text-xs text-gray-400">
								Streak: {streak} → Exponential Growth Active!
								{perfectRounds > 0 && (
									<span className="ml-2 text-blue-400">Perfect: {perfectRounds}</span>
								)}
							</div>
						)}
						{streak === 0 && (
							<div className="text-xs text-yellow-400 animate-pulse">
								Start your streak: 10 → 20 → 40 → 80 → 160 → 320...
							</div>
						)}
						
						{/* Performance Feedback */}
						{lightningReactions >= 3 && (
							<div className="text-xs text-yellow-300 mt-1">
								⚡ Lightning Master: {lightningReactions} fast reactions!
							</div>
						)}
					</motion.div>
				)}
			</div>
			
			{/* Score Gain Animation */}
			<AnimatePresence>
				{showScoreAnimation && lastScoreGain > 0 && (
					<motion.div
						initial={{ opacity: 0, scale: 0.5, y: 0 }}
						animate={{ opacity: 1, scale: 1, y: -50 }}
						exit={{ opacity: 0, scale: 0.5, y: -100 }}
						transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
						className={`absolute top-0 right-0 pointer-events-none font-bold text-2xl ${
							celebrationLevel === 'legendary' ? 'text-purple-400' :
							celebrationLevel === 'amazing' ? 'text-pink-400' :
							celebrationLevel === 'great' ? 'text-yellow-400' :
							celebrationLevel === 'good' ? 'text-green-400' :
							'text-blue-400'
						}`}
						style={{
							textShadow: '0 0 20px currentColor',
							filter: celebrationLevel === 'legendary' ? 'drop-shadow(0 0 30px currentColor)' : undefined
						}}
					>
						+{lastScoreGain.toLocaleString()}
						{celebrationLevel === 'legendary' && '✨'}
						{celebrationLevel === 'amazing' && '🔥'}
						{celebrationLevel === 'great' && '⭐'}
						{speedBonusActive && '⚡'}
						{(lastLuckyMultiplier && lastLuckyMultiplier > 1) && ' ✨'}
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	), [score, personalBest, isActive, nextPotentialScore, speedBonusActive, lastLuckyMultiplier, streak, showScoreAnimation, lastScoreGain, celebrationLevel]);

	const memoizedStatsRow = useMemo(() => (
		<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
			{/* Streak with Multiplier */}
			<div className="glass-card p-4 text-center relative" role="region" aria-label="Current streak">
				<span className="text-gray-400 text-xs font-medium uppercase tracking-wide block mb-2">Streak</span>
				<motion.div
					key={streak}
					initial={{ scale: 0.8 }}
					animate={{ scale: 1 }}
					transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
					className="flex items-center justify-center"
				>
					<span className="text-2xl font-bold text-pink-400 mr-2" aria-live="polite">
						{streak}
					</span>
					{streak > 0 && <span className="text-pink-400">🔥</span>}
				</motion.div>
				{/* Current Multiplier */}
				{streak > 0 && (
					<div className="text-xs text-green-400 mt-1 font-medium">
						{currentMultiplier}x multiplier
					</div>
				)}
				{/* Streak milestone indicator */}
				{streak > 0 && (
					<div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-pink-400 animate-pulse" />
				)}
			</div>

			{/* Level */}
			<div className="glass-card p-4 text-center" role="region" aria-label="Current level">
				<span className="text-gray-400 text-xs font-medium uppercase tracking-wide block mb-2">Level</span>
				<motion.span
					key={level}
					initial={{ scale: 0.8 }}
					animate={{ scale: 1 }}
					transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
					className="text-2xl font-bold text-blue-400 block"
					aria-live="polite"
				>
					{level}
				</motion.span>
				<div className="w-full h-1 bg-gray-700 rounded-full mt-2 overflow-hidden">
					<motion.div
						className="h-full bg-gradient-to-r from-neon-blue to-neon-cyan rounded-full"
						initial={{ width: 0 }}
						animate={{ width: `${Math.min(level * 3.33, 100)}%` }}
						transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
					/>
				</div>
			</div>

			{/* Lives */}
			<div className="glass-card p-4 text-center" role="group" aria-label="Lives remaining">
				<span className="text-text-muted text-xs font-medium uppercase tracking-wide block mb-2">Lives</span>
				<div className="flex justify-center gap-1">
					{isActive && Array.from({ length: livesForMode(gameMode) }).map((_, i) => (
						<motion.div
							key={i}
							initial={{ scale: 0 }}
							animate={{ scale: 1 }}
							transition={{ delay: i * 0.1 }}
							className={`w-4 h-4 rounded-full ${
								mistakes > i 
									? 'bg-brain-danger shadow-glow' 
									: 'bg-neon-green shadow-neon-green'
							}`}
							aria-label={mistakes > i ? 'Life lost' : 'Life remaining'}
						/>
					))}
					{!isActive && !hasStarted && (
						<span className="text-text-secondary text-sm">Ready</span>
					)}
				</div>
			</div>

			{/* Time */}
			<div className="glass-card p-4 text-center" role="region" aria-label="Time remaining">
				<span className="text-text-muted text-xs font-medium uppercase tracking-wide block mb-2">Time</span>
				<div className="text-lg font-orbitron font-bold mb-1" aria-live="polite">
					{Math.ceil(timeRemaining / 1000)}s
				</div>
				<div className="w-full h-1 bg-bg-tertiary rounded-full overflow-hidden">
					<motion.div
						className={`h-full rounded-full transition-colors duration-200 ${
							timeRemaining > roundTimeLimit * 0.5 
								? 'bg-neon-green' 
								: timeRemaining > roundTimeLimit * 0.25 
								? 'bg-neon-yellow' 
								: 'bg-brain-danger'
						}`}
						role="progressbar"
						aria-valuemin={0}
						aria-valuemax={Math.max(1, Math.round(roundTimeLimit / 1000))}
						aria-valuenow={Math.max(0, Math.ceil(timeRemaining / 1000))}
						aria-label={`${Math.max(0, Math.ceil(timeRemaining / 1000))} seconds remaining`}
						style={{ 
							width: `${(timeRemaining / Math.max(1, roundTimeLimit)) * 100}%`,
						}}
					/>
				</div>
			</div>
		</div>
	), [streak, currentMultiplier, level, isActive, gameMode, mistakes, hasStarted, timeRemaining, roundTimeLimit]);

	return (
		<>
			<div className="w-full max-w-6xl mx-auto px-6 py-4" role="complementary" aria-label="Game HUD">
				{/* Enhanced Score Display with Exponential Preview */}
				{memoizedScoreSection}

				{/* Enhanced Stats Row (kept minimal in-game) */}
				{memoizedStatsRow}

				{/* Enhanced Action Bar */}
				<div className="flex items-center justify-between">
					{/* Daily Streak & Game Mode */}
					<div className="flex items-center gap-4">
						{dailyStreak > 0 && (
							<div className="glass-card px-4 py-2 flex items-center gap-2">
								<span className="text-yellow-400">🔥</span>
								<span className="text-xs text-gray-400 uppercase tracking-wide">Daily: </span>
								<span className="font-semibold text-yellow-400">{dailyStreak}</span>
							</div>
						)}
						
						<div className="glass-card px-4 py-2">
							<span className="text-xs text-gray-400 uppercase tracking-wide">Mode: </span>
							<span className={`font-semibold ${
								gameMode === 'classic' ? 'text-green-400' :
								gameMode === 'duel' ? 'text-yellow-400' :
								'text-red-400'
							}`}>
								{gameMode === 'sudden-death' ? 'Sudden Death' : 
								 gameMode.charAt(0).toUpperCase() + gameMode.slice(1)}
							</span>
						</div>
					</div>

					{/* Challenge Progress, Practice Mode, Multiplayer & Rules */}
					<div className="flex items-center gap-4">
						<ChallengeProgress />
						
						{/* Practice Mode Toggle */}
						<button
							className={`glass-card px-4 py-2 font-medium transition-colors duration-200 flex items-center gap-2 ${
								practiceMode 
									? 'text-green-400 bg-green-500/10 border-green-500/30' 
									: 'text-gray-400 hover:text-white'
							}`}
							onClick={togglePracticeMode}
							title={practiceMode ? 'Exit Practice Mode' : 'Enter Practice Mode'}
						>
							<span className="text-lg">{practiceMode ? '🎯' : '📚'}</span>
							Practice
						</button>
						
						{/* Multiplayer Button */}
						<button
							className="glass-card px-4 py-2 text-purple-400 hover:text-white font-medium transition-colors duration-200 flex items-center gap-2"
							onClick={() => {
								// This would open a multiplayer menu
								console.log('Open multiplayer menu');
							}}
							title="Multiplayer Options"
						>
							<span className="text-lg">👥</span>
							Multiplayer
						</button>
						
						<button
							className="glass-card px-4 py-2 text-blue-400 hover:text-white font-medium transition-colors duration-200 flex items-center gap-2"
							onClick={handleRulesOpen}
							aria-haspopup="dialog"
							aria-expanded={rulesOpen}
						>
							<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
							Rules
						</button>
					</div>
				</div>
				

			</div>

			{/* Interactive Rules Modal */}
			{rulesOpen && (
				<InteractiveRules 
					isOpen={rulesOpen}
					onClose={handleRulesClose}
				/>
			)}
		</>
	);
}

export default memo(GameHUD);