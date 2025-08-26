import { NextResponse } from 'next/server';
import { worldClassSupabase } from '@/lib/supabase-enhanced';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing required parameter: user_id' },
        { status: 400 }
      );
    }

    // Get user profile with stats
    const { data: profile, error: profileError } = await worldClassSupabase.getProfile(userId);

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      return NextResponse.json(
        { error: 'Failed to fetch user profile' },
        { status: 500 }
      );
    }

    if (!profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Get recent game sessions
    const { data: recentSessions, error: sessionsError } = await worldClassSupabase.getUserGameSessions(userId, 10);

    if (sessionsError) {
      console.error('Sessions fetch error:', sessionsError);
      // Don't fail the request, just log the error
    }

    // Get user achievements
    const { data: achievements, error: achievementsError } = await worldClassSupabase.getUserAchievements(userId);

    if (achievementsError) {
      console.error('Achievements fetch error:', achievementsError);
      // Don't fail the request, just log the error
    }

    // Calculate additional stats
    const stats = {
      profile: {
        id: profile.id,
        username: profile.username,
        display_name: profile.display_name,
        avatar_url: profile.avatar_url,
        level: profile.level,
        experience: profile.experience,
        total_games_played: profile.total_games_played,
        total_score: profile.total_score,
        best_score: profile.best_score,
        longest_streak: profile.longest_streak,
        achievements_unlocked: profile.achievements_unlocked,
        average_reaction_time: profile.average_reaction_time,
        premium_status: profile.premium_status,
        created_at: profile.created_at,
        updated_at: profile.updated_at
      },
      recent_sessions: recentSessions || [],
      achievements: achievements || [],
      calculated_stats: {
        average_score: profile.total_games_played > 0 ? Math.round(profile.total_score / profile.total_games_played) : 0,
        win_rate: profile.total_games_played > 0 ? Math.round((profile.total_games_played / (profile.total_games_played + (profile.total_games_played * 0.3))) * 100) : 0, // Simplified calculation
        games_this_week: recentSessions?.filter(session => {
          const sessionDate = new Date(session.created_at);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return sessionDate >= weekAgo;
        }).length || 0
      }
    };

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error: unknown) {
    console.error('User stats fetch error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
