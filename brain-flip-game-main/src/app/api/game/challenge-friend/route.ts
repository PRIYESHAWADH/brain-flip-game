import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

export async function POST(request: Request) {
	try {
		const body: { 
			challengerId: string; 
			challengedId: string; 
			gameMode: string; 
			betAmount?: number 
		} = await request.json();
		const { challengerId, challengedId, gameMode, betAmount = 0 } = body;
		const { data, error } = await supabase.from('challenges').insert([
			{ user_id: challengerId, friend_id: challengedId, game_mode: gameMode, challenge_data: { betAmount } }
		]);
		if (error) return NextResponse.json({ error: error.message }, { status: 400 });
		return NextResponse.json({ success: true, data });
	} catch (e: unknown) {
		const errorMessage = e instanceof Error ? e.message : 'Bad Request';
		return NextResponse.json({ error: errorMessage }, { status: 400 });
	}
}
