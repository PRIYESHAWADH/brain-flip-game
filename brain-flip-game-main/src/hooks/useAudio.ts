/**
 * Enhanced Audio Hook
 * 
 * Provides a React interface to the AudioManager with game-specific
 * sound effects, spatial audio, and performance optimization.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { audioManager, type AudioOptions } from '@/utils/AudioManager';

export interface AudioState {
  isInitialized: boolean;
  masterVolume: number;
  channelVolumes: Record<string, number>;
  channelMutes: Record<string, boolean>;
  isPlaying: Record<string, boolean>;
}

export function useAudio() {
  const [audioState, setAudioState] = useState<AudioState>({
    isInitialized: false,
    masterVolume: 1,
    channelVolumes: {},
    channelMutes: {},
    isPlaying: {}
  });



  // Initialize audio manager
  const initializeAudio = useCallback(async () => {
    if (initializationPromiseRef.current) {
      return initializationPromiseRef.current;
    }

    initializationPromiseRef.current = audioManager.initialize();
    
    try {
      await initializationPromiseRef.current;
      
      // Get initial channel info
      const channels = audioManager.getChannels();
      const channelVolumes: Record<string, number> = {};
      const channelMutes: Record<string, boolean> = {};
      
      channels.forEach(channel => {
        channelVolumes[channel.id] = channel.volume;
        channelMutes[channel.id] = channel.muted;
      });

      setAudioState(prev => ({
        ...prev,
        isInitialized: true,
        channelVolumes,
        channelMutes
      }));
    } catch (error) {
      console.error('Failed to initialize audio:', error);
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    initializeAudio();
  }, [initializeAudio]);

  // Play sound with options
  const playSound = useCallback(async (
    soundId: string,
    channel: string = 'game',
    options: AudioOptions = {}
  ): Promise<string | null> => {
    if (!audioState.isInitialized) {
      await initializeAudio();
    }

    try {

      
      if (instanceId) {
        activeInstancesRef.current.set(soundId, instanceId);
        setAudioState(prev => ({
          ...prev,
          isPlaying: { ...prev.isPlaying, [soundId]: true }
        }));

        // Auto-cleanup tracking after sound duration
        setTimeout(() => {
          setAudioState(prev => ({
            ...prev,
            isPlaying: { ...prev.isPlaying, [soundId]: false }
          }));
        }, 5000); // Fallback cleanup
      }

      return instanceId;
    } catch (error) {
      console.warn(`Failed to play sound ${soundId}:`, error);
      return null;
    }
  }, [audioState.isInitialized, initializeAudio]);

  // Stop specific sound
  const stopSound = useCallback((soundId: string, fadeOut = false) => {
    const instanceId = activeInstancesRef.current.get(soundId);
    if (instanceId) {
      audioManager.stopSound(instanceId, fadeOut);
      activeInstancesRef.current.delete(soundId);
      setAudioState(prev => ({
        ...prev,
        isPlaying: { ...prev.isPlaying, [soundId]: false }
      }));
    }
  }, []);

  // Enhanced game-specific sound functions with dynamic intensity
  const playCorrect = useCallback((options: AudioOptions = {}, streak = 0, reactionTime = 1000) => {
    // Dynamic volume and pitch based on performance
    let volume = 0.7;
    let pitch = 1.0;
    
    // Increase volume and pitch for streaks
    if (streak >= 5) {
      volume = Math.min(1.0, 0.7 + (streak * 0.05));
      pitch = Math.min(1.5, 1.0 + (streak * 0.05));
    }
    
    // Perfect timing gets special treatment
    if (reactionTime < 300) {
      return playSound('perfect-timing', 'game', { ...options, volume, pitch });
    } else if (reactionTime < 500) {
      volume *= 1.2; // Boost volume for good timing
    }
    
    return playSound('success-chime', 'game', { ...options, volume, pitch });
  }, [playSound]);

  const playIncorrect = useCallback((options: AudioOptions = {}) => {
    // Gentler failure sound to maintain motivation
    return playSound('failure-buzz', 'game', { ...options, volume: 0.5 });
  }, [playSound]);

  const playLevelUp = useCallback((options: AudioOptions = {}) =>
    playSound('level-up-fanfare', 'game', options), [playSound]);

  const playStreakBonus = useCallback((options: AudioOptions = {}, streak = 0) => {
    // Dynamic celebration based on streak level
    let volume = 0.7;
    let pitch = 1.0;
    
    if (streak >= 10) {
      volume = 1.0;
      pitch = 1.3;
    } else if (streak >= 5) {
      volume = 0.8;
      pitch = 1.1;
    }
    
    return playSound('streak-bonus', 'game', { ...options, volume, pitch });
  }, [playSound]);

  const playPerfectTiming = useCallback((options: AudioOptions = {}) =>
    playSound('perfect-timing', 'game', { ...options, volume: 0.9 }), [playSound]);

  const playGameStart = useCallback((options: AudioOptions = {}) =>
    playSound('game-start', 'game', options), [playSound]);

  const playGameOver = useCallback((options: AudioOptions = {}) =>
    playSound('game-over', 'game', options), [playSound]);

  const playTimerWarning = useCallback((options: AudioOptions = {}) =>
    playSound('timer-warning', 'game', { ...options, volume: 0.4 }), [playSound]);

  // New enhanced sound functions
  const playComboBonus = useCallback((comboCount: number) => {
    const volume = Math.min(1.0, 0.6 + (comboCount * 0.1));
    const pitch = Math.min(1.8, 1.0 + (comboCount * 0.1));
    return playSound('streak-bonus', 'game', { volume, pitch });
  }, [playSound]);

  const playFlowState = useCallback(() => {
    return playSound('perfect-timing', 'game', { volume: 0.8, pitch: 0.8 });
  }, [playSound]);

  // Battle-specific sound functions
  const playBattleStart = useCallback((options: AudioOptions = {}) =>
    playSound('game-start', 'game', options), [playSound]);

  const playBattleWin = useCallback((options: AudioOptions = {}) =>
    playSound('level-up-fanfare', 'game', options), [playSound]);

  const playBattleLose = useCallback((options: AudioOptions = {}) =>
    playSound('game-over', 'game', options), [playSound]);

  const playBattleTimerWarning = useCallback((options: AudioOptions = {}) =>
    playSound('timer-warning', 'game', options), [playSound]);

  // UI sound functions
  const playButtonClick = useCallback((options: AudioOptions = {}) =>
    playSound('button-click', 'ui', options), [playSound]);

  const playButtonHover = useCallback((options: AudioOptions = {}) =>
    playSound('button-hover', 'ui', options), [playSound]);

  const playModalOpen = useCallback((options: AudioOptions = {}) =>
    playSound('modal-open', 'ui', options), [playSound]);

  const playModalClose = useCallback((options: AudioOptions = {}) =>
    playSound('modal-close', 'ui', options), [playSound]);

  const playPageTransition = useCallback((options: AudioOptions = {}) =>
    playSound('page-transition', 'ui', options), [playSound]);

  // Enhanced background music functions with adaptive intensity
  const playBackgroundMusic = useCallback((musicId: string, intensity = 0.3) => {
    if (!audioState.isPlaying[musicId]) {
      playSound(musicId, 'ambient', { loop: true, volume: intensity });
    }
  }, [playSound, audioState.isPlaying]);

  const adjustMusicIntensity = useCallback((streak: number, comboStreak: number) => {
    // Calculate intensity based on performance
    let intensity = 0.3; // Base intensity
    
    // Increase intensity with streak
    if (streak >= 10) {
      intensity = 0.6;
    } else if (streak >= 5) {
      intensity = 0.5;
    } else if (streak >= 3) {
      intensity = 0.4;
    }
    
    // Flow state bonus
    if (comboStreak >= 5) {
      intensity = Math.min(0.7, intensity + 0.1);
    }
    
    // Smoothly adjust current music volume
    audioManager.setChannelVolume('ambient', intensity);
    setAudioState(prev => ({
      ...prev,
      channelVolumes: { ...prev.channelVolumes, ambient: intensity }
    }));
  }, []);

  const playAdaptiveBackgroundMusic = useCallback((gameState: {
    streak: number;
    comboStreak: number;
    isFlowState: boolean;
  }) => {
    const { streak, comboStreak, isFlowState } = gameState;
    
    // Choose music based on game state
    let musicId = 'background-music-focus';
    
    if (isFlowState || streak >= 10) {
      musicId = 'background-music-energy';
    }
    
    // Start music if not playing
    if (!audioState.isPlaying[musicId]) {
      // Stop other music first
      stopBackgroundMusic();
      setTimeout(() => {
        playBackgroundMusic(musicId);
        adjustMusicIntensity(streak, comboStreak);
      }, 500);
    } else {
      // Just adjust intensity
      adjustMusicIntensity(streak, comboStreak);
    }
  }, [playBackgroundMusic, adjustMusicIntensity, stopBackgroundMusic, audioState.isPlaying]);

  const stopBackgroundMusic = useCallback(() => {
    audioManager.stopAllSounds('ambient', 1.0); // 1 second fade out
    setAudioState(prev => ({
      ...prev,
      isPlaying: Object.keys(prev.isPlaying).reduce((acc, key) => {
        acc[key] = key.includes('background') ? false : prev.isPlaying[key];
        return acc;
      }, {} as Record<string, boolean>)
    }));
  }, []);

  // Spatial audio functions
  const playSpatialSound = useCallback((
    soundId: string,
    position: { x: number; y: number; z: number },
    options?: AudioOptions
  ) => {
    return playSound(soundId, 'spatial', { ...options, spatial: position });
  }, [playSound]);

  const updateSpatialListener = useCallback((
    position: { x: number; y: number; z: number },
    orientation?: { forward: number[]; up: number[] }
  ) => {
    audioManager.updateSpatialListener(position, orientation);
  }, []);

  // Volume and channel controls
  const setMasterVolume = useCallback((volume: number) => {
    audioManager.setMasterVolume(volume);
    setAudioState(prev => ({ ...prev, masterVolume: volume }));
  }, []);

  const setChannelVolume = useCallback((channelId: string, volume: number) => {
    audioManager.setChannelVolume(channelId, volume);
    setAudioState(prev => ({
      ...prev,
      channelVolumes: { ...prev.channelVolumes, [channelId]: volume }
    }));
  }, []);

  const muteChannel = useCallback((channelId: string, muted: boolean) => {
    audioManager.muteChannel(channelId, muted);
    setAudioState(prev => ({
      ...prev,
      channelMutes: { ...prev.channelMutes, [channelId]: muted }
    }));
  }, []);

  const duckChannel = useCallback((channelId: string, duckVolume: number, duration: number) => {
    audioManager.duckChannel(channelId, duckVolume, duration);
  }, []);

  // Utility functions
  const stopAllSounds = useCallback((fadeOut = false) => {
    audioManager.stopAllSounds(undefined, fadeOut);
    activeInstancesRef.current.clear();
    setAudioState(prev => ({
      ...prev,
      isPlaying: Object.keys(prev.isPlaying).reduce((acc, key) => {
        acc[key] = false;
        return acc;
      }, {} as Record<string, boolean>)
    }));
  }, []);

  const getMetrics = useCallback(() => {
    return audioManager.getMetrics();
  }, []);

  const getChannelInfo = useCallback(() => {
    return audioManager.getChannelInfo();
  }, []);

  // Preload critical sounds
  const preloadSounds = useCallback(async (soundIds?: string[]) => {
    if (!audioState.isInitialized) {
      await initializeAudio();
    }

    const defaultCritical = [
      'button-click', 'button-hover', 'success-chime', 
      'failure-buzz', 'game-start', 'level-up-fanfare'
    ];
    
    await audioManager.preloadSounds(soundIds || defaultCritical);
  }, [audioState.isInitialized, initializeAudio]);

  return {
    // State
    audioState,
    isInitialized: audioState.isInitialized,
    
    // Game sounds
    playCorrect,
    playIncorrect,
    playLevelUp,
    playStreakBonus,
    playPerfectTiming,
    playGameStart,
    playGameOver,
    playTimerWarning,
    playComboBonus,
    playFlowState,
    
    // Battle sounds
    playBattleStart,
    playBattleWin,
    playBattleLose,
    playBattleCountdown,
    
    // UI sounds
    playButtonClick,
    playButtonHover,
    playModalOpen,
    playModalClose,
    playPageTransition,
    
    // Background music
    playBackgroundMusic,
    stopBackgroundMusic,
    adjustMusicIntensity,
    playAdaptiveBackgroundMusic,
    playBg: playBackgroundMusic, // Legacy compatibility
    stopBg: stopBackgroundMusic, // Legacy compatibility
    
    // Spatial audio
    playSpatialSound,
    updateListenerPosition,
    
    // Generic sound control
    playSound,
    stopSound,
    stopAllSounds,
    
    // Volume and channel controls
    setMasterVolume,
    setChannelVolume,
    muteChannel,
    duckChannel,
    setVolume: setMasterVolume, // Legacy compatibility
    mute: () => setMasterVolume(0), // Legacy compatibility
    unmute: () => setMasterVolume(1), // Legacy compatibility
    
    // Utilities
    preloadSounds,
    preload: preloadSounds, // Legacy compatibility
    getMetrics,
    getChannelInfo,
    initializeAudio
  };
}
