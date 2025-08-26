'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { useAccessibility } from './AccessibilityProvider';

interface KeyboardNavigationProps {
  children: React.ReactNode;
  trapFocus?: boolean;
  autoFocus?: boolean;
  onEscape?: () => void;
}

export function KeyboardNavigation({ 
  children, 
  trapFocus = false, 
  autoFocus = false,
  onEscape 
}: KeyboardNavigationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { keyboardNavigationEnabled, announceToScreenReader } = useAccessibility();

  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return [];
    
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[role="button"]:not([disabled])',
      '[role="link"]',
      '[role="menuitem"]',
      '[role="option"]',
    ].join(', ');

    return Array.from(containerRef.current.querySelectorAll(focusableSelectors)) as HTMLElement[];
  }, []);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!keyboardNavigationEnabled) return;

    const focusableElements = getFocusableElements();
    const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement);

    switch (event.key) {
      case 'Escape':
        if (onEscape) {
          event.preventDefault();
          onEscape();
        }
        break;

      case 'Tab':
        if (trapFocus && focusableElements.length > 0) {
          event.preventDefault();
          
          let nextIndex;
          if (event.shiftKey) {
            nextIndex = currentIndex <= 0 ? focusableElements.length - 1 : currentIndex - 1;
          } else {
            nextIndex = currentIndex >= focusableElements.length - 1 ? 0 : currentIndex + 1;
          }
          
          focusableElements[nextIndex]?.focus();
        }
        break;

      case 'ArrowDown':
      case 'ArrowUp':
        // Navigate through focusable elements with arrow keys
        if (focusableElements.length > 1) {
          event.preventDefault();
          
          let nextIndex;
          if (event.key === 'ArrowDown') {
            nextIndex = currentIndex >= focusableElements.length - 1 ? 0 : currentIndex + 1;
          } else {
            nextIndex = currentIndex <= 0 ? focusableElements.length - 1 : currentIndex - 1;
          }
          
          focusableElements[nextIndex]?.focus();
          announceToScreenReader(`Focused on ${focusableElements[nextIndex]?.textContent || 'element'}`);
        }
        break;

      case 'Home':
        if (focusableElements.length > 0) {
          event.preventDefault();
          focusableElements[0]?.focus();
          announceToScreenReader('Moved to first element');
        }
        break;

      case 'End':
        if (focusableElements.length > 0) {
          event.preventDefault();
          focusableElements[focusableElements.length - 1]?.focus();
          announceToScreenReader('Moved to last element');
        }
        break;
    }
  }, [keyboardNavigationEnabled, trapFocus, onEscape, getFocusableElements, announceToScreenReader]);

  useEffect(() => {
    if (!keyboardNavigationEnabled) return;

    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('keydown', handleKeyDown);
    
    // Auto focus first element if requested
    if (autoFocus) {
      const focusableElements = getFocusableElements();
      if (focusableElements.length > 0) {
        setTimeout(() => focusableElements[0]?.focus(), 100);
      }
    }

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [keyboardNavigationEnabled, autoFocus, handleKeyDown, getFocusableElements]);

  return (
    <div 
      ref={containerRef}
      className="keyboard-navigation-container"
      role="region"
      aria-label="Keyboard navigable area"
    >
      {children}
    </div>
  );
}

// Hook for game-specific keyboard controls
export function useGameKeyboardControls(onAnswer: (answer: string) => void, enabled: boolean = true) {
  const { keyboardNavigationEnabled, announceToScreenReader } = useAccessibility();

  useEffect(() => {
    if (!keyboardNavigationEnabled || !enabled) return;

    const handleGameKeyDown = (event: KeyboardEvent) => {
      // Prevent default browser behavior for game keys
      const gameKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'Enter'];
      if (gameKeys.includes(event.code)) {
        event.preventDefault();
      }

      let answer: string | null = null;

      switch (event.code) {
        // Direction controls
        case 'ArrowUp':
        case 'KeyW':
          answer = 'UP';
          break;
        case 'ArrowDown':
        case 'KeyS':
          answer = 'DOWN';
          break;
        case 'ArrowLeft':
        case 'KeyA':
          answer = 'LEFT';
          break;
        case 'ArrowRight':
        case 'KeyD':
          answer = 'RIGHT';
          break;

        // Color controls
        case 'KeyR':
          answer = 'RED';
          break;
        case 'KeyG':
          answer = 'GREEN';
          break;
        case 'KeyB':
          answer = 'BLUE';
          break;
        case 'KeyY':
          answer = 'YELLOW';
          break;

        // Action controls
        case 'Space':
          answer = 'TAP';
          break;
        case 'Enter':
          answer = 'HOLD';
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          answer = 'SWIPE';
          break;

        // Number keys for quick selection
        case 'Digit1':
          answer = 'UP';
          break;
        case 'Digit2':
          answer = 'DOWN';
          break;
        case 'Digit3':
          answer = 'LEFT';
          break;
        case 'Digit4':
          answer = 'RIGHT';
          break;
      }

      if (answer) {
        announceToScreenReader(`Selected ${answer}`);
        onAnswer(answer);
      }
    };

    document.addEventListener('keydown', handleGameKeyDown);
    return () => document.removeEventListener('keydown', handleGameKeyDown);
  }, [keyboardNavigationEnabled, enabled, onAnswer, announceToScreenReader]);
}

// Keyboard shortcuts help component
export function KeyboardShortcutsHelp() {
  const shortcuts = [
    { key: 'Arrow Keys / WASD', action: 'Navigate directions' },
    { key: 'R, G, B, Y', action: 'Select colors (Red, Green, Blue, Yellow)' },
    { key: 'Space', action: 'Tap action' },
    { key: 'Enter', action: 'Hold action' },
    { key: 'Shift', action: 'Swipe action' },
    { key: '1, 2, 3, 4', action: 'Quick direction selection' },
    { key: 'Tab', action: 'Navigate between elements' },
    { key: 'Escape', action: 'Close dialogs/menus' },
    { key: 'Home/End', action: 'Jump to first/last element' },
  ];

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-white mb-3">Keyboard Shortcuts</h3>
      <div className="space-y-2">
        {shortcuts.map((shortcut, index) => (
          <div key={index} className="flex justify-between items-center text-sm">
            <kbd className="px-2 py-1 bg-gray-700 rounded text-gray-300 font-mono">
              {shortcut.key}
            </kbd>
            <span className="text-gray-400">{shortcut.action}</span>
          </div>
        ))}
      </div>
    </div>
  );
}