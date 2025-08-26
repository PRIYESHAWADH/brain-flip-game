'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface HowToPlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HowToPlay({ isOpen, onClose }: HowToPlayProps) {
  if (!isOpen) return null;

    {
      type: 'Direction',
      description: 'Swipe in the OPPOSITE direction shown',
      examples: [
        { display: 'SWIPE UP', correct: 'Swipe DOWN', explanation: 'Opposite of UP is DOWN' },
        { display: 'SWIPE LEFT', correct: 'Swipe RIGHT', explanation: 'Opposite of LEFT is RIGHT' },
        { display: 'SWIPE DOWN', correct: 'Swipe UP', explanation: 'Opposite of DOWN is UP' },
        { display: 'SWIPE RIGHT', correct: 'Swipe LEFT', explanation: 'Opposite of RIGHT is LEFT' },
      ],
      icon: '⬆️',
      color: 'text-blue-400'
    },
    {
      type: 'Color',
      description: 'Choose any color EXCEPT the word color and display color',
      examples: [
        { display: 'RED (in blue text)', correct: 'Choose GREEN or YELLOW', explanation: 'Avoid RED and BLUE' },
        { display: 'BLUE (in red text)', correct: 'Choose GREEN or YELLOW', explanation: 'Avoid BLUE and RED' },
        { display: 'GREEN (in green text)', correct: 'Choose RED, BLUE, or YELLOW', explanation: 'Avoid GREEN (both word and color)' },
        { display: 'YELLOW (in yellow text)', correct: 'Choose RED, BLUE, or GREEN', explanation: 'Avoid YELLOW (both word and color)' },
      ],
      icon: '🎨',
      color: 'text-purple-400'
    },
    {
      type: 'Action',
      description: 'Perform the OPPOSITE action shown',
      examples: [
        { display: 'TAP', correct: 'HOLD', explanation: 'Opposite of TAP is HOLD' },
        { display: 'HOLD', correct: 'TAP', explanation: 'Opposite of HOLD is TAP' },
        { display: 'SWIPE', correct: 'TAP', explanation: 'Opposite of SWIPE is TAP' },
        { display: 'TAP', correct: 'HOLD', explanation: 'Opposite of TAP is HOLD' },
      ],
      icon: '👆',
      color: 'text-green-400'
    },
    {
      type: 'Combo',
      description: 'Combine OPPOSITE color AND OPPOSITE direction',
      examples: [
        { display: 'RED UP', correct: 'GREEN DOWN', explanation: 'RED→GREEN, UP→DOWN' },
        { display: 'BLUE LEFT', correct: 'YELLOW RIGHT', explanation: 'BLUE→YELLOW, LEFT→RIGHT' },
        { display: 'GREEN DOWN', correct: 'RED UP', explanation: 'GREEN→RED, DOWN→UP' },
        { display: 'YELLOW RIGHT', correct: 'BLUE LEFT', explanation: 'YELLOW→BLUE, RIGHT→LEFT' },
      ],
      icon: '⚡',
      color: 'text-yellow-400'
    }
  ];

    '🎯 Focus on the instruction, not the display color',
    '⚡ Faster reactions earn bonus points',
    '🔥 Build streaks for exponential scoring',
    '💎 Perfect rounds (under 300ms) give extra rewards',
    '🎲 Random multipliers can boost your score',
    '🌟 Golden moments provide massive bonuses',
    '⏱️ Fixed 3 seconds per question — fair and predictable',
    '🎮 All instruction types are available from the start',
    '🧠 Think OPPOSITE - that\'s the key!',
    '⚡ Speed matters - but accuracy first!',
    '😵‍💫 Expect the unexpected - layouts can be confusing!',
    '🎭 Mixed challenges keep you guessing!',
    '🚀 Maximum thrill from the very beginning!'
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-900/95 border border-purple-500/30 rounded-2xl p-6 max-w-5xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            How to Play
          </h2>
          <p className="text-gray-400 text-lg">
            Master the art of cognitive flexibility and lightning-fast reactions
          </p>
        </div>

        {/* Instruction Types */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {instructionTypes.map((instruction, index) => (
            <motion.div
              key={instruction.type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-800/50 border border-gray-700 rounded-xl p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{instruction.icon}</span>
                <div>
                  <h3 className={`text-2xl font-bold ${instruction.color}`}>
                    {instruction.type}
                  </h3>
                </div>
              </div>
              
              <p className="text-gray-300 mb-4 text-sm">
                {instruction.description}
              </p>
              
              <div className="space-y-3">
                {instruction.examples.map((example, idx) => (
                  <div key={idx} className="bg-gray-700/50 rounded-lg p-3">
                    <div className="text-sm text-gray-400 mb-1">Example {idx + 1}:</div>
                    <div className="font-mono text-white mb-1 text-lg">{example.display}</div>
                    <div className="text-sm text-green-400 font-semibold">→ {example.correct}</div>
                    <div className="text-xs text-gray-500 mt-1">{example.explanation}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Difficulty Progression removed: no levels in simplified gameplay */}

        {/* Tips Section */}
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-6 mb-6">
          <h3 className="text-2xl font-bold text-purple-400 mb-4 flex items-center gap-2">
            💡 Pro Tips
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {tips.map((tip, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-2 text-gray-300"
              >
                <span className="text-lg">{tip}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Key Rules */}
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 mb-6">
          <h3 className="text-2xl font-bold text-green-400 mb-4 flex items-center gap-2">
            🎯 Key Rules
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-2xl">1️⃣</span>
              <div>
                <div className="font-semibold text-green-300">Think OPPOSITE</div>
                <div className="text-sm text-gray-300">Every instruction requires the opposite action</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">2️⃣</span>
              <div>
                <div className="font-semibold text-green-300">Speed + Accuracy</div>
                <div className="text-sm text-gray-300">Faster reactions = higher scores, but accuracy is crucial</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">3️⃣</span>
              <div>
                <div className="font-semibold text-green-300">Build Streaks</div>
                <div className="text-sm text-gray-300">Consecutive correct answers multiply your score</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">4️⃣</span>
              <div>
                <div className="font-semibold text-green-300">Watch the Timer</div>
                <div className="text-sm text-gray-300">Time runs out quickly - stay focused!</div>
              </div>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <div className="text-center">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
          >
            Got it! Let's Play
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
