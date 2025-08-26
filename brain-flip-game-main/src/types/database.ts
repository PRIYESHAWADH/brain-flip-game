export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          display_name: string | null
          avatar_url: string | null
          bio: string | null
          level: number
          experience: number
          total_games_played: number
          total_score: number
          best_score: number
          average_reaction_time: number | null
          longest_streak: number
          achievements_unlocked: number
          premium_status: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          level?: number
          experience?: number
          total_games_played?: number
          total_score?: number
          best_score?: number
          average_reaction_time?: number | null
          longest_streak?: number
          achievements_unlocked?: number
          premium_status?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          level?: number
          experience?: number
          total_games_played?: number
          total_score?: number
          best_score?: number
          average_reaction_time?: number | null
          longest_streak?: number
          achievements_unlocked?: number
          premium_status?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      game_sessions: {
        Row: {
          id: string
          user_id: string
          game_mode: 'classic' | 'duel' | 'sudden-death'
          score: number
          level: number
          streak: number
          mistakes: number
          time_remaining: number
          instructions_completed: number
          average_reaction_time: number | null
          session_duration: number
          perfect_rounds: number
          lightning_reactions: number
          combo_streak: number
          celebration_level: string
          is_completed: boolean
          created_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          game_mode: 'classic' | 'duel' | 'sudden-death'
          score: number
          level: number
          streak: number
          mistakes: number
          time_remaining: number
          instructions_completed: number
          average_reaction_time?: number | null
          session_duration: number
          perfect_rounds?: number
          lightning_reactions?: number
          combo_streak?: number
          celebration_level?: string
          is_completed?: boolean
          created_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          game_mode?: 'classic' | 'duel' | 'sudden-death'
          score?: number
          level?: number
          streak?: number
          mistakes?: number
          time_remaining?: number
          instructions_completed?: number
          average_reaction_time?: number | null
          session_duration?: number
          perfect_rounds?: number
          lightning_reactions?: number
          combo_streak?: number
          celebration_level?: string
          is_completed?: boolean
          created_at?: string
          completed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "game_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      leaderboards: {
        Row: {
          id: string
          user_id: string
          game_mode: 'classic' | 'duel' | 'sudden-death'
          score: number
          rank: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          game_mode: 'classic' | 'duel' | 'sudden-death'
          score: number
          rank?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          game_mode?: 'classic' | 'duel' | 'sudden-death'
          score?: number
          rank?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leaderboards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      achievement_definitions: {
        Row: {
          id: string
          name: string
          description: string
          icon: string
          condition_type: 'score_threshold' | 'level_threshold' | 'streak_threshold' | 'perfect_rounds' | 'lightning_reactions' | 'combo_streak' | 'games_played' | 'reaction_time_threshold' | 'daily_streak'
          condition_value: number
          reward_coins: number
          reward_xp: number
          rarity: 'common' | 'rare' | 'epic' | 'legendary'
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          icon: string
          condition_type: 'score_threshold' | 'level_threshold' | 'streak_threshold' | 'perfect_rounds' | 'lightning_reactions' | 'combo_streak' | 'games_played' | 'reaction_time_threshold' | 'daily_streak'
          condition_value: number
          reward_coins?: number
          reward_xp?: number
          rarity?: 'common' | 'rare' | 'epic' | 'legendary'
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          icon?: string
          condition_type?: 'score_threshold' | 'level_threshold' | 'streak_threshold' | 'perfect_rounds' | 'lightning_reactions' | 'combo_streak' | 'games_played' | 'reaction_time_threshold' | 'daily_streak'
          condition_value?: number
          reward_coins?: number
          reward_xp?: number
          rarity?: 'common' | 'rare' | 'epic' | 'legendary'
          created_at?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          id: string
          user_id: string
          achievement_id: string
          unlocked_at: string
        }
        Insert: {
          id?: string
          user_id: string
          achievement_id: string
          unlocked_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          achievement_id?: string
          unlocked_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievement_definitions"
            referencedColumns: ["id"]
          }
        ]
      }
      challenge_definitions: {
        Row: {
          id: string
          name: string
          description: string
          challenge_type: 'score_target' | 'streak_target' | 'perfect_rounds' | 'games_played' | 'reaction_time_target' | 'lightning_reactions' | 'combo_streak'
          target_value: number
          reward_coins: number
          reward_xp: number
          is_daily: boolean
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          challenge_type: 'score_target' | 'streak_target' | 'perfect_rounds' | 'games_played' | 'reaction_time_target' | 'lightning_reactions' | 'combo_streak'
          target_value: number
          reward_coins?: number
          reward_xp?: number
          is_daily?: boolean
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          challenge_type?: 'score_target' | 'streak_target' | 'perfect_rounds' | 'games_played' | 'reaction_time_target' | 'lightning_reactions' | 'combo_streak'
          target_value?: number
          reward_coins?: number
          reward_xp?: number
          is_daily?: boolean
          is_active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      user_daily_challenges: {
        Row: {
          id: string
          user_id: string
          challenge_id: string
          progress: number
          is_completed: boolean
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          challenge_id: string
          progress?: number
          is_completed?: boolean
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          challenge_id?: string
          progress?: number
          is_completed?: boolean
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_daily_challenges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_daily_challenges_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenge_definitions"
            referencedColumns: ["id"]
          }
        ]
      }
      user_currency: {
        Row: {
          id: string
          user_id: string
          balance: number
          total_earned: number
          total_spent: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          balance?: number
          total_earned?: number
          total_spent?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          balance?: number
          total_earned?: number
          total_spent?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_currency_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      currency_transactions: {
        Row: {
          id: string
          user_id: string
          amount: number
          transaction_type: 'earn' | 'spend' | 'bonus' | 'achievement'
          reason: string
          balance_after: number
          game_session_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          transaction_type: 'earn' | 'spend' | 'bonus' | 'achievement'
          reason: string
          balance_after: number
          game_session_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          transaction_type?: 'earn' | 'spend' | 'bonus' | 'achievement'
          reason?: string
          balance_after?: number
          game_session_id?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "currency_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "currency_transactions_game_session_id_fkey"
            columns: ["game_session_id"]
            isOneToOne: false
            referencedRelation: "game_sessions"
            referencedColumns: ["id"]
          }
        ]
      }
      user_analytics: {
        Row: {
          id: string
          user_id: string
          total_play_time: number
          average_session_duration: number
          favorite_game_mode: string | null
          best_reaction_time: number | null
          total_perfect_rounds: number
          total_lightning_reactions: number
          longest_combo_streak: number
          daily_streak: number
          last_played_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          total_play_time?: number
          average_session_duration?: number
          favorite_game_mode?: string | null
          best_reaction_time?: number | null
          total_perfect_rounds?: number
          total_lightning_reactions?: number
          longest_combo_streak?: number
          daily_streak?: number
          last_played_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          total_play_time?: number
          average_session_duration?: number
          favorite_game_mode?: string | null
          best_reaction_time?: number | null
          total_perfect_rounds?: number
          total_lightning_reactions?: number
          longest_combo_streak?: number
          daily_streak?: number
          last_played_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_analytics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      friendships: {
        Row: {
          id: string
          user_id: string
          friend_id: string
          status: 'pending' | 'accepted' | 'blocked'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          friend_id: string
          status?: 'pending' | 'accepted' | 'blocked'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          friend_id?: string
          status?: 'pending' | 'accepted' | 'blocked'
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "friendships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friendships_friend_id_fkey"
            columns: ["friend_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      tournaments: {
        Row: {
          id: string
          name: string
          description: string | null
          game_mode: string
          start_date: string
          end_date: string
          max_participants: number | null
          entry_fee: number
          prize_pool: number
          status: 'upcoming' | 'active' | 'completed' | 'cancelled'
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          game_mode: string
          start_date: string
          end_date: string
          max_participants?: number | null
          entry_fee?: number
          prize_pool?: number
          status?: 'upcoming' | 'active' | 'completed' | 'cancelled'
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          game_mode?: string
          start_date?: string
          end_date?: string
          max_participants?: number | null
          entry_fee?: number
          prize_pool?: number
          status?: 'upcoming' | 'active' | 'completed' | 'cancelled'
          created_at?: string
        }
        Relationships: []
      }
      tournament_participants: {
        Row: {
          id: string
          tournament_id: string
          user_id: string
          score: number
          rank: number | null
          joined_at: string
        }
        Insert: {
          id?: string
          tournament_id: string
          user_id: string
          score?: number
          rank?: number | null
          joined_at?: string
        }
        Update: {
          id?: string
          tournament_id?: string
          user_id?: string
          score?: number
          rank?: number | null
          joined_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournament_participants_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types for common operations
export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export type GameSession = Database['public']['Tables']['game_sessions']['Row']
export type GameSessionInsert = Database['public']['Tables']['game_sessions']['Insert']
export type GameSessionUpdate = Database['public']['Tables']['game_sessions']['Update']

export type Leaderboard = Database['public']['Tables']['leaderboards']['Row']
export type LeaderboardInsert = Database['public']['Tables']['leaderboards']['Insert']
export type LeaderboardUpdate = Database['public']['Tables']['leaderboards']['Update']

export type AchievementDefinition = Database['public']['Tables']['achievement_definitions']['Row']
export type AchievementDefinitionInsert = Database['public']['Tables']['achievement_definitions']['Insert']
export type AchievementDefinitionUpdate = Database['public']['Tables']['achievement_definitions']['Update']

export type UserAchievement = Database['public']['Tables']['user_achievements']['Row']
export type UserAchievementInsert = Database['public']['Tables']['user_achievements']['Insert']
export type UserAchievementUpdate = Database['public']['Tables']['user_achievements']['Update']

export type ChallengeDefinition = Database['public']['Tables']['challenge_definitions']['Row']
export type ChallengeDefinitionInsert = Database['public']['Tables']['challenge_definitions']['Insert']
export type ChallengeDefinitionUpdate = Database['public']['Tables']['challenge_definitions']['Update']

export type UserDailyChallenge = Database['public']['Tables']['user_daily_challenges']['Row']
export type UserDailyChallengeInsert = Database['public']['Tables']['user_daily_challenges']['Insert']
export type UserDailyChallengeUpdate = Database['public']['Tables']['user_daily_challenges']['Update']

export type UserCurrency = Database['public']['Tables']['user_currency']['Row']
export type UserCurrencyInsert = Database['public']['Tables']['user_currency']['Insert']
export type UserCurrencyUpdate = Database['public']['Tables']['user_currency']['Update']

export type CurrencyTransaction = Database['public']['Tables']['currency_transactions']['Row']
export type CurrencyTransactionInsert = Database['public']['Tables']['currency_transactions']['Insert']
export type CurrencyTransactionUpdate = Database['public']['Tables']['currency_transactions']['Update']

export type UserAnalytics = Database['public']['Tables']['user_analytics']['Row']
export type UserAnalyticsInsert = Database['public']['Tables']['user_analytics']['Insert']
export type UserAnalyticsUpdate = Database['public']['Tables']['user_analytics']['Update']

export type Friendship = Database['public']['Tables']['friendships']['Row']
export type FriendshipInsert = Database['public']['Tables']['friendships']['Insert']
export type FriendshipUpdate = Database['public']['Tables']['friendships']['Update']

export type Tournament = Database['public']['Tables']['tournaments']['Row']
export type TournamentInsert = Database['public']['Tables']['tournaments']['Insert']
export type TournamentUpdate = Database['public']['Tables']['tournaments']['Update']

export type TournamentParticipant = Database['public']['Tables']['tournament_participants']['Row']
export type TournamentParticipantInsert = Database['public']['Tables']['tournament_participants']['Insert']
export type TournamentParticipantUpdate = Database['public']['Tables']['tournament_participants']['Update']
