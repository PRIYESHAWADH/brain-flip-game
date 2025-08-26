import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

export async function POST(req: NextRequest) {
  const { user_id, achievement_type, achievement_name, description } = await req.json();
  const { data, error } = await supabase.from('achievements').insert([
    { user_id, achievement_type, achievement_name, description }
  ]);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true, data });
}
