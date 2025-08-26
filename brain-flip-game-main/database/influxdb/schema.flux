// Ultimate Brain Flip Experience - InfluxDB Schema
// Time-series data for cognitive analytics and performance metrics

// Bucket: cognitive-analytics
// Retention: 1 year for detailed metrics, 5 years for aggregated data

// =====================================================
// MEASUREMENT: game_performance
// Real-time game performance metrics
// =====================================================

// Tags (indexed):
// - user_id: User identifier
// - session_id: Game session identifier  
// - game_mode: classic, sudden-death, duel
// - instruction_type: direction, color, action, combo
// - difficulty_level: 1-30
// - device_type: web, mobile, desktop
// - platform: chrome, firefox, safari, ios, android

// Fields (values):
// - reaction_time: Reaction time in milliseconds
// - accuracy: 1 for correct, 0 for incorrect
// - streak_count: Current streak
// - score_gained: Points gained for this instruction
// - cognitive_load: Estimated cognitive load (0.0-1.0)
// - flow_state_indicator: Flow state score (0.0-1.0)
// - fatigue_level: Fatigue indicator (0.0-1.0)
// - attention_level: Attention score (0.0-1.0)

// Example query:
// from(bucket: "cognitive-analytics")
//   |> range(start: -1h)
//   |> filter(fn: (r) => r._measurement == "game_performance")
//   |> filter(fn: (r) => r.user_id == "user123")

// =====================================================
// MEASUREMENT: cognitive_metrics
// Detailed cognitive ability measurements
// =====================================================

// Tags:
// - user_id: User identifier
// - assessment_type: session, daily, weekly, monthly
// - cognitive_domain: working_memory, processing_speed, attention, flexibility

// Fields:
// - raw_score: Raw cognitive score
// - percentile_rank: Percentile ranking
// - improvement_rate: Rate of improvement
// - consistency_score: Performance consistency
// - cognitive_age: Estimated cognitive age
// - neuroplasticity_index: Neuroplasticity indicator

// =====================================================
// MEASUREMENT: ai_personalization
// AI personalization effectiveness metrics
// =====================================================

// Tags:
// - user_id: User identifier
// - model_version: AI model version
// - personalization_type: difficulty, content, timing
// - experiment_id: A/B test experiment ID

// Fields:
// - prediction_accuracy: How accurate AI predictions were
// - engagement_score: User engagement level
// - learning_velocity: Rate of skill improvement
// - satisfaction_score: User satisfaction rating
// - model_confidence: AI model confidence level

// =====================================================
// MEASUREMENT: battle_metrics
// Multiplayer battle performance
// =====================================================

// Tags:
// - battle_id: Battle room identifier
// - user_id: User identifier
// - opponent_id: Opponent identifier
// - battle_type: quick, ranked, tournament
// - elo_bracket: elo rating bracket

// Fields:
// - battle_score: Final battle score
// - rank_position: Final ranking in battle
// - elo_change: ELO rating change
// - average_reaction_time: Average reaction time in battle
// - pressure_performance: Performance under pressure
// - comeback_factor: Ability to recover from behind

// =====================================================
// MEASUREMENT: social_engagement
// Social platform engagement metrics
// =====================================================

// Tags:
// - user_id: User identifier
// - activity_type: post, like, comment, share, follow
// - content_type: achievement, highlight, tip, challenge
// - team_id: Team identifier (if applicable)

// Fields:
// - engagement_duration: Time spent on activity
// - interaction_count: Number of interactions
// - reach_count: Number of users reached
// - influence_score: Social influence metric
// - community_contribution: Contribution to community

// =====================================================
// MEASUREMENT: device_performance
// Device and technical performance metrics
// =====================================================

// Tags:
// - user_id: User identifier
// - device_type: web, mobile, desktop
// - browser: chrome, firefox, safari, edge
// - os: windows, macos, ios, android, linux
// - connection_type: wifi, cellular, ethernet

// Fields:
// - frame_rate: Average FPS
// - load_time: Page/app load time
// - memory_usage: Memory consumption
// - cpu_usage: CPU utilization
// - network_latency: Network latency
// - error_count: Number of errors encountered

// =====================================================
// MEASUREMENT: business_metrics
// Business and engagement metrics
// =====================================================

// Tags:
// - user_id: User identifier
// - subscription_tier: free, premium, elite, research
// - acquisition_channel: organic, paid, referral, social
// - user_segment: new, returning, power_user, at_risk

// Fields:
// - session_duration: Total session time
// - daily_active_time: Daily active time
// - retention_score: User retention indicator
// - monetization_value: Revenue generated
// - churn_probability: Likelihood of churning
// - lifetime_value: Estimated lifetime value

// =====================================================
// CONTINUOUS QUERIES FOR AGGREGATIONS
// =====================================================

// Hourly aggregations
option task = {
  name: "hourly_cognitive_aggregation",
  every: 1h,
}

from(bucket: "cognitive-analytics")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "game_performance")
  |> group(columns: ["user_id", "game_mode"])
  |> aggregateWindow(every: 1h, fn: mean, createEmpty: false)
  |> to(bucket: "cognitive-analytics-hourly")

// Daily aggregations
option task = {
  name: "daily_cognitive_aggregation", 
  every: 1d,
}

from(bucket: "cognitive-analytics")
  |> range(start: -1d)
  |> filter(fn: (r) => r._measurement == "cognitive_metrics")
  |> group(columns: ["user_id", "cognitive_domain"])
  |> aggregateWindow(every: 1d, fn: mean, createEmpty: false)
  |> to(bucket: "cognitive-analytics-daily")

// Weekly trend analysis
option task = {
  name: "weekly_trend_analysis",
  every: 1w,
}

from(bucket: "cognitive-analytics-daily")
  |> range(start: -1w)
  |> group(columns: ["user_id"])
  |> derivative(unit: 1d, nonNegative: false)
  |> map(fn: (r) => ({ r with trend_direction: if r._value > 0 then "improving" else "declining" }))
  |> to(bucket: "cognitive-trends")

// =====================================================
// ALERTING RULES
// =====================================================

// Alert for cognitive decline
option task = {
  name: "cognitive_decline_alert",
  every: 1h,
}

from(bucket: "cognitive-analytics")
  |> range(start: -24h)
  |> filter(fn: (r) => r._measurement == "cognitive_metrics")
  |> filter(fn: (r) => r._field == "cognitive_age")
  |> group(columns: ["user_id"])
  |> aggregateWindow(every: 24h, fn: mean)
  |> map(fn: (r) => ({ r with alert_level: if r._value > 65.0 then "high" else "normal" }))
  |> filter(fn: (r) => r.alert_level == "high")
  |> to(bucket: "alerts")

// Alert for unusual performance patterns
option task = {
  name: "performance_anomaly_alert",
  every: 15m,
}

from(bucket: "cognitive-analytics")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "game_performance")
  |> filter(fn: (r) => r._field == "reaction_time")
  |> group(columns: ["user_id"])
  |> aggregateWindow(every: 15m, fn: mean)
  |> map(fn: (r) => ({ r with z_score: (r._value - 800.0) / 200.0 }))
  |> filter(fn: (r) => r.z_score > 3.0 or r.z_score < -3.0)
  |> to(bucket: "performance-alerts")

// =====================================================
// DATA RETENTION POLICIES
// =====================================================

// Raw data: 1 year
// Hourly aggregations: 2 years  
// Daily aggregations: 5 years
// Weekly/Monthly aggregations: 10 years

// =====================================================
// EXAMPLE QUERIES FOR ANALYTICS
// =====================================================

// User cognitive improvement over time
cognitive_improvement = from(bucket: "cognitive-analytics")
  |> range(start: -30d)
  |> filter(fn: (r) => r._measurement == "cognitive_metrics")
  |> filter(fn: (r) => r.user_id == "user123")
  |> filter(fn: (r) => r._field == "raw_score")
  |> group(columns: ["cognitive_domain"])
  |> aggregateWindow(every: 1d, fn: mean)
  |> derivative(unit: 1d, nonNegative: false)

// Real-time performance dashboard
realtime_performance = from(bucket: "cognitive-analytics")
  |> range(start: -5m)
  |> filter(fn: (r) => r._measurement == "game_performance")
  |> filter(fn: (r) => r.user_id == "user123")
  |> group(columns: ["instruction_type"])
  |> mean()

// Leaderboard query
leaderboard = from(bucket: "cognitive-analytics")
  |> range(start: -7d)
  |> filter(fn: (r) => r._measurement == "game_performance")
  |> filter(fn: (r) => r._field == "score_gained")
  |> group(columns: ["user_id"])
  |> sum()
  |> sort(columns: ["_value"], desc: true)
  |> limit(n: 100)

// AI model performance evaluation
ai_effectiveness = from(bucket: "cognitive-analytics")
  |> range(start: -1d)
  |> filter(fn: (r) => r._measurement == "ai_personalization")
  |> filter(fn: (r) => r._field == "prediction_accuracy")
  |> group(columns: ["model_version"])
  |> mean()
  |> sort(columns: ["_value"], desc: true)