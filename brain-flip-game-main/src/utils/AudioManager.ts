/**
 * Enhanced Audio Manager
 * 
 * Professional audio system with channel management, spatial audio,
 * performance optimization, and accessibility support.
 */

export interface AudioOptions {
  volume?: number;
  loop?: boolean;
  fadeIn?: number;
  fadeOut?: number;
  spatial?: { x: number; y: number; z: number };
  playbackRate?: number;
  delay?: number;
}

export interface AudioChannel {
  name: string;
  volume: number;
  muted: boolean;
  sounds: Map<string, AudioBuffer>;
  gainNode: GainNode;
  compressor?: DynamicsCompressorNode;
  analyser?: AnalyserNode;
}

export interface AudioMetrics {
  loadedSounds: number;
  totalSounds: number;
  activeChannels: number;
  memoryUsage: number;
  latency: number;
  cpuUsage: number;
}

export interface SpatialAudioConfig {
  enabled: boolean;
  listenerPosition: { x: number; y: number; z: number };
  listenerOrientation: { forward: number[]; up: number[] };
}

class AudioManager {
  private context: AudioContext | null = null;
  private channels: Map<string, AudioChannel> = new Map();
  private soundBuffers: Map<string, AudioBuffer> = new Map();
  private activeSources: Map<string, AudioBufferSourceNode> = new Map();
  private masterGainNode: GainNode | null = null;
  private compressorNode: DynamicsCompressorNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private spatialConfig: SpatialAudioConfig;
  private isInitialized: boolean = false;
  private loadingPromises: Map<string, Promise<AudioBuffer>> = new Map();
  private manifest: unknown = null;
  private performanceMetrics: AudioMetrics;

  constructor() {
    this.spatialConfig = {
      enabled: true,
      listenerPosition: { x: 0, y: 0, z: 0 },
      listenerOrientation: { forward: [0, 0, -1], up: [0, 1, 0] }
    };

    this.performanceMetrics = {
      loadedSounds: 0,
      totalSounds: 0,
      activeChannels: 0,
      memoryUsage: 0,
      latency: 0,
      cpuUsage: 0
    };

    // Initialize on user interaction
    this.setupUserInteractionListener();
  }

  private setupUserInteractionListener(): void {
    const initOnInteraction = async () => {
      await this.initialize();
      document.removeEventListener('click', initOnInteraction);
      document.removeEventListener('keydown', initOnInteraction);
      document.removeEventListener('touchstart', initOnInteraction);
    };

    document.addEventListener('click', initOnInteraction);
    document.addEventListener('keydown', initOnInteraction);
    document.addEventListener('touchstart', initOnInteraction);
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Create audio context
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Resume context if suspended
      if (this.context.state === 'suspended') {
        await this.context.resume();
      }

      // Create master gain node
      this.masterGainNode = this.context.createGain();
      this.masterGainNode.connect(this.context.destination);

      // Create master compressor for dynamic range control
      this.compressorNode = this.context.createDynamicsCompressor();
      this.compressorNode.threshold.setValueAtTime(-24, this.context.currentTime);
      this.compressorNode.knee.setValueAtTime(30, this.context.currentTime);
      this.compressorNode.ratio.setValueAtTime(12, this.context.currentTime);
      this.compressorNode.attack.setValueAtTime(0.003, this.context.currentTime);
      this.compressorNode.release.setValueAtTime(0.25, this.context.currentTime);
      this.compressorNode.connect(this.masterGainNode);

      // Create analyser for performance monitoring
      this.analyserNode = this.context.createAnalyser();
      this.analyserNode.fftSize = 256;
      this.compressorNode.connect(this.analyserNode);

      // Setup spatial audio
      if (this.context.listener) {
        this.updateSpatialListener();
      }

      // Load audio manifest
      await this.loadManifest();

      // Initialize default channels
      await this.initializeChannels();

      this.isInitialized = true;
      console.log('AudioManager initialized successfully');
    } catch (error) {
      console.error('Failed to initialize AudioManager:', error);
      throw error;
    }
  }

  private async loadManifest(): Promise<void> {
    try {
      const response = await fetch('/api/audio/manifest');
      this.manifest = await response.json();
      this.performanceMetrics.totalSounds = Object.values(this.manifest.assets || {})
        .reduce((total: number, category: unknown) => total + Object.keys(category || {}).length, 0) as number;
    } catch (error) {
      console.warn('Could not load audio manifest, using fallback configuration');
      this.manifest = { channels: {}, assets: {}, preloadCritical: [] };
    }
  }

  private async initializeChannels(): Promise<void> {
    const defaultChannels = {
      ui: { name: 'User Interface', defaultVolume: 0.7 },
      game: { name: 'Game Effects', defaultVolume: 0.8 },
      ambient: { name: 'Background Music', defaultVolume: 0.4 },
      spatial: { name: 'Spatial Audio', defaultVolume: 0.6 }
    };

    for (const [channelId, config] of Object.entries(defaultChannels)) {
      await this.createChannel(channelId, config as any);
    }

    // Preload critical sounds
    if (this.manifest.preloadCritical) {
      await this.preloadSounds(this.manifest.preloadCritical);
    }
  }

  async createChannel(channelId: string, config: { name: string; defaultVolume: number }): Promise<void> {
    if (!this.context || !this.compressorNode) {
      throw new Error('AudioManager not initialized');
    }

    const gainNode = this.context.createGain();
    gainNode.gain.setValueAtTime(config.defaultVolume, this.context.currentTime);
    gainNode.connect(this.compressorNode);

    // Create channel compressor for individual channel dynamics
    const compressor = this.context.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-18, this.context.currentTime);
    compressor.knee.setValueAtTime(20, this.context.currentTime);
    compressor.ratio.setValueAtTime(8, this.context.currentTime);
    compressor.connect(gainNode);

    // Create analyser for channel monitoring
    const analyser = this.context.createAnalyser();
    analyser.fftSize = 128;
    compressor.connect(analyser);

    const channel: AudioChannel = {
      name: config.name,
      volume: config.defaultVolume,
      muted: false,
      sounds: new Map(),
      gainNode,
      compressor,
      analyser
    };

    this.channels.set(channelId, channel);
    this.performanceMetrics.activeChannels = this.channels.size;
  }

  async loadSound(soundId: string, url: string): Promise<AudioBuffer> {
    if (!this.context) {
      throw new Error('AudioManager not initialized');
    }

    // Check if already loading
    if (this.loadingPromises.has(soundId)) {
      return this.loadingPromises.get(soundId)!;
    }

    // Check if already loaded
    if (this.soundBuffers.has(soundId)) {
      return this.soundBuffers.get(soundId)!;
    }

    const loadPromise = this.loadSoundBuffer(url);
    this.loadingPromises.set(soundId, loadPromise);

    try {
      const buffer = await loadPromise;
      this.soundBuffers.set(soundId, buffer);
      this.loadingPromises.delete(soundId);
      this.performanceMetrics.loadedSounds++;
      return buffer;
    } catch (error) {
      this.loadingPromises.delete(soundId);
      console.warn(`Failed to load sound ${soundId}:`, error);
      // Return silent buffer as fallback
      return this.createSilentBuffer(1, 0.1);
    }
  }

  private async loadSoundBuffer(url: string): Promise<AudioBuffer> {
    if (!this.context) {
      throw new Error('AudioManager not initialized');
    }
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch audio: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return this.context.decodeAudioData(arrayBuffer);
  }

  private createSilentBuffer(channels: number, duration: number): AudioBuffer {
    if (!this.context) {
      throw new Error('AudioManager not initialized');
    }
    const buffer = this.context.createBuffer(channels, this.context.sampleRate * duration, this.context.sampleRate);
    
    // Fill with silence (already zero by default)
    return buffer;
  }

  async preloadSounds(soundIds: string[]): Promise<void> {
    const loadPromises = soundIds.map(async (soundId) => {
      const soundPath = this.getSoundPath(soundId);
      if (soundPath) {
        return this.loadSound(soundId, soundPath);
      }
    });

    await Promise.allSettled(loadPromises);
  }

  private getSoundPath(soundId: string): string | null {
    if (!this.manifest.assets) return null;

    for (const [category, assets] of Object.entries(this.manifest.assets)) {
      const asset = (assets as any)[soundId];
      if (asset) {
        return `/audio/${asset.file}`;
      }
    }

    return null;
  }

  async playSound(
    soundId: string, 
    channelId: string = 'game', 
    options: AudioOptions = {}
  ): Promise<string | null> {
    if (!this.context || !this.isInitialized) {
      console.warn('AudioManager not initialized, cannot play sound');
      return null;
    }

    const channel = this.channels.get(channelId);
    if (!channel) {
      console.warn(`Channel ${channelId} not found`);
      return null;
    }

    if (channel.muted) {
      return null;
    }

    // Load sound if not already loaded
    const soundPath = this.getSoundPath(soundId);
    if (!soundPath) {
      console.warn(`Sound ${soundId} not found in manifest`);
      return null;
    }

    let buffer = this.soundBuffers.get(soundId);
    if (!buffer) {
      try {
        buffer = await this.loadSound(soundId, soundPath);
      } catch (error) {
        console.warn(`Failed to load sound ${soundId}:`, error);
        return null;
      }
    }

    // Create source node
    const source = this.context.createBufferSource();
    source.buffer = buffer;

    // Create gain node for this instance
    const instanceGain = this.context.createGain();
    const volume = (channel.gainNode.gain.value * (options.volume || 1.0));
    instanceGain.gain.setValueAtTime(volume, this.context.currentTime);

    // Setup spatial audio if requested
    let pannerNode: PannerNode | null = null;
    if (options.spatial && this.spatialConfig.enabled && this.context.createPanner) {
      pannerNode = this.context.createPanner();
      pannerNode.panningModel = 'HRTF';
      pannerNode.distanceModel = 'inverse';
      pannerNode.refDistance = 1;
      pannerNode.maxDistance = 10000;
      pannerNode.rolloffFactor = 1;
      pannerNode.coneInnerAngle = 360;
      pannerNode.coneOuterAngle = 0;
      pannerNode.coneOuterGain = 0;

      pannerNode.setPosition(options.spatial.x, options.spatial.y, options.spatial.z);
      source.connect(pannerNode);
      pannerNode.connect(instanceGain);
    } else {
      source.connect(instanceGain);
    }

    instanceGain.connect(channel.compressor || channel.gainNode);

    // Apply options
    if (options.playbackRate) {
      source.playbackRate.setValueAtTime(options.playbackRate, this.context.currentTime);
    }

    if (options.loop) {
      source.loop = true;
    }

    // Handle fade in
    if (options.fadeIn && options.fadeIn > 0) {
      instanceGain.gain.setValueAtTime(0, this.context.currentTime);
      instanceGain.gain.linearRampToValueAtTime(volume, this.context.currentTime + options.fadeIn);
    }

    // Generate unique ID for this sound instance
    const instanceId = `${soundId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Start playback
    const startTime = this.context.currentTime + (options.delay || 0);
    source.start(startTime);

    // Store active source
    this.activeSources.set(instanceId, source);

    // Handle cleanup
    const cleanup = () => {
      this.activeSources.delete(instanceId);
    };

    source.addEventListener('ended', cleanup);

    // Handle fade out and stop
    if (options.fadeOut && options.fadeOut > 0 && !options.loop) {
      const fadeStartTime = this.context.currentTime + (options.duration || 0) - options.fadeOut;
      instanceGain.gain.setValueAtTime(volume, fadeStartTime);
      instanceGain.gain.linearRampToValueAtTime(0, fadeStartTime + options.fadeOut);
    }

    return instanceId;
  }

  stopSound(instanceId: string, fadeOut: number = 0): void {
    const source = this.activeSources.get(instanceId);
    if (!source || !this.context) return;

    if (fadeOut > 0) {
      // Fade out before stopping
      const gainNode = source.gainNode || this.context.createGain();
      gainNode.gain.setValueAtTime(1, this.context.currentTime);
      gainNode.gain.linearRampToValueAtTime(0, this.context.currentTime + fadeOut);
      
      setTimeout(() => {
        try {
          source.stop();
        } catch (error) {
          // Source may have already stopped
        }
      }, fadeOut * 1000);
    } else {
      try {
        source.stop();
      } catch (error) {
        // Source may have already stopped
      }
    }

    this.activeSources.delete(instanceId);
  }

  stopAllSounds(channelId?: string, fadeOut: number = 0): void {
    const soundsToStop = Array.from(this.activeSources.entries());
    
    soundsToStop.forEach(([instanceId, source]) => {
      if (!channelId || instanceId.includes(channelId)) {
        this.stopSound(instanceId, fadeOut);
      }
    });
  }

  setMasterVolume(volume: number): void {
    if (!this.masterGainNode || !this.context) return;
    const clampedVolume = Math.max(0, Math.min(1, volume));
    this.masterGainNode.gain.setValueAtTime(clampedVolume, this.context.currentTime);
  }

  setChannelVolume(channelId: string, volume: number): void {
    const channel = this.channels.get(channelId);
    if (!channel || !this.context) return;
    const clampedVolume = Math.max(0, Math.min(1, volume));
    channel.volume = clampedVolume;
    channel.gainNode.gain.setValueAtTime(clampedVolume, this.context.currentTime);
  }

  muteChannel(channelId: string, muted: boolean): void {
    const channel = this.channels.get(channelId);
    if (!channel) return;

    channel.muted = muted;
    if (muted) {
      this.stopAllSounds(channelId, 0.1);
    }
  }

  duckChannel(channelId: string, duckVolume: number = 0.3, duration: number = 0.25): void {
    const channel = this.channels.get(channelId);
    if (!channel || !this.context) return;
    const originalVolume = channel.volume;
    const currentTime = this.context.currentTime;

    // Duck down
    channel.gainNode.gain.setValueAtTime(originalVolume, currentTime);
    channel.gainNode.gain.linearRampToValueAtTime(duckVolume, currentTime + 0.05);

    // Return to original volume
    setTimeout(() => {
      if (this.context) {
        channel.gainNode.gain.linearRampToValueAtTime(originalVolume, this.context.currentTime + duration);
      }
    }, 100);
  }

  updateSpatialListener(
    position?: { x: number; y: number; z: number },
    orientation?: { forward: number[]; up: number[] }
  ): void {
    if (!this.context?.listener) return;

    if (position) {
      this.spatialConfig.listenerPosition = position;
      if (this.context.listener.setPosition) {
        this.context.listener.setPosition(position.x, position.y, position.z);
      }
    }

    if (orientation) {
      this.spatialConfig.listenerOrientation = orientation;
      if (this.context.listener.setOrientation) {
        this.context.listener.setOrientation(
          orientation.forward[0], orientation.forward[1], orientation.forward[2],
          orientation.up[0], orientation.up[1], orientation.up[2]
        );
      }
    }
  }

  getMetrics(): AudioMetrics {
    if (!this.context) return this.performanceMetrics;

    // Update real-time metrics
    this.performanceMetrics.memoryUsage = this.soundBuffers.size * 1024; // Rough estimate
    this.performanceMetrics.latency = this.context.baseLatency || 0;
    
    // CPU usage estimation based on active sources
    this.performanceMetrics.cpuUsage = this.activeSources.size / 10; // Rough estimate

    return { ...this.performanceMetrics };
  }

  getChannelInfo(): Array<{ id: string; name: string; volume: number; muted: boolean }> {
    return Array.from(this.channels.entries()).map(([id, channel]) => ({
      id,
      name: channel.name,
      volume: channel.volume,
      muted: channel.muted
    }));
  }

  destroy(): void {
    // Stop all sounds
    this.stopAllSounds();

    // Close audio context
    if (this.context) {
      this.context.close();
    }

    // Clear all data
    this.channels.clear();
    this.soundBuffers.clear();
    this.activeSources.clear();
    this.loadingPromises.clear();

    this.isInitialized = false;
  }
}

// Singleton instance
export const audioManager = new AudioManager();