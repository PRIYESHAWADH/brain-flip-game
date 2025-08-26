'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface TranscendentBackgroundProps {
	infiniteConsciousness: boolean;
	cosmicResonance: number;
	dimensionalShift: number;
	omniscientLevel: number;
	neuralHarmony: number;
	brainwaveIntensity: number;
	realityBendingPower: number;
	timePerceptionShift: number;
	prefersReducedMotion: boolean;
}

// 🌌 ULTIMATE TRANSCENDENT BACKGROUND SYSTEM - REALITY BENDING VISUALS 🌌
export default function TranscendentBackground({
	infiniteConsciousness,
	cosmicResonance,
	dimensionalShift,
	omniscientLevel,
	neuralHarmony,
	brainwaveIntensity,
	realityBendingPower,
	timePerceptionShift,
	prefersReducedMotion
}: TranscendentBackgroundProps) {
	const [particles, setParticles] = useState<Array<{
		id: number;
		x: number;
		y: number;
		vx: number;
		vy: number;
		size: number;
		hue: number;
		opacity: number;
	}>>([]);

	// Generate consciousness particles
	useEffect(() => {
		if (prefersReducedMotion) return;
			50 + (cosmicResonance / 2) + (dimensionalShift * 5) + (omniscientLevel * 2),
			200
		);
			id: i,
			x: Math.random() * window.innerWidth,
			y: Math.random() * window.innerHeight,
			vx: (Math.random() - 0.5) * (1 + timePerceptionShift),
			vy: (Math.random() - 0.5) * (1 + timePerceptionShift),
			size: 1 + Math.random() * 4 + (infiniteConsciousness ? 3 : 0),
			hue: Math.random() * 360,
			opacity: 0.3 + Math.random() * 0.7
		}));

		setParticles(newParticles);

		// Animate particles
			setParticles(prev => prev.map(particle => ({
				...particle,
				x: (particle.x + particle.vx + window.innerWidth) % window.innerWidth,
				y: (particle.y + particle.vy + window.innerHeight) % window.innerHeight,
				hue: (particle.hue + (dimensionalShift * 0.5)) % 360,
				opacity: Math.max(0.1, Math.min(1, particle.opacity + (Math.random() - 0.5) * 0.02))
			})));
		};
		return () => clearInterval(interval);
	}, [cosmicResonance, dimensionalShift, omniscientLevel, infiniteConsciousness, timePerceptionShift, prefersReducedMotion]);

	if (prefersReducedMotion) return null;

	// Calculate background intensity
		(cosmicResonance / 100) + 
		(dimensionalShift / 10) + 
		(omniscientLevel / 20) + 
		(neuralHarmony / 100) +
		(Math.abs(brainwaveIntensity) / 100),
		1
	);

	return (
		<div 
			className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
			style={{
				// 🚀 ULTIMATE PERFORMANCE OPTIMIZATION - GPU ACCELERATION
				willChange: 'transform, opacity, filter',
				transform: 'translateZ(0)', // Force hardware acceleration
				backfaceVisibility: 'hidden', // Prevent flicker
				contain: 'layout style paint', // Optimize rendering
				isolation: 'isolate' // Create stacking context
			}}
		>
			{/* 🌌 INFINITE CONSCIOUSNESS BACKGROUND */}
			{infiniteConsciousness && (
				<motion.div
					className="absolute inset-0"
					animate={{
						background: [
							'radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(147, 51, 234, 0.1) 0%, transparent 50%)',
							'radial-gradient(circle at 50% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 50% 80%, rgba(236, 72, 153, 0.1) 0%, transparent 50%)',
							'radial-gradient(circle at 80% 50%, rgba(16, 185, 129, 0.1) 0%, transparent 50%), radial-gradient(circle at 20% 50%, rgba(245, 158, 11, 0.1) 0%, transparent 50%)'
						]
					}}
					transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
				/>
			)}

			{/* 🌠 COSMIC RESONANCE WAVES */}
			{cosmicResonance > 50 && (
				<motion.div
					className="absolute inset-0"
					animate={{
						background: [
							`conic-gradient(from 0deg at 50% 50%, transparent 0%, rgba(147, 51, 234, ${cosmicResonance / 500}) 25%, transparent 50%, rgba(59, 130, 246, ${cosmicResonance / 500}) 75%, transparent 100%)`,
							`conic-gradient(from 90deg at 50% 50%, transparent 0%, rgba(147, 51, 234, ${cosmicResonance / 500}) 25%, transparent 50%, rgba(59, 130, 246, ${cosmicResonance / 500}) 75%, transparent 100%)`,
							`conic-gradient(from 180deg at 50% 50%, transparent 0%, rgba(147, 51, 234, ${cosmicResonance / 500}) 25%, transparent 50%, rgba(59, 130, 246, ${cosmicResonance / 500}) 75%, transparent 100%)`
						]
					}}
					transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
				/>
			)}

			{/* 🌈 DIMENSIONAL SHIFT FRACTALS */}
			{dimensionalShift > 3 && (
				<svg className="absolute inset-0 w-full h-full">
					{Array.from({ length: Math.min(dimensionalShift * 2, 20) }, (_, i) => (
						<motion.circle
							key={i}
							cx="50%"
							cy="50%"
							r={50 + i * 30}
							fill="none"
							stroke={`hsl(${(i * 60) % 360}, 70%, 50%)`}
							strokeWidth="1"
							opacity={0.3}
							animate={{
								r: [50 + i * 30, 100 + i * 30, 50 + i * 30],
								rotate: [0, 360],
								strokeDasharray: ["0 100", "50 50", "100 0"]
							}}
							transition={{
								duration: 4 + i * 0.5,
								repeat: Infinity,
								ease: "easeInOut"
							}}
						/>
					))}
				</svg>
			)}

			{/* 🔮 OMNISCIENT AURA */}
			{omniscientLevel > 5 && (
				<motion.div
					className="absolute inset-0"
					animate={{
						background: [
							`radial-gradient(ellipse at center, rgba(254, 240, 138, ${omniscientLevel / 100}) 0%, transparent 70%)`,
							`radial-gradient(ellipse at center, rgba(254, 240, 138, ${omniscientLevel / 80}) 0%, transparent 60%)`,
							`radial-gradient(ellipse at center, rgba(254, 240, 138, ${omniscientLevel / 100}) 0%, transparent 70%)`
						]
					}}
					transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
				/>
			)}

			{/* 🧠 NEURAL HARMONY GRID */}
			{neuralHarmony > 40 && (
				<svg className="absolute inset-0 w-full h-full">
					<defs>
						<pattern id="neuralGrid" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
							<motion.path
								d="M 0 25 Q 25 0 50 25 T 100 25"
								fill="none"
								stroke={`rgba(6, 182, 212, ${neuralHarmony / 200})`}
								strokeWidth="1"
								animate={{
									d: [
										"M 0 25 Q 25 0 50 25 T 100 25",
										"M 0 25 Q 25 50 50 25 T 100 25",
										"M 0 25 Q 25 0 50 25 T 100 25"
									]
								}}
								transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
							/>
						</pattern>
					</defs>
					<rect width="100%" height="100%" fill="url(#neuralGrid)" />
				</svg>
			)}

			{/* ⚡ BRAINWAVE INTENSITY PULSES */}
			{Math.abs(brainwaveIntensity) > 30 && (
				<motion.div
					className="absolute inset-0"
					animate={{
						background: brainwaveIntensity > 0 
							? [
								`radial-gradient(circle, rgba(245, 158, 11, ${Math.abs(brainwaveIntensity) / 400}) 0%, transparent 50%)`,
								`radial-gradient(circle, rgba(249, 115, 22, ${Math.abs(brainwaveIntensity) / 300}) 0%, transparent 60%)`,
								`radial-gradient(circle, rgba(245, 158, 11, ${Math.abs(brainwaveIntensity) / 400}) 0%, transparent 50%)`
							]
							: [
								`radial-gradient(circle, rgba(239, 68, 68, ${Math.abs(brainwaveIntensity) / 400}) 0%, transparent 50%)`,
								`radial-gradient(circle, rgba(220, 38, 38, ${Math.abs(brainwaveIntensity) / 300}) 0%, transparent 60%)`,
								`radial-gradient(circle, rgba(239, 68, 68, ${Math.abs(brainwaveIntensity) / 400}) 0%, transparent 50%)`
							]
					}}
					transition={{ 
						duration: brainwaveIntensity > 0 ? 0.5 : 0.3, 
						repeat: Infinity, 
						ease: "easeInOut" 
					}}
				/>
			)}

			{/* 🌟 REALITY BENDING DISTORTION */}
			{Math.abs(realityBendingPower) > 50 && (
				<motion.div
					className="absolute inset-0"
					style={{
						background: realityBendingPower > 0
							? `conic-gradient(from 0deg, transparent, rgba(168, 85, 247, ${realityBendingPower / 200}), transparent, rgba(59, 130, 246, ${realityBendingPower / 200}), transparent)`
							: `radial-gradient(ellipse, rgba(239, 68, 68, ${Math.abs(realityBendingPower) / 200}) 0%, transparent 70%)`
					}}
					animate={{
						rotate: realityBendingPower > 0 ? [0, 360] : [0, -180, 0],
						scale: realityBendingPower > 0 ? [1, 1.1, 1] : [1, 0.9, 1]
					}}
					transition={{
						rotate: { duration: realityBendingPower > 0 ? 8 : 2, repeat: Infinity, ease: "linear" },
						scale: { duration: 1, repeat: Infinity, ease: "easeInOut" }
					}}
				/>
			)}

			{/* 🌌 CONSCIOUSNESS PARTICLES */}
			{particles.map(particle => (
				<motion.div
					key={particle.id}
					className="absolute rounded-full"
					style={{
						left: particle.x,
						top: particle.y,
						width: particle.size,
						height: particle.size,
						background: `hsl(${particle.hue}, 70%, 60%)`,
						opacity: particle.opacity * backgroundIntensity,
						boxShadow: `0 0 ${particle.size * 2}px hsl(${particle.hue}, 70%, 60%)`
					}}
					animate={{
						scale: [1, 1.5, 1],
						opacity: [particle.opacity * backgroundIntensity, particle.opacity * backgroundIntensity * 0.5, particle.opacity * backgroundIntensity]
					}}
					transition={{
						duration: 2 + Math.random() * 3,
						repeat: Infinity,
						ease: "easeInOut"
					}}
				/>
			))}

			{/* ⏰ TIME PERCEPTION VISUAL DISTORTION */}
			{timePerceptionShift !== 1 && (
				<motion.div
					className="absolute inset-0"
					animate={{
						filter: timePerceptionShift < 1 
							? ['blur(0px)', 'blur(2px)', 'blur(0px)']
							: ['blur(0px)', 'blur(5px)', 'blur(0px)'],
						scale: timePerceptionShift < 1 ? [1, 1.02, 1] : [1, 0.98, 1]
					}}
					transition={{
						duration: timePerceptionShift < 1 ? 0.3 : 2,
						repeat: Infinity,
						ease: "easeInOut"
					}}
					style={{
						background: timePerceptionShift < 1
							? 'linear-gradient(45deg, transparent 40%, rgba(59, 130, 246, 0.05) 50%, transparent 60%)'
							: 'linear-gradient(45deg, transparent 40%, rgba(239, 68, 68, 0.05) 50%, transparent 60%)'
					}}
				/>
			)}
		</div>
	);
}
