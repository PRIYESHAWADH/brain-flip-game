import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

export async function GET() {
	try {
		const { data, error } = await supabase.from('health_check').select('*').limit(1);
		
		if (error) {
			console.error('Health check error:', error);
			return NextResponse.json({ status: 'unhealthy', error: error.message }, { status: 500 });
		}

		return NextResponse.json({ status: 'healthy', timestamp: new Date().toISOString() });
	} catch (error: unknown) {
		console.error('Health check exception:', error);
		const errorMessage = error instanceof Error ? error.message : 'Unknown error';
		return NextResponse.json({ status: 'unhealthy', error: errorMessage }, { status: 500 });
	}
}
