import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

export async function GET(req: NextRequest, { params }: { params: { gameMode: string } }) {
  const { gameMode } = params;
  const { data, error } = await supabase
    .from('leaderboards')
    .select('*')
    .eq('game_mode', gameMode)
    .order('best_score', { ascending: false })
    .limit(100);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data });
}
