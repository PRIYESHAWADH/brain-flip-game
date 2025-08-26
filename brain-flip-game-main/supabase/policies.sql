-- =====================================================
-- BRAIN FLIP GAME - ENTERPRISE SECURITY POLICIES
-- Row Level Security (RLS) for data protection
-- =====================================================

-- =====================================================
-- PROFILES TABLE POLICIES
-- =====================================================

-- Users can read their own profile
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = auth_user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = auth_user_id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = auth_user_id);

-- Public read access for leaderboards (username, display_name, avatar_url only)
CREATE POLICY "Public profile read for leaderboards" ON profiles
    FOR SELECT USING (true);

-- =====================================================
-- GAME SESSIONS TABLE POLICIES
-- =====================================================

-- Users can read their own game sessions
CREATE POLICY "Users can view own game sessions" ON game_sessions
    FOR SELECT USING (auth.uid() = (SELECT auth_user_id FROM profiles WHERE id = user_id));

-- Users can insert their own game sessions
CREATE POLICY "Users can insert own game sessions" ON game_sessions
    FOR INSERT WITH CHECK (auth.uid() = (SELECT auth_user_id FROM profiles WHERE id = user_id));

-- Users can update their own game sessions
CREATE POLICY "Users can update own game sessions" ON game_sessions
    FOR UPDATE USING (auth.uid() = (SELECT auth_user_id FROM profiles WHERE id = user_id));

-- =====================================================
-- INSTRUCTION RESPONSES TABLE POLICIES
-- =====================================================

-- Users can read their own instruction responses
CREATE POLICY "Users can view own instruction responses" ON instruction_responses
    FOR SELECT USING (
        auth.uid() = (
            SELECT p.auth_user_id 
            FROM profiles p 
            JOIN game_sessions gs ON p.id = gs.user_id 
            WHERE gs.id = game_session_id
        )
    );

-- Users can insert their own instruction responses
CREATE POLICY "Users can insert own instruction responses" ON instruction_responses
    FOR INSERT WITH CHECK (
        auth.uid() = (
            SELECT p.auth_user_id 
            FROM profiles p 
            JOIN game_sessions gs ON p.id = gs.user_id 
            WHERE gs.id = game_session_id
        )
    );

-- =====================================================
-- LEADERBOARDS TABLE POLICIES
-- =====================================================

-- Public read access for leaderboards
CREATE POLICY "Public leaderboard read access" ON leaderboards
    FOR SELECT USING (true);

-- Users can update their own leaderboard entries
CREATE POLICY "Users can update own leaderboard entries" ON leaderboards
    FOR UPDATE USING (auth.uid() = (SELECT auth_user_id FROM profiles WHERE id = user_id));

-- Users can insert their own leaderboard entries
CREATE POLICY "Users can insert own leaderboard entries" ON leaderboards
    FOR INSERT WITH CHECK (auth.uid() = (SELECT auth_user_id FROM profiles WHERE id = user_id));

-- =====================================================
-- ACHIEVEMENTS TABLE POLICIES
-- =====================================================

-- Public read access for achievement definitions
CREATE POLICY "Public achievement definitions read access" ON achievement_definitions
    FOR SELECT USING (true);

-- Users can read their own achievements
CREATE POLICY "Users can view own achievements" ON user_achievements
    FOR SELECT USING (auth.uid() = (SELECT auth_user_id FROM profiles WHERE id = user_id));

-- Users can update their own achievements
CREATE POLICY "Users can update own achievements" ON user_achievements
    FOR UPDATE USING (auth.uid() = (SELECT auth_user_id FROM profiles WHERE id = user_id));

-- Users can insert their own achievements
CREATE POLICY "Users can insert own achievements" ON user_achievements
    FOR INSERT WITH CHECK (auth.uid() = (SELECT auth_user_id FROM profiles WHERE id = user_id));

-- =====================================================
-- DAILY CHALLENGES TABLE POLICIES
-- =====================================================

-- Public read access for challenge definitions
CREATE POLICY "Public challenge definitions read access" ON challenge_definitions
    FOR SELECT USING (true);

-- Users can read their own daily challenges
CREATE POLICY "Users can view own daily challenges" ON user_daily_challenges
    FOR SELECT USING (auth.uid() = (SELECT auth_user_id FROM profiles WHERE id = user_id));

-- Users can update their own daily challenges
CREATE POLICY "Users can update own daily challenges" ON user_daily_challenges
    FOR UPDATE USING (auth.uid() = (SELECT auth_user_id FROM profiles WHERE id = user_id));

-- Users can insert their own daily challenges
CREATE POLICY "Users can insert own daily challenges" ON user_daily_challenges
    FOR INSERT WITH CHECK (auth.uid() = (SELECT auth_user_id FROM profiles WHERE id = user_id));

-- =====================================================
-- CURRENCY TABLE POLICIES
-- =====================================================

-- Users can read their own currency
CREATE POLICY "Users can view own currency" ON user_currency
    FOR SELECT USING (auth.uid() = (SELECT auth_user_id FROM profiles WHERE id = user_id));

-- Users can update their own currency
CREATE POLICY "Users can update own currency" ON user_currency
    FOR UPDATE USING (auth.uid() = (SELECT auth_user_id FROM profiles WHERE id = user_id));

-- Users can insert their own currency
CREATE POLICY "Users can insert own currency" ON user_currency
    FOR INSERT WITH CHECK (auth.uid() = (SELECT auth_user_id FROM profiles WHERE id = user_id));

-- Users can read their own currency transactions
CREATE POLICY "Users can view own currency transactions" ON currency_transactions
    FOR SELECT USING (auth.uid() = (SELECT auth_user_id FROM profiles WHERE id = user_id));

-- Users can insert their own currency transactions
CREATE POLICY "Users can insert own currency transactions" ON currency_transactions
    FOR INSERT WITH CHECK (auth.uid() = (SELECT auth_user_id FROM profiles WHERE id = user_id));

-- =====================================================
-- SOCIAL FEATURES POLICIES
-- =====================================================

-- Users can read friendships they're involved in
CREATE POLICY "Users can view own friendships" ON friendships
    FOR SELECT USING (
        auth.uid() = (SELECT auth_user_id FROM profiles WHERE id = user_id) OR
        auth.uid() = (SELECT auth_user_id FROM profiles WHERE id = friend_id)
    );

-- Users can insert friendships they initiate
CREATE POLICY "Users can insert own friendships" ON friendships
    FOR INSERT WITH CHECK (auth.uid() = (SELECT auth_user_id FROM profiles WHERE id = user_id));

-- Users can update friendships they're involved in
CREATE POLICY "Users can update own friendships" ON friendships
    FOR UPDATE USING (
        auth.uid() = (SELECT auth_user_id FROM profiles WHERE id = user_id) OR
        auth.uid() = (SELECT auth_user_id FROM profiles WHERE id = friend_id)
    );

-- Users can read friend challenges they're involved in
CREATE POLICY "Users can view own friend challenges" ON friend_challenges
    FOR SELECT USING (
        auth.uid() = (SELECT auth_user_id FROM profiles WHERE id = challenger_id) OR
        auth.uid() = (SELECT auth_user_id FROM profiles WHERE id = challenged_id)
    );

-- Users can insert friend challenges they initiate
CREATE POLICY "Users can insert own friend challenges" ON friend_challenges
    FOR INSERT WITH CHECK (auth.uid() = (SELECT auth_user_id FROM profiles WHERE id = challenger_id));

-- Users can update friend challenges they're involved in
CREATE POLICY "Users can update own friend challenges" ON friend_challenges
    FOR UPDATE USING (
        auth.uid() = (SELECT auth_user_id FROM profiles WHERE id = challenger_id) OR
        auth.uid() = (SELECT auth_user_id FROM profiles WHERE id = challenged_id)
    );

-- =====================================================
-- TOURNAMENTS TABLE POLICIES
-- =====================================================

-- Public read access for tournaments
CREATE POLICY "Public tournaments read access" ON tournaments
    FOR SELECT USING (true);

-- Users can read tournament participants
CREATE POLICY "Public tournament participants read access" ON tournament_participants
    FOR SELECT USING (true);

-- Users can insert themselves as tournament participants
CREATE POLICY "Users can join tournaments" ON tournament_participants
    FOR INSERT WITH CHECK (auth.uid() = (SELECT auth_user_id FROM profiles WHERE id = user_id));

-- Users can update their own tournament participation
CREATE POLICY "Users can update own tournament participation" ON tournament_participants
    FOR UPDATE USING (auth.uid() = (SELECT auth_user_id FROM profiles WHERE id = user_id));

-- =====================================================
-- ANALYTICS TABLE POLICIES
-- =====================================================

-- Users can read their own analytics
CREATE POLICY "Users can view own analytics" ON user_analytics
    FOR SELECT USING (auth.uid() = (SELECT auth_user_id FROM profiles WHERE id = user_id));

-- Users can update their own analytics
CREATE POLICY "Users can update own analytics" ON user_analytics
    FOR UPDATE USING (auth.uid() = (SELECT auth_user_id FROM profiles WHERE id = user_id));

-- Users can insert their own analytics
CREATE POLICY "Users can insert own analytics" ON user_analytics
    FOR INSERT WITH CHECK (auth.uid() = (SELECT auth_user_id FROM profiles WHERE id = user_id));

-- =====================================================
-- USER SESSIONS TABLE POLICIES
-- =====================================================

-- Users can read their own sessions
CREATE POLICY "Users can view own sessions" ON user_sessions
    FOR SELECT USING (auth.uid() = (SELECT auth_user_id FROM profiles WHERE id = user_id));

-- Users can insert their own sessions
CREATE POLICY "Users can insert own sessions" ON user_sessions
    FOR INSERT WITH CHECK (auth.uid() = (SELECT auth_user_id FROM profiles WHERE id = user_id));

-- Users can update their own sessions
CREATE POLICY "Users can update own sessions" ON user_sessions
    FOR UPDATE USING (auth.uid() = (SELECT auth_user_id FROM profiles WHERE id = user_id));

-- =====================================================
-- FUNCTION-BASED POLICIES FOR COMPLEX QUERIES
-- =====================================================

-- Function to check if user is premium
CREATE OR REPLACE FUNCTION is_premium_user(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE auth_user_id = user_uuid 
        AND is_premium = true 
        AND (premium_expires_at IS NULL OR premium_expires_at > NOW())
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's rank in leaderboard
CREATE OR REPLACE FUNCTION get_user_rank(user_uuid UUID, mode VARCHAR(20))
RETURNS INTEGER AS $$
DECLARE
    user_rank INTEGER;
BEGIN
    SELECT rank_position INTO user_rank
    FROM leaderboards
    WHERE user_id = (SELECT id FROM profiles WHERE auth_user_id = user_uuid)
    AND game_mode = mode;
    
    RETURN COALESCE(user_rank, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

-- Function to update leaderboard rank positions
CREATE OR REPLACE FUNCTION update_leaderboard_ranks()
RETURNS TRIGGER AS $$
BEGIN
    -- Update rank positions for the affected game mode
    UPDATE leaderboards 
    SET rank_position = subquery.rank
    FROM (
        SELECT 
            id,
            ROW_NUMBER() OVER (PARTITION BY game_mode ORDER BY best_score DESC, updated_at ASC) as rank
        FROM leaderboards
        WHERE game_mode = NEW.game_mode
    ) subquery
    WHERE leaderboards.id = subquery.id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update ranks when leaderboard changes
CREATE TRIGGER trigger_update_leaderboard_ranks
    AFTER INSERT OR UPDATE ON leaderboards
    FOR EACH ROW
    EXECUTE FUNCTION update_leaderboard_ranks();

-- Function to create user currency record on profile creation
CREATE OR REPLACE FUNCTION create_user_currency()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_currency (user_id, points, star_coins, diamond_shards, event_tokens, trophy_coins)
    VALUES (NEW.id, 0, 0, 0, 0, 0);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create currency record when profile is created
CREATE TRIGGER trigger_create_user_currency
    AFTER INSERT ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION create_user_currency();

-- Function to update user analytics
CREATE OR REPLACE FUNCTION update_user_analytics()
RETURNS TRIGGER AS $$
DECLARE
    analytics_date DATE := CURRENT_DATE;
BEGIN
    INSERT INTO user_analytics (
        user_id, 
        date, 
        games_played, 
        total_playtime_ms, 
        total_score, 
        average_reaction_time_ms,
        perfect_rounds,
        lightning_reactions
    )
    VALUES (
        NEW.user_id,
        analytics_date,
        1,
        NEW.session_duration_ms,
        NEW.final_score,
        NEW.average_reaction_time_ms,
        NEW.perfect_rounds,
        NEW.lightning_reactions
    )
    ON CONFLICT (user_id, date)
    DO UPDATE SET
        games_played = user_analytics.games_played + 1,
        total_playtime_ms = user_analytics.total_playtime_ms + NEW.session_duration_ms,
        total_score = user_analytics.total_score + NEW.final_score,
        average_reaction_time_ms = (
            (user_analytics.average_reaction_time_ms * user_analytics.games_played + NEW.average_reaction_time_ms) / 
            (user_analytics.games_played + 1)
        ),
        perfect_rounds = user_analytics.perfect_rounds + NEW.perfect_rounds,
        lightning_reactions = user_analytics.lightning_reactions + NEW.lightning_reactions,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update analytics when game session is created
CREATE TRIGGER trigger_update_user_analytics
    AFTER INSERT ON game_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_user_analytics();
