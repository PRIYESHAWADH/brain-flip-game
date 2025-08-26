"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBattleStore } from '@/store/battleStore';
import { useAudio } from '@/hooks/useAudio';

export default function BattleMode() {
	const { 
		currentInstruction, 
		timeRemaining, 
		submitAnswer, 
		currentRoom,
		localPlayer,
		isConnected,
		createRoom,
		leaveRoom,
		sendReadySignal
	} = useBattleStore();

	const { 
		playCorrect, 
		playIncorrect 
	} = useAudio();

	const [playerName, setPlayerName] = useState('');
	const [roomName, setRoomName] = useState('');
	const [selectedGameMode, setSelectedGameMode] = useState<'quick-battle' | 'elimination' | 'time-attack'>('quick-battle');
	const [showCreateRoom, setShowCreateRoom] = useState(false);
	const [isProcessingAnswer, setIsProcessingAnswer] = useState(false);
	const [showParticles, setShowParticles] = useState<string | null>(null);

	const roundTimeLimit = selectedGameMode === 'quick-battle' ? 30000 : selectedGameMode === 'elimination' ? 45000 : 60000;

	// Handle answer submission in battle mode
	const handleBattleAnswer = (answer: string) => {
		if (!currentInstruction || isProcessingAnswer) return;

		setIsProcessingAnswer(true);

		const isCorrect = currentInstruction.acceptableAnswers.includes(answer);
		
		if (isCorrect) {
			playCorrect();
			setShowParticles('correct');
		} else {
			playIncorrect();
			setShowParticles('incorrect');
		}
		
		submitAnswer(answer);
		
		// Reset processing state and particles
		setTimeout(() => {
			setIsProcessingAnswer(false);
			setShowParticles(null);
		}, 1000);
	};

	// Create a new battle room
	const handleCreateRoom = () => {
		if (!roomName.trim() || !playerName.trim()) return;

		const roomConfig = {
			name: roomName,
			gameMode: selectedGameMode,
			maxPlayers: selectedGameMode === 'quick-battle' ? 4 : selectedGameMode === 'elimination' ? 8 : 6,
			timeLimit: selectedGameMode === 'quick-battle' ? 30 : selectedGameMode === 'elimination' ? 45 : 60
		};

		createRoom(roomConfig, playerName);
		setShowCreateRoom(false);
	};

	const handleJoinRoom = () => {
		// Placeholder for join room functionality
		console.log('Join room functionality not implemented yet');
	};

	// Ready up for battle
	const handleReadyUp = () => {
		if (localPlayer && !localPlayer.isReady) {
			sendReadySignal();
		}
	};

	// Render lobby screen
	if (!currentRoom) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-red-900 via-purple-900 to-blue-900 relative overflow-hidden">
				{/* Background effects */}
				<div className="absolute inset-0">
					{[...Array(6)].map((_, i) => (
						<motion.div
							key={i}
							className="absolute w-2 h-2 bg-red-500 rounded-full opacity-30"
							style={{
								left: `${15 + i * 15}%`,
								top: `${10 + i * 15}%`,
							}}
							animate={{
								y: [-12, 12, -12],
								x: [-8, 8, -8],
								opacity: [0.1, 0.4, 0.1],
								scale: [0.8, 1.2, 0.8],
							}}
							transition={{
								duration: 6 + i * 0.5,
								repeat: Infinity,
								ease: "easeInOut"
							}}
						/>
					))}
				</div>

				<div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">
					{/* Header */}
					<motion.div
						initial={{ opacity: 0, y: -30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8, ease: "easeOut" }}
						className="text-center mb-16"
					>
						<h1 className="text-6xl md:text-7xl font-orbitron font-bold mb-4 text-gradient">
							Battle <span className="text-red-500">Arena</span>
						</h1>
						<p className="text-xl text-text-secondary font-light">
							Challenge players worldwide in real-time brain battles
						</p>
					</motion.div>

					{/* Player Name Input */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.2 }}
						className="glass-card p-6 mb-8 w-full max-w-md"
					>
						<h3 className="text-lg font-bold mb-4 text-center">Your Battle Name</h3>
						<input
							type="text"
							value={playerName}
							onChange={(e) => setPlayerName(e.target.value)}
							placeholder="Enter your name..."
							className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-red-500 focus:outline-none"
							maxLength={20}
						/>
					</motion.div>

					{/* Game Mode Selection */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.4 }}
						className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 w-full max-w-4xl"
					>
						{[
							{
								id: 'quick-battle' as const,
								name: 'Quick Battle',
								description: '2-4 players, 30 seconds',
								icon: '⚡',
								color: 'from-yellow-500 to-orange-500'
							},
							{
								id: 'elimination' as const,
								name: 'Elimination',
								description: '4-8 players, last one standing',
								icon: '💀',
								color: 'from-red-500 to-pink-500'
							},
							{
								id: 'time-attack' as const,
								name: 'Time Attack',
								description: '2-6 players, 60 seconds',
								icon: '🏃',
								color: 'from-blue-500 to-purple-500'
							}
						].map((mode) => (
							<motion.div
								key={mode.id}
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								onClick={() => setSelectedGameMode(mode.id)}
								className={`glass-card p-6 cursor-pointer transition-all duration-200 ${
									selectedGameMode === mode.id
										? 'border-2 border-white shadow-lg'
										: 'border border-gray-600 hover:border-gray-500'
								}`}
							>
								<div className="text-center">
									<div className="text-4xl mb-3">{mode.icon}</div>
									<h3 className="text-xl font-bold mb-2">{mode.name}</h3>
									<p className="text-sm text-gray-400">{mode.description}</p>
								</div>
							</motion.div>
						))}
					</motion.div>

					{/* Action Buttons */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.6 }}
						className="flex flex-col sm:flex-row gap-4 w-full max-w-md"
					>
						<motion.button
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							onClick={() => setShowCreateRoom(true)}
							disabled={!playerName.trim()}
							className="btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							<span>🏗️</span>
							Create Room
						</motion.button>

						<motion.button
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							onClick={handleJoinRoom}
							disabled={!playerName.trim()}
							className="btn-secondary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							<span>🔍</span>
							Find Room
						</motion.button>
					</motion.div>

					{/* Connection Status */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.6, delay: 0.8 }}
						className="mt-8 text-center"
					>
						<div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
							isConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
						}`}>
							<div className={`w-2 h-2 rounded-full ${
								isConnected ? 'bg-green-400' : 'bg-red-400'
							}`} />
							{isConnected ? 'Connected to Battle Server' : 'Connecting to Battle Server...'}
						</div>
					</motion.div>
				</div>

				{/* Create Room Modal */}
				<AnimatePresence>
					{showCreateRoom && (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
							onClick={() => setShowCreateRoom(false)}
						>
							<motion.div
								initial={{ scale: 0.9, opacity: 0 }}
								animate={{ scale: 1, opacity: 1 }}
								exit={{ scale: 0.9, opacity: 0 }}
								className="bg-gray-900/95 border border-purple-500/30 rounded-2xl p-6 max-w-md w-full"
								onClick={(e) => e.stopPropagation()}
							>
								<h2 className="text-2xl font-bold mb-6 text-center">Create Battle Room</h2>

								<div className="space-y-4">
									<div>
										<label className="block text-sm font-medium mb-2">Room Name</label>
										<input
											type="text"
											value={roomName}
											onChange={(e) => setRoomName(e.target.value)}
											placeholder="Enter room name..."
											className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
											maxLength={30}
										/>
									</div>

									<div>
										<label className="block text-sm font-medium mb-2">Selected Mode</label>
										<div className="p-3 bg-gray-800 border border-gray-600 rounded-lg">
											<div className="flex items-center gap-3">
												<span className="text-2xl">
													{selectedGameMode === 'quick-battle' ? '⚡' : 
													 selectedGameMode === 'elimination' ? '💀' : '🏃'}
												</span>
												<div>
													<div className="font-medium">
														{selectedGameMode === 'quick-battle' ? 'Quick Battle' :
														 selectedGameMode === 'elimination' ? 'Elimination' : 'Time Attack'}
													</div>
													<div className="text-sm text-gray-400">
														{selectedGameMode === 'quick-battle' ? '2-4 players, 30 seconds' :
														 selectedGameMode === 'elimination' ? '4-8 players, last standing' : '2-6 players, 60 seconds'}
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>

								<div className="flex gap-3 mt-6">
									<button
										onClick={() => setShowCreateRoom(false)}
										className="flex-1 py-3 px-4 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors"
									>
										Cancel
									</button>
									<button
										onClick={handleCreateRoom}
										disabled={!roomName.trim()}
										className="flex-1 py-3 px-4 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
									>
										Create Room
									</button>
								</div>
							</motion.div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		);
	}

	// Render battle room (waiting/playing)
	return (
		<div className="min-h-screen bg-gradient-to-br from-red-900 via-purple-900 to-blue-900 relative overflow-hidden">
			{/* Room Header */}
			<div className="relative z-10 p-6 border-b border-gray-700">
				<div className="flex justify-between items-center max-w-6xl mx-auto">
					<div>
						<h1 className="text-2xl font-bold">{currentRoom.name}</h1>
						<p className="text-gray-400">
							{currentRoom.gameMode === 'quick-battle' ? 'Quick Battle' :
							 currentRoom.gameMode === 'elimination' ? 'Elimination' : 'Time Attack'} •
							{currentRoom.players.length}/{currentRoom.maxPlayers} players
						</p>
					</div>
					<button
						onClick={leaveRoom}
						className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors"
					>
						Leave Room
					</button>
				</div>
			</div>

			{/* Players Grid */}
			<div className="relative z-10 p-6">
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-6xl mx-auto mb-8">
					{currentRoom.players.map((player) => (
						<motion.div
							key={player.id}
							initial={{ opacity: 0, scale: 0.9 }}
							animate={{ opacity: 1, scale: 1 }}
							className={`glass-card p-4 ${
								player.id === localPlayer?.id ? 'border-2 border-blue-500' : ''
							}`}
						>
							<div className="text-center">
								<div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-2">
									<span className="text-lg font-bold">
										{player.name.charAt(0).toUpperCase()}
									</span>
								</div>
								<h3 className="font-medium truncate">{player.name}</h3>
								<div className="text-sm text-gray-400 mt-1">
									Score: {player.score} • Streak: {player.streak}
								</div>
								<div className={`text-xs mt-2 px-2 py-1 rounded-full ${
									player.isReady ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
								}`}>
									{player.isReady ? 'Ready' : 'Not Ready'}
								</div>
							</div>
						</motion.div>
					))}
				</div>

				{/* Game Status */}
				{currentRoom.status === 'waiting' && (
					<div className="text-center max-w-md mx-auto">
						<motion.button
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							onClick={handleReadyUp}
							disabled={localPlayer?.isReady}
							className={`w-full py-4 px-6 rounded-lg font-bold text-lg transition-all ${
								localPlayer?.isReady
									? 'bg-green-500/20 text-green-400 cursor-not-allowed'
									: 'bg-red-600 hover:bg-red-700 text-white'
							}`}
						>
							{localPlayer?.isReady ? '✓ Ready!' : 'Ready Up!'}
						</motion.button>

						{currentRoom.players.every(p => p.isReady) && currentRoom.players.length >= 2 && (
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								className="mt-4 p-4 bg-green-500/20 border border-green-500/30 rounded-lg"
							>
								<div className="text-green-400 font-bold">All players ready!</div>
								<div className="text-sm text-green-300 mt-1">Battle starting in 3 seconds...</div>
							</motion.div>
						)}
					</div>
				)}

				{/* Active Battle UI */}
				{currentRoom.status === 'active' && currentInstruction && (
					<div className="max-w-4xl mx-auto">
						{/* Instruction Display */}
						<div className="text-center mb-8">
							<motion.div
								key={currentInstruction.id}
								initial={{ opacity: 0, scale: 0.9 }}
								animate={{ opacity: 1, scale: 1 }}
								className="text-4xl font-bold mb-4"
								style={{ color: currentInstruction.displayColor?.toLowerCase() }}
							>
								{currentInstruction.display}
							</motion.div>

							{/* Battle Timer */}
							<div className="w-full max-w-md mx-auto mb-6">
								<div className="relative h-3 bg-gray-700 rounded-full overflow-hidden">
									<motion.div
										className="absolute left-0 top-0 h-full bg-gradient-to-r from-green-400 to-red-400"
										style={{
											width: `${Math.max(0, (timeRemaining / roundTimeLimit) * 100)}%`
										}}
										transition={{ duration: 0.1 }}
									/>
								</div>
								<div className="text-center mt-2 text-gray-300">
									{Math.ceil(timeRemaining / 1000)}s remaining
								</div>
							</div>
						</div>

						{/* Answer Buttons */}
						<div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
							{['UP', 'DOWN', 'LEFT', 'RIGHT'].map((answer, index) => (
								<motion.button
									key={answer}
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.95 }}
									onClick={() => handleBattleAnswer(answer)}
									disabled={isProcessingAnswer}
									className="answer-btn p-4 text-lg font-bold disabled:opacity-50"
								>
									{answer}
									<span className="absolute top-1 right-1 text-xs opacity-60">
										{index + 1}
									</span>
								</motion.button>
							))}
						</div>

						{/* Battle Particles */}
						<AnimatePresence>
							{showParticles && (
								<motion.div
									key={showParticles}
									initial={{ opacity: 0, scale: 0.8 }}
									animate={{ opacity: 1, scale: 1 }}
									exit={{ opacity: 0, scale: 1.2 }}
									transition={{ duration: 0.3 }}
									className="absolute inset-0 pointer-events-none flex items-center justify-center"
								>
									<div className={`text-6xl ${
										showParticles === 'correct' ? 'text-green-400' : 'text-red-400'
									}`}>
										{showParticles === 'correct' ? '✓' : '✗'}
									</div>
								</motion.div>
							)}
						</AnimatePresence>
					</div>
				)}
			</div>
		</div>
	);
}
