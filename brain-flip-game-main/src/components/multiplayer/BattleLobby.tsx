'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMultiplayerStore } from '@/store/multiplayerStore';
import { Player, PowerUp } from '@/types/multiplayer';

// ULTIMATE BATTLE LOBBY - STATE OF THE ART
export default function BattleLobby() {
	const {
		currentRoom,
		currentPlayer,
		showBattleLobby,
		leaveRoom,
		readyUp,
		sendChatMessage,
		usePowerUp,
		availablePowerUps
	} = useMultiplayerStore();

	const [chatMessage, setChatMessage] = useState('');
	const [countdown, setCountdown] = useState<number | null>(null);
	const [selectedPowerUps, setSelectedPowerUps] = useState<string[]>([]);

	// Countdown effect
	useEffect(() => {
		if (currentRoom?.state === 'countdown') {
			setCountdown(3);
				setCountdown(prev => {
					if (prev === null || prev <= 1) {
						clearInterval(interval);
						return null;
					}
					return prev - 1;
				});
			}, 1000);
			return () => clearInterval(interval);
		}
	}, [currentRoom?.state]);
		if (chatMessage.trim()) {
			sendChatMessage(chatMessage);
			setChatMessage('');
		}
	};
		readyUp();
	};
		leaveRoom();
	};
		setSelectedPowerUps(prev => 
			prev.includes(powerUpId) 
				? prev.filter(id => id !== powerUpId)
				: [...prev, powerUpId]
		);
	};
		usePowerUp(powerUpId);
	};

	if (!showBattleLobby || !currentRoom || !currentPlayer) return null;

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
		>
			<motion.div
				initial={{ scale: 0.9, opacity: 0 }}
				animate={{ scale: 1, opacity: 1 }}
				exit={{ scale: 0.9, opacity: 0 }}
				className="bg-gray-900/95 border border-purple-500/30 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-hidden"
			>
				{/* Header */}
				<div className="flex justify-between items-center mb-6">
					<div>
						<h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
							{currentRoom.mode === 'duel' ? '⚔️ Neural Clash' : '🌪️ Cerebral Storm'}
						</h1>
						<p className="text-gray-400 text-sm">Room ID: {currentRoom.id}</p>
					</div>
					
					<div className="flex items-center gap-4">
						<div className="text-center">
							<div className="text-lg font-bold text-white">
								{currentRoom.players.length}/{currentRoom.settings.maxPlayers}
							</div>
							<div className="text-xs text-gray-400">Players</div>
						</div>
						
						<button
							onClick={handleLeaveRoom}
							className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
						>
							Leave Room
						</button>
					</div>
				</div>

				{/* Countdown Overlay */}
				<AnimatePresence>
					{countdown !== null && (
						<motion.div
							initial={{ opacity: 0, scale: 0.5 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 2 }}
							className="fixed inset-0 z-10 flex items-center justify-center bg-black/50"
						>
							<div className="text-8xl font-bold text-white animate-pulse">
								{countdown}
							</div>
						</motion.div>
					)}
				</AnimatePresence>

				{/* Main Content */}
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[60vh]">
					{/* Left Panel - Players */}
					<div className="lg:col-span-2 space-y-6">
						{/* Players List */}
						<div className="bg-gray-800/50 rounded-xl p-6">
							<h2 className="text-xl font-semibold text-white mb-4">👥 Players</h2>
							
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{currentRoom.players.map(player => (
									<motion.div
										key={player.id}
										whileHover={{ scale: 1.02 }}
										className={`p-4 rounded-lg border-2 ${
											player.id === currentPlayer.id
												? 'border-purple-500 bg-purple-500/10'
												: 'border-gray-600 bg-gray-700/30'
										}`}
									>
										<div className="flex items-center gap-3 mb-3">
											<div className="text-2xl">{player.avatar}</div>
											<div className="flex-1">
												<h3 className="text-white font-semibold">{player.name}</h3>
												<p className="text-gray-400 text-sm">Level {player.level}</p>
											</div>
											<div className="flex items-center gap-2">
												{player.isReady ? (
													<div className="flex items-center gap-1 text-green-400">
														<div className="w-2 h-2 bg-green-400 rounded-full" />
														<span className="text-xs">Ready</span>
													</div>
												) : (
													<div className="flex items-center gap-1 text-yellow-400">
														<div className="w-2 h-2 bg-yellow-400 rounded-full" />
														<span className="text-xs">Waiting</span>
													</div>
												)}
											</div>
										</div>
										
										{/* Player Stats */}
										<div className="grid grid-cols-3 gap-2 text-xs">
											<div className="text-center">
												<div className="text-white font-semibold">{player.statistics.totalBattles}</div>
												<div className="text-gray-400">Battles</div>
											</div>
											<div className="text-center">
												<div className="text-white font-semibold">{player.statistics.winRate}%</div>
												<div className="text-gray-400">Win Rate</div>
											</div>
											<div className="text-center">
												<div className="text-white font-semibold">{player.statistics.bestStreak}</div>
												<div className="text-gray-400">Best Streak</div>
											</div>
										</div>
										
										{/* Power-ups */}
										{player.powerUps.length > 0 && (
											<div className="mt-3">
												<div className="text-xs text-gray-400 mb-1">Power-ups:</div>
												<div className="flex gap-1">
													{player.powerUps.map(powerUp => (
														<div
															key={powerUp.id}
															className="text-lg cursor-pointer hover:scale-110 transition-transform"
															title={powerUp.name}
														>
															{powerUp.icon}
														</div>
													))}
												</div>
											</div>
										)}
									</motion.div>
								))}
							</div>
							
							{/* Ready Button */}
							{currentPlayer && (
								<div className="mt-6 text-center">
									<button
										onClick={handleReadyUp}
										className={`px-8 py-3 rounded-lg font-semibold transition-all duration-200 ${
											currentPlayer.isReady
												? 'bg-green-600 hover:bg-green-700 text-white'
												: 'bg-yellow-600 hover:bg-yellow-700 text-white'
										}`}
									>
										{currentPlayer.isReady ? '✓ Ready' : 'Ready Up'}
									</button>
								</div>
							)}
						</div>

						{/* Game Settings */}
						<div className="bg-gray-800/50 rounded-xl p-6">
							<h2 className="text-xl font-semibold text-white mb-4">⚙️ Game Settings</h2>
							
							<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
								<div className="text-center">
									<div className="text-2xl text-purple-400 mb-1">
										{currentRoom.mode === 'duel' ? '⚔️' : '🌪️'}
									</div>
									<div className="text-white font-semibold">
										{currentRoom.mode === 'duel' ? 'Neural Clash' : 'Cerebral Storm'}
									</div>
									<div className="text-gray-400 text-sm">Mode</div>
								</div>
								
								<div className="text-center">
									<div className="text-2xl text-blue-400 mb-1">⏱️</div>
									<div className="text-white font-semibold">
										{currentRoom.settings.roundTimeLimit / 1000}s
									</div>
									<div className="text-gray-400 text-sm">Time Limit</div>
								</div>
								
								<div className="text-center">
									<div className="text-2xl text-green-400 mb-1">🎯</div>
									<div className="text-white font-semibold">
										{currentRoom.settings.maxRounds}
									</div>
									<div className="text-gray-400 text-sm">Max Rounds</div>
								</div>
								
								<div className="text-center">
									<div className="text-2xl text-yellow-400 mb-1">
										{currentRoom.settings.powerUpsEnabled ? '💎' : '❌'}
									</div>
									<div className="text-white font-semibold">
										{currentRoom.settings.powerUpsEnabled ? 'Enabled' : 'Disabled'}
									</div>
									<div className="text-gray-400 text-sm">Power-ups</div>
								</div>
							</div>
						</div>
					</div>

					{/* Right Panel - Chat & Power-ups */}
					<div className="space-y-6">
						{/* Power-ups */}
						{currentRoom.settings.powerUpsEnabled && (
							<div className="bg-gray-800/50 rounded-xl p-4">
								<h3 className="text-lg font-semibold text-white mb-3">💎 Power-ups</h3>
								
								<div className="space-y-2">
									{availablePowerUps.map(powerUp => (
										<motion.div
											key={powerUp.id}
											whileHover={{ scale: 1.02 }}
											className={`p-3 rounded-lg border cursor-pointer transition-all ${
												selectedPowerUps.includes(powerUp.id)
													? 'border-purple-500 bg-purple-500/20'
													: 'border-gray-600 bg-gray-700/30'
											}`}
											onClick={() => handlePowerUpSelect(powerUp.id)}
										>
											<div className="flex items-center gap-3">
												<div className="text-2xl">{powerUp.icon}</div>
												<div className="flex-1">
													<div className="text-white font-semibold text-sm">{powerUp.name}</div>
													<div className="text-gray-400 text-xs">{powerUp.description}</div>
												</div>
												<div className={`text-xs px-2 py-1 rounded ${
													powerUp.rarity === 'legendary' ? 'bg-yellow-500/20 text-yellow-400' :
													powerUp.rarity === 'epic' ? 'bg-purple-500/20 text-purple-400' :
													powerUp.rarity === 'rare' ? 'bg-blue-500/20 text-blue-400' :
													'bg-gray-500/20 text-gray-400'
												}`}>
													{powerUp.rarity}
												</div>
											</div>
										</motion.div>
									))}
								</div>
								
								{selectedPowerUps.length > 0 && (
									<div className="mt-4">
										<button
											onClick={() => {
												selectedPowerUps.forEach(powerUpId => handleUsePowerUp(powerUpId));
												setSelectedPowerUps([]);
											}}
											className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg transition-colors"
										>
											Use Selected Power-ups
										</button>
									</div>
								)}
							</div>
						)}

						{/* Room Chat */}
						<div className="bg-gray-800/50 rounded-xl p-4 h-64 flex flex-col">
							<h3 className="text-lg font-semibold text-white mb-3">💬 Room Chat</h3>
							
							<div className="flex-1 overflow-y-auto space-y-2 mb-3">
								{currentRoom.chat.slice(-10).map(message => (
									<div key={message.id} className="text-sm">
										<span className="text-purple-400 font-medium">{message.playerName}:</span>
										<span className="text-gray-300 ml-2">{message.message}</span>
									</div>
								))}
							</div>
							
							<div className="flex gap-2">
								<input
									type="text"
									value={chatMessage}
									onChange={(e) => setChatMessage(e.target.value)}
									onKeyPress={(e) => e.key === 'Enter' && handleSendChat()}
									placeholder="Type a message..."
									className="flex-1 bg-gray-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
								/>
								<button
									onClick={handleSendChat}
									className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
								>
									Send
								</button>
							</div>
						</div>

						{/* Game Status */}
						<div className="bg-gray-800/50 rounded-xl p-4">
							<h3 className="text-lg font-semibold text-white mb-3">🎮 Game Status</h3>
							
							<div className="space-y-2">
								<div className="flex justify-between">
									<span className="text-gray-400">Status:</span>
									<span className={`font-semibold ${
										currentRoom.state === 'waiting' ? 'text-yellow-400' :
										currentRoom.state === 'countdown' ? 'text-blue-400' :
										currentRoom.state === 'playing' ? 'text-green-400' :
										'text-gray-400'
									}`}>
										{currentRoom.state.charAt(0).toUpperCase() + currentRoom.state.slice(1)}
									</span>
								</div>
								
								<div className="flex justify-between">
									<span className="text-gray-400">Players Ready:</span>
									<span className="text-white font-semibold">
										{currentRoom.players.filter(p => p.isReady).length}/{currentRoom.players.length}
									</span>
								</div>
								
								<div className="flex justify-between">
									<span className="text-gray-400">Can Start:</span>
									<span className={`font-semibold ${canStart ? 'text-green-400' : 'text-red-400'}`}>
										{canStart ? 'Yes' : 'No'}
									</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</motion.div>
		</motion.div>
	);
}
