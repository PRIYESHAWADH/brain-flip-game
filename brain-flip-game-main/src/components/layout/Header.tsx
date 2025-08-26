'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {

	return (
		<nav className="glass-card mx-4 mt-4 px-6 py-4 flex items-center justify-between z-[100] relative" role="navigation" aria-label="Main navigation">
			<Link 
				href="/" 
				className="text-2xl font-orbitron font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent hover:scale-105 transition-all duration-300"
				aria-label="Brain Flip Home"
			>
				Brain Flip
			</Link>
			<div className="flex gap-6">
				<Link 
					href="/game" 
					className="text-text-secondary hover:text-neon-green transition-colors font-medium"
					aria-label="Play game"
				>
					🎮 Play
				</Link>
				<Link 
					href="/leaderboard" 
					className="text-text-secondary hover:text-brain-accent transition-colors font-medium"
					aria-label="View leaderboard"
				>
					🏆 Leaderboard
				</Link>
			</div>
		</nav>
	);
}
