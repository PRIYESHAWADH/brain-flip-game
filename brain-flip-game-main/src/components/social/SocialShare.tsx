"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';

interface SocialShareProps {
  isOpen: boolean;
  onClose: () => void;
  score?: number;
  streak?: number;
  gameMode?: string;
}

export default function SocialShare({ isOpen, onClose, score, streak, gameMode }: SocialShareProps) {
  const { personalBest, reactionTimes } = useGameStore();
  const [copied, setCopied] = useState(false);

  const shareScore = score || personalBest;
  const shareStreak = streak || 0;
  const shareMode = gameMode || 'classic';

  const avgReactionTime = reactionTimes.length > 0 
    ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
    : 0;

  const generateShareText = (platform: string) => {
    const baseText = `🧠 Just scored ${shareScore.toLocaleString()} points in Brain Flip!`;
    const streakText = shareStreak > 0 ? ` 🔥 ${shareStreak}-answer streak!` : '';
    const speedText = avgReactionTime > 0 ? ` ⚡ ${avgReactionTime}ms avg reaction time!` : '';
    const challengeText = ` Can you beat my score?`;
    const hashtags = platform === 'twitter' ? ' #BrainFlip #BrainTraining #Gaming' : '';
    
    return baseText + streakText + speedText + challengeText + hashtags;
  };

  const shareToTwitter = () => {
    const text = generateShareText('twitter');
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const shareToFacebook = () => {
    const text = generateShareText('facebook');
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const shareToReddit = () => {
    const title = `Scored ${shareScore.toLocaleString()} points in Brain Flip!`;
    const text = generateShareText('reddit');
    const url = `https://reddit.com/submit?title=${encodeURIComponent(title)}&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const copyToClipboard = async () => {
    const text = generateShareText('generic');
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Brain Flip Score',
          text: generateShareText('generic'),
          url: window.location.href
        });
      } catch (error) {
        console.error('Failed to share:', error);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="glass-card p-6 max-w-md w-full border-2 border-purple-500/30"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Share Your Score
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-xl"
            >
              ×
            </button>
          </div>

          {/* Score Summary */}
          <div className="glass-card p-4 mb-6 border border-gray-700">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">
                {shareScore.toLocaleString()}
              </div>
              <div className="text-sm text-gray-400 space-y-1">
                <div>
                  Mode: <span className="text-white capitalize">{shareMode}</span>
                </div>
                {shareStreak > 0 && (
                  <div>
                    Best Streak: <span className="text-yellow-400">{shareStreak}</span>
                  </div>
                )}
                {avgReactionTime > 0 && (
                  <div>
                    Avg Reaction: <span className="text-blue-400">{avgReactionTime}ms</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Preview Text */}
          <div className="glass-card p-4 mb-6 border border-gray-700">
            <div className="text-sm text-gray-400 mb-2">Preview:</div>
            <div className="text-white text-sm leading-relaxed">
              {generateShareText('generic')}
            </div>
          </div>

          {/* Share Buttons */}
          <div className="space-y-3">
            {/* Native Share (if supported) */}
            {navigator.share && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={shareNative}
                className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-lg font-semibold transition-all"
              >
                <span className="text-xl">📤</span>
                Share
              </motion.button>
            )}

            {/* Social Media Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={shareToTwitter}
                className="flex items-center gap-2 p-3 bg-blue-500 hover:bg-blue-600 rounded-lg font-semibold transition-colors"
              >
                <span className="text-lg">🐦</span>
                Twitter
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={shareToFacebook}
                className="flex items-center gap-2 p-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
              >
                <span className="text-lg">📘</span>
                Facebook
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={shareToReddit}
                className="flex items-center gap-2 p-3 bg-orange-600 hover:bg-orange-700 rounded-lg font-semibold transition-colors"
              >
                <span className="text-lg">🔴</span>
                Reddit
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={copyToClipboard}
                className={`flex items-center gap-2 p-3 rounded-lg font-semibold transition-all ${
                  copied 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-600 hover:bg-gray-700'
                }`}
              >
                <span className="text-lg">{copied ? '✅' : '📋'}</span>
                {copied ? 'Copied!' : 'Copy'}
              </motion.button>
            </div>
          </div>

          {/* Tips */}
          <div className="mt-6 text-center text-xs text-gray-500">
            💡 Sharing your scores helps challenge friends and grow the Brain Flip community!
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}