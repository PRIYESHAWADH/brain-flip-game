'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSettingsStore } from '@/store/settingsStore';

interface AccessibilitySettings {
  screenReaderEnabled: boolean;
  keyboardNavigationEnabled: boolean;
  highContrastMode: boolean;
  reducedMotion: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  focusIndicatorStyle: 'default' | 'high-contrast' | 'thick';
  announceGameEvents: boolean;
  skipAnimations: boolean;
}

interface AccessibilityContextValue extends AccessibilitySettings {
  updateAccessibilitySettings: (settings: Partial<AccessibilitySettings>) => void;
  announceToScreenReader: (message: string, priority?: 'polite' | 'assertive') => void;
  isAccessibilityMode: boolean;
}

const AccessibilityContext = createContext<AccessibilityContextValue | null>(null);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useSettingsStore();
  
  const [settings, setSettings] = useState<AccessibilitySettings>({
    screenReaderEnabled: false,
    keyboardNavigationEnabled: true,
    highContrastMode: theme === 'high-contrast',
    reducedMotion: theme === 'reduced-motion',
    fontSize: 'medium',
    focusIndicatorStyle: 'default',
    announceGameEvents: true,
    skipAnimations: false,
  });

  // Detect system preferences
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQueries = {
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)'),
      highContrast: window.matchMedia('(prefers-contrast: high)'),
      screenReader: window.matchMedia('(prefers-reduced-motion: reduce)'), // Proxy for screen reader
    };

    const updateFromSystemPreferences = () => {
      setSettings(prev => ({
        ...prev,
        reducedMotion: mediaQueries.reducedMotion.matches,
        highContrastMode: mediaQueries.highContrast.matches || prev.highContrastMode,
        screenReaderEnabled: mediaQueries.screenReader.matches || prev.screenReaderEnabled,
      }));
    };

    updateFromSystemPreferences();

    Object.values(mediaQueries).forEach(mq => 
      mq.addEventListener('change', updateFromSystemPreferences)
    );

    return () => {
      Object.values(mediaQueries).forEach(mq => 
        mq.removeEventListener('change', updateFromSystemPreferences)
      );
    };
  }, []);

  // Apply accessibility settings to document
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    
    // Font size
    root.style.setProperty('--accessibility-font-scale', {
      small: '0.875',
      medium: '1',
      large: '1.125',
      'extra-large': '1.25'
    }[settings.fontSize]);

    // High contrast mode
    if (settings.highContrastMode) {
      root.classList.add('accessibility-high-contrast');
    } else {
      root.classList.remove('accessibility-high-contrast');
    }

    // Reduced motion
    if (settings.reducedMotion || settings.skipAnimations) {
      root.classList.add('accessibility-reduced-motion');
    } else {
      root.classList.remove('accessibility-reduced-motion');
    }

    // Focus indicator style
    root.setAttribute('data-focus-style', settings.focusIndicatorStyle);

    // Keyboard navigation
    if (settings.keyboardNavigationEnabled) {
      root.classList.add('accessibility-keyboard-nav');
    } else {
      root.classList.remove('accessibility-keyboard-nav');
    }
  }, [settings]);

  const updateAccessibilitySettings = (newSettings: Partial<AccessibilitySettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!settings.screenReaderEnabled || !settings.announceGameEvents) return;

    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  };

  const isAccessibilityMode = settings.screenReaderEnabled || 
                             settings.highContrastMode || 
                             settings.reducedMotion ||
                             settings.fontSize !== 'medium';

  const contextValue: AccessibilityContextValue = {
    ...settings,
    updateAccessibilitySettings,
    announceToScreenReader,
    isAccessibilityMode,
  };

  return (
    <AccessibilityContext.Provider value={contextValue}>
      {children}
      {/* Screen reader announcements container */}
      <div id="accessibility-announcements" className="sr-only" aria-live="polite" aria-atomic="true" />
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
}