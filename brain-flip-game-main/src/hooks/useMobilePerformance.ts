import { useEffect, useState, useCallback } from 'react';
import { useMobile } from './useMobile';

interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  batteryLevel: number;
  isLowPowerMode: boolean;
  connectionSpeed: string;
}

interface PerformanceSettings {
  enableAnimations: boolean;
  enableParticles: boolean;
  enableSounds: boolean;
  enableHaptics: boolean;
  reducedMotion: boolean;
  lowPowerMode: boolean;
}

export function useMobilePerformance() {
  const mobile = useMobile();
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    memoryUsage: 0,
    batteryLevel: 100,
    isLowPowerMode: false,
    connectionSpeed: 'unknown'
  });
  
  const [settings, setSettings] = useState<PerformanceSettings>({
    enableAnimations: true,
    enableParticles: true,
    enableSounds: true,
    enableHaptics: true,
    reducedMotion: false,
    lowPowerMode: false
  });

  // Monitor FPS
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animationId: number;

    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime >= lastTime + 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        setMetrics(prev => ({ ...prev, fps }));
        frameCount = 0;
        lastTime = currentTime;
      }
      
      animationId = requestAnimationFrame(measureFPS);
    };

    if (mobile.isMobile) {
      animationId = requestAnimationFrame(measureFPS);
    }

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [mobile.isMobile]);

  // Monitor memory usage
  useEffect(() => {
    const updateMemoryUsage = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const usedMB = memory.usedJSHeapSize / 1048576; // Convert to MB
        setMetrics(prev => ({ ...prev, memoryUsage: Math.round(usedMB) }));
      }
    };

    const interval = setInterval(updateMemoryUsage, 5000);
    updateMemoryUsage();

    return () => clearInterval(interval);
  }, []);

  // Monitor battery status
  useEffect(() => {
    const updateBatteryStatus = async () => {
      if ('getBattery' in navigator) {
        try {
          const battery = await (navigator as any).getBattery();
          setMetrics(prev => ({
            ...prev,
            batteryLevel: Math.round(battery.level * 100),
            isLowPowerMode: battery.level < 0.2
          }));

          const handleBatteryChange = () => {
            setMetrics(prev => ({
              ...prev,
              batteryLevel: Math.round(battery.level * 100),
              isLowPowerMode: battery.level < 0.2
            }));
          };

          battery.addEventListener('levelchange', handleBatteryChange);
          return () => battery.removeEventListener('levelchange', handleBatteryChange);
        } catch (error) {
          console.warn('Battery API not available:', error);
        }
      }
    };

    if (mobile.isMobile) {
      updateBatteryStatus();
    }
  }, [mobile.isMobile]);

  // Monitor connection speed
  useEffect(() => {
    const updateConnectionSpeed = () => {
      const connection = (navigator as any).connection || 
                        (navigator as any).mozConnection || 
                        (navigator as any).webkitConnection;
      
      if (connection) {
        setMetrics(prev => ({
          ...prev,
          connectionSpeed: connection.effectiveType || 'unknown'
        }));
      }
    };

    updateConnectionSpeed();

    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection;
    
    if (connection) {
      connection.addEventListener('change', updateConnectionSpeed);
      return () => connection.removeEventListener('change', updateConnectionSpeed);
    }
  }, []);

  // Auto-adjust settings based on performance
  useEffect(() => {
    const shouldReducePerformance = 
      metrics.fps < 30 || 
      metrics.memoryUsage > 100 || 
      metrics.isLowPowerMode ||
      metrics.connectionSpeed === 'slow-2g' ||
      mobile.screenSize === 'sm';

    if (shouldReducePerformance) {
      setSettings(prev => ({
        ...prev,
        enableAnimations: metrics.fps >= 20,
        enableParticles: false,
        enableSounds: !metrics.isLowPowerMode,
        lowPowerMode: true
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        enableAnimations: true,
        enableParticles: metrics.fps >= 45,
        enableSounds: true,
        lowPowerMode: false
      }));
    }
  }, [metrics, mobile.screenSize]);

  // Respect user preferences
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setSettings(prev => ({
      ...prev,
      reducedMotion: mediaQuery.matches,
      enableAnimations: !mediaQuery.matches && prev.enableAnimations
    }));

    const handleChange = (e: MediaQueryListEvent) => {
      setSettings(prev => ({
        ...prev,
        reducedMotion: e.matches,
        enableAnimations: !e.matches && prev.enableAnimations
      }));
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Performance optimization functions
  const optimizeForLowEnd = useCallback(() => {
    setSettings({
      enableAnimations: false,
      enableParticles: false,
      enableSounds: false,
      enableHaptics: false,
      reducedMotion: true,
      lowPowerMode: true
    });
  }, []);

  const optimizeForHighEnd = useCallback(() => {
    setSettings({
      enableAnimations: true,
      enableParticles: true,
      enableSounds: true,
      enableHaptics: true,
      reducedMotion: false,
      lowPowerMode: false
    });
  }, []);

  const resetToAuto = useCallback(() => {
    // Will trigger auto-adjustment in useEffect
    setSettings(prev => ({ ...prev }));
  }, []);

  // Memory cleanup function
  const cleanupMemory = useCallback(() => {
    // Force garbage collection if available
    if ('gc' in window) {
      (window as any).gc();
    }
    
    // Clear any cached data
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          if (name.includes('temp') || name.includes('cache')) {
            caches.delete(name);
          }
        });
      });
    }
  }, []);

  // Get performance recommendation
  const getPerformanceRecommendation = useCallback(() => {
    if (metrics.fps < 20) {
      return 'Consider enabling low power mode for better performance';
    }
    if (metrics.memoryUsage > 150) {
      return 'High memory usage detected. Consider restarting the game';
    }
    if (metrics.isLowPowerMode) {
      return 'Low battery detected. Some features may be disabled';
    }
    if (metrics.connectionSpeed === 'slow-2g') {
      return 'Slow connection detected. Online features may be limited';
    }
    return 'Performance is optimal';
  }, [metrics]);

  return {
    metrics,
    settings,
    optimizeForLowEnd,
    optimizeForHighEnd,
    resetToAuto,
    cleanupMemory,
    getPerformanceRecommendation,
    isLowPerformanceDevice: mobile.screenSize === 'sm' || metrics.fps < 30,
    shouldReduceAnimations: settings.reducedMotion || !settings.enableAnimations,
    shouldReduceEffects: settings.lowPowerMode || !settings.enableParticles
  };
}