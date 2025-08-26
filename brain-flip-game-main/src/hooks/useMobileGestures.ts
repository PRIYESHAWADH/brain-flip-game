import { useCallback, useRef, useState, useEffect } from 'react';

interface TouchPoint {
  x: number;
  y: number;
  timestamp: number;
}

interface GestureState {
  isActive: boolean;
  startPoint: TouchPoint | null;
  currentPoint: TouchPoint | null;
  direction: 'up' | 'down' | 'left' | 'right' | 'tap' | null;
  distance: number;
  velocity: number;
  duration: number;
}

interface GestureCallbacks {
  onTap?: (point: TouchPoint) => void;
  onSwipe?: (direction: 'up' | 'down' | 'left' | 'right', distance: number, velocity: number) => void;
  onLongPress?: (point: TouchPoint) => void;
  onPinch?: (scale: number, center: TouchPoint) => void;
  onRotate?: (angle: number, center: TouchPoint) => void;
  onDoubleTap?: (point: TouchPoint) => void;
}

interface GestureOptions {
  swipeThreshold: number;
  longPressDelay: number;
  doubleTapDelay: number;
  pinchThreshold: number;
  rotateThreshold: number;
  preventDefault: boolean;
  enableHapticFeedback: boolean;
}

const DEFAULT_OPTIONS: GestureOptions = {
  swipeThreshold: 50,
  longPressDelay: 500,
  doubleTapDelay: 300,
  pinchThreshold: 10,
  rotateThreshold: 15,
  preventDefault: true,
  enableHapticFeedback: true
};

export function useMobileGestures(
  callbacks: GestureCallbacks = {},
  options: Partial<GestureOptions> = {}
) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const [gestureState, setGestureState] = useState<GestureState>({
    isActive: false,
    startPoint: null,
    currentPoint: null,
    direction: null,
    distance: 0,
    velocity: 0,
    duration: 0
  });

  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const lastTapTime = useRef<number>(0);
  const lastTapPoint = useRef<TouchPoint | null>(null);
  const initialTouches = useRef<TouchList | null>(null);

  // Haptic feedback helper
  const triggerHaptic = useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (!opts.enableHapticFeedback || !('vibrate' in navigator)) return;
    
    const patterns = {
      light: [10],
      medium: [20],
      heavy: [30]
    };
    
    try {
      navigator.vibrate(patterns[type]);
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  }, [opts.enableHapticFeedback]);

  // Calculate distance between two points
  const getDistance = useCallback((point1: TouchPoint, point2: TouchPoint): number => {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  // Calculate angle between two points
  const getAngle = useCallback((point1: TouchPoint, point2: TouchPoint): number => {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    return Math.atan2(dy, dx) * (180 / Math.PI);
  }, []);

  // Get swipe direction
  const getSwipeDirection = useCallback((start: TouchPoint, end: TouchPoint): 'up' | 'down' | 'left' | 'right' | null => {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (Math.max(absDx, absDy) < opts.swipeThreshold) {
      return null;
    }

    if (absDx > absDy) {
      return dx > 0 ? 'right' : 'left';
    } else {
      return dy > 0 ? 'down' : 'up';
    }
  }, [opts.swipeThreshold]);

  // Handle touch start
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (opts.preventDefault) {
      e.preventDefault();
    }

    const touch = e.touches[0];
    const point: TouchPoint = {
      x: touch.clientX,
      y: touch.clientY,
      timestamp: Date.now()
    };

    initialTouches.current = e.touches;

    setGestureState({
      isActive: true,
      startPoint: point,
      currentPoint: point,
      direction: null,
      distance: 0,
      velocity: 0,
      duration: 0
    });

    // Start long press timer
    if (callbacks.onLongPress) {
      longPressTimer.current = setTimeout(() => {
        triggerHaptic('medium');
        callbacks.onLongPress!(point);
      }, opts.longPressDelay);
    }

    triggerHaptic('light');
  }, [callbacks, opts, triggerHaptic]);

  // Handle touch move
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (opts.preventDefault) {
      e.preventDefault();
    }

    if (!gestureState.isActive || !gestureState.startPoint) return;

    const touch = e.touches[0];
    const currentPoint: TouchPoint = {
      x: touch.clientX,
      y: touch.clientY,
      timestamp: Date.now()
    };

    const distance = getDistance(gestureState.startPoint, currentPoint);
    const duration = currentPoint.timestamp - gestureState.startPoint.timestamp;
    const velocity = distance / Math.max(duration, 1);
    const direction = getSwipeDirection(gestureState.startPoint, currentPoint);

    setGestureState(prev => ({
      ...prev,
      currentPoint,
      distance,
      velocity,
      duration,
      direction
    }));

    // Cancel long press if moved too much
    if (distance > 10 && longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    // Handle multi-touch gestures
    if (e.touches.length === 2 && initialTouches.current && initialTouches.current.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const initialTouch1 = initialTouches.current[0];
      const initialTouch2 = initialTouches.current[1];

      // Pinch gesture
      if (callbacks.onPinch) {
        const currentDistance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) + 
          Math.pow(touch2.clientY - touch1.clientY, 2)
        );
        const initialDistance = Math.sqrt(
          Math.pow(initialTouch2.clientX - initialTouch1.clientX, 2) + 
          Math.pow(initialTouch2.clientY - initialTouch1.clientY, 2)
        );
        
        const scale = currentDistance / initialDistance;
        const center: TouchPoint = {
          x: (touch1.clientX + touch2.clientX) / 2,
          y: (touch1.clientY + touch2.clientY) / 2,
          timestamp: Date.now()
        };

        if (Math.abs(scale - 1) > opts.pinchThreshold / 100) {
          callbacks.onPinch(scale, center);
        }
      }

      // Rotation gesture
      if (callbacks.onRotate) {
        const currentAngle = Math.atan2(
          touch2.clientY - touch1.clientY,
          touch2.clientX - touch1.clientX
        ) * (180 / Math.PI);
        
        const initialAngle = Math.atan2(
          initialTouch2.clientY - initialTouch1.clientY,
          initialTouch2.clientX - initialTouch1.clientX
        ) * (180 / Math.PI);

        const angleDiff = currentAngle - initialAngle;
        const center: TouchPoint = {
          x: (touch1.clientX + touch2.clientX) / 2,
          y: (touch1.clientY + touch2.clientY) / 2,
          timestamp: Date.now()
        };

        if (Math.abs(angleDiff) > opts.rotateThreshold) {
          callbacks.onRotate(angleDiff, center);
        }
      }
    }
  }, [gestureState, callbacks, opts, getDistance, getSwipeDirection, triggerHaptic]);

  // Handle touch end
  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (opts.preventDefault) {
      e.preventDefault();
    }

    if (!gestureState.isActive || !gestureState.startPoint) return;

    // Clear long press timer
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    const endPoint: TouchPoint = {
      x: gestureState.currentPoint?.x || gestureState.startPoint.x,
      y: gestureState.currentPoint?.y || gestureState.startPoint.y,
      timestamp: Date.now()
    };

    const distance = getDistance(gestureState.startPoint, endPoint);
    const duration = endPoint.timestamp - gestureState.startPoint.timestamp;
    const velocity = distance / Math.max(duration, 1);

    // Determine gesture type
    if (distance < opts.swipeThreshold) {
      // Tap or double tap
      const now = Date.now();
      const timeSinceLastTap = now - lastTapTime.current;
      const isDoubleTap = timeSinceLastTap < opts.doubleTapDelay && 
                         lastTapPoint.current &&
                         getDistance(gestureState.startPoint, lastTapPoint.current) < 50;

      if (isDoubleTap && callbacks.onDoubleTap) {
        triggerHaptic('medium');
        callbacks.onDoubleTap(gestureState.startPoint);
      } else if (callbacks.onTap) {
        triggerHaptic('light');
        callbacks.onTap(gestureState.startPoint);
      }

      lastTapTime.current = now;
      lastTapPoint.current = gestureState.startPoint;
    } else {
      // Swipe
      const direction = getSwipeDirection(gestureState.startPoint, endPoint);
      if (direction && callbacks.onSwipe) {
        triggerHaptic('medium');
        callbacks.onSwipe(direction, distance, velocity);
      }
    }

    setGestureState({
      isActive: false,
      startPoint: null,
      currentPoint: null,
      direction: null,
      distance: 0,
      velocity: 0,
      duration: 0
    });

    initialTouches.current = null;
  }, [gestureState, callbacks, opts, getDistance, getSwipeDirection, triggerHaptic]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
    };
  }, []);

  // Return gesture handlers and state
  return {
    gestureState,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
    // Helper function to bind all handlers to an element
    bindGestures: useCallback((element: HTMLElement | null) => {
      if (!element) return;

      element.addEventListener('touchstart', handleTouchStart, { passive: false });
      element.addEventListener('touchmove', handleTouchMove, { passive: false });
      element.addEventListener('touchend', handleTouchEnd, { passive: false });

      return () => {
        element.removeEventListener('touchstart', handleTouchStart);
        element.removeEventListener('touchmove', handleTouchMove);
        element.removeEventListener('touchend', handleTouchEnd);
      };
    }, [handleTouchStart, handleTouchMove, handleTouchEnd])
  };
}