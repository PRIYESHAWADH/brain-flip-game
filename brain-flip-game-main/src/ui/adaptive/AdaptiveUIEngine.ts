/**
 * Adaptive UI Engine - Core system for device-aware, skill-based UI adaptation
 * Creates sophisticated interfaces that feel effortless and perfectly tailored
 */

export interface DeviceCapabilities {
  screenWidth: number
  screenHeight: number
  pixelRatio: number
  touchSupport: boolean
  hoverSupport: boolean
  performanceLevel: 'low' | 'medium' | 'high'
  batteryLevel?: number
  connectionType: 'wifi' | 'cellular' | 'offline'
}

export interface SkillProfile {
  reactionTime: number
  accuracy: number
  consistency: number
  adaptability: number
  overallMastery: number
  gamesPlayed: number
}

export interface UIConfiguration {
  layout: LayoutConfiguration
  theme: string
  animations: AnimationSettings
  complexity: InterfaceComplexity
  accessibility: AccessibilitySettings
}

export interface LayoutConfiguration {
  buttonSize: 'small' | 'medium' | 'large'
  spacing: 'compact' | 'comfortable' | 'spacious'
  informationDensity: 'minimal' | 'balanced' | 'detailed'
  navigationStyle: 'simple' | 'advanced'
}

export interface AnimationSettings {
  enabled: boolean
  intensity: 'subtle' | 'moderate' | 'dynamic'
  duration: number
  easing: string
}

export interface InterfaceComplexity {
  level: 'beginner' | 'intermediate' | 'expert'
  showAdvancedStats: boolean
  showDetailedControls: boolean
  enableCustomization: boolean
}

export interface AccessibilitySettings {
  fontSize: 'small' | 'medium' | 'large' | 'extra-large'
  contrast: 'normal' | 'high'
  reducedMotion: boolean
  screenReaderSupport: boolean
  colorBlindSupport: boolean
}

export interface EnvironmentContext {
  ambientLight: 'bright' | 'normal' | 'dim'
  noiseLevel: 'quiet' | 'normal' | 'loud'
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night'
  usagePattern: 'casual' | 'focused' | 'competitive'
}

export class AdaptiveUIEngine {
  private currentConfig: UIConfiguration
  private deviceCapabilities: DeviceCapabilities
  private skillProfile: SkillProfile
  private environmentContext: EnvironmentContext

  constructor() {
    this.deviceCapabilities = this.detectDeviceCapabilities()
    this.skillProfile = this.getDefaultSkillProfile()
    this.environmentContext = this.detectEnvironmentContext()
    this.currentConfig = this.generateInitialConfiguration()
  }

  /**
   * Adapts UI configuration to device capabilities and constraints
   */
  adaptToDevice(deviceType: 'mobile' | 'tablet' | 'desktop', capabilities: DeviceCapabilities): UIConfiguration {
    const baseConfig = this.currentConfig

    // Optimize for device type
    const layoutConfig: LayoutConfiguration = {
      buttonSize: this.getOptimalButtonSize(deviceType, capabilities),
      spacing: this.getOptimalSpacing(deviceType, capabilities),
      informationDensity: this.getOptimalInformationDensity(deviceType, capabilities),
      navigationStyle: this.getOptimalNavigationStyle(deviceType, capabilities)
    }

    // Adjust animations based on performance
    const animationConfig: AnimationSettings = {
      enabled: capabilities.performanceLevel !== 'low',
      intensity: this.getOptimalAnimationIntensity(capabilities),
      duration: this.getOptimalAnimationDuration(capabilities),
      easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)' // Material Design easing
    }

    return {
      ...baseConfig,
      layout: layoutConfig,
      animations: animationConfig
    }
  }

  /**
   * Adjusts interface complexity based on player skill level
   */
  adjustForSkillLevel(playerSkill: SkillProfile): InterfaceComplexity {
    const masteryLevel = playerSkill.overallMastery
    const gamesPlayed = playerSkill.gamesPlayed

    if (masteryLevel < 0.3 || gamesPlayed < 10) {
      return {
        level: 'beginner',
        showAdvancedStats: false,
        showDetailedControls: false,
        enableCustomization: false
      }
    } else if (masteryLevel < 0.7 || gamesPlayed < 50) {
      return {
        level: 'intermediate',
        showAdvancedStats: true,
        showDetailedControls: false,
        enableCustomization: true
      }
    } else {
      return {
        level: 'expert',
        showAdvancedStats: true,
        showDetailedControls: true,
        enableCustomization: true
      }
    }
  }

  /**
   * Optimizes visual settings for environmental context
   */
  optimizeForContext(environment: EnvironmentContext): Partial<UIConfiguration> {
    const optimizations: Partial<UIConfiguration> = {}

    // Adjust for ambient light
    if (environment.ambientLight === 'bright') {
      optimizations.accessibility = {
        ...this.currentConfig.accessibility,
        contrast: 'high'
      }
    }

    // Adjust for noise level (affects vibration intensity)
    if (environment.noiseLevel === 'loud') {
      optimizations.animations = {
        ...this.currentConfig.animations,
        intensity: 'dynamic' // More visual feedback when audio is compromised
      }
    }

    // Adjust for time of day
    if (environment.timeOfDay === 'night') {
      optimizations.theme = 'dark'
    }

    return optimizations
  }

  /**
   * Generates complete UI configuration
   */
  generateConfiguration(): UIConfiguration {
    const deviceConfig = this.adaptToDevice(this.getDeviceType(), this.deviceCapabilities)
    const skillComplexity = this.adjustForSkillLevel(this.skillProfile)
    const contextOptimizations = this.optimizeForContext(this.environmentContext)

    return {
      ...deviceConfig,
      ...contextOptimizations,
      complexity: skillComplexity
    }
  }

  /**
   * Updates skill profile and regenerates configuration
   */
  updateSkillProfile(newSkillProfile: SkillProfile): UIConfiguration {
    this.skillProfile = newSkillProfile
    this.currentConfig = this.generateConfiguration()
    return this.currentConfig
  }

  /**
   * Updates environment context and regenerates configuration
   */
  updateEnvironmentContext(newContext: EnvironmentContext): UIConfiguration {
    this.environmentContext = newContext
    this.currentConfig = this.generateConfiguration()
    return this.currentConfig
  }

  // Private helper methods
  private detectDeviceCapabilities(): DeviceCapabilities {
    const screen = window.screen
    const connection = (navigator as any).connection

    return {
      screenWidth: screen.width,
      screenHeight: screen.height,
      pixelRatio: window.devicePixelRatio || 1,
      touchSupport: 'ontouchstart' in window,
      hoverSupport: window.matchMedia('(hover: hover)').matches,
      performanceLevel: this.detectPerformanceLevel(),
      batteryLevel: this.getBatteryLevel(),
      connectionType: connection?.effectiveType === '4g' ? 'wifi' : 'cellular'
    }
  }

  private detectPerformanceLevel(): 'low' | 'medium' | 'high' {
    const memory = (performance as any).memory
    const cores = navigator.hardwareConcurrency || 2

    if (memory && memory.jsHeapSizeLimit < 1000000000) return 'low' // < 1GB
    if (cores < 4) return 'medium'
    return 'high'
  }

  private getBatteryLevel(): number | undefined {
    // Battery API is deprecated but still useful for optimization
    return undefined // Will implement with permission-based approach
  }

  private detectEnvironmentContext(): EnvironmentContext {
    const hour = new Date().getHours()
    let timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night'

    if (hour < 6) timeOfDay = 'night'
    else if (hour < 12) timeOfDay = 'morning'
    else if (hour < 18) timeOfDay = 'afternoon'
    else if (hour < 22) timeOfDay = 'evening'
    else timeOfDay = 'night'

    return {
      ambientLight: 'normal', // Will enhance with ambient light sensor
      noiseLevel: 'normal',   // Will enhance with microphone permission
      timeOfDay,
      usagePattern: 'casual'  // Will learn from usage patterns
    }
  }

  private getDefaultSkillProfile(): SkillProfile {
    return {
      reactionTime: 1000, // ms
      accuracy: 0.5,      // 50%
      consistency: 0.5,   // 50%
      adaptability: 0.5,  // 50%
      overallMastery: 0.0,
      gamesPlayed: 0
    }
  }

  private generateInitialConfiguration(): UIConfiguration {
    return {
      layout: {
        buttonSize: 'medium',
        spacing: 'comfortable',
        informationDensity: 'balanced',
        navigationStyle: 'simple'
      },
      theme: 'light',
      animations: {
        enabled: true,
        intensity: 'moderate',
        duration: 300,
        easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)'
      },
      complexity: {
        level: 'beginner',
        showAdvancedStats: false,
        showDetailedControls: false,
        enableCustomization: false
      },
      accessibility: {
        fontSize: 'medium',
        contrast: 'normal',
        reducedMotion: false,
        screenReaderSupport: false,
        colorBlindSupport: false
      }
    }
  }

  private getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    const width = this.deviceCapabilities.screenWidth
    if (width < 768) return 'mobile'
    if (width < 1024) return 'tablet'
    return 'desktop'
  }

  private getOptimalButtonSize(deviceType: string, capabilities: DeviceCapabilities): 'small' | 'medium' | 'large' {
    if (deviceType === 'mobile') return capabilities.screenWidth < 375 ? 'medium' : 'large'
    if (deviceType === 'tablet') return 'large'
    return 'medium'
  }

  private getOptimalSpacing(deviceType: string, capabilities: DeviceCapabilities): 'compact' | 'comfortable' | 'spacious' {
    if (deviceType === 'mobile') return 'compact'
    if (deviceType === 'tablet') return 'spacious'
    return 'comfortable'
  }

  private getOptimalInformationDensity(deviceType: string, capabilities: DeviceCapabilities): 'minimal' | 'balanced' | 'detailed' {
    if (deviceType === 'mobile') return 'minimal'
    if (deviceType === 'tablet') return 'balanced'
    return 'detailed'
  }

  private getOptimalNavigationStyle(deviceType: string, capabilities: DeviceCapabilities): 'simple' | 'advanced' {
    return deviceType === 'mobile' ? 'simple' : 'advanced'
  }

  private getOptimalAnimationIntensity(capabilities: DeviceCapabilities): 'subtle' | 'moderate' | 'dynamic' {
    if (capabilities.performanceLevel === 'low') return 'subtle'
    if (capabilities.performanceLevel === 'medium') return 'moderate'
    return 'dynamic'
  }

  private getOptimalAnimationDuration(capabilities: DeviceCapabilities): number {
    if (capabilities.performanceLevel === 'low') return 200
    if (capabilities.performanceLevel === 'medium') return 300
    return 400
  }
}

// Singleton instance for global access
export const adaptiveUIEngine = new AdaptiveUIEngine()