import { useState, useEffect, useCallback } from 'react';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  score: number;
  gameMode: string;
  createdAt: string;
  updatedAt: string;
}

interface LeaderboardData {
  leaderboard: LeaderboardEntry[];
  gameMode: string;
  total: number;
  limit: number;
  offset: number;
}

interface UseLeaderboardReturn {
  leaderboard: LeaderboardEntry[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
  loadMore: () => void;
  hasMore: boolean;
}

export function useLeaderboard(gameMode: string, limit = 50): UseLeaderboardReturn {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const refresh = useCallback(async () => {
    if (!gameMode) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/leaderboard/${gameMode}?limit=${limit}&offset=0`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }

      const result = await response.json();

      if (result.success) {
        const newData: LeaderboardData = result.data;
        setLeaderboard(newData.leaderboard);
        setHasMore(newData.leaderboard.length === limit);
        setOffset(newData.leaderboard.length);
      } else {
        throw new Error(result.error || 'Failed to fetch leaderboard');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch leaderboard';
      setError(errorMessage);
      console.error('Leaderboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [gameMode, limit]);

  const loadMore = useCallback(async () => {
    if (!gameMode || loading || !hasMore) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/leaderboard/${gameMode}?limit=${limit}&offset=${offset}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }

      const result = await response.json();

      if (result.success) {
        const newData: LeaderboardData = result.data;
        setLeaderboard(prev => [...prev, ...newData.leaderboard]);
        setHasMore(newData.leaderboard.length === limit);
        setOffset(prev => prev + newData.leaderboard.length);
      } else {
        throw new Error(result.error || 'Failed to fetch leaderboard');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch leaderboard';
      setError(errorMessage);
      console.error('Leaderboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [gameMode, limit, loading, hasMore, offset]);

  // Initial load
  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    leaderboard,
    loading,
    error,
    refresh,
    loadMore,
    hasMore
  };
}
