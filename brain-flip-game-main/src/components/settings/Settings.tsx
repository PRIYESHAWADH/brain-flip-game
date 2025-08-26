'use client';

import React, { useEffect } from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import { AVAILABLE_THEMES } from '@/hooks/useTheme';

export default function Settings() {
  const {
    soundEnabled,
    musicEnabled,
    vibrationEnabled,
    showHints,
    difficulty,
    theme,
    setSoundEnabled,
    setMusicEnabled,
    setVibrationEnabled,
    setShowHints,
    setDifficulty,
    setTheme,
    resetSettings,
  } = useSettingsStore();

  // Direct theme application
  useEffect(() => {
      if (typeof document === 'undefined') return;

      // Remove all existing theme classes
      document.documentElement.classList.remove(
        'theme-dark',
        'theme-light',
        'theme-high-contrast',
        'theme-reduced-motion'
      );

      // Add the current theme class
      document.documentElement.classList.add(`theme-${themeName}`);
      
      // Set data attribute for CSS targeting
      document.documentElement.setAttribute('data-theme', themeName);
    };

    // Handle auto theme
      if (theme === 'auto') {

        if (prefersReducedMotion) {
          applyTheme('reduced-motion');
        } else if (prefersHighContrast) {
          applyTheme('high-contrast');
        } else {
          applyTheme(prefersDark ? 'dark' : 'light');
        }
      } else {
        applyTheme(theme);
      }
    };

    // Apply theme immediately
    handleAutoTheme();
  }, [theme]);
    enabled: boolean;
    onToggle: () => void;
    label: string;
    description: string;
  }) => (
    <div className="flex items-center justify-between p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
      <div>
        <h4 className="font-medium text-white">{label}</h4>
        <p className="text-sm text-gray-400">{description}</p>
      </div>
      <button
        onClick={onToggle}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          enabled ? 'bg-purple-600' : 'bg-gray-600'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
    if (confirm('Are you sure you want to reset all game data? This cannot be undone.')) {
      try {
        // Clear all Brain Flip related localStorage items
        keys.forEach(key => {
          if (key.startsWith('bf_') || key.includes('brain-flip')) {
            localStorage.removeItem(key);
          }
        });
        
        // Reset settings
        resetSettings();
        
        // Reload the page to reset all stores
        window.location.reload();
      } catch (error) {
        console.error('Error resetting data:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
          Settings
        </h2>
        <p className="text-gray-400">Customize your gaming experience</p>
      </div>

      {/* Audio Settings */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white">Audio</h3>
        
        <ToggleSwitch
          enabled={soundEnabled}
          onToggle={() => setSoundEnabled(!soundEnabled)}
          label="Sound Effects"
          description="Play sound effects for correct/incorrect answers"
        />
        
        <ToggleSwitch
          enabled={musicEnabled}
          onToggle={() => setMusicEnabled(!musicEnabled)}
          label="Background Music"
          description="Play ambient background music during gameplay"
        />
      </div>

      {/* Gameplay Settings */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white">Gameplay</h3>
        
        <ToggleSwitch
          enabled={vibrationEnabled}
          onToggle={() => setVibrationEnabled(!vibrationEnabled)}
          label="Vibration"
          description="Vibrate on mobile devices for feedback"
        />
        
        <ToggleSwitch
          enabled={showHints}
          onToggle={() => setShowHints(!showHints)}
          label="Show Hints"
          description="Display helpful hints during gameplay"
        />

        {/* Difficulty Setting */}
        <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
          <div className="mb-3">
            <h4 className="font-medium text-white">Difficulty Level</h4>
            <p className="text-sm text-gray-400">Adjust the overall game difficulty</p>
          </div>
          <div className="flex gap-2">
            {(['easy', 'normal', 'hard'] as const).map((level) => (
              <button
                key={level}
                onClick={() => setDifficulty(level)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                  difficulty === level
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
          <div className="mt-2 text-xs text-gray-400">
            {difficulty === 'easy' && 'More time, easier scoring'}
            {difficulty === 'normal' && 'Balanced gameplay'}
            {difficulty === 'hard' && 'Less time, higher scoring potential'}
          </div>
        </div>
      </div>

      {/* Appearance Settings */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white">Appearance</h3>
        
        <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
          <div className="mb-3">
            <h4 className="font-medium text-white">Theme</h4>
            <p className="text-sm text-gray-400">Choose your preferred color scheme</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {AVAILABLE_THEMES.map((themeOption) => (
              <button
                key={themeOption.name}
                onClick={() => setTheme(themeOption.name as any)}
                className={`p-3 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  theme === themeOption.name
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <span className="text-lg">{themeOption.icon}</span>
                <span>{themeOption.displayName}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white">Data</h3>
        
        <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
          <div className="mb-4">
            <h4 className="font-medium text-white">Reset Game Data</h4>
            <p className="text-sm text-gray-400">Clear all progress, achievements, and settings</p>
          </div>
          <button
            onClick={handleResetData}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Reset All Data
          </button>
        </div>
      </div>

      {/* About */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <h4 className="font-semibold text-blue-300 mb-2">About Brain Flip</h4>
        <p className="text-sm text-gray-300 mb-2">
          Version 1.0.0 - A cognitive training game that challenges your reaction time and mental flexibility.
        </p>
        <p className="text-xs text-gray-400">
          Settings are automatically saved and applied to your game.
        </p>
      </div>
    </div>
  );
}