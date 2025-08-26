/**
 * Audio Settings Component
 * 
 * Provides user controls for audio channels, volume levels, and audio testing.
 * Includes accessibility features and persistent settings storage.
 */

"use client";
import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAudio } from '@/hooks/useAudio';
import { useAnimation } from '@/hooks/useAnimation';
import Button from './Button';
import Card from './Card';

export interface AudioSettingsProps {
  className?: string;
  onClose?: () => void;
}

interface AudioSettings {
  masterVolume: number;
  channelVolumes: Record<string, number>;
  channelMutes: Record<string, boolean>;
  spatialAudioEnabled: boolean;
}

export default function AudioSettings({ className, onClose }: AudioSettingsProps) {
  const { 
    audioState, 
    setMasterVolume, 
    setChannelVolume, 
    muteChannel,
    getChannelInfo,
    playSound,
    getMetrics,
    isInitialized
  } = useAudio();
  
  const { getMotionAnimation } = useAnimation();
  
  const [settings, setSettings] = useState<AudioSettings>({
    masterVolume: 1,
    channelVolumes: {},
    channelMutes: {},
    spatialAudioEnabled: true
  });
  
  const [channels, setChannels] = useState<Array<{ id: string; name: string; volume: number; muted: boolean }>>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [testingChannel, setTestingChannel] = useState<string | null>(null);

  // Load settings from localStorage
  useEffect(() => {
    try {
      if (saved) {
        setSettings(prev => ({ ...prev, ...parsedSettings }));
        
        // Apply loaded settings
        setMasterVolume(parsedSettings.masterVolume || 1);
        Object.entries(parsedSettings.channelVolumes || {}).forEach(([channelId, volume]) => {
          setChannelVolume(channelId, volume as number);
        });
        Object.entries(parsedSettings.channelMutes || {}).forEach(([channelId, muted]) => {
          muteChannel(channelId, muted as boolean);
        });
      }
    } catch (error) {
      console.warn('Failed to load audio settings:', error);
    }
  }, [setMasterVolume, setChannelVolume, muteChannel]);

  // Save settings to localStorage
    setSettings(updatedSettings);
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSettings));
    } catch (error) {
      console.warn('Failed to save audio settings:', error);
    }
  }, [settings]);

  // Update channel info
  useEffect(() => {
    if (isInitialized) {
      setChannels(channelInfo);
      
      // Update metrics
      setMetrics(currentMetrics);
    }
  }, [isInitialized, getChannelInfo, getMetrics, audioState]);

  // Handle master volume change
    setMasterVolume(volume);
    saveSettings({ masterVolume: volume });
  }, [setMasterVolume, saveSettings]);

  // Handle channel volume change
    setChannelVolume(channelId, volume);
    saveSettings({ 
      channelVolumes: { ...settings.channelVolumes, [channelId]: volume }
    });
  }, [setChannelVolume, saveSettings, settings.channelVolumes]);

  // Handle channel mute toggle
    
    muteChannel(channelId, newMuted);
    saveSettings({ 
      channelMutes: { ...settings.channelMutes, [channelId]: newMuted }
    });
  }, [muteChannel, saveSettings, settings.channelMutes]);

  // Test channel audio
    setTestingChannel(channelId);
    
    // Play appropriate test sound for each channel
    const testSounds: Record<string, string> = {
      ui: 'button-click',
      game: 'success-chime',
      ambient: 'background-music-focus',
      spatial: 'action-feedback'
    };
    
    try {
      await playSound(testSound, channelId, { volume: 0.8 });
    } catch (error) {
      console.warn(`Failed to test ${channelId} channel:`, error);
    }
    
    // Reset testing state after a delay
    setTimeout(() => {
      setTestingChannel(null);
    }, 1000);
  }, [playSound]);

  // Reset to defaults
    const defaultSettings: AudioSettings = {
      masterVolume: 1,
      channelVolumes: { ui: 0.7, game: 0.8, ambient: 0.4, spatial: 0.6 },
      channelMutes: {},
      spatialAudioEnabled: true
    };
    
    // Apply defaults
    setMasterVolume(defaultSettings.masterVolume);
    Object.entries(defaultSettings.channelVolumes).forEach(([channelId, volume]) => {
      setChannelVolume(channelId, volume);
    });
    Object.keys(settings.channelMutes).forEach(channelId => {
      muteChannel(channelId, false);
    });
    
    saveSettings(defaultSettings);
  }, [setMasterVolume, setChannelVolume, muteChannel, saveSettings, settings.channelMutes]);

  if (!isInitialized) {
    return (
      <Card className={className}>
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]" />
          <span className="ml-3 text-[var(--color-text-secondary)]">Initializing audio system...</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-orbitron font-bold text-[var(--color-text-primary)]">
            Audio Settings
          </h2>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              aria-label="Close audio settings"
            >
              ✕
            </Button>
          )}
        </div>

        {/* Master Volume */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-[var(--color-text-primary)]">
            Master Volume
          </label>
          <div className="flex items-center space-x-4">
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.masterVolume}
              onChange={(e) => handleMasterVolumeChange(parseFloat(e.target.value))}
              className="flex-1 h-2 bg-[var(--color-surface-secondary)] rounded-lg appearance-none cursor-pointer slider"
              aria-label="Master volume"
            />
            <span className="text-sm font-mono text-[var(--color-text-secondary)] w-12">
              {Math.round(settings.masterVolume * 100)}%
            </span>
          </div>
        </div>

        {/* Channel Controls */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
            Audio Channels
          </h3>
          
          {channels.map((channel) => (
            <motion.div
              key={channel.id}
              className="p-4 rounded-lg bg-[var(--color-surface-secondary)] border border-[var(--color-border-primary)]"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={getMotionAnimation('ui', 'fadeIn')}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <h4 className="font-medium text-[var(--color-text-primary)]">
                    {channel.name}
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleChannelMuteToggle(channel.id)}
                    className={`${
                      settings.channelMutes[channel.id] 
                        ? 'text-[var(--color-danger)]' 
                        : 'text-[var(--color-text-secondary)]'
                    }`}
                    aria-label={`${settings.channelMutes[channel.id] ? 'Unmute' : 'Mute'} ${channel.name}`}
                  >
                    {settings.channelMutes[channel.id] ? '🔇' : '🔊'}
                  </Button>
                </div>
                
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => testChannelAudio(channel.id)}
                  disabled={testingChannel === channel.id || settings.channelMutes[channel.id]}
                  aria-label={`Test ${channel.name} audio`}
                >
                  {testingChannel === channel.id ? '🎵' : 'Test'}
                </Button>
              </div>
              
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.channelVolumes[channel.id] || channel.volume}
                  onChange={(e) => handleChannelVolumeChange(channel.id, parseFloat(e.target.value))}
                  disabled={settings.channelMutes[channel.id]}
                  className="flex-1 h-2 bg-[var(--color-surface-primary)] rounded-lg appearance-none cursor-pointer slider disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label={`${channel.name} volume`}
                />
                <span className="text-sm font-mono text-[var(--color-text-secondary)] w-12">
                  {Math.round((settings.channelVolumes[channel.id] || channel.volume) * 100)}%
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Audio Metrics */}
        {metrics && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
              Audio System Status
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 rounded bg-[var(--color-surface-secondary)]">
                <div className="text-[var(--color-text-secondary)]">Loaded Sounds</div>
                <div className="font-mono text-[var(--color-text-primary)]">
                  {metrics.loadedSounds}/{metrics.totalSounds}
                </div>
              </div>
              <div className="p-3 rounded bg-[var(--color-surface-secondary)]">
                <div className="text-[var(--color-text-secondary)]">Active Channels</div>
                <div className="font-mono text-[var(--color-text-primary)]">
                  {metrics.activeChannels}
                </div>
              </div>
              <div className="p-3 rounded bg-[var(--color-surface-secondary)]">
                <div className="text-[var(--color-text-secondary)]">Latency</div>
                <div className="font-mono text-[var(--color-text-primary)]">
                  {Math.round(metrics.latency * 1000)}ms
                </div>
              </div>
              <div className="p-3 rounded bg-[var(--color-surface-secondary)]">
                <div className="text-[var(--color-text-secondary)]">Memory Usage</div>
                <div className="font-mono text-[var(--color-text-primary)]">
                  {Math.round(metrics.memoryUsage / 1024)}KB
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between pt-4 border-t border-[var(--color-border-secondary)]">
          <Button
            variant="secondary"
            onClick={resetToDefaults}
            aria-label="Reset audio settings to defaults"
          >
            Reset to Defaults
          </Button>
          
          {onClose && (
            <Button
              variant="primary"
              onClick={onClose}
            >
              Done
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

/* Custom slider styles */
.slider::-webkit-slider-thumb {
  appearance: none;
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: var(--color-primary);
  cursor: pointer;
  box-shadow: 0 0 8px var(--color-primary);
  transition: all 0.2s ease;
}

.slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 0 12px var(--color-primary);
}

.slider::-moz-range-thumb {
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: var(--color-primary);
  cursor: pointer;
  border: none;
  box-shadow: 0 0 8px var(--color-primary);
  transition: all 0.2s ease;
}

.slider::-moz-range-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 0 12px var(--color-primary);
}

.slider:disabled::-webkit-slider-thumb {
  background: var(--color-text-tertiary);
  box-shadow: none;
  cursor: not-allowed;
}

.slider:disabled::-moz-range-thumb {
  background: var(--color-text-tertiary);
  box-shadow: none;
  cursor: not-allowed;
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  styleSheet.textContent = sliderStyles;
  document.head.appendChild(styleSheet);
}