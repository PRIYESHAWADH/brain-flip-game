"use client";
import { ResponsiveBrainFlipGame } from '@/components/ResponsiveBrainFlipGame';
import dynamic from 'next/dynamic';
import { useGameTimer } from '@/hooks/useGameTimer';

// Dynamically import additional systems to prevent SSR issues
const DailyLoginModal = dynamic(() => import('@/components/auth/DailyLoginModal'), { ssr: false });
const ChallengeManager = dynamic(() => import('@/components/challenges/ChallengeManager'), { ssr: false });
const JackpotChallenge = dynamic(() => import('@/components/challenges/JackpotChallenge'), { ssr: false });
const MultiplayerMenu = dynamic(() => import('@/components/multiplayer/MultiplayerMenu'), { ssr: false });
const BattleLobby = dynamic(() => import('@/components/battle/BattleLobby'), { ssr: false });
const FriendsPanel = dynamic(() => import('@/components/social/FriendsPanel'), { ssr: false });

export default function GamePage() {
	// Initialize the timer on this page
	useGameTimer(); 

	return (
		<div className="min-h-screen w-full">
			{/* Core Game Experience - Mobile Optimized */}
			<ResponsiveBrainFlipGame />
			
			{/* Additional Systems */}
			<DailyLoginModal />
			<ChallengeManager />
			<JackpotChallenge />
			<MultiplayerMenu />
			<BattleLobby />
			<FriendsPanel />
		</div>
	);
}
