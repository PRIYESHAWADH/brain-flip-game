"use client";
import Link from 'next/link';

export default function HomePage() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 relative overflow-hidden">
			{/* Enhanced Background Effects */}
			<div className="fixed inset-0 z-0">
				{/* Floating Elements */}
				{[...Array(8)].map((_, i) => (
					<div
						key={i}
						className="absolute w-1 h-1 bg-purple-500 rounded-full opacity-30"
						style={{
							left: `${10 + i * 12}%`,
							top: `${15 + i * 10}%`,
						}}
					/>
				))}
				
				{/* Background Glow */}
				<div className="absolute inset-0 bg-gradient-radial from-purple-500/20 via-transparent to-transparent" />
			</div>

			{/* Main Content */}
			<div className="relative z-10 min-h-screen flex flex-col">
				{/* Header is provided globally via layout.tsx */}

				{/* Enhanced Main Content */}
				<main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
					{/* Enhanced Title */}
					<h1 className="text-6xl md:text-8xl font-bold mb-8">
						<span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
							Brain
						</span>
						<br />
						<span className="bg-gradient-to-r from-blue-400 via-green-400 to-yellow-400 bg-clip-text text-transparent">
							Flip
						</span>
					</h1>

					{/* Enhanced Description */}
					<p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl leading-relaxed">
						Can you think backwards? Do the{' '}
						<span className="text-green-400 font-bold animate-pulse">OPPOSITE</span>{' '}
						of every instruction. Fast-paced, challenging, and mind-bending brain training!
					</p>

					{/* Original Action Buttons - Best Visuals */}
					<div className="flex flex-col sm:flex-row gap-6 mb-16 justify-center">
						<Link href="/game" className="btn-primary flex items-center gap-3">
							<span className="text-2xl">🎮</span>
							<span>Play Now</span>
						</Link>
						<Link href="/battle" className="btn-secondary flex items-center gap-3">
							<span className="text-2xl">⚔️</span>
							<span>Battle Mode</span>
						</Link>
						<Link href="/challenges" className="btn-secondary flex items-center gap-3">
							<span className="text-2xl">🎯</span>
							<span>Challenges</span>
						</Link>
						<Link href="/leaderboard" className="btn-secondary flex items-center gap-3">
							<span className="text-2xl">🏆</span>
							<span>Leaderboard</span>
						</Link>
					</div>

					{/* Enhanced Feature Cards */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl">
						{/* Feature Card 1 */}
						<div className="glass-card p-8 text-center border border-purple-500/30">
							<div className="text-4xl mb-4">🧠</div>
							<h3 className="text-xl font-bold mb-3 text-purple-400">Reverse Psychology</h3>
							<p className="text-gray-300">
								Train your brain to think backwards. Every instruction is a trick - do the opposite!
							</p>
						</div>

						{/* Feature Card 2 */}
						<div className="glass-card p-8 text-center border border-green-500/30">
							<div className="text-4xl mb-4">⚡</div>
							<h3 className="text-xl font-bold mb-3 text-green-400">Lightning Fast</h3>
							<p className="text-gray-300">
								React in milliseconds. Perfect timing rewards with exponential scoring!
							</p>
						</div>

						{/* Feature Card 3 */}
						<div className="glass-card p-8 text-center border border-pink-500/30">
							<div className="text-4xl mb-4">🏆</div>
							<h3 className="text-xl font-bold mb-3 text-pink-400">Compete & Achieve</h3>
							<p className="text-gray-300">
								Unlock achievements, climb leaderboards, and challenge your friends!
							</p>
						</div>
					</div>

					{/* Enhanced Stats Preview */}
					<div className="mt-16 glass-card p-6 border border-cyan-500/30">
						<h3 className="text-xl font-bold mb-4 text-cyan-400">Game Features</h3>
						<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
							<div className="text-center">
								<div className="text-2xl font-bold text-purple-400">Multiple</div>
								<div className="text-gray-400">Game Modes</div>
							</div>
							<div className="text-center">
								<div className="text-2xl font-bold text-green-400">Endless</div>
								<div className="text-gray-400">Progression</div>
							</div>
							<div className="text-center">
								<div className="text-2xl font-bold text-pink-400">Extensive</div>
								<div className="text-gray-400">Achievements</div>
							</div>
							<div className="text-center">
								<div className="text-2xl font-bold text-yellow-400">Highly</div>
								<div className="text-gray-400">Engaging</div>
							</div>
						</div>
					</div>
				</main>

				{/* Enhanced Footer */}
				<footer className="text-center p-6 text-gray-400">
					<p>© 2025 Brain Flip. Made with ❤️ for brain training enthusiasts.</p>
				</footer>
			</div>
		</div>
	);
}
