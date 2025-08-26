"use client";
import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import BattleMode to prevent SSR issues
const BattleMode = dynamic(() => import('@/components/battle/BattleMode'), {
	ssr: false,
	loading: () => (
		<div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center">
			<div className="text-center">
				<div className="text-4xl mb-4">⚔️</div>
				<div className="text-2xl font-bold text-white mb-2">Loading Battle Mode...</div>
				<div className="text-gray-400">Preparing your battle arena</div>
			</div>
		</div>
	)
});

export default function BattlePage() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
			<div className="container mx-auto px-4 py-8">
				<h1 className="text-4xl font-bold text-center text-white mb-8">
					🎮 Battle Mode
				</h1>
				<BattleMode />
			</div>
		</div>
	);
}
