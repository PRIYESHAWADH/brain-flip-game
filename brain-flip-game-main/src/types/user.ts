export interface UserProfile {
	id: string;
	username: string;
	avatar_url?: string;
	total_score: number;
	games_played: number;
	best_streak: number;
	created_at: string;
}

export interface GameSession {
	id: string;
	user_id: string;
	game_mode: string;
	final_score: number;
	level_reached: number;
	max_streak: number;
	total_time_ms: number;
	mistakes_made: number;
	average_reaction_time_ms: number;
	created_at: string;
}

export interface LeaderboardEntry {
	id: string;
	user_id: string;
	username: string;
	game_mode: string;
	best_score: number;
	best_level: number;
	rank: number;
	updated_at: string;
}

export interface Achievement {
	id: string;
	user_id: string;
	achievement_type: string;
	achievement_name: string;
	description?: string;
	earned_at: string;
}
