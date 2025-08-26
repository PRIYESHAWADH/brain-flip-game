/**
 * Device Detection Utilities
 * Sophisticated device capability detection that feels effortless
 */

export interface DeviceInfo {
  type: 'mobile' | 'tablet' | 'desktop'
  os: 'ios' | 'android' | 'windows' | 'macos' | 'linux' | 'unknown'
  browser: 'chrome' | 'firefox' | 'safari' | 'edge' | 'unknown'
  capabilities: DeviceCapabilities
  features: DeviceFeatures
}

export interface DeviceCapabilities {
  screenWidth: number
  screenHeight: number
  pixelRatio: number
  colorDepth: number
  refreshRate: number
  touchSupport: boolean
  hoverSupport: boolean
  keyboardSupport: boolean
  gamepadSupport: boolean
  performanceLevel: 'low' | 'medium' | 'high'
  memoryLevel: 'low' | 'medium' | 'high'
  storageQuota: number
}

export interface DeviceFeatures {
  vibration: boolean
  fullscreen: boolean
  orientation: boolean
  deviceMotion: boolean
  geolocation: boolean
  camera: boolean
  microphone: boolean
  notifications: boolean
  serviceWorker: boolean
  webGL: boolean
  webGL2: boolean
}

export class DeviceDetection {
  private static instance: DeviceDetection
  private deviceInfo: DeviceInfo | null = null

  static getInstance(): DeviceDetection {
    if (!DeviceDetection.instance) {
      DeviceDetection.instance = new DeviceDetection()
    }
    return DeviceDetection.instance
  }

  /**
   * Get comprehensive device information
   */
  async getDeviceInfo(): Promise<DeviceInfo> {
    if (this.deviceInfo) {
      return this.deviceInfo
    }

    const capabilities = await this.detectCapabilities()
    const features = await this.detectFeatures()

    this.deviceInfo = {
      type: this.detectDeviceType(),
      os: this.detectOS(),
      browser: this.detectBrowser(),
      capabilities,
      features
    }

    return this.deviceInfo
  }

  /**
   * Detect device type based on screen size and capabilities
   */
  private detectDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    const width = window.screen.width
    const height = window.screen.height
    const hasTouch = 'ontouchstart' in window
    const hasHover = window.matchMedia('(hover: hover)').matches

    // Mobile: small screen with touch, no hover
    if (width <= 768 && hasTouch && !hasHover) {
      return 'mobile'
    }

    // Tablet: medium screen with touch, may have hover
    if (width <= 1024 && hasTouch) {
      return 'tablet'
    }

    // Desktop: large screen, typically no touch, has hover
    return 'desktop'
  }

  /**
   * Detect operating system
   */
  private detectOS(): 'ios' | 'android' | 'windows' | 'macos' | 'linux' | 'unknown' {
    const userAgent = navigator.userAgent.toLowerCase()

    if (/iphone|ipad|ipod/.test(userAgent)) return 'ios'
    if (/android/.test(userAgent)) return 'android'
    if (/windows/.test(userAgent)) return 'windows'
    if (/mac/.test(userAgent)) return 'macos'
    if (/linux/.test(userAgent)) return 'linux'

    return 'unknown'
  }

  /**
   * Detect browser
   */
  private detectBrowser(): 'chrome' | 'firefox' | 'safari' | 'edge' | 'unknown' {
    const userAgent = navigator.userAgent.toLowerCase()

    if (/edg/.test(userAgent)) return 'edge'
    if (/chrome/.test(userAgent)) return 'chrome'
    if (/firefox/.test(userAgent)) return 'firefox'
    if (/safari/.test(userAgent)) return 'safari'

    return 'unknown'
  }

  /**
   * Detect device capabilities
   */
  private async detectCapabilities(): Promise<DeviceCapabilities> {
    const screen = window.screen
    const performance = window.performance
    
    return {
      screenWidth: screen.width,
      screenHeight: screen.height,
      pixelRatio: window.devicePixelRatio || 1,
      colorDepth: screen.colorDepth || 24,
      refreshRate: await this.detectRefreshRate(),
      touchSupport: 'ontouchstart' in window,
      hoverSupport: window.matchMedia('(hover: hover)').matches,
      keyboardSupport: !('ontouchstart' in window),
      gamepadSupport: 'getGamepads' in navigator,
      performanceLevel: this.detectPerformanceLevel(),
      memoryLevel: this.detectMemoryLevel(),
      storageQuota: await this.detectStorageQuota()
    }
  }

  /**
   * Detect device features
   */
  private async detectFeatures(): Promise<DeviceFeatures> {
    return {
      vibration: 'vibrate' in navigator,
      fullscreen: 'requestFullscreen' in document.documentElement,
      orientation: 'orientation' in screen,
      deviceMotion: 'DeviceMotionEvent' in window,
      geolocation: 'geolocation' in navigator,
      camera: await this.hasMediaDevice('videoinput'),
      microphone: await this.hasMediaDevice('audioinput'),
      notifications: 'Notification' in window,
      serviceWorker: 'serviceWorker' in navigator,
      webGL: this.hasWebGL(),
      webGL2: this.hasWebGL2()
    }
  }

  /**
   * Detect refresh rate
   */
  private async detectRefreshRate(): Promise<number> {
    return new Promise((resolve) => {
      let start = performance.now()
      let frames = 0

      const measureFrame = () => {
        frames++
        const now = performance.now()
        
        if (now - start >= 1000) {
          resolve(Math.round(frames))
        } else {
          requestAnimationFrame(measureFrame)
        }
      }

      requestAnimationFrame(measureFrame)
    })
  }

  /**
   * Detect performance level
   */
  private detectPerformanceLevel(): 'low' | 'medium' | 'high' {
    const cores = navigator.hardwareConcurrency || 2
    const memory = (performance as any).memory

    // Check memory if available
    if (memory) {
      const memoryGB = memory.jsHeapSizeLimit / (1024 * 1024 * 1024)
      if (memoryGB < 1) return 'low'
      if (memoryGB < 4) return 'medium'
    }

    // Check CPU cores
    if (cores < 4) return 'low'
    if (cores < 8) return 'medium'
    
    return 'high'
  }

  /**
   * Detect memory level
   */
  private detectMemoryLevel(): 'low' | 'medium' | 'high' {
    const memory = (performance as any).memory
    
    if (!memory) return 'medium' // Default assumption

    const memoryGB = memory.jsHeapSizeLimit / (1024 * 1024 * 1024)
    
    if (memoryGB < 1) return 'low'
    if (memoryGB < 4) return 'medium'
    return 'high'
  }

  /**
   * Detect storage quota
   */
  private async detectStorageQuota(): Promise<number> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate()
        return estimate.quota || 0
      } catch (error) {
        return 0
      }
    }
    return 0
  }

  /**
   * Check if device has specific media device
   */
  private async hasMediaDevice(kind: 'videoinput' | 'audioinput'): Promise<boolean> {
    if (!('mediaDevices' in navigator) || !('enumerateDevices' in navigator.mediaDevices)) {
      return false
    }

    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      return devices.some(device => device.kind === kind)
    } catch (error) {
      return false
    }
  }

  /**
   * Check WebGL support
   */
  private hasWebGL(): boolean {
    try {
      const canvas = document.createElement('canvas')
      return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    } catch (error) {
      return false
    }
  }

  /**
   * Check WebGL2 support
   */
  private hasWebGL2(): boolean {
    try {
      const canvas = document.createElement('canvas')
      return !!canvas.getContext('webgl2')
    } catch (error) {
      return false
    }
  }

  /**
   * Get optimal settings for current device
   */
  getOptimalSettings(): {
    animationQuality: 'low' | 'medium' | 'high'
    particleCount: number
    shadowQuality: 'none' | 'low' | 'medium' | 'high'
    antiAliasing: boolean
    textureQuality: 'low' | 'medium' | 'high'
  } {
    if (!this.deviceInfo) {
      throw new Error('Device info not yet detected. Call getDeviceInfo() first.')
    }

    const { capabilities } = this.deviceInfo

    // Low-end device settings
    if (capabilities.performanceLevel === 'low') {
      return {
        animationQuality: 'low',
        particleCount: 10,
        shadowQuality: 'none',
        antiAliasing: false,
        textureQuality: 'low'
      }
    }

    // Medium-end device settings
    if (capabilities.performanceLevel === 'medium') {
      return {
        animationQuality: 'medium',
        particleCount: 25,
        shadowQuality: 'low',
        antiAliasing: true,
        textureQuality: 'medium'
      }
    }

    // High-end device settings
    return {
      animationQuality: 'high',
      particleCount: 50,
      shadowQuality: 'high',
      antiAliasing: true,
      textureQuality: 'high'
    }
  }
}

// Export singleton instance
export const deviceDetection = DeviceDetection.getInstance()