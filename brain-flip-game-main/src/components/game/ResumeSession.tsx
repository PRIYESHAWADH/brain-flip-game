'use client';

import React from 'react';

interface ResumeSessionProps {
  onResume: () => void;
  onNewGame: () => void;
}

export default function ResumeSession({ onResume, onNewGame }: ResumeSessionProps) {
  return (
    <div className="bg-gray-900/95 border border-purple-500/30 rounded-2xl p-6 max-w-md w-full">
      <h2 className="text-2xl font-bold mb-6 text-center">Resume Session?</h2>
      <p className="text-gray-300 mb-6 text-center">
        You have an active game session. Would you like to resume or start a new game?
      </p>
      <div className="flex gap-3">
        <button
          onClick={onResume}
          className="flex-1 py-3 px-4 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors"
        >
          Resume Game
        </button>
        <button
          onClick={onNewGame}
          className="flex-1 py-3 px-4 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors"
        >
          New Game
        </button>
      </div>
    </div>
  );
}
