"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';

interface WorldClassAuthProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function WorldClassAuth({ isOpen, onClose, onSuccess }: WorldClassAuthProps) {
  const [mode, setMode] = useState<'signin' | 'signup' | 'profile'>('signin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  
  const { user, profile, signIn, signUp, signOut, updateProfile, refreshProfile } = useAuth();

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setSuccess(null);
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setUsername('');
      setDisplayName('');
      
      // If user is logged in, show profile mode
      if (user) {
        setMode('profile');
        setDisplayName(profile?.display_name || profile?.username || '');
      } else {
        setMode('signin');
      }
    }
  }, [isOpen, user, profile]);
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await signIn(email, password);
      setSuccess('Successfully signed in! Welcome back! 🎉');
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1500);
    } catch (err: unknown) {
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    if (!username.trim()) {
      setError('Username is required');
      setLoading(false);
      return;
    }

    try {
      await signUp(email, password, username.trim(), displayName.trim() || username.trim());
      
      setSuccess('Account created successfully! Welcome to Brain Flip! 🧠✨');
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1500);
    } catch (err: unknown) {
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await updateProfile({
        display_name: displayName.trim(),
        updated_at: new Date().toISOString()
      });
      
      await refreshProfile();
      setSuccess('Profile updated successfully! 💫');
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: unknown) {
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
    setLoading(true);
    try {
      await signOut();
      setSuccess('Signed out successfully! See you next time! 👋');
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: unknown) {
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" as const }
    },
    exit: { 
      opacity: 0, 
      scale: 0.9, 
      y: -20,
      transition: { duration: 0.2 }
    }
  };
    hidden: { opacity: 0, x: 20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.3, delay: 0.1 }
    },
    exit: { opacity: 0, x: -20 }
  };
    <motion.div
      key="signin"
      variants={formVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-6"
    >
      <div className="text-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Welcome Back! 🧠
        </h2>
        <p className="text-gray-400 mt-2">Sign in to continue your brain training journey</p>
      </div>

      <form onSubmit={handleSignIn} className="space-y-4">
        <div>
          <label className="block text-white font-medium mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-purple-400 focus:outline-none transition-colors"
            placeholder="your@email.com"
            required
          />
        </div>

        <div>
          <label className="block text-white font-medium mb-2">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-purple-400 focus:outline-none transition-colors"
            placeholder="••••••••"
            required
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          disabled={loading}
        >
          {loading ? '🔄 Signing In...' : '🚀 Sign In'}
        </Button>
      </form>

      <div className="text-center">
        <p className="text-gray-400">
          Don't have an account?{' '}
          <button
            onClick={() => setMode('signup')}
            className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
          >
            Sign up here
          </button>
        </p>
      </div>
    </motion.div>
  );
    <motion.div
      key="signup"
      variants={formVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-6"
    >
      <div className="text-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Join Brain Flip! 🎯
        </h2>
        <p className="text-gray-400 mt-2">Create your account and start training your brain</p>
      </div>

      <form onSubmit={handleSignUp} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-white font-medium mb-2">Username*</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-400 focus:outline-none transition-colors"
              placeholder="cooluser123"
              required
            />
          </div>

          <div>
            <label className="block text-white font-medium mb-2">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-400 focus:outline-none transition-colors"
              placeholder="Cool User"
            />
          </div>
        </div>

        <div>
          <label className="block text-white font-medium mb-2">Email*</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-400 focus:outline-none transition-colors"
            placeholder="your@email.com"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-white font-medium mb-2">Password*</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-400 focus:outline-none transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          <div>
            <label className="block text-white font-medium mb-2">Confirm Password*</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-400 focus:outline-none transition-colors"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
          disabled={loading}
        >
          {loading ? '🔄 Creating Account...' : '✨ Create Account'}
        </Button>
      </form>

      <div className="text-center">
        <p className="text-gray-400">
          Already have an account?{' '}
          <button
            onClick={() => setMode('signin')}
            className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
          >
            Sign in here
          </button>
        </p>
      </div>
    </motion.div>
  );
    <motion.div
      key="profile"
      variants={formVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-6"
    >
      <div className="text-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
          Your Profile 👤
        </h2>
        <p className="text-gray-400 mt-2">Manage your account settings</p>
      </div>

      <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-lg p-6 border border-green-500/20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Username:</span>
            <span className="text-white font-medium ml-2">{profile?.username}</span>
          </div>
          <div>
            <span className="text-gray-400">Level:</span>
            <span className="text-green-400 font-bold ml-2">{profile?.level || 1}</span>
          </div>
          <div>
            <span className="text-gray-400">Games Played:</span>
            <span className="text-blue-400 font-medium ml-2">{profile?.total_games_played || 0}</span>
          </div>
          <div>
            <span className="text-gray-400">Best Score:</span>
            <span className="text-yellow-400 font-bold ml-2">{profile?.best_score || 0}</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleUpdateProfile} className="space-y-4">
        <div>
          <label className="block text-white font-medium mb-2">Display Name</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-green-400 focus:outline-none transition-colors"
            placeholder="Your display name"
          />
        </div>

        <div className="flex gap-4">
          <Button
            type="submit"
            className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
            disabled={loading}
          >
            {loading ? '🔄 Updating...' : '💫 Update Profile'}
          </Button>

          <Button
            type="button"
            onClick={handleSignOut}
            className="px-6 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
            disabled={loading}
          >
            👋 Sign Out
          </Button>
        </div>
      </form>
    </motion.div>
  );

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="w-full max-w-md bg-gray-900 rounded-2xl border border-gray-700 p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors p-2"
        >
          ✕
        </button>

        {/* Error/Success Messages */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-center"
            >
              ❌ {error}
            </motion.div>
          )}
          
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-center"
            >
              ✅ {success}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form Content */}
        <AnimatePresence mode="wait">
          {mode === 'signin' && renderSignIn()}
          {mode === 'signup' && renderSignUp()}
          {mode === 'profile' && renderProfile()}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
