import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  if (!user_id) return NextResponse.json({ error: 'Missing user_id' }, { status: 400 });
  const { data, error } = await supabase.from('profiles').select('*').eq('id', user_id).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data });
}
