/**
 * Theme management hook with system preference detection and persistence
 */

import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';

export type ThemeName = 'dark' | 'light' | 'high-contrast' | 'reduced-motion' | 'auto';

export interface ThemeConfig {
  name: ThemeName;
  displayName: string;
  description: string;
  icon: string;
}

export const AVAILABLE_THEMES: ThemeConfig[] = [
  {
    name: 'auto',
    displayName: 'Auto',
    description: 'Follow system preferences',
    icon: '🔄'
  },
  {
    name: 'dark',
    displayName: 'Dark',
    description: 'Dark theme with neon accents',
    icon: '🌙'
  },
  {
    name: 'light',
    displayName: 'Light',
    description: 'Light theme for bright environments',
    icon: '☀️'
  },
  {
    name: 'high-contrast',
    displayName: 'High Contrast',
    description: 'Maximum contrast for accessibility',
    icon: '🔳'
  },
  {
    name: 'reduced-motion',
    displayName: 'Reduced Motion',
    description: 'Minimal animations for motion sensitivity',
    icon: '🎯'
  }
];

/**
 * Get system theme preferences
 */
function getSystemPreferences() {
  if (typeof window === 'undefined') {
    return {
      colorScheme: 'dark' as const,
      contrast: 'normal' as const,
      reducedMotion: false
    };
  }

  return {
    colorScheme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' as const : 'light' as const,
    contrast: window.matchMedia('(prefers-contrast: high)').matches ? 'high' as const : 'normal' as const,
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
  };
}

/**
 * Resolve auto theme to actual theme based on system preferences
 */
function resolveAutoTheme(): Exclude<ThemeName, 'auto'> {
  if (prefs.reducedMotion) return 'reduced-motion';
  if (prefs.contrast === 'high') return 'high-contrast';
  return prefs.colorScheme;
}

/**
 * Apply theme to document
 */
function applyTheme(theme: ThemeName) {
  if (typeof document === 'undefined') return;
  
  // Add transition prevention class
  document.documentElement.setAttribute('data-theme-changing', 'true');
  
  // Apply theme
  document.documentElement.setAttribute('data-theme', resolvedTheme);
  
  // Remove transition prevention after a frame
  requestAnimationFrame(() => {
    document.documentElement.removeAttribute('data-theme-changing');
  });
}

/**
 * Get stored theme preference
 */
function getStoredTheme(): ThemeName {
  if (typeof localStorage === 'undefined') return 'auto';
  
  try {
    if (stored && AVAILABLE_THEMES.some(t => t.name === stored)) {
      return stored as ThemeName;
    }
  } catch (error) {
    console.warn('Failed to read theme from localStorage:', error);
  }
  
  return 'auto';
}

/**
 * Store theme preference
 */
function storeTheme(theme: ThemeName) {
  if (typeof localStorage === 'undefined') return;
  
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (error) {
    console.warn('Failed to store theme in localStorage:', error);
  }
}

/**
 * Theme management hook
 */
export function useTheme() {
  const [currentTheme, setCurrentTheme] = useState<ThemeName>('auto');
  const [resolvedTheme, setResolvedTheme] = useState<Exclude<ThemeName, 'auto'>>('dark');
  const [systemPreferences, setSystemPreferences] = useState(() => getSystemPreferences());

  // Initialize theme on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    setCurrentTheme(storedTheme);
    setResolvedTheme(resolved);
    applyTheme(storedTheme);
  }, []);

  // Listen for system preference changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
      window.matchMedia('(prefers-color-scheme: dark)'),
      window.matchMedia('(prefers-contrast: high)'),
      window.matchMedia('(prefers-reduced-motion: reduce)')
    ];
      setSystemPreferences(newPrefs);
      
      // If using auto theme, update resolved theme
      if (currentTheme === 'auto') {
        setResolvedTheme(newResolved);
        applyTheme('auto');
      }
    };

    mediaQueries.forEach(mq => mq.addEventListener('change', handleChange));

    return () => {
      mediaQueries.forEach(mq => mq.removeEventListener('change', handleChange));
    };
  }, [currentTheme]);

  // Change theme
    setCurrentTheme(theme);
    storeTheme(theme);
    setResolvedTheme(resolved);
    applyTheme(theme);
  }, []);

  // Toggle between dark and light
    setTheme(newTheme);
  }, [resolvedTheme, setTheme]);

  // Get theme config
    return AVAILABLE_THEMES.find(t => t.name === theme) || AVAILABLE_THEMES[0];
  }, []);

  // Check if theme is active
    if (theme === 'auto') return currentTheme === 'auto';
    return resolvedTheme === theme;
  }, [currentTheme, resolvedTheme]);

  // Get current theme info

  return {
    // Current state
    currentTheme,
    resolvedTheme,
    systemPreferences,
    
    // Theme configs
    currentThemeConfig,
    resolvedThemeConfig,
    availableThemes: AVAILABLE_THEMES,
    
    // Actions
    setTheme,
    toggleTheme,
    
    // Utilities
    getThemeConfig,
    isThemeActive,
    
    // Computed properties
    isDark: resolvedTheme === 'dark',
    isLight: resolvedTheme === 'light',
    isHighContrast: resolvedTheme === 'high-contrast',
    isReducedMotion: resolvedTheme === 'reduced-motion',
    isAuto: currentTheme === 'auto'
  };
}

/**
 * Theme provider context (optional, for complex apps)
 */
interface ThemeContextValue {
  currentTheme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  availableThemes: ThemeConfig[];
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { currentTheme, setTheme, availableThemes } = useTheme();
  
  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, availableThemes }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
}

/**
 * Utility hook for theme-aware styling
 */
export function useThemeStyles() {
  const { resolvedTheme, isDark, isLight, isHighContrast, isReducedMotion } = useTheme();
  
  return {
    resolvedTheme,
    isDark,
    isLight,
    isHighContrast,
    isReducedMotion,
    
    // CSS class helpers
    themeClass: `theme-${resolvedTheme}`,
    containerClass: `theme-${resolvedTheme} ${isHighContrast ? 'high-contrast' : ''} ${isReducedMotion ? 'reduced-motion' : ''}`.trim(),
    
    // Style object helpers
    getThemeStyles: (styles: Record<string, any>) => {
      return styles[resolvedTheme] || styles.default || {};
    }
  };
}