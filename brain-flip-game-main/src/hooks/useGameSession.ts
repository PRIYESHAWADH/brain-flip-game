import { useCallback } from 'react';
import { useAuth } from './useAuth';
import { useGameStore } from '@/store/gameStore';

interface GameSessionData {
  score: number;
  level: number;
  streak: number;
  mistakes: number;
  timeRemaining: number;
  instructionsCompleted: number;
  averageReactionTime: number;
  sessionDuration: number;
  perfectRounds: number;
  lightningReactions: number;
  comboStreak: number;
  celebrationLevel: string;
  gameMode: string;
}

export function useGameSession() {
  const { user } = useAuth();
  const {
    score,
    level,
    streak,
    mistakes,
    timeRemaining,
    perfectRounds,
    lightningReactions,
    comboStreak,
    celebrationLevel,
    gameMode,
    sessionStartTime
  } = useGameStore();

  const submitGameSession = useCallback(async (sessionData: { averageReactionTime?: number; instructionsCompleted?: number } = {}) => {
    if (!user?.id) {
      console.warn('No user logged in, skipping session submission');
      return { success: false, error: 'No user logged in' };
    }

    try {
      // Calculate session duration
      const sessionDuration = Date.now() - sessionStartTime;
      
      // Calculate average reaction time (placeholder - would need to track this in game store)
      const avgReactionTime = averageReactionTime || 500;

      const payload = {
        user_id: user.id,
        game_mode: gameMode,
        score,
        level,
        streak,
        mistakes,
        time_remaining: timeRemaining,
        instructions_completed: level, // Assuming each level is one instruction
        average_reaction_time: averageReactionTime,
        session_duration: sessionDuration,
        perfect_rounds: perfectRounds,
        lightning_reactions: lightningReactions,
        combo_streak: comboStreak,
        celebration_level: celebrationLevel,
        is_completed: true
      };

      const response = await fetch('/api/game/submit-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit game session');
      }

      return { success: true, data: result.data };
    } catch (error: unknown) {
      console.error('Game session submission error:', error);
      return { success: false, error: error.message };
    }
  }, [user?.id, score, level, streak, mistakes, timeRemaining, perfectRounds, lightningReactions, comboStreak, celebrationLevel, gameMode, sessionStartTime]);

  const submitPartialSession = useCallback(async (isCompleted: boolean = false) => {
    if (!user?.id) {
      return { success: false, error: 'No user logged in' };
    }

    try {
      const sessionDuration = Date.now() - sessionStartTime;
      const payload = {
        user_id: user.id,
        game_mode: gameMode,
        score,
        level,
        streak,
        mistakes,
        time_remaining: timeRemaining,
        instructions_completed: level,
        average_reaction_time: 500, // Default value
        session_duration: sessionDuration,
        perfect_rounds: perfectRounds,
        lightning_reactions: lightningReactions,
        combo_streak: comboStreak,
        celebration_level: celebrationLevel,
        is_completed: isCompleted
      };

      const response = await fetch('/api/game/submit-partial-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });


      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit partial session');
      }

      return { success: true, data: result.data };
    } catch (error: unknown) {
      console.error('Partial session submission error:', error);
      return { success: false, error: error.message };
    }
  }, [user?.id, score, level, streak, mistakes, timeRemaining, perfectRounds, lightningReactions, comboStreak, celebrationLevel, gameMode, sessionStartTime]);

  return {
    submitGameSession,
    submitPartialSession,
    isAuthenticated: !!user?.id
  };
}
