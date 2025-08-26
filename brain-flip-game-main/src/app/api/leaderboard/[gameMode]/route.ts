import { NextResponse } from 'next/server';
import { worldClassSupabase } from '@/lib/supabase-enhanced';

export async function GET(
  request: Request,
  { params }: { params: { gameMode: string } }
) {
  try {
    const { gameMode } = params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Validate game mode
    const validModes = ['classic', 'duel', 'sudden-death'];
    if (!validModes.includes(gameMode)) {
      return NextResponse.json(
        { error: 'Invalid game mode' },
        { status: 400 }
      );
    }

    // Get leaderboard data
    const { data: leaderboard, error } = await worldClassSupabase.getLeaderboard(gameMode as 'classic' | 'duel' | 'sudden-death', limit);

    if (error) {
      console.error('Leaderboard fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch leaderboard' },
        { status: 500 }
      );
    }

    // Transform data for frontend
    const transformedLeaderboard = leaderboard?.map((entry, index) => ({
      rank: offset + index + 1,
      userId: entry.user_id,
      username: entry.profiles?.username || 'Anonymous',
      displayName: entry.profiles?.display_name || entry.profiles?.username || 'Anonymous',
      avatarUrl: entry.profiles?.avatar_url,
      score: entry.score,
      gameMode: entry.game_mode,
      createdAt: entry.created_at,
      updatedAt: entry.updated_at
    })) || [];

    return NextResponse.json({
      success: true,
      data: {
        leaderboard: transformedLeaderboard,
        gameMode,
        total: transformedLeaderboard.length,
        limit,
        offset
      }
    });

  } catch (error: unknown) {
    console.error('Leaderboard fetch error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
