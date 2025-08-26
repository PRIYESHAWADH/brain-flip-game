import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { worldClassSupabase } from '@/lib/supabase-enhanced';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition_type: string;
  condition_value: number;
  reward_coins?: number;
  reward_xp?: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlocked_at?: string;
}

interface UseAchievementsReturn {
  achievements: Achievement[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
  checkAchievements: (params: {
    score: number;
    level: number;
    streak: number;
    perfect_rounds?: number;
    lightning_reactions?: number;
    combo_streak?: number;
    celebration_level?: string;
  }) => Promise<Achievement[]>;
}

export function useAchievements(): UseAchievementsReturn {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await worldClassSupabase.getUserAchievements(user.id);

      if (fetchError) {
        throw new Error('Failed to fetch achievements');
      }

      // Transform the data to include achievement definitions
        ...entry.achievement_definitions,
        unlocked_at: entry.unlocked_at
      })) || [];

      setAchievements(transformedAchievements);
    } catch (err: unknown) {
      setError(err.message || 'Failed to fetch achievements');
      console.error('Achievements fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);
    score: number;
    level: number;
    streak: number;
    perfect_rounds?: number;
    lightning_reactions?: number;
    combo_streak?: number;
    celebration_level?: string;
  }) => {
    if (!user?.id) return [];

    try {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          ...params
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to check achievements');
      }

      if (result.success && result.data?.achievements?.length > 0) {
        // Refresh achievements list to show newly unlocked ones
        await fetchAchievements();
        return result.data.achievements;
      }

      return [];
    } catch (err: unknown) {
      console.error('Achievement check error:', err);
      return [];
    }
  }, [user?.id, fetchAchievements]);
    fetchAchievements();
  }, [fetchAchievements]);

  // Initial load
  useEffect(() => {
    fetchAchievements();
  }, [fetchAchievements]);

  return {
    achievements,
    loading,
    error,
    refresh,
    checkAchievements
  };
}
