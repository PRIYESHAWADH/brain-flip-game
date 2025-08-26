-- Ultimate Brain Flip Experience - Data Warehouse Dimensional Model
-- Star schema for advanced analytics and business intelligence

-- =====================================================
-- DIMENSION TABLES
-- =====================================================

-- Date Dimension
CREATE TABLE dim_date (
    date_key INTEGER PRIMARY KEY,
    full_date DATE NOT NULL,
    year INTEGER NOT NULL,
    quarter INTEGER NOT NULL,
    month INTEGER NOT NULL,
    week INTEGER NOT NULL,
    day_of_year INTEGER NOT NULL,
    day_of_month INTEGER NOT NULL,
    day_of_week INTEGER NOT NULL,
    day_name VARCHAR(10) NOT NULL,
    month_name VARCHAR(10) NOT NULL,
    is_weekend BOOLEAN NOT NULL,
    is_holiday BOOLEAN DEFAULT FALSE,
    fiscal_year INTEGER,
    fiscal_quarter INTEGER,
    season VARCHAR(10)
);

-- Time Dimension
CREATE TABLE dim_time (
    time_key INTEGER PRIMARY KEY,
    hour INTEGER NOT NULL,
    minute INTEGER NOT NULL,
    second INTEGER NOT NULL,
    time_of_day VARCHAR(20) NOT NULL, -- morning, afternoon, evening, night
    hour_bucket VARCHAR(20) NOT NULL, -- 00-06, 06-12, 12-18, 18-24
    is_peak_hours BOOLEAN NOT NULL
);

-- User Dimension
CREATE TABLE dim_user (
    user_key SERIAL PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    username VARCHAR(50),
    display_name VARCHAR(100),
    registration_date DATE,
    age_group VARCHAR(20), -- 13-17, 18-24, 25-34, 35-44, 45-54, 55-64, 65+
    country VARCHAR(50),
    timezone VARCHAR(50),
    subscription_tier VARCHAR(20), -- free, premium, elite, research
    acquisition_channel VARCHAR(50), -- organic, paid, referral, social
    user_segment VARCHAR(20), -- new, returning, power_user, at_risk, churned
    cognitive_profile_type VARCHAR(30), -- visual, auditory, kinesthetic, mixed
    preferred_game_mode VARCHAR(20),
    skill_level VARCHAR(20), -- beginner, intermediate, advanced, expert
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Game Mode Dimension
CREATE TABLE dim_game_mode (
    game_mode_key SERIAL PRIMARY KEY,
    game_mode_code VARCHAR(20) NOT NULL UNIQUE,
    game_mode_name VARCHAR(50) NOT NULL,
    description TEXT,
    difficulty_level INTEGER,
    max_lives INTEGER,
    base_time_limit INTEGER,
    scoring_multiplier DECIMAL(3,2),
    is_multiplayer BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE
);

-- Instruction Type Dimension
CREATE TABLE dim_instruction_type (
    instruction_type_key SERIAL PRIMARY KEY,
    instruction_type_code VARCHAR(20) NOT NULL UNIQUE,
    instruction_type_name VARCHAR(50) NOT NULL,
    category VARCHAR(30), -- basic, advanced, combo, special
    cognitive_domain VARCHAR(30), -- working_memory, processing_speed, attention, flexibility
    difficulty_weight DECIMAL(3,2),
    average_completion_time INTEGER,
    success_rate DECIMAL(5,4),
    is_active BOOLEAN DEFAULT TRUE
);

-- Device Dimension
CREATE TABLE dim_device (
    device_key SERIAL PRIMARY KEY,
    device_type VARCHAR(20) NOT NULL, -- web, mobile, desktop
    browser VARCHAR(30),
    browser_version VARCHAR(20),
    operating_system VARCHAR(30),
    os_version VARCHAR(20),
    screen_resolution VARCHAR(20),
    device_category VARCHAR(20), -- phone, tablet, desktop, tv
    is_mobile BOOLEAN,
    is_touch_enabled BOOLEAN,
    performance_tier VARCHAR(20) -- low, medium, high
);

-- Geographic Dimension
CREATE TABLE dim_geography (
    geography_key SERIAL PRIMARY KEY,
    country_code VARCHAR(3) NOT NULL,
    country_name VARCHAR(100) NOT NULL,
    region VARCHAR(50),
    continent VARCHAR(30),
    timezone VARCHAR(50),
    currency_code VARCHAR(3),
    language_code VARCHAR(5),
    population_density VARCHAR(20), -- low, medium, high
    economic_tier VARCHAR(20) -- developing, emerging, developed
);

-- Achievement Dimension
CREATE TABLE dim_achievement (
    achievement_key SERIAL PRIMARY KEY,
    achievement_id UUID NOT NULL UNIQUE,
    achievement_name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(30), -- skill, milestone, social, special
    rarity VARCHAR(20), -- common, rare, epic, legendary
    points_reward INTEGER,
    coins_reward INTEGER,
    unlock_condition TEXT,
    icon_url VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE
);

-- =====================================================
-- FACT TABLES
-- =====================================================

-- Game Session Fact
CREATE TABLE fact_game_session (
    session_key BIGSERIAL PRIMARY KEY,
    session_id UUID NOT NULL,
    
    -- Dimension Keys
    user_key INTEGER REFERENCES dim_user(user_key),
    date_key INTEGER REFERENCES dim_date(date_key),
    start_time_key INTEGER REFERENCES dim_time(time_key),
    end_time_key INTEGER REFERENCES dim_time(time_key),
    game_mode_key INTEGER REFERENCES dim_game_mode(game_mode_key),
    device_key INTEGER REFERENCES dim_device(device_key),
    geography_key INTEGER REFERENCES dim_geography(geography_key),
    
    -- Measures
    final_score INTEGER NOT NULL,
    final_level INTEGER NOT NULL,
    final_streak INTEGER NOT NULL,
    total_mistakes INTEGER NOT NULL,
    instructions_completed INTEGER NOT NULL,
    session_duration_seconds INTEGER NOT NULL,
    average_reaction_time DECIMAL(8,3),
    perfect_rounds INTEGER DEFAULT 0,
    lightning_reactions INTEGER DEFAULT 0,
    combo_streak INTEGER DEFAULT 0,
    
    -- Cognitive Metrics
    cognitive_load_avg DECIMAL(3,2),
    flow_state_duration INTEGER DEFAULT 0,
    attention_score DECIMAL(3,2),
    fatigue_level DECIMAL(3,2),
    
    -- Engagement Metrics
    pause_count INTEGER DEFAULT 0,
    resume_count INTEGER DEFAULT 0,
    quit_early BOOLEAN DEFAULT FALSE,
    completed_successfully BOOLEAN DEFAULT TRUE,
    
    -- Technical Metrics
    frame_rate_avg DECIMAL(5,2),
    load_time_ms INTEGER,
    error_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Instruction Response Fact
CREATE TABLE fact_instruction_response (
    response_key BIGSERIAL PRIMARY KEY,
    
    -- Dimension Keys
    session_key BIGINT REFERENCES fact_game_session(session_key),
    user_key INTEGER REFERENCES dim_user(user_key),
    date_key INTEGER REFERENCES dim_date(date_key),
    time_key INTEGER REFERENCES dim_time(time_key),
    instruction_type_key INTEGER REFERENCES dim_instruction_type(instruction_type_key),
    device_key INTEGER REFERENCES dim_device(device_key),
    
    -- Measures
    reaction_time_ms INTEGER NOT NULL,
    is_correct BOOLEAN NOT NULL,
    is_within_time_limit BOOLEAN NOT NULL,
    difficulty_level INTEGER NOT NULL,
    streak_at_time INTEGER NOT NULL,
    score_gained INTEGER NOT NULL,
    
    -- Cognitive Measures
    cognitive_load DECIMAL(3,2),
    attention_level DECIMAL(3,2),
    flow_state_indicator DECIMAL(3,2),
    
    -- Context
    instruction_sequence_number INTEGER NOT NULL,
    time_pressure_level DECIMAL(3,2),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Battle Performance Fact
CREATE TABLE fact_battle_performance (
    battle_performance_key BIGSERIAL PRIMARY KEY,
    battle_id UUID NOT NULL,
    
    -- Dimension Keys
    user_key INTEGER REFERENCES dim_user(user_key),
    opponent_key INTEGER REFERENCES dim_user(user_key),
    date_key INTEGER REFERENCES dim_date(date_key),
    time_key INTEGER REFERENCES dim_time(time_key),
    device_key INTEGER REFERENCES dim_device(device_key),
    
    -- Measures
    final_score INTEGER NOT NULL,
    final_rank INTEGER NOT NULL,
    elo_rating_before INTEGER NOT NULL,
    elo_rating_after INTEGER NOT NULL,
    elo_change INTEGER NOT NULL,
    
    -- Performance Metrics
    average_reaction_time DECIMAL(8,3),
    accuracy_percentage DECIMAL(5,2),
    pressure_performance_score DECIMAL(3,2),
    comeback_factor DECIMAL(3,2),
    
    -- Battle Context
    battle_duration_seconds INTEGER NOT NULL,
    total_rounds INTEGER NOT NULL,
    rounds_won INTEGER NOT NULL,
    
    -- Result
    battle_result VARCHAR(10) CHECK (battle_result IN ('win', 'loss', 'draw')),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Achievement Unlock Fact
CREATE TABLE fact_achievement_unlock (
    unlock_key BIGSERIAL PRIMARY KEY,
    
    -- Dimension Keys
    user_key INTEGER REFERENCES dim_user(user_key),
    achievement_key INTEGER REFERENCES dim_achievement(achievement_key),
    date_key INTEGER REFERENCES dim_date(date_key),
    time_key INTEGER REFERENCES dim_time(time_key),
    session_key BIGINT REFERENCES fact_game_session(session_key),
    
    -- Measures
    points_earned INTEGER NOT NULL,
    coins_earned INTEGER NOT NULL,
    days_to_unlock INTEGER, -- Days since registration
    attempts_to_unlock INTEGER, -- Number of attempts before unlock
    
    -- Context
    unlock_trigger VARCHAR(50), -- session_complete, milestone_reached, etc.
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Social Engagement Fact
CREATE TABLE fact_social_engagement (
    engagement_key BIGSERIAL PRIMARY KEY,
    
    -- Dimension Keys
    user_key INTEGER REFERENCES dim_user(user_key),
    target_user_key INTEGER REFERENCES dim_user(user_key), -- for follows, likes, etc.
    date_key INTEGER REFERENCES dim_date(date_key),
    time_key INTEGER REFERENCES dim_time(time_key),
    
    -- Measures
    engagement_type VARCHAR(20) NOT NULL, -- like, comment, share, follow, post
    engagement_duration_seconds INTEGER DEFAULT 0,
    reach_count INTEGER DEFAULT 0,
    interaction_count INTEGER DEFAULT 1,
    
    -- Content Context
    content_type VARCHAR(30), -- achievement, highlight, tip, challenge
    content_category VARCHAR(30),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Personalization Effectiveness Fact
CREATE TABLE fact_ai_effectiveness (
    effectiveness_key BIGSERIAL PRIMARY KEY,
    
    -- Dimension Keys
    user_key INTEGER REFERENCES dim_user(user_key),
    session_key BIGINT REFERENCES fact_game_session(session_key),
    date_key INTEGER REFERENCES dim_date(date_key),
    
    -- AI Model Info
    model_version VARCHAR(20) NOT NULL,
    personalization_type VARCHAR(30) NOT NULL, -- difficulty, content, timing
    
    -- Effectiveness Measures
    prediction_accuracy DECIMAL(5,4),
    engagement_improvement DECIMAL(5,4),
    learning_velocity_change DECIMAL(5,4),
    user_satisfaction_score DECIMAL(3,2),
    model_confidence DECIMAL(3,2),
    
    -- A/B Testing
    experiment_id VARCHAR(50),
    variant_name VARCHAR(30),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- AGGREGATE TABLES FOR PERFORMANCE
-- =====================================================

-- Daily User Summary
CREATE TABLE agg_daily_user_summary (
    summary_key BIGSERIAL PRIMARY KEY,
    user_key INTEGER REFERENCES dim_user(user_key),
    date_key INTEGER REFERENCES dim_date(date_key),
    
    -- Session Metrics
    sessions_count INTEGER NOT NULL,
    total_play_time_seconds INTEGER NOT NULL,
    avg_session_duration DECIMAL(8,2),
    
    -- Performance Metrics
    total_score INTEGER NOT NULL,
    best_score INTEGER NOT NULL,
    avg_reaction_time DECIMAL(8,3),
    total_instructions INTEGER NOT NULL,
    accuracy_rate DECIMAL(5,4),
    
    -- Cognitive Metrics
    avg_cognitive_load DECIMAL(3,2),
    flow_state_time_seconds INTEGER DEFAULT 0,
    cognitive_improvement_score DECIMAL(5,4),
    
    -- Engagement Metrics
    achievements_unlocked INTEGER DEFAULT 0,
    social_interactions INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Weekly Cohort Analysis
CREATE TABLE agg_weekly_cohort_analysis (
    cohort_key BIGSERIAL PRIMARY KEY,
    cohort_week DATE NOT NULL, -- Week of user registration
    analysis_week DATE NOT NULL, -- Week being analyzed
    weeks_since_registration INTEGER NOT NULL,
    
    -- Cohort Metrics
    cohort_size INTEGER NOT NULL,
    active_users INTEGER NOT NULL,
    retention_rate DECIMAL(5,4) NOT NULL,
    
    -- Performance Metrics
    avg_sessions_per_user DECIMAL(8,2),
    avg_score_per_user DECIMAL(10,2),
    avg_improvement_rate DECIMAL(5,4),
    
    -- Revenue Metrics
    paying_users INTEGER DEFAULT 0,
    conversion_rate DECIMAL(5,4) DEFAULT 0,
    avg_revenue_per_user DECIMAL(10,2) DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Fact table indexes
CREATE INDEX idx_fact_game_session_user_date ON fact_game_session(user_key, date_key);
CREATE INDEX idx_fact_game_session_game_mode ON fact_game_session(game_mode_key);
CREATE INDEX idx_fact_instruction_response_session ON fact_instruction_response(session_key);
CREATE INDEX idx_fact_instruction_response_user_date ON fact_instruction_response(user_key, date_key);
CREATE INDEX idx_fact_battle_performance_user_date ON fact_battle_performance(user_key, date_key);
CREATE INDEX idx_fact_achievement_unlock_user_date ON fact_achievement_unlock(user_key, date_key);

-- Dimension table indexes
CREATE INDEX idx_dim_user_segment ON dim_user(user_segment);
CREATE INDEX idx_dim_user_subscription ON dim_user(subscription_tier);
CREATE INDEX idx_dim_date_year_month ON dim_date(year, month);
CREATE INDEX idx_dim_time_hour ON dim_time(hour);

-- Aggregate table indexes
CREATE INDEX idx_agg_daily_user_summary_user_date ON agg_daily_user_summary(user_key, date_key);
CREATE INDEX idx_agg_weekly_cohort_analysis_cohort_week ON agg_weekly_cohort_analysis(cohort_week);

-- =====================================================
-- MATERIALIZED VIEWS FOR COMMON QUERIES
-- =====================================================

-- User Performance Summary
CREATE MATERIALIZED VIEW mv_user_performance_summary AS
SELECT 
    u.user_key,
    u.username,
    u.user_segment,
    u.subscription_tier,
    COUNT(DISTINCT gs.session_key) as total_sessions,
    SUM(gs.session_duration_seconds) as total_play_time,
    AVG(gs.session_duration_seconds) as avg_session_duration,
    MAX(gs.final_score) as best_score,
    AVG(gs.final_score) as avg_score,
    AVG(gs.average_reaction_time) as avg_reaction_time,
    SUM(gs.instructions_completed) as total_instructions,
    AVG(CASE WHEN ir.is_correct THEN 1.0 ELSE 0.0 END) as accuracy_rate,
    COUNT(DISTINCT au.achievement_key) as achievements_unlocked,
    MAX(gs.created_at) as last_played
FROM dim_user u
LEFT JOIN fact_game_session gs ON u.user_key = gs.user_key
LEFT JOIN fact_instruction_response ir ON gs.session_key = ir.session_key
LEFT JOIN fact_achievement_unlock au ON u.user_key = au.user_key
WHERE u.is_active = true
GROUP BY u.user_key, u.username, u.user_segment, u.subscription_tier;

-- Daily Active Users
CREATE MATERIALIZED VIEW mv_daily_active_users AS
SELECT 
    d.full_date,
    COUNT(DISTINCT gs.user_key) as daily_active_users,
    COUNT(DISTINCT CASE WHEN u.subscription_tier != 'free' THEN gs.user_key END) as paying_active_users,
    AVG(gs.session_duration_seconds) as avg_session_duration,
    SUM(gs.instructions_completed) as total_instructions,
    AVG(gs.final_score) as avg_score
FROM dim_date d
LEFT JOIN fact_game_session gs ON d.date_key = gs.date_key
LEFT JOIN dim_user u ON gs.user_key = u.user_key
WHERE d.full_date >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY d.full_date
ORDER BY d.full_date;

-- Game Mode Performance
CREATE MATERIALIZED VIEW mv_game_mode_performance AS
SELECT 
    gm.game_mode_name,
    COUNT(DISTINCT gs.session_key) as total_sessions,
    COUNT(DISTINCT gs.user_key) as unique_players,
    AVG(gs.final_score) as avg_score,
    AVG(gs.session_duration_seconds) as avg_duration,
    AVG(gs.average_reaction_time) as avg_reaction_time,
    AVG(CASE WHEN ir.is_correct THEN 1.0 ELSE 0.0 END) as accuracy_rate,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY gs.final_score) as median_score,
    PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY gs.final_score) as p95_score
FROM dim_game_mode gm
LEFT JOIN fact_game_session gs ON gm.game_mode_key = gs.game_mode_key
LEFT JOIN fact_instruction_response ir ON gs.session_key = ir.session_key
WHERE gm.is_active = true
GROUP BY gm.game_mode_name;

-- Refresh materialized views (run periodically)
-- REFRESH MATERIALIZED VIEW mv_user_performance_summary;
-- REFRESH MATERIALIZED VIEW mv_daily_active_users;
-- REFRESH MATERIALIZED VIEW mv_game_mode_performance;