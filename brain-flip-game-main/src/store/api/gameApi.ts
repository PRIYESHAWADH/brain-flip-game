/**
 * Ultimate Brain Flip Experience - Game API
 * RTK Query API for game-related operations
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../index';

// Types
interface GameSession {
  id: string;
  userId: string;
  gameMode: 'classic' | 'sudden-death' | 'duel';
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
  isCompleted: boolean;
  createdAt: string;
  completedAt?: string;
}

interface CreateGameSessionRequest {
  gameMode: 'classic' | 'sudden-death' | 'duel';
  aiPersonalizationEnabled: boolean;
  difficulty?: number;
}

interface UpdateGameSessionRequest {
  sessionId: string;
  score: number;
  level: number;
  streak: number;
  mistakes: number;
  timeRemaining: number;
  instructionsCompleted: number;
  averageReactionTime: number;
  perfectRounds: number;
  lightningReactions: number;
  comboStreak: number;
}

interface CompleteGameSessionRequest {
  sessionId: string;
  finalScore: number;
  finalLevel: number;
  finalStreak: number;
  totalMistakes: number;
  sessionDuration: number;
  performanceMetrics: {
    averageReactionTime: number;
    perfectRounds: number;
    lightningReactions: number;
    comboStreak: number;
    cognitiveMetrics?: any;
  };
}

interface LeaderboardEntry {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  gameMode: string;
  score: number;
  rank: number;
  createdAt: string;
  neuralAvatarLevel?: number;
}

interface GameStats {
  totalGamesPlayed: number;
  totalScore: number;
  bestScore: number;
  averageReactionTime: number;
  longestStreak: number;
  achievementsUnlocked: number;
  totalPlayTime: number;
  cognitiveAge?: number;
  brainHealthScore?: number;
}

// API Definition
export const gameApi = createApi({
  reducerPath: 'gameApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/game',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth?.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      headers.set('content-type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['GameSession', 'Leaderboard', 'GameStats', 'Achievement'],
  endpoints: (builder) => ({
    // Game Session Management
    createGameSession: builder.mutation<GameSession, CreateGameSessionRequest>({
      query: (data) => ({
        url: '/sessions',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['GameSession', 'GameStats'],
    }),

    updateGameSession: builder.mutation<GameSession, UpdateGameSessionRequest>({
      query: ({ sessionId, ...data }) => ({
        url: `/sessions/${sessionId}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { sessionId }) => [
        { type: 'GameSession', id: sessionId },
      ],
    }),

    completeGameSession: builder.mutation<GameSession, CompleteGameSessionRequest>({
      query: ({ sessionId, ...data }) => ({
        url: `/sessions/${sessionId}/complete`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['GameSession', 'GameStats', 'Leaderboard', 'Achievement'],
    }),

    getGameSession: builder.query<GameSession, string>({
      query: (sessionId) => `/sessions/${sessionId}`,
      providesTags: (result, error, sessionId) => [
        { type: 'GameSession', id: sessionId },
      ],
    }),

    getUserGameSessions: builder.query<GameSession[], { userId: string; limit?: number; offset?: number }>({
      query: ({ userId, limit = 20, offset = 0 }) => 
        `/sessions/user/${userId}?limit=${limit}&offset=${offset}`,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'GameSession' as const, id })),
              { type: 'GameSession', id: 'LIST' },
            ]
          : [{ type: 'GameSession', id: 'LIST' }],
    }),

    // Leaderboards
    getLeaderboard: builder.query<LeaderboardEntry[], { 
      gameMode?: string; 
      timeframe?: 'daily' | 'weekly' | 'monthly' | 'all-time';
      limit?: number;
      offset?: number;
    }>({
      query: ({ gameMode, timeframe = 'all-time', limit = 50, offset = 0 }) => {
        const params = new URLSearchParams({
          timeframe,
          limit: limit.toString(),
          offset: offset.toString(),
        });
        if (gameMode) params.append('gameMode', gameMode);
        return `/leaderboard?${params}`;
      },
      providesTags: ['Leaderboard'],
    }),

    getUserRank: builder.query<{ rank: number; totalPlayers: number }, { 
      userId: string; 
      gameMode?: string;
    }>({
      query: ({ userId, gameMode }) => {
        const params = new URLSearchParams();
        if (gameMode) params.append('gameMode', gameMode);
        return `/leaderboard/rank/${userId}?${params}`;
      },
      providesTags: ['Leaderboard'],
    }),

    // Game Statistics
    getUserStats: builder.query<GameStats, string>({
      query: (userId) => `/stats/${userId}`,
      providesTags: ['GameStats'],
    }),

    getGlobalStats: builder.query<{
      totalPlayers: number;
      totalGamesPlayed: number;
      averageSessionDuration: number;
      topPerformers: LeaderboardEntry[];
    }, void>({
      query: () => '/stats/global',
      providesTags: ['GameStats'],
    }),

    // Achievements
    getUserAchievements: builder.query<any[], string>({
      query: (userId) => `/achievements/${userId}`,
      providesTags: ['Achievement'],
    }),

    unlockAchievement: builder.mutation<any, { 
      userId: string; 
      achievementId: string;
      sessionId?: string;
    }>({
      query: (data) => ({
        url: '/achievements/unlock',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Achievement', 'GameStats'],
    }),

    // Game Configuration
    getGameConfig: builder.query<{
      difficultyLevels: any[];
      gameModes: any[];
      achievementDefinitions: any[];
      instructionTypes: any[];
    }, void>({
      query: () => '/config',
    }),

    // Performance Analytics
    submitPerformanceData: builder.mutation<void, {
      sessionId: string;
      performanceMetrics: {
        reactionTimes: number[];
        accuracyByType: Record<string, number>;
        cognitiveLoad: number;
        flowStateIndicators: any;
        errorPatterns: any[];
      };
    }>({
      query: (data) => ({
        url: '/analytics/performance',
        method: 'POST',
        body: data,
      }),
    }),

    // Real-time Game Events
    submitGameEvent: builder.mutation<void, {
      sessionId: string;
      eventType: string;
      eventData: any;
      timestamp: number;
    }>({
      query: (data) => ({
        url: '/events',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

// Export hooks
export const {
  useCreateGameSessionMutation,
  useUpdateGameSessionMutation,
  useCompleteGameSessionMutation,
  useGetGameSessionQuery,
  useGetUserGameSessionsQuery,
  useGetLeaderboardQuery,
  useGetUserRankQuery,
  useGetUserStatsQuery,
  useGetGlobalStatsQuery,
  useGetUserAchievementsQuery,
  useUnlockAchievementMutation,
  useGetGameConfigQuery,
  useSubmitPerformanceDataMutation,
  useSubmitGameEventMutation,
} = gameApi;

// Export API
export default gameApi;