"use client";
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { useCoinStore } from '@/store/coinStore';
import { useGameSession } from '@/hooks/useGameSession';
import Button from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import React from 'react';
import { useAnimation } from '@/hooks/useAnimation';
import { notifications } from '@/utils/notificationManager';

interface GameOverProps {
	score: number;
	streak: number;
	celebrationLevel: 'none' | 'good' | 'great' | 'amazing' | 'legendary';
	onPlayAgain?: () => void;
	onBackToMenu?: () => void;
}

export default function GameOver({ onPlayAgain, onBackToMenu }: GameOverProps) {
	const { 
		score, 
		streak, 
		level, 
		mistakes, 
		totalReactionTime, 
		perfectRounds, 
		lightningReactions,
		personalBest,
		resetGame,
		startNewGameFromGameOver,
		returnToMenu,
		lastScoreGain,
		celebrationLevel,
		comboStreak,
		dailyStreak,
		lastLuckyMultiplier,
		goldenValue,
		gameMode
	} = useGameStore();
	
		const { recordGameResult, balance, claimDailyReward, lastDailyLogin, dailyLoginStreak } = useCoinStore();
	const { submitGameSession, isAuthenticated } = useGameSession();

	const { prefersReducedMotion } = useAnimation();

	const dialogRef = React.useRef<HTMLDivElement>(null);
	const primaryBtnRef = React.useRef<HTMLButtonElement>(null);
	const [dailyClaimed, setDailyClaimed] = React.useState(false);
	// Cooldown for Play Again
	const [canReplay, setCanReplay] = React.useState(false);
	React.useEffect(() => {
		setCanReplay(false);
		const timer = setTimeout(() => setCanReplay(true), 1500);
		return () => clearTimeout(timer);
	}, [score]);

	// Calculate coins earned based on performance (simplified: equals score)
	const coinsEarned = Math.floor(score / 10);
	const avgReactionTime = totalReactionTime > 0 ? Math.round(totalReactionTime / level) : 0;
	const isNewRecord = score > personalBest;

	// Record game result when component mounts (awards coins and saves to database)
	React.useEffect(() => {
		if (coinsEarned > 0) {
			// Record to local coin store
			recordGameResult({
				score,
				level,
				streak,
				perfectRounds,
				averageReactionTime: avgReactionTime,
				gameMode: 'Classic',
				duration: 0,
				isNewRecord,
				achievements: []
			});

			// Submit to database if authenticated
			if (isAuthenticated) {
				submitGameSession({
					averageReactionTime: avgReactionTime,
					instructionsCompleted: level
				}).then((result) => {
					if (result.success && result.data?.achievements?.length > 0) {
						// Show achievement notifications
						result.data.achievements.forEach((achievement: unknown) => {
							notifications.show({
								type: 'achievement',
								title: 'Achievement Unlocked!',
								message: achievement.name,
								duration: 5000
							});
						});
					}
				}).catch((error) => {
					console.error('Failed to submit game session:', error);
				});
			}
		}
	}, [coinsEarned, recordGameResult, score, level, streak, perfectRounds, lightningReactions, avgReactionTime, isAuthenticated, submitGameSession, isNewRecord]);

 	const handlePlayAgain = () => {
 		if (!canReplay) return;
 		// Start a new game with the same mode that was just played
 		startNewGameFromGameOver(gameMode);
 		if (onPlayAgain) {
 			onPlayAgain();
 		}
 	};

 	const handleBackToMenu = () => {
 		// Properly return to menu
 		returnToMenu();
 		if (onBackToMenu) {
 			onBackToMenu();
 		} else {
 			console.log('[GameOver] Back to menu triggered');
 		}
 	};

	// Focus management: trap focus within dialog and focus primary CTA on mount
	React.useEffect(() => {
		primaryBtnRef.current?.focus();
		const el = dialogRef.current;
		if (!el) return;

		const keyHandler = (e: KeyboardEvent) => {
			if (e.key !== 'Tab') return;

			const focusable = el.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
			if (focusable.length === 0) return;

			const first = focusable[0] as HTMLElement;
			const last = focusable[focusable.length - 1] as HTMLElement;
			const active = document.activeElement as HTMLElement;

			if (e.shiftKey) {
				if (active === first || !el.contains(active)) {
					e.preventDefault();
					last.focus();
				}
			} else {
				if (active === last || !el.contains(active)) {
					e.preventDefault();
					first.focus();
				}
			}
		};
		document.addEventListener('keydown', keyHandler);
		return () => document.removeEventListener('keydown', keyHandler);
	}, []);

	const handleShare = () => {
		const text = `🧠 Brain Flip Score: ${score.toLocaleString()} points! 🎯\nStreak: ${streak} | Level: ${level}\nCan you beat it? Play at ${window.location.origin}`;
		if (navigator.share) {
			navigator.share({
				title: 'Brain Flip Score',
				text: text,
				url: window.location.origin
			});
		} else {
			navigator.clipboard.writeText(text);
			// Show toast notification
			alert('Score copied to clipboard!');
		}
	};

	const handleClaimDaily = () => {
		const { claimed, streakNow } = claimDailyReward();
		if (claimed) {
			setDailyClaimed(true);
			// Show notification
			notifications.dailyReward('Daily reward claimed', `Streak ${streakNow}! Coins and tokens added to your balance. 🎁`);
		} else {
			notifications.system('Already claimed', 'You have already claimed today\'s reward. Come back tomorrow!');
		}
	};

	const router = useRouter();

	return (
		<AnimatePresence>
			<motion.div
				initial={prefersReducedMotion ? false : { opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				transition={{ duration: prefersReducedMotion ? 0.01 : 0.25 }}
				className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
				role="dialog"
				aria-modal="true"
				aria-labelledby="gameover-title"
			>
				<motion.div
					initial={prefersReducedMotion ? false : { scale: 0.8, opacity: 0, y: 50 }}
					animate={{ scale: 1, opacity: 1, y: 0 }}
					exit={{ scale: 0.98, opacity: 0 }}
					transition={prefersReducedMotion ? { duration: 0.01 } : { type: "spring", bounce: 0.3, duration: 0.6 }}
					className="glass-card p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
					ref={dialogRef}
				>
					{/* Enhanced Header */}
					<div className="text-center mb-8">
						<motion.div
							initial={prefersReducedMotion ? false : { scale: 0, rotate: -180 }}
							animate={{ scale: 1, rotate: prefersReducedMotion ? 0 : 0 }}
							transition={prefersReducedMotion ? { duration: 0.01 } : { delay: 0.3, type: "spring", bounce: 0.6 }}
							className="text-6xl mb-4"
						>
							{isNewRecord ? '🏆' : '🎮'}
						</motion.div>
						<motion.h2
 						initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
 						animate={{ opacity: 1, y: 0 }}
 						transition={{ delay: prefersReducedMotion ? 0 : 0.4, duration: prefersReducedMotion ? 0.01 : 0.25 }}
 						id="gameover-title"
 						className="text-4xl font-bold mb-2 text-red-500 drop-shadow-lg"
 					>
 						{isNewRecord ? '🏆 New Personal Best!' : '💀 Game Over'}
 					</motion.h2>
						<motion.p
	 						initial={prefersReducedMotion ? false : { opacity: 0 }}
	 						animate={{ opacity: 1 }}
	 						transition={{ delay: prefersReducedMotion ? 0 : 0.5, duration: prefersReducedMotion ? 0.01 : 0.25 }}
	 						className="text-gray-300 text-lg"
	 					>
	 						{isNewRecord ? 'Congratulations! You\'ve set a new record!' : 'You lost this round. Take a breath, review your stats, and try again!'}
	 					</motion.p>
					</div>

					{/* Enhanced Score Display */}
					<motion.div
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ delay: prefersReducedMotion ? 0 : 0.6, duration: prefersReducedMotion ? 0.01 : 0.25 }}
						className="text-center mb-8"
					>
						<div className="glass-card p-8 border border-purple-500/30">
							<div className="text-sm text-gray-400 uppercase tracking-wide mb-2">Final Score</div>
							<motion.div
								initial={prefersReducedMotion ? false : { scale: 0.5 }}
								animate={{ scale: 1 }}
								transition={prefersReducedMotion ? { duration: 0.01 } : { delay: 0.8, type: "spring", bounce: 0.4 }}
								className="text-5xl md:text-6xl font-bold text-gradient mb-4"
							>
								{score.toLocaleString()}
							</motion.div>
							
							{/* Achievement Badges */}
							<div className="flex flex-wrap justify-center gap-2 mb-4">
								{perfectRounds > 0 && (
									<span className="px-3 py-1 bg-green-500/20 text-green-400 text-sm font-bold rounded-full border border-green-500/30">
										✨ {perfectRounds} Perfect
									</span>
								)}
								{lightningReactions > 0 && (
									<span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-sm font-bold rounded-full border border-yellow-500/30">
										⚡ {lightningReactions} Lightning
									</span>
								)}
								{comboStreak > 0 && (
									<span className="px-3 py-1 bg-pink-500/20 text-pink-400 text-sm font-bold rounded-full border border-pink-500/30">
										🔥 {comboStreak} Combo
									</span>
								)}
								{lastLuckyMultiplier && lastLuckyMultiplier > 1 && (
									<span className="px-3 py-1 bg-purple-500/20 text-purple-400 text-sm font-bold rounded-full border border-purple-500/30">
										✨ Lucky x{lastLuckyMultiplier}
									</span>
								)}
								{goldenValue && goldenValue > 0 && (
									<span className="px-3 py-1 bg-orange-500/20 text-orange-400 text-sm font-bold rounded-full border border-orange-500/30">
										🌟 Golden +{goldenValue}
									</span>
								)}
							</div>

							{/* Coins Earned */}
							<div className="flex items-center justify-center gap-2 text-yellow-400">
								<span className="text-2xl">🪙</span>
								<span className="text-xl font-bold">+{coinsEarned} Coins</span>
							</div>
						</div>
					</motion.div>

					{/* Enhanced Performance Stats */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: prefersReducedMotion ? 0 : 0.7, duration: prefersReducedMotion ? 0.01 : 0.25 }}
						className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
					>
						<div className="glass-card p-4 text-center">
							<div className="text-sm text-gray-400 mb-1">Level</div>
							<div className="text-2xl font-bold text-blue-400">{level}</div>
						</div>
						<div className="glass-card p-4 text-center">
							<div className="text-sm text-gray-400 mb-1">Streak</div>
							<div className="text-2xl font-bold text-pink-400">{streak}</div>
						</div>
						<div className="glass-card p-4 text-center">
							<div className="text-sm text-gray-400 mb-1">Mistakes</div>
							<div className="text-2xl font-bold text-red-400">{mistakes}</div>
						</div>
						<div className="glass-card p-4 text-center">
							<div className="text-sm text-gray-400 mb-1">Avg Time</div>
							<div className="text-2xl font-bold text-cyan-400">{avgReactionTime}ms</div>
						</div>
					</motion.div>

					{/* Daily Reward - Minimal surfacing */}
					<motion.div
						initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: prefersReducedMotion ? 0.01 : 0.25 }}
						className="glass-card p-4 mb-8 border border-emerald-500/20"
						aria-live="polite"
					>
						<div className="flex justify-center">
							<Button
								variant="secondary"
								disabled={dailyClaimed || lastDailyLogin === new Date().toDateString()}
								onClick={handleClaimDaily}
								className="w-full max-w-xs"
							>
								<span>🎁</span>
								{dailyClaimed || lastDailyLogin === new Date().toDateString() ? 'Daily Claimed' : 'Claim Daily Reward'}
							</Button>
						</div>
					</motion.div>

					{/* Enhanced Score Breakdown */}
					<motion.div
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: 'auto' }}
						transition={{ delay: prefersReducedMotion ? 0 : 0.8, duration: prefersReducedMotion ? 0.01 : 0.25 }}
						className="glass-card p-6 mb-8 border border-cyan-500/30"
					>
						<h3 className="text-xl font-bold mb-4 text-cyan-400">Score Breakdown</h3>
						<div className="space-y-3">
							<div className="flex justify-between items-center">
								<span className="text-gray-300">Base Score</span>
								<span className="font-bold text-blue-400">{(level * 10).toLocaleString()}</span>
							</div>
							{perfectRounds > 0 && (
								<div className="flex justify-between items-center">
									<span className="text-gray-300">Perfect Rounds</span>
									<span className="font-bold text-green-400">+{(perfectRounds * 50).toLocaleString()}</span>
								</div>
							)}
							{lightningReactions > 0 && (
								<div className="flex justify-between items-center">
									<span className="text-gray-300">Lightning Reactions</span>
									<span className="font-bold text-yellow-400">+{(lightningReactions * 100).toLocaleString()}</span>
								</div>
							)}
							{comboStreak > 0 && (
								<div className="flex justify-between items-center">
									<span className="text-gray-300">Combo Bonus</span>
									<span className="font-bold text-pink-400">+{(comboStreak * 200).toLocaleString()}</span>
								</div>
							)}
							{lastLuckyMultiplier && lastLuckyMultiplier > 1 && (
								<div className="flex justify-between items-center">
									<span className="text-gray-300">Lucky Multiplier</span>
									<span className="font-bold text-purple-400">x{lastLuckyMultiplier}</span>
								</div>
							)}
							{goldenValue && goldenValue > 0 && (
								<div className="flex justify-between items-center">
									<span className="text-gray-300">Golden Bonus</span>
									<span className="font-bold text-orange-400">+{goldenValue.toLocaleString()}</span>
								</div>
							)}
							<div className="border-t border-purple-500/30 pt-3">
								<div className="flex justify-between items-center">
									<span className="text-lg font-bold">Total</span>
									<span className="text-2xl font-bold text-gradient">{score.toLocaleString()}</span>
								</div>
							</div>
						</div>
					</motion.div>

					{/* Enhanced Action Buttons */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: prefersReducedMotion ? 0 : 0.9, duration: prefersReducedMotion ? 0.01 : 0.25 }}
						className="flex flex-col sm:flex-row gap-4"
					>
						<Button
	 						onClick={handlePlayAgain}
	 						className={`flex-1 enhanced-primary-btn text-lg py-4 ${!canReplay ? 'opacity-50 cursor-not-allowed' : ''}`}
	 						ref={primaryBtnRef as any}
	 						disabled={!canReplay}
	 					>
	 						<span>🔄</span>
	 						{canReplay ? 'Play Again' : 'Please wait...'}
	 					</Button>
						<Button
							onClick={handleShare}
							className="flex-1 enhanced-secondary-btn text-lg py-4"
						>
							<span>📤</span>
							Share Score
						</Button>
						<Button
							onClick={handleBackToMenu}
							className="flex-1 enhanced-accent-btn text-lg py-4"
						>
							<span>🏠</span>
							Main Menu
						</Button>
					</motion.div>

					{/* Enhanced Footer */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 1 }}
						className="mt-8 text-center text-sm text-gray-400"
					>
						<div className="flex items-center justify-center gap-4 mb-2">
							<span>Total Coins: {balance.gameCoins.toLocaleString()}</span>
							<span>•</span>
							<span>Daily Streak: {dailyStreak}</span>
						</div>
						<p>Keep playing to unlock more achievements and climb the leaderboard!</p>
					</motion.div>
				</motion.div>
			</motion.div>
		</AnimatePresence>
	);
}
