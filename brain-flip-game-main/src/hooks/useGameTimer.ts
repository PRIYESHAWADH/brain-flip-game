import { useEffect, useRef } from 'react';
import { useGameStore } from '@/store/gameStore';

export function useGameTimer() {
	const { 
		isActive, 
		currentInstruction, 
		timeRemaining, 
		updateTimer, 
		endGame 
	} = useGameStore();
	const timerRef = useRef<NodeJS.Timeout | null>(null);
	const lastUpdateRef = useRef<number>(Date.now());

	useEffect(() => {
		if (!isActive || !currentInstruction) {
			if (timerRef.current) {
				clearInterval(timerRef.current);
				timerRef.current = null;
			}
			return;
		}

		// High precision timer for smooth countdown
		timerRef.current = setInterval(() => {
			const now = Date.now();
			const deltaTime = now - lastUpdateRef.current;
			lastUpdateRef.current = now;

			const newTimeRemaining = Math.max(0, timeRemaining - deltaTime);
			updateTimer(newTimeRemaining);

			// End game if time runs out
			if (newTimeRemaining <= 0) {
				endGame();
			}
		}, 16); // ~60fps updates for smooth timer

		return () => {
			if (timerRef.current) {
				clearInterval(timerRef.current);
				timerRef.current = null;
			}
		};
	}, [isActive, currentInstruction, timeRemaining, updateTimer, endGame]);

	// Reset timer when new instruction starts
	useEffect(() => {
		lastUpdateRef.current = Date.now();
	}, [currentInstruction?.id]);

	return {
		isActive,
		currentInstruction,
		timeRemaining
	};
}
