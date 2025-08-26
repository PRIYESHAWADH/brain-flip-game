import { useState, useEffect, useCallback } from 'react';
import { worldClassSupabase } from '@/lib/supabase-enhanced';
import type { Profile } from '@/types/database';

interface User {
  id: string;
  email: string;
  created_at: string;
}

interface AuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    error: null,
  });

  const checkAuth = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      const { data: { user }, error: userError } = await worldClassSupabase.getCurrentUser();
      
      if (userError) throw userError;

      if (user) {
        const { data: profile, error: profileError } = await worldClassSupabase.getProfile(user.id);
        
        if (profileError) {
          console.error('Error fetching profile:', profileError);
          // Profile might not exist yet, that's okay
        }

        setAuthState({
          user: {
            id: user.id,
            email: user.email || '',
            created_at: user.created_at,
          },
          profile: profile || null,
          loading: false,
          error: null,
        });
      } else {
        setAuthState({
          user: null,
          profile: null,
          loading: false,
          error: null,
        });
      }
    } catch (error: unknown) {
      console.error('Auth check error:', error);
      setAuthState({
        user: null,
        profile: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Authentication error',
      });
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      const { data, error } = await worldClassSupabase.signIn(email, password);
      
      if (error) throw error;

      if (data.user) {
        const { data: profile } = await worldClassSupabase.getProfile(data.user.id);
        
        setAuthState({
          user: {
            id: data.user.id,
            email: data.user.email || '',
            created_at: data.user.created_at,
          },
          profile: profile || null,
          loading: false,
          error: null,
        });

        return { success: true };
      }
    } catch (error: unknown) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Sign in failed',
      }));
      return { success: false, error: error instanceof Error ? error.message : 'Sign in failed' };
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, username: string, displayName?: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      const { data, error } = await worldClassSupabase.signUp(email, password, {
        username,
        display_name: displayName || username,
      });
      
      if (error) throw error;

      if (data.user) {
        // Create profile
        const { error: profileError } = await worldClassSupabase.createProfile(data.user.id, {
          username,
          display_name: displayName || username,
          level: 1,
          experience: 0,
          total_games_played: 0,
          total_score: 0,
          best_score: 0,
          longest_streak: 0,
          achievements_unlocked: 0,
          premium_status: false,
        });

        if (profileError) {
          console.error('Error creating profile:', profileError);
        }

        const { data: profile } = await worldClassSupabase.getProfile(data.user.id);
        
        setAuthState({
          user: {
            id: data.user.id,
            email: data.user.email || '',
            created_at: data.user.created_at,
          },
          profile: profile || null,
          loading: false,
          error: null,
        });

        return { success: true };
      }
    } catch (error: unknown) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Sign up failed',
      }));
      return { success: false, error: error instanceof Error ? error.message : 'Sign up failed' };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      const { error } = await worldClassSupabase.signOut();
      
      if (error) throw error;

      setAuthState({
        user: null,
        profile: null,
        loading: false,
        error: null,
      });

      return { success: true };
    } catch (error: unknown) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Sign out failed',
      }));
      return { success: false, error: error instanceof Error ? error.message : 'Sign out failed' };
    }
  }, []);

  const updateProfile = useCallback(async (updates: Partial<Profile>) => {
    if (!authState.user) return;

    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      const { error } = await worldClassSupabase.updateProfile(authState.user.id, updates);
      
      if (error) throw error;

      // Refresh profile data
      const { data: updatedProfile } = await worldClassSupabase.getProfile(authState.user.id);
      
      setAuthState(prev => ({
        ...prev,
        profile: updatedProfile || null,
        loading: false,
        error: null,
      }));

      return { success: true };
    } catch (error: unknown) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Profile update failed',
      }));
      return { success: false, error: error instanceof Error ? error.message : 'Profile update failed' };
    }
  }, [authState.user]);

  const refreshProfile = useCallback(async () => {
    if (!authState.user) return;

    try {
      const { data: profile } = await worldClassSupabase.getProfile(authState.user.id);
      setAuthState(prev => ({
        ...prev,
        profile: profile || null,
      }));
    } catch (error) {
      console.error('Error refreshing profile:', error);
    }
  }, [authState.user]);

  // Listen for auth state changes
  useEffect(() => {
    checkAuth();

    const { data: { subscription } } = worldClassSupabase.getClient().auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const { data: profile } = await worldClassSupabase.getProfile(session.user.id);
          setAuthState({
            user: {
              id: session.user.id,
              email: session.user.email || '',
              created_at: session.user.created_at,
            },
            profile: profile || null,
            loading: false,
            error: null,
          });
        } else if (event === 'SIGNED_OUT') {
          setAuthState({
            user: null,
            profile: null,
            loading: false,
            error: null,
          });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [checkAuth]);

  return {
    user: authState.user,
    profile: authState.profile,
    loading: authState.loading,
    error: authState.error,
    signIn,
    signUp,
    signOut,
    updateProfile,
    refreshProfile,
    isAuthenticated: !!authState.user,
  };
}
