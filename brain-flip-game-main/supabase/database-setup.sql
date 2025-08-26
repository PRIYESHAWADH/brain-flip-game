-- Brain Flip Game - Complete World-Class Database Setup
-- This script creates a fully scaled, enterprise-grade database structure

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- STEP 1: ENSURE PROFILES TABLE HAS ALL REQUIRED COLUMNS
-- =====================================================

-- Drop and recreate profiles table with complete structure
DROP TABLE IF EXISTS profiles CASCADE;

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100),
  avatar_url TEXT,
  bio TEXT,
  level INTEGER DEFAULT 1 NOT NULL,
  experience INTEGER DEFAULT 0 NOT NULL,
  total_games_played INTEGER DEFAULT 0 NOT NULL,
  total_score INTEGER DEFAULT 0 NOT NULL,
  best_score INTEGER DEFAULT 0 NOT NULL,
  average_reaction_time DECIMAL(10,3),
  longest_streak INTEGER DEFAULT 0 NOT NULL,
  achievements_unlocked INTEGER DEFAULT 0 NOT NULL,
  premium_status BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =====================================================
-- STEP 2: CREATE GAME SESSIONS TABLE
-- =====================================================

DROP TABLE IF EXISTS game_sessions CASCADE;

CREATE TABLE game_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  game_mode VARCHAR(20) NOT NULL CHECK (game_mode IN ('classic', 'duel', 'sudden-death')),
  score INTEGER NOT NULL,
  level INTEGER NOT NULL,
  streak INTEGER NOT NULL,
  mistakes INTEGER NOT NULL,
  time_remaining INTEGER NOT NULL,
  instructions_completed INTEGER NOT NULL,
  average_reaction_time DECIMAL(10,3),
  session_duration INTEGER NOT NULL,
  perfect_rounds INTEGER DEFAULT 0,
  lightning_reactions INTEGER DEFAULT 0,
  combo_streak INTEGER DEFAULT 0,
  celebration_level VARCHAR(20) DEFAULT 'none',
  is_completed BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- STEP 3: CREATE LEADERBOARDS TABLE
-- =====================================================

DROP TABLE IF EXISTS leaderboards CASCADE;

CREATE TABLE leaderboards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  game_mode VARCHAR(20) NOT NULL CHECK (game_mode IN ('classic', 'duel', 'sudden-death')),
  score INTEGER NOT NULL,
  rank INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, game_mode)
);

-- =====================================================
-- STEP 4: CREATE ACHIEVEMENT SYSTEM (FIXED)
-- =====================================================

DROP TABLE IF EXISTS user_achievements CASCADE;
DROP TABLE IF EXISTS achievement_definitions CASCADE;

CREATE TABLE achievement_definitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  icon VARCHAR(50) NOT NULL,
  condition_type VARCHAR(30) NOT NULL CHECK (condition_type IN ('score_threshold', 'level_threshold', 'streak_threshold', 'perfect_rounds', 'lightning_reactions', 'combo_streak', 'games_played', 'reaction_time_threshold', 'daily_streak')),
  condition_value INTEGER NOT NULL,
  reward_coins INTEGER DEFAULT 0,
  reward_xp INTEGER DEFAULT 0,
  rarity VARCHAR(20) DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievement_definitions(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, achievement_id)
);

-- =====================================================
-- STEP 5: CREATE DAILY CHALLENGES SYSTEM (FIXED)
-- =====================================================

DROP TABLE IF EXISTS user_daily_challenges CASCADE;
DROP TABLE IF EXISTS challenge_definitions CASCADE;

CREATE TABLE challenge_definitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  challenge_type VARCHAR(30) NOT NULL CHECK (challenge_type IN ('score_target', 'streak_target', 'perfect_rounds', 'games_played', 'reaction_time_target', 'lightning_reactions', 'combo_streak')),
  target_value INTEGER NOT NULL,
  reward_coins INTEGER DEFAULT 0,
  reward_xp INTEGER DEFAULT 0,
  is_daily BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE user_daily_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES challenge_definitions(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, challenge_id)
);

-- =====================================================
-- STEP 6: CREATE CURRENCY SYSTEM
-- =====================================================

DROP TABLE IF EXISTS currency_transactions CASCADE;
DROP TABLE IF EXISTS user_currency CASCADE;

CREATE TABLE user_currency (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  balance INTEGER DEFAULT 0 NOT NULL,
  total_earned INTEGER DEFAULT 0 NOT NULL,
  total_spent INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(user_id)
);

CREATE TABLE currency_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('earn', 'spend', 'bonus', 'achievement')),
  reason VARCHAR(200) NOT NULL,
  balance_after INTEGER NOT NULL,
  game_session_id UUID REFERENCES game_sessions(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =====================================================
-- STEP 7: CREATE USER ANALYTICS
-- =====================================================

DROP TABLE IF EXISTS user_analytics CASCADE;

CREATE TABLE user_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  total_play_time INTEGER DEFAULT 0,
  average_session_duration INTEGER DEFAULT 0,
  favorite_game_mode VARCHAR(20),
  best_reaction_time DECIMAL(10,3),
  total_perfect_rounds INTEGER DEFAULT 0,
  total_lightning_reactions INTEGER DEFAULT 0,
  longest_combo_streak INTEGER DEFAULT 0,
  daily_streak INTEGER DEFAULT 0,
  last_played_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(user_id)
);

-- =====================================================
-- STEP 8: CREATE SOCIAL FEATURES
-- =====================================================

DROP TABLE IF EXISTS friendships CASCADE;

CREATE TABLE friendships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, friend_id)
);

-- =====================================================
-- STEP 9: CREATE TOURNAMENT SYSTEM
-- =====================================================

DROP TABLE IF EXISTS tournament_participants CASCADE;
DROP TABLE IF EXISTS tournaments CASCADE;

CREATE TABLE tournaments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  game_mode VARCHAR(20) NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  max_participants INTEGER,
  entry_fee INTEGER DEFAULT 0,
  prize_pool INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE tournament_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  score INTEGER DEFAULT 0,
  rank INTEGER,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(tournament_id, user_id)
);

-- =====================================================
-- STEP 10: CREATE PERFORMANCE INDEXES
-- =====================================================

-- Game sessions indexes
CREATE INDEX idx_game_sessions_user_id ON game_sessions(user_id);
CREATE INDEX idx_game_sessions_game_mode ON game_sessions(game_mode);
CREATE INDEX idx_game_sessions_created_at ON game_sessions(created_at);
CREATE INDEX idx_game_sessions_score ON game_sessions(score DESC);

-- Leaderboards indexes
CREATE INDEX idx_leaderboards_game_mode_score ON leaderboards(game_mode, score DESC);
CREATE INDEX idx_leaderboards_user_id ON leaderboards(user_id);

-- User achievements indexes
CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_achievement_id ON user_achievements(achievement_id);

-- Daily challenges indexes
CREATE INDEX idx_user_daily_challenges_user_id ON user_daily_challenges(user_id);
CREATE INDEX idx_user_daily_challenges_challenge_id ON user_daily_challenges(challenge_id);

-- Currency indexes
CREATE INDEX idx_currency_transactions_user_id ON currency_transactions(user_id);
CREATE INDEX idx_currency_transactions_created_at ON currency_transactions(created_at);

-- Social indexes
CREATE INDEX idx_friendships_user_id ON friendships(user_id);
CREATE INDEX idx_friendships_friend_id ON friendships(friend_id);
CREATE INDEX idx_friendships_status ON friendships(status);

-- Tournament indexes
CREATE INDEX idx_tournament_participants_tournament_id ON tournament_participants(tournament_id);
CREATE INDEX idx_tournament_participants_user_id ON tournament_participants(user_id);

-- =====================================================
-- STEP 11: CREATE TRIGGERS AND FUNCTIONS
-- =====================================================

-- Updated at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leaderboards_updated_at BEFORE UPDATE ON leaderboards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_daily_challenges_updated_at BEFORE UPDATE ON user_daily_challenges FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_currency_updated_at BEFORE UPDATE ON user_currency FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_analytics_updated_at BEFORE UPDATE ON user_analytics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_friendships_updated_at BEFORE UPDATE ON friendships FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Automatic user currency creation
CREATE OR REPLACE FUNCTION create_user_currency()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_currency (user_id, balance, total_earned, total_spent)
    VALUES (NEW.id, 0, 0, 0);
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER create_user_currency_trigger AFTER INSERT ON profiles FOR EACH ROW EXECUTE FUNCTION create_user_currency();

-- Automatic user analytics creation
CREATE OR REPLACE FUNCTION create_user_analytics()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_analytics (user_id, total_play_time, average_session_duration, favorite_game_mode, best_reaction_time, total_perfect_rounds, total_lightning_reactions, longest_combo_streak, daily_streak)
    VALUES (NEW.id, 0, 0, NULL, NULL, 0, 0, 0, 0);
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER create_user_analytics_trigger AFTER INSERT ON profiles FOR EACH ROW EXECUTE FUNCTION create_user_analytics();

-- =====================================================
-- STEP 12: INSERT WORLD-CLASS SAMPLE DATA (FIXED)
-- =====================================================

-- Insert world-class achievement definitions with proper condition types
INSERT INTO achievement_definitions (name, description, icon, condition_type, condition_value, reward_coins, reward_xp, rarity) VALUES
('First Steps', 'Complete your first game', '🎮', 'games_played', 1, 10, 50, 'common'),
('Score Hunter', 'Score 1000 points in a single game', '🎯', 'score_threshold', 1000, 50, 100, 'common'),
('Streak Master', 'Achieve a 10-streak', '🔥', 'streak_threshold', 10, 100, 200, 'rare'),
('Perfect Player', 'Get 5 perfect rounds in a game', '✨', 'perfect_rounds', 5, 150, 300, 'rare'),
('Lightning Fast', 'Get 3 lightning reactions in a game', '⚡', 'lightning_reactions', 3, 200, 400, 'epic'),
('Combo King', 'Achieve a 5-combo streak', '👑', 'combo_streak', 5, 300, 600, 'epic'),
('Level Up', 'Reach level 20', '📈', 'level_threshold', 20, 500, 1000, 'legendary'),
('Unstoppable', 'Score 5000 points in a single game', '💎', 'score_threshold', 5000, 1000, 2000, 'legendary'),
('Speed Demon', 'Average reaction time under 1 second', '⚡', 'reaction_time_threshold', 1000, 400, 800, 'epic'),
('Consistency King', 'Play 7 days in a row', '👑', 'daily_streak', 7, 300, 600, 'rare'),
('Perfect Storm', 'Get 10 perfect rounds in a single game', '🌪️', 'perfect_rounds', 10, 500, 1000, 'legendary'),
('Lightning Storm', 'Get 5 lightning reactions in a game', '⚡', 'lightning_reactions', 5, 600, 1200, 'legendary'),
('Combo Master', 'Achieve a 10-combo streak', '👑', 'combo_streak', 10, 800, 1600, 'legendary'),
('Score Legend', 'Score 10000 points in a single game', '🏆', 'score_threshold', 10000, 1500, 3000, 'legendary'),
('Daily Warrior', 'Play 30 days in a row', '⚔️', 'daily_streak', 30, 1000, 2000, 'legendary');

-- Insert engaging daily challenges with proper challenge types
INSERT INTO challenge_definitions (name, description, challenge_type, target_value, reward_coins, reward_xp, is_daily, is_active) VALUES
('Daily Grinder', 'Play 3 games today', 'games_played', 3, 25, 50, TRUE, TRUE),
('Score Seeker', 'Score 500 points in a single game', 'score_target', 500, 50, 100, TRUE, TRUE),
('Streak Builder', 'Achieve a 5-streak', 'streak_target', 5, 75, 150, TRUE, TRUE),
('Perfect Day', 'Get 2 perfect rounds', 'perfect_rounds', 2, 100, 200, TRUE, TRUE),
('Speed Demon', 'Get 1 lightning reaction', 'lightning_reactions', 1, 125, 250, TRUE, TRUE),
('Mode Master', 'Play all three game modes', 'games_played', 3, 150, 300, TRUE, TRUE),
('Accuracy Expert', 'Complete 10 instructions without mistakes', 'perfect_rounds', 10, 200, 400, TRUE, TRUE),
('Combo Builder', 'Achieve a 3-combo streak', 'combo_streak', 3, 175, 350, TRUE, TRUE),
('Reaction Master', 'Get average reaction time under 1.5 seconds', 'reaction_time_target', 1500, 225, 450, TRUE, TRUE),
('Streak Champion', 'Achieve a 15-streak', 'streak_target', 15, 300, 600, TRUE, TRUE);

-- =====================================================
-- STEP 13: VERIFICATION
-- =====================================================

-- Verify all tables were created
SELECT 'Tables created successfully' as status, COUNT(*) as table_count
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'game_sessions', 'leaderboards', 'achievement_definitions', 'user_achievements', 'challenge_definitions', 'user_daily_challenges', 'user_currency', 'currency_transactions', 'user_analytics', 'friendships', 'tournaments', 'tournament_participants');

-- Verify all indexes were created
SELECT 'Indexes created successfully' as status, COUNT(*) as index_count
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'game_sessions', 'leaderboards', 'achievement_definitions', 'user_achievements', 'challenge_definitions', 'user_daily_challenges', 'user_currency', 'currency_transactions', 'user_analytics', 'friendships', 'tournaments', 'tournament_participants');

-- Verify sample data was inserted
SELECT 'Sample data inserted' as status, COUNT(*) as achievement_count FROM achievement_definitions;
SELECT 'Sample data inserted' as status, COUNT(*) as challenge_count FROM challenge_definitions;

-- Show all achievement definitions for verification
SELECT name, condition_type, condition_value, rarity FROM achievement_definitions ORDER BY rarity, condition_value;

-- Show all challenge definitions for verification
SELECT name, challenge_type, target_value FROM challenge_definitions ORDER BY target_value;
