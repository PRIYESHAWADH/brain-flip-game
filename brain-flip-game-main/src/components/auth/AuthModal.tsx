"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { worldClassSupabase } from '@/lib/supabase-enhanced';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: () => void;
}

type AuthMode = 'signin' | 'signup' | 'profile';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [profile, setProfile] = useState<{ 
		username: string; 
		display_name: string; 
		level: number;
		total_games_played?: number;
		best_score?: number;
	} | null>(null);

  useEffect(() => {
    if (isOpen) {
      checkUser();
    }
  }, [isOpen]);

    try {
      const { data: { user } } = await worldClassSupabase.getCurrentUser();
      if (user) {
        setUser(user);
        const { data: profileData } = await worldClassSupabase.getProfile(user.id);
        setProfile(profileData);
        setMode('profile');
      } else {
        setMode('signin');
      }
    } catch (error) {
      console.error('Error checking user:', error);
    }
  };

    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error } = await worldClassSupabase.signIn(email, password);
      if (error) throw error;

      if (data.user) {
        setUser(data.user);
        const { data: profileData } = await worldClassSupabase.getProfile(data.user.id);
        setProfile(profileData);
        setMode('profile');
        onAuthSuccess();
      }
    } catch (error: unknown) {

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error } = await worldClassSupabase.signUp(email, password, {
        username,
        display_name: displayName || username
      });
      
      if (error) throw error;

      if (data.user) {
        // Create profile
        await worldClassSupabase.createProfile(data.user.id, {
          username,
          display_name: displayName || username,
          level: 1,
          experience: 0,
          total_games_played: 0,
          total_score: 0,
          best_score: 0,
          longest_streak: 0,
          achievements_unlocked: 0,
          premium_status: false
        });

        setUser(data.user);
        setMode('profile');
        onAuthSuccess();
      }
    } catch (error: unknown) {

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

    try {
      await worldClassSupabase.signOut();
      setUser(null);
      setProfile(null);
      setMode('signin');
      onClose();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await worldClassSupabase.updateProfile(user?.id || '', {
        display_name: displayName,
        updated_at: new Date().toISOString()
      });

      const { data: updatedProfile } = await worldClassSupabase.getProfile(user?.id || '');
      setProfile(updatedProfile);
      setError('');
    } catch (error: unknown) {

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome Back</h2>
        <p className="text-gray-600 dark:text-gray-400">Sign in to continue your journey</p>
      </div>

      <form onSubmit={handleSignIn} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            required
          />
        </div>

        {error && (
          <div className="text-red-600 dark:text-red-400 text-sm">{error}</div>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </Button>
      </form>

      <div className="text-center">
        <button
          onClick={() => setMode('signup')}
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          Don't have an account? Sign up
        </button>
      </div>
    </motion.div>
  );

    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Join the Adventure</h2>
        <p className="text-gray-600 dark:text-gray-400">Create your account to start playing</p>
      </div>

      <form onSubmit={handleSignUp} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Display Name (Optional)
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            required
          />
        </div>

        {error && (
          <div className="text-red-600 dark:text-red-400 text-sm">{error}</div>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </Button>
      </form>

      <div className="text-center">
        <button
          onClick={() => setMode('signin')}
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          Already have an account? Sign in
        </button>
      </div>
    </motion.div>
  );

    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Profile</h2>
        <p className="text-gray-600 dark:text-gray-400">Manage your account and stats</p>
      </div>

      {profile && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-white dark:bg-gray-700 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {profile.level || 1}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Level</div>
            </div>
            <div className="bg-white dark:bg-gray-700 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {profile.total_games_played || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Games</div>
            </div>
            <div className="bg-white dark:bg-gray-700 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {profile.best_score || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Best Score</div>
            </div>
          </div>

          {error && (
            <div className="text-red-600 dark:text-red-400 text-sm">{error}</div>
          )}

          <div className="flex space-x-4">
            <Button
              onClick={handleProfileUpdate}
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              {loading ? 'Updating...' : 'Update Profile'}
            </Button>
            <Button
              onClick={handleSignOut}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Sign Out
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );

  return (
    <Modal open={isOpen} onClose={onClose}>
      <div className="w-full max-w-md mx-auto">
        <AnimatePresence mode="wait">
          {mode === 'signin' && renderSignIn()}
          {mode === 'signup' && renderSignUp()}
          {mode === 'profile' && renderProfile()}
        </AnimatePresence>
      </div>
    </Modal>
  );
}
