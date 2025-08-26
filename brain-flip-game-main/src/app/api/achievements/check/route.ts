import { NextResponse } from 'next/server';
import { worldClassSupabase } from '@/lib/supabase-enhanced';

export async function POST(request: Request) {
	try {
		const body: { userId: string; score?: number; level?: number; streak?: number } = await request.json();
		const { userId, score = 0, level = 1, streak = 0 } = body;

    // Validate required fields
    if (!userId) {
      return NextResponse.json(
        { error: 'Missing required field: userId' },
        { status: 400 }
      );
    }

    // Check for achievements
    const { data: achievements, error } = await worldClassSupabase.getAchievementDefinitions();

    if (error) {
      console.error('Achievement check error:', error);
      return NextResponse.json(
        { error: 'Failed to check achievements' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        achievements: achievements || []
      }
    });

  } catch (error: unknown) {
    console.error('Achievement check API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
