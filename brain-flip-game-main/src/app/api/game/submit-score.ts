import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

export async function POST(req: NextRequest) {
  const { user_id, game_mode, final_score, level_reached, max_streak, total_time_ms, mistakes_made, average_reaction_time_ms } = await req.json();
  const { data, error } = await supabase.from('game_sessions').insert([
    { user_id, game_mode, final_score, level_reached, max_streak, total_time_ms, mistakes_made, average_reaction_time_ms }
  ]);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true, data });
}
