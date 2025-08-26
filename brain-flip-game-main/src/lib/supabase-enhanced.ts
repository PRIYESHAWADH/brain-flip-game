import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

// Inject environment-derived Supabase credentials with safe fallbacks for test/dev
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'test-anon-key';

// Create world-class Supabase client with optimal configuration
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'brain-flip-auth',
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
  global: {
    headers: {
      'X-Client-Info': 'brain-flip-game@1.0.0',
    },
  },
})

// World-class enhanced client with perfect type safety and error handling
export class WorldClassSupabaseClient {
  private client = supabase
  private maxRetries = 3
  private baseDelay = 1000

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  private isRetryableError(error: unknown): boolean {
    return (
      // status-based retry (optional chaining guards unknown shapes)
      // @ts-ignore - best-effort checks for typical error structures
      (typeof (error as any)?.status === 'number' && [408, 429, 500, 502, 503, 504].includes((error as any).status)) ||
      // message-based heuristics
      // @ts-ignore
      (typeof (error as any)?.message === 'string' && (
        (error as any).message.includes('network') ||
        (error as any).message.includes('timeout')
      ))
    )
  }

  private async withRetry<T>(
    operation: () => Promise<T>,
    retries = this.maxRetries
  ): Promise<T> {
    try {
      return await operation()
    } catch (error) {
      if (retries > 0 && this.isRetryableError(error)) {
        await this.delay(this.baseDelay)
        return this.withRetry(operation, retries - 1)
      }
      throw error
    }
  }

  // ============================================
  // AUTHENTICATION METHODS - WORLD CLASS
  // ============================================

  async signUp(email: string, password: string, metadata?: unknown) {
    return this.withRetry(() => 
      this.client.auth.signUp({
        email,
        password,
        options: { data: metadata }
      })
    )
  }

  async signIn(email: string, password: string) {
    return this.withRetry(() => 
      this.client.auth.signInWithPassword({ email, password })
    )
  }

  async signOut() {
    return this.withRetry(() => this.client.auth.signOut())
  }

  async getCurrentUser() {
    return this.withRetry(() => this.client.auth.getUser())
  }

  async getSession() {
    return this.withRetry(() => this.client.auth.getSession())
  }

  // ============================================
  // PROFILE MANAGEMENT - WORLD CLASS
  // ============================================

  async createProfile(userId: string, profile: Omit<Database['public']['Tables']['profiles']['Insert'], 'id'>) {
    return this.withRetry(async () => {
      const { data, error } = await this.client
        .from('profiles')
        .insert({ ...profile, id: userId })
        .select()
        .single()
      
      return { data, error }
    })
  }

  async getProfile(userId: string) {
    return this.withRetry(async () => {
      const { data, error } = await this.client
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      
      return { data, error }
    })
  }

  async updateProfile(userId: string, updates: Database['public']['Tables']['profiles']['Update']) {
    return this.withRetry(async () => {
      const { data, error } = await this.client
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()
      
      return { data, error }
    })
  }

  // ============================================
  // GAME SESSION MANAGEMENT - WORLD CLASS
  // ============================================

  async createGameSession(session: Database['public']['Tables']['game_sessions']['Insert']) {
    return this.withRetry(async () => {
      const { data, error } = await this.client
        .from('game_sessions')
        .insert(session)
        .select()
        .single()
      
      return { data, error }
    })
  }

  async getUserGameSessions(userId: string, limit = 50) {
    return this.withRetry(async () => {
      const { data, error } = await this.client
        .from('game_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)
      
      return { data, error }
    })
  }

  async updateUserStats(params: {
    user_id: string
    score: number
    level: number
    streak: number
    perfect_rounds?: number
    lightning_reactions?: number
    combo_streak?: number
  }) {
    return this.withRetry(async () => {
      const { user_id, score, level, streak } = params
      
      // Get current profile
      const { data: currentProfile, error: profileError } = await this.getProfile(user_id)
      
      if (profileError || !currentProfile) {
        return { data: null, error: profileError || new Error('Profile not found') }
      }

      // Calculate new stats (safe fallbacks)
      const newTotalGames = (currentProfile.total_games_played || 0) + 1
      const newTotalScore = (currentProfile.total_score || 0) + (score || 0)
      const newBestScore = Math.max(currentProfile.best_score || 0, score || 0)
      const newLongestStreak = Math.max(currentProfile.longest_streak || 0, streak || 0)
      
      // Update profile
      const { data, error } = await this.client
        .from('profiles')
        .update({
          total_games_played: newTotalGames,
          total_score: newTotalScore,
          best_score: newBestScore,
          longest_streak: newLongestStreak,
          updated_at: new Date().toISOString()
        })
        .eq('id', user_id)
        .select()
        .single()
      
      return { data, error }
    })
  }

  // ============================================
  // ACHIEVEMENT SYSTEM - WORLD CLASS
  // ============================================

  async getAchievementDefinitions() {
    return this.withRetry(async () => {
      const { data, error } = await this.client
        .from('achievement_definitions')
        .select('*')
      
      return { data, error }
    })
  }

  async getUserAchievements(userId: string) {
    return this.withRetry(async () => {
      const { data, error } = await this.client
        .from('user_achievements')
        .select(`
          *,
          achievement_definitions:achievement_id (*)
        `)
        .eq('user_id', userId)
      
      return { data, error }
    })
  }

  async unlockAchievement(userId: string, achievementId: string) {
    return this.withRetry(async () => {
      const { data, error } = await this.client
        .from('user_achievements')
        .insert({ user_id: userId, achievement_id: achievementId })
        .select()
        .single()
      
      return { data, error }
    })
  }

  // ============================================
  // REAL-TIME - WORLD CLASS
  // ============================================

  onScoreChannel(userId: string, handler: (payload: any) => void) {
    const channel = this.client.channel(`scores:${userId}`)
    channel.on('broadcast', { event: 'score_update' }, handler)
    return channel.subscribe()
  }

  // ============================================
  // ANALYTICS - WORLD CLASS
  // ============================================

  async getUserAnalytics(userId: string) {
    return this.withRetry(async () => {
      const { data, error } = await this.client
        .from('user_analytics')
        .select('*')
        .eq('user_id', userId)
        .single()
      
      return { data, error }
    })
  }

  // ============================================
  // HEALTH CHECK - WORLD CLASS
  // ============================================

  async healthCheck() {
    return this.withRetry(async () => {
      const { data, error } = await this.client
        .from('profiles')
        .select('count')
        .limit(1)
      
      return { data, error }
    })
  }

  // ============================================
  // REAL-TIME METHODS - WORLD CLASS
  // ============================================

  channel(name: string) {
    return this.client.channel(name)
  }

  removeChannel(channel: unknown) {
    return this.client.removeChannel(channel)
  }

  // Get the underlying client for direct access
  getClient() {
    return this.client
  }
}

// Export world-class enhanced client instance
export const worldClassSupabase = new WorldClassSupabaseClient()

// Export types for convenience
export type { Database }
