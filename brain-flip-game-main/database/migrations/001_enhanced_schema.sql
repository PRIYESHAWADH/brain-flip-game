-- Ultimate Brain Flip Experience - Enhanced Database Schema
-- Advanced cognitive analytics and AI personalization tables

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- =====================================================
-- COGNITIVE ANALYTICS TABLES
-- =====================================================

-- Cognitive Profiles for AI Personalization
CREATE TABLE cognitive_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    cognitive_strengths JSONB NOT NULL DEFAULT '[]',
    weakness_areas JSONB NOT NULL DEFAULT '[]',
    learning_style VARCHAR(20) NOT NULL DEFAULT 'mixed' CHECK (learning_style IN ('visual', 'auditory', 'kinesthetic', 'mixed')),
    optimal_difficulty_curve JSONB NOT NULL DEFAULT '[]',
    flow_state_indicators JSONB NOT NULL DEFAULT '{}',
    personality_traits JSONB NOT NULL DEFAULT '{}',
    cognitive_age DECIMAL(5,2),
    neuroplasticity_index DECIMAL(5,4),
    last_analysis_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(user_id)
);

-- Detailed Performance Metrics
CREATE TABLE performance_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    working_memory_score DECIMAL(5,2),
    processing_speed_score DECIMAL(5,2),
    attention_span_score DECIMAL(5,2),
    cognitive_flexibility_score DECIMAL(5,2),
    executive_function_score DECIMAL(5,2),
    reaction_time_avg DECIMAL(8,3),
    accuracy_percentage DECIMAL(5,2),
    consistency_score DECIMAL(5,2),
    flow_state_duration INTEGER DEFAULT 0,
    cognitive_load_level DECIMAL(3,2),
    fatigue_indicators JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- AI Personalization Data
CREATE TABLE ai_personalization_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    difficulty_adjustments JSONB NOT NULL DEFAULT '[]',
    content_recommendations JSONB NOT NULL DEFAULT '[]',
    timing_optimizations JSONB NOT NULL DEFAULT '[]',
    motivational_triggers JSONB NOT NULL DEFAULT '[]',
    personalized_feedback JSONB NOT NULL DEFAULT '[]',
    ai_model_version VARCHAR(20) NOT NULL,
    confidence_score DECIMAL(3,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Neural Avatar System
CREATE TABLE neural_avatars (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    visual_representation JSONB NOT NULL DEFAULT '{}',
    cognitive_abilities JSONB NOT NULL DEFAULT '{}',
    unlocked_features JSONB NOT NULL DEFAULT '[]',
    evolution_level INTEGER DEFAULT 1,
    specializations JSONB NOT NULL DEFAULT '[]',
    experience_points INTEGER DEFAULT 0,
    neural_connections INTEGER DEFAULT 0,
    synaptic_strength DECIMAL(5,2) DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(user_id)
);

-- =====================================================
-- MULTIPLAYER BATTLE SYSTEM
-- =====================================================

-- Battle Rooms
CREATE TABLE battle_rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_code VARCHAR(10) UNIQUE NOT NULL,
    battle_type VARCHAR(30) NOT NULL CHECK (battle_type IN ('quick', 'ranked', 'tournament', 'custom', 'team')),
    max_players INTEGER NOT NULL DEFAULT 2,
    current_players INTEGER DEFAULT 0,
    battle_config JSONB NOT NULL DEFAULT '{}',
    current_state VARCHAR(20) DEFAULT 'waiting' CHECK (current_state IN ('waiting', 'starting', 'active', 'paused', 'ended')),
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    winner_id UUID REFERENCES profiles(id),
    analytics_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Battle Participants
CREATE TABLE battle_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    battle_room_id UUID NOT NULL REFERENCES battle_rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    team_id UUID,
    elo_rating INTEGER DEFAULT 1200,
    final_score INTEGER DEFAULT 0,
    final_rank INTEGER,
    performance_metrics JSONB DEFAULT '{}',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    left_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(battle_room_id, user_id)
);

-- ELO Rating History
CREATE TABLE elo_rating_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    battle_room_id UUID REFERENCES battle_rooms(id),
    old_rating INTEGER NOT NULL,
    new_rating INTEGER NOT NULL,
    rating_change INTEGER NOT NULL,
    game_mode VARCHAR(20) NOT NULL,
    opponent_rating INTEGER,
    match_result VARCHAR(10) CHECK (match_result IN ('win', 'loss', 'draw')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Tournament System
CREATE TABLE tournaments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    tournament_type VARCHAR(30) NOT NULL CHECK (tournament_type IN ('single-elimination', 'double-elimination', 'round-robin', 'swiss')),
    game_mode VARCHAR(20) NOT NULL,
    max_participants INTEGER NOT NULL,
    current_participants INTEGER DEFAULT 0,
    entry_fee INTEGER DEFAULT 0,
    prize_pool INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'registration', 'active', 'completed', 'cancelled')),
    registration_start TIMESTAMP WITH TIME ZONE,
    registration_end TIMESTAMP WITH TIME ZONE,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    brackets JSONB DEFAULT '{}',
    rules JSONB DEFAULT '{}',
    live_stream_config JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =====================================================
-- SOCIAL GAMING PLATFORM
-- =====================================================

-- Teams and Clans
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    team_type VARCHAR(20) DEFAULT 'casual' CHECK (team_type IN ('casual', 'competitive', 'research', 'educational')),
    max_members INTEGER DEFAULT 10,
    current_members INTEGER DEFAULT 1,
    leader_id UUID NOT NULL REFERENCES profiles(id),
    team_stats JSONB DEFAULT '{}',
    achievements JSONB DEFAULT '[]',
    is_public BOOLEAN DEFAULT true,
    invite_code VARCHAR(20) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Team Memberships
CREATE TABLE team_memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('leader', 'co-leader', 'member', 'trainee')),
    contribution_score INTEGER DEFAULT 0,
    specialization VARCHAR(50),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(team_id, user_id)
);

-- Mentorship System
CREATE TABLE mentorship_relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mentor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    mentee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
    specialization_area VARCHAR(50),
    progress_metrics JSONB DEFAULT '{}',
    session_count INTEGER DEFAULT 0,
    total_duration INTEGER DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    ended_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(mentor_id, mentee_id)
);

-- Social Feed and Posts
CREATE TABLE social_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    post_type VARCHAR(30) NOT NULL CHECK (post_type IN ('achievement', 'highlight', 'milestone', 'challenge', 'tip')),
    content JSONB NOT NULL,
    media_urls JSONB DEFAULT '[]',
    visibility VARCHAR(20) DEFAULT 'public' CHECK (visibility IN ('public', 'friends', 'team', 'private')),
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =====================================================
-- ADVANCED ANALYTICS TABLES
-- =====================================================

-- Time-series Performance Data (for InfluxDB integration)
CREATE TABLE performance_timeseries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    metric_name VARCHAR(50) NOT NULL,
    metric_value DECIMAL(10,4) NOT NULL,
    tags JSONB DEFAULT '{}',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- A/B Testing Framework
CREATE TABLE ab_test_experiments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    hypothesis TEXT,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
    variants JSONB NOT NULL,
    traffic_allocation JSONB NOT NULL,
    success_metrics JSONB NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- User Experiment Assignments
CREATE TABLE user_experiment_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    experiment_id UUID NOT NULL REFERENCES ab_test_experiments(id) ON DELETE CASCADE,
    variant_name VARCHAR(50) NOT NULL,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, experiment_id)
);

-- =====================================================
-- PERFORMANCE INDEXES
-- =====================================================

-- Cognitive Profiles
CREATE INDEX idx_cognitive_profiles_user_id ON cognitive_profiles(user_id);
CREATE INDEX idx_cognitive_profiles_learning_style ON cognitive_profiles(learning_style);
CREATE INDEX idx_cognitive_profiles_cognitive_age ON cognitive_profiles(cognitive_age);

-- Performance Metrics
CREATE INDEX idx_performance_metrics_session_id ON performance_metrics(session_id);
CREATE INDEX idx_performance_metrics_user_id ON performance_metrics(user_id);
CREATE INDEX idx_performance_metrics_created_at ON performance_metrics(created_at);

-- Battle System
CREATE INDEX idx_battle_rooms_room_code ON battle_rooms(room_code);
CREATE INDEX idx_battle_rooms_battle_type ON battle_rooms(battle_type);
CREATE INDEX idx_battle_rooms_current_state ON battle_rooms(current_state);
CREATE INDEX idx_battle_participants_battle_room_id ON battle_participants(battle_room_id);
CREATE INDEX idx_battle_participants_user_id ON battle_participants(user_id);
CREATE INDEX idx_elo_rating_history_user_id ON elo_rating_history(user_id);

-- Social Platform
CREATE INDEX idx_teams_leader_id ON teams(leader_id);
CREATE INDEX idx_teams_team_type ON teams(team_type);
CREATE INDEX idx_team_memberships_team_id ON team_memberships(team_id);
CREATE INDEX idx_team_memberships_user_id ON team_memberships(user_id);
CREATE INDEX idx_social_posts_user_id ON social_posts(user_id);
CREATE INDEX idx_social_posts_post_type ON social_posts(post_type);
CREATE INDEX idx_social_posts_created_at ON social_posts(created_at);

-- Analytics
CREATE INDEX idx_performance_timeseries_user_id ON performance_timeseries(user_id);
CREATE INDEX idx_performance_timeseries_metric_name ON performance_timeseries(metric_name);
CREATE INDEX idx_performance_timeseries_timestamp ON performance_timeseries(timestamp);

-- Full-text search indexes
CREATE INDEX idx_teams_name_search ON teams USING gin(to_tsvector('english', name));
CREATE INDEX idx_tournaments_name_search ON tournaments USING gin(to_tsvector('english', name));

-- =====================================================
-- TRIGGERS AND FUNCTIONS
-- =====================================================

-- Update cognitive profile after performance analysis
CREATE OR REPLACE FUNCTION update_cognitive_profile()
RETURNS TRIGGER AS $$
BEGIN
    -- Update cognitive profile based on new performance metrics
    UPDATE cognitive_profiles 
    SET 
        last_analysis_at = NOW(),
        updated_at = NOW()
    WHERE user_id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_cognitive_profile
    AFTER INSERT ON performance_metrics
    FOR EACH ROW
    EXECUTE FUNCTION update_cognitive_profile();

-- Update team member count
CREATE OR REPLACE FUNCTION update_team_member_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE teams 
        SET current_members = current_members + 1 
        WHERE id = NEW.team_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE teams 
        SET current_members = current_members - 1 
        WHERE id = OLD.team_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_team_member_count
    AFTER INSERT OR DELETE ON team_memberships
    FOR EACH ROW
    EXECUTE FUNCTION update_team_member_count();

-- Generate unique room codes for battles
CREATE OR REPLACE FUNCTION generate_room_code()
RETURNS TRIGGER AS $$
BEGIN
    NEW.room_code := upper(substring(md5(random()::text) from 1 for 8));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_room_code
    BEFORE INSERT ON battle_rooms
    FOR EACH ROW
    EXECUTE FUNCTION generate_room_code();