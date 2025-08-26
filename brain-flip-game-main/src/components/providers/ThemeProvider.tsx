'use client';

import React, { useEffect } from 'react';
import { useSettingsStore } from '@/store/settingsStore';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export default function ThemeProvider({ children }: ThemeProviderProps) {
  const { theme } = useSettingsStore();

  useEffect(() => {
    // Apply theme to document
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

    // Listen for system preference changes
      window.matchMedia('(prefers-color-scheme: dark)'),
      window.matchMedia('(prefers-reduced-motion: reduce)'),
      window.matchMedia('(prefers-contrast: high)')
    ];
      if (theme === 'auto') {
        handleAutoTheme();
      }
    };

    mediaQueries.forEach(query => {
      query.addEventListener('change', handleMediaChange);
    });

    // Cleanup
    return () => {
      mediaQueries.forEach(query => {
        query.removeEventListener('change', handleMediaChange);
      });
    };
  }, [theme]);

  return <>{children}</>;
}
