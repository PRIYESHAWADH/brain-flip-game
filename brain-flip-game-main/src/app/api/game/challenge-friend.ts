import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

export async function POST(req: NextRequest) {
  const { user_id, friend_id, game_mode, challenge_data } = await req.json();
  // Store challenge in Supabase (table: challenges)
  const { data, error } = await supabase.from('challenges').insert([
    { user_id, friend_id, game_mode, challenge_data }
  ]);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true, data });
}
