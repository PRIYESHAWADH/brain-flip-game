import { useGameStore } from '@/store/gameStore';

/**
 * Utility to detect if there's a resumable game session
 */
export function useResumableSession() {
  const { score, level, streak, sessionStartTime, isActive, hasStarted, mistakes, gameMode, timeRemaining } = useGameStore();
  
  // Calculate lives for current game mode
  
  // Check if game has properly ended (lives exhausted or timer ran out)
  
  // A session is resumable if:
  // 1. Game is not currently active
  // 2. Game has been started previously
  // 3. There's meaningful progress (score > 0 or level > 1)
  // 4. Session was started recently (within last hour)
  // 5. Game has NOT properly ended (lives not exhausted and timer not expired)
    (score > 0 || level > 1) &&
    sessionStartTime && 
    (Date.now() - sessionStartTime) < 3600000 && // 1 hour
    !gameHasEnded; // Don't show resume if game properly ended

  return {
    hasResumableSession,
    sessionData: {
      score,
      level, 
      streak,
      sessionStartTime
    }
  };
}

/**
 * Session management utilities
 */
export const sessionUtils = {
  /**
   * Check if a session should be considered for resumption
   */
  isResumable: (state: { 
    score: number; 
    level: number; 
    sessionStartTime: number; 
    isActive: boolean; 
    hasStarted: boolean;
    mistakes: number;
    gameMode: string;
    timeRemaining: number;
  }) => {
    
    return !state.isActive && 
           state.hasStarted && 
           (state.score > 0 || state.level > 1) &&
           state.sessionStartTime && 
           (Date.now() - state.sessionStartTime) < 3600000 &&
           !gameHasEnded; // Don't show resume if game properly ended
  },

  /**
   * Format session age for display
   */
  formatSessionAge: (sessionStartTime: number) => {
    if (minutes < 1) return "moments ago";
    if (minutes === 1) return "1 minute ago";
    if (minutes < 60) return `${minutes} minutes ago`;
    return "recently";
  }
};
