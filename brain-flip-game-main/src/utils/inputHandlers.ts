/**
 * Input handling utilities for consistent cross-platform input management
 */

import { InputDebouncer, MultiTouchGuard, DEFAULT_TIMING_CONFIG } from './timing';

export type InputMethod = 'mouse' | 'touch' | 'keyboard';
export type InputAction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | 'RED' | 'GREEN' | 'BLUE' | 'YELLOW' | 'TAP' | 'HOLD' | 'SWIPE' | string;

export interface InputEvent {
  action: InputAction;
  method: InputMethod;
  timestamp: number;
  originalEvent: Event;
}

export interface InputHandlerConfig {
  debounceWindow: number;
  maxTouches: number;
  enableKeyboard: boolean;
  preventDoubleSubmission: boolean;
}

/**
 * Comprehensive input handler for game interactions
 */
export class GameInputHandler {
  private debouncer: InputDebouncer;
  private touchGuard: MultiTouchGuard;
  private config: InputHandlerConfig;
  private onInputCallback?: (inputEvent: InputEvent) => void;
  private lastSubmittedAction?: string;
  private lastSubmissionTime: number = 0;

  constructor(config: Partial<InputHandlerConfig> = {}) {
    this.config = {
      debounceWindow: DEFAULT_TIMING_CONFIG.debounceWindow,
      maxTouches: DEFAULT_TIMING_CONFIG.maxTouches,
      enableKeyboard: DEFAULT_TIMING_CONFIG.enableKeyboard,
      preventDoubleSubmission: true,
      ...config,
    };

    this.debouncer = new InputDebouncer(this.config.debounceWindow);
    this.touchGuard = new MultiTouchGuard(this.config.maxTouches);
  }

  /**
   * Set the callback for input events
   */
  setInputCallback(callback: (inputEvent: InputEvent) => void): void {
    this.onInputCallback = callback;
  }

  /**
   * Handle button click (mouse or touch)
   */
  handleButtonClick(action: InputAction, event: MouseEvent | TouchEvent): void {
    if (!this.shouldAcceptInput(action)) return;

    const inputEvent: InputEvent = {
      action,
      method: event.type.startsWith('touch') ? 'touch' : 'mouse',
      timestamp: performance.now(),
      originalEvent: event,
    };

    this.processInput(inputEvent);
  }

  /**
   * Handle keyboard input
   */
  handleKeyboardInput(event: KeyboardEvent): void {
    if (!this.config.enableKeyboard) return;

    if (!action || !this.shouldAcceptInput(action)) return;

    // Prevent default browser behavior for game keys
    event.preventDefault();

    const inputEvent: InputEvent = {
      action,
      method: 'keyboard',
      timestamp: performance.now(),
      originalEvent: event,
    };

    this.processInput(inputEvent);
  }

  /**
   * Handle touch events with multi-touch protection
   */
  handleTouchStart(event: TouchEvent): void {

    if (!touch) return;

    if (!this.touchGuard.touchStart(touchId)) {
      event.preventDefault(); // Prevent additional touches
      return;
    }

    // Touch handling will be completed in handleButtonClick
  }

  /**
   * Handle touch end events
   */
  handleTouchEnd(event: TouchEvent): void {
    Array.from(event.changedTouches).forEach(touch => {
      this.touchGuard.touchEnd(touch.identifier);
    });
  }

  /**
   * Map keyboard keys to game actions
   */
  private mapKeyToAction(key: string, code: string): InputAction | null {
    // Directional keys
    switch (key.toLowerCase()) {
      case 'arrowup':
      case 'w':
        return 'UP';
      case 'arrowdown':
      case 's':
        return 'DOWN';
      case 'arrowleft':
      case 'a':
        return 'LEFT';
      case 'arrowright':
      case 'd':
        return 'RIGHT';
    }

    // Color keys
    switch (key.toLowerCase()) {
      case 'r':
        return 'RED';
      case 'g':
        return 'GREEN';
      case 'b':
        return 'BLUE';
      case 'y':
        return 'YELLOW';
    }

    // Action keys
    switch (key.toLowerCase()) {
      case ' ':
      case 'enter':
        return 'TAP';
      case 'h':
        return 'HOLD';
      case 'shift':
        return 'SWIPE';
    }

    // Number keys for combo actions
    if (key >= '1' && key <= '9') {
      const index = parseInt(key) - 1;
      const combos = [
        'RED UP', 'RED DOWN', 'RED LEFT', 'RED RIGHT',
        'GREEN UP', 'GREEN DOWN', 'GREEN LEFT', 'GREEN RIGHT',
        'BLUE UP', 'BLUE DOWN', 'BLUE LEFT', 'BLUE RIGHT',
        'YELLOW UP', 'YELLOW DOWN', 'YELLOW LEFT', 'YELLOW RIGHT',
      ];
      return combos[index] || null;
    }

    return null;
  }

  /**
   * Check if input should be accepted
   */
  private shouldAcceptInput(action: InputAction): boolean {
    // Check debounce window
    if (!this.debouncer.shouldAcceptInput()) {
      return false;
    }

    // Check for double submission of same action
    if (this.config.preventDoubleSubmission) {
      const now = Date.now();
      if (this.lastSubmittedAction === action && 
          now - this.lastSubmissionTime < this.config.debounceWindow * 2) {
        return false;
      }
    }

    return true;
  }

  /**
   * Process accepted input
   */
  private processInput(inputEvent: InputEvent): void {
    this.lastSubmittedAction = inputEvent.action;
    this.lastSubmissionTime = inputEvent.timestamp;

    if (this.onInputCallback) {
      this.onInputCallback(inputEvent);
    }
  }

  /**
   * Reset input state
   */
  reset(): void {
    this.debouncer.reset();
    this.touchGuard.reset();
    this.lastSubmittedAction = undefined;
    this.lastSubmissionTime = 0;
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<InputHandlerConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.debouncer = new InputDebouncer(this.config.debounceWindow);
    this.touchGuard = new MultiTouchGuard(this.config.maxTouches);
  }

  /**
   * Get current configuration
   */
  getConfig(): InputHandlerConfig {
    return { ...this.config };
  }
}

/**
 * Keyboard navigation helper for focus management
 */
export class KeyboardNavigationHelper {
  private focusableElements: HTMLElement[] = [];
  private currentIndex: number = -1;

  /**
   * Initialize with focusable elements
   */
  setFocusableElements(elements: HTMLElement[]): void {
    this.focusableElements = elements.filter(el => {
      // Check if element is a form control that can be disabled
      const isDisabled = el.hasAttribute('disabled') || 
                           el instanceof HTMLInputElement || 
                           el instanceof HTMLSelectElement || 
                           el instanceof HTMLTextAreaElement;

      return !isDisabled && 
             el.tabIndex !== -1 && 
             el.offsetParent !== null; // visible
    });
    this.currentIndex = -1;
  }

  /**
   * Handle keyboard navigation
   */
  handleNavigation(event: KeyboardEvent): boolean {
    if (this.focusableElements.length === 0) return false;

    switch (event.key) {
      case 'Tab':
        event.preventDefault();
        this.navigateTab(event.shiftKey);
        return true;
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        this.navigateNext();
        return true;
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        this.navigatePrevious();
        return true;
      case 'Home':
        event.preventDefault();
        this.navigateFirst();
        return true;
      case 'End':
        event.preventDefault();
        this.navigateLast();
        return true;
    }

    return false;
  }

  /**
   * Navigate with Tab key
   */
  private navigateTab(reverse: boolean): void {
    if (reverse) {
      this.navigatePrevious();
    } else {
      this.navigateNext();
    }
  }

  /**
   * Navigate to next element
   */
  private navigateNext(): void {
    this.currentIndex = (this.currentIndex + 1) % this.focusableElements.length;
    this.focusCurrent();
  }

  /**
   * Navigate to previous element
   */
  private navigatePrevious(): void {
    this.currentIndex = this.currentIndex <= 0 
      ? this.focusableElements.length - 1 
      : this.currentIndex - 1;
    this.focusCurrent();
  }

  /**
   * Navigate to first element
   */
  private navigateFirst(): void {
    this.currentIndex = 0;
    this.focusCurrent();
  }

  /**
   * Navigate to last element
   */
  private navigateLast(): void {
    this.currentIndex = this.focusableElements.length - 1;
    this.focusCurrent();
  }

  /**
   * Focus current element
   */
  private focusCurrent(): void {
    if (this.currentIndex >= 0 && this.currentIndex < this.focusableElements.length) {
      this.focusableElements[this.currentIndex].focus();
    }
  }

  /**
   * Get currently focused element index
   */
  getCurrentIndex(): number {
    return this.currentIndex;
  }

  /**
   * Set focus to specific index
   */
  focusIndex(index: number): void {
    if (index >= 0 && index < this.focusableElements.length) {
      this.currentIndex = index;
      this.focusCurrent();
    }
  }
}

/**
 * Utility functions for input handling
 */
export const InputUtils = {
  /**
   * Check if event is from keyboard
   */
  isKeyboardEvent(event: Event): event is KeyboardEvent {
    return event.type.startsWith('key');
  },

  /**
   * Check if event is from touch
   */
  isTouchEvent(event: Event): event is TouchEvent {
    return event.type.startsWith('touch');
  },

  /**
   * Check if event is from mouse
   */
  isMouseEvent(event: Event): event is MouseEvent {
    return event.type.startsWith('mouse') || event.type === 'click';
  },

  /**
   * Get input method from event
   */
  getInputMethod(event: Event): InputMethod {
    if (this.isKeyboardEvent(event)) return 'keyboard';
    if (this.isTouchEvent(event)) return 'touch';
    return 'mouse';
  },

  /**
   * Prevent default behavior for game events
   */
  preventGameEventDefaults(event: Event): void {
    if (this.isKeyboardEvent(event)) {
      // Prevent scrolling, browser shortcuts, etc.
      const gameKeys = [
        'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
        'Space', 'Enter', 'Tab',
        'KeyW', 'KeyA', 'KeyS', 'KeyD',
        'KeyR', 'KeyG', 'KeyB', 'KeyY', 'KeyH'
      ];
      
      if (gameKeys.includes((event as KeyboardEvent).code)) {
        event.preventDefault();
      }
    }
  }
};