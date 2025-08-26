'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateInstruction } from '@/utils/gameLogic';
import { Instruction } from '@/types/game';
import { getAnswers } from '@/utils/gameLogic';
import { useAudio } from '@/hooks/useAudio';

export default function DemoMode() {
  const [currentInstruction, setCurrentInstruction] = useState<Instruction | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [isProcessingAnswer, setIsProcessingAnswer] = useState(false);
  const [showParticles, setShowParticles] = useState<'correct' | 'incorrect' | null>(null);
  const [instructionCount, setInstructionCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [selectedInstructionTypes, setSelectedInstructionTypes] = useState<string[]>([
    'direction', 'color', 'action', 'combo'
  ]);

  const { playCorrect, playIncorrect } = useAudio();

  useEffect(() => {
    generateNewInstruction();
  }, []);

  const generateNewInstruction = () => {
    const newInstruction = generateInstruction(selectedInstructionTypes);
    setCurrentInstruction(newInstruction);
    setSelectedAnswer('');
    setShowExplanation(false);
    setShowParticles(null);
  };

  const handleAnswer = (answer: string) => {
    if (isProcessingAnswer || !currentInstruction) return;

    setIsProcessingAnswer(true);
    setSelectedAnswer(answer);

    const isCorrect = (currentInstruction.acceptableAnswers as string[]).includes(answer);

    if (isCorrect) {
      playCorrect();
      setShowParticles('correct');
      setCorrectCount(prev => prev + 1);
    } else {
      playIncorrect();
      setShowParticles('incorrect');
      setIncorrectCount(prev => prev + 1);
    }

    setInstructionCount(prev => prev + 1);
    setShowExplanation(true);

    setTimeout(() => {
      setIsProcessingAnswer(false);
      setShowParticles(null);
    }, 1000);
  };

  const handleNext = () => {
    generateNewInstruction();
  };

  const toggleInstructionType = (type: string) => {
    setSelectedInstructionTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const getAccuracy = () => {
    if (instructionCount === 0) return 0;
    return Math.round((correctCount / instructionCount) * 100);
  };

  const getExplanation = () => {
    if (!currentInstruction) return '';
    
    switch (currentInstruction.type) {
      case 'direction':
        return `You see "${currentInstruction.display}" which means ${currentInstruction.display.split(' ').pop()}. The opposite of ${currentInstruction.display.split(' ').pop()} is ${currentInstruction.acceptableAnswers[0]?.split(' ').pop()}.`;
      
      case 'color':
        return `You see "${currentInstruction.display}" displayed in ${currentInstruction.displayColor}. You must choose any color EXCEPT "${currentInstruction.display}" and "${currentInstruction.displayColor}".`;
      
      case 'action':
        return `You see "${currentInstruction.display}". The opposite action is ${currentInstruction.acceptableAnswers[0]}.`;
      
      case 'combo':
        return `You see "${currentInstruction.display}" displayed in ${currentInstruction.displayColor}. Avoid both the word color ("${currentInstruction.display.split(' ')[0]}") and display color ("${currentInstruction.displayColor}"). Any direction is acceptable.`;
      
      default:
        return 'Think opposite! Always do the opposite of what you see.';
    }
  };

  if (!currentInstruction) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🧠</div>
          <div className="text-2xl text-white">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            🎓 Learn Mode
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Practice without pressure! No timer, no scoring - just pure learning and skill development.
          </p>
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4 mb-6"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-400">{instructionCount}</div>
              <div className="text-sm text-gray-400">Total Questions</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400">{correctCount}</div>
              <div className="text-sm text-gray-400">Correct</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-400">{incorrectCount}</div>
              <div className="text-sm text-gray-400">Incorrect</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-400">{getAccuracy()}%</div>
              <div className="text-sm text-gray-400">Accuracy</div>
            </div>
          </div>
        </motion.div>

        {/* Instruction Type Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-4 mb-6"
        >
          <h3 className="text-lg font-bold text-purple-400 mb-4">Practice These Types:</h3>
          <div className="flex flex-wrap gap-3">
            {['direction', 'color', 'action', 'combo'].map((type) => (
              <button
                key={type}
                onClick={() => toggleInstructionType(type)}
                className={`px-4 py-2 rounded-lg border-2 transition-all duration-200 ${
                  selectedInstructionTypes.includes(type)
                    ? 'border-purple-500 bg-purple-500/20 text-white'
                    : 'border-gray-600 bg-gray-800 text-gray-400 hover:border-gray-500'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Main Game Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Tips */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card p-4"
            >
              <h3 className="text-lg font-bold text-green-400 mb-4">💡 Learning Tips</h3>
              <div className="space-y-3 text-sm text-gray-300">
                <div className="p-3 bg-green-500/10 rounded border border-green-500/20">
                  <div className="font-medium text-green-400 mb-1">Direction Instructions</div>
                  <div>Always think opposite! UP becomes DOWN, LEFT becomes RIGHT.</div>
                </div>
                
                <div className="p-3 bg-blue-500/10 rounded border border-blue-500/20">
                  <div className="font-medium text-blue-400 mb-1">Color Instructions</div>
                  <div>Avoid both the word color AND the display color.</div>
                </div>
                
                <div className="p-3 bg-purple-500/10 rounded border border-purple-500/20">
                  <div className="font-medium text-purple-400 mb-1">Action Instructions</div>
                  <div>TAP becomes HOLD, HOLD becomes TAP.</div>
                </div>
                
                <div className="p-3 bg-yellow-500/10 rounded border border-yellow-500/20">
                  <div className="font-medium text-yellow-400 mb-1">Combo Instructions</div>
                  <div>Combine opposite color + any direction (avoid forbidden colors).</div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Center - Game */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-8 text-center"
            >
              {/* Current Instruction */}
              <motion.div
                key={currentInstruction.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-8"
              >
                <div className="text-4xl font-bold text-white mb-4">
                  {currentInstruction.display}
                </div>
                <div className="text-lg text-gray-300">
                  {currentInstruction.type === 'color' && (
                    <span>Displayed in: <span className="text-blue-400">{currentInstruction.displayColor}</span></span>
                  )}
                </div>
                <div className="text-sm text-gray-400 mt-2">
                  Type: {currentInstruction.type.charAt(0).toUpperCase() + currentInstruction.type.slice(1)}
                </div>
              </motion.div>

              {/* Answer Buttons */}
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-6">
                {getAnswers(currentInstruction).map((answer, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handleAnswer(answer)}
                    disabled={isProcessingAnswer}
                    className={`p-4 text-lg font-medium rounded-lg border-2 transition-all duration-200 ${
                      selectedAnswer === answer
                        ? (currentInstruction.acceptableAnswers as string[]).includes(answer)
                          ? 'border-green-500 bg-green-500/20 text-white'
                          : 'border-red-500 bg-red-500/20 text-white'
                        : 'border-gray-600 bg-gray-800 hover:border-purple-400 hover:bg-gray-700 text-gray-200'
                    } ${isProcessingAnswer ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {answer}
                  </motion.button>
                ))}
              </div>

              {/* Explanation */}
              <AnimatePresence>
                {showExplanation && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 mb-6"
                  >
                    <h4 className="text-lg font-bold text-purple-400 mb-2">Explanation</h4>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {getExplanation()}
                    </p>
                    <div className="mt-3 text-sm text-gray-400">
                      <strong>Correct answers:</strong> {currentInstruction.acceptableAnswers.join(', ')}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Next Button */}
              {showExplanation && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={handleNext}
                  className="btn-primary px-8 py-3 text-lg"
                >
                  Next Question →
                </motion.button>
              )}

              {/* Particles */}
              <AnimatePresence>
                {showParticles && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.5 }}
                    className="absolute inset-0 pointer-events-none flex items-center justify-center"
                  >
                    <div className={`text-8xl ${
                      showParticles === 'correct' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {showParticles === 'correct' ? '✓' : '✗'}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-8"
        >
          <button
            onClick={() => window.history.back()}
            className="btn-secondary px-6 py-3"
          >
            ← Back to Menu
          </button>
        </motion.div>
      </div>
    </div>
  );
}
