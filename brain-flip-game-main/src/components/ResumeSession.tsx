"use client";
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { useAnimation } from '@/hooks/useAnimation';
import Button from './ui/Button';

interface ResumeSessionProps {
  onResume: () => void;
  onNewGame: () => void;
  className?: string;
}

export default function ResumeSession({ onResume, onNewGame, className }: ResumeSessionProps) {
  const { score, level, streak, sessionStartTime } = useGameStore();
  const { prefersReducedMotion } = useAnimation();

  // Calculate session duration
    ? sessionDuration === 1 ? "1 minute ago" : `${sessionDuration} minutes ago`
    : "moments ago";

  return (
    <AnimatePresence>
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: prefersReducedMotion ? 0.01 : 0.3 }}
        className={`glass-card p-6 max-w-sm mx-auto ${className || ''}`}
        role="dialog"
        aria-labelledby="resume-title"
        aria-describedby="resume-description"
      >
        <div className="text-center mb-4">
          <div className="text-4xl mb-2">⏸️</div>
          <h3 id="resume-title" className="text-lg font-semibold mb-2">
            Resume Your Game?
          </h3>
          <p id="resume-description" className="text-sm text-gray-400">
            You left a game in progress {sessionText}
          </p>
        </div>

        <div className="bg-black/20 rounded-lg p-3 mb-4 space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span>Score:</span>
            <span className="font-mono text-cyan-400">{score.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span>Level:</span>
            <span className="font-mono text-emerald-400">{level}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span>Streak:</span>
            <span className="font-mono text-amber-400">{streak}</span>
          </div>
        </div>

        <div className="space-y-2">
          <Button 
            onClick={onResume}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
            size="lg"
            aria-describedby="resume-help"
          >
            Continue Playing
          </Button>
          <Button 
            onClick={onNewGame}
            variant="secondary"
            className="w-full"
            size="sm"
          >
            Start New Game
          </Button>
        </div>
        
        <p id="resume-help" className="text-xs text-gray-500 mt-2 text-center">
          Your progress is automatically saved
        </p>
      </motion.div>
    </AnimatePresence>
  );
}
