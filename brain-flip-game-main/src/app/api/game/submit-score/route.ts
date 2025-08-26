import { NextResponse } from 'next/server';
import { worldClassSupabase } from '@/lib/supabase-enhanced';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    const { 
      user_id, 
      game_mode, 
      score, 
      level, 
      streak, 
      mistakes, 
      time_remaining, 
      instructions_completed, 
      average_reaction_time, 
      session_duration,
      perfect_rounds,
      lightning_reactions,
      combo_streak,
      celebration_level,
      is_completed = true
    } = body;

    // Validate required fields
    if (!user_id || !game_mode || score === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: user_id, game_mode, score' },
        { status: 400 }
      );
    }

    // Create game session
    const { data: sessionData, error: sessionError } = await worldClassSupabase.createGameSession({
      user_id,
      game_mode,
      score,
      level: level || 1,
      streak: streak || 0,
      mistakes: mistakes || 0,
      time_remaining: time_remaining || 0,
      instructions_completed: instructions_completed || 0,
      average_reaction_time: average_reaction_time || 0,
      session_duration: session_duration || 0,
      perfect_rounds: perfect_rounds || 0,
      lightning_reactions: lightning_reactions || 0,
      combo_streak: combo_streak || 0,
      celebration_level: celebration_level || 'none',
      is_completed
    });

    if (sessionError) {
      console.error('Game session creation error:', sessionError);
      return NextResponse.json(
        { error: 'Failed to save game session' },
        { status: 500 }
      );
    }

    // Update leaderboard
    const { error: leaderboardError } = await worldClassSupabase.updateLeaderboard({
      user_id,
      game_mode,
      score
    });

    if (leaderboardError) {
      console.error('Leaderboard update error:', leaderboardError);
      // Don't fail the request, just log the error
    }

    // Update user profile stats
    const { error: profileError } = await worldClassSupabase.updateUserStats({
      user_id,
      score,
      level,
      streak,
      perfect_rounds,
      lightning_reactions,
      combo_streak
    });

    if (profileError) {
      console.error('Profile update error:', profileError);
      // Don't fail the request, just log the error
    }

    // Check for achievements
    const { data: achievements, error: achievementError } = await worldClassSupabase.checkAchievements({
      user_id,
      score,
      level,
      streak,
      perfect_rounds,
      lightning_reactions,
      combo_streak,
      celebration_level
    });

    if (achievementError) {
      console.error('Achievement check error:', achievementError);
    }

    return NextResponse.json({
      success: true,
      data: {
        session: sessionData,
        achievements: achievements || []
      }
    });

  } catch (error: unknown) {
    console.error('Submit score error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

