"use client";
import { motion } from 'framer-motion';
import { useLeaderboard } from '@/hooks/useLeaderboard';

export default function LeaderboardPage() {
	const { leaderboard: leaderboardData, loading: isLoading } = useLeaderboard('Classic');

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
			{/* Enhanced Header */}
			<motion.header
				initial={{ opacity: 0, y: -30 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.8, ease: "easeOut" }}
				className="text-center pt-12 pb-8"
			>
				<h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
					🏆 Leaderboard
				</h1>
				<p className="text-xl text-gray-300 max-w-2xl mx-auto">
					Compete with the best players and climb to the top of the rankings
				</p>
			</motion.header>

			{/* Enhanced Content */}
			<div className="container mx-auto px-6 pb-12">
				{/* Loading State */}
				{isLoading && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						className="text-center py-12"
					>
						<div className="text-4xl mb-4">⏳</div>
						<div className="text-xl text-gray-300">Loading leaderboard...</div>
					</motion.div>
				)}

				{/* Error State intentionally removed (hook doesn't return error) */}

				{/* Leaderboard Data */}
				{leaderboardData && leaderboardData.length > 0 && (
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8, delay: 0.3 }}
						className="max-w-4xl mx-auto"
					>
						{/* Enhanced Table */}
						<div className="glass-card overflow-hidden border border-purple-500/30">
							<table className="w-full">
								<thead>
									<tr className="bg-purple-500/10 border-b border-purple-500/20">
										<th className="px-6 py-4 text-left text-sm font-bold text-purple-400 uppercase tracking-wide">
											Rank
										</th>
										<th className="px-6 py-4 text-left text-sm font-bold text-purple-400 uppercase tracking-wide">
											Player
										</th>
										<th className="px-6 py-4 text-left text-sm font-bold text-purple-400 uppercase tracking-wide">
											Score
										</th>
										<th className="px-6 py-4 text-left text-sm font-bold text-purple-400 uppercase tracking-wide">
											Level
										</th>
										<th className="px-6 py-4 text-left text-sm font-bold text-purple-400 uppercase tracking-wide">
											Streak
										</th>
										<th className="px-6 py-4 text-left text-sm font-bold text-purple-400 uppercase tracking-wide">
											Date
										</th>
									</tr>
								</thead>
								<tbody>
									{leaderboardData.map((entry, index) => (
										<motion.tr
											            key={entry.userId}
											initial={{ opacity: 0, x: -20 }}
											animate={{ opacity: 1, x: 0 }}
											transition={{ delay: index * 0.1 }}
											className={`border-b border-purple-500/10 hover:bg-purple-500/5 transition-colors ${
												index < 3 ? 'bg-purple-500/5' : ''
											}`}
										>
											<td className="px-6 py-4">
												<div className="flex items-center gap-3">
													{index < 3 ? (
														<span className="text-2xl">
															{index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
														</span>
													) : (
														<span className="text-lg font-bold text-gray-400">
															#{index + 1}
														</span>
													)}
												</div>
											</td>
											<td className="px-6 py-4">
												<div className="flex items-center gap-3">
													<div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
														{entry.username.charAt(0).toUpperCase()}
													</div>
													<div>
														<div className="font-bold text-white">
															{entry.username}
														</div>
														<div className="text-sm text-gray-400">
															                {entry.gameMode}
														</div>
													</div>
												</div>
											</td>
											<td className="px-6 py-4">
												<div className="font-bold text-2xl text-gradient">
													              {entry.score.toLocaleString()}
												</div>
											</td>
											<td className="px-6 py-4">
												<div className="text-lg font-bold text-blue-400">
													              {entry.rank}
												</div>
											</td>
											<td className="px-6 py-4">
												<div className="flex items-center gap-2">
													<span className="text-lg font-bold text-pink-400">
														{entry.rank}
													</span>
														{entry.rank <= 10 && (
														<span className="text-pink-400">🔥</span>
													)}
												</div>
											</td>
											<td className="px-6 py-4">
												<div className="text-sm text-gray-400">
															                {new Date(entry.updatedAt).toLocaleDateString()}
												</div>
											</td>
										</motion.tr>
									))}
								</tbody>
							</table>
						</div>

						{/* Enhanced Stats */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.8, delay: 0.6 }}
							className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8"
						>
							<div className="glass-card p-6 text-center border border-green-500/30">
								<div className="text-3xl mb-2">👥</div>
								<div className="text-2xl font-bold text-green-400">
									{leaderboardData.length}
								</div>
								<div className="text-gray-400">Total Players</div>
							</div>
							<div className="glass-card p-6 text-center border border-yellow-500/30">
								<div className="text-3xl mb-2">🏆</div>
								<div className="text-2xl font-bold text-yellow-400">
												            {Math.max(...leaderboardData.map(e => e.score)).toLocaleString()}
								</div>
								<div className="text-gray-400">Highest Score</div>
							</div>
							<div className="glass-card p-6 text-center border border-pink-500/30">
								<div className="text-3xl mb-2">🔥</div>
								<div className="text-2xl font-bold text-pink-400">
												{Math.min(...leaderboardData.map(e => e.rank))}
								</div>
								<div className="text-gray-400">Best Streak</div>
							</div>
						</motion.div>
					</motion.div>
				)}

				{/* Empty State */}
				{leaderboardData && leaderboardData.length === 0 && (
					<motion.div
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 0.6, delay: 0.3 }}
						className="text-center py-12"
					>
						<div className="text-6xl mb-6">📊</div>
						<h2 className="text-2xl font-bold mb-4">No Scores Yet</h2>
						<p className="text-gray-300 mb-8 max-w-md mx-auto">
							Be the first to set a record! Play the game and your score will appear here.
						</p>
						<motion.button
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							className="enhanced-primary-btn"
							onClick={() => window.location.href = '/game'}
						>
							<span>🎮</span>
							Play Now
						</motion.button>
					</motion.div>
				)}
			</div>
		</div>
	);
}
