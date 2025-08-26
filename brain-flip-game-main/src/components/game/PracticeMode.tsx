"use client";
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { useState, useEffect } from 'react';

interface PracticeModeProps {
  currentInstruction: any;
  onClose?: () => void;
}

export default function PracticeMode({ currentInstruction, onClose }: PracticeModeProps) {
  const { practiceMode, flowStateAnalysis, togglePracticeMode } = useGameStore();
  const [showHints, setShowHints] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  // Auto-show hints in practice mode after 2 seconds
  useEffect(() => {
    if (practiceMode && currentInstruction) {
      const timer = setTimeout(() => setShowHints(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [practiceMode, currentInstruction]);

  if (!practiceMode) return null;

  const getInstructionHint = () => {
    if (!currentInstruction) return '';
    
    switch (currentInstruction.type) {
      case 'direction':
        return `💡 Hint: Do the OPPOSITE of "${currentInstruction.display}". If it says UP, choose DOWN!`;
      case 'color':
        return `💡 Hint: Choose any color EXCEPT "${currentInstruction.color}" and the display color!`;
      case 'action':
        return `💡 Hint: Do the OPPOSITE action. If it says TAP, choose HOLD!`;
      case 'combo':
        return `💡 Hint: Choose the OPPOSITE color AND OPPOSITE direction!`;
      default:
        return '💡 Hint: Remember to do the OPPOSITE of what the instruction says!';
    }
  };

  const getDetailedExplanation = () => {
    if (!currentInstruction) return '';
    
    switch (currentInstruction.type) {
      case 'direction':
        return `
          📚 Direction Instructions:
          • UP ↔ DOWN
          • LEFT ↔ RIGHT
          • Always choose the opposite direction!
        `;
      case 'color':
        return `
          📚 Color Instructions:
          • Avoid the word color: ${currentInstruction.color}
          • Avoid the display color: ${currentInstruction.displayColor}
          • Choose any other color!
        `;
      case 'action':
        return `
          📚 Action Instructions:
          • TAP ↔ HOLD
          • SWIPE ↔ TAP
          • Do the opposite action!
        `;
      case 'combo':
        return `
          📚 Combo Instructions:
          • Opposite color: ${currentInstruction.color} → ?
          • Opposite direction: ${currentInstruction.direction} → ?
          • Combine both opposites!
        `;
      default:
        return '📚 Remember: Brain Flip is about doing the OPPOSITE!';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-4 left-4 right-4 z-50 pointer-events-none"
      >
        <div className="max-w-md mx-auto">
          {/* Practice Mode Indicator */}
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="glass-card p-4 mb-4 border-2 border-green-500/50 pointer-events-auto"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-green-400 text-xl">🎯</span>
                <span className="text-green-400 font-bold">Practice Mode</span>
              </div>
              <button
                onClick={togglePracticeMode}
                className="text-gray-400 hover:text-white text-sm px-2 py-1 rounded"
              >
                Exit
              </button>
            </div>
            
            {/* Flow State Feedback */}
            {flowStateAnalysis && (
              <div className="text-sm text-gray-300 mb-2">
                Flow Score: {Math.round(flowStateAnalysis.flowScore)}/100
                {flowStateAnalysis.isInFlowState && (
                  <span className="text-purple-400 ml-2">🧠 In Flow!</span>
                )}
              </div>
            )}
            
            <div className="text-sm text-gray-400">
              Take your time • Extra hints available • No pressure!
            </div>
          </motion.div>

          {/* Hints Panel */}
          <AnimatePresence>
            {showHints && currentInstruction && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="glass-card p-4 mb-4 border border-yellow-500/30 pointer-events-auto"
              >
                <div className="text-yellow-400 text-sm mb-2">
                  {getInstructionHint()}
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowExplanation(!showExplanation)}
                    className="text-xs text-blue-400 hover:text-blue-300 underline"
                  >
                    {showExplanation ? 'Hide' : 'Show'} detailed explanation
                  </button>
                  <button
                    onClick={() => setShowHints(false)}
                    className="text-xs text-gray-400 hover:text-gray-300"
                  >
                    Hide hints
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Detailed Explanation */}
          <AnimatePresence>
            {showExplanation && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="glass-card p-4 border border-blue-500/30 pointer-events-auto"
              >
                <pre className="text-xs text-blue-300 whitespace-pre-wrap">
                  {getDetailedExplanation()}
                </pre>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Performance Recommendations */}
          {flowStateAnalysis && flowStateAnalysis.recommendations.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card p-3 mt-4 border border-purple-500/30 pointer-events-auto"
            >
              <div className="text-xs text-purple-300">
                <div className="font-semibold mb-1">💡 Tips:</div>
                {flowStateAnalysis.recommendations.map((rec, index) => (
                  <div key={index} className="mb-1">{rec}</div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}