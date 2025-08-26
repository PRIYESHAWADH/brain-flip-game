import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface GameSettings {
  // Audio settings
  soundEnabled: boolean;
  musicEnabled: boolean;
  
  // Gameplay settings
  vibrationEnabled: boolean;
  showHints: boolean;
  difficulty: 'easy' | 'normal' | 'hard';
  
  // Appearance settings
  theme: 'dark' | 'light' | 'auto' | 'high-contrast' | 'reduced-motion';
  
  // Game difficulty multipliers
  timeMultiplier: number;
  scoreMultiplier: number;
}

interface SettingsStore extends GameSettings {
  // Actions
  setSoundEnabled: (enabled: boolean) => void;
  setMusicEnabled: (enabled: boolean) => void;
  setVibrationEnabled: (enabled: boolean) => void;
  setShowHints: (enabled: boolean) => void;
  setDifficulty: (difficulty: 'easy' | 'normal' | 'hard') => void;
  setTheme: (theme: 'dark' | 'light' | 'auto' | 'high-contrast' | 'reduced-motion') => void;
  resetSettings: () => void;
  
  // Computed values
  getTimeMultiplier: () => number;
  getScoreMultiplier: () => number;
}

const getDifficultyMultipliers = (difficulty: 'easy' | 'normal' | 'hard') => {
  switch (difficulty) {
    case 'easy':
      return { time: 1.5, score: 0.7 }; // More time, less score
    case 'normal':
      return { time: 1.0, score: 1.0 }; // Standard
    case 'hard':
      return { time: 0.7, score: 1.3 }; // Less time, more score
    default:
      return { time: 1.0, score: 1.0 };
  }
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      // Default settings
      soundEnabled: true,
      musicEnabled: true,
      vibrationEnabled: true,
      showHints: true,
      difficulty: 'normal',
      theme: 'dark',
      timeMultiplier: 1.0,
      scoreMultiplier: 1.0,

      // Actions
      setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
      setMusicEnabled: (enabled) => set({ musicEnabled: enabled }),
      setVibrationEnabled: (enabled) => set({ vibrationEnabled: enabled }),
      setShowHints: (enabled) => set({ showHints: enabled }),
      setDifficulty: (difficulty) => {
        const multipliers = getDifficultyMultipliers(difficulty);
        set({ 
          difficulty, 
          timeMultiplier: multipliers.time, 
          scoreMultiplier: multipliers.score 
        });
      },
      setTheme: (theme) => set({ theme }),
      
      resetSettings: () => {
        set({
          soundEnabled: true,
          musicEnabled: true,
          vibrationEnabled: true,
          showHints: true,
          difficulty: 'normal',
          theme: 'dark',
          timeMultiplier: 1.0,
          scoreMultiplier: 1.0,
        });
      },

      // Computed values
      getTimeMultiplier: () => {
        const { difficulty } = get();
        const multipliers = getDifficultyMultipliers(difficulty);
        return multipliers.time;
      },
      
      getScoreMultiplier: () => {
        const { difficulty } = get();
        const multipliers = getDifficultyMultipliers(difficulty);
        return multipliers.score;
      },
    }),
    {
      name: 'brain-flip-settings',
      version: 1,
    }
  )
);
